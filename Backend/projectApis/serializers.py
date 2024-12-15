from users.models import User
from users.serializers import TeamSerializer, UserSerializer
from rest_framework import serializers
from .models import FileUpload, Project,Task, Comment


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
        fields = ['id','project', 'timeline', 'sprintsize', 'file', 'created_at', 'updated_at']
        extra_kwargs = {
            'timeline': {'required': False},
            'sprintsize': {'required': False},
            'file': {'required': True},
        }


class CommentSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Comment
        fields = ['id', 'user', 'content', 'created_at']

# Task Serializer
class TaskSerializer(serializers.ModelSerializer):
    comments = CommentSerializer(many=True, read_only=True)
    related_work = serializers.StringRelatedField(many=True,required=False)
    assigned_to = serializers.StringRelatedField(many=True,required=False)
    
    class Meta:
        model = Task
        fields = [
            'taskid', 'name', 'description', 'details', 'status', 'priority', 
            'size', 'assigned_to', 'comments', 'related_work', 'Project','created_by','task_number'
        ]
        

class UpdateTaskSerializer(serializers.ModelSerializer):
    comments = CommentSerializer(many=True, read_only=True)
    related_work = serializers.PrimaryKeyRelatedField(queryset=Task.objects.all(), many=True, required=False)
    assigned_to = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(),many=True, allow_null=True, required=False)
    
    class Meta:
        model = Task
        fields = [
            'taskid', 'name', 'description', 'details', 'status', 'priority', 
            'size', 'assigned_to', 'comments', 'related_work', 'Project','created_by','task_number'
        ]
        