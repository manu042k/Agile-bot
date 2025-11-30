"""
Main orchestrator for LLM task generation
Uses Django models for persistence - no duplicate database
"""
import logging
import hashlib
from typing import List, Dict, Optional
from django.db import transaction

from .document_processor import DocumentProcessor
from .task_generator import TaskGenerator
from .dependency_detector import DependencyDetector
from .sprint_allocator import SprintAllocator, SprintAllocation
from .models import GeneratedTask, TaskDependency
from .config import DEFAULT_TEAM_DESCRIPTION

logger = logging.getLogger(__name__)


class LLMOrchestrator:
    """
    Main orchestrator for LLM-based task generation
    Coordinates document processing, task generation, and dependency detection
    """
    
    def __init__(self, project_id: int):
        """
        Initialize orchestrator
        
        Args:
            project_id: Django project ID
        """
        self.project_id = project_id
        self.doc_processor = DocumentProcessor()
        self.task_generator = TaskGenerator()
        self.dependency_detector = DependencyDetector()
        self.sprint_allocator = SprintAllocator()
        self.task_counters = {}
        self.processed_chunks = set()  # Track processed chunks in memory
    
    def generate_tasks_from_document(
        self,
        document_path: str,
        team_description: str = None
    ) -> List[Dict]:
        """
        Generate tasks from a requirements document
        
        Args:
            document_path: Path to the document file
            team_description: Description of the team (optional)
            
        Returns:
            List of task dictionaries ready for Django Task model
        """
        if not team_description:
            team_description = DEFAULT_TEAM_DESCRIPTION
        
        logger.info(f"Processing document: {document_path}")
        
        # Parse and chunk document
        chunks = self.doc_processor.parse_and_chunk(document_path)
        logger.info(f"Document split into {len(chunks)} chunks")
        
        # Generate tasks from chunks
        generated_tasks = []
        
        for chunk in chunks:
            chunk_id = chunk['id']
            req_id = chunk['metadata']['requirement_id']
            
            # Skip if already processed (in-memory check)
            if chunk_id in self.processed_chunks:
                logger.info(f"Skipping already processed chunk: {req_id}")
                continue
            
            logger.info(f"Generating tasks for {req_id}...")
            
            # Generate tasks using LLM
            llm_tasks = self.task_generator.generate_tasks(
                chunk['text'],
                req_id,
                team_description
            )
            
            # Process each generated task
            for llm_task in llm_tasks:
                # Validate citation
                if not self.task_generator.validate_citation(llm_task, req_id):
                    logger.warning(f"Hallucination detected in task: {llm_task.name}")
                    continue
                
                # Check for duplicates using hash
                task_hash = self._compute_hash(llm_task.description, req_id)
                
                # Generate task ID
                task_id = self._generate_task_id(req_id)
                
                # Convert to Django-compatible format
                django_task = self._convert_to_django_format(
                    llm_task,
                    task_id,
                    task_hash,
                    chunk_id
                )
                
                generated_tasks.append(django_task)
            
            # Mark chunk as processed
            self.processed_chunks.add(chunk_id)
        
        logger.info(f"Generated {len(generated_tasks)} tasks")
        return generated_tasks
    
    def detect_task_dependencies(self, tasks: List[Dict]) -> List[Dict]:
        """
        Detect dependencies between tasks
        
        Args:
            tasks: List of task dictionaries
            
        Returns:
            List of dependency dictionaries
        """
        logger.info("Detecting task dependencies...")
        
        # Prepare tasks for dependency detection
        detection_tasks = [
            {
                'task_id': task.get('metadata', {}).get('llm_task_id', task.get('name')),
                'description': task['description'],
                'requirement_id': task.get('metadata', {}).get('requirement_id', 'UNKNOWN')
            }
            for task in tasks
        ]
        
        # Detect dependencies
        dependencies = self.dependency_detector.detect_dependencies(detection_tasks)
        
        # Convert to dict format
        dependency_list = [
            {
                'from_task_id': dep.from_task_id,
                'to_task_id': dep.to_task_id,
                'dependency_type': dep.dependency_type,
                'strength': dep.strength,
                'confidence': dep.confidence,
                'reasoning': dep.reasoning
            }
            for dep in dependencies
        ]
        
        logger.info(f"Detected {len(dependency_list)} dependencies")
        return dependency_list
    
    def allocate_tasks_to_sprints(
        self,
        tasks: List[Dict],
        dependencies: List[Dict],
        num_sprints: int = 5,
        sprint_capacity: int = 50
    ) -> List[Dict]:
        """
        Allocate tasks to sprints
        
        Args:
            tasks: List of task dictionaries
            dependencies: List of dependency dictionaries
            num_sprints: Number of sprints to create
            sprint_capacity: Capacity per sprint in story points
            
        Returns:
            List of sprint allocation dictionaries
        """
        logger.info(f"Allocating tasks to {num_sprints} sprints...")
        
        # Allocate using sprint allocator
        allocations = self.sprint_allocator.allocate_tasks(
            tasks,
            dependencies,
            num_sprints,
            sprint_capacity
        )
        
        # Convert to dict format
        sprint_list = [
            {
                'sprint_number': alloc.sprint_number,
                'task_ids': alloc.task_ids,
                'estimated_points': alloc.estimated_points,
                'dependencies_satisfied': alloc.dependencies_satisfied
            }
            for alloc in allocations
        ]
        
        logger.info(f"Created {len(sprint_list)} sprint allocations")
        return sprint_list
    
    def _generate_task_id(self, req_id: str) -> str:
        """Generate unique task ID"""
        if req_id not in self.task_counters:
            self.task_counters[req_id] = 0
        self.task_counters[req_id] += 1
        return f"TASK-{req_id}-{self.task_counters[req_id]:03d}"
    
    def _compute_hash(self, text: str, req_id: str) -> str:
        """Compute hash for duplicate detection"""
        combined = f"{req_id.strip().upper()}:{text.strip().lower()}"
        return hashlib.sha256(combined.encode()).hexdigest()
    
    def _convert_to_django_format(
        self,
        llm_task,
        task_id: str,
        task_hash: str,
        chunk_id: str
    ) -> Dict:
        """Convert LLM task to Django Task model format"""
        
        # Priority mapping: P1 -> high, P2 -> normal, P3 -> low
        priority_map = {
            'P1': 'high',
            'P2': 'normal',
            'P3': 'low',
            'high': 'high',
            'medium': 'normal',
            'low': 'low'
        }
        
        # Size estimation based on time estimate
        size = self._estimate_size(llm_task.estimate)
        
        return {
            'name': llm_task.name,
            'description': llm_task.description,
            'details': f"{llm_task.reasoning}\n\nRequirement: {llm_task.requirement_id}",
            'priority': priority_map.get(llm_task.priority, 'normal'),
            'size': size,
            'status': 'created',
            'created_by': 'ai',
            'tags': llm_task.tags,
            'metadata': {
                'requirement_id': llm_task.requirement_id,
                'llm_task_id': task_id,
                'estimate': llm_task.estimate,
                'original_priority': llm_task.priority,
                'task_hash': task_hash,
                'chunk_id': chunk_id
            }
        }
    
    def _estimate_size(self, estimate: str) -> str:
        """Convert time estimate to size (xs, s, m, l, xl)"""
        import re
        
        estimate_lower = estimate.lower()
        match = re.search(r'(\d+)', estimate_lower)
        
        if not match:
            return 'm'  # default
        
        value = int(match.group(1))
        
        if 'd' in estimate_lower:  # days
            if value <= 1:
                return 's'
            elif value <= 3:
                return 'm'
            elif value <= 5:
                return 'l'
            else:
                return 'xl'
        elif 'h' in estimate_lower:  # hours
            if value <= 2:
                return 'xs'
            elif value <= 4:
                return 's'
            elif value <= 8:
                return 'm'
            else:
                return 'l'
        else:  # minutes or unknown
            return 'xs'
