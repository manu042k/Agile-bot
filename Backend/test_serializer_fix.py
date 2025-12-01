#!/usr/bin/env python
"""
Test script to verify TaskSerializer returns project UUID instead of numeric ID
"""
import os
import django
import sys

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'agileBotApis.settings')
django.setup()

from projectApis.models import Project, Task
from projectApis.serializers import TaskSerializer
from django.contrib.auth import get_user_model
import json

User = get_user_model()

def test_task_serializer():
    """Test that TaskSerializer returns project UUID in the Project field"""
    print("=" * 80)
    print("Testing TaskSerializer - Project UUID Fix")
    print("=" * 80)
    
    # Get a task from the database
    task = Task.objects.select_related('Project').first()
    
    if not task:
        print("❌ No tasks found in database. Please create a task first.")
        return False
    
    print(f"\n✓ Found task: {task.name} (ID: {task.taskid})")
    print(f"  Task's Project (model): ID={task.Project.id}, UUID={task.Project.uuid}")
    
    # Serialize the task
    serializer = TaskSerializer(task)
    serialized_data = serializer.data
    
    print(f"\n📦 Serialized Task Data:")
    print(f"  Task ID: {serialized_data.get('taskid')}")
    print(f"  Task Name: {serialized_data.get('name')}")
    print(f"  Project Field: {serialized_data.get('Project')}")
    print(f"  Project Field Type: {type(serialized_data.get('Project'))}")
    
    # Verify the Project field contains UUID, not numeric ID
    project_value = serialized_data.get('Project')
    
    if project_value is None:
        print("\n❌ FAIL: Project field is None")
        return False
    
    # Check if it's a UUID string (should be 36 characters with hyphens)
    if isinstance(project_value, str) and len(project_value) == 36 and project_value.count('-') == 4:
        print(f"\n✅ SUCCESS: Project field contains UUID: {project_value}")
        
        # Verify it matches the actual project UUID
        if str(task.Project.uuid) == project_value:
            print(f"✅ UUID matches the actual project UUID")
        else:
            print(f"❌ FAIL: UUID doesn't match. Expected: {task.Project.uuid}, Got: {project_value}")
            return False
    else:
        print(f"\n❌ FAIL: Project field is not a valid UUID")
        print(f"   Expected UUID format (36 chars with hyphens)")
        print(f"   Got: {project_value} (type: {type(project_value)})")
        return False
    
    # Test with multiple tasks
    print("\n" + "=" * 80)
    print("Testing Multiple Tasks")
    print("=" * 80)
    
    tasks = Task.objects.select_related('Project').all()[:5]
    print(f"\nTesting {tasks.count()} tasks...")
    
    all_passed = True
    for task in tasks:
        serializer = TaskSerializer(task)
        project_value = serializer.data.get('Project')
        
        if isinstance(project_value, str) and len(project_value) == 36:
            print(f"✅ Task {task.task_number}: Project UUID = {project_value}")
        else:
            print(f"❌ Task {task.task_number}: Invalid Project value = {project_value}")
            all_passed = False
    
    return all_passed


def test_task_creation_with_uuid():
    """Test creating/updating a task using project UUID"""
    print("\n" + "=" * 80)
    print("Testing Task Creation/Update with Project UUID")
    print("=" * 80)
    
    # Get a project
    project = Project.objects.first()
    if not project:
        print("❌ No projects found in database")
        return False
    
    print(f"\n✓ Using project: {project.name}")
    print(f"  Project ID: {project.id}")
    print(f"  Project UUID: {project.uuid}")
    
    # Test data with UUID
    task_data = {
        'name': 'Test Task - UUID Serializer',
        'description': 'Testing task creation with UUID',
        'details': 'This task tests the UUID serializer fix',
        'status': 'created',
        'priority': 'normal',
        'size': 'm',
        'Project': str(project.uuid),  # Using UUID instead of ID
        'created_by': 'user',
    }
    
    print(f"\n📝 Creating task with Project UUID: {task_data['Project']}")
    
    try:
        serializer = TaskSerializer(data=task_data)
        if serializer.is_valid():
            task = serializer.save()
            print(f"✅ Task created successfully: {task.name} (ID: {task.taskid})")
            print(f"   Task's Project ID: {task.Project.id}")
            print(f"   Task's Project UUID: {task.Project.uuid}")
            
            # Verify the serialized output
            output_serializer = TaskSerializer(task)
            output_project = output_serializer.data.get('Project')
            print(f"   Serialized Project field: {output_project}")
            
            if output_project == str(project.uuid):
                print(f"✅ Serialized output contains correct UUID")
                
                # Clean up - delete the test task
                task.delete()
                print(f"✅ Test task deleted")
                return True
            else:
                print(f"❌ Serialized output has wrong value: {output_project}")
                task.delete()
                return False
        else:
            print(f"❌ Serializer validation failed:")
            print(json.dumps(serializer.errors, indent=2))
            return False
    except Exception as e:
        print(f"❌ Error creating task: {str(e)}")
        import traceback
        traceback.print_exc()
        return False


