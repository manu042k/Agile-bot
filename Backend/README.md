# Backend

This directory contains the Django REST Framework backend for the Agile-bot platform. It provides RESTful APIs for user management, project management, task generation, and real-time communication through WebSockets.

## Overview

The backend is built with Django 5.0 and Django REST Framework, featuring:
- RESTful API endpoints for all platform features
- JWT-based authentication with Google OAuth2 integration
- Celery for asynchronous task processing
- Django Channels for WebSocket real-time updates
- Integration with AI services for intelligent task generation
- Azure Blob Storage support for production deployments
- PostgreSQL database support for production

## Architecture

### Main Components

- **agileBotApis/**: Main Django project configuration
  - Settings, URLs, ASGI/WSGI configuration
  - Celery configuration
  - WebSocket routing

- **users/**: User management application
  - User registration and authentication
  - Profile management
  - Google OAuth integration
  - JWT token handling

- **projectApis/**: Project and task management
  - Project CRUD operations
  - Task generation and management
  - Sprint planning
  - Team management
  - Document upload and processing
  - LLM integration for AI-powered features

- **media/**: User-uploaded files (development only)
  - Requirement documents
  - Project attachments
  - User avatars

## Features

### Authentication & Authorization
- JWT token-based authentication
- Google OAuth2 social authentication
- Token refresh and blacklisting
- Email verification
- Password reset functionality

### User Management
- User registration and login
- Profile management with avatar support
- Email notifications
- Team invitations via email

### Project Management
- Create, read, update, delete projects
- Project member management
- Role-based access control
- Project document uploads
- Project status tracking

### Task Generation
- AI-powered user story generation from requirement documents
- Automatic acceptance criteria extraction
- Story point estimation
- Task dependency detection
- Priority assignment
- Sprint allocation

### Real-time Features
- WebSocket connections for live updates
- Real-time task generation progress
- Live collaboration notifications
- Document processing status updates

### Asynchronous Processing
- Celery workers for background tasks
- Document processing pipeline
- LLM API calls with rate limiting
- Email sending
- Periodic task scheduling

## Technologies Used

### Core Framework
- **Django 5.0**: Web framework
- **Django REST Framework 3.14**: RESTful API toolkit
- **Django Channels 4.0**: WebSocket support
- **Daphne 4.0**: ASGI server

### Authentication
- **djangorestframework-simplejwt**: JWT authentication
- **django-allauth**: Social authentication
- **social-auth-app-django**: OAuth providers
- **dj-rest-auth**: REST authentication endpoints

### Task Queue
- **Celery 5.3**: Distributed task queue
- **Redis 5.0**: Message broker and cache
- **django-redis**: Redis cache backend

### Storage & Database
- **psycopg2-binary**: PostgreSQL adapter
- **django-storages**: Cloud storage backends
- **azure-storage-blob**: Azure Blob Storage
- **Pillow**: Image processing

### AI Integration
- **google-genai**: Google Gemini API
- **docling**: Document processing
- **pydantic**: Data validation

### Production Server
- **gunicorn**: WSGI HTTP server
- **channels-redis**: Redis channel layer

### API Documentation
- **drf-spectacular**: OpenAPI 3 schema generation
- **drf-yasg**: Swagger/ReDoc documentation

## Setup

### Prerequisites
- Python 3.10 or higher
- Redis server
- PostgreSQL (for production)
- Virtual environment tool (venv or virtualenv)

### Installation

1. Navigate to the Backend directory:
```bash
cd Backend
```

2. Create and activate a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Configure environment variables:
```bash
cp .env.production.template .env
# Edit .env with your configuration
```

5. Run database migrations:
```bash
python manage.py migrate
```

6. Create a superuser (optional):
```bash
python manage.py createsuperuser
```

7. Collect static files (production):
```bash
python manage.py collectstatic
```

### Running the Application

#### Development Mode

1. Start Redis (in a separate terminal):
```bash
redis-server
```

2. Start the Django development server:
```bash
python manage.py runserver
```

3. Start Celery worker (in a separate terminal):
```bash
celery -A agileBotApis worker --loglevel=info
```

4. Start Celery beat scheduler (optional, for periodic tasks):
```bash
celery -A agileBotApis beat --loglevel=info
```

The API will be available at http://localhost:8000

#### Production Mode

Use the provided startup script:
```bash
chmod +x startup.sh
./startup.sh
```

Or use Gunicorn directly:
```bash
gunicorn agileBotApis.wsgi:application --bind 0.0.0.0:8000 --workers 4
```

### Docker Deployment

Build and run with Docker:
```bash
docker build -t agilebot-backend .
docker run -p 8000:8000 --env-file .env agilebot-backend
```

Or use Docker Compose from the root directory:
```bash
docker-compose up backend celery
```

## Configuration

### Environment Variables

Key configuration options in `.env`:

#### Django Settings
- `SECRET_KEY`: Django secret key for cryptographic signing
- `DEBUG`: Enable debug mode (True/False)
- `ALLOWED_HOSTS`: Comma-separated list of allowed hosts
- `DJANGO_LOG_LEVEL`: Logging level (DEBUG, INFO, WARNING, ERROR)

#### Database
- `USE_POSTGRESQL`: Use PostgreSQL instead of SQLite (True/False)
- `DB_NAME`: Database name
- `DB_USER`: Database user
- `DB_PASSWORD`: Database password
- `DB_HOST`: Database host
- `DB_PORT`: Database port

#### Redis
- `REDIS_URI`: Redis connection URI (e.g., redis://localhost:6379)
- `USE_REDIS_CACHE`: Enable Redis caching (True/False)

#### AI Services
- `GROQ_API_KEY`: Groq AI API key for LLM inference
- `COHERE_API_KEY`: Cohere API key for embeddings
- `GEMINI_API_KEY`: Google Gemini API key for validation

#### LLM Configuration
- `ENTITY_EXTRACTION_THRESHOLD`: Threshold for entity extraction (0.0-1.0)
- `LLM_NUM_WORKERS`: Number of parallel LLM workers
- `GEMINI_RATE_LIMIT_PER_MINUTE`: API rate limit
- `DEFAULT_SPRINT_CAPACITY`: Default sprint capacity in story points
- `DEFAULT_SPRINT_DURATION_DAYS`: Default sprint duration

#### Authentication
- `ACCESS_TOKEN_LIFETIME`: JWT access token lifetime (minutes)
- `REFRESH_TOKEN_LIFETIME`: JWT refresh token lifetime (days)
- `GOOGLE_OAUTH_CLIENT_ID`: Google OAuth client ID
- `GOOGLE_OAUTH_CLIENT_SECRET`: Google OAuth client secret
- `GOOGLE_OAUTH_REDIRECT_URI`: OAuth callback URL

#### Email
- `EMAIL_HOST`: SMTP server host
- `EMAIL_PORT`: SMTP server port
- `EMAIL_USE_TLS`: Use TLS (True/False)
- `EMAIL_HOST_USER`: SMTP username
- `EMAIL_HOST_PASSWORD`: SMTP password
- `DEFAULT_FROM_EMAIL`: Default sender email

#### Storage
- `USE_AZURE_STORAGE`: Use Azure Blob Storage (True/False)
- `AZURE_ACCOUNT_NAME`: Azure storage account name
- `AZURE_ACCOUNT_KEY`: Azure storage account key
- `AZURE_CONTAINER_NAME`: Azure container name

#### Security
- `CSRF_TRUSTED_ORIGINS`: Comma-separated trusted origins
- `CORS_ALLOWED_ORIGINS`: Comma-separated allowed CORS origins
- `SECURE_SSL_REDIRECT`: Redirect HTTP to HTTPS (True/False)
- `CSRF_COOKIE_SECURE`: Secure CSRF cookie (True/False)

#### Frontend Integration
- `FRONTEND_URL`: Frontend application URL for links

## API Endpoints

### Authentication
- `POST /api/accounts/register/` - User registration
- `POST /api/accounts/login/` - User login
- `POST /api/accounts/token/refresh/` - Refresh JWT token
- `POST /api/accounts/logout/` - User logout
- `GET /api/accounts/auth/google/` - Google OAuth login
- `GET /api/accounts/auth/google/callback/` - Google OAuth callback

### User Management
- `GET /api/accounts/profile/` - Get user profile
- `PUT /api/accounts/profile/` - Update user profile
- `POST /api/accounts/password/reset/` - Request password reset
- `POST /api/accounts/password/reset/confirm/` - Confirm password reset

### Projects
- `GET /api/projects/` - List user projects
- `POST /api/projects/` - Create new project
- `GET /api/projects/{id}/` - Get project details
- `PUT /api/projects/{id}/` - Update project
- `DELETE /api/projects/{id}/` - Delete project
- `POST /api/projects/{id}/upload-document/` - Upload requirement document
- `POST /api/projects/{id}/generate-tasks/` - Trigger task generation

### Tasks
- `GET /api/projects/{id}/tasks/` - List project tasks
- `POST /api/projects/{id}/tasks/` - Create task
- `GET /api/tasks/{id}/` - Get task details
- `PUT /api/tasks/{id}/` - Update task
- `DELETE /api/tasks/{id}/` - Delete task

### Teams
- `GET /api/teams/` - List teams
- `POST /api/teams/` - Create team
- `POST /api/teams/{id}/invite/` - Invite team member
- `GET /api/teams/{id}/members/` - List team members

### WebSocket
- `ws://localhost:8000/ws/tasks/{project_id}/` - Task generation updates

## API Documentation

Interactive API documentation is available when the server is running:
- Swagger UI: http://localhost:8000/api/docs/
- ReDoc: http://localhost:8000/api/redoc/
- OpenAPI Schema: http://localhost:8000/api/schema/

## Database Models

### User Model
- Extended Django user model
- Profile information
- Avatar support
- Team memberships

### Project Model
- Project metadata
- Owner and members
- Document attachments
- Status tracking

### Task Model
- User story details
- Acceptance criteria
- Story points
- Priority and status
- Dependencies
- Sprint assignment

### Team Model
- Team information
- Member roles
- Capacity planning

### Sprint Model
- Sprint metadata
- Duration and capacity
- Task allocation

## Celery Tasks

### Document Processing
- `process_requirement_document`: Parse uploaded documents
- `extract_requirements`: Extract requirements using AI
- `generate_user_stories`: Generate tasks from requirements

### Email Tasks
- `send_invitation_email`: Send team invitations
- `send_notification_email`: Send user notifications

### Periodic Tasks
- `cleanup_old_files`: Remove expired temporary files
- `update_sprint_status`: Update sprint statuses

## Testing

Run tests with:
```bash
python manage.py test
```

Run specific test modules:
```bash
python manage.py test users
python manage.py test projectApis
```

## Logging

Logs are written to:
- `django-server.log`: General application logs
- `django_requests.log`: HTTP request logs
- Console output in development mode

Configure log level with `DJANGO_LOG_LEVEL` environment variable.


## Deployment

### Azure App Service

1. Configure Azure resources
2. Set environment variables in App Service configuration
3. Deploy using the provided script:
```bash
./deploy-celery-azure.sh
```

### Docker Production

Use the production Docker Compose:
```bash
docker-compose -f docker-compose.prod.yml up -d
```

## Monitoring

- Check application logs regularly
- Monitor Celery task queue length
- Track API response times
- Monitor database performance
- Set up error tracking (e.g., Sentry)
- Monitor Redis memory usage

