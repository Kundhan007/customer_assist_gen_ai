#!/bin/bash

# Get the absolute path of the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VENV_DIR="$SCRIPT_DIR/../venv"

# Check if the virtual environment directory exists
if [ ! -d "$VENV_DIR" ]; then
  echo "Error: Virtual environment not found at $VENV_DIR"
  echo "Please create a virtual environment in the project root."
  exit 1
fi

# Activate the virtual environment
source "$VENV_DIR/bin/activate"

# Navigate to the script's directory (python-orchestrator)
cd "$SCRIPT_DIR"

# Start the FastAPI application
echo "Starting Python FastAPI Orchestrator..."
# Using --reload for development. For production, this might be removed.
# The host and port are configured in the .env file or defaults.
exec uvicorn api.fast_api_app:app --host 0.0.0.0 --port 2345 --reload
