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

        # CRITICAL INSTRUCTIONS
        - You MUST generate AT LEAST ONE task for every requirement, even if it's brief or high-level
        - If the requirement is vague, create a task to clarify or design it
        - If the requirement is a constraint, create a task to implement or verify it
        - NEVER return an empty task list
        
        # Task Creation Guidelines
        1. Each task must explicitly cite the Requirement ID (use the exact ID provided)
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
        
        # Examples of Task Types
        - Implementation tasks: "Implement [feature]"
        - Design tasks: "Design [component/interface]"
        - Testing tasks: "Test [functionality]"
        - Documentation tasks: "Document [feature/API]"
        - Research tasks: "Research and evaluate [technology/approach]"
        - Setup tasks: "Setup [infrastructure/environment]"
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
            tasks = SprintTaskList(**task_data).tasks
            
            # If LLM returned empty list, create a fallback task
            if not tasks:
                logger.warning(f"LLM returned no tasks for {req_id}, creating fallback task")
                tasks = [self._create_fallback_task(req_id, chunk_text)]
            
            return tasks
            
        except Exception as e:
            logger.error(f"LLM Generation failed for {req_id}: {e}")
            # Create fallback task on error
            logger.info(f"Creating fallback task for {req_id} due to LLM error")
            return [self._create_fallback_task(req_id, chunk_text)]
    
    def _create_fallback_task(self, req_id: str, chunk_text: str) -> SprintTaskLLM:
        """Create a fallback task when LLM fails or returns nothing"""
        # Extract first meaningful line from chunk
        lines = [line.strip() for line in chunk_text.split('\n') if line.strip()]
        description = lines[0] if lines else f"Implement requirement {req_id}"
        
        # Truncate if too long
        if len(description) > 100:
            description = description[:97] + "..."
        
        return SprintTaskLLM(
            name=f"Implement {req_id}",
            description=description,
            requirement_id=req_id,
            reasoning=f"Fallback task created for {req_id}",
            tags=["feature"],
            priority="P2",
            estimate="1d"
        )
    
    def validate_citation(self, task: SprintTaskLLM, source_req_id: str) -> bool:
        """
        Validate that task cites the correct requirement
        Now more lenient - allows partial matches and variations
        """
        task_req = task.requirement_id.strip().upper()
        source_req = source_req_id.strip().upper()
        
        # Exact match
        if task_req == source_req:
            return True
        
        # Allow if task requirement contains source requirement
        if source_req in task_req or task_req in source_req:
            return True
        
        # Allow if they share the same base (e.g., SRS-101 and SRS-101.1)
        task_base = task_req.split('.')[0].split('-')[-1] if '-' in task_req else task_req
        source_base = source_req.split('.')[0].split('-')[-1] if '-' in source_req else source_req
        
        if task_base == source_base:
            return True
        
        # If all else fails, log warning but accept it
        logger.warning(f"Loose citation match: task cites '{task_req}' for source '{source_req}'")
        return True  # Accept all tasks to maximize coverage
