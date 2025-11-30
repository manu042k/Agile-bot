"""
Django management command to test LLM task generation
Usage: python manage.py test_llm_generation --project-id=1 --document-id=1
"""
from django.core.management.base import BaseCommand
from projectApis.models import Project, Document
from projectApis.llm_integration import generate_tasks_with_llm
import json


class Command(BaseCommand):
    help = 'Test LLM task generation for a project'

    def add_arguments(self, parser):
        parser.add_argument(
            '--project-id',
            type=int,
            required=True,
            help='Project ID to generate tasks for'
        )
        parser.add_argument(
            '--document-id',
            type=int,
            required=False,
            help='Document ID to use (optional, will use first document if not specified)'
        )
        parser.add_argument(
            '--detect-dependencies',
            action='store_true',
            help='Detect task dependencies'
        )
        parser.add_argument(
            '--allocate-sprints',
            action='store_true',
            help='Allocate tasks to sprints'
        )
        parser.add_argument(
            '--num-sprints',
            type=int,
            default=5,
            help='Number of sprints to create (default: 5)'
        )

    def handle(self, *args, **options):
        project_id = options['project_id']
        document_id = options.get('document_id')
        detect_dependencies = options['detect_dependencies']
        allocate_sprints = options['allocate_sprints']
        num_sprints = options['num_sprints']

        try:
            # Get project
            project = Project.objects.get(id=project_id)
            self.stdout.write(self.style.SUCCESS(f'Found project: {project.name}'))

            # Get document
            if document_id:
                document = Document.objects.get(id=document_id, project=project)
            else:
                document = Document.objects.filter(project=project).first()
                if not document:
                    self.stdout.write(self.style.ERROR('No documents found for this project'))
                    return

            self.stdout.write(self.style.SUCCESS(f'Using document: {document.name}'))
            self.stdout.write(f'Document path: {document.file.path}')

            # Build team description
            if project.team:
                team_desc = f"Team: {project.team.name}\n"
                for member in project.team.members.all():
                    team_desc += f"- {member.email}\n"
            else:
                team_desc = None

            self.stdout.write('\n' + '='*60)
            self.stdout.write('Starting LLM task generation...')
            self.stdout.write('='*60 + '\n')

            # Generate tasks
            result = generate_tasks_with_llm(
                project_id=project.id,
                document_path=document.file.path,
                team_description=team_desc,
                detect_dependencies=detect_dependencies,
                allocate_sprints=allocate_sprints,
                num_sprints=num_sprints
            )

            if not result['success']:
                self.stdout.write(self.style.ERROR(f"Generation failed: {result.get('error')}"))
                return

            # Display results
            tasks = result['tasks']
            self.stdout.write(self.style.SUCCESS(f'\n✓ Generated {len(tasks)} tasks'))
            
            self.stdout.write('\n' + '-'*60)
            self.stdout.write('TASKS:')
            self.stdout.write('-'*60)
            for i, task in enumerate(tasks, 1):
                self.stdout.write(f"\n{i}. {task['name']}")
                self.stdout.write(f"   Priority: {task['priority']} | Size: {task['size']}")
                self.stdout.write(f"   Tags: {', '.join(task.get('tags', []))}")
                self.stdout.write(f"   Description: {task['description'][:100]}...")
                if 'metadata' in task:
                    req_id = task['metadata'].get('requirement_id', 'N/A')
                    self.stdout.write(f"   Requirement: {req_id}")

            # Display dependencies
            if detect_dependencies and result['dependencies']:
                dependencies = result['dependencies']
                self.stdout.write(f'\n✓ Detected {len(dependencies)} dependencies')
                
                self.stdout.write('\n' + '-'*60)
                self.stdout.write('DEPENDENCIES:')
                self.stdout.write('-'*60)
                for dep in dependencies[:10]:  # Show first 10
                    self.stdout.write(
                        f"\n{dep['from_task_id']} → {dep['to_task_id']}"
                    )
                    self.stdout.write(
                        f"  Type: {dep['dependency_type']} | "
                        f"Strength: {dep['strength']} | "
                        f"Confidence: {dep['confidence']:.2%}"
                    )
                    self.stdout.write(f"  Reason: {dep['reasoning']}")
                
                if len(dependencies) > 10:
                    self.stdout.write(f"\n... and {len(dependencies) - 10} more dependencies")

            # Display sprint allocations
            if allocate_sprints and result['sprints']:
                sprints = result['sprints']
                self.stdout.write(f'\n✓ Created {len(sprints)} sprint allocations')
                
                self.stdout.write('\n' + '-'*60)
                self.stdout.write('SPRINT ALLOCATIONS:')
                self.stdout.write('-'*60)
                for sprint in sprints:
                    self.stdout.write(
                        f"\nSprint {sprint['sprint_number']}: "
                        f"{len(sprint['task_ids'])} tasks "
                        f"({sprint['estimated_points']:.1f} points)"
                    )
                    # Show first few tasks
                    for task_id in sprint['task_ids'][:3]:
                        # Find task name
                        task_name = next(
                            (t['name'] for t in tasks 
                             if t.get('metadata', {}).get('llm_task_id') == task_id),
                            task_id
                        )
                        self.stdout.write(f"  - {task_name}")
                    if len(sprint['task_ids']) > 3:
                        self.stdout.write(f"  ... and {len(sprint['task_ids']) - 3} more")

            self.stdout.write('\n' + '='*60)
            self.stdout.write(self.style.SUCCESS('✓ Task generation completed successfully!'))
            self.stdout.write('='*60 + '\n')

            # Save to file
            output_file = f'llm_test_project_{project_id}.json'
            with open(output_file, 'w') as f:
                json.dump(result, f, indent=2, default=str)
            
            self.stdout.write(f'Results saved to: {output_file}')

        except Project.DoesNotExist:
            self.stdout.write(self.style.ERROR(f'Project with ID {project_id} not found'))
        except Document.DoesNotExist:
            self.stdout.write(self.style.ERROR(f'Document with ID {document_id} not found'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error: {str(e)}'))
            import traceback
            traceback.print_exc()
