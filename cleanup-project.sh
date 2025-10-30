#!/bin/bash

# AI Job Portal - Comprehensive Cleanup Script
# This script removes all unnecessary files and optimizes the project

set -e

echo "🧹 Starting AI Job Portal Cleanup..."
echo "=================================="

# 1. Remove all documentation files from root (keep only essential ones)
echo ""
echo "📄 Cleaning up documentation files..."
rm -f ADZUNA_*.md
rm -f AI_RESUME_BUILDER_FIX.md
rm -f APPLICATION_STATUS.md
rm -f AUTH_*.md
rm -f BEFORE_AFTER_COMPARISON.md
rm -f COMPONENT_AUDIT_REPORT.md
rm -f CONNECTION_STATUS_REPORT.md
rm -f DASHBOARD_*.md
rm -f DEPLOYMENT_SUMMARY.md
rm -f DESIGN_*.md
rm -f FEATURE_COMPLETION_SUMMARY.md
rm -f FINAL_SUMMARY.md
rm -f FIREBASE_ENV_SETUP.md
rm -f FIREBASE_MIGRATION_COMPLETE.md
rm -f FIREBASE_SETUP.md
rm -f FIREBASE_STORAGE_SETUP.md
rm -f FIXES_APPLIED.md
rm -f GLOBAL_JOBS_UPDATE.md
rm -f GOOGLE_AUTH_*.md
rm -f HOMEPAGE_NAVIGATION_FIX.md
rm -f INDEX.md
rm -f LINTING_FIXES_NEEDED.md
rm -f NAVBAR_*.md
rm -f PERFORMANCE_*.md
rm -f PREMIUM_DESIGN_*.md
rm -f PRODUCTION_*.md
rm -f QUICK_*.md
rm -f REDESIGN_COMPLETE.md
rm -f RESUME_*.md
rm -f TASK_*.md
rm -f TEMPORARY_FIRESTORE_STORAGE.md
rm -f UI_*.md
rm -f VERIFICATION_CHECKLIST.md
rm -f VISUAL_CHECKLIST.md
rm -f WORLD_CLASS_DESIGN_COMPLETE.md

echo "✅ Removed 60+ documentation files"

# 2. Clean backend
echo ""
echo "🔧 Cleaning backend..."
rm -rf backend/dist
rm -rf backend/migration-data
rm -f backend/test-auth.js
rm -f backend/DATABASE_SETUP.md
rm -f backend/ERROR_HANDLING_SUMMARY.md
rm -f backend/FIRESTORE_INDEXES.md
rm -f backend/LOAD_TEST_SUMMARY.md
rm -f backend/LOAD_TESTING.md
rm -f backend/MIGRATION_GUIDE.md
rm -f backend/PERFORMANCE_COMPARISON.md
rm -f backend/PRODUCTION_MIGRATION_GUIDE.md
rm -f backend/QUICK_LOAD_TEST_GUIDE.md
rm -f backend/QUICK_START.md
rm -f backend/REALTIME_DATABASE.md
rm -f backend/SECURITY_RULES_REFERENCE.md
rm -f backend/SECURITY_RULES_TESTING.md
rm -f backend/SECURITY_RULES.md
rm -f backend/STAGING_DEPLOYMENT_SUMMARY.md
rm -f backend/TASK_*.md
rm -f backend/TESTING.md
rm -f backend/src/IMPLEMENTATION_SUMMARY.md
rm -f backend/src/README.md

echo "✅ Backend cleaned"

# 3. Clean frontend
echo ""
echo "🎨 Cleaning frontend..."
rm -rf frontend/.next
rm -rf frontend/test-results
rm -rf frontend/playwright-report
rm -f frontend/ACCESSIBILITY.md
rm -f frontend/E2E_TESTS_SUMMARY.md
rm -f frontend/FIREBASE_INTEGRATION_TESTS.md
rm -f frontend/tsconfig.tsbuildinfo

# Remove debug components
rm -rf frontend/components/debug
rm -f frontend/lib/debug-auth.ts

echo "✅ Frontend cleaned"

# 4. Clean scripts
echo ""
echo "📜 Cleaning scripts..."
rm -f scripts/complete-migration-cleanup.sh
rm -f scripts/monitor-firebase-usage.sh
rm -f scripts/monitor-production.sh
rm -f scripts/test-connections.sh
rm -f scripts/validate-production.sh

echo "✅ Scripts cleaned"

# 5. Clean monitoring
echo ""
echo "📊 Cleaning monitoring..."
rm -rf monitoring

echo "✅ Monitoring folder removed"

# 6. Clean .kiro specs (keep only essential)
echo ""
echo "🤖 Cleaning .kiro specs..."
rm -f .kiro/specs/firebase-migration/TASK_*.md

echo "✅ .kiro specs cleaned"

# 7. Clean node_modules and reinstall
echo ""
echo "📦 Cleaning and reinstalling dependencies..."
echo "This may take a few minutes..."

# Clean root
rm -rf node_modules
npm install

# Clean backend
cd backend
rm -rf node_modules
npm install
cd ..

# Clean frontend
cd frontend
rm -rf node_modules
npm install
cd ..

echo "✅ Dependencies reinstalled"

echo ""
echo "=================================="
echo "✨ Cleanup Complete!"
echo ""
echo "Summary:"
echo "  ✅ Removed 60+ documentation files"
echo "  ✅ Cleaned build artifacts"
echo "  ✅ Removed debug/test files"
echo "  ✅ Removed migration data"
echo "  ✅ Reinstalled dependencies"
echo ""
echo "Next steps:"
echo "  1. Run code cleanup: npm run cleanup:code"
echo "  2. Test the application: npm run dev"
echo "  3. Run linting: npm run lint"
echo ""
