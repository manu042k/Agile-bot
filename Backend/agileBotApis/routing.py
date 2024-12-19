from django.urls import path, re_path
from agileBotApis import consumers
from .consumers import ProgressConsumer

websocket_urlpatterns = [
    re_path(r"ws/chat/$", ProgressConsumer.as_asgi()),
]
