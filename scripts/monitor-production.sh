#!/bin/bash

# Production Monitoring Script
# Monitors application health, Firebase usage, and performance metrics

set -e  # Exit on error

echo "=========================================="
echo "Production Monitoring Dashboard"
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
CHECK_INTERVAL=${CHECK_INTERVAL:-60}  # seconds

# Function to check service health
check_service() {
    local service_name=$1
    local url=$2
    
    if curl -f -s "${url}" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ ${service_name} is healthy${NC}"
        return 0
    else
        echo -e "${RED}✗ ${service_name} is down${NC}"
        return 1
    fi
}

# Function to check Firebase connection
check_firebase() {
    echo -e "${BLUE}Checking Firebase connection...${NC}"
    
    if curl -f -s "${BACKEND_URL}/api/health/firebase" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Firebase connection is healthy${NC}"
    else
        echo -e "${RED}✗ Firebase connection failed${NC}"
    fi
}

# Function to display Firebase metrics
display_firebase_metrics() {
    echo -e "${BLUE}Firebase Metrics:${NC}"
    echo "View detailed metrics at:"
    echo "- Firestore: https://console.firebase.google.com/project/jobportal-7918a/firestore"
    echo "- Authentication: https://console.firebase.google.com/project/jobportal-7918a/authentication"
    echo "- Storage: https://console.firebase.google.com/project/jobportal-7918a/storage"
    echo "- Realtime DB: https://console.firebase.google.com/project/jobportal-7918a/database"
    echo ""
}

# Function to check error rates
check_error_rates() {
    echo -e "${BLUE}Checking error rates...${NC}"
    
    # Check backend logs for errors (last 100 lines)
    if [ -f "backend/logs/error.log" ]; then
        ERROR_COUNT=$(tail -100 backend/logs/error.log 2>/dev/null | wc -l)
        if [ "$ERROR_COUNT" -gt 10 ]; then
            echo -e "${RED}⚠ High error rate detected: ${ERROR_COUNT} errors in last 100 log entries${NC}"
        else
            echo -e "${GREEN}✓ Error rate is normal${NC}"
        fi
    else
        echo -e "${YELLOW}⚠ No error log file found${NC}"
    fi
}

# Function to check response times
check_response_times() {
    echo -e "${BLUE}Checking response times...${NC}"
    
    # Check backend response time
    BACKEND_TIME=$(curl -o /dev/null -s -w '%{time_total}' "${BACKEND_URL}/health" 2>/dev/null || echo "0")
    
    if (( $(echo "$BACKEND_TIME > 2.0" | bc -l) )); then
        echo -e "${RED}⚠ Backend response time is slow: ${BACKEND_TIME}s${NC}"
    else
        echo -e "${GREEN}✓ Backend response time: ${BACKEND_TIME}s${NC}"
    fi
    
    # Check frontend response time
    FRONTEND_TIME=$(curl -o /dev/null -s -w '%{time_total}' "${FRONTEND_URL}" 2>/dev/null || echo "0")
    
    if (( $(echo "$FRONTEND_TIME > 3.0" | bc -l) )); then
        echo -e "${RED}⚠ Frontend response time is slow: ${FRONTEND_TIME}s${NC}"
    else
        echo -e "${GREEN}✓ Frontend response time: ${FRONTEND_TIME}s${NC}"
    fi
}

# Function to check disk space
check_disk_space() {
    echo -e "${BLUE}Checking disk space...${NC}"
    
    DISK_USAGE=$(df -h . | awk 'NR==2 {print $5}' | sed 's/%//')
    
    if [ "$DISK_USAGE" -gt 80 ]; then
        echo -e "${RED}⚠ Disk usage is high: ${DISK_USAGE}%${NC}"
    else
        echo -e "${GREEN}✓ Disk usage: ${DISK_USAGE}%${NC}"
    fi
}

# Function to check memory usage
check_memory() {
    echo -e "${BLUE}Checking memory usage...${NC}"
    
    if command -v free &> /dev/null; then
        MEMORY_USAGE=$(free | grep Mem | awk '{print int($3/$2 * 100)}')
        
        if [ "$MEMORY_USAGE" -gt 80 ]; then
            echo -e "${RED}⚠ Memory usage is high: ${MEMORY_USAGE}%${NC}"
        else
            echo -e "${GREEN}✓ Memory usage: ${MEMORY_USAGE}%${NC}"
        fi
    else
        echo -e "${YELLOW}⚠ Memory check not available on this system${NC}"
    fi
}

# Function to check Docker containers (if using Docker)
check_docker() {
    if command -v docker &> /dev/null; then
        echo -e "${BLUE}Checking Docker containers...${NC}"
        
        BACKEND_STATUS=$(docker ps --filter "name=backend" --format "{{.Status}}" 2>/dev/null || echo "Not running")
        FRONTEND_STATUS=$(docker ps --filter "name=frontend" --format "{{.Status}}" 2>/dev/null || echo "Not running")
        
        if [[ "$BACKEND_STATUS" == *"Up"* ]]; then
            echo -e "${GREEN}✓ Backend container: ${BACKEND_STATUS}${NC}"
        else
            echo -e "${RED}✗ Backend container: ${BACKEND_STATUS}${NC}"
        fi
        
        if [[ "$FRONTEND_STATUS" == *"Up"* ]]; then
            echo -e "${GREEN}✓ Frontend container: ${FRONTEND_STATUS}${NC}"
        else
            echo -e "${RED}✗ Frontend container: ${FRONTEND_STATUS}${NC}"
        fi
    fi
}

# Main monitoring loop
monitor_once() {
    clear
    echo "=========================================="
    echo "Production Monitoring Dashboard"
    echo "Time: $(date)"
    echo "=========================================="
    echo ""
    
    # Service health checks
    echo -e "${BLUE}=== Service Health ===${NC}"
    check_service "Backend" "${BACKEND_URL}/health"
    check_service "Frontend" "${FRONTEND_URL}"
    check_firebase
    echo ""
    
    # Performance checks
    echo -e "${BLUE}=== Performance Metrics ===${NC}"
    check_response_times
    echo ""
    
    # System resources
    echo -e "${BLUE}=== System Resources ===${NC}"
    check_disk_space
    check_memory
    echo ""
    
    # Error monitoring
    echo -e "${BLUE}=== Error Monitoring ===${NC}"
    check_error_rates
    echo ""
    
    # Docker status (if applicable)
    check_docker
    echo ""
    
    # Firebase metrics
    echo -e "${BLUE}=== Firebase Metrics ===${NC}"
    display_firebase_metrics
    
    echo "=========================================="
    echo "Next check in ${CHECK_INTERVAL} seconds..."
    echo "Press Ctrl+C to stop monitoring"
    echo "=========================================="
}

# Check if running in continuous mode
if [ "$1" = "--continuous" ]; then
    echo "Starting continuous monitoring (interval: ${CHECK_INTERVAL}s)"
    echo "Press Ctrl+C to stop"
    echo ""
    
    while true; do
        monitor_once
        sleep "$CHECK_INTERVAL"
    done
else
    # Single check
    monitor_once
    echo ""
    echo "Run with --continuous flag for continuous monitoring"
fi
