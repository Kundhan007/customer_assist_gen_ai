#!/bin/bash

# Script to run the complete application stack:
# 1. Python FastAPI backend (port 2345)
# 2. NestJS backend (port 3001) 
# 3. React frontend (port 4000)
# With proper sequencing and health checks

echo "🚀 Starting complete application stack..."

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

# Kill existing processes on all ports
echo "🧹 Cleaning up existing processes..."
kill_port 2345  # Python FastAPI
kill_port 3000  # NestJS
kill_port 4000  # React Frontend

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

# Check if React dependencies are installed
if [ ! -d "react-frontend/node_modules" ]; then
    echo "❌ Error: React dependencies not found"
    echo "Please install dependencies first:"
    echo "  cd react-frontend && npm install"
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

# Function to check if Python orchestrator is ready
check_python_ready() {
    local max_attempts=30
    local attempt=1
    local wait_time=2
    
    echo "⏳ Waiting for Python orchestrator to be ready..."
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s -f http://localhost:2345/docs > /dev/null 2>&1; then
            echo "✅ Python orchestrator is ready!"
            return 0
        fi
        
        echo "⏳ Attempt $attempt/$max_attempts: Python orchestrator not ready yet... waiting ${wait_time}s"
        sleep $wait_time
        attempt=$((attempt + 1))
    done
    
    echo "❌ Error: Python orchestrator failed to start within $((max_attempts * wait_time)) seconds"
    return 1
}

# Function to check if NestJS backend is ready
check_nestjs_ready() {
    local max_attempts=30
    local attempt=1
    local wait_time=2
    
    echo "⏳ Waiting for NestJS backend to be ready..."
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s -f http://localhost:3000 > /dev/null 2>&1; then
            echo "✅ NestJS backend is ready!"
            return 0
        fi
        
        echo "⏳ Attempt $attempt/$max_attempts: NestJS backend not ready yet... waiting ${wait_time}s"
        sleep $wait_time
        attempt=$((attempt + 1))
    done
    
    echo "❌ Error: NestJS backend failed to start within $((max_attempts * wait_time)) seconds"
    return 1
}

# Function to check if React frontend is ready
check_react_ready() {
    local max_attempts=30
    local attempt=1
    local wait_time=3
    
    echo "⏳ Waiting for React frontend to be ready..."
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s -f http://localhost:4000 > /dev/null 2>&1; then
            echo "✅ React frontend is ready!"
            return 0
        fi
        
        echo "⏳ Attempt $attempt/$max_attempts: React frontend not ready yet... waiting ${wait_time}s"
        sleep $wait_time
        attempt=$((attempt + 1))
    done
    
    echo "❌ Error: React frontend failed to start within $((max_attempts * wait_time)) seconds"
    return 1
}

# Start Python FastAPI backend
echo "🐍 Starting Python FastAPI backend on port 2345..."
(
    source venv/bin/activate
    cd python_orchestrator
    exec env PYTHONPATH=".." uvicorn python_orchestrator.api.fast_api_app:app --host 0.0.0.0 --port 2345 --reload
) &
PYTHON_PID=$!

# Wait for Python orchestrator to be ready
if check_python_ready; then
    # Start NestJS backend
    echo "🏗️  Starting NestJS backend on port 3001..."
    (
        cd nestjs-backend
        exec npm run start:dev
    ) &
    NESTJS_PID=$!
    
    # Wait for NestJS backend to be ready
    if check_nestjs_ready; then
        # Start React frontend
        echo "⚛️  Starting React frontend on port 4000..."
        (
            cd react-frontend
            exec env PORT=4000 npm start
        ) &
        REACT_PID=$!
        
        # Wait for React frontend to be ready
        if check_react_ready; then
            echo ""
            echo "🎉 Complete application stack is running!"
            echo "🐍 Python FastAPI: http://localhost:2345 (PID: $PYTHON_PID)"
            echo "🏗️  NestJS Backend: http://localhost:3000 (PID: $NESTJS_PID)"
            echo "⚛️  React Frontend: http://localhost:4000 (PID: $REACT_PID)"
            echo ""
            echo "📖 API Documentation:"
            echo "   Python FastAPI: http://localhost:2345/docs"
            echo "   NestJS Swagger: http://localhost:3000/api"
            echo ""
            echo "💡 Application URLs:"
            echo "   Frontend: http://localhost:4000"
            echo ""
            echo "Press Ctrl+C to stop all services"
        else
            echo "❌ Failed to start React frontend. Cleaning up..."
            cleanup
            exit 1
        fi
    else
        echo "❌ Failed to start NestJS backend. Cleaning up..."
        cleanup
        exit 1
    fi
else
    echo "❌ Failed to start Python orchestrator. Cleaning up..."
    cleanup
    exit 1
fi

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping all services..."
    
    # Kill React frontend
    if [ ! -z "$REACT_PID" ]; then
        echo "🛑 Stopping React frontend..."
        kill $REACT_PID 2>/dev/null
        kill_port 4000
    fi
    
    # Kill NestJS backend
    if [ ! -z "$NESTJS_PID" ]; then
        echo "🛑 Stopping NestJS backend..."
        kill $NESTJS_PID 2>/dev/null
        kill_port 3000
    fi
    
    # Kill Python backend
    if [ ! -z "$PYTHON_PID" ]; then
        echo "🛑 Stopping Python FastAPI backend..."
        kill $PYTHON_PID 2>/dev/null
        kill_port 2345
    fi
    
    echo "✅ All services stopped"
    exit 0
}

# Set trap to cleanup on script termination
trap cleanup SIGINT SIGTERM

# Wait for all processes
wait $PYTHON_PID $NESTJS_PID $REACT_PID
