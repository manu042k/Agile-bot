from django.urls import path, include
from .views import ProjectViewSet
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'projects', ProjectViewSet, basename='project')

# Include the router's URLs in your app's urlpatterns
urlpatterns = [
] + router.urls