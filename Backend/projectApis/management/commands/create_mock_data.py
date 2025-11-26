from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from users.models import Team, TeamMembership
from projectApis.models import Project, Task, Comment, Activity
from datetime import datetime, timedelta
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
            'jane.smith@example.com',
            'mike.johnson@example.com',
            'sarah.wilson@example.com',
            'alex.brown@example.com',
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
            # Create 5-8 tasks per project
            num_tasks = random.randint(5, 8)
            for i in range(num_tasks):
                template = task_templates[i % len(task_templates)]
                
                # Randomize some fields
                task_number = f"{project.id}-{i+1}"
                
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

        self.stdout.write(self.style.SUCCESS(f'Created {activities_created} activities'))
        self.stdout.write(self.style.SUCCESS('Mock data creation completed!'))
        self.stdout.write(self.style.WARNING('\nTest credentials:'))
        self.stdout.write(self.style.WARNING('Email: manu042kpaperwork@gmail.com'))
        self.stdout.write(self.style.WARNING('Password: password123'))

