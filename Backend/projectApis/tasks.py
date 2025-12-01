from celery import shared_task
from .models import Task, Sprint, Project, Document, Activity
from users.models import User
from django.utils import timezone
import logging
import time
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

logger = logging.getLogger(__name__)


def _build_team_description(project):
    """Build team description from project team members with roles"""
    if not project.team:
        return """
        - 2 Senior Backend Engineers (Python, SQL, System Design)
        - 1 Senior Frontend Engineer (React, TypeScript, CSS)
        - 1 DevOps Engineer (Docker, Kubernetes, CI/CD)
        - 1 QA Engineer (Automation, Testing)
        """
    
    team_members = project.team.members.all()
    if not team_members:
        return "- Development team with full-stack capabilities"
    
    # Build description from team members with roles
    description = f"Team: {project.team.name}\n"
    for member in team_members:
        role = member.role if member.role else "Developer"
        name = member.get_full_name()
        description += f"- {name} ({role})\n"
    
    return description


def _build_project_context(project):
    """Build project context for LLM"""
    context = f"Project: {project.name}\n"
    
    if project.description:
        context += f"Description: {project.description}\n"
    
    if project.domain:
        context += f"Domain: {project.domain}\n"
    
    if project.tech_stack and len(project.tech_stack) > 0:
        tech_list = ', '.join(project.tech_stack)
        context += f"Technology Stack: {tech_list}\n"
    
    if project.deadline:
        from datetime import date
        days_remaining = (project.deadline - date.today()).days
        context += f"Deadline: {project.deadline} ({days_remaining} days remaining)\n"
    
    return context


def send_progress_update(project_uuid, message, progress, status="processing", data=None):
    """Send progress update via WebSocket"""
    channel_layer = get_channel_layer()
    group_name = f"task_generation_{project_uuid}"
    
    payload = {
        "type": "task_generation_progress",
        "message": message,
        "progress": progress,
        "status": status,
        "data": data or {}
    }
    
    try:
        async_to_sync(channel_layer.group_send)(group_name, payload)
        logger.info(f"Sent progress update to {group_name}: {message} ({progress}%)")
    except Exception as e:
        logger.error(f"Failed to send progress update: {str(e)}")


def create_and_broadcast_activity(activity_type, user, project, description, target_name, task=None, metadata=None):
    """Create activity record and broadcast via WebSocket"""
    try:
        # Create activity
        activity = Activity.objects.create(
            activity_type=activity_type,
            user=user,
            project=project,
            task=task,
            description=description,
            target_name=target_name,
            metadata=metadata
        )
        
        # Broadcast to WebSocket
        from .serializers import ActivitySerializer
        channel_layer = get_channel_layer()
        serializer = ActivitySerializer(activity)
        activity_data = serializer.data
        
        # Broadcast to general activity channel
        async_to_sync(channel_layer.group_send)(
            "activities",
            {
                "type": "activity_message",
                "activity": activity_data,
            }
        )
        
        # Broadcast to project-specific channel
        if project:
            async_to_sync(channel_layer.group_send)(
                f"project_{project.id}",
                {
                    "type": "activity_message",
                    "activity": activity_data,
                }
            )
        
        logger.info(f"Activity created and broadcasted: {activity_type} by {user}")
        return activity
        
    except Exception as e:
        logger.error(f"Failed to create/broadcast activity: {str(e)}")
        return None


