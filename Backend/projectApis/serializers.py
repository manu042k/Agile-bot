from users.serializers import TeamSerializer, UserSerializer
from rest_framework import serializers
from .models import FileUpload, Project


class ProjectDetailSerializer(serializers.ModelSerializer):
    """ Serializer for detailed project information """
    team = TeamSerializer(read_only=True)
    created_by = UserSerializer(read_only=True)
        
    class Meta:
        model = Project
        fields = ['id','name', 'description', 'visibility', 'team', 'created_by', 'created_at', 'updated_at']





class FileUploadSerializer(serializers.ModelSerializer):
    class Meta:
        model = FileUpload
        fields = ['project', 'timeline', 'sprintsize', 'file', 'created_at', 'updated_at']
        extra_kwargs = {
            'timeline': {'required': False},
            'sprintsize': {'required': False},
            'file': {'required': True},
        }