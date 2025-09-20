import os
from langchain_openai import ChatOpenAI
from langchain.agents import initialize_agent, AgentType
from python_orchestrator.config import OPENAI_API_KEY
from .agent_factory import create_agent_with_auth, create_role_based_agent

def get_orchestrator_agent(
    auth_token: str = None,
    user_role: str = None,
    openai_api_key: str = None,
    model_name: str = "gpt-4o-mini",
    temperature: float = 0.0,
    verbose: bool = True
):
    """
    Initializes and returns a LangChain agent configured with role-based tools.

    Args:
        auth_token (str, optional): JWT authentication token for API calls.
        user_role (str, optional): User role ('user' or 'admin'). If not provided,
                                 role will be detected from auth_token.
        openai_api_key (str, optional): OpenAI API key.
        model_name (str, optional): Model name. Defaults to "gpt-4o-mini".
        temperature (float, optional): LLM temperature. Defaults to 0.0.
        verbose (bool, optional): Verbose logging. Defaults to True.

    Returns:
        langchain.agents.Agent: The initialized LangChain agent.
    """
    if not auth_token:
        raise ValueError("Authentication token is required for the orchestrator agent.")

    if user_role:
        # Create agent with explicit role
        return create_role_based_agent(
            auth_token=auth_token,
            user_role=user_role,
            openai_api_key=openai_api_key,
            model_name=model_name,
            temperature=temperature,
            verbose=verbose
        )
    else:
        # Create agent with automatic role detection
        return create_agent_with_auth(
            auth_token=auth_token,
            openai_api_key=openai_api_key,
            model_name=model_name,
            temperature=temperature,
            verbose=verbose
        )

def get_user_agent(auth_token: str, **kwargs):
    """
    Get a user agent with user-level permissions only.
    
    Args:
        auth_token (str): JWT authentication token.
        **kwargs: Additional arguments for agent creation.
    
    Returns:
        langchain.agents.Agent: User-level agent.
    """
    return create_role_based_agent(
        auth_token=auth_token,
        user_role='user',
        **kwargs
    )

def get_admin_agent(auth_token: str, **kwargs):
    """
    Get an admin agent with admin-level permissions.
    
    Args:
        auth_token (str): JWT authentication token.
        **kwargs: Additional arguments for agent creation.
    
    Returns:
        langchain.agents.Agent: Admin-level agent.
    """
    return create_role_based_agent(
        auth_token=auth_token,
        user_role='admin',
        **kwargs
    )

async def run_agent(query: str, auth_token: str = None, user_role: str = None, agent=None):
    """
    Run the agent with a given query using role-based tool selection.

    Args:
        query (str): The user's query or instruction for the agent.
        auth_token (str, optional): JWT authentication token.
        user_role (str, optional): User role ('user' or 'admin').
        agent (langchain.agents.Agent, optional): Existing agent instance.

    Returns:
        str: The agent's response.
    """
    if not agent:
        if not auth_token:
            raise ValueError("Either an existing agent or auth_token is required.")
        
        agent = get_orchestrator_agent(
            auth_token=auth_token,
            user_role=user_role
        )

    if not agent:
        raise RuntimeError("Agent could not be initialized.")

    try:
        result = await agent.ainvoke({"input": query})
        return result.get("output", "Agent did not return an output.")
    except Exception as e:
        return f"An error occurred while running the agent: {e}"

async def run_user_agent(query: str, auth_token: str):
    """
    Run a user-level agent with restricted permissions.
    
    Args:
        query (str): The user's query.
        auth_token (str): JWT authentication token.
    
    Returns:
        str: The agent's response.
    """
    agent = get_user_agent(auth_token)
    return await run_agent(query, agent=agent)

async def run_admin_agent(query: str, auth_token: str):
    """
    Run an admin-level agent with full permissions.
    
    Args:
        query (str): The user's query.
        auth_token (str): JWT authentication token.
    
    Returns:
        str: The agent's response.
    """
    agent = get_admin_agent(auth_token)
    return await run_agent(query, agent=agent)
