#!/bin/bash

# Deploy Firebase Configuration to Staging
# This script deploys security rules and indexes to the staging Firebase project

set -e  # Exit on error

echo "=========================================="
echo "Firebase Staging Deployment Script"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo -e "${RED}Error: Firebase CLI is not installed${NC}"
    echo "Install it with: npm install -g firebase-tools"
    exit 1
fi

# Check if logged in to Firebase
if ! firebase projects:list &> /dev/null; then
    echo -e "${YELLOW}You need to login to Firebase${NC}"
    firebase login
fi

# Navigate to backend directory
cd "$(dirname "$0")/.."

echo -e "${GREEN}Step 1: Validating Firebase configuration files...${NC}"

# Check if required files exist
if [ ! -f "firestore.rules" ]; then
    echo -e "${RED}Error: firestore.rules not found${NC}"
    exit 1
fi

if [ ! -f "firestore.indexes.json" ]; then
    echo -e "${RED}Error: firestore.indexes.json not found${NC}"
    exit 1
fi

if [ ! -f "storage.rules" ]; then
    echo -e "${RED}Error: storage.rules not found${NC}"
    exit 1
fi

if [ ! -f "database.rules.json" ]; then
    echo -e "${RED}Error: database.rules.json not found${NC}"
    exit 1
fi

echo -e "${GREEN}✓ All configuration files found${NC}"
echo ""

echo -e "${GREEN}Step 2: Deploying Firestore security rules...${NC}"
firebase deploy --only firestore:rules --project jobportal-7918a
echo -e "${GREEN}✓ Firestore rules deployed${NC}"
echo ""

echo -e "${GREEN}Step 3: Deploying Firestore indexes...${NC}"
firebase deploy --only firestore:indexes --project jobportal-7918a
echo -e "${GREEN}✓ Firestore indexes deployed${NC}"
echo ""

echo -e "${GREEN}Step 4: Deploying Storage security rules...${NC}"
firebase deploy --only storage --project jobportal-7918a
echo -e "${GREEN}✓ Storage rules deployed${NC}"
echo ""

echo -e "${GREEN}Step 5: Deploying Realtime Database security rules...${NC}"
firebase deploy --only database --project jobportal-7918a
echo -e "${GREEN}✓ Realtime Database rules deployed${NC}"
echo ""

echo -e "${GREEN}=========================================="
echo "Deployment to Staging Complete!"
echo "==========================================${NC}"
echo ""
echo "Next steps:"
echo "1. Test authentication flows"
echo "2. Test data operations"
echo "3. Test real-time features"
echo "4. Verify security rules are working correctly"
echo ""
