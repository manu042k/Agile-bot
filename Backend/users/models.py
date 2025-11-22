from django.db import models
from django.contrib.auth.models import (
    AbstractBaseUser,
    BaseUserManager,
    PermissionsMixin,
)
from django.utils import timezone


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
    """Custom user model - Minimal storage, fetches user info from Google SSO"""
    
    # Essential fields for system functionality
    email = models.EmailField(unique=True, help_text="User email from Google")
    google_id = models.CharField(max_length=255, unique=True, null=True, blank=True, help_text="Google user ID for SSO authentication")
    
    # Optional fields (user can add manually if needed)
    phone_number = models.CharField(max_length=15, blank=True, null=True, help_text="Optional phone number")
    
    # System fields
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(default=timezone.now)
    
    # Note: first_name, last_name, avatar_url are fetched from Google when needed

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []  # No required fields for Google SSO

    objects = CustomUserManager()

    def __str__(self):
        return self.email


class Team(models.Model):
    """Model for creating teams"""

    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(null=True, blank=True)
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
