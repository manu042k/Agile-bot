# your_project/celery.py

from __future__ import absolute_import, unicode_literals
import os
from celery import Celery
import logging

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "agileBotApis.settings")

app = Celery("agileBotApis")

app.config_from_object("django.conf:settings", namespace="CELERY")

app.autodiscover_tasks()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
