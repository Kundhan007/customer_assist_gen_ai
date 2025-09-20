#!/usr/bin/env python3
"""
Test script to verify environment variable configuration across all services.
"""

import os
import sys
from pathlib import Path

def test_react_env():
    """Test React frontend environment variables"""
    print("🔍 Testing React Frontend Environment Variables...")
    react_env_path = Path("react-frontend/.env")
    
    if not react_env_path.exists():
        print("❌ React .env file not found")
        return False
    
    with open(react_env_path, 'r') as f:
        content = f.read()
    
    required_vars = [
        'REACT_APP_API_BASE_URL',
        'REACT_APP_FRONTEND_PORT',
        'REACT_APP_DEMO_EMAIL',
        'REACT_APP_DEMO_PASSWORD'
    ]
    
    missing_vars = []
    for var in required_vars:
        if var not in content:
            missing_vars.append(var)
    
    if missing_vars:
        print(f"❌ Missing React environment variables: {missing_vars}")
        return False
    
    print("✅ React environment variables configured correctly")
    return True

def test_nestjs_env():
    """Test NestJS backend environment variables"""
    print("🔍 Testing NestJS Backend Environment Variables...")
    nestjs_env_path = Path("nestjs-backend/.env")
    
    if not nestjs_env_path.exists():
        print("❌ NestJS .env file not found")
        return False
    
    with open(nestjs_env_path, 'r') as f:
        content = f.read()
    
    required_vars = [
        'DB_URL',
        'JWT_SECRET',
        'ORCH_URL',
        'ORCHESTRATOR_URL',
        'FRONTEND_URL',
        'PORT'
    ]
    
    missing_vars = []
    for var in required_vars:
        if var not in content:
            missing_vars.append(var)
    
    if missing_vars:
        print(f"❌ Missing NestJS environment variables: {missing_vars}")
        return False
    
    print("✅ NestJS environment variables configured correctly")
    return True

def test_python_env():
    """Test Python orchestrator environment variables"""
    print("🔍 Testing Python Orchestrator Environment Variables...")
    python_env_path = Path("python_orchestrator/config/.env")
    
    if not python_env_path.exists():
        print("❌ Python .env file not found")
        return False
    
    with open(python_env_path, 'r') as f:
        content = f.read()
    
    required_vars = [
        'API_HOST',
        'API_PORT',
        'NESTJS_BACKEND_URL',
        'FRONTEND_URL',
        'DEMO_EMAIL',
        'DEMO_PASSWORD'
    ]
    
    missing_vars = []
    for var in required_vars:
        if var not in content:
            missing_vars.append(var)
    
    if missing_vars:
        print(f"❌ Missing Python environment variables: {missing_vars}")
        return False
    
    print("✅ Python environment variables configured correctly")
    return True

def test_code_replacements():
    """Test that hardcoded values have been replaced in code"""
    print("🔍 Testing Code Replacements...")
    
    # Test React files
    react_files = [
        "react-frontend/src/components/Login.jsx",
        "react-frontend/src/pages/Chat.jsx"
    ]
    
    for file_path in react_files:
        if not Path(file_path).exists():
            print(f"❌ React file not found: {file_path}")
            return False
        
        with open(file_path, 'r') as f:
            content = f.read()
        
        if 'localhost:3000' in content and 'process.env.REACT_APP_API_BASE_URL' not in content:
            print(f"❌ Found hardcoded URL in {file_path}")
            return False
    
    # Test NestJS files
    nestjs_files = [
        "nestjs-backend/src/main.ts",
        "nestjs-backend/src/chat/orchestrator/orchestrator.service.ts"
    ]
    
    for file_path in nestjs_files:
        if not Path(file_path).exists():
            print(f"❌ NestJS file not found: {file_path}")
            return False
        
        with open(file_path, 'r') as f:
            content = f.read()
        
        # Check for hardcoded URLs that should be environment variables
        if 'http://localhost:3000' in content and 'process.env.FRONTEND_URL' not in content:
            print(f"❌ Found hardcoded frontend URL in {file_path}")
            return False
        
        if 'http://localhost:2345' in content and 'configService.get' not in content:
            print(f"❌ Found hardcoded orchestrator URL in {file_path}")
            return False
    
    print("✅ Code replacements verified successfully")
    return True

def main():
    """Main test function"""
    print("🚀 Starting Environment Variable Configuration Test")
    print("=" * 60)
    
    tests = [
        test_react_env,
        test_nestjs_env,
        test_python_env,
        test_code_replacements
    ]
    
    results = []
    for test in tests:
        result = test()
        results.append(result)
        print()
    
    if all(results):
        print("🎉 All tests passed! Environment variable configuration is complete.")
        return 0
    else:
        print("❌ Some tests failed. Please check the configuration.")
        return 1

if __name__ == "__main__":
    sys.exit(main())
