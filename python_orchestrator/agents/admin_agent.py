import httpx
import os
import logging
from typing import Dict, Any, List

logger = logging.getLogger(__name__)
NESTJS_BACKEND_URL = os.getenv("NESTJS_BACKEND_URL", "http://localhost:3001")

async def get_all_users(auth_token: str) -> List[Dict[str, Any]]:
    """Get all users (admin only)."""
    url = f"{NESTJS_BACKEND_URL}/admin/users"
    headers = {"Authorization": f"Bearer {auth_token}"}
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url, headers=headers)
            response.raise_for_status()
            return response.json()
    except httpx.HTTPStatusError as e:
        logger.error(f"HTTP error fetching all users: {e.response.status_code}")
        raise ValueError(f"API error fetching all users: {e.response.text}")
    except httpx.RequestError as e:
        raise ValueError("Could not connect to backend to fetch all users.")

async def get_user_by_id_admin(user_id: str, auth_token: str) -> Dict[str, Any]:
    """Get specific user details (admin only)."""
    url = f"{NESTJS_BACKEND_URL}/admin/users/{user_id}"
    headers = {"Authorization": f"Bearer {auth_token}"}
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url, headers=headers)
            response.raise_for_status()
            return response.json()
    except httpx.HTTPStatusError as e:
        if e.response.status_code == 404:
            raise ValueError(f"User with ID {user_id} not found.")
        raise ValueError(f"API error fetching user: {e.response.text}")
    except httpx.RequestError as e:
        raise ValueError("Could not connect to backend to fetch user.")

async def create_user(user_data: Dict[str, Any], auth_token: str) -> Dict[str, Any]:
    """Create new user (admin only)."""
    url = f"{NESTJS_BACKEND_URL}/admin/users"
    headers = {"Authorization": f"Bearer {auth_token}"}
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(url, json=user_data, headers=headers)
            response.raise_for_status()
            return response.json()
    except httpx.HTTPStatusError as e:
        logger.error(f"HTTP error creating user: {e.response.status_code}")
        raise ValueError(f"API error creating user: {e.response.text}")
    except httpx.RequestError as e:
        raise ValueError("Could not connect to backend to create user.")

async def upload_knowledge_base(kb_data: Dict[str, Any], auth_token: str) -> Dict[str, Any]:
    """Upload knowledge base (admin only)."""
    url = f"{NESTJS_BACKEND_URL}/admin/kb"
    headers = {"Authorization": f"Bearer {auth_token}"}
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(url, json=kb_data, headers=headers)
            response.raise_for_status()
            return response.json()
    except httpx.HTTPStatusError as e:
        logger.error(f"HTTP error uploading knowledge base: {e.response.status_code}")
        raise ValueError(f"API error uploading knowledge base: {e.response.text}")
    except httpx.RequestError as e:
        raise ValueError("Could not connect to backend to upload knowledge base.")

async def delete_knowledge_base_entry(kb_id: str, auth_token: str) -> Dict[str, Any]:
    """Delete knowledge base entry (admin only)."""
    url = f"{NESTJS_BACKEND_URL}/admin/kb/{kb_id}"
    headers = {"Authorization": f"Bearer {auth_token}"}
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.delete(url, headers=headers)
            response.raise_for_status()
            return response.json()
    except httpx.HTTPStatusError as e:
        if e.response.status_code == 404:
            raise ValueError(f"Knowledge base entry with ID {kb_id} not found.")
        raise ValueError(f"API error deleting knowledge base entry: {e.response.text}")
    except httpx.RequestError as e:
        raise ValueError("Could not connect to backend to delete knowledge base entry.")
