"""
Configuration management for the Python Vectorization Orchestrator.
"""

import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def get_config(key: str, default=None):
    """Get configuration value from environment."""
    return os.getenv(key, default)

__all__ = ['get_config']
