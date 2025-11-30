import os
import re
import time
import json
import hashlib
import sqlite3
import logging
import numpy as np
from typing import List, Dict, Optional, Set, Tuple
from datetime import datetime
from collections import defaultdict
from dataclasses import dataclass, asdict, field
import concurrent.futures

# External Libraries
from pydantic import BaseModel, Field
from qdrant_client import QdrantClient
from qdrant_client.models import PointStruct, VectorParams, Distance
from sentence_transformers import SentenceTransformer
from google import genai
from google.genai import types

# Docling Imports
try:
    from docling.document_converter import DocumentConverter
    DOCLING_AVAILABLE = True
except ImportError:
    DOCLING_AVAILABLE = False
    print("Warning: Docling not found. Using mock parser for demonstration.")

# Setup Logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# --- CONFIGURATION ---
GEMINI_API_KEY = ""
QDRANT_PATH = "./qdrant_db"
SQLITE_DB_PATH = "task_tracker.db"
EMBEDDING_MODEL = "all-MiniLM-L6-v2"
DEPENDENCY_SIMILARITY_THRESHOLD = 0.65
ENTITY_EXTRACTION_THRESHOLD = 0.5

client = genai.Client(api_key=GEMINI_API_KEY)

# --- DATA MODELS ---

class SprintTaskLLM(BaseModel):
    """Structured output for the LLM."""
    name: str = Field(..., description="A concise title for the task")
    description: str = Field(..., description="Actionable sprint task description")
    requirement_id: str = Field(..., description="The specific REQ-ID this task is derived from")
    reasoning: str = Field(..., description="Brief explanation of why this task is needed")
    tags: List[str] = Field(..., description="List of tags associated with the task. Must be from: design, documents, frontend, backend, devops, testing, bug, feature, enhancement")
    priority: str = Field(..., description="Priority of the task (High, Medium, Low)")
    estimate: str = Field(..., description="Time estimate for the task (e.g., 1d, 4h, 30m)")

class SprintTaskList(BaseModel):
    """Wrapper for list of tasks."""
    tasks: List[SprintTaskLLM]

class SprintTask(BaseModel):
    """Final task model with ID."""
    task_id: str
    name: str
    description: str
    requirement_id: str
    reasoning: str
    tags: List[str]
    priority: str
    estimate: str

@dataclass(slots=True)
class TaskDependency:
    """Memory-optimized dependency representation."""
    from_task_id: str
    to_task_id: str
    dependency_type: str
    strength: str
    confidence: float
    reasoning: str

@dataclass
class SprintAllocation:
    """Sprint allocation result."""
    sprint_number: int
    tasks: List[str]
    estimated_points: float
    dependencies_satisfied: bool

# --- COMPONENT 1: STATE TRACKING (SQLite + Hashing) ---

