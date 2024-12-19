from .rag_pipeline import TaskExtractor
from .models import Task, FileUpload
from agileBotApis.celery import app
import re
import json
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync


def send_message_to_frontend(message, user_id):
    channel_layer = get_channel_layer()
    group_name = "chat_room"  # Must match the group name in the consumer

    # Message payload
    payload = {
        "type": "chat_message",  # Must match the consumer's handler type
        "message": message,
        "user_id": user_id,  # Include the user ID
    }

    # Send the message to the group
    async_to_sync(channel_layer.group_send)(group_name, payload)


@app.task
def generate_task(file_id, user_id):
    print("Generating task")
    send_message_to_frontend("Generating task", user_id)
    try:
        file = FileUpload.objects.get(id=file_id)

        Task.objects.filter(Project=file.project, created_by="ai").delete()

        if not file:
            print("No file found.")
            return False

        task_extractor = TaskExtractor(file.file)
        tasks = task_extractor.extract_tasks_from_requirements()

        json_match = re.search(r"```json\n(.*?)```", tasks, re.DOTALL)
        send_message_to_frontend("Generated task", user_id)

        if json_match:
            json_content = json_match.group(1)
            try:
                json_data = json.loads(json_content)
                for task in json_data["tasks"]:
                    task_title = task["task_title"]
                    task_desc = task["task_desc"]
                    task_id = task["task_id"]
                    task_ref = task["task_ref"]
                    Task.objects.create(
                        Project=file.project,  # Use the passed project ID
                        name=task_title,
                        description=task_desc.strip(),
                        details=task_ref,  # Placeholder for additional details
                        status="created",  # Default status
                        priority="normal",  # Default priority
                        size="m",  # Default size
                        created_by="ai",
                    )
                print("Tasks saved to database.")
                send_message_to_frontend("Tasks saved to database.", user_id)

            except json.JSONDecodeError as e:
                print(f"Error decoding JSON: {e}")
        else:
            print("No JSON content found.")

    except Exception as e:
        print(f"Error occurred: {e}")
        return False
