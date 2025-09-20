import os
from langchain_openai import ChatOpenAI
from langchain.agents import initialize_agent, AgentType
from python_orchestrator.config import OPENAI_API_KEY
from .tools import get_tools_for_role, set_auth_token, set_user_role

def create_role_based_agent(
    auth_token: str,
    user_role: str = 'user',
    openai_api_key: str = None,
    model_name: str = "gpt-4o-mini",
    temperature: float = 0.0,
    verbose: bool = True
):
    """
    Create a LangChain agent with role-based tool selection.
    
    Args:
        auth_token (str): JWT authentication token for API calls.
        user_role (str): User role ('user' or 'admin'). Defaults to 'user'.
        openai_api_key (str, optional): OpenAI API key.
        model_name (str, optional): Model name. Defaults to "gpt-4o-mini".
        temperature (float, optional): LLM temperature. Defaults to 0.0.
        verbose (bool, optional): Verbose logging. Defaults to True.
    
    Returns:
        langchain.agents.Agent: Configured agent with role-appropriate tools.
    """
    if not openai_api_key:
        openai_api_key = OPENAI_API_KEY

    if not openai_api_key:
        raise ValueError("OpenAI API key not found. Please set it in the .env file.")

    # Set auth token and user role for tools
    set_auth_token(auth_token)
    set_user_role(user_role)

    # Get tools based on user role
    tools = get_tools_for_role(user_role)

    # Initialize LLM
    llm = ChatOpenAI(
        openai_api_key=openai_api_key,
        model_name=model_name,
        temperature=temperature
    )

    # Initialize agent with role-specific tools
    agent = initialize_agent(
        tools=tools,
        llm=llm,
        agent=AgentType.STRUCTURED_CHAT_ZERO_SHOT_REACT_DESCRIPTION,
        verbose=verbose,
        handle_parsing_errors=True
    )

    return agent

def get_user_role_from_token(auth_token: str) -> str:
    """
    Extract user role from JWT token.
    This is a simplified implementation. In production, you should
    properly decode and validate the JWT token.
    
    Args:
        auth_token (str): JWT authentication token.
    
    Returns:
        str: User role ('user' or 'admin').
    """
    # This is a simplified implementation
    # In production, you should decode the JWT and extract the role
    # For now, we'll check for admin indicators in the token or default to user
    
    try:
        # Simple check - if token contains 'admin' or similar, assume admin role
        # This is NOT secure for production - proper JWT decoding is required
        if 'admin' in auth_token.lower():
            return 'admin'
        
        # You could also check token payload if it's base64 encoded
        # For production, use a proper JWT library like PyJWT
        
        return 'user'
    except Exception:
        # Default to user role if there's any issue
        return 'user'

def create_agent_with_auth(auth_token: str, **kwargs) -> object:
    """
    Create agent with automatic role detection from auth token.
    
    Args:
        auth_token (str): JWT authentication token.
        **kwargs: Additional arguments for create_role_based_agent.
    
    Returns:
        langchain.agents.Agent: Configured agent.
    """
    # Determine user role from token
    user_role = get_user_role_from_token(auth_token)
    
    # Create agent with detected role
    return create_role_based_agent(
        auth_token=auth_token,
        user_role=user_role,
        **kwargs
    )
