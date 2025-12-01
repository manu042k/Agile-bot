#!/usr/bin/env python
"""
Test script to verify background tasks and Celery configuration
"""
import os
import django
import sys

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'agileBotApis.settings')
django.setup()

from projectApis.models import Project, Task, Document
from users.models import User
import json

def check_celery_configuration():
    """Check if Celery is properly configured"""
    print("=" * 80)
    print("Checking Celery Configuration")
    print("=" * 80)
    
    try:
        from agileBotApis import celery_app
        print(f"✅ Celery app found: {celery_app}")
        print(f"   Broker: {celery_app.conf.broker_url}")
        print(f"   Backend: {celery_app.conf.result_backend}")
        return True
    except ImportError as e:
        print(f"❌ Celery not configured: {e}")
        return False
    except Exception as e:
        print(f"⚠️  Celery configuration issue: {e}")
        return False


def check_task_generation_dependencies():
    """Check if task generation dependencies are available"""
    print("\n" + "=" * 80)
    print("Checking Task Generation Dependencies")
    print("=" * 80)
    
    dependencies = {
        'LLM Integration': False,
        'Orchestrator': False,
        'Task Generator': False,
        'Django Integration': False,
    }
    
    # Check LLM integration
    try:
        from projectApis.llm_integration import generate_tasks_from_requirements
        print("✅ LLM Integration module found")
        dependencies['LLM Integration'] = True
    except ImportError as e:
        print(f"❌ LLM Integration not available: {e}")
    except Exception as e:
        print(f"⚠️  LLM Integration issue: {e}")
    
    # Check orchestrator
    try:
        from projectApis.llm.orchestrator import TaskGenerationOrchestrator
        print("✅ Orchestrator module found")
        dependencies['Orchestrator'] = True
    except ImportError as e:
        print(f"❌ Orchestrator not available: {e}")
    except Exception as e:
        print(f"⚠️  Orchestrator issue: {e}")
    
    # Check task generator
    try:
        from projectApis.llm.task_generator import TaskGenerator
        print("✅ Task Generator module found")
        dependencies['Task Generator'] = True
    except ImportError as e:
        print(f"❌ Task Generator not available: {e}")
    except Exception as e:
        print(f"⚠️  Task Generator issue: {e}")
    
    # Check Django integration
    try:
        from projectApis.llm.django_integration import DjangoTaskSaver
        print("✅ Django Integration module found")
        dependencies['Django Integration'] = True
    except ImportError as e:
        print(f"❌ Django Integration not available: {e}")
    except Exception as e:
        print(f"⚠️  Django Integration issue: {e}")
    
    return all(dependencies.values())


def check_database_state():
    """Check database state for testing"""
    print("\n" + "=" * 80)
    print("Checking Database State")
    print("=" * 80)
    
    # Check projects
    project_count = Project.objects.count()
    print(f"\n📊 Projects: {project_count}")
    
    if project_count > 0:
        project = Project.objects.first()
        print(f"   Sample: {project.name} (UUID: {project.uuid})")
    
    # Check tasks
    task_count = Task.objects.count()
    print(f"\n📊 Tasks: {task_count}")
    
    if task_count > 0:
        ai_tasks = Task.objects.filter(created_by='ai').count()
        user_tasks = Task.objects.filter(created_by='user').count()
        print(f"   AI-generated: {ai_tasks}")
        print(f"   User-created: {user_tasks}")
    
    # Check documents
    document_count = Document.objects.count()
    print(f"\n📊 Documents: {document_count}")
    
    if document_count > 0:
        doc = Document.objects.first()
        print(f"   Sample: {doc.name} (Project: {doc.project.name})")
    
    # Check users
    user_count = User.objects.count()
    print(f"\n📊 Users: {user_count}")
    
    return {
        'projects': project_count,
        'tasks': task_count,
        'documents': document_count,
        'users': user_count,
    }


