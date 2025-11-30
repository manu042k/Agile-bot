from users.models import User
from users.serializers import TeamSerializer, UserSerializer
from rest_framework import serializers
from .models import FileUpload, Project, Task, Comment, Activity, Document, Sprint


class ProjectDetailSerializer(serializers.ModelSerializer):
    """Serializer for detailed project information"""

    team = TeamSerializer(read_only=True)
    created_by = UserSerializer(read_only=True)

    class Meta:
        model = Project
        fields = [
            "id",
            "uuid",
            "name",
            "description",
            "visibility",
            "team",
            "created_by",
            "domain",
            "tech_stack",
            "deadline",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "uuid"]


class FileUploadSerializer(serializers.ModelSerializer):
    class Meta:
        model = FileUpload
        fields = [
            "id",
            "project",
            "timeline",
            "sprintsize",
            "file",
            "created_at",
            "updated_at",
        ]
        extra_kwargs = {
            "timeline": {"required": False},
            "sprintsize": {"required": False},
            "file": {"required": True},
        }


class DocumentSerializer(serializers.ModelSerializer):
    uploaded_by = UserSerializer(read_only=True)
    uploaded_by_email = serializers.EmailField(source='uploaded_by.email', read_only=True)
    project_name = serializers.CharField(source='project.name', read_only=True)
    file_size = serializers.SerializerMethodField()
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = Document
        fields = [
            "id",
            "uuid",
            "project",
            "project_name",
            "file",
            "file_url",
            "name",
            "category",
            "uploaded_by",
            "uploaded_by_email",
            "file_size",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "uuid", "uploaded_by", "created_at", "updated_at"]
        extra_kwargs = {
            "name": {"required": False},
            "category": {"required": False},
        }

    def get_file_size(self, obj):
        if obj.file:
            try:
                return obj.file.size
            except:
                return None
        return None

    def get_file_url(self, obj):
        if obj.file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.file.url)
            return obj.file.url
        return None


class CommentSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Comment
        fields = ["id", "user", "content", "created_at"]


# Task Serializer
class TaskSerializer(serializers.ModelSerializer):
    comments = serializers.SerializerMethodField()
    related_work = serializers.SerializerMethodField()
    assigned_to = serializers.SerializerMethodField()
    assigned_to_ids = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), many=True, required=False, write_only=True, source='assigned_to'
    )
    
    def to_internal_value(self, data):
        # Map 'assigned_to' to 'assigned_to_ids' for writing
        if 'assigned_to' in data and 'assigned_to_ids' not in data:
            data['assigned_to_ids'] = data.pop('assigned_to')
        return super().to_internal_value(data)
    related_work_ids = serializers.SerializerMethodField()

    class Meta:
        model = Task
        fields = [
            "taskid",
            "name",
            "description",
            "details",
            "status",
            "priority",
            "size",
            "assigned_to",
            "assigned_to_ids",
            "comments",
            "related_work",
            "related_work_ids",
            "Project",
            "created_by",
            "task_number",
            "sprint",
            "tags",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["taskid", "task_number", "created_at", "updated_at", "assigned_to"]

    def get_related_work(self, obj):
        """Return related work tasks with basic info"""
        related_tasks = obj.related_work.all()
        return [
            {
                "taskid": str(task.taskid),
                "name": task.name,
                "status": task.status,
                "task_number": task.task_number,
            }
            for task in related_tasks
        ]

    def get_related_work_ids(self, obj):
        """Return list of related work task IDs"""
        return [str(task.taskid) for task in obj.related_work.all()]

    def get_assigned_to(self, obj):
        """Return assigned users with email info"""
        assigned_users = obj.assigned_to.all()
        return [
            {
                "id": user.id,
                "email": user.email,
                "username": user.email.split('@')[0] if user.email else "Unknown",
                "first_name": "",  # Not stored in DB, fetched from Google dynamically
                "last_name": "",   # Not stored in DB, fetched from Google dynamically
            }
            for user in assigned_users
        ]
    
    def get_comments(self, obj):
        """Return comments for the task"""
        comments = obj.task_comments.all()
        return CommentSerializer(comments, many=True).data
    
    def create(self, validated_data):
        """Override create to handle many-to-many relationships"""
        assigned_to = validated_data.pop('assigned_to', [])
        task = Task.objects.create(**validated_data)
        if assigned_to:
            task.assigned_to.set(assigned_to)
        return task
    
    def update(self, instance, validated_data):
        """Override update to handle many-to-many relationships"""
        assigned_to = validated_data.pop('assigned_to', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if assigned_to is not None:
            instance.assigned_to.set(assigned_to)
        return instance


class UpdateTaskSerializer(serializers.ModelSerializer):
    comments = CommentSerializer(many=True, read_only=True)
    related_work = serializers.PrimaryKeyRelatedField(
        queryset=Task.objects.all(), many=True, required=False
    )
    assigned_to = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), many=True, allow_null=True, required=False
    )

    class Meta:
        model = Task
        fields = [
            "taskid",
            "name",
            "description",
            "details",
            "status",
            "priority",
            "size",
            "assigned_to",
            "comments",
            "related_work",
            "Project",
            "created_by",
            "task_number",
            "sprint",
            "tags",
        ]
    
    def update(self, instance, validated_data):
        """Override update to handle many-to-many relationships"""
        assigned_to = validated_data.pop('assigned_to', None)
        related_work = validated_data.pop('related_work', None)
        
        # Update regular fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Update many-to-many fields
        if assigned_to is not None:
            instance.assigned_to.set(assigned_to)
        if related_work is not None:
            instance.related_work.set(related_work)
        
        return instance


