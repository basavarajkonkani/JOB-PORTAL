#!/bin/bash

# Firebase Security Rules Testing Script
# This script helps set up and run security rules tests

set -e

echo "🔒 Firebase Security Rules Testing"
echo "=================================="
echo ""

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI is not installed"
    echo "📦 Install it with: npm install -g firebase-tools"
    exit 1
fi

echo "✅ Firebase CLI is installed"

# Check if emulators are configured
if [ ! -f "firebase.json" ]; then
    echo "❌ firebase.json not found"
    echo "📝 Run 'firebase init emulators' to configure emulators"
    exit 1
fi

echo "✅ Firebase configuration found"

# Check if rules files exist
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

echo "✅ All security rules files found"
echo ""

# Parse command line arguments
COMMAND=${1:-"test"}

case $COMMAND in
    "start")
        echo "🚀 Starting Firebase Emulators..."
        firebase emulators:start --only firestore,storage,database
        ;;
    
    "test")
        echo "🧪 Running security rules tests..."
        echo ""
        
        # Check if @firebase/rules-unit-testing is installed
        if ! npm list @firebase/rules-unit-testing &> /dev/null; then
            echo "⚠️  @firebase/rules-unit-testing not installed"
            echo "📦 Install it with: npm install --save-dev @firebase/rules-unit-testing"
            echo ""
            echo "ℹ️  Running placeholder tests instead..."
            npm test -- security-rules.test.ts
        else
            echo "✅ Running tests with Firebase emulators..."
            firebase emulators:exec --only firestore,storage,database "npm test -- security-rules.test.ts"
        fi
        ;;
    
    "validate")
        echo "✔️  Validating security rules syntax..."
        echo ""
        
        echo "Validating Firestore rules..."
        firebase deploy --only firestore:rules --dry-run
        
        echo ""
        echo "Validating Storage rules..."
        firebase deploy --only storage:rules --dry-run
        
        echo ""
        echo "✅ All rules are valid"
        ;;
    
    "deploy")
        echo "🚀 Deploying security rules..."
        echo ""
        
        read -p "Are you sure you want to deploy rules to production? (y/N) " -n 1 -r
        echo ""
        
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            firebase deploy --only firestore:rules,storage:rules,database
            echo ""
            echo "✅ Security rules deployed successfully"
        else
            echo "❌ Deployment cancelled"
        fi
        ;;
    
    "help")
        echo "Usage: ./test-security-rules.sh [command]"
        echo ""
        echo "Commands:"
        echo "  start     - Start Firebase emulators"
        echo "  test      - Run security rules tests (default)"
        echo "  validate  - Validate rules syntax without deploying"
        echo "  deploy    - Deploy rules to production"
        echo "  help      - Show this help message"
        ;;
    
    *)
        echo "❌ Unknown command: $COMMAND"
        echo "Run './test-security-rules.sh help' for usage information"
        exit 1
        ;;
esac
