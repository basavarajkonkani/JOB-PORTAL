#!/bin/bash

# Verify Firebase Security Rules Script
# This script verifies that security rules are properly deployed

set -e

echo "🔍 Verifying Firebase Security Rules..."
echo ""

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI is not installed."
    exit 1
fi

# Navigate to backend directory
cd "$(dirname "$0")/.."

echo "Checking Firestore rules..."
if firebase firestore:rules:get &> /dev/null; then
    echo "✅ Firestore rules are deployed"
else
    echo "❌ Firestore rules are not deployed"
fi

echo ""
echo "Checking Storage rules..."
if firebase storage:rules:get &> /dev/null; then
    echo "✅ Storage rules are deployed"
else
    echo "❌ Storage rules are not deployed"
fi

echo ""
echo "Checking Realtime Database rules..."
if firebase database:get /.settings/rules &> /dev/null; then
    echo "✅ Realtime Database rules are deployed"
else
    echo "❌ Realtime Database rules are not deployed"
fi

echo ""
echo "📊 Rules Summary:"
echo "  - Firestore: Protects users, profiles, jobs, applications, resumes"
echo "  - Storage: Protects resumes, avatars, organization logos"
echo "  - Database: Protects presence, notifications, application updates"
echo ""
echo "For detailed rules, check the Firebase Console or run:"
echo "  firebase firestore:rules:get"
echo "  firebase storage:rules:get"
echo "  firebase database:get /.settings/rules"
