from rest_framework.permissions import BasePermission


class IsTeamMember(BasePermission):
    """
    Custom permission to allow only team members to access the team.
    """
    def has_object_permission(self, request, view, obj):
        # Allow access if the user is a member of the team
        return request.user in obj.team.members.all()
