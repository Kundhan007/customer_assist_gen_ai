import httpx
import os
import logging
from typing import Dict, Any

logger = logging.getLogger(__name__)
NESTJS_BACKEND_URL = os.getenv("NESTJS_BACKEND_URL", "http://localhost:3001")

async def calculate_premium(premium_data: Dict[str, Any], auth_token: str) -> Dict[str, Any]:
    """Calculate premium for a policy."""
    url = f"{NESTJS_BACKEND_URL}/user/premium/calculate"
    headers = {"Authorization": f"Bearer {auth_token}"}
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(url, json=premium_data, headers=headers)
            response.raise_for_status()
            return response.json()
    except httpx.HTTPStatusError as e:
        logger.error(f"HTTP error calculating premium: {e.response.status_code}")
        raise ValueError(f"API error calculating premium: {e.response.text}")
    except httpx.RequestError as e:
        raise ValueError("Could not connect to backend to calculate premium.")
