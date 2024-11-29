from django.shortcuts import render
from .permissions import IsProjectOwnerOrTeamMember
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Project
from .serializers import ProjectDetailSerializer
from django.db.models import Q


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