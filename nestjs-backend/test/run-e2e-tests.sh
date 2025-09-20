#!/bin/bash

# E2E Test Execution Script for Lean System
# This script runs all end-to-end tests using the run_backends infrastructure

set -e

echo "🚀 Starting E2E Test Execution for Lean System"
echo "============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "../run_backends.sh" ]; then
    print_error "This script must be run from the nestjs-backend directory"
    exit 1
fi

# Check if test environment file exists
if [ ! -f ".env.test" ]; then
    print_warning "Test environment file .env.test not found"
    print_warning "Creating from .env.example..."
    if [ -f ".env.example" ]; then
        cp .env.example .env.test
        print_status "Created .env.test from .env.example"
    else
        print_error "No .env.example found. Please create .env.test manually."
        exit 1
    fi
fi

# Function to cleanup background processes
cleanup() {
    print_status "Cleaning up background processes..."
    if [ ! -z "$BACKENDS_PID" ]; then
        kill $BACKENDS_PID 2>/dev/null || true
        wait $BACKENDS_PID 2>/dev/null || true
    fi
    print_status "Cleanup completed"
}

# Set trap to cleanup on script exit
trap cleanup EXIT

# Start the backends in background
print_status "Starting backends using run_backends.sh..."
CURRENT_DIR=$(pwd)
cd .. && ./run_backends.sh &
BACKENDS_PID=$!
cd "$CURRENT_DIR"

# Wait for backends to start
print_status "Waiting for backends to start (30 seconds)..."
sleep 30

# Check if backends are running
if ! ps -p $BACKENDS_PID > /dev/null; then
    print_error "Backends failed to start"
    exit 1
fi

print_status "Backends are running. Starting E2E tests..."

# Set test environment
export NODE_ENV=test
export DB_URL=${DB_URL:-"postgresql://postgres:postgres@localhost:5432/customer_assist_test"}

# Run the tests
print_status "Running Authentication E2E Tests..."
npm run test:e2e -- auth.e2e-spec.ts

print_status "Running User Profile E2E Tests..."
npm run test:e2e -- user-profile.e2e-spec.ts

print_status "Running Chat Orchestrator E2E Tests..."
npm run test:e2e -- chat-orchestrator.e2e-spec.ts

print_status "Running Admin Endpoints E2E Tests..."
npm run test:e2e -- admin-endpoints.e2e-spec.ts

print_status "All E2E tests completed successfully!"

# Generate test summary
print_status "Generating test summary..."
echo ""
echo "📊 E2E Test Summary"
echo "=================="
echo "✅ Authentication Tests - PASSED"
echo "✅ User Profile Tests - PASSED"
echo "✅ Chat Orchestrator Tests - PASSED"
echo "✅ Admin Endpoints Tests - PASSED"
echo ""
echo "🎯 Lean System Coverage:"
echo "   - Authentication: POST /auth/login"
echo "   - User Profile: GET/PATCH /user/profile"
echo "   - User Policies: GET /user/policies, /user/policies/active, /user/policies/:id"
echo "   - User Claims: POST/GET /user/claims, GET /user/claims/:id"
echo "   - User Premium: POST /user/premium/calculate"
echo "   - User Chat: POST /user/chat"
echo "   - Chat Orchestrator: POST /chat/send"
echo "   - Admin Users: GET/POST /admin/users, GET /admin/users/:id"
echo "   - Admin Policies: GET/POST /admin/policies"
echo "   - Admin KB: POST/DELETE /admin/kb"
echo ""
echo "🏆 All endpoints in the lean system have been tested!"
echo "============================================="

exit 0
