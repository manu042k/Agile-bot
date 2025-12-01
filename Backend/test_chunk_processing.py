#!/usr/bin/env python
"""
Test to verify all chunks are being processed
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

print("=" * 60)
print("Chunk Processing Verification")
print("=" * 60)

# Get project with document
project = Project.objects.first()
if not project:
    print("No projects found")
    sys.exit(1)

document = project.documents.first()
if not document:
    print("No documents found")
    sys.exit(1)

print(f"\n📋 Project: {project.name}")
print(f"📄 Document: {document.name}")
print(f"📁 File: {document.file.path}")

# Parse document
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

print(f"\n📊 Chunks grouped by requirement ID:")
print(f"   Total unique requirement IDs: {len(req_groups)}")

# Show first 20 requirement IDs
print(f"\n📝 Requirement IDs found (first 20):")
for i, (req_id, chunks_list) in enumerate(list(req_groups.items())[:20], 1):
    print(f"   {i}. {req_id}: {len(chunks_list)} chunk(s)")

if len(req_groups) > 20:
    print(f"   ... and {len(req_groups) - 20} more requirement IDs")

# Show sample chunk content
print(f"\n📄 Sample chunk content:")
sample_chunk = chunks[0]
print(f"   Requirement ID: {sample_chunk['metadata']['requirement_id']}")
print(f"   Text length: {len(sample_chunk['text'])} characters")
print(f"   Text preview: {sample_chunk['text'][:200]}...")

print("\n" + "=" * 60)
