from rest_framework import serializers
from .models import Team, TeamMembership, User
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer


class UserSerializer(serializers.ModelSerializer):
    """Serializer for User objects"""
    password = serializers.CharField(write_only=True, required=True, min_length=8, style={'input_type': 'password'})

    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name', 'phone_number',
            'profile_pic', 'password', 'is_active'
        ]

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Serializer for JWT authentication."""
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        
        token['user_name'] = user.first_name + " " + user.last_name
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        data['user_id'] = self.user.id 
        data['user_name'] = self.user.first_name + " " + self.user.last_name
        return data     
    


class TeamMembershipSerializer(serializers.ModelSerializer):
    """ Serializer for team membership details """
    user = UserSerializer(read_only=True)

    class Meta:
        model = TeamMembership
        fields = ['user', 'role', 'joined_at']


class TeamSerializer(serializers.ModelSerializer):
    """ Serializer for team details """
    members = TeamMembershipSerializer(source='teammembership_set', many=True, read_only=True)

    class Meta:
        model = Team
        fields = ['id', 'name', 'description', 'members', 'created_at', 'updated_at']


class AddTeamMemberSerializer(serializers.Serializer):
    """ Serializer for adding team members """
    user_email = serializers.EmailField()
    role = serializers.ChoiceField(choices=TeamMembership._meta.get_field('role').choices)

    def validate_user_email(self, value):
        user = User
        if not user.objects.filter(email=value).exists():
            raise serializers.ValidationError("User with this email does not exist.")
        return value
