
from django.urls import path
from .views import CreateTeamView, GoogleLogin

urlpatterns = [
    path('google/login/', GoogleLogin.as_view()),
    path('teams/', CreateTeamView.as_view(), name='create-team'),

]

