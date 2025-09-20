#!/bin/bash

# Script to run both Python FastAPI backend and NestJS backend simultaneously
# Kills existing processes on ports 2345 and 3000 before starting

echo "🚀 Starting backends..."

# Function to kill processes on a specific port
kill_port() {
    local port=$1
    echo "🔍 Checking for processes on port $port..."
    
    # Find and kill processes on the specified port
    if command -v lsof &> /dev/null; then
        # macOS/Linux with lsof
        PIDS=$(lsof -ti:$port)
        if [ -n "$PIDS" ]; then
            echo "🛑 Found process(es) on port $port: $PIDS. Killing..."
            kill -9 $PIDS 2>/dev/null
            echo "✅ Process(es) killed."
        else
            echo "✅ No process found on port $port."
        fi
    else
        echo "⚠️  lsof not found. Please manually kill processes on port $port."
    fi
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Kill existing processes on both ports
kill_port 2345  # Python FastAPI
kill_port 3000  # NestJS

# Check prerequisites
echo "🔍 Checking prerequisites..."

# Check if Python virtual environment exists
VENV_DIR="venv"
if [ ! -d "$VENV_DIR" ]; then
    echo "❌ Error: Python virtual environment not found at $VENV_DIR"
    echo "Please create a virtual environment first:"
    echo "  python3 -m venv venv"
    echo "  source venv/bin/activate"
    echo "  pip install -r python_orchestrator/requirements.txt"
    exit 1
fi

# Check if Node.js dependencies are installed
if [ ! -d "nestjs-backend/node_modules" ]; then
    echo "❌ Error: Node.js dependencies not found"
    echo "Please install dependencies first:"
    echo "  cd nestjs-backend && npm install"
    exit 1
fi

# Check required commands
if ! command_exists uvicorn; then
    echo "❌ Error: uvicorn not found. Please install Python dependencies."
    exit 1
fi

if ! command_exists npm; then
    echo "❌ Error: npm not found. Please install Node.js."
    exit 1
fi

echo "✅ All prerequisites checked"

# Start Python FastAPI backend
echo "🐍 Starting Python FastAPI backend on port 2345..."
(
    source venv/bin/activate
    cd python_orchestrator
    exec env PYTHONPATH=".." uvicorn python_orchestrator.api.fast_api_app:app --host 0.0.0.0 --port 2345 --reload
) &
PYTHON_PID=$!

# Start NestJS backend
echo "🏗️  Starting NestJS backend on port 3000..."
(
    cd nestjs-backend
    exec npm run start:dev
) &
NESTJS_PID=$!

echo "✅ Both backends are starting..."
echo "🐍 Python FastAPI: http://localhost:2345 (PID: $PYTHON_PID)"
echo "🏗️  NestJS: http://localhost:3000 (PID: $NESTJS_PID)"
echo ""
echo "Press Ctrl+C to stop both backends"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping backends..."
    
    # Kill Python backend
    if [ ! -z "$PYTHON_PID" ]; then
        echo "🛑 Stopping Python FastAPI backend..."
        kill $PYTHON_PID 2>/dev/null
        kill_port 2345
    fi
    
    # Kill NestJS backend
    if [ ! -z "$NESTJS_PID" ]; then
        echo "🛑 Stopping NestJS backend..."
        kill $NESTJS_PID 2>/dev/null
        kill_port 3000
    fi
    
    echo "✅ All backends stopped"
    exit 0
}

# Set trap to cleanup on script termination
trap cleanup SIGINT SIGTERM

# Wait for both processes
wait $PYTHON_PID $NESTJS_PID
