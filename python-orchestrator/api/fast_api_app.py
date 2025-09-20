import os
import sys
import time
from fastapi import FastAPI, HTTPException

# Add current directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from api.models import (
    HealthResponse, VectorizationRequest, VectorizationResponse,
    BatchVectorizationRequest, BatchVectorizationResponse, ModelInfoResponse,
    ChatRequest, ChatResponse
)
from vectorization.text_vectorizer import TextVectorizer
from orchestrator.langhub import run_agent

# Global vectorizer instance
vectorizer = None

# FastAPI app
app = FastAPI(
    title="Python Vectorization Orchestrator",
    description="Text vectorization service using sentence transformers",
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
        # Don't raise here to allow the app to start, but mark as not loaded

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
        "message": "Python Vectorization Orchestrator",
        "version": "1.0.0",
        "endpoints": {
            "health": "/health",
            "vectorize": "/vectorize",
            "vectorize-batch": "/vectorize-batch",
            "model-info": "/model-info",
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
        
        # Create temporary vectorizer with custom settings if provided
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
        
        # Create temporary vectorizer with custom settings if provided
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

@app.post("/chat", response_model=ChatResponse)
async def chat_with_agent(request: ChatRequest):
    """
    Chat with the LangChain agent which can use tools to interact with the NestJS backend.
    """
    try:
        # Prepend user_id to the query for context if provided
        full_query = f"User ID: {request.user_id}. Message: {request.message}" if request.user_id else request.message
        
        agent_response = await run_agent(full_query)
        return ChatResponse(response=agent_response)
    except ValueError as e: # Catch specific errors like missing API key
        raise HTTPException(status_code=500, detail=f"Agent configuration error: {str(e)}")
    except RuntimeError as e: # Catch agent initialization errors
        raise HTTPException(status_code=503, detail=f"Agent service unavailable: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat processing failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    host = os.getenv('API_HOST', '0.0.0.0')
    port = int(os.getenv('API_PORT', '2345'))
    uvicorn.run(app, host=host, port=port)
