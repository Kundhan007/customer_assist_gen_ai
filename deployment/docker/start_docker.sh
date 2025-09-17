#!/bin/bash

# Docker Start Script for Car Insurance Project
# This script starts the PostgreSQL database with pgvector and Adminer interface

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
    echo "Docker is not running. Attempting to start Docker Desktop..."
    
    # Try to start Docker Desktop on macOS
    if [[ "$OSTYPE" == "darwin"* ]]; then
        echo "Starting Docker Desktop on macOS..."
        open -a "Docker Desktop"
        
        # Wait for Docker to start (up to 60 seconds)
        echo "Waiting for Docker to start..."
        for i in {1..60}; do
            if docker info >/dev/null 2>&1; then
                echo "Docker is now running!"
                break
            fi
            echo "Waiting... ($i/60 seconds)"
            sleep 1
        done
        
        # Check if Docker started successfully
        if ! docker info >/dev/null 2>&1; then
            echo "Error: Failed to start Docker Desktop automatically."
            echo "Please start Docker Desktop manually from the Applications folder or menu bar."
            exit 1
        fi
    else
        echo "Error: Docker is not running. Please start Docker first."
        echo "On Linux, you may need to start the Docker service: sudo systemctl start docker"
        exit 1
    fi
fi

echo "Starting Docker containers for Car Insurance project..."

# Change to the directory containing docker-compose.yml
cd "$(dirname "$0")"

# Start Docker containers in detached mode
docker-compose up -d

if [ $? -eq 0 ]; then
    echo "Docker containers are starting..."
    echo "PostgreSQL database will be available at: localhost:5432"
    echo "Adminer interface will be available at: http://localhost:8080"
    echo ""
    echo "To view container status, run: docker-compose ps"
    echo "To stop containers, run: docker-compose down"
    echo "To view logs, run: docker-compose logs -f"
else
    echo "Error: Failed to start Docker containers. Please check the error messages above."
    exit 1
fi