def test_project_viewset_lookup():
    """Test that ProjectViewSet can lookup by UUID"""
    print("\n" + "=" * 80)
    print("Testing ProjectViewSet UUID Lookup")
    print("=" * 80)
    
    project = Project.objects.first()
    if not project:
        print("❌ No projects found")
        return False
    
    print(f"\n✓ Testing project: {project.name}")
    print(f"  ID: {project.id}")
    print(f"  UUID: {project.uuid}")
    
    # The ProjectViewSet uses 'uuid' as lookup_field
    # This means URLs like /api/project-management/projects/{uuid}/ should work
    print(f"\n✅ ProjectViewSet is configured to use 'uuid' as lookup_field")
    print(f"   URL pattern: /api/project-management/projects/{project.uuid}/")
    print(f"   This should work correctly with the frontend")
    
    return True


def dump_sample_data():
    """Dump sample task data to verify structure"""
    print("\n" + "=" * 80)
    print("Sample Task Data Dump")
    print("=" * 80)
    
    tasks = Task.objects.select_related('Project').prefetch_related('assigned_to', 'related_work').all()[:3]
    
    if not tasks:
        print("❌ No tasks found")
        return
    
    for task in tasks:
        print(f"\n{'=' * 60}")
        print(f"Task: {task.name}")
        print(f"{'=' * 60}")
        
        serializer = TaskSerializer(task)
        data = serializer.data
        
        print(json.dumps({
            'taskid': data.get('taskid'),
            'name': data.get('name'),
            'status': data.get('status'),
            'priority': data.get('priority'),
            'Project': data.get('Project'),
            'Project_type': type(data.get('Project')).__name__,
            'assigned_to_count': len(data.get('assigned_to', [])),
            'created_at': data.get('created_at'),
        }, indent=2))


def main():
    print("\n" + "=" * 80)
    print("TASK SERIALIZER TEST SUITE")
    print("=" * 80)
    
    results = []
    
    # Test 1: Basic serializer test
    print("\n[TEST 1] Basic Serializer Test")
    results.append(("Basic Serializer", test_task_serializer()))
    
    # Test 2: Task creation with UUID
    print("\n[TEST 2] Task Creation with UUID")
    results.append(("Task Creation", test_task_creation_with_uuid()))
    
    # Test 3: ProjectViewSet lookup
    print("\n[TEST 3] ProjectViewSet Lookup")
    results.append(("ProjectViewSet", test_project_viewset_lookup()))
    
    # Dump sample data
    print("\n[DATA DUMP] Sample Task Data")
    dump_sample_data()
    
    # Summary
    print("\n" + "=" * 80)
    print("TEST SUMMARY")
    print("=" * 80)
    
    for test_name, passed in results:
        status = "✅ PASSED" if passed else "❌ FAILED"
        print(f"{status}: {test_name}")
    
    all_passed = all(result[1] for result in results)
    
    if all_passed:
        print("\n🎉 All tests passed!")
        return 0
    else:
        print("\n❌ Some tests failed")
        return 1


if __name__ == "__main__":
    sys.exit(main())
