"""
Sprint allocation engine
Allocates tasks to sprints while respecting dependencies and capacity
"""
import logging
from typing import List, Dict, Optional
from collections import defaultdict
from dataclasses import dataclass

from .models import TaskDependency
from .config import DEFAULT_SPRINT_CAPACITY

logger = logging.getLogger(__name__)


@dataclass
class SprintAllocation:
    """Sprint allocation result"""
    sprint_number: int
    task_ids: List[str]
    estimated_points: float
    dependencies_satisfied: bool


class SprintAllocator:
    """
    Allocates tasks to sprints while respecting:
    - Task dependencies (hard dependencies must be in earlier sprints)
    - Sprint capacity (story points)
    - Priority (high priority tasks first)
    """
    
    EFFORT_ESTIMATION_KEYWORDS = {
        'simple': ['add', 'update', 'modify', 'fix'],
        'medium': ['implement', 'create', 'build', 'integrate'],
        'complex': ['design', 'architect', 'refactor', 'optimize', 'setup'],
    }
    
    # Size to story points mapping
    SIZE_TO_POINTS = {
        'xs': 1,
        's': 3,
        'm': 5,
        'l': 8,
        'xl': 13
    }
    
    # Priority to score mapping
    PRIORITY_TO_SCORE = {
        'high': 10,
        'normal': 5,
        'low': 2
    }
    
    def __init__(self, default_sprint_capacity: int = None):
        """
        Initialize sprint allocator
        
        Args:
            default_sprint_capacity: Default capacity per sprint in story points
                                    (uses config value if not provided)
        """
        self.default_sprint_capacity = default_sprint_capacity or DEFAULT_SPRINT_CAPACITY
    
    def allocate_tasks(
        self,
        tasks: List[Dict],
        dependencies: List[Dict],
        num_sprints: int = 5,
        sprint_capacity: int = None
    ) -> List[SprintAllocation]:
        """
        Allocate tasks to sprints
        
        Args:
            tasks: List of task dictionaries
            dependencies: List of dependency dictionaries
            num_sprints: Number of sprints to create
            sprint_capacity: Capacity per sprint (story points)
            
        Returns:
            List of SprintAllocation objects
        """
        if sprint_capacity is None:
            sprint_capacity = self.default_sprint_capacity
        
        logger.info(f"Allocating {len(tasks)} tasks to {num_sprints} sprints")
        logger.info(f"Sprint capacity: {sprint_capacity} points")
        
        # Build task map
        task_map = {self._get_task_id(task): task for task in tasks}
        
        # Build dependency graph
        dep_graph = self._build_dependency_graph(dependencies)
        
        # Topological sort to respect dependencies
        sorted_task_ids = self._topological_sort(dep_graph, list(task_map.keys()))
        
        # Calculate priority scores
        priority_scores = self._calculate_priority_scores(
            task_map,
            dep_graph,
            dependencies
        )
        
        # Sort by priority within topological order
        sorted_task_ids = self._sort_by_priority(
            sorted_task_ids,
            priority_scores,
            dep_graph
        )
        
        # Allocate to sprints
        sprints = self._allocate_to_sprints(
            sorted_task_ids,
            task_map,
            dep_graph,
            dependencies,
            num_sprints,
            sprint_capacity
        )
        
        logger.info(f"Created {len(sprints)} sprint allocations")
        for sprint in sprints:
            logger.info(
                f"Sprint {sprint.sprint_number}: "
                f"{len(sprint.task_ids)} tasks, "
                f"{sprint.estimated_points:.1f} points"
            )
        
        return sprints
    
    def _get_task_id(self, task: Dict) -> str:
        """Get task ID from task dict"""
        if 'metadata' in task and 'llm_task_id' in task['metadata']:
            return task['metadata']['llm_task_id']
        return task.get('task_id', task.get('name', 'unknown'))
    
    def _build_dependency_graph(self, dependencies: List[Dict]) -> Dict[str, List[str]]:
        """Build dependency graph from dependencies list"""
        graph = defaultdict(list)
        
        for dep in dependencies:
            # Only consider hard dependencies for sprint allocation
            if dep.get('strength') == 'hard':
                from_id = dep['from_task_id']
                to_id = dep['to_task_id']
                graph[from_id].append(to_id)
        
        return dict(graph)
    
    def _topological_sort(
        self,
        graph: Dict[str, List[str]],
        all_tasks: List[str]
    ) -> List[str]:
        """
        Topological sort to respect dependencies
        Tasks with no dependencies come first
        """
        # Calculate in-degree for each task
        in_degree = {task: 0 for task in all_tasks}
        
        for task in graph:
            for dependent in graph[task]:
                if dependent in in_degree:
                    in_degree[dependent] += 1
        
        # Start with tasks that have no dependencies
        queue = [task for task in all_tasks if in_degree[task] == 0]
        result = []
        
        while queue:
            # Sort queue to maintain consistent ordering
            queue.sort()
            current = queue.pop(0)
            result.append(current)
            
            # Reduce in-degree for dependent tasks
            for dependent in graph.get(current, []):
                if dependent in in_degree:
                    in_degree[dependent] -= 1
                    if in_degree[dependent] == 0:
                        queue.append(dependent)
        
        # Handle cycles (shouldn't happen with proper dependency detection)
        if len(result) != len(all_tasks):
            logger.warning("Cycle detected in task dependencies!")
            # Add remaining tasks
            result.extend([t for t in all_tasks if t not in result])
        
        return result
    
    def _calculate_priority_scores(
        self,
        task_map: Dict[str, Dict],
        dep_graph: Dict[str, List[str]],
        dependencies: List[Dict]
    ) -> Dict[str, float]:
        """
        Calculate priority score for each task
        Higher score = higher priority
        """
        scores = {}
        
        for task_id, task in task_map.items():
            score = 0.0
            
            # Base priority from task
            priority = task.get('priority', 'normal')
            score += self.PRIORITY_TO_SCORE.get(priority, 5)
            
            # Bonus for tasks that block others (hard dependencies)
            dependent_count = len(dep_graph.get(task_id, []))
            score += dependent_count * 3.0
            
            # Penalty for tasks that are blocked by others
            blocking_count = sum(
                1 for dep in dependencies
                if dep['to_task_id'] == task_id and dep.get('strength') == 'hard'
            )
            score -= blocking_count * 2.0
            
            scores[task_id] = max(0.0, score)
        
        return scores
    
    def _sort_by_priority(
        self,
        sorted_task_ids: List[str],
        priority_scores: Dict[str, float],
        dep_graph: Dict[str, List[str]]
    ) -> List[str]:
        """
        Sort tasks by priority while maintaining topological order
        """
        # Group tasks by dependency level
        levels = self._calculate_dependency_levels(sorted_task_ids, dep_graph)
        
        # Sort within each level by priority
        result = []
        max_level = max(levels.values()) if levels else 0
        
        for level in range(max_level + 1):
            level_tasks = [
                task_id for task_id in sorted_task_ids
                if levels.get(task_id, 0) == level
            ]
            # Sort by priority score (descending)
            level_tasks.sort(
                key=lambda t: priority_scores.get(t, 0),
                reverse=True
            )
            result.extend(level_tasks)
        
        return result
    
    def _calculate_dependency_levels(
        self,
        task_ids: List[str],
        dep_graph: Dict[str, List[str]]
    ) -> Dict[str, int]:
        """Calculate dependency level for each task (0 = no dependencies)"""
        levels = {}
        
        def get_level(task_id: str) -> int:
            if task_id in levels:
                return levels[task_id]
            
            # Get dependencies
            dependencies = dep_graph.get(task_id, [])
            if not dependencies:
                levels[task_id] = 0
                return 0
            
            # Level is max(dependency levels) + 1
            max_dep_level = max(
                (get_level(dep) for dep in dependencies if dep in task_ids),
                default=-1
            )
            levels[task_id] = max_dep_level + 1
            return levels[task_id]
        
        for task_id in task_ids:
            get_level(task_id)
        
        return levels
    
    def _allocate_to_sprints(
        self,
        sorted_task_ids: List[str],
        task_map: Dict[str, Dict],
        dep_graph: Dict[str, List[str]],
        dependencies: List[Dict],
        num_sprints: int,
        sprint_capacity: int
    ) -> List[SprintAllocation]:
        """Allocate sorted tasks to sprints"""
        sprints = [
            SprintAllocation(
                sprint_number=i,
                task_ids=[],
                estimated_points=0.0,
                dependencies_satisfied=True
            )
            for i in range(1, num_sprints + 1)
        ]
        
        sprint_loads = [0.0] * num_sprints
        task_to_sprint = {}
        
        for task_id in sorted_task_ids:
            task = task_map[task_id]
            effort = self._estimate_effort(task)
            
            # Find earliest sprint where dependencies are satisfied
            earliest_sprint = 0
            for dep in dependencies:
                if (dep['to_task_id'] == task_id and 
                    dep.get('strength') == 'hard'):
                    pred_id = dep['from_task_id']
                    if pred_id in task_to_sprint:
                        pred_sprint = task_to_sprint[pred_id]
                        # Must be in a later sprint
                        earliest_sprint = max(earliest_sprint, pred_sprint + 1)
            
            # Find first sprint with capacity
            allocated = False
            for sprint_idx in range(earliest_sprint, len(sprints)):
                if sprint_loads[sprint_idx] + effort <= sprint_capacity:
                    sprints[sprint_idx].task_ids.append(task_id)
                    sprints[sprint_idx].estimated_points += effort
                    sprint_loads[sprint_idx] += effort
                    task_to_sprint[task_id] = sprint_idx
                    allocated = True
                    break
            
            # If no sprint has capacity, add to last sprint
            if not allocated:
                logger.warning(
                    f"Task {task_id} exceeds sprint capacity; "
                    f"adding to last sprint"
                )
                sprints[-1].task_ids.append(task_id)
                sprints[-1].estimated_points += effort
                task_to_sprint[task_id] = len(sprints) - 1
        
        return sprints
    
    def _estimate_effort(self, task: Dict) -> float:
        """
        Estimate effort in story points
        Uses task size if available, otherwise analyzes description
        """
        # Use size if available
        size = task.get('size', 'm')
        if size in self.SIZE_TO_POINTS:
            return float(self.SIZE_TO_POINTS[size])
        
        # Fallback: analyze description
        desc_lower = task.get('description', '').lower()
        complexity_score = 0
        
        for keyword in self.EFFORT_ESTIMATION_KEYWORDS['complex']:
            if keyword in desc_lower:
                complexity_score += 3
        
        for keyword in self.EFFORT_ESTIMATION_KEYWORDS['medium']:
            if keyword in desc_lower:
                complexity_score += 2
        
        for keyword in self.EFFORT_ESTIMATION_KEYWORDS['simple']:
            if keyword in desc_lower:
                complexity_score += 1
        
        # Map complexity to story points
        if complexity_score >= 6:
            return 13.0  # xl
        elif complexity_score >= 4:
            return 8.0   # l
        elif complexity_score >= 2:
            return 5.0   # m
        else:
            return 3.0   # s
