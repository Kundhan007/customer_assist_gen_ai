#!/bin/bash
# test_run.sh - Run tests using existing virtual environment

# ==========================================
# COMMON FUNCTIONS AND SETUP
# ==========================================

# Function to detect and activate virtual environment
activate_venv() {
    echo "Detecting virtual environment..."
    
    # Check common venv locations
    if [ -d "venv" ]; then
        echo "Found venv, activating..."
        source venv/bin/activate
    elif [ -d ".venv" ]; then
        echo "Found .venv, activating..."
        source .venv/bin/activate
    elif [ -d "env" ]; then
        echo "Found env, activating..."
        source env/bin/activate
    else
        echo "Error: No virtual environment found"
        echo "Please create a virtual environment first:"
        echo "  python -m venv venv"
        echo "  source venv/bin/activate"
        echo "  pip install -r requirements.txt"
        exit 1
    fi
    
    # Verify activation
    if [[ "$VIRTUAL_ENV" != "" ]]; then
        echo "Virtual environment activated: $VIRTUAL_ENV"
    else
        echo "Warning: Virtual environment may not be properly activated"
    fi
}

# Function to set up test environment
setup_test_env() {
    echo "Setting up test environment..."
    export TEST_MODE=true
    export PYTHONPATH="${PYTHONPATH}:$(pwd)/src"
    echo "Test mode enabled"
}

# Function to validate test file
validate_test_file() {
    if [ ! -f "tests/$1" ]; then
        echo "Error: Test file 'tests/$1' not found"
        echo "Available test files:"
        ls -la tests/*.py 2>/dev/null | grep -v __pycache__ || echo "  No test files found"
        exit 1
    fi
    
    if [[ ! "$1" =~ \.py$ ]]; then
        echo "Error: Test file must have .py extension"
        exit 1
    fi
}

# Function to show help
show_help() {
    echo "Usage: $0 [test_file.py] [pytest_options...]"
    echo ""
    echo "Examples:"
    echo "  $0                           # Run all tests"
    echo "  $0 test_claims_agent.py       # Run specific test file"
    echo "  $0 test_claims_agent.py -v   # Run with verbose output"
    echo "  $0 test_claims_agent.py --cov # Run with coverage"
    echo ""
    echo "Available test files:"
    ls -la tests/*.py 2>/dev/null | grep -v __pycache__ | awk '{print "  " $9}' || echo "  No test files found"
}

# ==========================================
# COMMON SETUP (RUNS FOR ALL CASES)
# ==========================================

# Show help if requested
if [[ "$1" == "-h" || "$1" == "--help" ]]; then
    show_help
    exit 0
fi

# Activate virtual environment (common to all cases)
activate_venv

# Set up test environment (common to all cases)
setup_test_env

# ==========================================
# CASE-SPECIFIC LOGIC
# ==========================================

# Handle different cases based on parameters
case $# in
    0)
        echo "Running all tests..."
        python -m pytest tests/ -v
        ;;
    1)
        # Validate test file first
        validate_test_file "$1"
        echo "Running tests for: $1"
        python -m pytest tests/$1 -v
        ;;
    *)
        # Validate first argument as test file
        validate_test_file "$1"
        echo "Running tests for: $1 with options: ${@:2}"
        python -m pytest tests/$@
        ;;
esac

# Exit with the same code as pytest
exit $?
