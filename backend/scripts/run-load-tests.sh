#!/bin/bash

# Firebase Load Testing Script
# This script runs load tests against Firebase services and generates a performance report

set -e

echo "=========================================="
echo "Firebase Load Testing Suite"
echo "=========================================="
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "Error: .env file not found"
    echo "Please create a .env file with Firebase credentials"
    exit 1
fi

# Load environment variables
export $(cat .env | grep -v '^#' | xargs)

# Check if Firebase credentials are set
if [ -z "$FIREBASE_SERVICE_ACCOUNT" ]; then
    echo "Error: FIREBASE_SERVICE_ACCOUNT not set in .env"
    exit 1
fi

echo "Environment: ${NODE_ENV:-development}"
echo "Firebase Project: $(echo $FIREBASE_SERVICE_ACCOUNT | jq -r '.project_id' 2>/dev/null || echo 'Unknown')"
echo ""

# Confirm before running
read -p "This will run load tests against your Firebase project. Continue? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Load tests cancelled"
    exit 0
fi

echo ""
echo "Starting load tests..."
echo "This may take several minutes..."
echo ""

# Create reports directory
mkdir -p reports

# Run load tests and capture output
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
REPORT_FILE="reports/load-test-report-${TIMESTAMP}.txt"

# Run the tests
npm test -- load-testing.test.ts --verbose --runInBand 2>&1 | tee "$REPORT_FILE"

echo ""
echo "=========================================="
echo "Load Testing Complete"
echo "=========================================="
echo ""
echo "Report saved to: $REPORT_FILE"
echo ""

# Check if tests passed
if [ ${PIPESTATUS[0]} -eq 0 ]; then
    echo "✓ All load tests passed"
    exit 0
else
    echo "✗ Some load tests failed"
    echo "Check the report for details"
    exit 1
fi
