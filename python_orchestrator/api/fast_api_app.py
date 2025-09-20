import os
import sys
import time
from fastapi import FastAPI, HTTPException

# Add current directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from api.models import (
    HealthResponse, VectorizationRequest, VectorizationResponse,
    BatchVectorizationRequest, BatchVectorizationResponse, ModelInfoResponse,
    ChatRequest, ChatResponse, AgentInfoResponse, RoleDetectionRequest,
    RoleDetectionResponse, ErrorResponse
)
from vectorization.text_vectorizer import TextVectorizer
from orchestrator.langhub import run_agent, get_orchestrator_agent
from orchestrator.agent_factory import get_user_role_from_token
from orchestrator.tools import get_tools_for_role

# Global vectorizer instance
vectorizer = None

# FastAPI app
app = FastAPI(
    title="Python Vectorization Orchestrator",
    description="Text vectorization service with role-based AI agents",
    version="1.0.0"
)

@app.on_event("startup")
async def startup_event():
    """Initialize the text vectorizer on startup"""
    global vectorizer
    try:
        vectorizer = TextVectorizer()
        print("Text vectorizer initialized successfully")
    except Exception as e:
        print(f"Failed to initialize text vectorizer: {e}")

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    global vectorizer
    vectorizer = None
    print("Text vectorizer shutdown complete")

@app.get("/", response_model=dict)
async def root():
    """Root endpoint with API info"""
    return {
        "message": "Python Vectorization Orchestrator with Role-Based Agents",
        "version": "1.0.0",
        "endpoints": {
            "health": "/health",
            "vectorize": "/vectorize",
            "vectorize-batch": "/vectorize-batch",
            "model-info": "/model-info",
            "chat": "/chat",
            "agent-info": "/agent-info",
            "detect-role": "/detect-role",
            "docs": "/docs"
        }
    }

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint with model information"""
    if vectorizer is None:
        return HealthResponse(
            status="unhealthy",
            model_loaded=False
        )
    
    try:
        model_info = vectorizer.get_model_info()
        return HealthResponse(
            status="healthy",
            model_loaded=True,
            model_info=model_info
        )
    except Exception as e:
        return HealthResponse(
            status="degraded",
            model_loaded=True,
            model_info={"error": str(e)}
        )

@app.get("/model-info", response_model=ModelInfoResponse)
async def get_model_info():
    """Get detailed information about the current model"""
    if vectorizer is None:
        raise HTTPException(status_code=503, detail="Vectorization service not available")
    
    try:
        model_info = vectorizer.get_model_info()
        return ModelInfoResponse(**model_info)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get model info: {str(e)}")

@app.post("/vectorize", response_model=VectorizationResponse)
async def vectorize_text(request: VectorizationRequest):
    """Generate vector embedding for text using sentence transformers"""
    if vectorizer is None:
        raise HTTPException(status_code=503, detail="Vectorization service not available")
    
    try:
        start_time = time.time()
        
        if request.model_name or request.vector_dimension:
            temp_vectorizer = TextVectorizer(
                model_name=request.model_name,
                vector_dimension=request.vector_dimension
            )
            vector = temp_vectorizer.vectorize_chunk(request.text)
            model_info = temp_vectorizer.get_model_info()
        else:
            vector = vectorizer.vectorize_chunk(request.text)
            model_info = vectorizer.get_model_info()
        
        processing_time = (time.time() - start_time) * 1000
        
        return VectorizationResponse(
            vector=vector.tolist(),
            dimension=len(vector),
            model_used=model_info['model_name'],
            processing_time_ms=processing_time
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Vectorization failed: {str(e)}")

@app.post("/vectorize-batch", response_model=BatchVectorizationResponse)
async def vectorize_batch(request: BatchVectorizationRequest):
    """Generate vector embeddings for multiple texts in batch"""
    if vectorizer is None:
        raise HTTPException(status_code=503, detail="Vectorization service not available")
    
    try:
        start_time = time.time()
        
        if request.model_name or request.vector_dimension:
            temp_vectorizer = TextVectorizer(
                model_name=request.model_name,
                vector_dimension=request.vector_dimension
            )
            vectors = temp_vectorizer.vectorize_chunks_batch(request.texts)
            model_info = temp_vectorizer.get_model_info()
        else:
            vectors = vectorizer.vectorize_chunks_batch(request.texts)
            model_info = vectorizer.get_model_info()
        
        processing_time = (time.time() - start_time) * 1000
        
        return BatchVectorizationResponse(
            vectors=[v.tolist() for v in vectors],
            dimension=len(vectors[0]) if vectors else 0,
            model_used=model_info['model_name'],
            processing_time_ms=processing_time
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Batch vectorization failed: {str(e)}")

@app.post("/detect-role", response_model=RoleDetectionResponse)
async def detect_role(request: RoleDetectionRequest):
    """Detect user role from authentication token"""
    try:
        role = get_user_role_from_token(request.auth_token)
        return RoleDetectionResponse(
            role=role,
            confidence=0.8 if role == "admin" else 0.9,
            method="token_analysis"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Role detection failed: {str(e)}")

@app.get("/agent-info", response_model=AgentInfoResponse)
async def get_agent_info(agent_type: str = "user"):
    """Get information about available tools for a specific agent type"""
    try:
        if agent_type not in ["user", "admin"]:
            raise HTTPException(status_code=400, detail="Agent type must be 'user' or 'admin'")
        
        tools = get_tools_for_role(agent_type)
        tool_names = [tool.name for tool in tools]
        
        return AgentInfoResponse(
            agent_type=agent_type,
            available_tools=tool_names,
            total_tools=len(tool_names)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get agent info: {str(e)}")

@app.post("/chat", response_model=ChatResponse)
async def chat_with_agent(request: ChatRequest):
    """
    Chat with the LangChain agent which can use tools to interact with the NestJS backend.
    The agent will have different tools available based on the user's role.
    """
    try:
        if not request.auth_token:
            raise HTTPException(status_code=401, detail="Authentication token is required")
        
        # Determine user role
        user_role = request.user_role or get_user_role_from_token(request.auth_token)
        
        # Prepend user_id to the query for context if provided
        full_query = f"User ID: {request.user_id}. Message: {request.message}" if request.user_id else request.message
        
        # Run agent with role-based tools
        agent_response = await run_agent(
            query=full_query,
            auth_token=request.auth_token,
            user_role=user_role
        )
        
        return ChatResponse(
            response=agent_response,
            user_role=user_role,
            tools_used=[]  # Could be enhanced to track actual tools used
        )
    except ValueError as e:
        raise HTTPException(status_code=500, detail=f"Agent configuration error: {str(e)}")
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=f"Agent service unavailable: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat processing failed: {str(e)}")

@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    """General exception handler for unhandled errors"""
    return ErrorResponse(
        error=str(exc),
        error_type=type(exc).__name__,
        details={"path": str(request.url)}
    )

if __name__ == "__main__":
    import uvicorn
    host = os.getenv('API_HOST', '0.0.0.0')
    port = int(os.getenv('API_PORT', '2345'))
    uvicorn.run(app, host=host, port=port)
