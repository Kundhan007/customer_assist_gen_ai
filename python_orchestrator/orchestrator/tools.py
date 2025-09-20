from langchain_core.tools import tool
from python_orchestrator.agents import user_agent, claims_agent, policy_agent, admin_agent, premium_agent
from typing import List
import requests
import os
from python_orchestrator.utils.logger import get_logger

logger = get_logger(__name__)

# NestJS backend URL
NESTJS_BASE_URL = os.getenv('NESTJS_BASE_URL', 'http://localhost:3000')

# Global variable to store auth token and user role
AUTH_TOKEN = None
USER_ROLE = None  # 'user' or 'admin'

def set_auth_token(token: str):
    """Set the authentication token for API calls."""
    global AUTH_TOKEN
    AUTH_TOKEN = token

def set_user_role(role: str):
    """Set the user role for tool selection."""
    global USER_ROLE
    USER_ROLE = role

# --- User Tools (Available to all users) ---

@tool
async def get_current_user_profile_tool() -> dict:
    """Retrieve current user's profile information."""
    if not AUTH_TOKEN:
        raise ValueError("Authentication token is required to access user profile")
    return await user_agent.get_current_user_profile(AUTH_TOKEN)

@tool
async def get_user_claims_tool(active_only: bool = False) -> list:
    """Retrieve current user's claims. Set active_only=True to get only active claims."""
    if not AUTH_TOKEN:
        raise ValueError("Authentication token is required to access user claims")
    return await claims_agent.get_user_claims(AUTH_TOKEN, active_only)

@tool
async def get_user_claim_by_id_tool(claim_id: str) -> dict:
    """Retrieve a specific claim by ID for the current user."""
    if not AUTH_TOKEN:
        raise ValueError("Authentication token is required to access user claims")
    return await claims_agent.get_user_claim_by_id(claim_id, AUTH_TOKEN)

@tool
async def get_claim_history_tool(claim_id: str) -> list:
    """Retrieve the history of a specific claim for the current user."""
    if not AUTH_TOKEN:
        raise ValueError("Authentication token is required to access claim history")
    return await claims_agent.get_claim_history(claim_id, AUTH_TOKEN)

@tool
async def get_user_policies_tool(active_only: bool = False) -> list:
    """Get current user's policies. Set active_only=True to get only active policies."""
    if not AUTH_TOKEN:
        raise ValueError("Authentication token is required to access user policies")
    return await policy_agent.get_user_policies(AUTH_TOKEN, active_only)

@tool
async def get_user_policy_by_id_tool(policy_id: str) -> dict:
    """Get specific policy details for current user."""
    if not AUTH_TOKEN:
        raise ValueError("Authentication token is required to access user policies")
    return await policy_agent.get_user_policy_by_id(policy_id, AUTH_TOKEN)

@tool
async def calculate_premium_tool(premium_data: dict) -> dict:
    """Calculate premium for a policy."""
    if not AUTH_TOKEN:
        raise ValueError("Authentication token is required to calculate premium")
    return await premium_agent.calculate_premium(premium_data, AUTH_TOKEN)

# --- Admin Tools (Available only to admin users) ---

@tool
async def get_user_by_id_tool(user_id: str) -> dict:
    """Retrieve user details by their UUID (admin only)."""
    if not AUTH_TOKEN:
        raise ValueError("Authentication token is required to access user data")
    if USER_ROLE != 'admin':
        raise ValueError("Admin access required to fetch user by ID")
    return await user_agent.get_user_by_id(user_id, AUTH_TOKEN)

@tool
async def get_user_by_email_tool(email: str) -> dict:
    """Retrieve user details by their email address (admin only)."""
    if not AUTH_TOKEN:
        raise ValueError("Authentication token is required to access user data")
    if USER_ROLE != 'admin':
        raise ValueError("Admin access required to fetch user by email")
    return await user_agent.get_user_by_email(email, AUTH_TOKEN)

@tool
async def get_all_users_tool() -> list:
    """Get all users (admin only)."""
    if not AUTH_TOKEN:
        raise ValueError("Authentication token is required to access user data")
    if USER_ROLE != 'admin':
        raise ValueError("Admin access required to fetch all users")
    return await admin_agent.get_all_users(AUTH_TOKEN)

@tool
async def get_user_by_id_admin_tool(user_id: str) -> dict:
    """Get specific user details (admin only)."""
    if not AUTH_TOKEN:
        raise ValueError("Authentication token is required to access user data")
    if USER_ROLE != 'admin':
        raise ValueError("Admin access required to fetch user details")
    return await admin_agent.get_user_by_id_admin(user_id, AUTH_TOKEN)

