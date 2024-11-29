from rest_framework.permissions import BasePermission

class IsProjectOwnerOrTeamMember(BasePermission):
    """
    Custom permission to allow only the project creator or team members to access the project.
    """
    def has_object_permission(self, request, view, obj):
        # Allow access if the user is the creator or a member of the team
        return obj.created_by == request.user or request.user in obj.team.members.all()
