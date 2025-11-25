from django.urls import path, re_path
from agileBotApis import consumers
from .consumers import ProgressConsumer, ActivityConsumer

websocket_urlpatterns = [
    re_path(r"ws/chat/$", ProgressConsumer.as_asgi()),
    re_path(r"ws/activities/$", ActivityConsumer.as_asgi()),
    re_path(r"ws/activities/(?P<project_id>\d+)/$", ActivityConsumer.as_asgi()),
]
