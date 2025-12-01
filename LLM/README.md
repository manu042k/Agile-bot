# LLM

This directory contains the AI processing module for the Agile-bot platform. It handles document processing, requirement extraction, and intelligent task generation using Large Language Models and vector databases.

## Overview

The LLM module provides:
- Document parsing and text extraction
- Vector embeddings for semantic search
- Requirement analysis and extraction
- User story generation
- Task validation and enhancement
- Dependency detection
- Integration with multiple AI services

## Architecture

### Components

- **requirements_system_enhanced.py**: Main processing script for requirement analysis
- **requirements_system_output.json**: Output schema and generated tasks
- **task_tracker.db**: SQLite database for tracking task generation
- **qdrant_db/**: Vector database storage for document embeddings

## Features

### Document Processing
- Parse PDF and DOCX requirement documents
- Extract text content and structure
- Clean and normalize text data
- Handle multi-page documents
- Support for various document formats

### Vector Embeddings
- Generate embeddings using sentence transformers
- Store embeddings in Qdrant vector database
- Semantic search for relevant requirements
- Context retrieval for task generation
- Similarity matching for duplicate detection

### Requirement Analysis
- Extract functional and non-functional requirements
- Identify user stories and acceptance criteria
- Detect technical specifications
- Classify requirement types
- Priority assessment

### Task Generation
- Generate user stories from requirements
- Create detailed acceptance criteria
- Estimate story points
- Assign priority levels
- Detect task dependencies
- Allocate to sprints

### AI Integration
- Google Gemini for task validation
- Cohere for text embeddings
- Pydantic for data validation

## Technologies Used

### AI & ML
- **google-genai**: Google Gemini API client
- **sentence-transformers**: Text embedding models
- **numpy**: Numerical computations

### Vector Database
- **qdrant-client**: Qdrant vector database client
- Local storage for embeddings
- Fast similarity search

### Document Processing
- **docling**: Document parsing library
- Support for PDF, DOCX, and other formats
- Text extraction and structure analysis

### Data Validation
- **pydantic**: Data validation and settings management
- Type-safe data models
- Schema validation

## Setup

### Prerequisites
- Python 3.10 or higher
- pip package manager
- API keys for AI services (Groq, Cohere, Gemini)

### Installation

1. Navigate to the LLM directory:
```bash
cd LLM
```

2. Create a virtual environment (recommended):
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
cp .env.example .env
# Edit .env with your API keys
```

### Configuration

Create a `.env` file with the following variables:

```env
# AI Service API Keys
GEMINI_API_KEY=your_gemini_api_key

# Vector Database Configuration
QDRANT_HOST=localhost
QDRANT_PORT=6333
QDRANT_COLLECTION_NAME=requirements

# Processing Configuration
ENTITY_EXTRACTION_THRESHOLD=0.5
LLM_NUM_WORKERS=8
GEMINI_RATE_LIMIT_PER_MINUTE=10

# Sprint Configuration
DEFAULT_SPRINT_CAPACITY=50
DEFAULT_SPRINT_DURATION_DAYS=14
```

## Usage

### Processing Requirements

Run the requirements processing script:
```bash
python requirements_system_enhanced.py --input document.pdf --output tasks.json
```

### Command Line Options

```bash
python requirements_system_enhanced.py [OPTIONS]

Options:
  --input PATH          Input requirement document path
  --output PATH         Output JSON file path
  --threshold FLOAT     Entity extraction threshold (0.0-1.0)
  --workers INT         Number of parallel workers
  --sprint-capacity INT Default sprint capacity
  --help               Show help message
```

### Python API

Use the module programmatically:

```python
from requirements_system_enhanced import RequirementProcessor

# Initialize processor
processor = RequirementProcessor(
    gemini_api_key="your_key"
)

# Process document
result = processor.process_document("requirements.pdf")

# Access generated tasks
tasks = result["tasks"]
sprints = result["sprints"]
dependencies = result["dependencies"]
```

## Data Models

### Requirement
```python
{
    "id": "REQ-001",
    "text": "User should be able to login",
    "type": "functional",
    "priority": "high",
    "source": "document.pdf",
    "page": 1
}
```

### User Story
```python
{
    "id": "US-001",
    "title": "User Login",
    "description": "As a user, I want to login...",
    "acceptance_criteria": [
        "User can enter credentials",
        "System validates credentials"
    ],
    "story_points": 5,
    "priority": "high",
    "dependencies": ["US-002"],
    "sprint": 1
}
```

### Task Output
```python
{
    "project_id": "proj-123",
    "document_name": "requirements.pdf",
    "tasks": [...],
    "sprints": [...],
    "dependencies": [...],
    "metadata": {
        "total_tasks": 25,
        "total_sprints": 3,
        "processing_time": 45.2
    }
}
```

## Vector Database

### Qdrant Setup

The module uses Qdrant for vector storage:

1. **Local Mode**: Stores data in `qdrant_db/` directory
2. **Server Mode**: Connect to Qdrant server

### Collection Schema

```python
{
    "collection_name": "requirements",
    "vector_size": 384,  # sentence-transformers dimension
    "distance": "Cosine",
    "payload_schema": {
        "text": "string",
        "requirement_id": "string",
        "document_id": "string",
        "page": "integer",
        "type": "string"
    }
}
```

### Semantic Search

Search for similar requirements:
```python
results = processor.search_similar(
    query="user authentication",
    limit=5,
    threshold=0.7
)
```

## Processing Pipeline

### 1. Document Ingestion
- Load document file
- Extract text content
- Parse document structure
- Identify sections and headings

### 2. Text Processing
- Clean and normalize text
- Remove noise and formatting
- Split into chunks
- Identify requirement statements

### 3. Embedding Generation
- Generate vector embeddings
- Store in Qdrant database
- Create searchable index
- Enable semantic search

### 4. Requirement Extraction
- Identify requirement types
- Extract user stories
- Classify priorities
- Detect constraints

### 5. Task Generation
- Generate user story format
- Create acceptance criteria
- Estimate story points
- Assign priorities

### 6. Dependency Detection
- Analyze task relationships
- Identify dependencies
- Create dependency graph
- Validate dependency cycles

### 7. Sprint Allocation
- Calculate sprint capacity
- Allocate tasks to sprints
- Balance workload
- Respect dependencies

### 8. Validation
- Validate task completeness
- Check acceptance criteria
- Verify story points
- Ensure consistency

## AI Service Integration

### Groq AI (LLM Inference)
- Model: Llama 3.2
- Used for: Task generation, text analysis
- Rate limit: Configurable
- Fallback: Retry with exponential backoff

### Cohere (Embeddings)
- Model: embed-english-v3.0
- Used for: Text embeddings, semantic search
- Dimension: 384
- Batch processing supported

### Google Gemini (Validation)
- Model: gemini-pro
- Used for: Task validation, quality checks
- Rate limit: 10 requests/minute (configurable)
- Structured output support

## Performance Optimization

### Parallel Processing
- Multi-threaded task generation
- Configurable worker count
- Batch processing for embeddings
- Async API calls

### Caching
- Cache embeddings for reuse
- Store processed documents
- Reuse similar requirements
- Reduce API calls

### Rate Limiting
- Respect API rate limits
- Exponential backoff on errors
- Queue management
- Request throttling

### Memory Management
- Stream large documents
- Chunk processing
- Clear cache periodically
- Optimize vector storage

## Error Handling

### API Errors
- Retry failed requests
- Fallback to alternative models
- Log errors for debugging
- Graceful degradation

### Document Errors
- Handle malformed documents
- Skip corrupted pages
- Validate input format
- Provide error messages

### Processing Errors
- Validate intermediate results
- Handle missing data
- Recover from failures
- Continue partial processing

## Monitoring

### Metrics
- Processing time per document
- API call counts
- Success/failure rates
- Task generation quality

### Logging
- Debug logs for development
- Info logs for operations
- Error logs for failures
- Performance metrics

### Database
- Track processed documents
- Store processing history
- Monitor vector database size
- Query performance metrics

## Testing

### Unit Tests
```bash
python -m pytest tests/
```

### Integration Tests
```bash
python -m pytest tests/integration/
```

### Test Document Processing
```bash
python requirements_system_enhanced.py --input tests/sample.pdf --output tests/output.json
```


## Advanced Configuration

### Custom Models

Use custom embedding models:
```python
from sentence_transformers import SentenceTransformer

model = SentenceTransformer('your-model-name')
processor = RequirementProcessor(embedding_model=model)
```

### Custom Prompts

Customize LLM prompts:
```python
processor.set_prompt_template(
    task_generation="Your custom prompt template"
)
```

### Custom Validation

Add custom validation rules:
```python
def custom_validator(task):
    # Your validation logic
    return is_valid

processor.add_validator(custom_validator)
```

## Integration with Backend

The LLM module is integrated with the Django backend through:

1. **Celery Tasks**: Async processing triggered by backend
2. **Shared Database**: Results stored in Django database
3. **File Storage**: Documents accessed from media storage
4. **API Communication**: REST API for status updates

