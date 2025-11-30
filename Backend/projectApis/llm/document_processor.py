"""
Document processing and chunking module
"""
import re
import hashlib
import logging
from typing import List, Dict

logger = logging.getLogger(__name__)

# Try to import docling
try:
    from docling.document_converter import DocumentConverter
    DOCLING_AVAILABLE = True
except ImportError:
    DOCLING_AVAILABLE = False
    logger.warning("Docling not available. Using mock parser.")


class DocumentProcessor:
    """Process and chunk requirements documents"""
    
    def __init__(self):
        self.converter = DocumentConverter() if DOCLING_AVAILABLE else None
    
    def parse_and_chunk(self, file_path: str) -> List[Dict]:
        """
        Parse document and split into chunks by requirement ID
        
        Args:
            file_path: Path to the document file
            
        Returns:
            List of chunk dictionaries with text and metadata
        """
        if not DOCLING_AVAILABLE:
            return self._mock_parse(file_path)
        
        try:
            logger.info(f"Parsing {file_path} with Docling...")
            doc = self.converter.convert(file_path).document
            markdown_text = doc.export_to_markdown()
            return self._chunk_by_requirements(markdown_text, file_path)
        except Exception as e:
            logger.error(f"Docling parsing failed: {str(e)}. Using mock parser.")
            return self._mock_parse(file_path)
    
    def _chunk_by_requirements(self, text: str, filename: str) -> List[Dict]:
        """Split text into chunks by requirement IDs"""
        chunks = []
        req_pattern = r'(SRS-\d+(\.\d+)?|REQ-\d+|US-\d+|FR-\d+)'
        
        current_chunk = []
        current_req_id = "GENERAL"
        
        lines = text.split('\n')
        
        for line in lines:
            match = re.search(req_pattern, line)
            if match:
                if current_chunk:
                    chunk_text = "\n".join(current_chunk)
                    chunks.append(self._create_chunk_obj(chunk_text, current_req_id, filename))
                
                current_req_id = match.group(0)
                current_chunk = [line]
            else:
                current_chunk.append(line)
        
        if current_chunk:
            chunk_text = "\n".join(current_chunk)
            chunks.append(self._create_chunk_obj(chunk_text, current_req_id, filename))
        
        return chunks
    
    def _create_chunk_obj(self, text: str, req_id: str, filename: str) -> Dict:
        """Create chunk object with metadata"""
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
    
    def _mock_parse(self, file_path: str) -> List[Dict]:
        """Mock parser for testing without docling"""
        logger.warning("Using Mock Parser for demonstration.")
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
        return self._chunk_by_requirements(text, file_path)
