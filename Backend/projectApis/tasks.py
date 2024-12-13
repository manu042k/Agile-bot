from .rag_pipeline import TaskExtractor
from .models import Task,FileUpload
from agileBotApis.celery import app
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
def generate_task(id):
    print('Generating task')
    try:
        # Retrieve the file associated with the provided ID
        filepath = FileUpload.objects.all()[0].file
        print('Generating task for file:', filepath)
        
        # Assuming TaskExtractor is a class that handles extracting tasks from the file
        task_extractor = TaskExtractor(pdf_path=filepath)
        final_tasks = task_extractor.extract_tasks_from_requirements()  # Assuming this returns an AIMessage object

        # Extract the content of the AIMessage object (adjust based on the actual structure of AIMessage)
        if hasattr(final_tasks, 'content'):
            final_tasks_content = final_tasks.content  # Access the content attribute
            print(f"Content received: {final_tasks_content}")  # Print the content for debugging

            # Look for the JSON part in the string (starting from the first '{' to the last '}')
            start_index = final_tasks_content.find('[')  # Find the first '[' indicating start of JSON array
            end_index = final_tasks_content.rfind(']')  # Find the last ']' indicating end of JSON array
            
            if start_index != -1 and end_index != -1:
                json_string = final_tasks_content[start_index:end_index + 1]  # Extract JSON part

                if json_string.strip():  # Check if the extracted string is not empty or just whitespace
                    try:
                        # Parse the content as a JSON string
                        tasks_data = json.loads(json_string)
                        print(f"Parsed tasks data: {tasks_data}")

                        # Iterate through the list of tasks and create Task objects
                        for task_data in tasks_data:
                            task_id = task_data["task_id"]
                            task_title = task_data["task_title"]
                            task_desc = task_data["task_desc"]

                            # Create a new Task object for each task in the JSON
                            new_task = Task.objects.create(
                                Project=FileUpload.objects.all()[3].project,  # Assuming FileUpload has a related project
                                name=task_title,  # Task title as the name of the task
                                description=task_desc,  # Task description
                                details=f"Task ID: {task_id} - File path: {filepath.name}",  # Add extra details like task ID and file path
                                status='created',  # Set the initial status of the task
                                priority='normal',  # Default priority
                                size='m',  # Default size
                            )

                            print(f"Task created with task number: {new_task.task_number}, Task ID: {task_id}")
                    except json.JSONDecodeError:
                        print("Failed to parse content as JSON.")
                else:
                    print("Received empty content in JSON part.")
            else:
                print("No valid JSON found in content.")
        else:
            print("No content found in AIMessage")

    except FileUpload.DoesNotExist:
        print('File not found')

    except Exception as e:
        print(f"An error occurred: {str(e)}")
    
    return id
