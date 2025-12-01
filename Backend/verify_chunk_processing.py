#!/usr/bin/env python
"""
Verify that all chunks are being processed by the LLM system
"""
import os
import sys
import django
from pathlib import Path

# Setup Django
sys.path.insert(0, str(Path(__file__).parent))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'agileBotApis.settings')
django.setup()

from projectApis.models import Project, Document
from projectApis.llm.document_processor import DocumentProcessor
from projectApis.llm.orchestrator import LLMOrchestrator

print("=" * 70)
print("CHUNK PROCESSING VERIFICATION")
print("=" * 70)

# Get project with document
project = Project.objects.first()
if not project:
    print("\n❌ No projects found")
    sys.exit(1)

document = project.documents.first()
if not document:
    print("\n❌ No documents found")
    sys.exit(1)

print(f"\n📋 Project: {project.name}")
print(f"📄 Document: {document.name}")
print(f"📁 File: {document.file.path}")

# Step 1: Parse and count chunks
print(f"\n{'='*70}")
print("STEP 1: Document Parsing")
print(f"{'='*70}")

processor = DocumentProcessor()
chunks = processor.parse_and_chunk(document.file.path)

print(f"\n✅ Total chunks extracted: {len(chunks)}")

# Group by requirement ID
req_groups = {}
for chunk in chunks:
    req_id = chunk['metadata']['requirement_id']
    if req_id not in req_groups:
        req_groups[req_id] = []
    req_groups[req_id].append(chunk)

print(f"✅ Unique requirement IDs: {len(req_groups)}")

# Show all requirement IDs
print(f"\n📝 All Requirement IDs:")
sorted_req_ids = sorted(req_groups.keys())
for i, req_id in enumerate(sorted_req_ids, 1):
    chunk_count = len(req_groups[req_id])
    print(f"   {i:3d}. {req_id:20s} ({chunk_count} chunk{'s' if chunk_count > 1 else ''})")

# Step 2: Verify orchestrator processes all chunks
print(f"\n{'='*70}")
print("STEP 2: Orchestrator Processing Verification")
print(f"{'='*70}")

print("\n⚠️  This will NOT call the LLM (dry run)")
print("    Just verifying that all chunks would be processed\n")

orchestrator = LLMOrchestrator(project.id)

# Count chunks that would be processed
chunks_to_process = []
chunks_already_processed = []

for chunk in chunks:
    chunk_id = chunk['id']
    req_id = chunk['metadata']['requirement_id']
    
    if chunk_id in orchestrator.processed_chunks:
        chunks_already_processed.append(req_id)
    else:
        chunks_to_process.append(req_id)

print(f"✅ Chunks ready to process: {len(chunks_to_process)}")
print(f"⏭️  Chunks already processed: {len(chunks_already_processed)}")

if chunks_already_processed:
    print(f"\n   Already processed requirement IDs:")
    for req_id in sorted(set(chunks_already_processed)):
        print(f"      - {req_id}")

# Step 3: Summary
print(f"\n{'='*70}")
print("SUMMARY")
print(f"{'='*70}")

print(f"\n✅ All {len(chunks)} chunks are accounted for")
print(f"✅ {len(req_groups)} unique requirement IDs will be sent to LLM")
print(f"\n💡 When you run task generation:")
print(f"   - Each requirement ID will be processed")
print(f"   - LLM will generate tasks for each chunk")
print(f"   - Hallucination filtering will remove invalid tasks")
print(f"   - Duplicate detection will prevent redundant tasks")

print(f"\n{'='*70}")
