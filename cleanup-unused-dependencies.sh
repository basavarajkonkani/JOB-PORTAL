#!/bin/bash

# Cleanup Unused Dependencies Script
# Removes dependencies that are no longer needed after Firebase migration

set -e

echo "🧹 Cleaning up unused dependencies..."
echo "=================================="

# Confirm before proceeding
read -p "⚠️  This will remove unused dependencies. Continue? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Cleanup cancelled"
    exit 1
fi

echo ""
echo "📦 Removing unused dependencies..."

# Remove AWS S3 dependencies (using Firebase Storage instead)
echo ""
echo "Removing AWS S3 dependencies (using Firebase Storage)..."
cd backend
npm uninstall @aws-sdk/client-s3 @aws-sdk/lib-storage 2>/dev/null || echo "  Already removed"
cd ..

# Remove unused config file
echo ""
echo "Removing unused config files..."
rm -f backend/src/config/s3.ts
echo "  ✅ Removed backend/src/config/s3.ts"

# Clean and reinstall
echo ""
echo "📦 Cleaning and reinstalling dependencies..."
echo "This may take a few minutes..."

# Root
rm -rf node_modules package-lock.json
npm install

# Backend
cd backend
rm -rf node_modules package-lock.json
npm install
cd ..

# Frontend
cd frontend
rm -rf node_modules package-lock.json
npm install
cd ..

echo ""
echo "=================================="
echo "✨ Dependency Cleanup Complete!"
echo ""
echo "Removed:"
echo "  ✅ @aws-sdk/client-s3"
echo "  ✅ @aws-sdk/lib-storage"
echo "  ✅ backend/src/config/s3.ts"
echo ""
echo "Next steps:"
echo "  1. Test the application: npm run dev"
echo "  2. Run tests: cd backend && npm test"
echo "  3. Verify file uploads work"
echo ""