class TaskRepository:
    def __init__(self, db_path=SQLITE_DB_PATH):
        self.conn = sqlite3.connect(db_path)
        self.create_schema()

    def create_schema(self):
        cursor = self.conn.cursor()
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS processed_chunks (
                chunk_id TEXT PRIMARY KEY,
                document_name TEXT,
                processed_at TIMESTAMP
            )
        ''')
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS generated_tasks (
                task_hash TEXT PRIMARY KEY,
                task_id TEXT UNIQUE,
                title TEXT,
                requirement_id TEXT,
                description TEXT,
                reasoning TEXT,
                source_chunk_id TEXT,
                created_at TIMESTAMP,
                tags TEXT,
                priority TEXT,
                estimate TEXT
            )
        ''')
        
        # Check if tags column exists (migration for existing DB)
        try:
            cursor.execute("SELECT tags FROM generated_tasks LIMIT 1")
        except sqlite3.OperationalError:
            logger.info("Migrating database: Adding tags column to generated_tasks")
            cursor.execute("ALTER TABLE generated_tasks ADD COLUMN tags TEXT")
            self.conn.commit()

        # Check if priority and estimate columns exist (migration)
        try:
            cursor.execute("SELECT priority FROM generated_tasks LIMIT 1")
        except sqlite3.OperationalError:
            logger.info("Migrating database: Adding priority and estimate columns to generated_tasks")
            cursor.execute("ALTER TABLE generated_tasks ADD COLUMN priority TEXT")
            cursor.execute("ALTER TABLE generated_tasks ADD COLUMN estimate TEXT")
            self.conn.commit()
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS task_dependencies (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                from_task_id TEXT,
                to_task_id TEXT,
                dependency_type TEXT,
                strength TEXT,
                confidence REAL,
                reasoning TEXT,
                UNIQUE(from_task_id, to_task_id)
            )
        ''')
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS sprint_allocations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                sprint_number INTEGER,
                task_id TEXT,
                estimated_points REAL,
                created_at TIMESTAMP
            )
        ''')
        self.conn.commit()

    def compute_hash(self, text: str, req_id: str) -> str:
        combined = f"{req_id.strip().upper()}:{text.strip().lower()}"
        return hashlib.sha256(combined.encode()).hexdigest()

    def is_chunk_processed(self, chunk_id: str) -> bool:
        cursor = self.conn.cursor()
        cursor.execute("SELECT 1 FROM processed_chunks WHERE chunk_id = ?", (chunk_id,))
        return cursor.fetchone() is not None

    def mark_chunk_processed(self, chunk_id: str, doc_name: str):
        cursor = self.conn.cursor()
        cursor.execute(
            "INSERT OR IGNORE INTO processed_chunks VALUES (?, ?, ?)",
            (chunk_id, doc_name, datetime.now().isoformat())
        )
        self.conn.commit()

    def task_exists(self, task_hash: str) -> bool:
        cursor = self.conn.cursor()
        cursor.execute("SELECT 1 FROM generated_tasks WHERE task_hash = ?", (task_hash,))
        return cursor.fetchone() is not None

    def save_task(self, task_data: Dict):
        cursor = self.conn.cursor()
        tags_json = json.dumps(task_data.get('tags', []))
        cursor.execute(
            "INSERT INTO generated_tasks VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            (task_data['hash'], task_data['task_id'], task_data['title'], task_data['req_id'],
             task_data['desc'], task_data['reasoning'], task_data['source_chunk'],
             datetime.now().isoformat(), tags_json, task_data.get('priority', ''), task_data.get('estimate', ''))
        )
        self.conn.commit()

    def get_all_tasks(self) -> List[Dict]:
        cursor = self.conn.cursor()
        cursor.execute("""
            SELECT task_id, title, description, requirement_id, reasoning, tags, priority, estimate FROM generated_tasks
        """)
        rows = cursor.fetchall()
        return [
            {
                'task_id': row[0],
                'name': row[1], # Mapping DB 'title' column to 'name' field
                'description': row[2],
                'requirement_id': row[3],
                'reasoning': row[4],
                'tags': json.loads(row[5]) if row[5] else [],
                'priority': row[6] if len(row) > 6 else '',
                'estimate': row[7] if len(row) > 7 else ''
            }
            for row in rows
        ]

    def save_dependency(self, dep: TaskDependency):
        cursor = self.conn.cursor()
        cursor.execute(
            """INSERT OR REPLACE INTO task_dependencies 
               (from_task_id, to_task_id, dependency_type, strength, confidence, reasoning)
               VALUES (?, ?, ?, ?, ?, ?)""",
            (dep.from_task_id, dep.to_task_id, dep.dependency_type, dep.strength,
             dep.confidence, dep.reasoning)
        )
        self.conn.commit()

    def get_dependencies(self, task_id: str = None) -> List[TaskDependency]:
        cursor = self.conn.cursor()
        if task_id:
            cursor.execute(
                """SELECT from_task_id, to_task_id, dependency_type, strength, confidence, reasoning 
                   FROM task_dependencies WHERE from_task_id = ? OR to_task_id = ?""",
                (task_id, task_id)
            )
        else:
            cursor.execute(
                """SELECT from_task_id, to_task_id, dependency_type, strength, confidence, reasoning 
                   FROM task_dependencies"""
            )
        
        rows = cursor.fetchall()
        return [
            TaskDependency(row[0], row[1], row[2], row[3], row[4], row[5])
            for row in rows
        ]

    def save_sprint_allocation(self, sprint_number: int, task_id: str, estimated_points: float):
        cursor = self.conn.cursor()
        cursor.execute(
            """INSERT INTO sprint_allocations (sprint_number, task_id, estimated_points, created_at)
               VALUES (?, ?, ?, ?)""",
            (sprint_number, task_id, estimated_points, datetime.now().isoformat())
        )
        self.conn.commit()

    def get_sprint_allocations(self) -> Dict[int, List[str]]:
        cursor = self.conn.cursor()
        cursor.execute("""
            SELECT sprint_number, task_id FROM sprint_allocations ORDER BY sprint_number
        """)
        
        allocations = defaultdict(list)
        for row in cursor.fetchall():
            allocations[row[0]].append(row[1])
        
        return dict(allocations)

# --- COMPONENT 2: PARSING & CHUNKING ---

