"""
Pydantic schemas for type safety.
"""
from pydantic import BaseModel, Field
from typing import Any, Optional
from enum import Enum


class ToolCall(BaseModel):
    """A single tool execution."""
    tool: str = Field(..., description="Tool name")
    input: dict[str, Any] = Field(..., description="Tool arguments")
    output: dict[str, Any] = Field(..., description="Tool output")
    execution_time_ms: float = Field(..., description="Execution time in ms")


class AgentQueryRequest(BaseModel):
    """Request to the agent."""
    query: str = Field(..., description="User query/question", min_length=1)
    max_iterations: int = Field(default=10, ge=1, le=20, description="Max tool calls")
    timeout: int = Field(default=30, ge=5, le=120, description="Total timeout in seconds")


class AgentQueryResponse(BaseModel):
    """Response from the agent."""
    query: str
    response: str = Field(..., description="Final answer from the agent")
    tool_calls: list[ToolCall] = Field(default_factory=list, description="All tools called")
    iterations: int = Field(..., description="Number of iterations used")
    execution_time_seconds: float
    status: str = Field(default="success", description="success or error")
    error: Optional[str] = Field(default=None, description="Error message if status is error")


class HealthResponse(BaseModel):
    """Health check response."""
    status: str
    version: str = "1.0.0"
    environment: str = "production"
    timestamp: str
    uptime: str
    llm: str = "groq"
