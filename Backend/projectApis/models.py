from django.db import models, transaction
import uuid
import os
import re

from users.models import User


class Project(models.Model):
    name = models.CharField(max_length=100, blank=False)
    description = models.TextField()
    visibility = models.CharField(
        max_length=50,
        choices=[
            ("public", "Public"),
            ("private", "Private"),
        ],
        default="public",
    )
    team = models.ForeignKey(
        "users.Team", on_delete=models.CASCADE, blank=True, null=True
    )
    created_by = models.ForeignKey("users.User", on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


def document_upload_path(instance, filename):
    """
    Generate upload path for documents: project_documents/<project_name>/<filename>
    Sanitizes project name to be filesystem-safe.
    """
    # Get project name - project should always be set when saving
    if instance.project and hasattr(instance.project, 'name'):
        project_name = instance.project.name
    else:
        # Fallback if project is not available (shouldn't happen in normal flow)
        project_name = "unknown"
    
    # Sanitize project name for filesystem
    # Remove special characters, replace spaces and multiple dashes/underscores with single underscore
    sanitized_name = re.sub(r'[^\w\s-]', '', project_name)
    sanitized_name = re.sub(r'[-\s]+', '_', sanitized_name)
    sanitized_name = sanitized_name.strip('_')
    
    # If sanitized name is empty, use a default
    if not sanitized_name:
        sanitized_name = "project"
    
    # Return the path: project_documents/<sanitized_project_name>/<filename>
    return os.path.join('project_documents', sanitized_name, filename)


class FileUpload(models.Model):
    project = models.ForeignKey("Project", on_delete=models.CASCADE, blank=False)
    timeline = models.CharField(max_length=50, blank=True, null=True)
    sprintsize = models.IntegerField(blank=True, null=True)
    file = models.FileField(upload_to="project_files/", blank=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class Document(models.Model):
    """Model for storing multiple documents per project"""
    project = models.ForeignKey("Project", on_delete=models.CASCADE, related_name="documents")
    file = models.FileField(upload_to=document_upload_path, blank=False)
    name = models.CharField(max_length=255, blank=True)  # Original filename
    category = models.CharField(max_length=100, blank=True, null=True)
    uploaded_by = models.ForeignKey("users.User", on_delete=models.SET_NULL, null=True, related_name="uploaded_documents")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["project", "-created_at"]),
        ]

    def __str__(self):
        return f"{self.name} - {self.project.name}"

    def save(self, *args, **kwargs):
        if not self.name and self.file:
            self.name = self.file.name
        super().save(*args, **kwargs)


# Task Status choices
STATUS_CHOICES = [
    ("created", "Created"),
    ("completed", "Completed"),
    ("active", "Active"),
    ("backlog", "Backlog"),
]

# Task Priority choices
PRIORITY_CHOICES = [
    ("normal", "Normal"),
    ("low", "Low"),
    ("high", "High"),
]

# Task Size (T-shirt sizing)
SIZE_CHOICES = [
    ("s", "Small"),
    ("m", "Medium"),
    ("l", "Large"),
    ("xl", "Extra Large"),
]
CREATED_BY_CHOICES = [("user", "User"), ("ai", "AI")]


class Task(models.Model):
    taskid = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    Project = models.ForeignKey(Project, on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    description = models.TextField()
    details = models.TextField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="created")
    priority = models.CharField(
        max_length=10, choices=PRIORITY_CHOICES, default="normal"
    )
    size = models.CharField(max_length=2, choices=SIZE_CHOICES, default="m")

    # Related tasks (many-to-many relationship)
    related_work = models.ManyToManyField("self", blank=True, symmetrical=False)

    # User assignment (many-to-one relationship)
    assigned_to = models.ManyToManyField(User, null=True, blank=True)

    # Comments (one-to-many relationship with another model for Comments)
    comments = models.ForeignKey(
        "Comment",
        on_delete=models.CASCADE,
        related_name="task_comments",
        blank=True,
        null=True,
    )
    created_by = models.CharField(
        max_length=10, choices=CREATED_BY_CHOICES, default="ai"
    )
    task_number = models.CharField(max_length=255, editable=False)

    def __str__(self):
        return self.task_number

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
    task = models.ForeignKey(
        Task, on_delete=models.CASCADE, related_name="task_comments"
    )
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Comment by {self.user.username} on {self.task.name}"


# Activity Type choices
ACTIVITY_TYPE_CHOICES = [
    ("task_created", "Task Created"),
    ("task_updated", "Task Updated"),
    ("task_completed", "Task Completed"),
    ("task_assigned", "Task Assigned"),
    ("task_deleted", "Task Deleted"),
    ("comment_added", "Comment Added"),
    ("project_created", "Project Created"),
    ("project_updated", "Project Updated"),
    ("project_deleted", "Project Deleted"),
    ("document_uploaded", "Document Uploaded"),
    ("member_added", "Member Added"),
    ("member_removed", "Member Removed"),
    ("team_created", "Team Created"),
    ("team_updated", "Team Updated"),
]


class Activity(models.Model):
    """Model to track all activities across the application"""
    
    id = models.AutoField(primary_key=True)
    activity_type = models.CharField(
        max_length=50, choices=ACTIVITY_TYPE_CHOICES, db_index=True
    )
    
    # User who performed the action
    user = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, related_name="activities"
    )
    
    # Related objects (optional, depending on activity type)
    project = models.ForeignKey(
        Project, on_delete=models.CASCADE, null=True, blank=True, related_name="activities"
    )
    task = models.ForeignKey(
        Task, on_delete=models.CASCADE, null=True, blank=True, related_name="activities"
    )
    
    # Activity details
    description = models.TextField(help_text="Human-readable description of the activity")
    target_name = models.CharField(max_length=255, help_text="Name of the target object")
    
    # Metadata
    metadata = models.JSONField(
        null=True, blank=True, help_text="Additional data about the activity"
    )
    
    # Timestamp
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    
    class Meta:
        ordering = ["-created_at"]
        verbose_name_plural = "Activities"
        indexes = [
            models.Index(fields=["-created_at"]),
            models.Index(fields=["activity_type", "-created_at"]),
            models.Index(fields=["user", "-created_at"]),
            models.Index(fields=["project", "-created_at"]),
        ]
    
    def __str__(self):
        return f"{self.user} - {self.activity_type} - {self.target_name}"
