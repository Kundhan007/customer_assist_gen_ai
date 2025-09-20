#!/bin/bash

# Function to find and kill process running on port 3000
kill_port_3000() {
  echo "Checking for processes on port 3000..."
  # Check for OS type (Linux/Mac or Windows with WSL/Git Bash)
  if [[ "$OSTYPE" == "linux-gnu"* || "$OSTYPE" == "darwin"* ]]; then
    # Linux or macOS
    PIDS=$(lsof -ti:3000)
    if [ -n "$PIDS" ]; then
      echo "Found process(es) on port 3000: $PIDS. Killing..."
      kill -9 $PIDS
      echo "Process(es) killed."
    else
      echo "No process found on port 3000."
    fi
  elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]]; then
    # Windows (Git Bash, Cygwin, etc.)
    # Using netstat and taskkill for Windows
    PORT_PID=$(netstat -ano | findstr :3000 | awk '{print $5}')
    if [ -n "$PORT_PID" ]; then
      echo "Found process on port 3000 with PID: $PORT_PID. Killing..."
      taskkill //PID $PORT_PID //F
      echo "Process killed."
    else
      echo "No process found on port 3000."
    fi
  else
    echo "Unsupported OS type: $OSTYPE. Please manually kill the process on port 3000."
  fi
}

# Kill any existing process on port 3000
kill_port_3000

# Navigate to the react-frontend directory
cd react-frontend

# Start the React development server
echo "Starting React development server..."
npm start
