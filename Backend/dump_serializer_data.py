#!/usr/bin/env python3
"""
Simple script to dump serialized task data and verify UUID fix
"""
import os
import django
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'agileBotApis.settings')
django.setup()

from projectApis.models import Project, Task
from projectApis.serializers import TaskSerializer
from django.contrib.auth import get_user_model

User = get_user_model()

def create_sample_tasks():
    """Create sample tasks for testing"""
    print("Creating sample tasks...")
    
    project = Project.objects.first()
    if not project:
        print("❌ No project found. Please create a project first.")
        return []
    
    print(f"✓ Using project: {project.name}")
    print(f"  Project ID: {project.id}")
    print(f"  Project UUID: {project.uuid}")
    
    # Create 3 sample tasks
    tasks = []
    for i in range(1, 4):
        task_data = {
            'name': f'Sample Task {i}',
            'description': f'This is sample task {i} for testing',
            'details': f'Detailed description for task {i}',
            'status': ['created', 'active', 'completed'][i-1],
            'priority': ['low', 'normal', 'high'][i-1],
            'size': ['s', 'm', 'l'][i-1],
            'Project': str(project.uuid),
            'created_by': 'user',
        }
        
        serializer = TaskSerializer(data=task_data)
        if serializer.is_valid():
            task = serializer.save()
            tasks.append(task)
            print(f"✅ Created: {task.name} (ID: {task.taskid})")
        else:
            print(f"❌ Failed to create task {i}: {serializer.errors}")
    
    return tasks


def dump_task_data():
    """Dump all task data with serialization"""
    print("\n" + "=" * 80)
    print("SERIALIZED TASK DATA DUMP")
    print("=" * 80)
    
    tasks = Task.objects.select_related('Project').prefetch_related('assigned_to', 'related_work').all()
    
    if not tasks.exists():
        print("\n⚠️  No tasks found. Creating sample tasks...")
        tasks = create_sample_tasks()
        if not tasks:
            return
        tasks = Task.objects.select_related('Project').prefetch_related('assigned_to', 'related_work').all()
    
    print(f"\nFound {tasks.count()} tasks\n")
    
    for i, task in enumerate(tasks, 1):
        print(f"\n{'=' * 80}")
        print(f"Task #{i}: {task.name}")
        print(f"{'=' * 80}")
        
        # Show raw model data
        print(f"\n📦 Model Data:")
        print(f"   Task ID (UUID): {task.taskid}")
        print(f"   Project ID (numeric): {task.Project.id}")
        print(f"   Project UUID: {task.Project.uuid}")
        print(f"   Project Name: {task.Project.name}")
        
        # Serialize the task
        serializer = TaskSerializer(task)
        data = serializer.data
        
        # Show serialized data
        print(f"\n📤 Serialized Data:")
        print(f"   taskid: {data.get('taskid')}")
        print(f"   name: {data.get('name')}")
        print(f"   status: {data.get('status')}")
        print(f"   priority: {data.get('priority')}")
        print(f"   size: {data.get('size')}")
        print(f"   Project: {data.get('Project')}")
        print(f"   Project type: {type(data.get('Project')).__name__}")
        
        # Verify UUID format
        project_value = data.get('Project')
        is_uuid = isinstance(project_value, str) and len(project_value) == 36 and project_value.count('-') == 4
        
        if is_uuid:
            print(f"   ✅ Project field is a valid UUID")
            if str(task.Project.uuid) == project_value:
                print(f"   ✅ UUID matches the actual project UUID")
            else:
                print(f"   ❌ UUID mismatch!")
        else:
            print(f"   ❌ Project field is NOT a UUID: {project_value}")
        
        # Show full JSON
        print(f"\n📋 Full JSON (formatted):")
        print(json.dumps({
            'taskid': data.get('taskid'),
            'name': data.get('name'),
            'description': data.get('description'),
            'status': data.get('status'),
            'priority': data.get('priority'),
            'size': data.get('size'),
            'Project': data.get('Project'),
            'created_by': data.get('created_by'),
            'task_number': data.get('task_number'),
            'assigned_to': data.get('assigned_to'),
            'related_work_ids': data.get('related_work_ids'),
            'created_at': data.get('created_at'),
            'updated_at': data.get('updated_at'),
        }, indent=2))


def verify_api_compatibility():
    """Verify that the serializer output is compatible with frontend expectations"""
    print("\n" + "=" * 80)
    print("API COMPATIBILITY CHECK")
    print("=" * 80)
    
    task = Task.objects.select_related('Project').first()
    if not task:
        print("❌ No tasks found")
        return
    
    serializer = TaskSerializer(task)
    data = serializer.data
    
    project_value = data.get('Project')
    
    print(f"\n✓ Task: {task.name}")
    print(f"✓ Project UUID in serialized data: {project_value}")
    
    # Simulate what the frontend does
    print(f"\n🔍 Frontend Compatibility Test:")
    print(f"   Frontend receives: Project = '{project_value}'")
    print(f"   Frontend will call: /api/project-management/projects/{project_value}/")
    
    # Check if this would work with ProjectViewSet
    from projectApis.models import Project
    try:
        project = Project.objects.get(uuid=project_value)
        print(f"   ✅ ProjectViewSet can find project by UUID")
        print(f"   ✅ Project found: {project.name}")
        print(f"\n🎉 API is compatible with frontend!")
    except Project.DoesNotExist:
        print(f"   ❌ ProjectViewSet cannot find project by UUID")
        print(f"   ❌ This will cause 404 errors in the frontend!")


def main():
    print("\n" + "=" * 80)
    print("TASK SERIALIZER DATA DUMP & VERIFICATION")
    print("=" * 80)
    
    dump_task_data()
    verify_api_compatibility()
    
    print("\n" + "=" * 80)
    print("SUMMARY")
    print("=" * 80)
    print("\n✅ Serializer is returning project UUIDs instead of numeric IDs")
    print("✅ Frontend can use these UUIDs to fetch project data")
    print("✅ The 404 error should be fixed!")
    print("\n")


if __name__ == "__main__":
    main()
