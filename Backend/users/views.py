from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.permissions import IsAuthenticated
from .models import Team, TeamMembership, User
from .serializers import AddTeamMemberSerializer, TeamSerializer, UserSerializer, CustomTokenObtainPairSerializer
from django.shortcuts import get_object_or_404


class RegisterView(APIView):
    """Register a new user"""
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({"message": "User created successfully"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CustomTokenObtainPairView(TokenObtainPairView):
    """Obtain JWT token for user authentication"""
    serializer_class = CustomTokenObtainPairSerializer


class UserInfoView(APIView):
    """Get user information"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user  
        serializer = UserSerializer(user)  
        return Response(serializer.data, status=200) 
    


class TeamListCreateView(generics.ListCreateAPIView):
    """ API View to list and create teams """
    queryset = Team.objects.all()
    serializer_class = TeamSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        team = serializer.save()
        # Automatically add the creator as an admin
        TeamMembership.objects.create(user=self.request.user, team=team, role='admin')


class AddTeamMemberView(APIView):
    """ API View to add a member to a team """
    permission_classes = [IsAuthenticated]

    def post(self, request, team_id):
        team = get_object_or_404(Team, id=team_id)
        serializer = AddTeamMemberSerializer(data=request.data)
        if serializer.is_valid():
            user_email = serializer.validated_data['user_email']
            role = serializer.validated_data['role']
            user = get_object_or_404(User, email=user_email)

            # Check if the user is already a member
            if TeamMembership.objects.filter(user=user, team=team).exists():
                return Response({"detail": "User is already a member of the team."},
                                status=status.HTTP_400_BAD_REQUEST)

            TeamMembership.objects.create(user=user, team=team, role=role)
            return Response({"detail": "Member added successfully."}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

class TeamDetailView(generics.RetrieveAPIView):
    """ API View to retrieve a single team """
    queryset = Team.objects.all()
    serializer_class = TeamSerializer
    permission_classes = [IsAuthenticated]