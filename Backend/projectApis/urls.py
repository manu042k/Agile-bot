from django.urls import path, include
from .views import FileUploadShow, ProjectViewSet
from rest_framework.routers import DefaultRouter
from .views import FileUploadView

router = DefaultRouter()
router.register(r'projects', ProjectViewSet, basename='project')

        
# Include the router's URLs in your app's urlpatterns
urlpatterns = [
        path('upload/', FileUploadView.as_view(), name='file-upload'),
        path('view/',FileUploadShow.as_view(),name='file-view')


] + router.urls
