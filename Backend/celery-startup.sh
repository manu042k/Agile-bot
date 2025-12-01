#!/bin/bash

# Exit on error
set -e

echo "Starting Agile Bot Celery Worker..."

# Wait for backend to be ready (optional)
sleep 10

echo "Starting Celery worker..."
# Start Celery worker
exec celery -A agileBotApis worker \
    --loglevel=info \
    --concurrency=4 \
    --max-tasks-per-child=1000 \
    --time-limit=300 \
    --soft-time-limit=240
