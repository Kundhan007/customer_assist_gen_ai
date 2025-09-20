import httpx
import os
import logging
from typing import Dict, Any, List

logger = logging.getLogger(__name__)
NESTJS_BACKEND_URL = os.getenv("NESTJS_BACKEND_URL", "http://localhost:3000")

async def get_user_policies(auth_token: str, active_only: bool = False) -> List[Dict[str, Any]]:
    """Get current user's policies."""
    url = f"{NESTJS_BACKEND_URL}/user/policies"
    if active_only:
        url += "?active=true"
    
    headers = {"Authorization": f"Bearer {auth_token}"}
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url, headers=headers)
            response.raise_for_status()
            return response.json()
    except httpx.HTTPStatusError as e:
        logger.error(f"HTTP error fetching user policies: {e.response.status_code}")
        raise ValueError(f"API error fetching user policies: {e.response.text}")
    except httpx.RequestError as e:
        logger.error(f"Request error fetching user policies: {e}")
        raise ValueError("Could not connect to backend to fetch user policies.")

async def get_user_policy_by_id(policy_id: str, auth_token: str) -> Dict[str, Any]:
    """Get specific policy details for current user."""
    url = f"{NESTJS_BACKEND_URL}/user/policies/{policy_id}"
    headers = {"Authorization": f"Bearer {auth_token}"}
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url, headers=headers)
            response.raise_for_status()
            return response.json()
    except httpx.HTTPStatusError as e:
        if e.response.status_code == 404:
            raise ValueError(f"Policy with ID {policy_id} not found.")
        raise ValueError(f"API error fetching policy: {e.response.text}")
    except httpx.RequestError as e:
        raise ValueError("Could not connect to backend to fetch policy.")

async def get_all_policies(auth_token: str) -> List[Dict[str, Any]]:
    """Get all policies (admin only)."""
    url = f"{NESTJS_BACKEND_URL}/admin/policies"
    headers = {"Authorization": f"Bearer {auth_token}"}
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url, headers=headers)
            response.raise_for_status()
            return response.json()
    except httpx.HTTPStatusError as e:
        logger.error(f"HTTP error fetching all policies: {e.response.status_code}")
        raise ValueError(f"API error fetching all policies: {e.response.text}")
    except httpx.RequestError as e:
        raise ValueError("Could not connect to backend to fetch all policies.")

async def create_policy(policy_data: Dict[str, Any], auth_token: str) -> Dict[str, Any]:
    """Create new policy (admin only)."""
    url = f"{NESTJS_BACKEND_URL}/admin/policies"
    headers = {"Authorization": f"Bearer {auth_token}"}
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(url, json=policy_data, headers=headers)
            response.raise_for_status()
            return response.json()
    except httpx.HTTPStatusError as e:
        logger.error(f"HTTP error creating policy: {e.response.status_code}")
        raise ValueError(f"API error creating policy: {e.response.text}")
    except httpx.RequestError as e:
        raise ValueError("Could not connect to backend to create policy.")
