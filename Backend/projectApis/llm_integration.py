"""
LLM Integration Module for Task Generation
Integrates the modular LLM system with Django backend
Uses Django models - no duplicate database
"""
import logging
from typing import List, Dict, Optional

from .llm.orchestrator import LLMOrchestrator
from .llm.config import DEFAULT_TEAM_DESCRIPTION

logger = logging.getLogger(__name__)


class LLMTaskGenerator:
    """
    Simplified wrapper using modular LLM system
    No duplicate database - uses Django models
    """
    
    def __init__(self, project_id: int, document_path: str, team_description: str = None, project_context: str = None):
        """
        Initialize the LLM task generator
        
        Args:
            project_id: Django project ID
            document_path: Path to the requirements document
            team_description: Description of the team (optional)
            project_context: Project context information (optional)
        """
        self.project_id = project_id
        self.document_path = document_path
        self.team_description = team_description or DEFAULT_TEAM_DESCRIPTION
        self.project_context = project_context or ""
        self.orchestrator = LLMOrchestrator(project_id)
        self.generated_tasks = []
    
    def generate_tasks(self) -> List[Dict]:
        """
        Generate tasks from requirements document
        
        Returns:
            List of task dictionaries compatible with Django Task model
        """
        try:
            logger.info(f"Generating tasks for project {self.project_id}")
            
            # Generate tasks using orchestrator
            self.generated_tasks = self.orchestrator.generate_tasks_from_document(
                self.document_path,
                self.team_description,
                self.project_context
            )
            
            logger.info(f"Generated {len(self.generated_tasks)} tasks")
            return self.generated_tasks
            
        except Exception as e:
            logger.error(f"Task generation failed: {str(e)}")
            raise
    
    def detect_dependencies(self) -> List[Dict]:
        """
        Detect dependencies between generated tasks
        
        Returns:
            List of dependency dictionaries
        """
        if not self.generated_tasks:
            raise ValueError("No tasks generated. Call generate_tasks() first.")
        
        try:
            logger.info("Detecting task dependencies...")
            dependencies = self.orchestrator.detect_task_dependencies(self.generated_tasks)
            logger.info(f"Detected {len(dependencies)} dependencies")
            return dependencies
            
        except Exception as e:
            logger.error(f"Dependency detection failed: {str(e)}")
            raise
    
    def allocate_to_sprints(
        self,
        dependencies: List[Dict],
        num_sprints: int = 5,
        sprint_capacity: int = 50
    ) -> List[Dict]:
        """
        Allocate tasks to sprints
        
        Args:
            dependencies: List of dependency dictionaries
            num_sprints: Number of sprints to create
            sprint_capacity: Capacity per sprint in story points
            
        Returns:
            List of sprint allocation dictionaries
        """
        if not self.generated_tasks:
            raise ValueError("No tasks generated. Call generate_tasks() first.")
        
        try:
            logger.info(f"Allocating tasks to {num_sprints} sprints...")
            sprints = self.orchestrator.allocate_tasks_to_sprints(
                self.generated_tasks,
                dependencies,
                num_sprints,
                sprint_capacity
            )
            logger.info(f"Created {len(sprints)} sprint allocations")
            return sprints
            
        except Exception as e:
            logger.error(f"Sprint allocation failed: {str(e)}")
            raise
    
    def close(self):
        """Clean up resources"""
        logger.info("LLM task generator closed")


def generate_tasks_with_llm(
    project_id: int,
    document_path: str,
    team_description: str = None,
    project_context: str = None,
    detect_dependencies: bool = True,
    allocate_sprints: bool = False,
    num_sprints: int = 5
) -> Dict:
    """
    Main function to generate tasks using LLM
    
    Args:
        project_id: Django project ID
        document_path: Path to requirements document
        team_description: Team description (optional)
        project_context: Project context information (optional)
        detect_dependencies: Whether to detect dependencies
        allocate_sprints: Whether to allocate to sprints
        num_sprints: Number of sprints (if allocating)
        
    Returns:
        Dictionary with tasks and dependencies
    """
    generator = LLMTaskGenerator(project_id, document_path, team_description, project_context)
    
    try:
        # Generate tasks
        tasks = generator.generate_tasks()
        
        result = {
            'success': True,
            'tasks': tasks,
            'dependencies': [],
            'sprints': []
        }
        
        # Detect dependencies if requested
        if detect_dependencies:
            try:
                result['dependencies'] = generator.detect_dependencies()
            except Exception as e:
                logger.warning(f"Dependency detection failed: {str(e)}")
                result['dependencies'] = []
        
        # Allocate to sprints if requested
        if allocate_sprints:
            try:
                result['sprints'] = generator.allocate_to_sprints(
                    result['dependencies'],
                    num_sprints=num_sprints
                )
            except Exception as e:
                logger.warning(f"Sprint allocation failed: {str(e)}")
                result['sprints'] = []
        
        return result
        
    except Exception as e:
        logger.error(f"LLM task generation failed: {str(e)}")
        import traceback
        traceback.print_exc()
        return {
            'success': False,
            'error': str(e),
            'tasks': [],
            'dependencies': [],
            'sprints': []
        }
    finally:
        generator.close()
