#!/bin/bash

# Exit on error
set -e

echo "Starting Agile Bot Celery Beat Scheduler..."

# Wait for backend to be ready
sleep 15

echo "Starting Celery beat..."
# Start Celery beat for scheduled tasks
exec celery -A agileBotApis beat \
    --loglevel=info \
    --scheduler django_celery_beat.schedulers:DatabaseScheduler
