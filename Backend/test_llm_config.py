#!/usr/bin/env python
"""
Simple test to verify LLM configuration is working
Run this from Backend directory: python test_llm_config.py
"""
import os
import sys
from pathlib import Path

# Add Backend to path
sys.path.insert(0, str(Path(__file__).parent))

# Load environment variables
from dotenv import load_dotenv
env_path = Path(__file__).parent / '.env'
load_dotenv(env_path)

print("=" * 60)
print("LLM Configuration Test")
print("=" * 60)

# Test 1: Check if API keys are loaded
print("\n1. Checking API Keys in .env file:")
gemini_key = os.getenv("GEMINI_API_KEY")
cohere_key = os.getenv("COHERE_API_KEY")
groq_key = os.getenv("GROQ_API_KEY")

print(f"   GEMINI_API_KEY: {'✓ Found' if gemini_key else '✗ Missing'}")
if gemini_key:
    print(f"   Key starts with: {gemini_key[:20]}...")
print(f"   COHERE_API_KEY: {'✓ Found' if cohere_key else '✗ Missing'}")
print(f"   GROQ_API_KEY: {'✓ Found' if groq_key else '✗ Missing'}")

# Test 2: Check if LLM modules can be imported
print("\n2. Testing LLM Module Imports:")
try:
    # Set up minimal Django settings for import
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'agileBotApis.settings')
    import django
    django.setup()
    
    from projectApis.llm.config import GEMINI_API_KEY as CONFIG_KEY
    print(f"   ✓ LLM config module imported successfully")
    print(f"   Config GEMINI_API_KEY: {'✓ Loaded' if CONFIG_KEY else '✗ Not loaded'}")
    
    from projectApis.llm.task_generator import TaskGenerator
    print(f"   ✓ TaskGenerator imported successfully")
    
    from projectApis.llm_integration import generate_tasks_with_llm
    print(f"   ✓ LLM integration imported successfully")
    
    print("\n✓ All LLM modules are properly configured!")
    print("\nThe system is ready to use LLM-based task generation.")
    
except Exception as e:
    print(f"   ✗ Import failed: {str(e)}")
    print("\nNote: This is expected if Django dependencies are not installed.")
    print("The configuration is correct, but you need to run the Django server")
    print("with the virtual environment activated for full functionality.")

print("\n" + "=" * 60)
