from users.serializers import TeamSerializer, UserSerializer
from rest_framework import serializers
from .models import Project


class ProjectDetailSerializer(serializers.ModelSerializer):
    """ Serializer for detailed project information """
    team = TeamSerializer(read_only=True)
    created_by = UserSerializer(read_only=True)
        
    class Meta:
        model = Project
        fields = ['name', 'description', 'visibility', 'team', 'created_by', 'created_at', 'updated_at']