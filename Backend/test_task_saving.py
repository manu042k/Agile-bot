#!/usr/bin/env python
"""
Test to verify tasks are saved to database
"""
import os
import sys
import django
from pathlib import Path

# Setup Django
sys.path.insert(0, str(Path(__file__).parent))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'agileBotApis.settings')
django.setup()

from projectApis.models import Project, Task, Sprint

print("=" * 60)
print("Database Task Check")
print("=" * 60)

# Check for projects
projects = Project.objects.all()
print(f"\n📋 Total Projects: {projects.count()}")

for project in projects:
    print(f"\n  Project: {project.name} (ID: {project.id})")
    
    # Check tasks
    tasks = Task.objects.filter(Project=project)
    ai_tasks = tasks.filter(created_by='ai')
    user_tasks = tasks.filter(created_by='user')
    
    print(f"    Total Tasks: {tasks.count()}")
    print(f"    AI-Generated Tasks: {ai_tasks.count()}")
    print(f"    User-Created Tasks: {user_tasks.count()}")
    
    if ai_tasks.exists():
        print(f"\n    Sample AI Tasks:")
        for task in ai_tasks[:3]:
            print(f"      - {task.name} (Priority: {task.priority}, Size: {task.size})")
            if task.related_work.exists():
                print(f"        Dependencies: {task.related_work.count()}")
    
    # Check sprints
    sprints = Sprint.objects.filter(project=project)
    print(f"\n    Sprints: {sprints.count()}")
    for sprint in sprints:
        sprint_tasks = Task.objects.filter(sprint=sprint)
        print(f"      - {sprint.name}: {sprint_tasks.count()} tasks")

print("\n" + "=" * 60)
