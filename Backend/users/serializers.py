from rest_framework import serializers
from .models import Team, TeamMembership, User
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer


class UserSerializer(serializers.ModelSerializer):
    """Serializer for User objects - includes cached Google data from database"""
    
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "first_name",
            "last_name",
            "full_name",
            "phone_number",
            "avatar_url",
            "google_id",
            "is_active",
            "date_joined",
        ]
        read_only_fields = ["id", "is_active", "date_joined", "google_id"]
    
    def get_full_name(self, obj):
        """Get full name from database"""
        return obj.get_full_name()


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Serializer for JWT authentication."""

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        token["user_name"] = user.first_name + " " + user.last_name
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        data["user_id"] = self.user.id
        data["user_name"] = self.user.first_name + " " + self.user.last_name
        return data


class TeamMembershipSerializer(serializers.ModelSerializer):
    """Serializer for team membership details"""

    user = UserSerializer(read_only=True)

    class Meta:
        model = TeamMembership
        fields = ["user", "role", "joined_at"]


class TeamSerializer(serializers.ModelSerializer):
    """Serializer for team details"""

    members = TeamMembershipSerializer(
        source="teammembership_set", many=True, read_only=True
    )

    class Meta:
        model = Team
        fields = ["id", "name", "description", "is_archived", "members", "created_at", "updated_at"]


class AddTeamMemberSerializer(serializers.Serializer):
    """Serializer for adding team members"""

    user_email = serializers.EmailField()
    role = serializers.ChoiceField(
        choices=TeamMembership._meta.get_field("role").choices
    )

    def validate_user_email(self, value):
        # Note: User existence check removed - use invitation endpoint for new users
        return value



class UserPreferencesSerializer(serializers.ModelSerializer):
    """Serializer for UserPreferences"""
    
    class Meta:
        from .models import UserPreferences
        model = UserPreferences
        fields = [
            'id',
            'email_notifications',
            'task_assignments',
            'project_updates',
            'deadline_reminders',
            'team_mentions',
            'theme',
            'language',
            'timezone',
            'date_format',
            'updated_at',
        ]
        read_only_fields = ['id', 'updated_at']
