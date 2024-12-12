from django.urls import path, include
from .views import AssigenTeamToProject, FileUploadShow, ProjectViewSet, TaskByProjectView,TaskListCreateView,TaskDetailView,CommentListCreateView
from rest_framework.routers import DefaultRouter
from .views import FileUploadView

router = DefaultRouter()
router.register(r'projects', ProjectViewSet, basename='project')

        
# Include the router's URLs in your app's urlpatterns
urlpatterns = [
        path('upload/', FileUploadView.as_view(), name='file-upload'),
        path('view/',FileUploadShow.as_view(),name='file-view'),
        path('tasks/', TaskListCreateView.as_view(), name='task-list-create'),
        path('tasks/<uuid:pk>/', TaskDetailView.as_view(), name='task-detail'),
        path('tasks/<uuid:task_id>/comments/', CommentListCreateView.as_view(), name='task-comment-list-create'),
        path('projects/<int:project_id>/tasks/', TaskByProjectView.as_view(), name='get-tasks-by-project'),
        path('projects/assign-team/', AssigenTeamToProject.as_view(), name='assign-team-to-project'),
] + router.urls
