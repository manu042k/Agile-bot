import json
import logging
from django.utils.deprecation import MiddlewareMixin
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from .models import Activity, Project, Task
from users.models import Team, TeamMembership

logger = logging.getLogger(__name__)


class ActivityTrackingMiddleware(MiddlewareMixin):
    """
    Middleware to track user activities and broadcast via WebSocket
    """

    def __init__(self, get_response):
        self.get_response = get_response
        self.channel_layer = get_channel_layer()
        super().__init__(get_response)

    def process_response(self, request, response):
        """Track activities after successful operations"""
        
        # Only track successful operations (2xx status codes)
        if not (200 <= response.status_code < 300):
            return response
        
        # Only track for authenticated users
        if not hasattr(request, 'user') or not request.user.is_authenticated:
            return response
        
        # Determine activity type based on method and path
        path = request.path
        method = request.method
        
        try:
            activity_data = self._determine_activity(request, response, path, method)
            
            if activity_data:
                # Create activity record
                activity = Activity.objects.create(**activity_data)
                
                # Broadcast via WebSocket
                self._broadcast_activity(activity)
                
        except Exception as e:
            logger.error(f"Error tracking activity: {str(e)}")
        
        return response

    def _determine_activity(self, request, response, path, method):
        """Determine what activity to log based on request"""
        
        user = request.user
        activity_data = None
        
        # Project activities
        if '/api/projects/' in path:
            if method == 'POST' and path == '/api/projects/':
                # Project created
                try:
                    response_data = json.loads(response.content)
                    project_name = response_data.get('name', 'Unknown Project')
                    project_id = response_data.get('id')
                    
                    activity_data = {
                        'user': user,
                        'activity_type': 'project_created',
                        'project_id': project_id,
                        'target_name': project_name,
                        'description': f"created project {project_name}",
                    }
                except:
                    pass
                    
            elif method == 'PUT' or method == 'PATCH':
                # Project updated
                try:
                    project_id = self._extract_id_from_path(path)
                    if project_id:
                        project = Project.objects.filter(id=project_id).first()
                        if project:
                            activity_data = {
                                'user': user,
                                'activity_type': 'project_updated',
                                'project': project,
                                'target_name': project.name,
                                'description': f"updated project {project.name}",
                            }
                except:
                    pass
                    
            elif method == 'DELETE':
                # Project deleted
                try:
                    # Project name should be in request body or we need to fetch before delete
                    activity_data = {
                        'user': user,
                        'activity_type': 'project_deleted',
                        'target_name': 'Project',
                        'description': f"deleted a project",
                    }
                except:
                    pass
        
        # Task activities
        elif '/api/tasks/' in path:
            if method == 'POST' and path.endswith('/api/tasks/'):
                # Task created
                try:
                    response_data = json.loads(response.content)
                    task_name = response_data.get('name', 'Unknown Task')
                    task_id = response_data.get('taskid')
                    project_id = response_data.get('Project')
                    
                    activity_data = {
                        'user': user,
                        'activity_type': 'task_created',
                        'task_id': task_id,
                        'project_id': project_id,
                        'target_name': task_name,
                        'description': f"created task {task_name}",
                    }
                except:
                    pass
                    
            elif method == 'PUT' or method == 'PATCH':
                # Task updated/assigned/completed
                try:
                    task_id = self._extract_id_from_path(path)
                    if task_id:
                        task = Task.objects.filter(taskid=task_id).first()
                        if task:
                            # Check if status changed to completed
                            request_body = json.loads(request.body.decode('utf-8')) if request.body else {}
                            new_status = request_body.get('status')
                            
                            if new_status == 'completed':
                                activity_type = 'task_completed'
                                description = f"completed task {task.name}"
                            elif 'assigned_to' in request_body:
                                activity_type = 'task_assigned'
                                description = f"assigned task {task.name}"
                            else:
                                activity_type = 'task_updated'
                                description = f"updated task {task.name}"
                            
                            activity_data = {
                                'user': user,
                                'activity_type': activity_type,
                                'task': task,
                                'project': task.Project,
                                'target_name': task.name,
                                'description': description,
                            }
                except:
                    pass
        
        # Comment activities
        elif '/api/comments/' in path and method == 'POST':
            try:
                request_body = json.loads(request.body.decode('utf-8')) if request.body else {}
                task_id = request_body.get('task')
                
                if task_id:
                    task = Task.objects.filter(taskid=task_id).first()
                    if task:
                        activity_data = {
                            'user': user,
                            'activity_type': 'comment_added',
                            'task': task,
                            'project': task.Project,
                            'target_name': task.name,
                            'description': f"commented on task {task.name}",
                        }
            except:
                pass
        
        # Document upload activities
        elif '/api/upload-document/' in path and method == 'POST':
            try:
                response_data = json.loads(response.content)
                file_name = response_data.get('file', 'document')
                project_id = response_data.get('project')
                
                activity_data = {
                    'user': user,
                    'activity_type': 'document_uploaded',
                    'project_id': project_id,
                    'target_name': file_name,
                    'description': f"uploaded document",
                }
            except:
                pass
        
        # Team member activities
        elif '/api/teams/' in path:
            if 'add-member' in path and method == 'POST':
                try:
                    request_body = json.loads(request.body.decode('utf-8')) if request.body else {}
                    member_email = request_body.get('email', 'a member')
                    
                    activity_data = {
                        'user': user,
                        'activity_type': 'member_added',
                        'target_name': member_email,
                        'description': f"added {member_email} to team",
                    }
                except:
                    pass
                    
            elif 'remove-member' in path and method == 'POST':
                try:
                    request_body = json.loads(request.body.decode('utf-8')) if request.body else {}
                    member_email = request_body.get('email', 'a member')
                    
                    activity_data = {
                        'user': user,
                        'activity_type': 'member_removed',
                        'target_name': member_email,
                        'description': f"removed {member_email} from team",
                    }
                except:
                    pass
                    
            elif method == 'POST' and path == '/api/teams/':
                try:
                    response_data = json.loads(response.content)
                    team_name = response_data.get('name', 'Unknown Team')
                    
                    activity_data = {
                        'user': user,
                        'activity_type': 'team_created',
                        'target_name': team_name,
                        'description': f"created team {team_name}",
                    }
                except:
                    pass
        
        return activity_data

    def _extract_id_from_path(self, path):
        """Extract ID from URL path"""
        parts = path.strip('/').split('/')
        for part in parts:
            if part.isdigit() or self._is_uuid(part):
                return part
        return None

    def _is_uuid(self, value):
        """Check if value is a UUID"""
        try:
            import uuid
            uuid.UUID(value)
            return True
        except:
            return False

    def _broadcast_activity(self, activity):
        """Broadcast activity to WebSocket clients"""
        try:
            from .serializers import ActivitySerializer
            
            serializer = ActivitySerializer(activity)
            activity_data = serializer.data
            
            # Broadcast to general activity channel
            async_to_sync(self.channel_layer.group_send)(
                "activities",
                {
                    "type": "activity_message",
                    "activity": activity_data,
                }
            )
            
            # If activity has a project, broadcast to project-specific channel
            if activity.project:
                async_to_sync(self.channel_layer.group_send)(
                    f"project_{activity.project.id}",
                    {
                        "type": "activity_message",
                        "activity": activity_data,
                    }
                )
            
            logger.info(f"Activity broadcasted: {activity.activity_type} by {activity.user}")
        except Exception as e:
            logger.error(f"Error broadcasting activity: {str(e)}")

