from django.db import models,transaction
import uuid

from users.models import User


class Project(models.Model):
    name = models.CharField(max_length=100,blank=False)
    description = models.TextField()
    visibility = models.CharField(
        max_length=50,
        choices=[
            ('public', 'Public'),
            ('private', 'Private'),
        ],
        default='public'
    )
    team = models.ForeignKey('users.Team', on_delete=models.CASCADE, blank=True, null=True)
    created_by = models.ForeignKey('users.User', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name 
    


class FileUpload(models.Model):
    project = models.ForeignKey('Project', on_delete=models.CASCADE, blank=False)
    timeline = models.CharField(max_length=50, blank=True, null=True)
    sprintsize = models.IntegerField(blank=True, null=True)
    file = models.FileField(upload_to='project_files/', blank=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)




# Task Status choices
STATUS_CHOICES = [
    ('created', 'Created'),
    ('completed', 'Completed'),
    ('active', 'Active'),
    ('backlog', 'Backlog'),
]

# Task Priority choices
PRIORITY_CHOICES = [
    ('normal', 'Normal'),
    ('low', 'Low'),
    ('high', 'High'),
]

# Task Size (T-shirt sizing)
SIZE_CHOICES = [
    ('s', 'Small'),
    ('m', 'Medium'),
    ('l', 'Large'),
    ('xl', 'Extra Large'),
]
CREATED_BY_CHOICES = [('user', 'User'), ('ai', 'AI')]

class Task(models.Model):
    taskid = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    Project = models.ForeignKey(Project, on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    description = models.TextField()
    details = models.TextField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='created')
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='normal')
    size = models.CharField(max_length=2, choices=SIZE_CHOICES, default='m')
    
    # Related tasks (many-to-many relationship)
    related_work = models.ManyToManyField('self', blank=True, symmetrical=False)

    # User assignment (many-to-one relationship)
    assigned_to = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    
    # Comments (one-to-many relationship with another model for Comments)
    comments = models.ForeignKey('Comment', on_delete=models.CASCADE, related_name='task_comments', blank=True, null=True)
    created_by = models.CharField(max_length=10, choices=CREATED_BY_CHOICES, default='ai')
    task_number = models.CharField(max_length=255, editable=False)

    def __str__(self):
        return self.name 
    
    def save(self, *args, **kwargs):
        if not self.task_number:
            # Ensure atomicity
            with transaction.atomic():
                # Get the count of tasks for the associated project
                task_count = Task.objects.filter(Project=self.Project).count() + 1
                # Generate task number as "Project__name:task_count"
                self.task_number = f"{task_count}"
        super().save(*args, **kwargs)

class Comment(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='task_comments')
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Comment by {self.user.username} on {self.task.name}"