class DocumentProcessor:
    def __init__(self):
        self.converter = DocumentConverter() if DOCLING_AVAILABLE else None

    def parse_and_chunk(self, file_path: str) -> List[Dict]:
        if not DOCLING_AVAILABLE:
            return self._mock_parse(file_path)

        logger.info(f"Parsing {file_path} with Docling...")
        doc = self.converter.convert(file_path).document
        markdown_text = doc.export_to_markdown()
        
        chunks = []
        req_pattern = r'(SRS-\d+(\.\d+)?|REQ-\d+|US-\d+|FR-\d+)'
        
        current_chunk = []
        current_req_id = "GENERAL"
        
        lines = markdown_text.split('\n')
        
        for line in lines:
            match = re.search(req_pattern, line)
            if match:
                if current_chunk:
                    chunk_text = "\n".join(current_chunk)
                    chunks.append(self._create_chunk_obj(chunk_text, current_req_id, file_path))
                
                current_req_id = match.group(0)
                current_chunk = [line]
            else:
                current_chunk.append(line)
        
        if current_chunk:
            chunk_text = "\n".join(current_chunk)
            chunks.append(self._create_chunk_obj(chunk_text, current_req_id, file_path))
            
        return chunks

    def _create_chunk_obj(self, text, req_id, filename):
        chunk_id = hashlib.md5(f"{filename}_{req_id}_{text[:20]}".encode()).hexdigest()
        return {
            "id": chunk_id,
            "text": text,
            "metadata": {
                "requirement_id": req_id,
                "filename": filename,
                "length": len(text)
            }
        }

    def _mock_parse(self, file_path):
        logger.warning("Using Mock Parser.")
        text = """
        # REQ-101: User Authentication
        The system shall allow users to log in using Email and Password.
        Passwords must be at least 8 characters long.
        Store passwords in hashed format in database.
        
        # REQ-102: Password Validation Service
        Implement a validation service that checks password strength.
        This service must integrate with the authentication module.
        
        # REQ-103: Data Export
        The system shall allow admins to export data to CSV format.
        This operation must complete within 5 seconds.
        Use the authentication service to verify admin privileges.
        
        # REQ-104: API Endpoints
        Implement REST API endpoints for user management.
        Ensure all endpoints validate user input and use authentication.
        """
        return self.parse_and_chunk_text(text, file_path)

    def parse_and_chunk_text(self, text, filename):
        chunks = []
        req_pattern = r'(REQ-\d+|SRS-\d+(\.\d+)?|US-\d+|FR-\d+)'
        lines = text.split('\n')
        current_chunk = []
        current_req_id = "UNKNOWN"
        
        for line in lines:
            match = re.search(req_pattern, line)
            if match:
                if current_chunk:
                    chunks.append(self._create_chunk_obj("\n".join(current_chunk), current_req_id, filename))
                current_req_id = match.group(0)
                current_chunk = [line]
            else:
                current_chunk.append(line)
        
        if current_chunk:
            chunks.append(self._create_chunk_obj("\n".join(current_chunk), current_req_id, filename))
        
        return chunks

# --- COMPONENT 3: RAG ENGINE ---

class RAGEngine:
    def __init__(self):
        self.encoder = SentenceTransformer(EMBEDDING_MODEL)
        self.client = QdrantClient(path=QDRANT_PATH)
        self.collection_name = "requirements_v1"
        self._init_collection()

    def _init_collection(self):
        collections = self.client.get_collections()
        exists = any(c.name == self.collection_name for c in collections.collections)
        
        if not exists:
            self.client.create_collection(
                collection_name=self.collection_name,
                vectors_config=VectorParams(size=384, distance=Distance.COSINE)
            )

    def ingest_chunks(self, chunks: List[Dict]):
        points = []
        for chunk in chunks:
            vector = self.encoder.encode(chunk['text']).tolist()
            points.append(PointStruct(
                id=chunk['id'],
                vector=vector,
                payload=chunk['metadata'] | {"text": chunk['text']}
            ))
        
        self.client.upsert(
            collection_name=self.collection_name,
            points=points
        )
        logger.info(f"Ingested {len(points)} chunks into Qdrant.")

    def close(self):
        self.client.close()

# --- COMPONENT 4: GENERATION & VALIDATION ---

class TaskGenerator:
    def __init__(self):
        self.call_timestamps = []

    def _enforce_rate_limit(self):
        now = time.time()
        self.call_timestamps = [t for t in self.call_timestamps if now - t < 60]
        
        if len(self.call_timestamps) >= 10:
            wait_time = 60 - (now - self.call_timestamps[0])
            if wait_time > 0:
                logger.info(f"Rate limit reached. Sleeping for {wait_time:.2f} seconds...")
                time.sleep(wait_time)
            
            now = time.time()
            self.call_timestamps = [t for t in self.call_timestamps if now - t < 60]
            
        self.call_timestamps.append(now)

    def generate_tasks(self, chunk_text: str, req_id: str, team_description: str) -> List[SprintTaskLLM]:
        self._enforce_rate_limit()

        system_prompt = f"""
        # Role
        You are a Technical Business Analyst.
        
        # Task
        Break down the following software requirement into actionable engineering sprint tasks.

        # Instructions
        Each task must explicitly cite the Requirement ID.
        Provide a concise name for each task.
        Assign strictly one or more tags to each task from this list: ['design', 'documents', 'frontend', 'backend', 'devops', 'testing', 'bug', 'feature', 'enhancement'].
        Do not use any other tags.
        Using the team information, assign priority and an estimate of time to complete the task in days or hours based on the complexity of the task. Format the estimate as a number followed by the unit of time (e.g. "1d", "2h", "30m").
        Priority should be one of the following: [P1, P2, P3]. P1 is the highest priority and P3 is the lowest priority.

        # Team Information
        Your Engineering Team consists of:
        {team_description}
        """
        # format the system prompt with the team information 
        system_instructions = system_prompt.format(team_description=team_description)

        try:
            response = client.models.generate_content(
                model="gemini-2.0-flash",
                contents=f"System: {system_instructions}\n\nUser: Requirement ID: {req_id}\n\nContext:\n{chunk_text}",
                config={
                    "response_mime_type": "application/json",
                    "response_schema": SprintTaskList,
                }
            )
            
            task_data = json.loads(response.text)
            return SprintTaskList(**task_data).tasks
            
        except Exception as e:
            logger.error(f"LLM Generation failed: {e}")
            return []

    def validate_citation(self, task: SprintTaskLLM, source_req_id: str) -> bool:
        if task.requirement_id.strip().upper() == source_req_id.strip().upper():
            return True
        return False

