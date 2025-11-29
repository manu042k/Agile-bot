from celery import shared_task
from .models import Task, Sprint
from django.utils import timezone
import logging

logger = logging.getLogger(__name__)

# from .rag_pipeline import TaskExtractor
# from .models import Task, FileUpload
# from agileBotApis.celery import app
# import re
# import json
# from channels.layers import get_channel_layer
# from asgiref.sync import async_to_sync


# def send_message_to_frontend(message, user_id):
#     channel_layer = get_channel_layer()
#     group_name = "chat_room"  # Must match the group name in the consumer

#     # Message payload
#     payload = {
#         "type": "chat_message",  # Must match the consumer's handler type
#         "message": message,
#         "user_id": user_id,  # Include the user ID
#     }

#     # Send the message to the group
#     async_to_sync(channel_layer.group_send)(group_name, payload)


# @app.task
# def generate_task(file_id, user_id):
#     print("Generating task")
#     send_message_to_frontend("Generating task", user_id)
#     try:
#         file = FileUpload.objects.get(id=file_id)

#         Task.objects.filter(Project=file.project, created_by="ai").delete()

#         if not file:
#             print("No file found.")
#             return False

#         task_extractor = TaskExtractor(file.file)
#         tasks = task_extractor.extract_tasks_from_requirements()

#         json_match = re.search(r"```json\n(.*?)```", tasks, re.DOTALL)
#         send_message_to_frontend("Generated task", user_id)

#         if json_match:
#             json_content = json_match.group(1)
#             try:
#                 json_data = json.loads(json_content)
#                 for task in json_data["tasks"]:
#                     task_title = task["task_title"]
#                     task_desc = task["task_desc"]
#                     task_id = task["task_id"]
#                     task_ref = task["task_ref"]
#                     Task.objects.create(
#                         Project=file.project,  # Use the passed project ID
#                         name=task_title,
#                         description=task_desc.strip(),
#                         details=task_ref,  # Placeholder for additional details
#                         status="created",  # Default status
#                         priority="normal",  # Default priority
#                         size="m",  # Default size
#                         created_by="ai",
#                     )
#                 print("Tasks saved to database.")
#                 send_message_to_frontend("Tasks saved to database.", user_id)

#             except json.JSONDecodeError as e:
#                 print(f"Error decoding JSON: {e}")
#         else:
#             print("No JSON content found.")

#     except Exception as e:
#         print(f"Error occurred: {e}")
#         return False


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
            for task in unfinished_tasks:
                # Move task to backlog
                task.status = 'backlog'
                task.sprint = None  # Remove from sprint
                task.save()
                tasks_moved += 1
                logger.info(f"Moved task '{task.name}' (ID: {task.taskid}) to backlog")
            
            # Mark sprint as completed
            sprint.status = 'completed'
            sprint.save()
            
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
def check_and_complete_sprint(sprint_id):
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
        for task in unfinished_tasks:
            task.status = 'backlog'
            task.sprint = None
            task.save()
            tasks_moved += 1
        
        # Mark sprint as completed
        sprint.status = 'completed'
        sprint.save()
        
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
