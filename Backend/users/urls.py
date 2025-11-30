from django.urls import path

from .views import (
    AddTeamMemberView,
    GoogleLoginView,
    GoogleCallbackView,
    GoogleSyncView,
    LogoutView,
    UserMeView,
    RemoveTeamMemberView,
    TeamDetailView,
    TeamListCreateView,
    UpdateTeamMemberRoleView,
    UserInfoView,
    UserListView,
    UserDetailView,
    InviteTeamMemberView,
    AcceptInvitationView,
    UserPreferencesView,
    UpdateUserProfileView,
    HealthCheckView,
)

urlpatterns = [
    # Health check
    path("health/", HealthCheckView.as_view(), name="health-check"),
    # Google OAuth endpoints
    path("auth/google/login/", GoogleLoginView.as_view(), name="google-login"),
    path("auth/google/callback/", GoogleCallbackView.as_view(), name="google-callback"),
    path("auth/google/sync/", GoogleSyncView.as_view(), name="google-sync"),  # For NextAuth.js
    path("auth/logout/", LogoutView.as_view(), name="logout"),
    path("auth/me/", UserMeView.as_view(), name="user-me"),
    # Legacy endpoints (kept for backward compatibility)
    path("user/info/", UserInfoView.as_view(), name="user-info"),
    # Team endpoints
    path("teams/", TeamListCreateView.as_view(), name="team-list-create"),
    path(
        "teams/<int:team_id>/add-member/",
        AddTeamMemberView.as_view(),
        name="add-team-member",
    ),
    path(
        "teams/<int:team_id>/invite/",
        InviteTeamMemberView.as_view(),
        name="invite-team-member",
    ),
    path(
        "invitations/accept/",
        AcceptInvitationView.as_view(),
        name="accept-invitation",
    ),
    path("teams/<int:pk>/", TeamDetailView.as_view(), name="team-detail"),
    path(
        "teams/<int:team_id>/remove-member/<int:user_id>/",
        RemoveTeamMemberView.as_view(),
        name="remove-team-member",
    ),
    path(
        "teams/<int:team_id>/members/<int:user_id>/",
        UpdateTeamMemberRoleView.as_view(),
        name="update-team-member-role",
    ),
    path("users/", UserListView.as_view(), name="user-list"),
    path("users/<int:id>/", UserDetailView.as_view(), name="user-detail"),
    # User preferences and profile
    path("preferences/", UserPreferencesView.as_view(), name="user-preferences"),
    path("profile/update/", UpdateUserProfileView.as_view(), name="update-profile"),
]