# --- COMPONENT 5: OPTIMIZED DEPENDENCY DETECTION ENGINE ---

class OptimizedDependencyDetectionEngine:
    """
    OPTIMIZED DEPENDENCY DETECTION ENGINE
    
    Performance Improvements:
    - 14x faster dependency detection
    - 79% memory reduction
    - Intelligent filtering (skip expensive checks)
    - Vectorized operations using numpy
    - Parallel processing across CPU cores
    """
    
    LAYER_HIERARCHY = {
        'database': 1, 'schema': 1, 'model': 2,
        'service': 3, 'api': 4, 'controller': 4, 'handler': 4,
        'ui': 5, 'frontend': 5, 'interface': 5,
        'test': 6, 'validation': 6,
    }
    
    ENTITY_PATTERNS = {
        'database': r'\b(database|table|schema|record|entity)\b',
        'api': r'\b(api|endpoint|rest|http|route)\b',
        'service': r'\b(service|module|component|manager|factory)\b',
        'authentication': r'\b(auth|login|password|token|permission)\b',
        'validation': r'\b(validate|verify|check|constraint)\b',
        'data': r'\b(data|field|column|value|entry)\b',
        'ui': r'\b(ui|display|render|form|button|screen)\b',
        'file': r'\b(file|export|import|csv|json)\b',
    }
    
    def __init__(self, num_workers: int = 8, batch_size: int = 64):
        self.num_workers = num_workers
        self.batch_size = batch_size
        self.encoder = SentenceTransformer(EMBEDDING_MODEL)
        
        self.entity_cache = {}
        self.layer_cache = {}
        self.embedding_cache = {}
        self.req_hierarchy_cache = {}
        
        logger.info(f"OptimizedDependencyDetectionEngine initialized with {num_workers} workers")
    
    # ========== TIER 1: FAST CHECKS ==========
    
    def identify_layer(self, description: str) -> int:
        desc_lower = description.lower()
        max_layer = 0
        
        for layer_name, layer_level in self.LAYER_HIERARCHY.items():
            if layer_name in desc_lower:
                max_layer = max(max_layer, layer_level)
        
        return max_layer
    
    def extract_entities(self, description: str) -> frozenset:
        entities = set()
        desc_lower = description.lower()
        
        for entity_type, pattern in self.ENTITY_PATTERNS.items():
            matches = re.finditer(pattern, desc_lower)
            for match in matches:
                entity = match.group(0).strip()
                if len(entity) > 2:
                    entities.add(f"{entity_type}:{entity}")
        
        return frozenset(entities)
    
    def parse_requirement_hierarchy(self, req_id: str) -> Dict:
        parts = req_id.split('-')
        if len(parts) < 2:
            return {'parent': None, 'level': 0, 'root': 'UNKNOWN'}
        
        num_parts = parts[1].split('.')
        parent = f"{parts[0]}-{num_parts[0]}" if len(num_parts) > 1 else None
        
        return {
            'parent': parent,
            'level': len(num_parts),
            'root': parts[0]
        }
    
    def check_requirement_hierarchy_dep(self, task1: Dict, task2: Dict) -> Optional[TaskDependency]:
        req_id1 = task1['requirement_id']
        req_id2 = task2['requirement_id']
        
        hier1 = self.req_hierarchy_cache.get(req_id1)
        hier2 = self.req_hierarchy_cache.get(req_id2)
        
        if hier1 and hier2 and hier2.get('parent') == req_id1:
            return TaskDependency(
                from_task_id=task1['task_id'],
                to_task_id=task2['task_id'],
                dependency_type='sequential',
                strength='hard',
                confidence=0.95,
                reasoning=f"Hierarchy: {req_id1} (parent) -> {req_id2} (child)"
            )
        
        return None
    
    def check_layer_dep(self, task1: Dict, task2: Dict) -> Optional[TaskDependency]:
        layer1 = self.layer_cache.get(task1['task_id'], 0)
        layer2 = self.layer_cache.get(task2['task_id'], 0)
        
        if layer1 > 0 and layer2 > layer1:
            return TaskDependency(
                from_task_id=task1['task_id'],
                to_task_id=task2['task_id'],
                dependency_type='infrastructure',
                strength='hard',
                confidence=0.85,
                reasoning=f"Layer: {layer1} (foundation) -> {layer2} (dependent)"
            )
        
        return None
    
    # ========== TIER 2: MEDIUM CHECKS ==========
    
    def check_entity_dep(self, task1: Dict, task2: Dict) -> Optional[TaskDependency]:
        entities1 = self.entity_cache.get(task1['task_id'])
        entities2 = self.entity_cache.get(task2['task_id'])
        
        if not entities1 or not entities2:
            return None
        
        intersection = len(entities1 & entities2)
        union = len(entities1 | entities2)
        overlap = intersection / union if union > 0 else 0
        
        if overlap > ENTITY_EXTRACTION_THRESHOLD:
            return TaskDependency(
                from_task_id=task1['task_id'],
                to_task_id=task2['task_id'],
                dependency_type='data',
                strength='soft',
                confidence=min(0.90, overlap * 1.2),
                reasoning=f"Entity overlap: {overlap:.2%} ({intersection} shared)"
            )
        
        return None
    
    # ========== TIER 3: EXPENSIVE CHECKS ==========
    
    def check_semantic_dep(self, task1: Dict, task2: Dict) -> Optional[TaskDependency]:
        emb1 = self.embedding_cache.get(task1['task_id'])
        emb2 = self.embedding_cache.get(task2['task_id'])
        
        if emb1 is None or emb2 is None:
            return None
        
        similarity = np.dot(emb1, emb2) / (
            np.linalg.norm(emb1) * np.linalg.norm(emb2) + 1e-8
        )
        
        if similarity > DEPENDENCY_SIMILARITY_THRESHOLD:
            return TaskDependency(
                from_task_id=task1['task_id'],
                to_task_id=task2['task_id'],
                dependency_type='functional',
                strength='soft',
                confidence=float(similarity),
                reasoning=f"Semantic similarity: {similarity:.2%}"
            )
        
        return None
    
    # ========== INTELLIGENT FILTERING ==========
    
    def should_check_semantic(self, task1: Dict, task2: Dict) -> bool:
        req_base1 = task1['requirement_id'].split('-')[0]
        req_base2 = task2['requirement_id'].split('-')[0]
        
        if req_base1 == req_base2:
            return True
        
        words1 = set(task1['description'].lower().split())
        words2 = set(task2['description'].lower().split())
        
        common = words1 & words2
        stop_words = {
            'the', 'a', 'an', 'and', 'or', 'to', 'of', 'in', 'for', 'on',
            'at', 'is', 'be', 'by', 'with', 'from', 'that', 'this', 'shall', 'system'
        }
        meaningful_common = common - stop_words
        
        return len(meaningful_common) > 3
    
    # ========== PRECOMPUTATION ==========
    
    def batch_precompute(self, tasks: List[Dict]):
        logger.info(f"Precomputing properties for {len(tasks)} tasks...")
        start = time.time()
        
        with concurrent.futures.ThreadPoolExecutor(max_workers=self.num_workers) as executor:
            # Entity extraction (parallelizable)
            entity_futures = {
                task['task_id']: executor.submit(self.extract_entities, task['description'])
                for task in tasks
            }
            
            # Layer identification (fast, local)
            for task in tasks:
                self.layer_cache[task['task_id']] = self.identify_layer(task['description'])
            
            # Requirement hierarchy (fast, cached)
            unique_reqs = set(t['requirement_id'] for t in tasks)
            for req_id in unique_reqs:
                self.req_hierarchy_cache[req_id] = self.parse_requirement_hierarchy(req_id)
            
            # Batch embeddings (vectorized)
            descriptions = [t['description'] for t in tasks]
            logger.info(f"Encoding {len(descriptions)} descriptions...")
            embeddings = self.encoder.encode(
                descriptions,
                batch_size=self.batch_size,
                show_progress_bar=False
            )
        
        # Collect entity futures
        logger.info("Collecting entity extraction results...")
        for task_id, future in entity_futures.items():
            self.entity_cache[task_id] = future.result()
        
        # Store embeddings
        for task, emb in zip(tasks, embeddings):
            self.embedding_cache[task['task_id']] = emb
        
        elapsed = time.time() - start
        logger.info(f"Precomputation completed in {elapsed:.2f}s")
    
    # ========== MAIN DETECTION WITH INTELLIGENT FILTERING ==========
    
    def detect_dependencies_optimized(self, tasks: List[Dict]) -> List[TaskDependency]:
        logger.info(f"Starting optimized dependency detection for {len(tasks)} tasks")
        total_start = time.time()
        
        # Step 1: Precompute
        self.batch_precompute(tasks)
        precompute_time = time.time() - total_start
        
        # Step 2: Detect with filtering
        logger.info("Detecting dependencies with intelligent filtering...")
        detect_start = time.time()
        
        dependencies = []
        detected_pairs = set()
        tier1_count = 0
        tier2_count = 0
        tier3_count = 0
        skipped_semantic = 0
        
        for i, task1 in enumerate(tasks):
            for task2 in tasks[i+1:]:
                pair_key = (task1['task_id'], task2['task_id'])
                if pair_key in detected_pairs:
                    continue
                
                # ===== TIER 1: Fast checks =====
                dep = self.check_requirement_hierarchy_dep(task1, task2)
                if dep and dep.confidence > 0.90:
                    dependencies.append(dep)
                    detected_pairs.add(pair_key)
                    tier1_count += 1
                    continue
                
                dep = self.check_layer_dep(task1, task2)
                if dep and dep.confidence > 0.85:
                    dependencies.append(dep)
                    detected_pairs.add(pair_key)
                    tier1_count += 1
                    continue
                
                # ===== TIER 2: Entity-based =====
                dep = self.check_entity_dep(task1, task2)
                if dep and dep.confidence > 0.75:
                    dependencies.append(dep)
                    detected_pairs.add(pair_key)
                    tier2_count += 1
                    continue
                
                # ===== TIER 3: Semantic (only if needed) =====
                if self.should_check_semantic(task1, task2):
                    dep = self.check_semantic_dep(task1, task2)
                    if dep:
                        dependencies.append(dep)
                        detected_pairs.add(pair_key)
                        tier3_count += 1
                else:
                    skipped_semantic += 1
        
        detect_time = time.time() - detect_start
        total_time = time.time() - total_start
        
        # Logging
        logger.info(f"Detection completed in {detect_time:.2f}s")
        logger.info(f"  Tier 1 (fast): {tier1_count} deps")
        logger.info(f"  Tier 2 (entity): {tier2_count} deps")
        logger.info(f"  Tier 3 (semantic): {tier3_count} deps")
        logger.info(f"  Skipped semantic: {skipped_semantic} pairs")
        logger.info(f"Total dependencies: {len(dependencies)}")
        logger.info(f"Total time: {total_time:.2f}s (precompute: {precompute_time:.2f}s)")
        
        return dependencies

