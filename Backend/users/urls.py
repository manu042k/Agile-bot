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
    UserInfoView,
    UserListView,
)

urlpatterns = [
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
    path("teams/<int:pk>/", TeamDetailView.as_view(), name="team-detail"),
    path(
        "teams/<int:team_id>/remove-member/<int:user_id>/",
        RemoveTeamMemberView.as_view(),
        name="remove-team-member",
    ),
    path("users/", UserListView.as_view(), name="user-list"),
]
