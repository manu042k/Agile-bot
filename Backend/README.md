# Backend

This folder contains the backend code for the Agile-bot project. The backend is built using Django DRF, WebSockets, and Celery.

## Features

- **User Management**: Handles user registration, authentication, and profile management.
- **Project Management**: Allows users to create, update, and manage projects.
- **Task Generation**: Utilizes Large Language Models (LLMs) to generate tasks based on project requirements.

## Technologies Used

- **Django DRF**: For building RESTful APIs.
- **WebSockets**: For real-time communication.
- **Celery**: For handling asynchronous tasks.

## Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/Agile-bot.git
   cd Agile-bot/Backend
   ```

2. Create a virtual environment:

   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows use `venv\Scripts\activate`
   ```

3. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

4. Run migrations:

   ```bash
   python manage.py migrate
   ```

5. Start the development server:

   ```bash
   python manage.py runserver
   ```

6. Start Celery worker:
   ```bash
   celery -A agileBotApis worker --loglevel=info
   ```
