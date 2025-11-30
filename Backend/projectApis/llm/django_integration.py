"""
Django model integration helpers
Creates actual Django Sprint and Task objects from LLM allocations
"""
import logging
from typing import List, Dict, Optional
from datetime import datetime, timedelta
from django.db import transaction
from django.utils import timezone

logger = logging.getLogger(__name__)


class DjangoSprintCreator:
    """
    Creates Django Sprint objects from LLM sprint allocations
    """
    
    def __init__(self, project):
        """
        Initialize sprint creator
        
        Args:
            project: Django Project instance
        """
        self.project = project
    
    def create_sprints_from_allocations(
        self,
        sprint_allocations: List[Dict],
        task_id_mapping: Dict[str, str],
        sprint_duration_days: int = 14,
        start_date: datetime = None,
        created_by = None
    ) -> List:
        """
        Create Django Sprint objects from allocations
        
        Args:
            sprint_allocations: List of sprint allocation dicts
            task_id_mapping: Mapping from LLM task IDs to Django task UUIDs
            sprint_duration_days: Duration of each sprint in days
            start_date: Start date for first sprint (default: today)
            created_by: User who created the sprints
            
        Returns:
            List of created Sprint objects
        """
        from projectApis.models import Sprint, Task
        
        if not start_date:
            start_date = timezone.now()
        
        created_sprints = []
        
        with transaction.atomic():
            for allocation in sprint_allocations:
                sprint_number = allocation['sprint_number']
                task_ids = allocation['task_ids']
                estimated_points = allocation['estimated_points']
                
                # Calculate sprint dates
                sprint_start = start_date + timedelta(
                    days=(sprint_number - 1) * sprint_duration_days
                )
                sprint_end = sprint_start + timedelta(days=sprint_duration_days - 1)
                
                # Create sprint
                sprint = Sprint.objects.create(
                    project=self.project,
                    name=f"Sprint {sprint_number}",
                    description=f"Auto-generated sprint with {len(task_ids)} tasks ({estimated_points:.1f} points)",
                    start_date=sprint_start,
                    end_date=sprint_end,
                    status='planned',
                    created_by=created_by
                )
                
                # Assign tasks to sprint
                assigned_count = 0
                for llm_task_id in task_ids:
                    django_task_id = task_id_mapping.get(llm_task_id)
                    if django_task_id:
                        try:
                            task = Task.objects.get(taskid=django_task_id)
                            task.sprint = sprint
                            task.status = 'backlog'  # Set to backlog initially
                            task.save()
                            assigned_count += 1
                        except Task.DoesNotExist:
                            logger.warning(f"Task {django_task_id} not found")
                
                logger.info(
                    f"Created {sprint.name}: "
                    f"{assigned_count}/{len(task_ids)} tasks assigned, "
                    f"{sprint_start.date()} to {sprint_end.date()}"
                )
                
                created_sprints.append(sprint)
        
        return created_sprints
    
    def create_sprints_with_auto_dates(
        self,
        sprint_allocations: List[Dict],
        task_id_mapping: Dict[str, str],
        created_by = None
    ) -> List:
        """
        Create sprints with automatically calculated dates
        Uses project start date or current date
        
        Args:
            sprint_allocations: List of sprint allocation dicts
            task_id_mapping: Mapping from LLM task IDs to Django task UUIDs
            created_by: User who created the sprints
            
        Returns:
            List of created Sprint objects
        """
        # Use project created date or current date
        start_date = self.project.created_at or timezone.now()
        
        return self.create_sprints_from_allocations(
            sprint_allocations,
            task_id_mapping,
            sprint_duration_days=14,
            start_date=start_date,
            created_by=created_by
        )


def create_tasks_and_sprints(
    project,
    tasks: List[Dict],
    sprint_allocations: List[Dict],
    dependencies: List[Dict],
    created_by = None
) -> Dict:
    """
    Complete integration: Create tasks, dependencies, and sprints
    
    Args:
        project: Django Project instance
        tasks: List of task dictionaries from LLM
        sprint_allocations: List of sprint allocation dictionaries
        dependencies: List of dependency dictionaries
        created_by: User who created the tasks
        
    Returns:
        Dictionary with created objects and mappings
    """
    from projectApis.models import Task
    
    logger.info(f"Creating {len(tasks)} tasks for project {project.name}")
    
    created_tasks = []
    task_id_mapping = {}  # LLM task ID -> Django task UUID
    
    with transaction.atomic():
        # Create tasks
        for task_data in tasks:
            task = Task.objects.create(
                Project=project,
                name=task_data['name'],
                description=task_data['description'],
                details=task_data.get('details', task_data['description']),
                priority=task_data.get('priority', 'normal'),
                size=task_data.get('size', 'm'),
                status='created',
                created_by='ai',
                tags=task_data.get('tags', [])
            )
            
            # Store mapping
            if 'metadata' in task_data and 'llm_task_id' in task_data['metadata']:
                task_id_mapping[task_data['metadata']['llm_task_id']] = str(task.taskid)
            
            created_tasks.append(task)
        
        logger.info(f"Created {len(created_tasks)} tasks")
        
        # Create dependencies
        dependency_count = 0
        for dep in dependencies:
            from_llm_id = dep['from_task_id']
            to_llm_id = dep['to_task_id']
            
            from_django_id = task_id_mapping.get(from_llm_id)
            to_django_id = task_id_mapping.get(to_llm_id)
            
            if from_django_id and to_django_id:
                try:
                    from_task = Task.objects.get(taskid=from_django_id)
                    to_task = Task.objects.get(taskid=to_django_id)
                    from_task.related_work.add(to_task)
                    dependency_count += 1
                except Task.DoesNotExist:
                    logger.warning(f"Could not create dependency: task not found")
        
        logger.info(f"Created {dependency_count} task dependencies")
        
        # Create sprints if allocations provided
        created_sprints = []
        if sprint_allocations:
            sprint_creator = DjangoSprintCreator(project)
            created_sprints = sprint_creator.create_sprints_with_auto_dates(
                sprint_allocations,
                task_id_mapping,
                created_by
            )
            logger.info(f"Created {len(created_sprints)} sprints")
    
    return {
        'tasks': created_tasks,
        'task_id_mapping': task_id_mapping,
        'sprints': created_sprints,
        'dependency_count': dependency_count
    }
