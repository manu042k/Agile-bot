# Celery Background Jobs Setup

## Sprint Auto-Completion Feature

This project includes a background job that automatically moves unfinished tasks to backlog when a sprint ends.

## How It Works

1. **Automatic Sprint Cleanup**: Every hour, the system checks for sprints that have passed their end date
2. **Task Migration**: All unfinished tasks (not marked as "completed") are:
   - Moved to "backlog" status
   - Removed from the sprint
3. **Sprint Completion**: The sprint status is updated to "completed"

## Running Celery

### Prerequisites
- Redis must be running (configured in `.env` as `REDIS_URI`)
- Django application must be running

### Start Celery Worker
In a separate terminal, run:
```bash
cd Backend
celery -A agileBotApis worker --loglevel=info
```

### Start Celery Beat (Scheduler)
In another separate terminal, run:
```bash
cd Backend
celery -A agileBotApis beat --loglevel=info
```

### Run Both Together (Development)
```bash
cd Backend
celery -A agileBotApis worker --beat --loglevel=info
```

## Manual Sprint Completion

You can manually trigger sprint completion using Django shell:

```python
from projectApis.tasks import check_and_complete_sprint

# Complete a specific sprint by ID
result = check_and_complete_sprint.delay(sprint_id=1)
print(result.get())
```

## Configuration

### Change Schedule Frequency

Edit `Backend/agileBotApis/settings.py`:

```python
CELERY_BEAT_SCHEDULE = {
    'move-unfinished-tasks-to-backlog': {
        'task': 'projectApis.tasks.move_unfinished_tasks_to_backlog',
        'schedule': 3600.0,  # Current: Every hour
        # Options:
        # 'schedule': 300.0,  # Every 5 minutes
        # 'schedule': crontab(hour=0, minute=0),  # Daily at midnight
        # 'schedule': crontab(hour='*/6'),  # Every 6 hours
    },
}
```

## Monitoring

### Check Celery Logs
The worker and beat processes will log:
- Sprint processing activities
- Number of tasks moved
- Any errors encountered

### View Task Results
```python
from celery.result import AsyncResult

# Check task status
result = AsyncResult('task-id-here')
print(result.status)
print(result.result)
```

## Production Deployment

For production, use a process manager like Supervisor or systemd:

### Supervisor Example
```ini
[program:celery-worker]
command=/path/to/venv/bin/celery -A agileBotApis worker --loglevel=info
directory=/path/to/Backend
user=your-user
autostart=true
autorestart=true

[program:celery-beat]
command=/path/to/venv/bin/celery -A agileBotApis beat --loglevel=info
directory=/path/to/Backend
user=your-user
autostart=true
autorestart=true
```

## Troubleshooting

### Redis Connection Issues
- Ensure Redis is running: `redis-cli ping` should return `PONG`
- Check `REDIS_URI` in `.env` file

### Tasks Not Running
- Verify Celery worker is running
- Verify Celery beat is running
- Check logs for errors

### Manual Testing
```python
# In Django shell
from projectApis.tasks import move_unfinished_tasks_to_backlog

# Run immediately (not async)
result = move_unfinished_tasks_to_backlog()
print(result)
```
