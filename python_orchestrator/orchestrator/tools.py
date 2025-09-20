from langchain_core.tools import tool
from python_orchestrator.agents import user_agent, claims_agent # Adjusted import path

# Global variable to store auth token (will be set by the FastAPI app)
AUTH_TOKEN = None

def set_auth_token(token: str):
    """Set the authentication token for API calls."""
    global AUTH_TOKEN
    AUTH_TOKEN = token

# --- User Tools ---

@tool
async def get_user_by_id_tool(user_id: str) -> dict:
    """Retrieve user details by their UUID. Note: This requires admin role. For current user info, use get_current_user_profile_tool."""
    # Since the agent function is async, the tool must also be async.
    return await user_agent.get_user_by_id(user_id, AUTH_TOKEN)

@tool
async def get_current_user_profile_tool() -> dict:
    """Retrieve current user's profile information. Returns a dictionary of user information or raises ValueError if not found."""
    # Since the agent function is async, the tool must also be async.
    if not AUTH_TOKEN:
        raise ValueError("Authentication token is required to access user profile")
    return await user_agent.get_current_user_profile(AUTH_TOKEN)

@tool
async def get_user_by_email_tool(email: str) -> dict:
    """Retrieve user details by their email address. Returns a dictionary of user information or raises ValueError if not found."""
    # Since the agent function is async, the tool must also be async.
    return await user_agent.get_user_by_email(email, AUTH_TOKEN)

# --- Claims Tools ---

@tool
async def get_user_claims_tool(active_only: bool = False) -> list:
    """Retrieve current user's claims. Returns a list of claim information. Set active_only=True to get only active claims."""
    # Since the agent function is async, the tool must also be async.
    if not AUTH_TOKEN:
        raise ValueError("Authentication token is required to access user claims")
    return await claims_agent.get_user_claims(AUTH_TOKEN, active_only)

@tool
async def get_user_claim_by_id_tool(claim_id: str) -> dict:
    """Retrieve a specific claim by ID for the current user. Returns claim information or raises ValueError if not found."""
    # Since the agent function is async, the tool must also be async.
    if not AUTH_TOKEN:
        raise ValueError("Authentication token is required to access user claims")
    return await claims_agent.get_user_claim_by_id(claim_id, AUTH_TOKEN)

@tool
async def get_claim_history_tool(claim_id: str) -> list:
    """Retrieve the history of a specific claim for the current user. Returns a list of claim history entries."""
    # Since the agent function is async, the tool must also be async.
    if not AUTH_TOKEN:
        raise ValueError("Authentication token is required to access claim history")
    return await claims_agent.get_claim_history(claim_id, AUTH_TOKEN)

# List of all available tools for the orchestrator
# More tools (claims, policies, etc.) will be added here later.
AGENT_TOOLS = [
    get_user_by_id_tool,
    get_current_user_profile_tool,
    get_user_by_email_tool,
    get_user_claims_tool,
    get_user_claim_by_id_tool,
    get_claim_history_tool,
]