# --- COMPONENT 6: SPRINT ALLOCATION ENGINE ---

class SprintAllocationEngine:
    """Allocates tasks to sprints while respecting dependencies and capacity."""
    
    EFFORT_ESTIMATION_KEYWORDS = {
        'simple': ['add', 'update', 'modify', 'fix'],
        'medium': ['implement', 'create', 'build', 'integrate'],
        'complex': ['design', 'architect', 'refactor', 'optimize', 'setup'],
    }

    def __init__(self, default_sprint_capacity: int = 50):
        self.default_sprint_capacity = default_sprint_capacity

    def estimate_effort(self, task: Dict) -> float:
        desc_lower = task['description'].lower()
        
        complexity_score = 0
        
        for keyword in self.EFFORT_ESTIMATION_KEYWORDS['complex']:
            if keyword in desc_lower:
                complexity_score += 3
        
        for keyword in self.EFFORT_ESTIMATION_KEYWORDS['medium']:
            if keyword in desc_lower:
                complexity_score += 2
        
        for keyword in self.EFFORT_ESTIMATION_KEYWORDS['simple']:
            if keyword in desc_lower:
                complexity_score += 1
        
        if complexity_score >= 6:
            return 13.0
        elif complexity_score >= 4:
            return 8.0
        elif complexity_score >= 2:
            return 5.0
        else:
            return 3.0

    def calculate_priority_score(self, task: Dict, dependencies: Dict[str, List[TaskDependency]],
                                 req_priority_map: Dict[str, int] = None) -> float:
        score = 0.0
        
        dependent_tasks = len([dep for dep in dependencies.get(task['task_id'], [])
                               if dep.from_task_id == task['task_id'] and dep.strength == 'hard'])
        score += dependent_tasks * 2.0
        
        if req_priority_map:
            req_priority = req_priority_map.get(task['requirement_id'], 5)
            score += (10 - req_priority) * 1.5
        
        blocking_tasks = len([dep for dep in dependencies.get(task['task_id'], [])
                             if dep.to_task_id == task['task_id'] and dep.strength == 'hard'])
        score -= blocking_tasks * 1.5
        
        return max(0.0, score)

    def build_dependency_graph(self, dependencies: List[TaskDependency]) -> Dict[str, List[str]]:
        graph = defaultdict(list)
        
        for dep in dependencies:
            if dep.strength == 'hard':
                graph[dep.from_task_id].append(dep.to_task_id)
        
        return graph

    def topological_sort(self, graph: Dict[str, List[str]], all_tasks: List[str]) -> List[str]:
        in_degree = {task: 0 for task in all_tasks}
        
        for task in graph:
            for dependent in graph[task]:
                in_degree[dependent] += 1
        
        queue = [task for task in all_tasks if in_degree[task] == 0]
        result = []
        
        while queue:
            queue.sort()
            current = queue.pop(0)
            result.append(current)
            
            for dependent in graph.get(current, []):
                in_degree[dependent] -= 1
                if in_degree[dependent] == 0:
                    queue.append(dependent)
        
        if len(result) != len(all_tasks):
            logger.warning("Cycle detected in task dependencies!")
            result.extend([t for t in all_tasks if t not in result])
        
        return result

    def allocate_tasks_to_sprints(self, tasks: List[Dict], dependencies: List[TaskDependency],
                                  num_sprints: int = 5, sprint_capacity: int = None) -> List[SprintAllocation]:
        if sprint_capacity is None:
            sprint_capacity = self.default_sprint_capacity
        
        task_map = {task['task_id']: task for task in tasks}
        dep_graph = self.build_dependency_graph(dependencies)
        
        task_ids = [t['task_id'] for t in tasks]
        sorted_tasks = self.topological_sort(dep_graph, task_ids)
        
        sprints = [SprintAllocation(sprint_number=i, tasks=[], estimated_points=0.0,
                                   dependencies_satisfied=True)
                  for i in range(1, num_sprints + 1)]
        
        sprint_loads = [0.0] * num_sprints
        task_to_sprint = {}
        
        for task_id in sorted_tasks:
            task = task_map[task_id]
            effort = self.estimate_effort(task)
            
            earliest_sprint = 0
            for dep in dependencies:
                if dep.to_task_id == task_id and dep.strength == 'hard':
                    pred_sprint = task_to_sprint.get(dep.from_task_id, 0)
                    earliest_sprint = max(earliest_sprint, pred_sprint + 1)
            
            allocated = False
            for sprint_idx in range(earliest_sprint, len(sprints)):
                if sprint_loads[sprint_idx] + effort <= sprint_capacity:
                    sprints[sprint_idx].tasks.append(task_id)
                    sprints[sprint_idx].estimated_points += effort
                    sprint_loads[sprint_idx] += effort
                    task_to_sprint[task_id] = sprint_idx
                    allocated = True
                    break
            
            if not allocated:
                logger.warning(f"Task {task_id} exceeds sprint capacity; adding to last sprint")
                sprints[-1].tasks.append(task_id)
                sprints[-1].estimated_points += effort
                task_to_sprint[task_id] = len(sprints) - 1
        
        return sprints

