import httpx
import os
import logging
from typing import Dict, Any, List

# Configure logging
logger = logging.getLogger(__name__)

# Get NestJS backend URL from environment variables
NESTJS_BACKEND_URL = os.getenv("NESTJS_BACKEND_URL", "http://localhost:3001")

async def get_user_claims(auth_token: str, active_only: bool = False) -> List[Dict[str, Any]]:
    """
    Retrieve current user's claims from the NestJS backend.

    Args:
        auth_token (str): JWT authentication token.
        active_only (bool): If True, only return active claims.

    Returns:
        List[Dict[str, Any]]: A list of claim information.

    Raises:
        ValueError: If an API error occurs.
    """
    url = f"{NESTJS_BACKEND_URL}/user/claims"
    if active_only:
        url += "?active=true"
    
    headers = {}
    if auth_token:
        headers["Authorization"] = f"Bearer {auth_token}"
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url, headers=headers)
            response.raise_for_status()  # Raises an exception for 4XX/5XX errors
            return response.json()
    except httpx.HTTPStatusError as e:
        logger.error(f"HTTP error fetching user claims: {e.response.status_code} - {e.response.text}")
        raise ValueError(f"API error fetching user claims: {e.response.text}")
    except httpx.RequestError as e:
        logger.error(f"Request error fetching user claims: {e}")
        raise ValueError(f"Could not connect to NestJS backend to fetch user claims.")

async def get_user_claim_by_id(claim_id: str, auth_token: str) -> Dict[str, Any]:
    """
    Retrieve a specific claim by ID for the current user.

    Args:
        claim_id (str): The ID of the claim.
        auth_token (str): JWT authentication token.

    Returns:
        Dict[str, Any]: Claim information.

    Raises:
        ValueError: If the claim is not found or an API error occurs.
    """
    url = f"{NESTJS_BACKEND_URL}/user/claims/{claim_id}"
    headers = {}
    if auth_token:
        headers["Authorization"] = f"Bearer {auth_token}"
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url, headers=headers)
            response.raise_for_status()
            return response.json()
    except httpx.HTTPStatusError as e:
        logger.error(f"HTTP error fetching claim {claim_id}: {e.response.status_code} - {e.response.text}")
        if e.response.status_code == 404:
            raise ValueError(f"Claim with ID {claim_id} not found.")
        raise ValueError(f"API error fetching claim {claim_id}: {e.response.text}")
    except httpx.RequestError as e:
        logger.error(f"Request error fetching claim {claim_id}: {e}")
        raise ValueError(f"Could not connect to NestJS backend to fetch claim {claim_id}.")

async def get_claim_history(claim_id: str, auth_token: str) -> List[Dict[str, Any]]:
    """
    Retrieve the history of a specific claim for the current user.

    Args:
        claim_id (str): The ID of the claim.
        auth_token (str): JWT authentication token.

    Returns:
        List[Dict[str, Any]]: A list of claim history entries.

    Raises:
        ValueError: If the claim is not found or an API error occurs.
    """
    url = f"{NESTJS_BACKEND_URL}/user/claims/{claim_id}/history"
    headers = {}
    if auth_token:
        headers["Authorization"] = f"Bearer {auth_token}"
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url, headers=headers)
            response.raise_for_status()
            return response.json()
    except httpx.HTTPStatusError as e:
        logger.error(f"HTTP error fetching claim history for {claim_id}: {e.response.status_code} - {e.response.text}")
        if e.response.status_code == 404:
            raise ValueError(f"Claim with ID {claim_id} not found.")
        raise ValueError(f"API error fetching claim history for {claim_id}: {e.response.text}")
    except httpx.RequestError as e:
        logger.error(f"Request error fetching claim history for {claim_id}: {e}")
        raise ValueError(f"Could not connect to NestJS backend to fetch claim history for {claim_id}.")
