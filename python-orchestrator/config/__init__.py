import os
from dotenv import load_dotenv

# Determine the path to the .env file relative to this file
dotenv_path = os.path.join(os.path.dirname(__file__), '.env')

# Load environment variables from .env file
if os.path.exists(dotenv_path):
    load_dotenv(dotenv_path)
else:
    # Fallback for running tests or other scenarios where .env might be in a different location
    # or loaded by a different mechanism.
    load_dotenv() 

# OpenAI Configuration
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# NestJS Backend Configuration
NESTJS_BACKEND_URL = os.getenv("NESTJS_BACKEND_URL")

# API Configuration
API_HOST = os.getenv("API_HOST", "0.0.0.0")
API_PORT = int(os.getenv("API_PORT", "2345"))

# Vectorization Configuration
VECTOR_MODEL_NAME = os.getenv("VECTOR_MODEL_NAME", "all-MiniLM-L6-v2")
VECTOR_DIMENSION = int(os.getenv("VECTOR_DIMENSION", "384"))
DEFAULT_BATCH_SIZE = int(os.getenv("DEFAULT_BATCH_SIZE", "10"))

# Logging Configuration
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
ENABLE_DEBUG = os.getenv("ENABLE_DEBUG", "false").lower() == "true"