@shared_task(bind=True)
def generate_tasks_async(self, project_id, document_id, user_id):
    """
    Async task generation with progress updates via WebSocket.
    Uses enhanced LLM system for intelligent task generation.
    """
    try:
        # Get project, document, and user
        project = Project.objects.get(id=project_id)
        document = Document.objects.get(id=document_id)
        user = User.objects.get(id=user_id)
        
        # Use project UUID for WebSocket group name
        project_uuid = str(project.uuid)
        
        logger.info(f"Starting LLM task generation for project {project.name}")
        
        # Create activity for task generation start
        create_and_broadcast_activity(
            activity_type='task_created',
            user=user,
            project=project,
            description=f"started AI task generation for {project.name}",
            target_name=f"AI Task Generation",
            metadata={"document_id": document_id, "status": "started"}
        )
        
        # Send initial progress
        send_progress_update(project_uuid, "Starting task generation...", 0, "processing")
        time.sleep(0.5)
        
        # Step 1: Check if AI tasks already exist
        send_progress_update(project_uuid, "Checking existing tasks...", 5, "processing")
        
        existing_ai_tasks = Task.objects.filter(
            Project=project,
            created_by='ai'
        ).exists()
        
        if existing_ai_tasks:
            error_msg = "AI tasks already generated for this project. Delete existing AI tasks to regenerate."
            logger.warning(error_msg)
            send_progress_update(project_uuid, error_msg, 0, "error")
            return {
                "success": False,
                "error": error_msg,
                "tasks_created": 0
            }
        
        # Step 2: Initialize LLM system
        send_progress_update(project_uuid, "Initializing AI system...", 10, "processing")
        
        try:
            from .llm_integration import generate_tasks_with_llm
            
            # Get document file path
            document_path = document.file.path
            
            # Build team description and project context
            team_description = _build_team_description(project)
            project_context = _build_project_context(project)
            
            # Step 3: Analyzing document
            send_progress_update(project_uuid, "Analyzing requirements document with AI...", 20, "processing")
            
            # Step 4: Generate tasks using LLM
            send_progress_update(project_uuid, "Extracting tasks from requirements...", 40, "processing")
            
            # Call LLM system with sprint allocation
            result = generate_tasks_with_llm(
                project_id=project.id,
                document_path=document_path,
                team_description=team_description,
                project_context=project_context,
                detect_dependencies=True,
                allocate_sprints=True,  # Enable sprint allocation
                num_sprints=5
            )
            
            if not result['success']:
                raise Exception(result.get('error', 'LLM generation failed'))
            
            llm_tasks = result['tasks']
            dependencies = result.get('dependencies', [])
            sprint_allocations = result.get('sprints', [])
            
            send_progress_update(
                project_uuid, 
                f"Generated {len(llm_tasks)} tasks with AI and {len(sprint_allocations)} sprints", 
                60, 
                "processing"
            )
            
        except ImportError as e:
            logger.warning(f"LLM system not available: {str(e)}. Falling back to dummy tasks.")
            send_progress_update(project_uuid, "AI system unavailable, using fallback...", 40, "processing")
            
            # Fallback to dummy tasks
            llm_tasks = [
                {
                    "name": "Setup Project Infrastructure",
                    "description": "Initialize project repository and setup development environment",
                    "details": "Create Git repository, setup CI/CD pipeline, configure development tools",
                    "priority": "high",
                    "size": "l",
                    "tags": ["setup", "infrastructure"]
                },
                {
                    "name": "Design Database Schema",
                    "description": "Create database schema based on requirements",
                    "details": "Define tables, relationships, and indexes for the application",
                    "priority": "high",
                    "size": "m",
                    "tags": ["database", "design"]
                },
                {
                    "name": "Implement User Authentication",
                    "description": "Build user authentication and authorization system",
                    "details": "Implement login, registration, password reset, and session management",
                    "priority": "high",
                    "size": "l",
                    "tags": ["backend", "security"]
                },
                {
                    "name": "Create API Endpoints",
                    "description": "Develop RESTful API endpoints for core functionality",
                    "details": "Build CRUD operations for main entities with proper validation",
                    "priority": "normal",
                    "size": "xl",
                    "tags": ["backend", "api"]
                },
            ]
            dependencies = []
        
        time.sleep(0.5)
        
        # Step 5: Save tasks to database
        send_progress_update(project_uuid, "Saving tasks to database...", 80, "processing")
        
        created_tasks = []
        task_id_mapping = {}  # Map LLM task IDs to Django task UUIDs
        
        for task_data in llm_tasks:
            task = Task.objects.create(
                Project=project,
                name=task_data["name"],
                description=task_data["description"],
                details=task_data.get("details", task_data["description"]),
                priority=task_data.get("priority", "normal"),
                size=task_data.get("size", "m"),
                status="created",
                created_by="ai",
                tags=task_data.get("tags", []),
                llm_task_id=task_data.get("llm_task_id")  # Store LLM task ID
            )
            
            # Store mapping for dependency creation
            if task_data.get("llm_task_id"):
                task_id_mapping[task_data["llm_task_id"]] = str(task.taskid)
            
            created_tasks.append({
                "taskid": str(task.taskid),
                "name": task.name,
                "task_number": task.task_number,
                "requirement_id": task_data.get("requirement_id", "")
            })
        
        # Step 6: Create task dependencies (if any)
        dependency_count = 0
        if dependencies:
            send_progress_update(project_uuid, "Creating task dependencies...", 85, "processing")
            
            for dep in dependencies:
                from_llm_id = dep['from_task_id']
                to_llm_id = dep['to_task_id']
                
                try:
                    # Use llm_task_id field for lookup
                    from_task = Task.objects.get(llm_task_id=from_llm_id)
                    to_task = Task.objects.get(llm_task_id=to_llm_id)
                    from_task.related_work.add(to_task)
                    dependency_count += 1
                    logger.info(f"Created dependency: {from_task.name} -> {to_task.name}")
                except Task.DoesNotExist:
                    logger.warning(f"Could not create dependency: task not found ({from_llm_id} -> {to_llm_id})")
        
        # Step 7: Create sprints (if any)
        created_sprints = []
        if sprint_allocations:
            send_progress_update(project_uuid, "Creating sprint allocations...", 92, "processing")
            
            from .llm.django_integration import create_sprints_from_llm_ids
            
            created_sprints = create_sprints_from_llm_ids(
                project=project,
                sprint_allocations=sprint_allocations,
                created_by=user
            )
            
            logger.info(f"Created {len(created_sprints)} sprints")
        
        time.sleep(0.5)
        
        # Step 8: Complete
        completion_message = f"Successfully generated {len(created_tasks)} tasks"
        if dependency_count > 0:
            completion_message += f" with {dependency_count} dependencies"
        if created_sprints:
            completion_message += f" across {len(created_sprints)} sprints"
        completion_message += "!"
        
        send_progress_update(
            project_uuid, 
            completion_message, 
            100, 
            "completed",
            {
                "tasks": created_tasks, 
                "count": len(created_tasks),
                "dependencies": dependency_count,
                "sprints": len(created_sprints)
            }
        )
        
        # Create activity for task generation completion
        activity_description = f"completed AI task generation - created {len(created_tasks)} tasks"
        if dependency_count > 0:
            activity_description += f" with {dependency_count} dependencies"
        if created_sprints:
            activity_description += f" across {len(created_sprints)} sprints"
        
        create_and_broadcast_activity(
            activity_type='task_created',
            user=user,
            project=project,
            description=activity_description,
            target_name=f"AI Task Generation",
            metadata={
                "document_id": document_id, 
                "status": "completed",
                "tasks_created": len(created_tasks),
                "task_ids": [t["taskid"] for t in created_tasks],
                "dependencies_created": dependency_count,
                "sprints_created": len(created_sprints)
            }
        )
        
        logger.info(f"Task generation completed for project {project.name}. Created {len(created_tasks)} tasks.")
        
        return {
            "success": True,
            "project_id": project_id,
            "tasks_created": len(created_tasks),
            "tasks": created_tasks
        }
        
    except Project.DoesNotExist:
        error_msg = f"Project with ID {project_id} not found"
        logger.error(error_msg)
        # Try to get project UUID for error message
        try:
            project = Project.objects.get(id=project_id)
            send_progress_update(str(project.uuid), error_msg, 0, "error")
        except:
            pass
        return {"success": False, "error": error_msg}
        
    except Document.DoesNotExist:
        error_msg = f"Document with ID {document_id} not found"
        logger.error(error_msg)
        # Try to get project UUID for error message
        try:
            project = Project.objects.get(id=project_id)
            send_progress_update(str(project.uuid), error_msg, 0, "error")
        except:
            pass
        return {"success": False, "error": error_msg}
        
    except Exception as e:
        error_msg = f"Error generating tasks: {str(e)}"
        logger.error(error_msg, exc_info=True)
        # Try to get project UUID for error message
        try:
            project = Project.objects.get(id=project_id)
            send_progress_update(str(project.uuid), error_msg, 0, "error")
        except:
            pass
        return {"success": False, "error": error_msg}


