from pydantic import BaseModel, Field
from typing import List, Optional, Literal

# Health Check Models
class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
    model_info: Optional[dict] = None

# Vectorization Models
class VectorizationRequest(BaseModel):
    text: str = Field(..., description="Text to vectorize")
    model_name: Optional[str] = Field(None, description="Model name (uses env default)")
    vector_dimension: Optional[int] = Field(None, description="Target vector dimension (uses env default)")

class VectorizationResponse(BaseModel):
    vector: List[float] = Field(..., description="Generated vector embedding")
    dimension: int = Field(..., description="Actual vector dimension")
    model_used: str = Field(..., description="Model used for vectorization")
    processing_time_ms: float = Field(..., description="Processing time in milliseconds")

class BatchVectorizationRequest(BaseModel):
    texts: List[str] = Field(..., description="List of texts to vectorize")
    model_name: Optional[str] = Field(None, description="Model name (uses env default)")
    vector_dimension: Optional[int] = Field(None, description="Target vector dimension (uses env default)")

class BatchVectorizationResponse(BaseModel):
    vectors: List[List[float]] = Field(..., description="Generated vector embeddings")
    dimension: int = Field(..., description="Actual vector dimension")
    model_used: str = Field(..., description="Model used for vectorization")
    processing_time_ms: float = Field(..., description="Processing time in milliseconds")

# Model Info Models
class ModelInfoResponse(BaseModel):
    model_name: str
    actual_dimension: int
    target_dimension: int
    requires_resizing: bool

# Chat/Orchestrator Models
class ChatRequest(BaseModel):
    message: str = Field(..., description="The user's chat message")
    user_id: Optional[str] = Field(None, description="Optional user ID for context")
    auth_token: Optional[str] = Field(None, description="JWT authentication token for API calls")
    user_role: Optional[Literal['user', 'admin']] = Field(None, description="User role for tool selection")

class ChatResponse(BaseModel):
    response: str = Field(..., description="The agent's response to the user's message")
    tools_used: Optional[List[str]] = Field(None, description="List of tools used by the agent")
    user_role: Optional[str] = Field(None, description="Role used for tool selection")

# Agent Information Models
class AgentInfoResponse(BaseModel):
    agent_type: str = Field(..., description="Type of agent (user or admin)")
    available_tools: List[str] = Field(..., description="List of available tools for this agent type")
    total_tools: int = Field(..., description="Total number of available tools")

# Error Response Models
class ErrorResponse(BaseModel):
    error: str = Field(..., description="Error message")
    error_type: Optional[str] = Field(None, description="Type of error")
    details: Optional[dict] = Field(None, description="Additional error details")

# Role Detection Models
class RoleDetectionRequest(BaseModel):
    auth_token: str = Field(..., description="JWT authentication token")

class RoleDetectionResponse(BaseModel):
    role: Literal['user', 'admin'] = Field(..., description="Detected user role")
    confidence: float = Field(..., description="Confidence score for role detection")
    method: str = Field(..., description="Method used for role detection")
