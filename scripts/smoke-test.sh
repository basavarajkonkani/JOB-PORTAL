#!/bin/bash

# Smoke tests for AI Job Portal
# Usage: ./scripts/smoke-test.sh [base_url]

set -e

BASE_URL=${1:-http://localhost:3001}
FRONTEND_URL=${2:-http://localhost:3000}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Running Smoke Tests ===${NC}"
echo -e "Backend URL: ${YELLOW}$BASE_URL${NC}"
echo -e "Frontend URL: ${YELLOW}$FRONTEND_URL${NC}"
echo ""

FAILED=0

# Test function
test_endpoint() {
    local name=$1
    local url=$2
    local expected_status=${3:-200}
    
    echo -n "Testing $name... "
    
    status=$(curl -s -o /dev/null -w "%{http_code}" "$url" || echo "000")
    
    if [[ "$status" == "$expected_status" ]]; then
        echo -e "${GREEN}✓ PASS${NC} (HTTP $status)"
    else
        echo -e "${RED}✗ FAIL${NC} (Expected HTTP $expected_status, got $status)"
        FAILED=$((FAILED + 1))
    fi
}

# Backend tests
echo -e "${YELLOW}Backend Tests:${NC}"
test_endpoint "Health check" "$BASE_URL/health" 200
test_endpoint "API root" "$BASE_URL/api" 200
test_endpoint "Jobs endpoint" "$BASE_URL/api/jobs" 200
test_endpoint "Auth signup endpoint" "$BASE_URL/api/auth/signup" 400
test_endpoint "404 handling" "$BASE_URL/api/nonexistent" 404

echo ""

# Frontend tests
echo -e "${YELLOW}Frontend Tests:${NC}"
test_endpoint "Homepage" "$FRONTEND_URL/" 200
test_endpoint "Jobs page" "$FRONTEND_URL/jobs" 200
test_endpoint "Sign in page" "$FRONTEND_URL/signin" 200
test_endpoint "Sign up page" "$FRONTEND_URL/signup" 200

echo ""

# Summary
if [[ $FAILED -eq 0 ]]; then
    echo -e "${GREEN}=== All smoke tests passed! ===${NC}"
    exit 0
else
    echo -e "${RED}=== $FAILED test(s) failed ===${NC}"
    exit 1
fi