@tool
async def create_user_tool(user_data: dict) -> dict:
    """Create new user (admin only)."""
    if not AUTH_TOKEN:
        raise ValueError("Authentication token is required to create user")
    if USER_ROLE != 'admin':
        raise ValueError("Admin access required to create user")
    return await admin_agent.create_user(user_data, AUTH_TOKEN)

@tool
async def get_all_policies_tool() -> list:
    """Get all policies (admin only)."""
    if not AUTH_TOKEN:
        raise ValueError("Authentication token is required to access policies")
    if USER_ROLE != 'admin':
        raise ValueError("Admin access required to fetch all policies")
    return await policy_agent.get_all_policies(AUTH_TOKEN)

@tool
async def create_policy_tool(policy_data: dict) -> dict:
    """Create new policy (admin only)."""
    if not AUTH_TOKEN:
        raise ValueError("Authentication token is required to create policy")
    if USER_ROLE != 'admin':
        raise ValueError("Admin access required to create policy")
    return await policy_agent.create_policy(policy_data, AUTH_TOKEN)

@tool
async def upload_knowledge_base_tool(kb_data: dict) -> dict:
    """Upload knowledge base (admin only)."""
    if not AUTH_TOKEN:
        raise ValueError("Authentication token is required to upload knowledge base")
    if USER_ROLE != 'admin':
        raise ValueError("Admin access required to upload knowledge base")
    return await admin_agent.upload_knowledge_base(kb_data, AUTH_TOKEN)

@tool
async def delete_knowledge_base_entry_tool(kb_id: str) -> dict:
    """Delete knowledge base entry (admin only)."""
    if not AUTH_TOKEN:
        raise ValueError("Authentication token is required to delete knowledge base")
    if USER_ROLE != 'admin':
        raise ValueError("Admin access required to delete knowledge base")
    return await admin_agent.delete_knowledge_base_entry(kb_id, AUTH_TOKEN)

# --- RAG Tool (Available to all users) ---

@tool
async def search_knowledge_base_tool(query: str, limit: int = 3) -> dict:
    """Search knowledge base for similar content using RAG with cosine similarity."""
    try:
        # Step 1: Vectorize the query in Python orchestrator
        from python_orchestrator.vectorization.text_vectorizer import TextVectorizer
        vectorizer = TextVectorizer()
        
        logger.info(f"Vectorizing query: {query}")
        query_vector = vectorizer.vectorize_chunk(query)
        
        # Step 2: Send vector to NestJS for similarity comparison
        rag_url = f"{NESTJS_BASE_URL}/orchestrator/rag/search-vector"
        
        payload = {
            "vector": query_vector.tolist(),
            "limit": limit,
            "query": query  # Include original query for context
        }
        
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {AUTH_TOKEN}" if AUTH_TOKEN else None
        }
        
        # Remove None headers
        headers = {k: v for k, v in headers.items() if v is not None}
        
        logger.info(f"Making vector-based RAG request to {rag_url}")
        
        response = requests.post(rag_url, json=payload, headers=headers, timeout=30)
        
        if response.status_code == 200:
            result = response.json()
            logger.info(f"Vector RAG search returned {len(result.get('results', []))} results")
            return result
        else:
            logger.error(f"Vector RAG search failed with status {response.status_code}: {response.text}")
            return {"error": f"Vector RAG search failed: {response.text}"}
            
    except requests.exceptions.RequestException as e:
        logger.error(f"Vector RAG search request failed: {e}")
        return {"error": f"Vector RAG search request failed: {str(e)}"}
    except Exception as e:
        logger.error(f"Unexpected error in vector RAG search: {e}")
        return {"error": f"Unexpected error in vector RAG search: {str(e)}"}


# Tool lists for different user roles
USER_TOOLS = [
    get_current_user_profile_tool,
    get_user_claims_tool,
    get_user_claim_by_id_tool,
    get_claim_history_tool,
    get_user_policies_tool,
    get_user_policy_by_id_tool,
    calculate_premium_tool,
    search_knowledge_base_tool,  # Add RAG tool to user tools
]

ADMIN_TOOLS = USER_TOOLS + [
    get_user_by_id_tool,
    get_user_by_email_tool,
    get_all_users_tool,
    get_user_by_id_admin_tool,
    create_user_tool,
    get_all_policies_tool,
    create_policy_tool,
    upload_knowledge_base_tool,
    delete_knowledge_base_entry_tool,
]

def get_tools_for_role(role: str) -> List:
    """Get tools based on user role."""
    if role == 'admin':
        return ADMIN_TOOLS
    else:
        return USER_TOOLS
