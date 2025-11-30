"""
Optimized dependency detection engine
Uses only Tier 1 & 2 (no vector embeddings/Qdrant)
"""
import re
import time
import logging
from typing import List, Dict, Optional
import concurrent.futures

from .models import TaskDependency
from .config import (
    ENTITY_EXTRACTION_THRESHOLD,
    NUM_WORKERS
)

logger = logging.getLogger(__name__)


class DependencyDetector:
    """
    Optimized dependency detection using 2-tier approach:
    - Tier 1: Fast checks (hierarchy, layers)
    - Tier 2: Entity-based checks
    No vector embeddings or external databases needed
    """
    
    LAYER_HIERARCHY = {
        'database': 1, 'schema': 1, 'model': 2,
        'service': 3, 'api': 4, 'controller': 4, 'handler': 4,
        'ui': 5, 'frontend': 5, 'interface': 5,
        'test': 6, 'validation': 6,
    }
    
    ENTITY_PATTERNS = {
        'database': r'\b(database|table|schema|record|entity)\b',
        'api': r'\b(api|endpoint|rest|http|route)\b',
        'service': r'\b(service|module|component|manager|factory)\b',
        'authentication': r'\b(auth|login|password|token|permission)\b',
        'validation': r'\b(validate|verify|check|constraint)\b',
        'data': r'\b(data|field|column|value|entry)\b',
        'ui': r'\b(ui|display|render|form|button|screen)\b',
        'file': r'\b(file|export|import|csv|json)\b',
    }
    
    def __init__(self, num_workers: int = NUM_WORKERS):
        self.num_workers = num_workers
        
        # Caches
        self.entity_cache = {}
        self.layer_cache = {}
        self.req_hierarchy_cache = {}
        
        logger.info(f"DependencyDetector initialized (Tier 1 & 2 only, no embeddings)")
    
    def detect_dependencies(self, tasks: List[Dict]) -> List[TaskDependency]:
        """
        Detect dependencies between tasks
        
        Args:
            tasks: List of task dictionaries with keys: task_id, description, requirement_id
            
        Returns:
            List of TaskDependency objects
        """
        logger.info(f"Starting dependency detection for {len(tasks)} tasks")
        start_time = time.time()
        
        # Precompute properties
        self._batch_precompute(tasks)
        
        # Detect dependencies with intelligent filtering
        dependencies = self._detect_with_filtering(tasks)
        
        elapsed = time.time() - start_time
        logger.info(f"Detected {len(dependencies)} dependencies in {elapsed:.2f}s")
        
        return dependencies
    
    def _batch_precompute(self, tasks: List[Dict]):
        """Precompute task properties for faster detection"""
        logger.info(f"Precomputing properties for {len(tasks)} tasks...")
        start = time.time()
        
        with concurrent.futures.ThreadPoolExecutor(max_workers=self.num_workers) as executor:
            # Entity extraction (parallelizable)
            entity_futures = {
                task['task_id']: executor.submit(self._extract_entities, task['description'])
                for task in tasks
            }
            
            # Layer identification (fast, local)
            for task in tasks:
                self.layer_cache[task['task_id']] = self._identify_layer(task['description'])
            
            # Requirement hierarchy (fast, cached)
            unique_reqs = set(t['requirement_id'] for t in tasks)
            for req_id in unique_reqs:
                self.req_hierarchy_cache[req_id] = self._parse_requirement_hierarchy(req_id)
        
        # Collect entity futures
        for task_id, future in entity_futures.items():
            self.entity_cache[task_id] = future.result()
        
        elapsed = time.time() - start
        logger.info(f"Precomputation completed in {elapsed:.2f}s")
    
    def _detect_with_filtering(self, tasks: List[Dict]) -> List[TaskDependency]:
        """Detect dependencies using Tier 1 & 2 only"""
        dependencies = []
        detected_pairs = set()
        
        for i, task1 in enumerate(tasks):
            for task2 in tasks[i+1:]:
                pair_key = (task1['task_id'], task2['task_id'])
                if pair_key in detected_pairs:
                    continue
                
                # Tier 1: Fast checks
                dep = self._check_requirement_hierarchy(task1, task2)
                if dep and dep.confidence > 0.90:
                    dependencies.append(dep)
                    detected_pairs.add(pair_key)
                    continue
                
                dep = self._check_layer_dependency(task1, task2)
                if dep and dep.confidence > 0.85:
                    dependencies.append(dep)
                    detected_pairs.add(pair_key)
                    continue
                
                # Tier 2: Entity-based
                dep = self._check_entity_dependency(task1, task2)
                if dep and dep.confidence > 0.75:
                    dependencies.append(dep)
                    detected_pairs.add(pair_key)
                    continue
        
        return dependencies
    
    def _identify_layer(self, description: str) -> int:
        """Identify architectural layer of a task"""
        desc_lower = description.lower()
        max_layer = 0
        
        for layer_name, layer_level in self.LAYER_HIERARCHY.items():
            if layer_name in desc_lower:
                max_layer = max(max_layer, layer_level)
        
        return max_layer
    
    def _extract_entities(self, description: str) -> frozenset:
        """Extract entities from task description"""
        entities = set()
        desc_lower = description.lower()
        
        for entity_type, pattern in self.ENTITY_PATTERNS.items():
            matches = re.finditer(pattern, desc_lower)
            for match in matches:
                entity = match.group(0).strip()
                if len(entity) > 2:
                    entities.add(f"{entity_type}:{entity}")
        
        return frozenset(entities)
    
    def _parse_requirement_hierarchy(self, req_id: str) -> Dict:
        """Parse requirement hierarchy from ID"""
        parts = req_id.split('-')
        if len(parts) < 2:
            return {'parent': None, 'level': 0, 'root': 'UNKNOWN'}
        
        num_parts = parts[1].split('.')
        parent = f"{parts[0]}-{num_parts[0]}" if len(num_parts) > 1 else None
        
        return {
            'parent': parent,
            'level': len(num_parts),
            'root': parts[0]
        }
    
    def _check_requirement_hierarchy(self, task1: Dict, task2: Dict) -> Optional[TaskDependency]:
        """Check if tasks have hierarchical relationship"""
        req_id1 = task1['requirement_id']
        req_id2 = task2['requirement_id']
        
        hier1 = self.req_hierarchy_cache.get(req_id1)
        hier2 = self.req_hierarchy_cache.get(req_id2)
        
        if hier1 and hier2 and hier2.get('parent') == req_id1:
            return TaskDependency(
                from_task_id=task1['task_id'],
                to_task_id=task2['task_id'],
                dependency_type='sequential',
                strength='hard',
                confidence=0.95,
                reasoning=f"Hierarchy: {req_id1} (parent) -> {req_id2} (child)"
            )
        
        return None
    
    def _check_layer_dependency(self, task1: Dict, task2: Dict) -> Optional[TaskDependency]:
        """Check if tasks have layer dependency"""
        layer1 = self.layer_cache.get(task1['task_id'], 0)
        layer2 = self.layer_cache.get(task2['task_id'], 0)
        
        if layer1 > 0 and layer2 > layer1:
            return TaskDependency(
                from_task_id=task1['task_id'],
                to_task_id=task2['task_id'],
                dependency_type='infrastructure',
                strength='hard',
                confidence=0.85,
                reasoning=f"Layer: {layer1} (foundation) -> {layer2} (dependent)"
            )
        
        return None
    
    def _check_entity_dependency(self, task1: Dict, task2: Dict) -> Optional[TaskDependency]:
        """Check if tasks share entities"""
        entities1 = self.entity_cache.get(task1['task_id'])
        entities2 = self.entity_cache.get(task2['task_id'])
        
        if not entities1 or not entities2:
            return None
        
        intersection = len(entities1 & entities2)
        union = len(entities1 | entities2)
        overlap = intersection / union if union > 0 else 0
        
        if overlap > ENTITY_EXTRACTION_THRESHOLD:
            return TaskDependency(
                from_task_id=task1['task_id'],
                to_task_id=task2['task_id'],
                dependency_type='data',
                strength='soft',
                confidence=min(0.90, overlap * 1.2),
                reasoning=f"Entity overlap: {overlap:.2%} ({intersection} shared)"
            )
        
        return None
    

