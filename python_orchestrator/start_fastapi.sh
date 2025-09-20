#!/bin/bash

# Get the absolute path of the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
VENV_DIR="$PROJECT_ROOT/venv"

# Check if the virtual environment directory exists
if [ ! -d "$VENV_DIR" ]; then
  echo "Error: Virtual environment not found at $VENV_DIR"
  echo "Please create a virtual environment in the project root."
  exit 1
fi

# Activate the virtual environment
source "$VENV_DIR/bin/activate"

# Navigate to the project root directory
cd "$PROJECT_ROOT"

# Start the FastAPI application
echo "Starting Python FastAPI Orchestrator from project root..."
# Using --reload for development. For production, this might be removed.
# The host and port are configured in the .env file or defaults.
# We use the module path 'python_orchestrator.api.fast_api_app' because uvicorn is run from the project root.
# We use 'env PYTHONPATH=...' to ensure the path is set for uvicorn and its child processes.
exec env PYTHONPATH="$PROJECT_ROOT" uvicorn python_orchestrator.api.fast_api_app:app --host 0.0.0.0 --port 2345 --reload
