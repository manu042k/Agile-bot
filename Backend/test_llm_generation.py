#!/usr/bin/env python
"""
Test LLM task generation with a sample requirements document
Run this from Backend directory: python test_llm_generation.py
"""
import os
import sys
import django
from pathlib import Path

# Setup Django
sys.path.insert(0, str(Path(__file__).parent))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'agileBotApis.settings')
django.setup()

from projectApis.llm_integration import generate_tasks_with_llm
from projectApis.models import Project, Document
from users.models import User

print("=" * 60)
print("LLM Task Generation Test")
print("=" * 60)

# Check if we have any projects with documents
projects_with_docs = Project.objects.filter(documents__isnull=False).distinct()

if not projects_with_docs.exists():
    print("\n⚠️  No projects with documents found.")
    print("Please upload a requirements document to a project first.")
    print("\nTo test the LLM system:")
    print("1. Create a project in the UI")
    print("2. Upload a requirements document")
    print("3. Click 'Generate Tasks with AI'")
    sys.exit(0)

# Get the first project with a document
project = projects_with_docs.first()
document = project.documents.first()

print(f"\n📋 Testing with Project: {project.name}")
print(f"📄 Document: {document.name}")
print(f"📁 File path: {document.file.path}")

# Check if file exists
if not os.path.exists(document.file.path):
    print(f"\n✗ Document file not found at: {document.file.path}")
    sys.exit(1)

print(f"\n✓ Document file exists")

# Build team description
if project.team:
    team_desc = f"Team: {project.team.name}\n"
    for member in project.team.members.all():
        role = member.role if member.role else "Developer"
        name = member.get_full_name()
        team_desc += f"- {name} ({role})\n"
else:
    team_desc = "- Development team with full-stack capabilities"

print(f"\n👥 Team Description:")
print(team_desc)

# Build project context
project_context = f"Project: {project.name}\n"
if project.description:
    project_context += f"Description: {project.description}\n"
if project.domain:
    project_context += f"Domain: {project.domain}\n"
if project.tech_stack:
    project_context += f"Tech Stack: {', '.join(project.tech_stack)}\n"

print(f"\n🎯 Project Context:")
print(project_context)

print("\n" + "=" * 60)
print("Starting LLM Task Generation...")
print("=" * 60)

try:
    # Generate tasks with LLM
    result = generate_tasks_with_llm(
        project_id=project.id,
        document_path=document.file.path,
        team_description=team_desc,
        project_context=project_context,
        detect_dependencies=True,
        allocate_sprints=True,
        num_sprints=3
    )
    
    if result['success']:
        tasks = result['tasks']
        dependencies = result['dependencies']
        sprints = result['sprints']
        
        print(f"\n✓ Task generation successful!")
        print(f"\n📊 Results:")
        print(f"   - Generated {len(tasks)} tasks")
        print(f"   - Detected {len(dependencies)} dependencies")
        print(f"   - Created {len(sprints)} sprint allocations")
        
        if tasks:
            print(f"\n📝 Sample Tasks (first 3):")
            for i, task in enumerate(tasks[:3], 1):
                print(f"\n   {i}. {task['name']}")
                print(f"      Priority: {task.get('priority', 'normal')}")
                print(f"      Size: {task.get('size', 'm')}")
                print(f"      Description: {task['description'][:100]}...")
        
        if dependencies:
            print(f"\n🔗 Sample Dependencies (first 3):")
            for i, dep in enumerate(dependencies[:3], 1):
                print(f"   {i}. Task {dep['from_task_id']} → Task {dep['to_task_id']}")
                print(f"      Reason: {dep.get('reason', 'N/A')}")
        
        if sprints:
            print(f"\n🏃 Sprint Allocations:")
            for i, sprint in enumerate(sprints, 1):
                sprint_name = sprint.get('name', f'Sprint {i}')
                print(f"   - {sprint_name}: {len(sprint.get('task_ids', []))} tasks")
        
        print("\n" + "=" * 60)
        print("✓ LLM Task Generation Test PASSED!")
        print("=" * 60)
        
    else:
        print(f"\n✗ Task generation failed!")
        print(f"Error: {result.get('error', 'Unknown error')}")
        sys.exit(1)
        
except Exception as e:
    print(f"\n✗ Test failed with exception:")
    print(f"Error: {str(e)}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
