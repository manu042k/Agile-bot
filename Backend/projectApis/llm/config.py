"""
Configuration for LLM Task Generation System
Loads from Django settings and Backend .env file
"""
import os
from pathlib import Path
from django.conf import settings

# Load environment variables from Backend .env if not already loaded
from dotenv import load_dotenv
env_path = Path(__file__).resolve().parent.parent.parent / '.env'
load_dotenv(env_path)

# Gemini API Configuration
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", getattr(settings, 'GEMINI_API_KEY', None))

if not GEMINI_API_KEY:
    import logging
    logger = logging.getLogger(__name__)
    logger.warning(
        "GEMINI_API_KEY not found in environment or Django settings. "
        "Please add GEMINI_API_KEY to Backend/.env file. "
        "Task generation will fail without a valid API key."
    )

# Dependency Detection Thresholds
ENTITY_EXTRACTION_THRESHOLD = float(os.getenv(
    "ENTITY_EXTRACTION_THRESHOLD",
    getattr(settings, 'ENTITY_EXTRACTION_THRESHOLD', 0.5)
))

# Performance Configuration
NUM_WORKERS = int(os.getenv(
    "LLM_NUM_WORKERS",
    getattr(settings, 'LLM_NUM_WORKERS', 8)
))

# Rate Limiting
GEMINI_RATE_LIMIT_PER_MINUTE = int(os.getenv(
    "GEMINI_RATE_LIMIT_PER_MINUTE",
    getattr(settings, 'GEMINI_RATE_LIMIT_PER_MINUTE', 10)
))

# Sprint Configuration
DEFAULT_SPRINT_CAPACITY = int(os.getenv(
    "DEFAULT_SPRINT_CAPACITY",
    getattr(settings, 'DEFAULT_SPRINT_CAPACITY', 50)
))

DEFAULT_SPRINT_DURATION_DAYS = int(os.getenv(
    "DEFAULT_SPRINT_DURATION_DAYS",
    getattr(settings, 'DEFAULT_SPRINT_DURATION_DAYS', 14)
))

# Default Team Description
DEFAULT_TEAM_DESCRIPTION = os.getenv(
    "DEFAULT_TEAM_DESCRIPTION",
    getattr(settings, 'DEFAULT_TEAM_DESCRIPTION', """
- 2 Senior Backend Engineers (Python, SQL, System Design)
- 1 Senior Frontend Engineer (React, TypeScript, CSS)
- 1 DevOps Engineer (Docker, Kubernetes, CI/CD)
- 1 QA Engineer (Automation, Testing)
""")
)
