#!/bin/bash

# Comprehensive Connection Test Script
# Tests Frontend, Backend, and Firebase connections

echo "=========================================="
echo "🔍 COMPREHENSIVE CONNECTION TEST"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counters
PASSED=0
FAILED=0

# Function to print test result
print_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓ PASSED${NC}: $2"
        ((PASSED++))
    else
        echo -e "${RED}✗ FAILED${NC}: $2"
        ((FAILED++))
    fi
}

# 1. Check if environment files exist
echo "📋 Step 1: Checking Environment Files"
echo "--------------------------------------"

if [ -f "backend/.env" ]; then
    print_result 0 "Backend .env file exists"
else
    print_result 1 "Backend .env file missing"
fi

if [ -f "frontend/.env.local" ]; then
    print_result 0 "Frontend .env.local file exists"
else
    print_result 1 "Frontend .env.local file missing"
fi

echo ""

# 2. Check if dependencies are installed
echo "📦 Step 2: Checking Dependencies"
echo "--------------------------------------"

if [ -d "node_modules" ]; then
    print_result 0 "Root node_modules exists"
else
    print_result 1 "Root node_modules missing - run 'npm install'"
fi

if [ -d "backend/node_modules" ]; then
    print_result 0 "Backend node_modules exists"
else
    print_result 1 "Backend node_modules missing"
fi

if [ -d "frontend/node_modules" ]; then
    print_result 0 "Frontend node_modules exists"
else
    print_result 1 "Frontend node_modules missing"
fi

echo ""

# 3. Check if servers are running
echo "🚀 Step 3: Checking Running Services"
echo "--------------------------------------"

if lsof -ti:3001 > /dev/null 2>&1; then
    print_result 0 "Backend server running on port 3001"
    BACKEND_RUNNING=true
else
    print_result 1 "Backend server NOT running on port 3001"
    BACKEND_RUNNING=false
fi

if lsof -ti:3000 > /dev/null 2>&1; then
    print_result 0 "Frontend server running on port 3000"
    FRONTEND_RUNNING=true
else
    print_result 1 "Frontend server NOT running on port 3000"
    FRONTEND_RUNNING=false
fi

echo ""

# 4. Test Backend API endpoints
if [ "$BACKEND_RUNNING" = true ]; then
    echo "🔌 Step 4: Testing Backend API Endpoints"
    echo "--------------------------------------"
    
    # Test health endpoint
    HEALTH_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/health)
    if [ "$HEALTH_RESPONSE" = "200" ]; then
        print_result 0 "Backend health endpoint responding (200)"
    else
        print_result 1 "Backend health endpoint failed (HTTP $HEALTH_RESPONSE)"
    fi
    
    # Test API root
    API_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/api)
    if [ "$API_RESPONSE" = "200" ]; then
        print_result 0 "Backend API root responding (200)"
    else
        print_result 1 "Backend API root failed (HTTP $API_RESPONSE)"
    fi
    
    # Get detailed health check
    echo ""
    echo "📊 Detailed Health Check:"
    HEALTH_DATA=$(curl -s http://localhost:3001/health)
    echo "$HEALTH_DATA" | python3 -m json.tool 2>/dev/null || echo "$HEALTH_DATA"
    
    echo ""
else
    echo "⚠️  Step 4: Skipped (Backend not running)"
    echo ""
fi

# 5. Test Frontend
if [ "$FRONTEND_RUNNING" = true ]; then
    echo "🌐 Step 5: Testing Frontend"
    echo "--------------------------------------"
    
    FRONTEND_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000)
    if [ "$FRONTEND_RESPONSE" = "200" ]; then
        print_result 0 "Frontend responding (200)"
    else
        print_result 1 "Frontend failed (HTTP $FRONTEND_RESPONSE)"
    fi
    
    echo ""
else
    echo "⚠️  Step 5: Skipped (Frontend not running)"
    echo ""
fi

# 6. Check Firebase configuration
echo "🔥 Step 6: Checking Firebase Configuration"
echo "--------------------------------------"

# Check backend Firebase config
if grep -q "FIREBASE_SERVICE_ACCOUNT" backend/.env 2>/dev/null; then
    print_result 0 "Backend Firebase service account configured"
else
    print_result 1 "Backend Firebase service account NOT configured"
fi

if grep -q "FIREBASE_STORAGE_BUCKET" backend/.env 2>/dev/null; then
    print_result 0 "Backend Firebase storage bucket configured"
else
    print_result 1 "Backend Firebase storage bucket NOT configured"
fi

# Check frontend Firebase config
if grep -q "NEXT_PUBLIC_FIREBASE_API_KEY" frontend/.env.local 2>/dev/null; then
    print_result 0 "Frontend Firebase API key configured"
else
    print_result 1 "Frontend Firebase API key NOT configured"
fi

if grep -q "NEXT_PUBLIC_FIREBASE_PROJECT_ID" frontend/.env.local 2>/dev/null; then
    print_result 0 "Frontend Firebase project ID configured"
else
    print_result 1 "Frontend Firebase project ID NOT configured"
fi

echo ""

# 7. Test Firebase connection (if backend is running)
if [ "$BACKEND_RUNNING" = true ]; then
    echo "🔥 Step 7: Testing Firebase Connection"
    echo "--------------------------------------"
    
    HEALTH_DATA=$(curl -s http://localhost:3001/health)
    
    if echo "$HEALTH_DATA" | grep -q '"firebase":"connected"'; then
        print_result 0 "Firebase connection successful"
    elif echo "$HEALTH_DATA" | grep -q '"firebase":"disconnected"'; then
        print_result 1 "Firebase connection failed"
    else
        print_result 1 "Firebase status unknown"
    fi
    
    echo ""
else
    echo "⚠️  Step 7: Skipped (Backend not running)"
    echo ""
fi

# 8. Summary
echo "=========================================="
echo "📊 TEST SUMMARY"
echo "=========================================="
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ All tests passed! System is healthy.${NC}"
    exit 0
else
    echo -e "${YELLOW}⚠️  Some tests failed. Review the results above.${NC}"
    echo ""
    echo "Common fixes:"
    echo "  - If servers not running: npm run dev"
    echo "  - If dependencies missing: npm install"
    echo "  - If Firebase failing: Check .env files"
    exit 1
fi
