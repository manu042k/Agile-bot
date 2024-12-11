from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import AddTeamMemberView, RegisterView, CustomTokenObtainPairView, RemoveTeamMemberView, TeamDetailView, TeamListCreateView, UserInfoView, UserListView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('user/info/', UserInfoView.as_view(), name='user-info'),
    path('teams/', TeamListCreateView.as_view(), name='team-list-create'),
    path('teams/<int:team_id>/add-member/', AddTeamMemberView.as_view(), name='add-team-member'),
    path('teams/<int:pk>/', TeamDetailView.as_view(), name='team-detail'),
    path('teams/<int:team_id>/remove-member/<int:user_id>/', RemoveTeamMemberView.as_view(), name='remove-team-member'),
    path('users/', UserListView.as_view(), name='user-list'),
]