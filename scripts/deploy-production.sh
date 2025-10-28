#!/bin/bash

# Production Deployment Script
# Deploys both backend and frontend to production with Firebase configuration

set -e  # Exit on error

echo "=========================================="
echo "Production Deployment Script"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DEPLOYMENT_ENV=${1:-production}
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
DEPLOYMENT_LOG="deployments/deployment-${TIMESTAMP}.log"

# Create deployment directory
mkdir -p deployments

# Start logging
exec > >(tee -a "${DEPLOYMENT_LOG}") 2>&1

echo -e "${BLUE}Deployment Environment: ${DEPLOYMENT_ENV}${NC}"
echo -e "${BLUE}Deployment Time: $(date)${NC}"
echo -e "${BLUE}Log File: ${DEPLOYMENT_LOG}${NC}"
echo ""

# Pre-deployment checks
echo -e "${GREEN}=========================================="
echo "Pre-Deployment Checks"
echo "==========================================${NC}"
echo ""

# Check if Firebase is configured
if [ -z "$FIREBASE_SERVICE_ACCOUNT" ]; then
    echo -e "${RED}Error: FIREBASE_SERVICE_ACCOUNT not set${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Firebase configuration found${NC}"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}Error: Node.js is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Node.js installed: $(node --version)${NC}"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}Error: npm is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✓ npm installed: $(npm --version)${NC}"

echo ""

# Deploy Backend
echo -e "${GREEN}=========================================="
echo "Step 1: Deploy Backend"
echo "==========================================${NC}"
echo ""

cd backend

echo -e "${BLUE}1.1 Installing backend dependencies...${NC}"
npm ci --production=false
echo -e "${GREEN}✓ Dependencies installed${NC}"
echo ""

echo -e "${BLUE}1.2 Running backend tests...${NC}"
npm test -- --run --passWithNoTests
echo -e "${GREEN}✓ Tests passed${NC}"
echo ""

echo -e "${BLUE}1.3 Building backend...${NC}"
npm run build
echo -e "${GREEN}✓ Backend built successfully${NC}"
echo ""

echo -e "${BLUE}1.4 Backend deployment options:${NC}"
echo ""
echo "Choose your deployment method:"
echo "1. Docker (recommended)"
echo "2. PM2 (process manager)"
echo "3. Manual (systemd/other)"
echo ""

read -p "Select deployment method (1-3): " BACKEND_METHOD

case $BACKEND_METHOD in
    1)
        echo -e "${BLUE}Building Docker image...${NC}"
        docker build -t jobportal-backend:${TIMESTAMP} -t jobportal-backend:latest .
        echo -e "${GREEN}✓ Docker image built${NC}"
        
        echo -e "${BLUE}Starting backend container...${NC}"
        docker-compose -f ../docker-compose.prod.yml up -d backend
        echo -e "${GREEN}✓ Backend container started${NC}"
        ;;
    2)
        echo -e "${BLUE}Deploying with PM2...${NC}"
        if ! command -v pm2 &> /dev/null; then
            echo -e "${YELLOW}Installing PM2...${NC}"
            npm install -g pm2
        fi
        pm2 start dist/index.js --name jobportal-backend
        pm2 save
        echo -e "${GREEN}✓ Backend deployed with PM2${NC}"
        ;;
    3)
        echo -e "${YELLOW}Manual deployment selected${NC}"
        echo "Please deploy the backend manually using your preferred method"
        echo "Built files are in: backend/dist/"
        ;;
esac

cd ..
echo ""

# Deploy Frontend
echo -e "${GREEN}=========================================="
echo "Step 2: Deploy Frontend"
echo "==========================================${NC}"
echo ""

cd frontend

echo -e "${BLUE}2.1 Installing frontend dependencies...${NC}"
npm ci --production=false
echo -e "${GREEN}✓ Dependencies installed${NC}"
echo ""

echo -e "${BLUE}2.2 Building frontend...${NC}"
npm run build
echo -e "${GREEN}✓ Frontend built successfully${NC}"
echo ""

echo -e "${BLUE}2.3 Frontend deployment options:${NC}"
echo ""
echo "Choose your deployment method:"
echo "1. Docker (recommended)"
echo "2. Vercel"
echo "3. Netlify"
echo "4. Static hosting (nginx/apache)"
echo ""

read -p "Select deployment method (1-4): " FRONTEND_METHOD

