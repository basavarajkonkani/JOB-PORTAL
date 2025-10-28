#!/bin/bash

# Production Validation Script
# Comprehensive validation of production deployment

set -e  # Exit on error

echo "=========================================="
echo "Production Validation Script"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BACKEND_URL=${BACKEND_URL:-http://localhost:3001}
FRONTEND_URL=${FRONTEND_URL:-http://localhost:3000}
VALIDATION_REPORT="validation-report-$(date +%Y%m%d_%H%M%S).md"

# Initialize counters
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Function to run a test
run_test() {
    local test_name=$1
    local test_command=$2
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    echo -e "${BLUE}Testing: ${test_name}${NC}"
    
    if eval "$test_command" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ PASS${NC}"
        PASSED_TESTS=$((PASSED_TESTS + 1))
        echo "- ✅ $test_name" >> "$VALIDATION_REPORT"
        return 0
    else
        echo -e "${RED}✗ FAIL${NC}"
        FAILED_TESTS=$((FAILED_TESTS + 1))
        echo "- ❌ $test_name" >> "$VALIDATION_REPORT"
        return 1
    fi
}

# Start validation report
cat > "$VALIDATION_REPORT" << EOF
# Production Validation Report

**Date**: $(date)
**Environment**: Production
**Backend URL**: ${BACKEND_URL}
**Frontend URL**: ${FRONTEND_URL}

## Test Results

EOF

echo -e "${GREEN}=========================================="
echo "1. Service Health Checks"
echo "==========================================${NC}"
echo ""

run_test "Backend health endpoint" "curl -f -s ${BACKEND_URL}/health"
run_test "Frontend accessibility" "curl -f -s ${FRONTEND_URL}"
run_test "Backend responds within 2s" "[ \$(curl -o /dev/null -s -w '%{time_total}' ${BACKEND_URL}/health) -lt 2 ]"

echo ""
echo -e "${GREEN}=========================================="
echo "2. Firebase Connection Tests"
echo "==========================================${NC}"
echo ""

run_test "Firebase connection" "curl -f -s ${BACKEND_URL}/api/health/firebase"
run_test "Firestore accessible" "curl -f -s ${BACKEND_URL}/api/health/firestore"
run_test "Firebase Auth accessible" "curl -f -s ${BACKEND_URL}/api/health/auth"

echo ""
echo -e "${GREEN}=========================================="
echo "3. API Endpoint Tests"
echo "==========================================${NC}"
echo ""

run_test "Jobs API endpoint" "curl -f -s ${BACKEND_URL}/api/jobs"
run_test "Auth signup endpoint exists" "curl -s -o /dev/null -w '%{http_code}' ${BACKEND_URL}/api/auth/signup | grep -q '400\|200'"
run_test "Auth signin endpoint exists" "curl -s -o /dev/null -w '%{http_code}' ${BACKEND_URL}/api/auth/signin | grep -q '400\|200'"

echo ""
echo -e "${GREEN}=========================================="
echo "4. Security Tests"
echo "==========================================${NC}"
echo ""

run_test "CORS headers present" "curl -s -I ${BACKEND_URL}/api/jobs | grep -q 'Access-Control-Allow-Origin'"
run_test "Rate limiting enabled" "curl -s -I ${BACKEND_URL}/api/jobs | grep -q 'X-RateLimit'"
run_test "Protected endpoints require auth" "curl -s -o /dev/null -w '%{http_code}' ${BACKEND_URL}/api/profile | grep -q '401'"

echo ""
echo -e "${GREEN}=========================================="
echo "5. Performance Tests"
echo "==========================================${NC}"
echo ""

# Measure response times
BACKEND_TIME=$(curl -o /dev/null -s -w '%{time_total}' ${BACKEND_URL}/health)
FRONTEND_TIME=$(curl -o /dev/null -s -w '%{time_total}' ${FRONTEND_URL})

echo -e "${BLUE}Backend response time: ${BACKEND_TIME}s${NC}"
echo -e "${BLUE}Frontend response time: ${FRONTEND_TIME}s${NC}"

run_test "Backend response < 2s" "[ $(echo \"$BACKEND_TIME < 2.0\" | bc -l) -eq 1 ]"
run_test "Frontend response < 3s" "[ $(echo \"$FRONTEND_TIME < 3.0\" | bc -l) -eq 1 ]"

echo ""
echo -e "${GREEN}=========================================="
echo "6. Database Tests"
echo "==========================================${NC}"
echo ""

run_test "Can fetch jobs from Firestore" "curl -f -s ${BACKEND_URL}/api/jobs | grep -q '\['"
run_test "Firestore indexes working" "curl -f -s '${BACKEND_URL}/api/jobs?status=published' | grep -q '\['"

echo ""
echo -e "${GREEN}=========================================="
echo "7. Real-time Features Tests"
echo "==========================================${NC}"
echo ""

run_test "Realtime Database accessible" "curl -f -s ${BACKEND_URL}/api/health/realtime"

echo ""
echo -e "${GREEN}=========================================="
echo "8. Error Handling Tests"
echo "==========================================${NC}"
echo ""

run_test "404 errors handled" "curl -s -o /dev/null -w '%{http_code}' ${BACKEND_URL}/api/nonexistent | grep -q '404'"
run_test "Invalid requests return 400" "curl -s -o /dev/null -w '%{http_code}' -X POST ${BACKEND_URL}/api/auth/signup | grep -q '400'"

echo ""

# Generate summary
cat >> "$VALIDATION_REPORT" << EOF

## Summary

- **Total Tests**: ${TOTAL_TESTS}
- **Passed**: ${PASSED_TESTS}
- **Failed**: ${FAILED_TESTS}
- **Success Rate**: $(echo "scale=2; ${PASSED_TESTS} * 100 / ${TOTAL_TESTS}" | bc)%

## Performance Metrics

- Backend Response Time: ${BACKEND_TIME}s
- Frontend Response Time: ${FRONTEND_TIME}s

## Status

EOF

if [ $FAILED_TESTS -eq 0 ]; then
    echo "**✅ All tests passed! Production deployment is validated.**" >> "$VALIDATION_REPORT"
    echo ""
    echo -e "${GREEN}=========================================="
    echo "✅ All Tests Passed!"
    echo "==========================================${NC}"
    echo ""
    echo -e "${GREEN}Production deployment is validated and ready!${NC}"
else
    echo "**⚠️ Some tests failed. Please review and fix issues.**" >> "$VALIDATION_REPORT"
    echo ""
    echo -e "${RED}=========================================="
    echo "⚠️ Some Tests Failed"
    echo "==========================================${NC}"
    echo ""
    echo -e "${RED}Failed: ${FAILED_TESTS} out of ${TOTAL_TESTS} tests${NC}"
    echo -e "${YELLOW}Please review the issues and fix them.${NC}"
fi

echo ""
echo -e "${BLUE}Summary:${NC}"
echo "- Total Tests: ${TOTAL_TESTS}"
echo "- Passed: ${PASSED_TESTS}"
echo "- Failed: ${FAILED_TESTS}"
echo "- Success Rate: $(echo "scale=2; ${PASSED_TESTS} * 100 / ${TOTAL_TESTS}" | bc)%"
echo ""
echo -e "${BLUE}Validation report saved to: ${VALIDATION_REPORT}${NC}"
echo ""

# Exit with error if any tests failed
if [ $FAILED_TESTS -gt 0 ]; then
    exit 1
fi
