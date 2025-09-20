import httpx
import os
import logging
from typing import Dict, Any

# Configure logging
logger = logging.getLogger(__name__)

# Get NestJS backend URL from environment variables
NESTJS_BACKEND_URL = os.getenv("NESTJS_BACKEND_URL", "http://localhost:3001")

async def get_user_by_id(user_id: str, auth_token: str = None) -> Dict[str, Any]:
    """
    Retrieve user details by their UUID from the NestJS backend.
    Note: This endpoint requires admin role. For user self-access, use get_current_user_profile.

    Args:
        user_id (str): The UUID of the user.
        auth_token (str, optional): JWT authentication token.

    Returns:
        Dict[str, Any]: A dictionary of user information.

    Raises:
        ValueError: If the user is not found or an API error occurs.
    """
    url = f"{NESTJS_BACKEND_URL}/users/{user_id}"
    headers = {}
    if auth_token:
        headers["Authorization"] = f"Bearer {auth_token}"
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url, headers=headers)
            response.raise_for_status()  # Raises an exception for 4XX/5XX errors
            return response.json()
    except httpx.HTTPStatusError as e:
        logger.error(f"HTTP error fetching user by ID {user_id}: {e.response.status_code} - {e.response.text}")
        if e.response.status_code == 404:
            raise ValueError(f"User with ID {user_id} not found.")
        raise ValueError(f"API error fetching user by ID {user_id}: {e.response.text}")
    except httpx.RequestError as e:
        logger.error(f"Request error fetching user by ID {user_id}: {e}")
        raise ValueError(f"Could not connect to NestJS backend to fetch user by ID {user_id}.")

async def get_current_user_profile(auth_token: str) -> Dict[str, Any]:
    """
    Retrieve current user's profile using the user-specific endpoint.

    Args:
        auth_token (str): JWT authentication token.

    Returns:
        Dict[str, Any]: A dictionary of user information.

    Raises:
        ValueError: If the user is not found or an API error occurs.
    """
    url = f"{NESTJS_BACKEND_URL}/user/profile"
    headers = {}
    if auth_token:
        headers["Authorization"] = f"Bearer {auth_token}"
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url, headers=headers)
            response.raise_for_status()  # Raises an exception for 4XX/5XX errors
            return response.json()
    except httpx.HTTPStatusError as e:
        logger.error(f"HTTP error fetching current user profile: {e.response.status_code} - {e.response.text}")
        if e.response.status_code == 404:
            raise ValueError(f"User profile not found.")
        raise ValueError(f"API error fetching current user profile: {e.response.text}")
    except httpx.RequestError as e:
        logger.error(f"Request error fetching current user profile: {e}")
        raise ValueError(f"Could not connect to NestJS backend to fetch user profile.")

async def get_user_by_email(email: str, auth_token: str = None) -> Dict[str, Any]:
    """
    Retrieve user details by their email address from the NestJS backend.

    Args:
        email (str): The email address of the user.
        auth_token (str, optional): JWT authentication token.

    Returns:
        Dict[str, Any]: A dictionary of user information.

    Raises:
        ValueError: If the user is not found or an API error occurs.
    """
    # Assuming an endpoint like /users?email=some@email.com exists or a specific one
    # For this example, let's assume a specific endpoint /users/email/{email}
    # If not, this might need to be adjusted based on actual NestJS routes.
    url = f"{NESTJS_BACKEND_URL}/users/email/{email}"
    headers = {}
    if auth_token:
        headers["Authorization"] = f"Bearer {auth_token}"
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url, headers=headers)
            response.raise_for_status()
            return response.json()
    except httpx.HTTPStatusError as e:
        logger.error(f"HTTP error fetching user by email {email}: {e.response.status_code} - {e.response.text}")
        if e.response.status_code == 404:
            raise ValueError(f"User with email {email} not found.")
        raise ValueError(f"API error fetching user by email {email}: {e.response.text}")
    except httpx.RequestError as e:
        logger.error(f"Request error fetching user by email {email}: {e}")
        raise ValueError(f"Could not connect to NestJS backend to fetch user by email {email}.")

# Note: The original tools.py used synchronous functions.
# Langchain tools can be async, but if we want to keep them simple,
# we might need to adapt or ensure the agent can handle async tools.
# For now, I'll make them async as httpx calls are naturally async.
# If Langchain agent has issues, we can switch to sync http calls or adapt tool calling.
