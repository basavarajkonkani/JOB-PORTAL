#!/bin/bash

# Production Cleanup Script
# This script removes all unnecessary files and makes the project production-ready

echo "🧹 Starting comprehensive project cleanup..."

# 1. Remove all documentation markdown files (keep only README.md)
echo "📄 Removing unnecessary documentation files..."
rm -f ADMIN_ACCESS_GUIDE.md
rm -f ALL_WORK_COMPLETE.md
rm -f BEFORE_AFTER_COMPARISON.md
rm -f COMPANIES_FEATURE_GUIDE.md
rm -f COMPLETE_REDESIGN_SUMMARY.md
rm -f DASHBOARD_IMPLEMENTATION_SUMMARY.md
rm -f DASHBOARD_QUICK_REFERENCE.md
rm -f DASHBOARD_REDESIGN_COMPLETE.md
rm -f DASHBOARD_REVAMP_COMPLETE.md
rm -f DASHBOARD_VISUAL_CHECKLIST.md
rm -f DESIGN_VISUAL_GUIDE.md
rm -f FIREBASE_CONNECTION_STATUS.md
rm -f FOOTER_REDESIGN_COMPLETE.md
rm -f FUTURISTIC_REDESIGN_COMPLETE.md
rm -f GIT_PUSH_SUMMARY.md
rm -f HERO_SECTION_REDESIGN.md
rm -f HERO_TEXT_VISIBILITY_FIX.md
rm -f HOW_TO_ACCESS_USER_DATA.md
rm -f IMPLEMENTATION_GUIDE.md
rm -f INDEX.md
rm -f PENDING_WORK_COMPLETED.md
rm -f PENDING_WORK_STATUS.md
rm -f QUICK_REFERENCE_CARD.md
rm -f QUICK_REFERENCE.md
rm -f REDESIGN_COMPLETE.md
rm -f RESUME_ENDPOINT_FIX.md
rm -f TASK_11_CROSS_BROWSER_TESTING_COMPLETE.md
rm -f VISUAL_DESIGN_GUIDE.md
rm -f validation-report-*.md

# 2. Remove temporary and test scripts
echo "🗑️  Removing temporary scripts..."
rm -f check-index-status.sh
rm -f cleanup-code.sh
rm -f cleanup-project.sh
rm -f cleanup-unused-dependencies.sh
rm -f optimize-images.sh
rm -f run-full-cleanup.sh
rm -f start-dev.sh
rm -f test-resume-endpoint.sh
rm -f view-redesign.sh

# 3. Remove .kiro directory (IDE-specific)
echo "🔧 Removing IDE-specific directories..."
rm -rf .kiro/

# 4. Remove docs directory if it exists
echo "📚 Removing docs directory..."
rm -rf docs/

# 5. Clean up backend
echo "🔙 Cleaning up backend..."
rm -rf backend/TASK_*.md
rm -rf backend/PRODUCTION_MIGRATION_GUIDE.md
rm -rf backend/STAGING_DEPLOYMENT_SUMMARY.md
rm -rf backend/QUICK_LOAD_TEST_GUIDE.md
rm -rf backend/LOAD_TEST_SUMMARY.md
rm -rf backend/PERFORMANCE_COMPARISON.md
rm -rf backend/LOAD_TESTING.md
rm -rf backend/ERROR_HANDLING_SUMMARY.md
rm -rf backend/TESTING.md
rm -rf backend/MIGRATION_GUIDE.md
rm -rf backend/SECURITY_RULES_REFERENCE.md
rm -rf backend/SECURITY_RULES_TESTING.md
rm -rf backend/SECURITY_RULES.md
rm -rf backend/REALTIME_DATABASE.md
rm -rf backend/FIRESTORE_INDEXES.md
rm -rf backend/DATABASE_SETUP.md
rm -rf backend/QUICK_START.md
rm -f backend/test-auth.js

# Remove backend test scripts
rm -rf backend/scripts/test-*.sh
rm -rf backend/scripts/check-*.ts
rm -rf backend/scripts/seed-*.ts
rm -rf backend/scripts/production-*.sh
rm -rf backend/scripts/deploy-*.sh
rm -rf backend/scripts/rollback-*.ts
rm -rf backend/scripts/verify-*.ts
rm -rf backend/scripts/import-*.ts
rm -rf backend/scripts/export-*.ts
rm -rf backend/scripts/run-load-tests.sh

# 6. Clean up frontend
echo "🎨 Cleaning up frontend..."
rm -rf frontend/FIREBASE_INTEGRATION_TESTS.md
rm -rf frontend/E2E_TESTS_SUMMARY.md
rm -rf frontend/QUICK_TEST_GUIDE.md
rm -rf frontend/SIGNIN_CROSS_BROWSER_TEST_SUMMARY.md
rm -rf frontend/SIGNIN_ANIMATIONS_TEST_CHECKLIST.md
rm -rf frontend/SIGNIN_ANIMATIONS_SUMMARY.md
rm -rf frontend/ACCESSIBILITY.md
rm -f frontend/test-signin-browsers.sh

# Remove frontend test directories (keep e2e for production testing if needed)
rm -rf frontend/components/auth/__tests__/
rm -rf frontend/components/debug/
rm -rf frontend/lib/debug-auth.ts

# Remove e2e test documentation
rm -rf frontend/e2e/README.md
rm -rf frontend/e2e/firebase-integration-tests.md
rm -rf frontend/e2e/SIGNIN_CROSS_BROWSER_TESTING.md

# Remove image optimization guides
rm -rf frontend/components/auth/IMAGE_OPTIMIZATION_SUMMARY.md
rm -rf frontend/public/IMAGE_OPTIMIZATION_GUIDE.md

# 7. Clean up scripts directory
echo "📜 Cleaning up scripts directory..."
rm -f scripts/test-connections.sh
rm -f scripts/complete-migration-cleanup.sh
rm -f scripts/monitor-firebase-usage.sh
rm -f scripts/validate-production.sh
rm -f scripts/monitor-production.sh
rm -f scripts/smoke-test.sh

# 8. Clean up monitoring directory (keep only if needed in production)
echo "📊 Cleaning up monitoring..."
# Uncomment if you don't need monitoring in production
# rm -rf monitoring/

# 9. Remove .vscode directory (IDE-specific)
rm -rf .vscode/

# 10. Remove .husky if not using git hooks
# Uncomment if you don't need git hooks
# rm -rf .husky/

# 11. Clean up spec directories
rm -rf .kiro/specs/

echo "✅ Cleanup complete!"
echo ""
echo "📦 Project is now production-ready and lightweight!"
echo ""
echo "Next steps:"
echo "1. Review the changes"
echo "2. Test the application: npm run dev (frontend) and npm run dev (backend)"
echo "3. Commit the changes: git add . && git commit -m 'chore: production cleanup'"
echo "4. Build for production: npm run build"