def test_task_generation_endpoint():
    """Test the task generation endpoint logic"""
    print("\n" + "=" * 80)
    print("Testing Task Generation Logic")
    print("=" * 80)
    
    # Get a project with documents
    projects_with_docs = Project.objects.filter(documents__isnull=False).distinct()
    
    if not projects_with_docs.exists():
        print("⚠️  No projects with documents found")
        print("   To test task generation, you need:")
        print("   1. A project")
        print("   2. A requirements document uploaded to that project")
        return False
    
    project = projects_with_docs.first()
    print(f"\n✓ Found project with documents: {project.name}")
    
    # Check for existing AI tasks
    existing_ai_tasks = Task.objects.filter(Project=project, created_by='ai').count()
    print(f"   Existing AI tasks: {existing_ai_tasks}")
    
    if existing_ai_tasks > 0:
        print("   ⚠️  Project already has AI-generated tasks")
        print("   The API would return an error for this project")
        print("   This is expected behavior to prevent duplicate generation")
    
    # Check documents
    documents = Document.objects.filter(project=project)
    print(f"\n📄 Documents in project: {documents.count()}")
    
    for doc in documents:
        print(f"   - {doc.name} (Category: {doc.category or 'None'})")
    
    # Check for requirements document
    requirements_doc = documents.filter(
        category__icontains='requirement'
    ).first() or documents.filter(
        name__icontains='requirement'
    ).first() or documents.first()
    
    if requirements_doc:
        print(f"\n✅ Requirements document found: {requirements_doc.name}")
        print(f"   File: {requirements_doc.file.name if requirements_doc.file else 'None'}")
        try:
            file_size = requirements_doc.file.size if requirements_doc.file else 0
            print(f"   Size: {file_size} bytes")
        except FileNotFoundError:
            print(f"   ⚠️  File not found on disk (may have been moved/deleted)")
        except Exception as e:
            print(f"   ⚠️  Cannot read file size: {e}")
    else:
        print("\n❌ No requirements document found")
        return False
    
    return True


def dump_task_generation_config():
    """Dump task generation configuration"""
    print("\n" + "=" * 80)
    print("Task Generation Configuration")
    print("=" * 80)
    
    try:
        from projectApis.llm.config import LLMConfig
        
        print("\n📋 LLM Configuration:")
        print(f"   Model: {LLMConfig.MODEL}")
        print(f"   Temperature: {LLMConfig.TEMPERATURE}")
        print(f"   Max Tokens: {LLMConfig.MAX_TOKENS}")
        print(f"   Chunk Size: {LLMConfig.CHUNK_SIZE}")
        print(f"   Chunk Overlap: {LLMConfig.CHUNK_OVERLAP}")
        
        # Check if API key is set
        import os
        api_key = os.getenv('OPENAI_API_KEY') or os.getenv('GROQ_API_KEY')
        if api_key:
            print(f"   API Key: {'*' * 20}{api_key[-4:]}")
        else:
            print("   ⚠️  No API key found in environment")
        
        return True
    except ImportError as e:
        print(f"❌ Cannot load LLM config: {e}")
        return False
    except Exception as e:
        print(f"⚠️  Config issue: {e}")
        return False


def test_websocket_configuration():
    """Check WebSocket configuration for real-time updates"""
    print("\n" + "=" * 80)
    print("Checking WebSocket Configuration")
    print("=" * 80)
    
    try:
        from channels.layers import get_channel_layer
        channel_layer = get_channel_layer()
        
        if channel_layer:
            print(f"✅ Channel layer configured: {type(channel_layer).__name__}")
            print(f"   Backend: {channel_layer.__class__.__module__}")
        else:
            print("⚠️  No channel layer configured")
            print("   WebSocket updates will not work")
        
        return channel_layer is not None
    except ImportError:
        print("❌ Django Channels not installed")
        return False
    except Exception as e:
        print(f"⚠️  Channel layer issue: {e}")
        return False


def main():
    print("\n" + "=" * 80)
    print("BACKGROUND TASKS & TASK GENERATION TEST SUITE")
    print("=" * 80)
    
    results = []
    
    # Test 1: Celery configuration
    print("\n[TEST 1] Celery Configuration")
    results.append(("Celery Config", check_celery_configuration()))
    
    # Test 2: Task generation dependencies
    print("\n[TEST 2] Task Generation Dependencies")
    results.append(("Dependencies", check_task_generation_dependencies()))
    
    # Test 3: Database state
    print("\n[TEST 3] Database State")
    db_state = check_database_state()
    results.append(("Database", db_state['projects'] > 0))
    
    # Test 4: Task generation endpoint
    print("\n[TEST 4] Task Generation Endpoint")
    results.append(("Task Generation", test_task_generation_endpoint()))
    
    # Test 5: LLM configuration
    print("\n[TEST 5] LLM Configuration")
    results.append(("LLM Config", dump_task_generation_config()))
    
    # Test 6: WebSocket configuration
    print("\n[TEST 6] WebSocket Configuration")
    results.append(("WebSocket", test_websocket_configuration()))
    
    # Summary
    print("\n" + "=" * 80)
    print("TEST SUMMARY")
    print("=" * 80)
    
    for test_name, passed in results:
        status = "✅ PASSED" if passed else "❌ FAILED"
        print(f"{status}: {test_name}")
    
    passed_count = sum(1 for _, passed in results if passed)
    total_count = len(results)
    
    print(f"\n📊 Results: {passed_count}/{total_count} tests passed")
    
    if passed_count == total_count:
        print("\n🎉 All tests passed!")
        return 0
    elif passed_count > 0:
        print("\n⚠️  Some tests passed, but there are issues to address")
        return 1
    else:
        print("\n❌ All tests failed")
        return 1


if __name__ == "__main__":
    sys.exit(main())
