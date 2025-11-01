#!/bin/bash

# Quick test script for resume endpoint
# This will test if the endpoint is working after the index is built

echo "🧪 Testing Resume Endpoint"
echo "=========================="
echo ""

# Check if backend is running
if ! curl -s http://localhost:3001/api/health > /dev/null 2>&1; then
    echo "❌ Backend is not running on port 3001"
    echo "   Please start the backend with: cd backend && npm run dev"
    exit 1
fi

echo "✅ Backend is running"
echo ""

# Get auth token from environment or prompt
if [ -z "$TEST_AUTH_TOKEN" ]; then
    echo "⚠️  TEST_AUTH_TOKEN not set"
    echo "   Please provide your Firebase auth token:"
    echo "   You can get this from the browser console after logging in"
    echo ""
    echo "   Usage: TEST_AUTH_TOKEN=your_token ./test-resume-endpoint.sh"
    exit 1
fi

echo "🔍 Testing GET /api/candidate/resumes"
echo ""

# Test the endpoint
RESPONSE=$(curl -s -w "\n%{http_code}" \
    -H "Authorization: Bearer $TEST_AUTH_TOKEN" \
    http://localhost:3001/api/candidate/resumes)

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Endpoint returned 200 OK"
    echo ""
    echo "Response:"
    echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
    echo ""
    echo "🎉 Resume endpoint is working!"
elif [ "$HTTP_CODE" = "500" ]; then
    echo "❌ Endpoint returned 500 Internal Server Error"
    echo ""
    echo "Response:"
    echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
    echo ""
    echo "⚠️  The Firestore index might still be building."
    echo "   Please wait 2-5 minutes and try again."
    echo ""
    echo "   Check index status at:"
    echo "   https://console.firebase.google.com/project/jobportal-7918a/firestore/indexes"
else
    echo "⚠️  Endpoint returned HTTP $HTTP_CODE"
    echo ""
    echo "Response:"
    echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
fi
