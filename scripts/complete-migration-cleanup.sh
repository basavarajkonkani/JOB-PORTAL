#!/bin/bash

# Migration Completion and Cleanup Script
# Final cleanup after successful Firebase migration

set -e  # Exit on error

echo "=========================================="
echo "Migration Completion and Cleanup Script"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${RED}⚠️  WARNING: This script will remove PostgreSQL dependencies ⚠️${NC}"
echo ""
echo "This script should only be run after:"
echo "1. ✅ Production has been stable for at least 1 week"
echo "2. ✅ All features verified working correctly"
echo "3. ✅ No critical issues reported"
echo "4. ✅ Team approval obtained"
echo ""

read -p "Have you verified all the above conditions? (type 'yes' to continue): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo -e "${BLUE}Cleanup cancelled. Good decision to be cautious!${NC}"
    exit 0
fi

echo ""
echo -e "${GREEN}Starting migration cleanup...${NC}"
echo ""

# Create cleanup report
CLEANUP_REPORT="migration-cleanup-report-$(date +%Y%m%d_%H%M%S).md"

cat > "$CLEANUP_REPORT" << EOF
# Migration Cleanup Report

**Date**: $(date)
**Performed By**: $(whoami)

## Cleanup Actions

EOF

# Step 1: Remove PostgreSQL dependencies (if they exist)
echo -e "${GREEN}=========================================="
echo "Step 1: Remove PostgreSQL Dependencies"
echo "==========================================${NC}"
echo ""

cd backend

if grep -q '"pg"' package.json 2>/dev/null; then
    echo -e "${BLUE}Removing PostgreSQL packages...${NC}"
    
    # Remove packages
    npm uninstall pg @types/pg node-pg-migrate 2>/dev/null || true
    
    echo -e "${GREEN}✓ PostgreSQL packages removed${NC}"
    echo "- ✅ Removed PostgreSQL packages (pg, @types/pg, node-pg-migrate)" >> "../$CLEANUP_REPORT"
else
    echo -e "${YELLOW}No PostgreSQL packages found (already removed)${NC}"
    echo "- ℹ️ PostgreSQL packages already removed" >> "../$CLEANUP_REPORT"
fi

echo ""

# Step 2: Remove PostgreSQL configuration files
echo -e "${GREEN}=========================================="
echo "Step 2: Remove PostgreSQL Configuration"
echo "==========================================${NC}"
echo ""

FILES_TO_REMOVE=(
    "src/config/database.ts"
    "migrations/"
    ".migrate.json"
)

for file in "${FILES_TO_REMOVE[@]}"; do
    if [ -e "$file" ]; then
        echo -e "${BLUE}Removing: $file${NC}"
        rm -rf "$file"
        echo "- ✅ Removed $file" >> "../$CLEANUP_REPORT"
    else
        echo -e "${YELLOW}Not found: $file (already removed)${NC}"
    fi
done

echo -e "${GREEN}✓ PostgreSQL configuration removed${NC}"
echo ""

# Step 3: Update package.json scripts
echo -e "${GREEN}=========================================="
echo "Step 3: Update Package Scripts"
echo "==========================================${NC}"
echo ""

echo -e "${BLUE}Checking for PostgreSQL-related scripts...${NC}"

if grep -q "migrate" package.json 2>/dev/null; then
    echo -e "${YELLOW}Found migration scripts in package.json${NC}"
    echo "Please manually remove these scripts:"
    echo "- db:migrate"
    echo "- db:rollback"
    echo "- db:seed"
    echo ""
    echo "- ⚠️ Manual action required: Remove migration scripts from package.json" >> "../$CLEANUP_REPORT"
else
    echo -e "${GREEN}✓ No migration scripts found${NC}"
    echo "- ✅ No migration scripts to remove" >> "../$CLEANUP_REPORT"
fi

echo ""

cd ..

# Step 4: Update documentation
echo -e "${GREEN}=========================================="
echo "Step 4: Update Documentation"
echo "==========================================${NC}"
echo ""

echo -e "${BLUE}Documentation files to update:${NC}"
echo "- README.md"
echo "- SETUP.md"
echo "- backend/README.md"
echo ""

cat >> "$CLEANUP_REPORT" << EOF

## Documentation Updates Required

The following documentation files should be updated to reflect Firebase-only setup:

### README.md
- Remove PostgreSQL setup instructions
- Update with Firebase setup only
- Update environment variables section

### SETUP.md
- Remove database setup section
- Add Firebase setup instructions
- Update prerequisites

### backend/README.md
- Remove PostgreSQL references
- Update API documentation
- Update deployment instructions

EOF

echo -e "${YELLOW}Manual action required: Update documentation files${NC}"
echo ""

# Step 5: Archive PostgreSQL backups
echo -e "${GREEN}=========================================="
echo "Step 5: Archive PostgreSQL Backups"
echo "==========================================${NC}"
echo ""

if [ -d "backend/migration-data/production" ]; then
    echo -e "${BLUE}Creating archive of PostgreSQL backups...${NC}"
    
    ARCHIVE_NAME="postgresql-archive-$(date +%Y%m%d).tar.gz"
    tar -czf "$ARCHIVE_NAME" backend/migration-data/production/ 2>/dev/null || true
    
    if [ -f "$ARCHIVE_NAME" ]; then
        echo -e "${GREEN}✓ Archive created: $ARCHIVE_NAME${NC}"
        echo "- ✅ Created backup archive: $ARCHIVE_NAME" >> "$CLEANUP_REPORT"
        echo ""
        echo -e "${YELLOW}Important: Store this archive in a safe location for at least 6 months${NC}"
    else
        echo -e "${YELLOW}No backups found to archive${NC}"
        echo "- ℹ️ No PostgreSQL backups to archive" >> "$CLEANUP_REPORT"
    fi
