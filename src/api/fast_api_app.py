from fastapi import FastAPI, HTTPException
from src.api.models import QueryRequest, QueryResponse, HealthResponse

# Global agent instance
agent_instance = None
agent_available = False

# Try to import the orchestrator, but don't fail if database is not available
try:
    from src.orchestrator.langhub import get_orchestrator_agent, run_agent
    agent_available = True
    print("LangHub orchestrator imported successfully")
except Exception as e:
    print(f"Could not import LangHub orchestrator: {e}")
    print("API will run in limited mode without agent functionality")

# FastAPI app
app = FastAPI(
    title="LangHub API",
    description="FastAPI wrapper for LangHub orchestrator",
    version="1.0.0"
)

@app.on_event("startup")
async def startup_event():
    """Initialize the orchestrator agent on startup"""
    global agent_instance
    if agent_available:
        try:
            agent_instance = get_orchestrator_agent()
            print("LangHub agent initialized successfully")
        except Exception as e:
            print(f"Failed to initialize LangHub agent: {e}")
            print("API will start but agent functionality will be limited")
            # Don't raise here to allow the app to start, but mark agent as not loaded
    else:
        print("LangHub orchestrator not available - API will run in limited mode")

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    global agent_instance
    agent_instance = None
    print("LangHub agent shutdown complete")

@app.get("/", response_model=dict)
async def root():
    """Root endpoint with API info"""
    return {
        "message": "LangHub API",
        "version": "1.0.0",
        "endpoints": {
            "query": "/query",
            "health": "/health",
            "docs": "/docs"
        }
    }

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    return HealthResponse(
        status="healthy",
        agent_loaded=agent_instance is not None
    )

@app.post("/query", response_model=QueryResponse)
async def query_agent(request: QueryRequest):
    """Query the LangHub agent"""
    if agent_instance is None:
        # Provide a meaningful fallback response when agent is not available
        fallback_response = get_fallback_response(request.query)
        return QueryResponse(
            response=fallback_response,
            status="limited_mode"
        )
    
    try:
        response = run_agent(request.query, agent=agent_instance)
        return QueryResponse(
            response=response,
            status="success"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error processing query: {str(e)}"
        )

def get_fallback_response(query: str) -> str:
    """Generate a fallback response when the agent is not available"""
    query_lower = query.lower()
    
    if any(word in query_lower for word in ["hello", "hi", "hey"]):
        return "Hello! I'm currently running in limited mode due to database connectivity issues. I can provide basic responses, but for full functionality, please ensure the database is properly configured."
    
    elif any(word in query_lower for word in ["help", "support", "assistance"]):
        return "I'm here to help! However, I'm currently running in limited mode. I can assist with basic questions, but for comprehensive support, please check the database connection and restart the service."
    
    elif any(word in query_lower for word in ["insurance", "policy", "claim"]):
        return "I understand you're asking about insurance-related topics. Due to current system limitations, I cannot access the full database to provide detailed information about policies or claims. Please contact customer support or try again later when the system is fully operational."
    
    elif any(word in query_lower for word in ["status", "working", "operational"]):
        return "The API is running, but in limited mode due to database connectivity issues. Basic functionality is available, but full agent capabilities require a working database connection."
    
    else:
        return "I'm currently operating in limited mode and cannot provide my full range of services. This is due to database connectivity issues. For the best experience, please ensure the database is properly configured and restart the service. In the meantime, I can provide basic responses to simple questions."

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
