#!/bin/bash

# Deploy Firebase Security Rules Script
# This script deploys Firestore, Storage, and Realtime Database security rules to Firebase

set -e

echo "🔐 Deploying Firebase Security Rules..."
echo ""

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI is not installed."
    echo "Install it with: npm install -g firebase-tools"
    exit 1
fi

# Check if logged in to Firebase
echo "Checking Firebase authentication..."
if ! firebase projects:list &> /dev/null; then
    echo "❌ Not logged in to Firebase."
    echo "Please run: firebase login"
    exit 1
fi

# Navigate to backend directory
cd "$(dirname "$0")/.."

# Check if firebase.json exists
if [ ! -f "firebase.json" ]; then
    echo "❌ firebase.json not found in backend directory"
    exit 1
fi

# Check if all rules files exist
echo "Checking rules files..."
if [ ! -f "firestore.rules" ]; then
    echo "❌ firestore.rules not found"
    exit 1
fi

if [ ! -f "storage.rules" ]; then
    echo "❌ storage.rules not found"
    exit 1
fi

if [ ! -f "database.rules.json" ]; then
    echo "❌ database.rules.json not found"
    exit 1
fi

if [ ! -f "firestore.indexes.json" ]; then
    echo "❌ firestore.indexes.json not found"
    exit 1
fi

echo "✅ All rules files found"
echo ""

# Deploy Firestore rules and indexes
echo "📋 Deploying Firestore rules and indexes..."
firebase deploy --only firestore

# Deploy Storage rules
echo ""
echo "📦 Deploying Storage rules..."
if firebase deploy --only storage 2>&1 | grep -q "has not been set up"; then
    echo "⚠️  Firebase Storage is not yet enabled for this project."
    echo "Please enable it in the Firebase Console:"
    echo "  https://console.firebase.google.com/project/jobportal-7918a/storage"
    echo ""
    echo "After enabling Storage, run this script again or run:"
    echo "  firebase deploy --only storage"
    echo ""
    STORAGE_DEPLOYED=false
else
    echo "✅ Storage rules deployed"
    STORAGE_DEPLOYED=true
fi

# Deploy Realtime Database rules
echo ""
echo "💾 Deploying Realtime Database rules..."
firebase deploy --only database

echo ""
if [ "$STORAGE_DEPLOYED" = true ]; then
    echo "✅ All security rules deployed successfully!"
else
    echo "✅ Firestore and Realtime Database rules deployed successfully!"
    echo "⚠️  Storage rules pending (Storage needs to be enabled first)"
fi
echo ""
echo "You can verify the rules in the Firebase Console:"
echo "  - Firestore: https://console.firebase.google.com/project/jobportal-7918a/firestore/rules"
if [ "$STORAGE_DEPLOYED" = true ]; then
    echo "  - Storage: https://console.firebase.google.com/project/jobportal-7918a/storage/rules"
fi
echo "  - Database: https://console.firebase.google.com/project/jobportal-7918a/database/rules"