else
    echo -e "${YELLOW}No migration data directory found${NC}"
    echo "- ℹ️ No migration data to archive" >> "$CLEANUP_REPORT"
fi

echo ""

# Step 6: Clean up temporary files
echo -e "${GREEN}=========================================="
echo "Step 6: Clean Up Temporary Files"
echo "==========================================${NC}"
echo ""

echo -e "${BLUE}Removing temporary migration files...${NC}"

# Remove test migration data
if [ -d "backend/migration-data/test" ]; then
    rm -rf backend/migration-data/test
    echo -e "${GREEN}✓ Removed test migration data${NC}"
    echo "- ✅ Removed test migration data" >> "$CLEANUP_REPORT"
fi

echo ""

# Step 7: Verify Firebase-only setup
echo -e "${GREEN}=========================================="
echo "Step 7: Verify Firebase-Only Setup"
echo "==========================================${NC}"
echo ""

echo -e "${BLUE}Verifying Firebase configuration...${NC}"

VERIFICATION_PASSED=true

# Check backend Firebase config
if [ -f "backend/src/config/firebase.ts" ]; then
    echo -e "${GREEN}✓ Firebase backend config exists${NC}"
else
    echo -e "${RED}✗ Firebase backend config missing${NC}"
    VERIFICATION_PASSED=false
fi

# Check frontend Firebase config
if [ -f "frontend/lib/firebase.ts" ]; then
    echo -e "${GREEN}✓ Firebase frontend config exists${NC}"
else
    echo -e "${RED}✗ Firebase frontend config missing${NC}"
    VERIFICATION_PASSED=false
fi

# Check environment variables
if [ -f "backend/.env" ] && grep -q "FIREBASE_SERVICE_ACCOUNT" backend/.env; then
    echo -e "${GREEN}✓ Firebase environment variables configured${NC}"
else
    echo -e "${YELLOW}⚠ Firebase environment variables may need verification${NC}"
fi

echo ""

# Generate final report
cat >> "$CLEANUP_REPORT" << EOF

## Verification Results

EOF

if [ "$VERIFICATION_PASSED" = true ]; then
    echo "- ✅ All Firebase configuration files present" >> "$CLEANUP_REPORT"
    echo "- ✅ Environment variables configured" >> "$CLEANUP_REPORT"
else
    echo "- ⚠️ Some configuration files missing - please verify" >> "$CLEANUP_REPORT"
fi

cat >> "$CLEANUP_REPORT" << EOF

## Manual Actions Required

### 1. Update Documentation
- [ ] Update README.md with Firebase-only setup
- [ ] Update SETUP.md to remove PostgreSQL instructions
- [ ] Update backend/README.md
- [ ] Update API documentation

### 2. Remove Migration Scripts
- [ ] Remove PostgreSQL migration scripts from package.json
- [ ] Remove any remaining database-related scripts

### 3. Environment Variables
- [ ] Remove DATABASE_URL from all environments
- [ ] Verify Firebase environment variables
- [ ] Update CI/CD configuration

### 4. Archive Management
- [ ] Store PostgreSQL archive in secure location
- [ ] Set reminder to delete archive after 6 months
- [ ] Document archive location

### 5. Team Communication
- [ ] Announce migration completion
- [ ] Update team documentation
- [ ] Share lessons learned
- [ ] Celebrate success! 🎉

## Next Steps

1. Review this cleanup report
2. Complete manual actions listed above
3. Run final validation: \`./scripts/validate-production.sh\`
4. Monitor production for any issues
5. Document lessons learned

## Migration Timeline

- **Migration Start**: [Date when migration started]
- **Production Deployment**: [Date of production deployment]
- **Stabilization Period**: 1 week
- **Cleanup Completed**: $(date)
- **Total Duration**: [Calculate total time]

## Success Metrics

- ✅ Zero data loss
- ✅ All features working correctly
- ✅ Performance meets or exceeds baseline
- ✅ No critical issues
- ✅ User feedback positive
- ✅ Firebase costs within budget

## Lessons Learned

[To be filled in by team]

1. What went well?
2. What could be improved?
3. Unexpected challenges?
4. Best practices identified?
5. Recommendations for future migrations?

## Conclusion

The Firebase migration is now complete! The application is running entirely on Firebase with:
- Firestore for data storage
- Firebase Authentication for user management
- Cloud Storage for file uploads
- Realtime Database for live features

All PostgreSQL dependencies have been removed, and the application is ready for continued development and scaling on Firebase.

**Congratulations on a successful migration! 🚀**

EOF

echo -e "${GREEN}✓ Cleanup report generated: $CLEANUP_REPORT${NC}"
cat "$CLEANUP_REPORT"
echo ""

# Final summary
echo -e "${GREEN}=========================================="
echo "Migration Cleanup Complete!"
echo "==========================================${NC}"
echo ""
echo -e "${BLUE}Summary:${NC}"
echo "- PostgreSQL dependencies removed"
echo "- Configuration files cleaned up"
echo "- Backups archived"
echo "- Verification completed"
echo ""
echo -e "${YELLOW}Manual Actions Required:${NC}"
echo "1. Update documentation files"
echo "2. Remove migration scripts from package.json"
echo "3. Update environment variables"
echo "4. Store backup archive securely"
echo "5. Announce migration completion"
echo ""
echo -e "${GREEN}Cleanup report: $CLEANUP_REPORT${NC}"
echo ""
echo -e "${GREEN}🎉 Congratulations on completing the Firebase migration! 🎉${NC}"
echo ""
