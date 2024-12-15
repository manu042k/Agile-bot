from .rag_pipeline import TaskExtractor
from .models import Task,FileUpload
from agileBotApis.celery import app
import re
import json

@app.task
def add(x, y):
    print('Adding two numbers')
    return x + y 

@app.task
def purge_queue():
    # Purge all tasks in the default queue
    num_deleted = app.control.purge()
    print(f"Purged {num_deleted} tasks from the queue")
    return num_deleted

@app.task
def generate_task(file_id):
    print('Generating task')
    try:
        file = FileUpload.objects.get(id=file_id)
        
        Task.objects.filter(Project=file.project,created_by='ai').delete()
        
        if not file:
            print("No file found.")
            return False

        task_extractor = TaskExtractor(file.file)
        tasks = task_extractor.extract_tasks_from_requirements()
        print(tasks)
        json_match = re.search(r'```json\n(.*?)```', tasks, re.DOTALL)

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
                        details= task_ref,  # Placeholder for additional details
                        status='created',  # Default status
                        priority='normal',  # Default priority
                        size='m',  # Default size
                        created_by='ai',
                    ) 
                print("Tasks saved to database.")
            except json.JSONDecodeError as e:
                print(f"Error decoding JSON: {e}")
        else:
            print("No JSON content found.")
        
       
        

    except Exception as e:
        print(f"Error occurred: {e}")
        return False

        