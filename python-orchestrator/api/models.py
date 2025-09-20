from pydantic import BaseModel, Field
from typing import List, Optional

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
