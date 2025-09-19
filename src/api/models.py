from pydantic import BaseModel
from typing import Optional

class QueryRequest(BaseModel):
    query: str
    model_name: Optional[str] = "gpt-4o-mini"
    temperature: Optional[float] = 0.0

class QueryResponse(BaseModel):
    response: str
    status: str

class HealthResponse(BaseModel):
    status: str
    agent_loaded: bool
