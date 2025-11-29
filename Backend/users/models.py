from django.db import models
from django.contrib.auth.models import (
    AbstractBaseUser,
    BaseUserManager,
    PermissionsMixin,
)
from django.utils import timezone
from django.db.models.signals import post_save
from django.dispatch import receiver


class CustomUserManager(BaseUserManager):
    """Custom user manager"""

    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("The Email field must be set")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        if password:
            user.set_password(password)
        else:
            # For Google SSO users, set unusable password
            user.set_unusable_password()
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)

        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")

        if not password:
            raise ValueError("Superuser must have a password.")
        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    """Custom user model - Stores cached Google SSO data for search and display"""
    
    # Essential fields for system functionality
    email = models.EmailField(unique=True, help_text="User email from Google")
    google_id = models.CharField(max_length=255, unique=True, null=True, blank=True, help_text="Google user ID for SSO authentication")
    
    # Cached Google data (for search and display)
    first_name = models.CharField(max_length=150, blank=True, default='', help_text="First name from Google")
    last_name = models.CharField(max_length=150, blank=True, default='', help_text="Last name from Google")
    avatar_url = models.URLField(blank=True, null=True, help_text="Profile picture URL from Google")
    
    # Track when Google data was last synced
    google_data_synced_at = models.DateTimeField(null=True, blank=True, help_text="Last time Google data was synced")
    
    # Optional fields (user can add manually if needed)
    phone_number = models.CharField(max_length=15, blank=True, null=True, help_text="Optional phone number")
    
    # System fields
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(default=timezone.now)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []  # No required fields for Google SSO

    objects = CustomUserManager()
    
    class Meta:
        indexes = [
            models.Index(fields=['first_name', 'last_name']),
            models.Index(fields=['email']),
            models.Index(fields=['google_id']),
        ]

    def __str__(self):
        return self.get_full_name() or self.email
    
    def get_full_name(self):
        """Return full name for display"""
        full_name = f"{self.first_name} {self.last_name}".strip()
        return full_name if full_name else self.email.split('@')[0]
    
    def get_short_name(self):
        """Return first name or email username"""
        return self.first_name or self.email.split('@')[0]
    
    def needs_google_sync(self):
        """Check if Google data needs refresh (older than 7 days)"""
        if not self.google_data_synced_at:
            return True
        days_since_sync = (timezone.now() - self.google_data_synced_at).days
        return days_since_sync > 7


class Team(models.Model):
    """Model for creating teams"""

    name = models.CharField(max_length=100)
    description = models.TextField(null=True, blank=True)
    is_archived = models.BooleanField(default=False)
    members = models.ManyToManyField(
        User, related_name="teams", through="TeamMembership"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


class TeamMembership(models.Model):
    """Through model for user-team relationships with roles"""

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    team = models.ForeignKey(Team, on_delete=models.CASCADE)
    role = models.CharField(
        max_length=50,
        choices=[
            ("member", "Member"),
            ("admin", "Admin"),
            ("owner", "Owner"),
            ("developer", "Developer"),
        ],
        default="member",
    )
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "team")
        ordering = ["joined_at"]

    def __str__(self):
        return f"{self.user.email} - {self.team.name} ({self.role})"


class TeamInvitation(models.Model):
    """Model for team invitations sent via email"""
    
    team = models.ForeignKey(Team, on_delete=models.CASCADE, related_name='invitations')
    email = models.EmailField(help_text="Email address of the invited user")
    role = models.CharField(
        max_length=50,
        choices=[
            ("member", "Member"),
            ("admin", "Admin"),
            ("owner", "Owner"),
            ("developer", "Developer"),
        ],
        default="member",
    )
    invited_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_invitations')
    token = models.CharField(max_length=64, unique=True, help_text="Unique token for invitation acceptance")
    status = models.CharField(
        max_length=20,
        choices=[
            ("pending", "Pending"),
            ("accepted", "Accepted"),
            ("expired", "Expired"),
            ("cancelled", "Cancelled"),
        ],
        default="pending",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(help_text="Invitation expiration time (7 days from creation)")
    accepted_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        # Allow multiple invitations per email/team, but only one pending at a time
        # Remove unique_together to allow multiple invitations (expired ones can coexist)
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=['token']),
            models.Index(fields=['email', 'status']),
            models.Index(fields=['team', 'email', 'status']),
        ]
    
    def __str__(self):
        return f"Invitation to {self.email} for {self.team.name} ({self.status})"
    
    def is_expired(self):
        """Check if invitation has expired"""
        return timezone.now() > self.expires_at
    
    def save(self, *args, **kwargs):
        """Set expiration date if not already set"""
        if not self.expires_at:
            from datetime import timedelta
            self.expires_at = timezone.now() + timedelta(days=7)
        super().save(*args, **kwargs)



class UserPreferences(models.Model):
    """Model for storing user preferences and settings"""
    
    user = models.OneToOneField(
        User,
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


@receiver(post_save, sender=User)
def create_user_preferences(sender, instance, created, **kwargs):
    """Automatically create preferences when a new user is created"""
    if created:
        UserPreferences.objects.create(user=instance)


@receiver(post_save, sender=User)
def save_user_preferences(sender, instance, **kwargs):
    """Save preferences when user is saved"""
    if hasattr(instance, 'preferences'):
        instance.preferences.save()