@shared_task
def move_unfinished_tasks_to_backlog():
    """
    Background job that runs periodically to check for ended sprints
    and move all unfinished tasks to backlog.
    """
    logger.info("Starting sprint cleanup job...")
    
    try:
        # Get current time
        now = timezone.now()
        
        # Find all sprints that have ended but are still marked as active
        ended_sprints = Sprint.objects.filter(
            end_date__lt=now,
            status='active'
        )
        
        total_tasks_moved = 0
        total_sprints_completed = 0
        
        for sprint in ended_sprints:
            logger.info(f"Processing sprint: {sprint.name} (ID: {sprint.id})")
            
            # Get all unfinished tasks in this sprint
            unfinished_tasks = Task.objects.filter(
                sprint=sprint
            ).exclude(
                status='completed'
            )
            
            tasks_moved = 0
            task_ids = []
            for task in unfinished_tasks:
                # Move task out of sprint, set to backlog only if it was active
                if task.status == 'active':
                    task.status = 'backlog'
                # Keep 'created' status for tasks that were never started
                task.sprint = None  # Remove from sprint
                task.save()
                tasks_moved += 1
                task_ids.append(str(task.taskid))
                logger.info(f"Moved task '{task.name}' (ID: {task.taskid}) out of sprint (status: {task.status})")
            
            # Mark sprint as completed
            sprint.status = 'completed'
            sprint.save()
            
            # Create activity for sprint completion (use project owner or system user)
            if sprint.project and tasks_moved > 0:
                # Try to get project owner or first team member
                system_user = sprint.project.owner if sprint.project.owner else None
                if system_user:
                    create_and_broadcast_activity(
                        activity_type='task_updated',
                        user=system_user,
                        project=sprint.project,
                        description=f"Sprint '{sprint.name}' ended - moved {tasks_moved} unfinished tasks to backlog",
                        target_name=sprint.name,
                        metadata={
                            "sprint_id": sprint.id,
                            "tasks_moved": tasks_moved,
                            "task_ids": task_ids,
                            "automated": True
                        }
                    )
            
            total_tasks_moved += tasks_moved
            total_sprints_completed += 1
            
            logger.info(
                f"Sprint '{sprint.name}' completed. "
                f"Moved {tasks_moved} unfinished tasks to backlog."
            )
        
        logger.info(
            f"Sprint cleanup completed. "
            f"Processed {total_sprints_completed} sprints, "
            f"moved {total_tasks_moved} tasks to backlog."
        )
        
        return {
            'success': True,
            'sprints_completed': total_sprints_completed,
            'tasks_moved': total_tasks_moved
        }
        
    except Exception as e:
        logger.error(f"Error in sprint cleanup job: {str(e)}", exc_info=True)
        return {
            'success': False,
            'error': str(e)
        }