class ActivitySerializer(serializers.ModelSerializer):
    """Serializer for Activity model"""
    
    user = UserSerializer(read_only=True)
    user_email = serializers.EmailField(source='user.email', read_only=True)
    project_name = serializers.CharField(source='project.name', read_only=True, allow_null=True)
    task_number = serializers.CharField(source='task.task_number', read_only=True, allow_null=True)
    
    class Meta:
        model = Activity
        fields = [
            "id",
            "activity_type",
            "user",
            "user_email",
            "project",
            "project_name",
            "task",
            "task_number",
            "description",
            "target_name",
            "metadata",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]


class SprintSerializer(serializers.ModelSerializer):
    """Serializer for Sprint model"""
    created_by = UserSerializer(read_only=True)
    task_count = serializers.SerializerMethodField()
    completed_task_count = serializers.SerializerMethodField()
    project = serializers.PrimaryKeyRelatedField(read_only=True)
    auto_status = serializers.SerializerMethodField()
    
    class Meta:
        model = Sprint
        fields = [
            "id",
            "uuid",
            "project",
            "name",
            "description",
            "start_date",
            "end_date",
            "status",
            "auto_status",
            "goal",
            "created_by",
            "created_at",
            "updated_at",
            "task_count",
            "completed_task_count",
        ]
        read_only_fields = ["id", "uuid", "created_by", "created_at", "updated_at", "project"]
        extra_kwargs = {
            "description": {"required": False, "allow_blank": True},
            "goal": {"required": False, "allow_blank": True},
            "name": {"required": True},
            "start_date": {"required": True},
            "end_date": {"required": True},
            "status": {"required": False},  # Status can be auto-detected
        }
    
    def get_task_count(self, obj):
        """Get total number of tasks in sprint"""
        return obj.tasks.count()
    
    def get_completed_task_count(self, obj):
        """Get number of completed tasks in sprint"""
        return obj.tasks.filter(status='completed').count()
    
    def get_auto_status(self, obj):
        """Get auto-detected status based on dates"""
        return obj.get_auto_status()
    
    def validate(self, data):
        """Validate sprint data including date overlap"""
        start_date = data.get('start_date')
        end_date = data.get('end_date')
        
        # Set default status if not provided (will be auto-detected later)
        if 'status' not in data:
            data['status'] = 'planning'  # Default, will be auto-detected in save()
        
        # Get project from context (set in view) or from instance
        project = None
        if self.instance:
            project = self.instance.project
        elif hasattr(self, 'context') and self.context and 'project' in self.context:
            project = self.context.get('project')
        
        # Validate date range
        if start_date and end_date:
            if end_date <= start_date:
                raise serializers.ValidationError({
                    'end_date': 'End date must be after start date.'
                })
            
            # Check for overlapping sprints (excluding cancelled sprints and current sprint if updating)
            if project:
                overlapping_sprints = Sprint.objects.filter(
                    project=project
                ).exclude(status='cancelled')  # Exclude cancelled sprints
                
                # Exclude current sprint if updating
                if self.instance and self.instance.pk:
                    overlapping_sprints = overlapping_sprints.exclude(id=self.instance.id)
                
                # Check for overlap: new sprint overlaps if:
                # - new start is between existing start and end, OR
                # - new end is between existing start and end, OR
                # - new sprint completely contains an existing sprint, OR
                # - existing sprint completely contains new sprint
                for existing_sprint in overlapping_sprints:
                    if not (end_date < existing_sprint.start_date or start_date > existing_sprint.end_date):
                        raise serializers.ValidationError({
                            'start_date': f'Sprint dates overlap with existing sprint "{existing_sprint.name}" '
                                        f'({existing_sprint.start_date.strftime("%Y-%m-%d")} to '
                                        f'{existing_sprint.end_date.strftime("%Y-%m-%d")}). '
                                        f'Please choose different dates.',
                            'end_date': f'Sprint dates overlap with existing sprint "{existing_sprint.name}" '
                                       f'({existing_sprint.start_date.strftime("%Y-%m-%d")} to '
                                       f'{existing_sprint.end_date.strftime("%Y-%m-%d")}). '
                                       f'Please choose different dates.'
                        })
        
        return data
