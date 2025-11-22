from .permissions import IsTeamMember
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from .models import Team, TeamMembership, User
from .serializers import (
    AddTeamMemberSerializer,
    TeamSerializer,
    UserSerializer,
)
from .google_auth import (
    get_google_oauth_url,
    exchange_code_for_token,
    get_google_user_info,
)
from django.shortcuts import get_object_or_404
from django.http import Http404, HttpResponseRedirect
from django.contrib.auth import login
from django.utils import timezone
from datetime import timedelta
import logging
import os

logger = logging.getLogger(__name__)


@method_decorator(csrf_exempt, name='dispatch')
class GoogleLoginView(APIView):
    """Get Google OAuth URL"""
    
    permission_classes = [AllowAny]
    
    def get(self, request):
        try:
            auth_url = get_google_oauth_url()
            return Response({"auth_url": auth_url}, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error generating Google OAuth URL: {str(e)}")
            return Response(
                {"error": "Failed to generate OAuth URL"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


@method_decorator(csrf_exempt, name='dispatch')
class GoogleCallbackView(APIView):
    """Handle Google OAuth callback"""
    
    permission_classes = [AllowAny]
    
    def get(self, request):
        code = request.GET.get('code')
        if not code:
            return Response(
                {"error": "Authorization code not provided"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Exchange code for token
            token_data = exchange_code_for_token(code)
            access_token = token_data.get('access_token')
            
            if not access_token:
                return Response(
                    {"error": "Failed to obtain access token"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Get user info from Google
            google_user_info = get_google_user_info(access_token)
            
            google_id = google_user_info.get('id')
            email = google_user_info.get('email')
            
            if not google_id or not email:
                return Response(
                    {"error": "Invalid user data from Google"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Get or create user - only store essential data (email, google_id)
            user, created = User.objects.get_or_create(
                google_id=google_id,
                defaults={
                    'email': email,
                }
            )
            
            # Update email if it changed (rare, but possible)
            if not created and user.email != email:
                user.email = email
                user.save()
            
            # Create Django session
            login(request, user, backend='django.contrib.auth.backends.ModelBackend')
            
            # Store session creation time and Google user info in session data
            request.session['session_created'] = timezone.now().isoformat()
            request.session['google_user_info'] = {
                'first_name': google_user_info.get('given_name', ''),
                'last_name': google_user_info.get('family_name', ''),
                'avatar_url': google_user_info.get('picture', ''),
                'email': email,
            }
            request.session.save()
            
            # Redirect to frontend with success
            # Frontend will handle the session cookie automatically
            frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:3000')
            return HttpResponseRedirect(f"{frontend_url}/projects?auth=success")
            
        except Exception as e:
            logger.error(f"Error in Google OAuth callback: {str(e)}")
            return Response(
                {"error": "Authentication failed", "detail": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class GoogleSyncView(APIView):
    """Sync user from NextAuth.js after Google OAuth"""
    
    permission_classes = [AllowAny]
    
    @method_decorator(csrf_exempt, name='dispatch')
    def post(self, request):
        """
        Create or update user from NextAuth.js Google OAuth data
        Returns Django session cookie for API authentication
        """
        try:
            data = request.data
            google_id = data.get('google_id')
            email = data.get('email')
            name = data.get('name', '')
            image = data.get('image', '')
            
            if not google_id or not email:
                return Response(
                    {"error": "google_id and email are required"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Get or create user
            user, created = User.objects.get_or_create(
                google_id=google_id,
                defaults={'email': email}
            )
            
            # Update email if changed
            if not created and user.email != email:
                user.email = email
                user.save()
            
            # Store Google user info in session (not in DB)
            request.session['google_user_info'] = {
                'first_name': name.split()[0] if name else '',
                'last_name': ' '.join(name.split()[1:]) if name and len(name.split()) > 1 else '',
                'avatar_url': image,
                'email': email,
            }
            
            # Create Django session
            login(request, user, backend='django.contrib.auth.backends.ModelBackend')
            request.session['session_created'] = timezone.now().isoformat()
            request.session.save()
            
            # Return user data
            serializer = UserSerializer(user, context={'request': request})
            return Response(serializer.data, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error in Google sync: {str(e)}")
            return Response(
                {"error": "Failed to sync user", "detail": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class LogoutView(APIView):
    """Logout user and revoke session"""
    
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            # Delete session
            request.session.flush()
            return Response(
                {"message": "Logged out successfully"},
                status=status.HTTP_200_OK
            )
        except Exception as e:
            logger.error(f"Error during logout: {str(e)}")
            return Response(
                {"error": "Logout failed"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class UserInfoView(APIView):
    """Get current user information (alias for /auth/me/)"""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        serializer = UserSerializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)


class UserMeView(APIView):
    """Get current authenticated user information"""
    
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        
        # Try to refresh Google user info from session if available
        # Otherwise, will return minimal info (email only)
        serializer = UserSerializer(user, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)


class TeamListCreateView(generics.ListCreateAPIView):
    """API View to list and create teams"""

    serializer_class = TeamSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Override to filter teams visible to the user."""
        return Team.objects.filter(members=self.request.user)

    def perform_create(self, serializer):
        """Create a new team and add the creator as an admin."""
        team = serializer.save()
        # Automatically add the creator as an admin
        TeamMembership.objects.create(user=self.request.user, team=team, role="admin")


class AddTeamMemberView(APIView):
    """API View to add a member to a team"""

    permission_classes = [IsAuthenticated]

    def post(self, request, team_id):
        team = get_object_or_404(Team, id=team_id)
        serializer = AddTeamMemberSerializer(data=request.data)
        if serializer.is_valid():
            user_email = serializer.validated_data["user_email"]
            role = serializer.validated_data["role"]
            user = get_object_or_404(User, email=user_email)

            # Check if the user is already a member
            if TeamMembership.objects.filter(user=user, team=team).exists():
                return Response(
                    {"detail": "User is already a member of the team."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            TeamMembership.objects.create(user=user, team=team, role=role)
            return Response(
                {"detail": "Member added successfully."}, status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class RemoveTeamMemberView(APIView):
    """API View to remove a member from a team"""

    permission_classes = [IsAuthenticated]

    def delete(self, request, team_id, user_id):
        team = get_object_or_404(Team, id=team_id)
        user = get_object_or_404(User, id=user_id)

        # Check if the user is a member of the team
        membership = TeamMembership.objects.filter(user=user, team=team).first()
        if not membership:
            return Response(
                {"detail": "User is not a member of the team."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        membership.delete()
        return Response(
            {"detail": "Member removed successfully."},
            status=status.HTTP_204_NO_CONTENT,
        )


class TeamDetailView(generics.RetrieveAPIView):
    """API View to retrieve a single team"""

    queryset = Team.objects.all()
    serializer_class = TeamSerializer
    permission_classes = [IsAuthenticated, IsTeamMember]


class UserListView(generics.ListAPIView):
    """API View to list all users"""

    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
