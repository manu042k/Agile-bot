"""
Data models for LLM task generation
Uses Django models instead of separate database
"""
from pydantic import BaseModel, Field
from typing import List, Optional
from dataclasses import dataclass


class SprintTaskLLM(BaseModel):
    """Structured output for the LLM."""
    name: str = Field(..., description="A concise title for the task")
    description: str = Field(..., description="Actionable sprint task description")
    requirement_id: str = Field(..., description="The specific REQ-ID this task is derived from")
    reasoning: str = Field(..., description="Brief explanation of why this task is needed")
    tags: List[str] = Field(..., description="List of tags associated with the task. Must be from: design, documents, frontend, backend, devops, testing, bug, feature, enhancement")
    priority: str = Field(..., description="Priority of the task (P1, P2, P3)")
    estimate: str = Field(..., description="Time estimate for the task (e.g., 1d, 4h, 30m)")


class SprintTaskList(BaseModel):
    """Wrapper for list of tasks."""
    tasks: List[SprintTaskLLM]


@dataclass
class TaskDependency:
    """Dependency representation."""
    from_task_id: str
    to_task_id: str
    dependency_type: str
    strength: str
    confidence: float
    reasoning: str


@dataclass
class GeneratedTask:
    """Generated task with metadata."""
    task_id: str
    name: str
    description: str
    requirement_id: str
    reasoning: str
    tags: List[str]
    priority: str
    estimate: str
    metadata: dict = None
