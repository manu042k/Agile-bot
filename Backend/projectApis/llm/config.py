"""
Configuration for LLM Task Generation System
"""
import os
from pathlib import Path

# Gemini API Configuration
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "AIzaSyBLMo0OUql8RhXccp744eSp9cVu42Tihp0")

# Vector Database Configuration
QDRANT_PATH = "./qdrant_db"

# Model Configuration
EMBEDDING_MODEL = "all-MiniLM-L6-v2"

# Dependency Detection Thresholds
DEPENDENCY_SIMILARITY_THRESHOLD = 0.65
ENTITY_EXTRACTION_THRESHOLD = 0.5

# Performance Configuration
NUM_WORKERS = 8
BATCH_SIZE = 64

# Default Team Description
DEFAULT_TEAM_DESCRIPTION = """
- 2 Senior Backend Engineers (Python, SQL, System Design)
- 1 Senior Frontend Engineer (React, TypeScript, CSS)
- 1 DevOps Engineer (Docker, Kubernetes, CI/CD)
- 1 QA Engineer (Automation, Testing)
"""
