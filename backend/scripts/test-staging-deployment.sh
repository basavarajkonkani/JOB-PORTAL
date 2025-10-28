#!/bin/bash

# Test Staging Deployment
# This script runs comprehensive tests against the staging environment

set -e  # Exit on error

echo "=========================================="
echo "Staging Environment Testing Script"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Navigate to backend directory
cd "$(dirname "$0")/.."

echo -e "${GREEN}Step 1: Running Firebase security rules tests...${NC}"
npm run test:security-rules
echo -e "${GREEN}✓ Security rules tests passed${NC}"
echo ""

echo -e "${GREEN}Step 2: Running unit tests...${NC}"
npm test -- --testPathPattern="(user-model|candidate-profile|recruiter-org|job-model|application-model)" --run
echo -e "${GREEN}✓ Unit tests passed${NC}"
echo ""

echo -e "${GREEN}Step 3: Running integration tests...${NC}"
npm test -- --testPathPattern="api-integration" --run
echo -e "${GREEN}✓ Integration tests passed${NC}"
echo ""

echo -e "${GREEN}Step 4: Running real-time features tests...${NC}"
npm test -- --testPathPattern="realtime-service" --run
echo -e "${GREEN}✓ Real-time tests passed${NC}"
echo ""

echo -e "${GREEN}Step 5: Testing Firebase connection...${NC}"
npm run test:firebase-connection
echo -e "${GREEN}✓ Firebase connection test passed${NC}"
echo ""

echo -e "${GREEN}=========================================="
echo "All Staging Tests Passed!"
echo "==========================================${NC}"
echo ""
echo "Staging environment is ready for production deployment"
echo ""
