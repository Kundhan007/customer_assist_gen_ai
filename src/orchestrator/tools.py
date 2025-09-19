from langchain_core.tools import tool
from src.agents import user_agent, claims_agent, policy_agent, claim_history_agent, knowledge_agent

# --- User Tools ---

@tool
def get_user_by_id_tool(user_id: str) -> dict:
    """Retrieve user details by their UUID. Returns a dictionary of user information or raises ValueError if not found."""
    return user_agent.get_user_by_id(user_id)

@tool
def get_user_by_email_tool(email: str) -> dict:
    """Retrieve user details by their email address. Returns a dictionary of user information or raises ValueError if not found."""
    return user_agent.get_user_by_email(email)

# --- Claims Tools ---

@tool
def create_claim_tool(policy_id: str, damage_description: str, vehicle_make: str, vehicle_model: str, vehicle_year: int, photos_available: bool = False) -> dict:
    """
    Creates a new claim for a given policy.
    - policy_id: The ID of the policy to claim against.
    - damage_description: A text description of the damage.
    - vehicle_make: The make of the vehicle (e.g., 'Toyota').
    - vehicle_model: The model of the vehicle (e.g., 'Camry').
    - vehicle_year: The manufacturing year of the vehicle (e.g., 2020).
    - photos_available: (Optional) Boolean indicating if photos are available for the claim. Defaults to False.
    Returns the newly created claim's details.
    """
    vehicle_details = {
        'make': vehicle_make,
        'model': vehicle_model,
        'year': vehicle_year
    }
    # The underlying claims_agent.create_claim expects a list for photos, 
    # but for this tool's simplicity, we'll pass an empty list or a placeholder.
    # If specific photo URLs were needed, the tool's interface would need to be more complex.
    photo_list = ["placeholder.jpg"] if photos_available else []
    
    return claims_agent.create_claim(policy_id, damage_description, vehicle_details, photo_list)

@tool
def get_claim_by_id_tool(claim_id: str) -> dict:
    """Retrieves the details of a specific claim using its ID. Returns a dictionary of claim information or raises ValueError if not found."""
    return claims_agent.get_claim_by_id(claim_id)

@tool
def get_claims_by_policy_tool(policy_id: str) -> list:
    """Retrieves a list of all claims associated with a specific policy_id, ordered by last updated date."""
    return claims_agent.get_claims_by_policy(policy_id)

# --- Policy Tools ---

@tool
def get_policy_by_id_tool(policy_id: str) -> dict:
    """Retrieves the details of a specific policy using its ID. Returns a dictionary of policy information or raises ValueError if not found."""
    return policy_agent.get_policy_by_id(policy_id)

@tool
def get_policies_by_user_tool(user_id: str) -> list:
    """Retrieves a list of all policies for a given user_id, ordered by creation date."""
    return policy_agent.get_policies_by_user(user_id)

@tool
def calculate_premium_tool(plan_name: str, collision_coverage: int, roadside_assistance: bool, deductible: int) -> float:
    """
    Calculates the insurance premium based on policy details.
    - plan_name: Either 'Silver' or 'Gold'.
    - collision_coverage: The amount of collision coverage (e.g., 200000 for ₹2,00,000).
    - roadside_assistance: Boolean indicating if roadside assistance is included.
    - deductible: The deductible amount (e.g., 5000 for ₹5,000).
    Returns the calculated premium as a float.
    """
    return policy_agent.calculate_premium(plan_name, collision_coverage, roadside_assistance, deductible)

# --- Claim History Tools ---

@tool
def get_claim_history_by_user_id_tool(user_id: str) -> list:
    """
    Retrieves all claims for all policies belonging to a given user_id, ordered chronologically by last updated date.
    Provides a comprehensive view of a user's claim history.
    """
    return claim_history_agent.get_claim_history_by_user_id(user_id)

# --- Knowledge Search Tool ---

@tool
def search_knowledge_base_tool(query: str, limit: int = 5, source_filter: str = None) -> list:
    """
    Searches the knowledge base for entries similar to the query using vector similarity.
    - query: The search query text.
    - limit: (Optional) Maximum number of results to return (default: 5).
    - source_filter: (Optional) Filter by source_type (e.g., 'faq', 'policy_doc'). If None, searches all sources.
    Returns a list of knowledge base entries with similarity scores.
    """
    # knowledge_agent.search_knowledge_base is an instance method, so we use the global instance
    return knowledge_agent.knowledge_agent.search_knowledge_base(query, limit, source_filter)

# List of all available tools for the orchestrator
AGENT_TOOLS = [
    get_user_by_id_tool,
    get_user_by_email_tool,
    create_claim_tool,
    get_claim_by_id_tool,
    get_claims_by_policy_tool,
    get_policy_by_id_tool,
    get_policies_by_user_tool,
    calculate_premium_tool,
    get_claim_history_by_user_id_tool,
    search_knowledge_base_tool,
]
