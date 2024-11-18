from dj_rest_auth.registration.views import SocialLoginView
from rest_framework.permissions import IsAuthenticated
from rest_framework import generics
from .serializers import GoogleLoginSerializer,CreateTeamSerializer

class GoogleLogin(SocialLoginView):
    serializer_class = GoogleLoginSerializer



class CreateTeamView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = CreateTeamSerializer

    def perform_create(self, serializer):
        serializer.save(company=self.request.user)