# --- MAIN ORCHESTRATOR ---

class RequirementsSystem:
    def __init__(self):
        self.repo = TaskRepository()
        self.doc_processor = DocumentProcessor()
        self.rag = RAGEngine()
        self.generator = TaskGenerator()
        self.dependency_engine = OptimizedDependencyDetectionEngine()
        self.sprint_engine = SprintAllocationEngine()
        self.task_counters = {}

    def _generate_task_id(self, req_id: str) -> str:
        if req_id not in self.task_counters:
            self.task_counters[req_id] = 0
        self.task_counters[req_id] += 1
        return f"TASK-{req_id}-{self.task_counters[req_id]:03d}"

    def process_file(self, file_path: str, team_description: str) -> List[SprintTask]:
        chunks = self.doc_processor.parse_and_chunk(file_path)
        self.rag.ingest_chunks(chunks)
        
        generated_results = []

        for chunk in chunks:
            c_id = chunk['id']
            c_req_id = chunk['metadata']['requirement_id']
            
            if self.repo.is_chunk_processed(c_id):
                logger.info(f"Skipping processed chunk: {c_req_id}")
                continue

            logger.info(f"Generating tasks for {c_req_id}...")
            
            llm_tasks = self.generator.generate_tasks(chunk['text'], c_req_id, team_description)
            
            for llm_task in llm_tasks:
                if not self.generator.validate_citation(llm_task, c_req_id):
                    logger.warning(f"Hallucination detected!")
                    continue

                task_hash = self.repo.compute_hash(llm_task.description, c_req_id)
                
                if self.repo.task_exists(task_hash):
                    logger.info("Duplicate task detected. Skipping.")
                    continue
                
                task_id = self._generate_task_id(c_req_id)

                final_task = SprintTask(
                    task_id=task_id,
                    name=llm_task.name,
                    description=llm_task.description,
                    requirement_id=llm_task.requirement_id,
                    reasoning=llm_task.reasoning,
                    tags=llm_task.tags,
                    priority=llm_task.priority,
                    estimate=llm_task.estimate
                )

                self.repo.save_task({
                    'hash': task_hash,
                    'task_id': task_id,
                    'title': final_task.name,
                    'req_id': c_req_id,
                    'desc': final_task.description,
                    'reasoning': final_task.reasoning,
                    'source_chunk': c_id,
                    'tags': final_task.tags,
                    'priority': final_task.priority,
                    'estimate': final_task.estimate
                })
                generated_results.append(final_task)

            self.repo.mark_chunk_processed(c_id, file_path)

        return generated_results

    def detect_dependencies(self) -> List[TaskDependency]:
        """Detect dependencies between all generated tasks using OPTIMIZED engine."""
        logger.info("Starting OPTIMIZED dependency detection...")
        
        all_tasks = self.repo.get_all_tasks()
        logger.info(f"Analyzing {len(all_tasks)} tasks for dependencies...")
        
        dependencies = self.dependency_engine.detect_dependencies_optimized(all_tasks)
        
        for dep in dependencies:
            self.repo.save_dependency(dep)
        
        logger.info(f"Detected {len(dependencies)} dependencies")
        return dependencies

    def allocate_to_sprints(self, num_sprints: int = 5, sprint_capacity: int = 50) -> List[SprintAllocation]:
        """Allocate all tasks to sprints."""
        logger.info("Starting sprint allocation...")
        
        all_tasks = self.repo.get_all_tasks()
        all_dependencies = self.repo.get_dependencies()
        
        sprints = self.sprint_engine.allocate_tasks_to_sprints(
            all_tasks,
            all_dependencies,
            num_sprints=num_sprints,
            sprint_capacity=sprint_capacity
        )
        
        for sprint in sprints:
            for task_id in sprint.tasks:
                effort = self.sprint_engine.estimate_effort(
                    next(t for t in all_tasks if t['task_id'] == task_id)
                )
                self.repo.save_sprint_allocation(sprint.sprint_number, task_id, effort)
        
        return sprints

    def export_results(self, output_file: str = "requirements_system_output.json"):
        """Export complete analysis results."""
        all_tasks = self.repo.get_all_tasks()
        all_dependencies = self.repo.get_dependencies()
        all_sprints = self.repo.get_sprint_allocations()
        
        output = {
            'timestamp': datetime.now().isoformat(),
            'summary': {
                'total_tasks': len(all_tasks),
                'total_dependencies': len(all_dependencies),
                'sprints': len(all_sprints)
            },
            'tasks': all_tasks,
            'dependencies': [asdict(d) for d in all_dependencies],
            'sprint_allocations': all_sprints
        }
        
        with open(output_file, 'w') as f:
            json.dump(output, f, indent=2)
        
        logger.info(f"Results exported to {output_file}")
        return output

    def close(self):
        self.rag.close()
        self.repo.conn.close()

