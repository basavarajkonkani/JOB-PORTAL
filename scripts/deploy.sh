#!/bin/bash

# Deployment script for AI Job Portal
# Usage: ./scripts/deploy.sh [staging|production]

set -e

ENVIRONMENT=${1:-staging}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== AI Job Portal Deployment ===${NC}"
echo -e "Environment: ${YELLOW}$ENVIRONMENT${NC}"
echo ""

# Validate environment
if [[ "$ENVIRONMENT" != "staging" && "$ENVIRONMENT" != "production" ]]; then
    echo -e "${RED}Error: Environment must be 'staging' or 'production'${NC}"
    exit 1
fi

# Check if required environment variables are set
if [[ "$ENVIRONMENT" == "production" ]]; then
    echo -e "${YELLOW}⚠️  Deploying to PRODUCTION. Press Ctrl+C to cancel...${NC}"
    sleep 5
fi

# Navigate to project root
cd "$PROJECT_ROOT"

# Pull latest code
echo -e "${GREEN}📥 Pulling latest code...${NC}"
git pull origin main

# Build Docker images
echo -e "${GREEN}🔨 Building Docker images...${NC}"
docker-compose -f docker-compose.prod.yml build

# Stop existing containers
echo -e "${GREEN}🛑 Stopping existing containers...${NC}"
docker-compose -f docker-compose.prod.yml down

# Start new containers
echo -e "${GREEN}🚀 Starting new containers...${NC}"
docker-compose -f docker-compose.prod.yml up -d

# Wait for services to be healthy
echo -e "${GREEN}⏳ Waiting for services to be healthy...${NC}"
sleep 10

# Deploy Firebase security rules
echo -e "${GREEN}🔒 Deploying Firebase security rules...${NC}"
cd backend
if command -v firebase &> /dev/null; then
    firebase use "$ENVIRONMENT"
    firebase deploy --only firestore:rules,storage:rules,database:rules
else
    echo -e "${YELLOW}⚠️  Firebase CLI not found. Skipping security rules deployment.${NC}"
    echo -e "${YELLOW}   Install with: npm install -g firebase-tools${NC}"
fi
cd ..

# Health check
echo -e "${GREEN}🏥 Running health checks...${NC}"
BACKEND_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/health)
FRONTEND_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000)

if [[ "$BACKEND_HEALTH" == "200" && "$FRONTEND_HEALTH" == "200" ]]; then
    echo -e "${GREEN}✅ Deployment successful!${NC}"
    echo -e "Backend: http://localhost:3001"
    echo -e "Frontend: http://localhost:3000"
else
    echo -e "${RED}❌ Health check failed!${NC}"
    echo -e "Backend status: $BACKEND_HEALTH"
    echo -e "Frontend status: $FRONTEND_HEALTH"
    echo -e "${YELLOW}Rolling back...${NC}"
    docker-compose -f docker-compose.prod.yml down
    exit 1
fi

# Show logs
echo -e "${GREEN}📋 Recent logs:${NC}"
docker-compose -f docker-compose.prod.yml logs --tail=20

echo -e "${GREEN}=== Deployment Complete ===${NC}"
