from .permissions import IsTeamMember
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.authentication import SessionAuthentication
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from .models import Team, TeamMembership, User, TeamInvitation
from .email_utils import send_team_invitation_email
import secrets
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
    # Use a custom authentication class that doesn't require CSRF
    authentication_classes = []
    
    @method_decorator(csrf_exempt, name='dispatch')
    def dispatch(self, *args, **kwargs):
        # Override dispatch to ensure CSRF is bypassed
        return super().dispatch(*args, **kwargs)
    
    def post(self, request):
        """
        Create or update user from NextAuth.js Google OAuth data
        Only stores essential data: google_id and email
        Returns Django session cookie for API authentication
        """
        try:
            data = request.data
            google_id = data.get('google_id')
            email = data.get('email')
            
            if not google_id or not email:
                return Response(
                    {"error": "google_id and email are required"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Get or create user - only store essential data (email, google_id)
            user, created = User.objects.get_or_create(
                google_id=google_id,
                defaults={'email': email}
            )
            
            # Update email if changed (rare, but possible)
            if not created and user.email != email:
                user.email = email
                user.save()
            
            # Create Django session
            login(request, user, backend='django.contrib.auth.backends.ModelBackend')
            request.session['session_created'] = timezone.now().isoformat()
            request.session.save()
            
            # Return minimal user data (only what's stored in DB)
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
    """Get and update current authenticated user information"""
    
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        
        # Try to refresh Google user info from session if available
        # Otherwise, will return minimal info (email only)
        serializer = UserSerializer(user, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def patch(self, request):
        """Update user information (only phone_number is editable)"""
        user = request.user
        
        # Only allow updating phone_number
        phone_number = request.data.get('phone_number')
        if phone_number is not None:
            user.phone_number = phone_number if phone_number else None
            user.save()
        
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
    """API View to add a member to a team (direct add if user exists)"""

    permission_classes = [IsAuthenticated]

    def post(self, request, team_id):
        team = get_object_or_404(Team, id=team_id)
        serializer = AddTeamMemberSerializer(data=request.data)
        if serializer.is_valid():
            user_email = serializer.validated_data["user_email"]
            role = serializer.validated_data["role"]
            
            try:
                user = User.objects.get(email=user_email)
            except User.DoesNotExist:
                return Response(
                    {"detail": "User with this email does not exist. Please use the invitation endpoint to invite new users."},
                    status=status.HTTP_404_NOT_FOUND,
                )

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


class InviteTeamMemberView(APIView):
    """API View to send team invitation via email"""

    permission_classes = [IsAuthenticated]

    def post(self, request, team_id):
        try:
            team = get_object_or_404(Team, id=team_id)
            
            # Check if user has permission to invite (must be team member)
            if not TeamMembership.objects.filter(user=request.user, team=team).exists():
                return Response(
                    {"detail": "You must be a member of this team to send invitations."},
                    status=status.HTTP_403_FORBIDDEN,
                )
            
            email = request.data.get('email')
            role = request.data.get('role', 'member')
            
            if not email:
                return Response(
                    {"detail": "Email is required."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            
            # Validate role
            valid_roles = [choice[0] for choice in TeamMembership._meta.get_field('role').choices]
            if role not in valid_roles:
                return Response(
                    {"detail": f"Invalid role. Must be one of: {', '.join(valid_roles)}"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            
            # Check if user already exists and is a member
            try:
                user = User.objects.get(email=email)
                if TeamMembership.objects.filter(user=user, team=team).exists():
                    return Response(
                        {"detail": "User is already a member of this team."},
                        status=status.HTTP_400_BAD_REQUEST,
                    )
            except User.DoesNotExist:
                pass  # User doesn't exist, will need to sign up first
            
            # Check for existing pending invitation
            existing_invitation = TeamInvitation.objects.filter(
                team=team,
                email=email,
                status='pending'
            ).first()
            
            if existing_invitation and not existing_invitation.is_expired():
                return Response(
                    {"detail": "An invitation has already been sent to this email address."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            
            # Create invitation token
            token = secrets.token_urlsafe(32)
            
            # Create invitation
            invitation = TeamInvitation.objects.create(
                team=team,
                email=email,
                role=role,
                invited_by=request.user,
                token=token,
                status='pending'
            )
            
            # Send invitation email
            try:
                email_sent = send_team_invitation_email(invitation)
                
                if email_sent:
                    return Response(
                        {
                            "detail": "Invitation sent successfully.",
                            "invitation_id": invitation.id,
                            "email": invitation.email,
                        },
                        status=status.HTTP_201_CREATED,
                    )
                else:
                    # Email failed but invitation was created
                    invitation.delete()  # Clean up failed invitation
                    return Response(
                        {"detail": "Failed to send invitation email. Please check email configuration."},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    )
            except Exception as email_error:
                logger.error(f"Error sending invitation email: {str(email_error)}")
                invitation.delete()  # Clean up failed invitation
                return Response(
                    {"detail": f"Failed to send invitation email: {str(email_error)}"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )
                
        except Exception as e:
            logger.error(f"Error in InviteTeamMemberView: {str(e)}")
            import traceback
            logger.error(traceback.format_exc())
            return Response(
                {"detail": f"An error occurred: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class AcceptInvitationView(APIView):
    """API View to accept team invitation"""

    permission_classes = [IsAuthenticated]

    def post(self, request):
        token = request.data.get('token')
        
        if not token:
            return Response(
                {"detail": "Invitation token is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        
        try:
            invitation = TeamInvitation.objects.get(token=token)
        except TeamInvitation.DoesNotExist:
            return Response(
                {"detail": "Invalid or expired invitation token."},
                status=status.HTTP_404_NOT_FOUND,
            )
        
        # Check if invitation is already accepted
        if invitation.status == 'accepted':
            # Check if user is already a member
            if TeamMembership.objects.filter(user=request.user, team=invitation.team).exists():
                return Response(
                    {
                        "detail": "You have already accepted this invitation.",
                        "team_id": invitation.team.id,
                        "team_name": invitation.team.name,
                    },
                    status=status.HTTP_200_OK,
                )
            else:
                # Invitation was accepted but user is not a member (edge case)
                # Add user to team
                TeamMembership.objects.create(
                    user=request.user,
                    team=invitation.team,
                    role=invitation.role
                )
                return Response(
                    {
                        "detail": "Invitation accepted successfully.",
                        "team_id": invitation.team.id,
                        "team_name": invitation.team.name,
                    },
                    status=status.HTTP_200_OK,
                )
        
        # Check if invitation is not pending
        if invitation.status != 'pending':
            return Response(
                {"detail": f"This invitation has been {invitation.status}."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        
        # Check if invitation is expired
        if invitation.is_expired():
            invitation.status = 'expired'
            invitation.save()
            return Response(
                {"detail": "This invitation has expired."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        
        # Verify email matches (case-insensitive comparison)
        if request.user.email.lower().strip() != invitation.email.lower().strip():
            return Response(
                {"detail": "This invitation was sent to a different email address."},
                status=status.HTTP_403_FORBIDDEN,
            )
        
        # Check if user is already a member
        if TeamMembership.objects.filter(user=request.user, team=invitation.team).exists():
            invitation.status = 'accepted'
            invitation.accepted_at = timezone.now()
            invitation.save()
            return Response(
                {
                    "detail": "You are already a member of this team.",
                    "team_id": invitation.team.id,
                    "team_name": invitation.team.name,
                },
                status=status.HTTP_200_OK,
            )
        
        # Add user to team
        TeamMembership.objects.create(
            user=request.user,
            team=invitation.team,
            role=invitation.role
        )
        
        # Update invitation status
        invitation.status = 'accepted'
        invitation.accepted_at = timezone.now()
        invitation.save()
        
        return Response(
            {
                "detail": "Invitation accepted successfully.",
                "team_id": invitation.team.id,
                "team_name": invitation.team.name,
            },
            status=status.HTTP_200_OK,
        )


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


class TeamDetailView(generics.RetrieveUpdateDestroyAPIView):
    """API View to retrieve, update, or delete a team"""
    
    queryset = Team.objects.all()
    serializer_class = TeamSerializer
    permission_classes = [IsAuthenticated, IsTeamMember]
    lookup_field = 'pk'
    
    def get_queryset(self):
        """Filter teams visible to the user"""
        return Team.objects.filter(members=self.request.user)
    
    def perform_destroy(self, instance):
        """Only team owners/admins can delete teams"""
        # Check if user is admin or owner
        membership = TeamMembership.objects.filter(
            user=self.request.user,
            team=instance
        ).first()
        
        if membership and membership.role in ['admin', 'owner']:
            instance.delete()
        else:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Only team admins or owners can delete teams.")


class UpdateTeamMemberRoleView(APIView):
    """API View to update a team member's role"""
    
    permission_classes = [IsAuthenticated]
    
    def patch(self, request, team_id, user_id):
        team = get_object_or_404(Team, id=team_id)
        user = get_object_or_404(User, id=user_id)
        
        # Check if requester is admin or owner of the team
        requester_membership = TeamMembership.objects.filter(
            user=request.user,
            team=team
        ).first()
        
        if not requester_membership or requester_membership.role not in ['admin', 'owner']:
            return Response(
                {"detail": "Only team admins or owners can update member roles."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Check if target user is a member
        membership = TeamMembership.objects.filter(user=user, team=team).first()
        if not membership:
            return Response(
                {"detail": "User is not a member of this team."},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Prevent removing the last owner
        if membership.role == 'owner':
            owner_count = TeamMembership.objects.filter(team=team, role='owner').count()
            if owner_count <= 1:
                return Response(
                    {"detail": "Cannot change role of the last team owner."},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        # Update role
        new_role = request.data.get('role')
        if new_role not in dict(TeamMembership._meta.get_field('role').choices):
            return Response(
                {"detail": f"Invalid role. Must be one of: {', '.join([c[0] for c in TeamMembership._meta.get_field('role').choices])}"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        membership.role = new_role
        membership.save()
        
        serializer = TeamSerializer(team, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)


class UserListView(generics.ListAPIView):
    """API View to list all users with search and filtering"""
    
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = User.objects.all()
        
        # Search by email
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(email__icontains=search)
        
        # Filter by active status
        is_active = self.request.query_params.get('is_active', None)
        if is_active is not None:
            is_active_bool = is_active.lower() == 'true'
            queryset = queryset.filter(is_active=is_active_bool)
        
        return queryset.order_by('email')


class UserDetailView(generics.RetrieveAPIView):
    """API View to retrieve a specific user by ID"""
    
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'id'
