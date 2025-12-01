#!/bin/bash

# Exit on error
set -e

echo "Starting Agile Bot Backend..."

# Run database migrations
echo "Running database migrations..."
python manage.py migrate --noinput

# Collect static files (if needed)
echo "Collecting static files..."
python manage.py collectstatic --noinput --clear || true

# Create superuser if it doesn't exist (optional)
# python manage.py shell -c "from django.contrib.auth import get_user_model; User = get_user_model(); User.objects.filter(username='admin').exists() or User.objects.create_superuser('admin', 'admin@example.com', 'admin')" || true

echo "Starting Gunicorn server..."
# Start Gunicorn with proper settings for Azure
exec gunicorn agileBotApis.wsgi:application \
    --bind 0.0.0.0:8000 \
    --workers 4 \
    --threads 2 \
    --timeout 120 \
    --access-logfile - \
    --error-logfile - \
    --log-level info \
    --capture-output \
    --enable-stdio-inheritance
