from django.shortcuts import render

# from .tasks import generate_task  # Commented out - tasks are disabled
from users.models import Team
from .permissions import IsProjectOwnerOrTeamMember
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Project, Task, Comment, Activity
from .serializers import (
    CommentSerializer,
    ProjectDetailSerializer,
    TaskSerializer,
    UpdateTaskSerializer,
    ActivitySerializer,
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
        project_id = request.data.get("project_id")
        team_id = request.data.get("team_id")

        try:
            project = Project.objects.get(id=project_id)
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
            task = Task.objects.get(pk=pk)
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
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TaskByProjectView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, project_id):
        """
        Retrieve all tasks for a given project ID
        """
        try:
            # Fetch tasks that belong to the given project
            tasks = Task.objects.filter(Project_id=project_id)

            # Serialize the data
            serializer = TaskSerializer(tasks, many=True)

            # Return serialized data
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Task.DoesNotExist:
            return Response(
                {"detail": "Project not found."}, status=status.HTTP_404_NOT_FOUND
            )


class CommentListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, task_id):
        comments = Comment.objects.filter(task_id=task_id)
        serializer = CommentSerializer(comments, many=True)
        return Response(serializer.data)

    def post(self, request, task_id):
        data = request.data
        data["task"] = task_id  # Ensure the task_id is included in the comment data

        serializer = CommentSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


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
    GET /api/project-management/projects/{project_id}/activities/
    """
    serializer_class = ActivitySerializer
    permission_classes = [IsAuthenticated]
    pagination_class = ActivityPagination

    def get_queryset(self):
        project_id = self.kwargs["project_id"]
        user = self.request.user
        
        # Ensure user has access to the project
        if not Project.objects.filter(
            Q(id=project_id), Q(team__members=user) | Q(created_by=user)
        ).exists():
            raise NotFound("Project not found or user does not have access.")
        
        return Activity.objects.filter(project_id=project_id).order_by("-created_at")