@shared_task
def check_and_complete_sprint(sprint_id, user_id=None):
    """
    Manually trigger sprint completion for a specific sprint.
    Useful for testing or manual sprint closure.
    """
    try:
        sprint = Sprint.objects.get(id=sprint_id)
        
        # Get all unfinished tasks
        unfinished_tasks = Task.objects.filter(
            sprint=sprint
        ).exclude(
            status='completed'
        )
        
        tasks_moved = 0
        task_ids = []
        for task in unfinished_tasks:
            # Set to backlog only if it was active, keep 'created' status otherwise
            if task.status == 'active':
                task.status = 'backlog'
            task.sprint = None
            task.save()
            tasks_moved += 1
            task_ids.append(str(task.taskid))
        
        # Mark sprint as completed
        sprint.status = 'completed'
        sprint.save()
        
        # Create activity for manual sprint completion
        if sprint.project and tasks_moved > 0:
            # Get user who triggered this, or use project owner
            user = None
            if user_id:
                try:
                    user = User.objects.get(id=user_id)
                except User.DoesNotExist:
                    pass
            
            if not user:
                user = sprint.project.owner
            
            if user:
                create_and_broadcast_activity(
                    activity_type='task_updated',
                    user=user,
                    project=sprint.project,
                    description=f"manually completed sprint '{sprint.name}' - moved {tasks_moved} tasks to backlog",
                    target_name=sprint.name,
                    metadata={
                        "sprint_id": sprint.id,
                        "tasks_moved": tasks_moved,
                        "task_ids": task_ids,
                        "manual": True
                    }
                )
        
        logger.info(
            f"Manually completed sprint '{sprint.name}'. "
            f"Moved {tasks_moved} tasks to backlog."
        )
        
        return {
            'success': True,
            'sprint_name': sprint.name,
            'tasks_moved': tasks_moved
        }
        
    except Sprint.DoesNotExist:
        logger.error(f"Sprint with ID {sprint_id} not found")
        return {
            'success': False,
            'error': 'Sprint not found'
        }
    except Exception as e:
        logger.error(f"Error completing sprint {sprint_id}: {str(e)}", exc_info=True)
        return {
            'success': False,
            'error': str(e)
        }
