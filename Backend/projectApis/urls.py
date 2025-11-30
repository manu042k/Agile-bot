from django.urls import path, include

from .views import (
    AssigenTeamToProject,
    FileUploadShow,
    ProjectViewSet,
    TaskByProjectView,
    TaskListCreateView,
    TaskDetailView,
    CommentListCreateView,
    TaskPatchView,
    TriggerTaskGeneration,
    GenerateTasksView,
    ActivityListView,
    RecentActivitiesView,
    ProjectActivitiesView,
    DocumentListCreateView,
    DocumentDetailView,
    AllDocumentsView,
    ProjectTimelineView,
    SprintListView,
    SprintDetailView,
)
from rest_framework.routers import DefaultRouter
from .views import FileUploadView

router = DefaultRouter()
router.register(r"projects", ProjectViewSet, basename="project")


# Include the router's URLs in your app's urlpatterns
urlpatterns = [
    path("upload/", FileUploadView.as_view(), name="file-upload"),
    path("view/", FileUploadShow.as_view(), name="file-view"),
    path("tasks/", TaskListCreateView.as_view(), name="task-list-create"),
    path("tasks/<uuid:pk>/", TaskDetailView.as_view(), name="task-detail"),
    path("tasks-patch/<uuid:pk>/", TaskPatchView.as_view(), name="task-patch"),
    path(
        "tasks/<uuid:task_id>/comments/",
        CommentListCreateView.as_view(),
        name="task-comment-list-create",
    ),
    path(
        "projects/<uuid:project_uuid>/tasks/",
        TaskByProjectView.as_view(),
        name="get-tasks-by-project",
    ),
    path(
        "projects/<uuid:project_uuid>/timeline/",
        ProjectTimelineView.as_view(),
        name="project-timeline",
    ),
    path(
        "projects/assign-team/",
        AssigenTeamToProject.as_view(),
        name="assign-team-to-project",
    ),
    path("trigger/", TriggerTaskGeneration.as_view(), name="trigger-task-generation"),
    path(
        "projects/<uuid:project_uuid>/generate-tasks/",
        GenerateTasksView.as_view(),
        name="generate-tasks",
    ),
    # Activity endpoints
    path("activities/", ActivityListView.as_view(), name="activity-list"),
    path("activities/recent/", RecentActivitiesView.as_view(), name="recent-activities"),
    path(
        "projects/<uuid:project_uuid>/activities/",
        ProjectActivitiesView.as_view(),
        name="project-activities",
    ),
    # Document endpoints
    path(
        "documents/",
        AllDocumentsView.as_view(),
        name="all-documents",
    ),
    path(
        "projects/<uuid:project_uuid>/documents/",
        DocumentListCreateView.as_view(),
        name="project-documents-list-create",
    ),
    path(
        "projects/<uuid:project_uuid>/documents/<uuid:document_uuid>/",
        DocumentDetailView.as_view(),
        name="project-document-detail",
    ),
    # Sprint endpoints
    path(
        "projects/<uuid:project_uuid>/sprints/",
        SprintListView.as_view(),
        name="sprint-list-create",
    ),
    path(
        "projects/<uuid:project_uuid>/sprints/<uuid:sprint_uuid>/",
        SprintDetailView.as_view(),
        name="sprint-detail",
    ),
] + router.urls
