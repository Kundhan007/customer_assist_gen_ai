#!/bin/bash

# Get the project root directory (parent of src directory)
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

# Activate the virtual environment
source "$PROJECT_ROOT/venv/bin/activate"

# Run the Python script
python "$PROJECT_ROOT/src/data_processing/knowledge_base_loader.py"

# Deactivate the virtual environment (optional, as subshell will handle it)
deactivate
