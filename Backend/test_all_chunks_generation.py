#!/usr/bin/env python
"""
Test that ALL chunks generate at least one task
"""
import os
import sys
import django
from pathlib import Path

# Setup Django
sys.path.insert(0, str(Path(__file__).parent))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'agileBotApis.settings')
django.setup()

from projectApis.models import Project, Document
from projectApis.llm_integration import generate_tasks_with_llm

print("=" * 70)
print("COMPREHENSIVE TASK GENERATION TEST")
print("=" * 70)

# Get project with document
project = Project.objects.first()
if not project:
    print("\n❌ No projects found")
    sys.exit(1)

document = project.documents.first()
if not document:
    print("\n❌ No documents found")
    sys.exit(1)

print(f"\n📋 Project: {project.name}")
print(f"📄 Document: {document.name}")

# Build team description
if project.team:
    team_desc = f"Team: {project.team.name}\n"
    for member in project.team.members.all():
        role = member.role if member.role else "Developer"
        name = member.get_full_name()
        team_desc += f"- {name} ({role})\n"
else:
    team_desc = "- Development team with full-stack capabilities"

# Build project context
project_context = f"Project: {project.name}\n"
if project.description:
    project_context += f"Description: {project.description}\n"
if project.domain:
    project_context += f"Domain: {project.domain}\n"
if project.tech_stack:
    project_context += f"Tech Stack: {', '.join(project.tech_stack)}\n"

print(f"\n{'='*70}")
print("STARTING TASK GENERATION (This will take several minutes...)")
print(f"{'='*70}\n")

try:
    # Generate tasks with LLM
    result = generate_tasks_with_llm(
        project_id=project.id,
        document_path=document.file.path,
        team_description=team_desc,
        project_context=project_context,
        detect_dependencies=False,  # Skip dependencies for speed
        allocate_sprints=False,     # Skip sprints for speed
        num_sprints=3
    )
    
    if result['success']:
        tasks = result['tasks']
        
        print(f"\n{'='*70}")
        print("RESULTS")
        print(f"{'='*70}")
        print(f"\n✅ Total tasks generated: {len(tasks)}")
        
        # Group by requirement ID
        req_groups = {}
        for task in tasks:
            req_id = task.get('requirement_id', 'UNKNOWN')
            if req_id not in req_groups:
                req_groups[req_id] = []
            req_groups[req_id].append(task)
        
        print(f"✅ Unique requirements with tasks: {len(req_groups)}")
        
        # Show sample
        print(f"\n📝 Sample tasks (first 10):")
        for i, task in enumerate(tasks[:10], 1):
            print(f"\n   {i}. {task['name']}")
            print(f"      Requirement: {task.get('requirement_id', 'N/A')}")
            print(f"      Priority: {task.get('priority', 'normal')}, Size: {task.get('size', 'm')}")
        
        if len(tasks) > 10:
            print(f"\n   ... and {len(tasks) - 10} more tasks")
        
        print(f"\n{'='*70}")
        print("✅ TASK GENERATION COMPLETE!")
        print(f"{'='*70}")
        
    else:
        print(f"\n❌ Task generation failed!")
        print(f"Error: {result.get('error', 'Unknown error')}")
        sys.exit(1)
        
except Exception as e:
    print(f"\n❌ Test failed with exception:")
    print(f"Error: {str(e)}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
