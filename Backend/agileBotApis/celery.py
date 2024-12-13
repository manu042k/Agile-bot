# your_project/celery.py

from __future__ import absolute_import, unicode_literals
import os
from celery import Celery
import logging

# set the default Django settings module for the 'celery' program.
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'agileBotApis.settings')

app = Celery('agileBotApis')

# Using a string here means the worker doesn't have to serialize
# the configuration object to child processes.
# - namespace='CELERY' means all celery-related config keys should have a `CELERY_` prefix.
app.config_from_object('django.conf:settings', namespace='CELERY')

# Load task modules from all registered Django app configs.
app.autodiscover_tasks()

logging.basicConfig(
    level=logging.INFO,  # Set the logging level to INFO or DEBUG
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
)