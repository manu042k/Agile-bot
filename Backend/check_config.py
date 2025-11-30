#!/usr/bin/env python
"""Check Celery configuration"""
import os
from dotenv import load_dotenv

load_dotenv()

print("Environment Variables:")
print(f"REDIS_URI from env: {os.getenv('REDIS_URI')}")

# Now load Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'agileBotApis.settings')
import django
django.setup()

from django.conf import settings

print("\nDjango Settings:")
print(f"CELERY_BROKER_URL: {settings.CELERY_BROKER_URL}")
print(f"CELERY_RESULT_BACKEND: {settings.CELERY_RESULT_BACKEND}")

# Check Celery app config
from agileBotApis.celery import app
print("\nCelery App Config:")
print(f"Broker URL: {app.conf.broker_url}")
print(f"Result Backend: {app.conf.result_backend}")