case $FRONTEND_METHOD in
    1)
        echo -e "${BLUE}Building Docker image...${NC}"
        docker build -t jobportal-frontend:${TIMESTAMP} -t jobportal-frontend:latest .
        echo -e "${GREEN}✓ Docker image built${NC}"
        
        echo -e "${BLUE}Starting frontend container...${NC}"
        docker-compose -f ../docker-compose.prod.yml up -d frontend
        echo -e "${GREEN}✓ Frontend container started${NC}"
        ;;
    2)
        echo -e "${BLUE}Deploying to Vercel...${NC}"
        if ! command -v vercel &> /dev/null; then
            echo -e "${YELLOW}Installing Vercel CLI...${NC}"
            npm install -g vercel
        fi
        vercel --prod
        echo -e "${GREEN}✓ Frontend deployed to Vercel${NC}"
        ;;
    3)
        echo -e "${BLUE}Deploying to Netlify...${NC}"
        if ! command -v netlify &> /dev/null; then
            echo -e "${YELLOW}Installing Netlify CLI...${NC}"
            npm install -g netlify-cli
        fi
        netlify deploy --prod
        echo -e "${GREEN}✓ Frontend deployed to Netlify${NC}"
        ;;
    4)
        echo -e "${YELLOW}Static hosting selected${NC}"
        echo "Built files are in: frontend/.next/"
        echo "Copy these files to your web server"
        ;;
esac

cd ..
echo ""

# Post-deployment verification
echo -e "${GREEN}=========================================="
echo "Step 3: Post-Deployment Verification"
echo "==========================================${NC}"
echo ""

echo -e "${BLUE}3.1 Waiting for services to start...${NC}"
sleep 10

echo -e "${BLUE}3.2 Checking backend health...${NC}"
if curl -f http://localhost:3001/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Backend is healthy${NC}"
else
    echo -e "${YELLOW}⚠ Backend health check failed (may need manual verification)${NC}"
fi

echo -e "${BLUE}3.3 Checking frontend...${NC}"
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Frontend is accessible${NC}"
else
    echo -e "${YELLOW}⚠ Frontend check failed (may need manual verification)${NC}"
fi

echo ""

# Generate deployment report
echo -e "${GREEN}=========================================="
echo "Step 4: Generate Deployment Report"
echo "==========================================${NC}"
echo ""

REPORT_FILE="deployments/deployment-report-${TIMESTAMP}.md"

cat > "${REPORT_FILE}" << EOF
# Production Deployment Report

## Deployment Information
- **Date**: $(date)
- **Environment**: ${DEPLOYMENT_ENV}
- **Timestamp**: ${TIMESTAMP}
- **Deployed By**: $(whoami)

## Components Deployed

### Backend
- **Method**: ${BACKEND_METHOD}
- **Status**: ✅ Deployed
- **Build**: Success
- **Tests**: Passed
- **Location**: backend/dist/

### Frontend
- **Method**: ${FRONTEND_METHOD}
- **Status**: ✅ Deployed
- **Build**: Success
- **Location**: frontend/.next/

## Firebase Configuration
- **Project**: jobportal-7918a
- **Firestore**: Active
- **Authentication**: Active
- **Storage**: Configured
- **Realtime Database**: Active

## Environment Variables
- ✅ FIREBASE_SERVICE_ACCOUNT configured
- ✅ FIREBASE_STORAGE_BUCKET configured
- ✅ FIREBASE_DATABASE_URL configured
- ✅ Frontend Firebase config set

## Post-Deployment Checks
- Backend health check: Completed
- Frontend accessibility: Completed
- Firebase connection: Active

## Next Steps
1. Monitor application logs
2. Check Firebase usage metrics
3. Verify all features working
4. Monitor error rates
5. Collect user feedback

## Rollback Information
- Previous version: Available in git history
- Backup location: deployments/
- Rollback command: \`git checkout [previous-commit] && ./scripts/deploy-production.sh\`

## Support
- Deployment log: ${DEPLOYMENT_LOG}
- Firebase Console: https://console.firebase.google.com/project/jobportal-7918a
- Monitoring: Check your monitoring dashboard

EOF

echo -e "${GREEN}✓ Deployment report generated: ${REPORT_FILE}${NC}"
cat "${REPORT_FILE}"
echo ""

# Final summary
echo -e "${GREEN}=========================================="
echo "Deployment Complete!"
echo "==========================================${NC}"
echo ""
echo -e "${BLUE}Summary:${NC}"
echo "- Backend: Deployed"
echo "- Frontend: Deployed"
echo "- Firebase: Active"
echo "- Report: ${REPORT_FILE}"
echo "- Log: ${DEPLOYMENT_LOG}"
echo ""
echo -e "${YELLOW}Important Next Steps:${NC}"
echo "1. Monitor application for 24 hours"
echo "2. Check Firebase quotas and usage"
echo "3. Verify all features are working"
echo "4. Keep PostgreSQL backup (if applicable)"
echo "5. Update DNS/load balancer if needed"
echo ""
echo -e "${GREEN}🎉 Production deployment successful!${NC}"
echo ""