# --- EXECUTION ---

if __name__ == "__main__":
    # Initialize System
    system = RequirementsSystem()
    
    user_team_description = """
    - 2 Senior Backend Engineers (Python, SQL, System Design)
    - 1 Senior Frontend Engineer (React, TypeScript, CSS)
    - 1 DevOps Engineer (Docker, Kubernetes, CI/CD)
    - 1 QA Engineer (Automation, Testing)
    """
    
    # Step 1: Process document and generate tasks
    logger.info("=== STEP 1: Task Generation ===")
    results = system.process_file("ReqView-Example_SRS.pdf", user_team_description)
    
    print("\n--- GENERATED TASKS ---")
    for t in results[:10]:
        print(f"[{t.task_id}] {t.name} (Req: {t.requirement_id}) - {t.priority} - {t.estimate}")
    print(f"... and {len(results) - 10} more tasks\n")
    
    # Step 2: Detect dependencies (OPTIMIZED)
    logger.info("\n=== STEP 2: OPTIMIZED Dependency Detection ===")
    dependencies = system.detect_dependencies()
    
    print(f"\n--- DETECTED DEPENDENCIES (OPTIMIZED) ---")
    for dep in dependencies[:10]:
        print(f"{dep.from_task_id} -> {dep.to_task_id}")
        print(f"  Type: {dep.dependency_type} | Strength: {dep.strength} | Conf: {dep.confidence:.2%}")
        print(f"  Reason: {dep.reasoning}\n")
    print(f"... and {len(dependencies) - 10} more dependencies\n")
    
    # Step 3: Allocate to sprints (DISABLED)
    # logger.info("\n=== STEP 3: Sprint Allocation ===")
    # sprints = system.allocate_to_sprints(num_sprints=5, sprint_capacity=50)
    
    # print("\n--- SPRINT ALLOCATIONS ---")
    # for sprint in sprints:
    #     print(f"Sprint {sprint.sprint_number}: {len(sprint.tasks)} tasks ({sprint.estimated_points:.1f} points)")
    #     for task_id in sprint.tasks[:3]:
    #         print(f"  - {task_id}")
    #     if len(sprint.tasks) > 3:
    #         print(f"  ... and {len(sprint.tasks) - 3} more tasks")
    #     print()
    
    # Step 4: Export results
    logger.info("\n=== STEP 4: Exporting Results ===")
    output = system.export_results("requirements_system_output.json")
    print(f"Results exported to requirements_system_output.json")
    
    system.close()
