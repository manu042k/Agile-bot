"""
Task generation using Gemini LLM
"""
import time
import json
import logging
from typing import List
from google import genai

from .models import SprintTaskLLM, SprintTaskList, GeneratedTask
from .config import GEMINI_API_KEY, GEMINI_RATE_LIMIT_PER_MINUTE

logger = logging.getLogger(__name__)


class TaskGenerator:
    """Generate tasks from requirements using Gemini LLM"""
    
    def __init__(self):
        if not GEMINI_API_KEY:
            raise ValueError(
                "GEMINI_API_KEY not configured. "
                "Please add GEMINI_API_KEY to Backend/.env file."
            )
        self.client = genai.Client(api_key=GEMINI_API_KEY)
        self.call_timestamps = []
        self.rate_limit = GEMINI_RATE_LIMIT_PER_MINUTE
    
    def _enforce_rate_limit(self):
        """Enforce rate limiting based on config"""
        now = time.time()
        self.call_timestamps = [t for t in self.call_timestamps if now - t < 60]
        
        if len(self.call_timestamps) >= self.rate_limit:
            wait_time = 60 - (now - self.call_timestamps[0])
            if wait_time > 0:
                logger.info(f"Rate limit reached. Sleeping for {wait_time:.2f} seconds...")
                time.sleep(wait_time)
            
            now = time.time()
            self.call_timestamps = [t for t in self.call_timestamps if now - t < 60]
        
        self.call_timestamps.append(now)
    
    def generate_tasks(
        self, 
        chunk_text: str, 
        req_id: str, 
        team_description: str,
        project_context: str = ""
    ) -> List[SprintTaskLLM]:
        """
        Generate tasks from a requirement chunk
        
        Args:
            chunk_text: Text of the requirement
            req_id: Requirement ID
            team_description: Description of the team
            project_context: Project context information
            
        Returns:
            List of generated tasks
        """
        self._enforce_rate_limit()
        
        # Build enhanced system prompt with project context
        system_prompt = f"""
        # Role
        You are a Technical Business Analyst specializing in Agile project management.
        
        # Project Context
        {project_context if project_context else "General software development project"}
        
        # Team Information
        Your Engineering Team consists of:
        {team_description}
        
        # Task
        Break down the following software requirement into actionable engineering sprint tasks that are suitable for this specific project and team.

        # Instructions
        1. Each task must explicitly cite the Requirement ID
        2. Provide a concise, actionable name for each task
        3. Consider the project's technology stack and domain when creating tasks
        4. Consider the team's composition and assign appropriate priorities
        5. If a project deadline is mentioned, prioritize tasks accordingly
        6. Assign strictly one or more tags to each task from this list: ['design', 'documents', 'frontend', 'backend', 'devops', 'testing', 'bug', 'feature', 'enhancement']
        7. Do not use any other tags
        8. Assign priority based on:
           - Project deadline urgency
           - Task dependencies
           - Business value
           - Priority should be: P1 (Critical/Urgent), P2 (Important/Normal), P3 (Nice-to-have/Low)
        9. Estimate time based on:
           - Team's skill level and composition
           - Task complexity
           - Technology stack familiarity
           - Format: number + unit (e.g., "1d", "4h", "30m")
        """
        
        try:
            response = self.client.models.generate_content(
                model="gemini-2.0-flash",
                contents=f"System: {system_prompt}\n\nUser: Requirement ID: {req_id}\n\nContext:\n{chunk_text}",
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
        """Validate that task cites the correct requirement"""
        return task.requirement_id.strip().upper() == source_req_id.strip().upper()
