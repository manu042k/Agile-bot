# your_project/celery.py

from __future__ import absolute_import, unicode_literals
import os
from celery import Celery
import logging
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "agileBotApis.settings")

# Get Redis URI from environment
redis_uri = os.getenv("REDIS_URI", "redis://localhost:6379")

# Create Celery app
app = Celery("agileBotApis")

# Load config from Django settings
app.config_from_object("django.conf:settings", namespace="CELERY")

# Explicitly set broker and backend to ensure Redis is used
app.conf.update(
    broker_url=redis_uri,
    result_backend=redis_uri,
    broker_connection_retry_on_startup=True,
)

app.autodiscover_tasks()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
