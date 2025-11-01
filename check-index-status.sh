#!/bin/bash

# Script to check Firestore index status
# This helps verify if the index is ready

echo "🔍 Checking Firestore Index Status"
echo "===================================="
echo ""

echo "📋 Index Information:"
echo "   Collection: resumes"
echo "   Fields: userId (ASC), uploadedAt (DESC)"
echo ""

echo "🌐 Check status in Firebase Console:"
echo "   https://console.firebase.google.com/project/jobportal-7918a/firestore/indexes"
echo ""

echo "⏱️  Index Build Time:"
echo "   Typical: 2-5 minutes"
echo "   Maximum: 10-15 minutes"
echo ""

echo "✅ Index Status Indicators:"
echo "   🟢 Green 'Enabled' = Ready to use"
echo "   🟡 Yellow 'Building' = Still processing"
echo "   🔴 Red 'Error' = Check configuration"
echo ""

echo "🧪 To test if the index is working:"
echo "   1. Wait for 'Enabled' status in Firebase Console"
echo "   2. Run: TEST_AUTH_TOKEN=your_token ./test-resume-endpoint.sh"
echo "   3. Or refresh your browser on the resume page"
echo ""

# Try to get the current time to show when to check again
CURRENT_TIME=$(date +"%H:%M:%S")
CHECK_AGAIN=$(date -v+5M +"%H:%M:%S" 2>/dev/null || date -d "+5 minutes" +"%H:%M:%S" 2>/dev/null || echo "in 5 minutes")

echo "⏰ Current time: $CURRENT_TIME"
echo "   Check again at: $CHECK_AGAIN"
echo ""

echo "💡 Tip: The index was just deployed. If it's been less than 5 minutes,"
echo "   it's normal to still see errors. Just wait a bit longer!"
