from django.shortcuts import render

# from .tasks import generate_task  # Commented out - tasks are disabled
from users.models import Team
from .permissions import IsProjectOwnerOrTeamMember
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Project, Task, Comment, Activity, Document, Sprint
from .serializers import (
    CommentSerializer,
    ProjectDetailSerializer,
    TaskSerializer,
    UpdateTaskSerializer,
    ActivitySerializer,
    DocumentSerializer,
    SprintSerializer,
)
from django.db.models import Q
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.exceptions import NotFound
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.views import APIView
from .serializers import FileUploadSerializer
from .models import FileUpload
from rest_framework.pagination import PageNumberPagination


# Create your views here.
class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectDetailSerializer
    permission_classes = [IsAuthenticated, IsProjectOwnerOrTeamMember]
    lookup_field = 'uuid'  # Use UUID instead of ID for URL lookups

    def get_queryset(self):
        """
        Filter queryset so that users only see projects they created or are part of the team.
        """
        user = self.request.user
        return Project.objects.filter(
            Q(created_by=user) | Q(team__members=user)
        ).distinct()

    def perform_create(self, serializer):
        """
        Set the `created_by` field to the current user during creation.
        """
        serializer.save(created_by=self.request.user)


class AssigenTeamToProject(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        project_uuid = request.data.get("project_uuid") or request.data.get("project_id")  # Support both for backward compatibility
        team_id = request.data.get("team_id")

        try:
            project = Project.objects.get(uuid=project_uuid)
        except Project.DoesNotExist:
            return Response(
                {"error": "Project not found."}, status=status.HTTP_404_NOT_FOUND
            )

        try:
            team = Team.objects.get(id=team_id)
        except Team.DoesNotExist:
            return Response(
                {"error": "Team not found."}, status=status.HTTP_404_NOT_FOUND
            )

        # Prevent assigning archived teams to projects
        if team.is_archived:
            return Response(
                {"error": "Cannot assign an archived team to a project. Please select an active team."},
                status=status.HTTP_400_BAD_REQUEST
            )

        project.team = team
        project.save()

        return Response(
            {"message": "Team assigned to project successfully."},
            status=status.HTTP_200_OK,
        )


class FileUploadView(APIView):
    parser_classes = (MultiPartParser, FormParser)
    serializer_class = FileUploadSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self, id):
        try:
            return FileUpload.objects.get(project_id=id)
        except FileUpload.DoesNotExist:
            raise NotFound(detail="FileUpload for the specified project not found.")

    def post(self, request, *args, **kwargs):
        # Deserialize the data
        serializer = self.serializer_class(data=request.data)

        if serializer.is_valid():
            # Extract project id from the serializer data
            try:
                project_id = serializer.validated_data["project"].id
                # Remove any existing file upload for this project before saving the new one
                FileUpload.objects.filter(project_id=project_id).delete()
            except KeyError:
                return Response(
                    {"error": "Project ID not found in the request data."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            except NotFound:
                return Response(
                    {"error": "Project not found."}, status=status.HTTP_404_NOT_FOUND
                )

            # Save the new file upload
            serializer.save()

            return Response(status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class FileUploadShow(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            # file_upload = FileUpload.objects.get(project_id=request.data.get('project'))
            id = request.data["project"]
            file_upload = FileUpload.objects.get(project_id=int(id))

        except FileUpload.DoesNotExist:
            return Response(
                {"error": "FileUpload for the specified project not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = FileUploadSerializer(file_upload)
        return Response(serializer.data, status=status.HTTP_200_OK)


class DocumentListCreateView(APIView):
    """List all documents for a project or create new documents"""
    parser_classes = (MultiPartParser, FormParser)
    permission_classes = [IsAuthenticated]

    def get(self, request, project_uuid):
        """Get all documents for a project"""
        try:
            project = Project.objects.get(uuid=project_uuid)
            # Check if user has access to the project
            if not (project.created_by == request.user or 
                    (project.team and request.user in project.team.members.all())):
                return Response(
                    {"error": "You don't have permission to view documents for this project."},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            documents = Document.objects.filter(project=project)
            serializer = DocumentSerializer(documents, many=True, context={'request': request})
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Project.DoesNotExist:
            return Response(
                {"error": "Project not found."},
                status=status.HTTP_404_NOT_FOUND
            )

    def post(self, request, project_uuid):
        """Upload one or multiple documents"""
        try:
            project = Project.objects.get(uuid=project_uuid)
            # Check if user has access to the project
            if not (project.created_by == request.user or 
                    (project.team and request.user in project.team.members.all())):
                return Response(
                    {"error": "You don't have permission to upload documents to this project."},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Handle multiple files
            files = request.FILES.getlist('files') or [request.FILES.get('file')]
            files = [f for f in files if f]  # Remove None values
            
            if not files:
                return Response(
                    {"error": "No files provided."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            uploaded_documents = []
            errors = []
            
            for file in files:
                document_data = {
                    'project': project.id,
                    'file': file,
                    'name': request.data.get('name') or file.name,
                    'category': request.data.get('category', ''),
                }
                
                serializer = DocumentSerializer(data=document_data, context={'request': request})
                if serializer.is_valid():
                    document = serializer.save(uploaded_by=request.user)
                    uploaded_documents.append(serializer.data)
                else:
                    errors.append({file.name: serializer.errors})
            
            if uploaded_documents:
                return Response(
                    {
                        "message": f"Successfully uploaded {len(uploaded_documents)} document(s).",
                        "documents": uploaded_documents,
                        "errors": errors if errors else None
                    },
                    status=status.HTTP_201_CREATED
                )
            else:
                return Response(
                    {"error": "Failed to upload documents.", "errors": errors},
                    status=status.HTTP_400_BAD_REQUEST
                )
                
        except Project.DoesNotExist:
            return Response(
                {"error": "Project not found."},
                status=status.HTTP_404_NOT_FOUND
            )


class DocumentDetailView(APIView):
    """Retrieve, update, or delete a document"""
    parser_classes = (MultiPartParser, FormParser)
    permission_classes = [IsAuthenticated]

    def get(self, request, project_uuid, document_uuid):
        """Get a specific document"""
        try:
            project = Project.objects.get(uuid=project_uuid)
            document = Document.objects.get(uuid=document_uuid, project=project)
            # Check if user has access
            if not (project.created_by == request.user or 
                    (project.team and request.user in project.team.members.all())):
                return Response(
                    {"error": "You don't have permission to view this document."},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            serializer = DocumentSerializer(document, context={'request': request})
            return Response(serializer.data, status=status.HTTP_200_OK)
        except (Project.DoesNotExist, Document.DoesNotExist):
            return Response(
                {"error": "Document not found."},
                status=status.HTTP_404_NOT_FOUND
            )

    def patch(self, request, project_uuid, document_uuid):
        """Update a document (e.g., category, name)"""
        try:
            project = Project.objects.get(uuid=project_uuid)
            document = Document.objects.get(uuid=document_uuid, project=project)
            # Check if user has access
            if not (project.created_by == request.user or 
                    (project.team and request.user in project.team.members.all())):
                return Response(
                    {"error": "You don't have permission to update this document."},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            serializer = DocumentSerializer(
                document, 
                data=request.data, 
                partial=True,
                context={'request': request}
            )
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except (Project.DoesNotExist, Document.DoesNotExist):
            return Response(
                {"error": "Document not found."},
                status=status.HTTP_404_NOT_FOUND
            )

    def delete(self, request, project_uuid, document_uuid):
        """Delete a document"""
        try:
            project = Project.objects.get(uuid=project_uuid)
            document = Document.objects.get(uuid=document_uuid, project=project)
            # Check if user has access
            if not (project.created_by == request.user or 
                    (project.team and request.user in project.team.members.all())):
                return Response(
                    {"error": "You don't have permission to delete this document."},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            document.delete()
            return Response(
                {"message": "Document deleted successfully."},
                status=status.HTTP_204_NO_CONTENT
            )
        except (Project.DoesNotExist, Document.DoesNotExist):
            return Response(
                {"error": "Document not found."},
                status=status.HTTP_404_NOT_FOUND
            )


class AllDocumentsView(APIView):
    """Get all documents from projects the user has access to"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Get all documents from user's projects"""
        user = request.user
        
        # Get all projects the user has access to
        user_projects = Project.objects.filter(
            Q(created_by=user) | Q(team__members=user)
        ).distinct()
        
        # Get all documents from these projects
        documents = Document.objects.filter(
            project__in=user_projects
        ).select_related('project', 'uploaded_by').order_by('-created_at')
        
        serializer = DocumentSerializer(documents, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)


class TaskListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        tasks = Task.objects.all()
        serializer = TaskSerializer(tasks, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = TaskSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TaskDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            task = Task.objects.prefetch_related('assigned_to', 'related_work', 'task_comments__user').get(pk=pk)
        except Task.DoesNotExist:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = TaskSerializer(task)
        return Response(serializer.data)

    def delete(self, request, pk):
        try:
            task = Task.objects.get(pk=pk)
            task.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Task.DoesNotExist:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)


class TaskPatchView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        try:
            task = Task.objects.get(pk=pk)
        except Task.DoesNotExist:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = UpdateTaskSerializer(task, data=request.data, partial=True)
        if serializer.is_valid():
            updated_task = serializer.save()
            # Return full task data with proper serialization
            response_serializer = TaskSerializer(updated_task)
            return Response(response_serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TaskByProjectView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, project_uuid):
        """
        Retrieve all tasks for a given project UUID
        """
        try:
            # Get project by UUID
            project = Project.objects.get(uuid=project_uuid)
            
            # Fetch tasks that belong to the given project
            tasks = Task.objects.filter(Project=project).select_related('Project').prefetch_related('related_work', 'assigned_to', 'comments')

            # Serialize the data
            serializer = TaskSerializer(tasks, many=True)

            # Return serialized data
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Project.DoesNotExist:
            return Response(
                {"detail": "Project not found."}, status=status.HTTP_404_NOT_FOUND
            )


class ProjectTimelineView(APIView):
    """API endpoint for timeline data with calculated positions and durations"""
    permission_classes = [IsAuthenticated]

    def get(self, request, project_uuid):
        """
        Get timeline data for a project with calculated positions and durations
        """
        try:
            from django.utils import timezone
            from datetime import timedelta
            
            # Get project
            try:
                project = Project.objects.get(uuid=project_uuid)
            except Project.DoesNotExist:
                return Response(
                    {"error": "Project not found."}, status=status.HTTP_404_NOT_FOUND
                )
            
            # Check permissions
            if not (project.created_by == request.user or 
                    (project.team and request.user in project.team.members.all())):
                return Response(
                    {"error": "You don't have permission to view this project."},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Fetch tasks with related data
            tasks = Task.objects.filter(Project=project).select_related('Project').prefetch_related('related_work', 'assigned_to', 'comments').order_by('created_at')
            
            if not tasks.exists():
                return Response({
                    "project": {
                        "id": project.id,
                        "name": project.name,
                        "created_at": project.created_at,
                    },
                    "timeline": {
                        "start_date": project.created_at.isoformat(),
                        "end_date": timezone.now().isoformat(),
                        "total_days": 0,
                    },
                    "tasks": [],
                })
            
            # Calculate timeline bounds using industry-standard approach:
            # Priority: Project end_date > Latest completed task > Latest task updated > Current date
            
            project_start = project.created_at
            now = timezone.now()
            
            # Get earliest task date
            earliest_task = tasks.order_by('created_at').first()
            timeline_start = min(project_start, earliest_task.created_at) if earliest_task else project_start
            
            # Calculate timeline end date using priority:
            # 1. If project has end_date, use it (future enhancement)
            # 2. Latest completed task date (most reliable indicator)
            # 3. Latest task updated_at (shows recent activity)
            # 4. Current date (for active projects)
            
            completed_tasks = tasks.filter(status='completed')
            latest_completed = completed_tasks.order_by('-updated_at').first() if completed_tasks.exists() else None
            latest_task = tasks.order_by('-updated_at').first()
            
            # Priority order for end date
            if latest_completed and latest_completed.updated_at:
                # Use latest completed task as primary indicator
                timeline_end = max(now, latest_completed.updated_at)
            elif latest_task and latest_task.updated_at:
                # Fallback to latest task update
                timeline_end = max(now, latest_task.updated_at)
            else:
                # Default to current date
                timeline_end = now
            
            # Add buffer: extend timeline by 10% or minimum 7 days for better visualization
            timeline_buffer = max(
                timedelta(days=7),
                (timeline_end - timeline_start) * 0.1
            )
            timeline_end = timeline_end + timeline_buffer
            
            total_days = max(1, (timeline_end - timeline_start).days)
            
            # Serialize tasks with timeline calculations
            serialized_tasks = []
            for task in tasks:
                task_created = task.created_at
                task_updated = task.updated_at if task.updated_at else task_created
                
                # For active/created tasks, use now as end date
                if task.status in ['active', 'created', 'backlog']:
                    task_end = now
                else:
                    task_end = task_updated
                
                # Calculate position (percentage from start)
                days_from_start = (task_created - timeline_start).days
                position = max(0, min(100, (days_from_start / total_days) * 100)) if total_days > 0 else 0
                
                # Calculate duration in days
                duration_days = max(1, (task_end - task_created).days)
                
                # Calculate width (percentage of timeline)
                width = max(2, min(100, (duration_days / total_days) * 100)) if total_days > 0 else 2
                
                # Get related work IDs
                related_work_ids = [str(rel.taskid) for rel in task.related_work.all()]
                
                task_data = {
                    "taskid": str(task.taskid),
                    "name": task.name,
                    "description": task.description,
                    "details": task.details,
                    "status": task.status,
                    "priority": task.priority,
                    "size": task.size,
                    "task_number": task.task_number,
                    "created_at": task_created.isoformat(),
                    "updated_at": task_updated.isoformat(),
                    "assigned_to": [
                        {
                            "id": user.id,
                            "email": user.email,
                            "username": user.email.split('@')[0] if user.email else "Unknown",
                            "first_name": "",  # Not stored in DB
                            "last_name": "",   # Not stored in DB
                        }
                        for user in task.assigned_to.all()
                    ],
                    "related_work_ids": related_work_ids,
                    "timeline": {
                        "start_date": task_created.isoformat(),
                        "end_date": task_end.isoformat(),
                        "duration_days": duration_days,
                        "position": round(position, 2),
                        "width": round(width, 2),
                    },
                }
                serialized_tasks.append(task_data)
            
            return Response({
                "project": {
                    "id": project.id,
                    "name": project.name,
                    "created_at": project.created_at.isoformat(),
                },
                "timeline": {
                    "start_date": timeline_start.isoformat(),
                    "end_date": timeline_end.isoformat(),
                    "total_days": total_days,
                },
                "tasks": serialized_tasks,
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {"error": f"Error generating timeline: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class CommentListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, task_id):
        comments = Comment.objects.filter(task_id=task_id)
        serializer = CommentSerializer(comments, many=True)
        return Response(serializer.data)

    def post(self, request, task_id):
        try:
            # Get the task
            task = Task.objects.get(pk=task_id)
            
            # Create the comment with user and task
            comment = Comment.objects.create(
                user=request.user,
                task=task,
                content=request.data.get('content', '')
            )
            
            # Serialize and return
            serializer = CommentSerializer(comment)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Task.DoesNotExist:
            return Response(
                {"error": "Task not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {"error": str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )


class TriggerTaskGeneration(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            user_id = request.user.id
            file_id = request.data.get("file_id")
            file = FileUpload.objects.get(id=file_id)
            # generate_task.delay(file_id, user_id)

            return Response(
                {"message": "Task generation started."}, status=status.HTTP_200_OK
            )
        except Exception as e:
            return Response(
                {"error": f"Error {str(e)}"}, status=status.HTTP_400_BAD_REQUEST
            )

        return Response({"message": "not webscoket."}, status=status.HTTP_200_OK)


class ActivityPagination(PageNumberPagination):
    """Custom pagination for activities"""
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


class ActivityListView(APIView):
    """
    List all activities or filter by project, user, or activity type
    GET /api/activities/
    GET /api/activities/?project=1
    GET /api/activities/?user=1
    GET /api/activities/?activity_type=task_created
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        # Base queryset - filter by projects user has access to
        user = request.user
        activities = Activity.objects.filter(
            Q(project__created_by=user) | 
            Q(project__team__members=user) |
            Q(project__isnull=True)
        ).distinct()
        
        # Filter by project
        project_id = request.query_params.get('project')
        if project_id:
            activities = activities.filter(project_id=project_id)
        
        # Filter by user
        user_id = request.query_params.get('user')
        if user_id:
            activities = activities.filter(user_id=user_id)
        
        # Filter by activity type
        activity_type = request.query_params.get('activity_type')
        if activity_type:
            activities = activities.filter(activity_type=activity_type)
        
        # Order by most recent
        activities = activities.order_by('-created_at')
        
        # Paginate
        paginator = ActivityPagination()
        paginated_activities = paginator.paginate_queryset(activities, request)
        
        # Serialize
        serializer = ActivitySerializer(paginated_activities, many=True)
        
        return paginator.get_paginated_response(serializer.data)


class RecentActivitiesView(APIView):
    """
    Get recent activities (last 10)
    GET /api/activities/recent/
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        
        # Get recent activities for projects user has access to
        activities = Activity.objects.filter(
            Q(project__created_by=user) | 
            Q(project__team__members=user) |
            Q(project__isnull=True)
        ).distinct().order_by('-created_at')[:10]
        
        serializer = ActivitySerializer(activities, many=True)
        return Response(serializer.data)


class ProjectActivitiesView(generics.ListAPIView):
    """
    Get activities for a specific project
    GET /api/project-management/projects/{project_uuid}/activities/
    """
    serializer_class = ActivitySerializer
    permission_classes = [IsAuthenticated]
    pagination_class = ActivityPagination

    def get_queryset(self):
        project_uuid = self.kwargs["project_uuid"]
        user = self.request.user
        
        # Ensure user has access to the project
        try:
            project = Project.objects.get(
                Q(uuid=project_uuid), Q(team__members=user) | Q(created_by=user)
            )
        except Project.DoesNotExist:
            raise NotFound("Project not found or user does not have access.")
        
        return Activity.objects.filter(project=project).order_by("-created_at")


class SprintListView(APIView):
    """List and create sprints for a project"""
    permission_classes = [IsAuthenticated]

    def get(self, request, project_uuid):
        """Get all sprints for a project"""
        try:
            project = Project.objects.get(uuid=project_uuid)
        except Project.DoesNotExist:
            return Response(
                {"error": "Project not found."}, status=status.HTTP_404_NOT_FOUND
            )
        
        # Check permissions
        if not (project.created_by == request.user or 
                (project.team and request.user in project.team.members.all())):
            return Response(
                {"error": "You don't have permission to view this project."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        sprints = Sprint.objects.filter(project=project).order_by('-start_date')
        
        # Auto-update status for all sprints based on current date
        for sprint in sprints:
            if sprint.status != 'cancelled':
                auto_status = sprint.get_auto_status()
                if sprint.status != auto_status:
                    sprint.status = auto_status
                    sprint.save(update_fields=['status'])
        
        serializer = SprintSerializer(sprints, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request, project_uuid):
        """Create a new sprint"""
        try:
            project = Project.objects.get(uuid=project_uuid)
        except Project.DoesNotExist:
            return Response(
                {"error": "Project not found."}, status=status.HTTP_404_NOT_FOUND
            )
        
        # Check permissions
        if not (project.created_by == request.user or 
                (project.team and request.user in project.team.members.all())):
            return Response(
                {"error": "You don't have permission to create sprints for this project."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Don't include project in serializer data, we'll set it in save()
        data = request.data.copy()
        if 'project' in data:
            del data['project']
        
        # Remove status from data if provided - we'll auto-detect it
        # Only allow manual status if it's "cancelled"
        if 'status' in data and data['status'] != 'cancelled':
            del data['status']
        
        # Pass project to serializer context for overlap validation
        serializer = SprintSerializer(data=data, context={'project': project})
        if serializer.is_valid():
            try:
                sprint = serializer.save(project=project, created_by=request.user)
                
                # Auto-update status based on dates
                auto_status = sprint.get_auto_status()
                if sprint.status != auto_status:
                    sprint.status = auto_status
                    sprint.save()
                
                # Auto-migrate incomplete tasks from previous sprint
                self._migrate_incomplete_tasks(project, sprint)
                
                return Response(SprintSerializer(sprint).data, status=status.HTTP_201_CREATED)
            except Exception as e:
                import traceback
                traceback.print_exc()
                return Response(
                    {"error": f"Failed to create sprint: {str(e)}", "details": str(e)},
                    status=status.HTTP_400_BAD_REQUEST
                )
        # Return detailed validation errors
        error_response = {"error": "Validation failed", "details": serializer.errors}
        return Response(error_response, status=status.HTTP_400_BAD_REQUEST)
    
    def _migrate_incomplete_tasks(self, project, new_sprint):
        """Move incomplete tasks from previous sprint to new sprint's backlog"""
        from django.utils import timezone
        
        # Find the most recent completed or active sprint before this one
        previous_sprint = Sprint.objects.filter(
            project=project,
            start_date__lt=new_sprint.start_date
        ).order_by('-start_date').first()
        
        if previous_sprint:
            # Get incomplete tasks from previous sprint
            incomplete_tasks = Task.objects.filter(
                sprint=previous_sprint,
                status__in=['created', 'active', 'backlog']
            )
            
            # Move them to new sprint and set status to backlog
            incomplete_tasks.update(sprint=new_sprint, status='backlog')


class SprintDetailView(APIView):
    """Retrieve, update, or delete a sprint"""
    permission_classes = [IsAuthenticated]

    def get(self, request, project_uuid, sprint_uuid):
        """Get sprint details"""
        try:
            project = Project.objects.get(uuid=project_uuid)
            sprint = Sprint.objects.get(uuid=sprint_uuid, project=project)
        except (Project.DoesNotExist, Sprint.DoesNotExist):
            return Response(
                {"error": "Sprint not found."}, status=status.HTTP_404_NOT_FOUND
            )
        
        # Check permissions
        if not (project.created_by == request.user or 
                (project.team and request.user in project.team.members.all())):
            return Response(
                {"error": "You don't have permission to view this sprint."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Auto-update status if not cancelled
        if sprint.status != 'cancelled':
            auto_status = sprint.get_auto_status()
            if sprint.status != auto_status:
                sprint.status = auto_status
                sprint.save(update_fields=['status'])
        
        serializer = SprintSerializer(sprint)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request, project_uuid, sprint_uuid):
        """Update sprint"""
        try:
            project = Project.objects.get(uuid=project_uuid)
            sprint = Sprint.objects.get(uuid=sprint_uuid, project=project)
        except (Project.DoesNotExist, Sprint.DoesNotExist):
            return Response(
                {"error": "Sprint not found."}, status=status.HTTP_404_NOT_FOUND
            )
        
        # Check permissions
        if not (project.created_by == request.user or 
                (project.team and request.user in project.team.members.all())):
            return Response(
                {"error": "You don't have permission to update this sprint."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Prepare data - only allow manual status if it's "cancelled"
        data = request.data.copy()
        if 'status' in data and data['status'] != 'cancelled':
            # Remove status - will be auto-detected
            del data['status']
        
        # Pass project to serializer context for overlap validation
        serializer = SprintSerializer(sprint, data=data, partial=True, context={'project': project})
        if serializer.is_valid():
            sprint = serializer.save()
            
            # Auto-update status based on dates (unless manually set to cancelled)
            if sprint.status != 'cancelled':
                auto_status = sprint.get_auto_status()
                if sprint.status != auto_status:
                    sprint.status = auto_status
                    sprint.save()
            
            return Response(SprintSerializer(sprint).data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, project_uuid, sprint_uuid):
        """Delete sprint"""
        try:
            project = Project.objects.get(uuid=project_uuid)
            sprint = Sprint.objects.get(uuid=sprint_uuid, project=project)
        except (Project.DoesNotExist, Sprint.DoesNotExist):
            return Response(
                {"error": "Sprint not found."}, status=status.HTTP_404_NOT_FOUND
            )
        
        # Check permissions
        if not (project.created_by == request.user or 
                (project.team and request.user in project.team.members.all())):
            return Response(
                {"error": "You don't have permission to delete this sprint."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Move tasks back to project (no sprint)
        Task.objects.filter(sprint=sprint).update(sprint=None)
        
        sprint.delete()
        return Response(
            {"message": "Sprint deleted successfully."},
            status=status.HTTP_204_NO_CONTENT
        )
