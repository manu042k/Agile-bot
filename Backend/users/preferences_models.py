from django.db import models
from django.conf import settings


class UserPreferences(models.Model):
    """Model for storing user preferences and settings"""
    
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='preferences'
    )
    
    # Notification preferences
    email_notifications = models.BooleanField(default=True, help_text="Receive email notifications")
    task_assignments = models.BooleanField(default=True, help_text="Notify on task assignments")
    project_updates = models.BooleanField(default=True, help_text="Notify on project updates")
    deadline_reminders = models.BooleanField(default=True, help_text="Receive deadline reminders")
    team_mentions = models.BooleanField(default=True, help_text="Notify when mentioned in comments")
    
    # Appearance preferences
    theme = models.CharField(
        max_length=20,
        choices=[
            ('light', 'Light'),
            ('dark', 'Dark'),
            ('system', 'System'),
        ],
        default='light'
    )
    
    # General preferences
    language = models.CharField(
        max_length=10,
        choices=[
            ('en', 'English'),
            ('es', 'Spanish'),
            ('fr', 'French'),
        ],
        default='en'
    )
    timezone = models.CharField(
        max_length=50,
        default='UTC',
        help_text="User's timezone"
    )
    date_format = models.CharField(
        max_length=20,
        choices=[
            ('MM/DD/YYYY', 'MM/DD/YYYY'),
            ('DD/MM/YYYY', 'DD/MM/YYYY'),
            ('YYYY-MM-DD', 'YYYY-MM-DD'),
        ],
        default='MM/DD/YYYY'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'User Preferences'
        verbose_name_plural = 'User Preferences'
    
    def __str__(self):
        return f"Preferences for {self.user.email}"
