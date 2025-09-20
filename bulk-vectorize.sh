#!/bin/bash

# Bulk Vectorization Shell Script
# This script handles the complete FAQ vectorization workflow
# Uses curl to test Python orchestrator availability

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PYTHON_ORCHESTRATOR_URL="http://localhost:2345"
NESTJS_DIR="nestjs-backend"
PYTHON_DIR="python_orchestrator"

echo -e "${BLUE}🚀 Starting Bulk Vectorization Workflow${NC}"
echo "=============================================="

# Function to check if Python orchestrator is running
check_python_orchestrator() {
    echo -e "${YELLOW}🔍 Checking if Python orchestrator is running...${NC}"
    
    if curl -s -f "$PYTHON_ORCHESTRATOR_URL/health" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Python orchestrator is running at $PYTHON_ORCHESTRATOR_URL${NC}"
        return 0
    else
        echo -e "${RED}❌ Python orchestrator is not running at $PYTHON_ORCHESTRATOR_URL${NC}"
        echo -e "${YELLOW}📋 Starting Python orchestrator...${NC}"
        
        # Start Python orchestrator in background
        cd "$PYTHON_DIR"
        ./start_fastapi.sh > python_orchestrator.log 2>&1 &
        PYTHON_PID=$!
        cd ..
        
        # Wait for it to start
        echo -e "${YELLOW}⏳ Waiting for Python orchestrator to start...${NC}"
        for i in {1..30}; do
            if curl -s -f "$PYTHON_ORCHESTRATOR_URL/health" > /dev/null 2>&1; then
                echo -e "${GREEN}✅ Python orchestrator started successfully (PID: $PYTHON_PID)${NC}"
                return 0
            fi
            sleep 1
            echo -n "."
        done
        echo ""
        echo -e "${RED}❌ Failed to start Python orchestrator${NC}"
        return 1
    fi
}

# Function to seed FAQ data
seed_faq_data() {
    echo -e "${YELLOW}📋 Seeding FAQ data...${NC}"
    
    cd "$NESTJS_DIR"
    
    if npm run setup:faq-vectors:prod; then
        echo -e "${GREEN}✅ FAQ data seeded successfully${NC}"
        cd ..
        return 0
    else
        echo -e "${RED}❌ Failed to seed FAQ data${NC}"
        cd ..
        return 1
    fi
}

# Function to run bulk vectorization
run_bulk_vectorization() {
    echo -e "${YELLOW}🔄 Running bulk vectorization...${NC}"
    
    cd "$NESTJS_DIR"
    
    if npm run vectorize:faqs; then
        echo -e "${GREEN}✅ Bulk vectorization completed successfully${NC}"
        cd ..
        return 0
    else
        echo -e "${RED}❌ Bulk vectorization failed${NC}"
        cd ..
        return 1
    fi
}

# Function to test the workflow
test_workflow() {
    echo -e "${YELLOW}🧪 Testing complete workflow...${NC}"
    
    cd "$NESTJS_DIR"
    
    if npm run test:faq-vectorization; then
        echo -e "${GREEN}✅ All tests passed successfully${NC}"
        cd ..
        return 0
    else
        echo -e "${RED}❌ Tests failed${NC}"
        cd ..
        return 1
    fi
}

# Function to show status
show_status() {
    echo -e "${BLUE}📊 Current Status${NC}"
    echo "=================="
    
    # Check Python orchestrator
    if curl -s -f "$PYTHON_ORCHESTRATOR_URL/health" > /dev/null 2>&1; then
        echo -e "${GREEN}Python Orchestrator: Running${NC}"
        # Show model info
        curl -s "$PYTHON_ORCHESTRATOR_URL/model-info" | python3 -m json.tool 2>/dev/null || echo "  Model info unavailable"
    else
        echo -e "${RED}Python Orchestrator: Not Running${NC}"
    fi
    
    # Check database status (if possible)
    echo -e "${YELLOW}Database: Checking FAQ records...${NC}"
    cd "$NESTJS_DIR"
    
    # Try to get vectorization status if the service exists
    if npm run vectorize:faqs --help 2>/dev/null | grep -q "vectorize"; then
        echo "  Vectorization service is available"
    fi
    
    cd ..
}

# Function to cleanup
cleanup() {
    echo -e "${YELLOW}🧹 Cleaning up...${NC}"
    
    # Kill Python orchestrator if we started it
    if [ ! -z "$PYTHON_PID" ]; then
        echo -e "${YELLOW}Stopping Python orchestrator (PID: $PYTHON_PID)...${NC}"
        kill $PYTHON_PID 2>/dev/null || true
        wait $PYTHON_PID 2>/dev/null || true
        echo -e "${GREEN}✅ Python orchestrator stopped${NC}"
    fi
}

# Main execution
main() {
    # Set trap for cleanup on exit
    trap cleanup EXIT
    
    # Show initial status
    show_status
    echo ""
    
    # Execute workflow
    if check_python_orchestrator; then
        echo ""
        if seed_faq_data; then
            echo ""
            if run_bulk_vectorization; then
                echo ""
                if test_workflow; then
                    echo ""
                    echo -e "${GREEN}🎉 Bulk Vectorization Workflow Completed Successfully!${NC}"
                    echo "=============================================="
                    echo -e "${BLUE}Summary:${NC}"
                    echo "- ✅ Python orchestrator is running"
                    echo "- ✅ FAQ data seeded in database"
                    echo "- ✅ Bulk vectorization completed"
                    echo "- ✅ All tests passed"
                    echo ""
                    echo -e "${YELLOW}Your FAQ RAG system is now ready!${NC}"
                    exit 0
                fi
            fi
        fi
    fi
    
    echo ""
    echo -e "${RED}❌ Bulk Vectorization Workflow Failed${NC}"
    echo "=============================================="
    echo "Please check the logs and try again."
    echo ""
    echo -e "${YELLOW}Troubleshooting:${NC}"
    echo "1. Ensure Python dependencies are installed: cd python_orchestrator && pip install -r requirements.txt"
    echo "2. Ensure Node.js dependencies are installed: cd nestjs-backend && npm install"
    echo "3. Check database connectivity and configuration"
    echo "4. Check port 2345 is available"
    exit 1
}

# Parse command line arguments
case "${1:-}" in
    "status")
        show_status
        ;;
    "seed")
        seed_faq_data
        ;;
    "vectorize")
        check_python_orchestrator && run_bulk_vectorization
        ;;
    "test")
        test_workflow
        ;;
    "cleanup")
        cleanup
        ;;
    *)
        main
        ;;
esac
