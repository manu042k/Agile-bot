from dj_rest_auth.registration.serializers import SocialLoginSerializer
from social_django.utils import psa
from rest_framework import serializers
from .models import AgileBotUser, Team
from django.contrib.auth import get_user_model

class GoogleLoginSerializer(SocialLoginSerializer):
    def validate(self, data):
        """Override to create or get user based on Google OAuth response."""
        user = super().validate(data)
        
        # You can add extra logic here to assign company name or other fields
        if not user.company_name:
            user.company_name = data.get('company_name', 'Default Company')
            user.save()
        return user


class AddTeamMemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = get_user_model()
        fields = ['id', 'username', 'email', 'company_name']

class CreateTeamSerializer(serializers.ModelSerializer):
    members = AddTeamMemberSerializer(many=True)

    class Meta:
        model = Team
        fields = ['name', 'company', 'members']
