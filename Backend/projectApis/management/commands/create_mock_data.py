from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from users.models import Team, TeamMembership
from projectApis.models import Project, Task, Comment, Activity, Sprint
from datetime import datetime, timedelta
from django.utils import timezone
import random

User = get_user_model()

class Command(BaseCommand):
    help = 'Creates mock data for testing'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.SUCCESS('Creating mock data...'))

        # Create users
        users = []
        user_emails = [
            'manu042kpaperwork@gmail.com',
            'manu04kus@gmail.com',
            'jane.smith@example.com',
            'mike.johnson@example.com',
            'sarah.wilson@example.com',
        ]

        for email in user_emails:
            user, created = User.objects.get_or_create(
                email=email,
                defaults={
                    'phone_number': f'+1234567{random.randint(100, 999)}',
                    'is_active': True,
                }
            )
            if created:
                user.set_password('password123')
                user.save()
                self.stdout.write(self.style.SUCCESS(f'Created user: {email}'))
            users.append(user)

        # Create teams
        team_names = [
            ('Engineering Team', 'Core development team'),
            ('Design Team', 'UI/UX design team'),
            ('Product Team', 'Product management team'),
        ]

        teams = []
        for name, description in team_names:
            team, created = Team.objects.get_or_create(
                name=name,
                defaults={'description': description}
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'Created team: {name}'))
            
            # Add members to team
            for i, user in enumerate(users[:3]):
                role = 'owner' if i == 0 else 'admin' if i == 1 else 'member'
                TeamMembership.objects.get_or_create(
                    team=team,
                    user=user,
                    defaults={'role': role}
                )
            
            teams.append(team)

        # Create projects
        project_data = [
            {
                'name': 'E-Commerce Platform',
                'description': 'Build a modern e-commerce platform with React and Node.js. Includes user authentication, product catalog, shopping cart, and payment integration.',
                'visibility': 'public',
            },
            {
                'name': 'Mobile Banking App',
                'description': 'Develop a secure mobile banking application with biometric authentication, transaction history, and bill payment features.',
                'visibility': 'public',
            },
            {
                'name': 'AI Analytics Dashboard',
                'description': 'Create an analytics dashboard with AI-powered insights, real-time data visualization, and customizable reports.',
                'visibility': 'private',
            },
            {
                'name': 'Content Management System',
                'description': 'Build a headless CMS with RESTful API, content versioning, and multi-language support.',
                'visibility': 'public',
            },
        ]

        projects = []
        for i, proj_data in enumerate(project_data):
            project, created = Project.objects.get_or_create(
                name=proj_data['name'],
                defaults={
                    'description': proj_data['description'],
                    'visibility': proj_data['visibility'],
                    'team': teams[i % len(teams)],
                    'created_by': users[0],
                }
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'Created project: {proj_data["name"]}'))
            projects.append(project)

        # Create sprints for each project
        sprints_created = 0
        all_sprints = []
        for project in projects:
            # Create 2-3 sprints per project
            num_sprints = random.randint(2, 3)
            for i in range(num_sprints):
                start_date = timezone.now() - timedelta(days=random.randint(0, 30))
                duration_days = random.choice([7, 14, 21])  # 1, 2, or 3 weeks
                end_date = start_date + timedelta(days=duration_days)
                
                # Determine sprint status based on dates
                now = timezone.now()
                if end_date < now:
                    status = 'completed'
                elif start_date <= now <= end_date:
                    status = 'active'
                else:
                    status = 'planning'
                
                sprint_names = [
                    f'Sprint {i+1} - Initial Setup',
                    f'Sprint {i+1} - Core Features',
                    f'Sprint {i+1} - Polish & Testing',
                    f'Sprint {i+1} - MVP Release',
                ]
                
                sprint, created = Sprint.objects.get_or_create(
                    name=sprint_names[i % len(sprint_names)],
                    project=project,
                    defaults={
                        'goal': f'Complete key features for {project.name}',
                        'start_date': start_date,
                        'end_date': end_date,
                        'status': status,
                        'created_by': users[0],
                    }
                )
                if created:
                    sprints_created += 1
                    all_sprints.append(sprint)
        
        self.stdout.write(self.style.SUCCESS(f'Created {sprints_created} sprints'))

        # Create tasks
        task_templates = [
            {
                'name': 'Implement user authentication',
                'description': 'Set up JWT authentication with refresh tokens',
                'details': 'Add login, register, and token refresh endpoints',
                'status': 'active',
                'priority': 'high',
                'size': 'l',
            },
            {
                'name': 'Design product catalog UI',
                'description': 'Create responsive product listing page',
                'details': 'Design and implement product cards with filters',
                'status': 'created',
                'priority': 'normal',
                'size': 'm',
            },
            {
                'name': 'Set up shopping cart functionality',
                'description': 'Implement cart state management and API',
                'details': 'Add to cart, remove from cart, update quantity',
                'status': 'created',
                'priority': 'high',
                'size': 'l',
            },
            {
                'name': 'Payment integration',
                'description': 'Integrate Stripe payment gateway',
                'details': 'Setup Stripe SDK and payment processing',
                'status': 'backlog',
                'priority': 'high',
                'size': 'xl',
            },
            {
                'name': 'Write API documentation',
                'description': 'Document all REST API endpoints',
                'details': 'Use Swagger/OpenAPI for documentation',
                'status': 'completed',
                'priority': 'low',
                'size': 's',
            },
            {
                'name': 'Database schema design',
                'description': 'Design and implement database schema',
                'details': 'Create ER diagrams and migrations',
                'status': 'completed',
                'priority': 'high',
                'size': 'm',
            },
            {
                'name': 'User profile page',
                'description': 'Create user profile page with edit functionality',
                'details': 'Allow users to update their profile information',
                'status': 'active',
                'priority': 'normal',
                'size': 'm',
            },
            {
                'name': 'Email notifications',
                'description': 'Set up email notification system',
                'details': 'Configure SMTP and email templates',
                'status': 'backlog',
                'priority': 'low',
                'size': 'm',
            },
        ]

        tasks_created = 0
        for project in projects:
            # Get sprints for this project
            project_sprints = [s for s in all_sprints if s.project == project]
            
            # Create 5-8 tasks per project
            num_tasks = random.randint(5, 8)
            for i in range(num_tasks):
                template = task_templates[i % len(task_templates)]
                
                # Randomize some fields
                task_number = f"{project.id}-{i+1}"
                
                # Assign task to a sprint (70% chance)
                sprint = None
                if project_sprints and random.random() < 0.7:
                    sprint = random.choice(project_sprints)
                
                task, created = Task.objects.get_or_create(
                    name=f"{template['name']} - {project.name}",
                    Project=project,
                    defaults={
                        'description': template['description'],
                        'details': template['details'],
                        'status': template['status'],
                        'priority': template['priority'],
                        'size': template['size'],
                        'created_by': 'ai',
                        'task_number': task_number,
                        'sprint': sprint,
                    }
                )
                
                if created:
                    # Assign random users to task
                    task.assigned_to.set(random.sample(users, random.randint(1, 2)))
                    
                    # Create some comments for completed/active tasks
                    if task.status in ['completed', 'active']:
                        for j in range(random.randint(1, 3)):
                            Comment.objects.get_or_create(
                                task=task,
                                user=random.choice(users),
                                defaults={
                                    'content': f'Comment {j+1} on {task.name}'
                                }
                            )
                    
                    tasks_created += 1

        self.stdout.write(self.style.SUCCESS(f'Created {tasks_created} tasks'))

        # Create some activities
        activities_created = 0
        for project in projects:
            # Project created activity
            Activity.objects.get_or_create(
                user=project.created_by,
                activity_type='project_created',
                project=project,
                defaults={
                    'description': f'Created project {project.name}',
                    'target_name': project.name,
                }
            )
            activities_created += 1

            # Task activities
            for task in Task.objects.filter(Project=str(project.id))[:3]:
                Activity.objects.get_or_create(
                    user=users[0],
                    activity_type='task_created',
                    project=project,
                    task=task,
                    defaults={
                        'description': f'Created task {task.name}',
                        'target_name': task.name,
                    }
                )
                activities_created += 1
            
            # Sprint activities
            project_sprints = Sprint.objects.filter(project=project)
            for sprint in project_sprints[:2]:
                Activity.objects.get_or_create(
                    user=users[0],
                    activity_type='sprint_created',
                    project=project,
                    defaults={
                        'description': f'Created sprint {sprint.name}',
                        'target_name': sprint.name,
                    }
                )
                activities_created += 1

        self.stdout.write(self.style.SUCCESS(f'Created {activities_created} activities'))
        self.stdout.write(self.style.SUCCESS('Mock data creation completed!'))
        self.stdout.write(self.style.WARNING('\nTest credentials:'))
        self.stdout.write(self.style.WARNING('Email: manu042kpaperwork@gmail.com or manu04kus@gmail.com'))
        self.stdout.write(self.style.WARNING('Password: password123'))

