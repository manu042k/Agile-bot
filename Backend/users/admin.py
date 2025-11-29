from django.contrib import admin
from .models import User, Team, TeamMembership, TeamInvitation, UserPreferences


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ['email', 'google_id', 'is_active', 'is_staff', 'date_joined']
    list_filter = ['is_active', 'is_staff', 'date_joined']
    search_fields = ['email', 'google_id']
    readonly_fields = ['date_joined']


@admin.register(Team)
class TeamAdmin(admin.ModelAdmin):
    list_display = ['name', 'is_archived', 'created_at']
    list_filter = ['is_archived', 'created_at']
    search_fields = ['name', 'description']


@admin.register(TeamMembership)
class TeamMembershipAdmin(admin.ModelAdmin):
    list_display = ['user', 'team', 'role', 'joined_at']
    list_filter = ['role', 'joined_at']
    search_fields = ['user__email', 'team__name']


@admin.register(TeamInvitation)
class TeamInvitationAdmin(admin.ModelAdmin):
    list_display = ['email', 'team', 'role', 'status', 'invited_by', 'created_at', 'expires_at']
    list_filter = ['status', 'role', 'created_at']
    search_fields = ['email', 'team__name', 'invited_by__email']
    readonly_fields = ['token', 'created_at', 'expires_at', 'accepted_at']


@admin.register(UserPreferences)
class UserPreferencesAdmin(admin.ModelAdmin):
    list_display = ['user', 'theme', 'language', 'timezone', 'updated_at']
    list_filter = ['theme', 'language', 'email_notifications', 'updated_at']
    search_fields = ['user__email']
    readonly_fields = ['created_at', 'updated_at']
    fieldsets = (
        ('User', {
            'fields': ('user',)
        }),
        ('Notification Preferences', {
            'fields': ('email_notifications', 'task_assignments', 'project_updates', 
                      'deadline_reminders', 'team_mentions')
        }),
        ('Appearance', {
            'fields': ('theme',)
        }),
        ('General Settings', {
            'fields': ('language', 'timezone', 'date_format')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
