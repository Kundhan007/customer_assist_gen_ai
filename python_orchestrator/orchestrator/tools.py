from langchain_core.tools import tool
from python_orchestrator.agents import user_agent # Adjusted import path

# Global variable to store auth token (will be set by the FastAPI app)
AUTH_TOKEN = None

def set_auth_token(token: str):
    """Set the authentication token for API calls."""
    global AUTH_TOKEN
    AUTH_TOKEN = token

# --- User Tools ---

@tool
async def get_user_by_id_tool(user_id: str) -> dict:
    """Retrieve user details by their UUID. Returns a dictionary of user information or raises ValueError if not found."""
    # Since the agent function is async, the tool must also be async.
    return await user_agent.get_user_by_id(user_id, AUTH_TOKEN)

@tool
async def get_user_by_email_tool(email: str) -> dict:
    """Retrieve user details by their email address. Returns a dictionary of user information or raises ValueError if not found."""
    # Since the agent function is async, the tool must also be async.
    return await user_agent.get_user_by_email(email, AUTH_TOKEN)

# List of all available tools for the orchestrator
# More tools (claims, policies, etc.) will be added here later.
AGENT_TOOLS = [
    get_user_by_id_tool,
    get_user_by_email_tool,
]
