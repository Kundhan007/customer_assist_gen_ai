#!/bin/bash

# Run script for knowledge base loader
# This script uses the existing virtual environment

# Activate the existing virtual environment
source venv/bin/activate

# Run the main.py script which calls the knowledge base loader
python main.py

echo "Knowledge base loading completed!"
