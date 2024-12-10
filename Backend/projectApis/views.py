from django.shortcuts import render
from .permissions import IsProjectOwnerOrTeamMember
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Project, Task, Comment
from .serializers import CommentSerializer, ProjectDetailSerializer, TaskSerializer
from django.db.models import Q
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.exceptions import NotFound
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.views import APIView
from .serializers import FileUploadSerializer
from .models import FileUpload


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
                project_id = serializer.validated_data['project'].id
                # Remove any existing file upload for this project before saving the new one
                FileUpload.objects.filter(project_id=project_id).delete()
            except KeyError:
                return Response({"error": "Project ID not found in the request data."}, status=status.HTTP_400_BAD_REQUEST)
            except NotFound:
                return Response({"error": "Project not found."}, status=status.HTTP_404_NOT_FOUND)

            # Save the new file upload
            serializer.save()

            return Response( status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class FileUploadShow(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            # file_upload = FileUpload.objects.get(project_id=request.data.get('project'))
            id = request.data["project"]
            file_upload = FileUpload.objects.get(project_id=int(id))

        except FileUpload.DoesNotExist:
            return Response({"error": "FileUpload for the specified project not found."}, status=status.HTTP_404_NOT_FOUND)

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
    
    def get(self, request, pk):
        try:
            task = Task.objects.get(pk=pk)
        except Task.DoesNotExist:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = TaskSerializer(task)
        return Response(serializer.data)

    def put(self, request, pk):
        try:
            task = Task.objects.get(pk=pk)
        except Task.DoesNotExist:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = TaskSerializer(task, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, pk):
        try:
            task = Task.objects.get(pk=pk)
        except Task.DoesNotExist:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = TaskSerializer(task, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        try:
            task = Task.objects.get(pk=pk)
            task.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Task.DoesNotExist:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

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
            return Response({"detail": "Project not found."}, status=status.HTTP_404_NOT_FOUND) 
        
class CommentListCreateView(APIView):
    def get(self, request, task_id):
        comments = Comment.objects.filter(task_id=task_id)
        serializer = CommentSerializer(comments, many=True)
        return Response(serializer.data)

    def post(self, request, task_id):
        data = request.data
        data['task'] = task_id  # Ensure the task_id is included in the comment data
        
        serializer = CommentSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST) 
    




