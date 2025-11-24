from rest_framework import serializers
from .models import Team, TeamMembership, User
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer


class UserSerializer(serializers.ModelSerializer):
    """Serializer for User objects - includes Google info when available"""
    
    # These fields are computed from Google, not stored in DB
    first_name = serializers.SerializerMethodField()
    last_name = serializers.SerializerMethodField()
    avatar_url = serializers.SerializerMethodField()
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
        read_only_fields = ["id", "is_active", "date_joined", "google_id", "first_name", "last_name", "avatar_url", "full_name"]
    
    def get_first_name(self, obj):
        """Get first name from Google info in context or session"""
        request = self.context.get('request')
        if request:
            google_info = request.session.get('google_user_info', {})
            return google_info.get('first_name', '')
        return ''
    
    def get_last_name(self, obj):
        """Get last name from Google info in context or session"""
        request = self.context.get('request')
        if request:
            google_info = request.session.get('google_user_info', {})
            return google_info.get('last_name', '')
        return ''
    
    def get_avatar_url(self, obj):
        """Get avatar URL from Google info in context or session"""
        request = self.context.get('request')
        if request:
            google_info = request.session.get('google_user_info', {})
            return google_info.get('avatar_url', '')
        return ''
    
    def get_full_name(self, obj):
        """Get full name from Google info"""
        request = self.context.get('request')
        if request:
            google_info = request.session.get('google_user_info', {})
            first = google_info.get('first_name', '')
            last = google_info.get('last_name', '')
            return f"{first} {last}".strip() or obj.email
        return obj.email


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
        fields = ["id", "name", "description", "members", "created_at", "updated_at"]


class AddTeamMemberSerializer(serializers.Serializer):
    """Serializer for adding team members"""

    user_email = serializers.EmailField()
    role = serializers.ChoiceField(
        choices=TeamMembership._meta.get_field("role").choices
    )

    def validate_user_email(self, value):
        # Note: User existence check removed - use invitation endpoint for new users
        return value
