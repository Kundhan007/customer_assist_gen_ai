#!/bin/bash
# run_api.sh - Run the FastAPI server for LangHub

echo "Starting LangHub FastAPI server..."

# Check if virtual environment exists and activate it
if [ -d "venv" ]; then
    echo "Activating virtual environment..."
    source venv/bin/activate
elif [ -d ".venv" ]; then
    echo "Activating virtual environment..."
    source .venv/bin/activate
elif [ -d "env" ]; then
    echo "Activating virtual environment..."
    source env/bin/activate
else
    echo "Warning: No virtual environment found. Using system Python."
fi

# Set PYTHONPATH to include src directory
export PYTHONPATH="${PYTHONPATH}:$(pwd)"

# Run the FastAPI server with uvicorn
echo "Starting server on http://localhost:8000"
echo "API documentation available at http://localhost:8000/docs"
python -m uvicorn src.api.fast_api_app:app --host 0.0.0.0 --port 8000 --reload
