# Customer Assist Gen AI - Car Insurance System

## 🚀 Quick Start

### **Production Credentials**

**Admin Users:**
- `admin@prod.com` / `password`
- `superadmin@prod.com` / `password`
- `support@prod.com` / `password`

**Regular Users:**
- `demo.user@prod.com` / `password` (Silver plans: SILVER-P001, SILVER-P013)
- `sarah.johnson@prod.com` / `password` (Gold plans: GOLD-P001, GOLD-P008)
- `michael.chen@prod.com` / `password` (Gold plans: GOLD-P002, SILVER-P002)
- `emma.wilson@prod.com` / `password` (Gold plans: GOLD-P003, SILVER-P008)
- `robert.davis@prod.com` / `password` (Gold plans: GOLD-P004, SILVER-P003)
- `lisa.anderson@prod.com` / `password` (Gold plans: GOLD-P005, SILVER-P007)
- `david.martinez@prod.com` / `password` (Gold plans: GOLD-P006, SILVER-P004)
- `jennifer.taylor@prod.com` / `password` (Gold plans: GOLD-P007, SILVER-P010)
- `james.thomas@prod.com` / `password` (Gold plans: GOLD-P009, SILVER-P005)
- `mary.garcia@prod.com` / `password` (Gold plans: GOLD-P010, SILVER-P011)
- `william.rodriguez@prod.com` / `password` (Gold plans: GOLD-P011, SILVER-P006)
- `patricia.clark@prod.com` / `password` (Gold plans: GOLD-P012, SILVER-P012)

### **Running the System**

**Option 1: Using Docker (Recommended)**
```bash
# To start the database and backend services
./deployment/docker/start_docker.sh

# To start the React frontend (in a new terminal)
# On Windows:
run_frontend.bat
# On Linux/macOS (or if you have Git Bash/WSL on Windows):
./run_frontend.sh
```

**Option 2: Running Backends Manually**
```bash
# Start both backends (Python FastAPI on port 2345, NestJS on port 3000)
./run_backends.sh

# Start React frontend (in a new terminal)
cd react-frontend && npm start
```

### **Access URLs**
- **Frontend**: http://localhost:3000 (React frontend with login)
- **NestJS Backend**: http://localhost:3000 (API backend)
- **Python FastAPI**: http://localhost:2345 (Python orchestrator)
- **Database**: localhost:5432
- **Adminer**: http://localhost:8080 (Database management)

### **Testing the System**

**Simple Authentication Test:**
```bash
# Test authentication and get claims data
./simple_auth_script.sh
```

This script will:
1. Login as demo.user@prod.com
2. Get JWT authentication token
3. Request claims data through the orchestrator
4. Display the claims information

**Frontend Login Test:**
```bash
# Run Playwright test to verify frontend login
python test_frontend_login.py
```

## 📊 Database Schema

**Tables:**
- `users` - User accounts (15 production users: 3 admin, 12 regular)
- `policies` - Insurance policies (25 production policies: 12 Gold, 13 Silver)
- `claims` - Insurance claims (30+ production claims with various statuses)
- `premium_history` - Premium change history (25+ production records)
- `knowledge_base` - Vector embeddings for AI (pgvector enabled)

**Sample Data Included:**
- **Users**: 15 total users with different roles and policies
- **Claims**: 30+ claims covering all statuses (Approved, In Review, Submitted, Rejected, Closed)
- **Policies**: Mix of Gold and Silver plans with varying coverage and premiums
- **Premium History**: 25+ records showing premium adjustments over time
- **Knowledge Base**: FAQ entries processed as vector embeddings for AI chat

## 🎯 System Features

### **Frontend Features**
- **Modern UI**: Enhanced React frontend with soft color schemes
- **Policy Management**: Interactive policy cards with status indicators
- **Claim Tracking**: Visual claim banners with edit forms and status tracking
- **Authentication**: Real login connected to backend API
- **Responsive Design**: Mobile-friendly interface

### **Backend Features**
- **Authentication**: JWT-based auth with role-based access control
- **API Endpoints**: RESTful APIs for users, policies, claims, and admin operations
- **AI Integration**: Python orchestrator with LangChain for intelligent responses
- **Vector Search**: pgvector integration for semantic search capabilities
- **CORS Enabled**: Frontend-backend communication properly configured

### **System Architecture**
- **Frontend**: React.js on port 4000
- **Backend API**: NestJS on port 3000
- **AI Orchestrator**: Python FastAPI on port 2345
- **Database**: PostgreSQL with pgvector extension
- **Container**: Docker support for easy deployment
