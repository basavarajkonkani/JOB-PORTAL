#!/bin/bash

# Production Rollback Script
# This script handles rolling back from Firebase to PostgreSQL if needed

set -e  # Exit on error

echo "=========================================="
echo "Production Rollback Script"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Navigate to backend directory
cd "$(dirname "$0")/.."

echo -e "${RED}⚠️  WARNING: This will rollback to PostgreSQL ⚠️${NC}"
echo ""
echo "This script will:"
echo "1. Clear all data from Firebase"
echo "2. Restore PostgreSQL from backup"
echo "3. Switch application to use PostgreSQL"
echo ""
echo -e "${YELLOW}Make sure you have:${NC}"
echo "- A valid PostgreSQL backup"
echo "- DATABASE_URL configured"
echo "- Confirmed this is necessary"
echo ""

read -p "Are you sure you want to proceed? (type 'yes' to continue): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo -e "${BLUE}Rollback cancelled.${NC}"
    exit 0
fi

echo ""
echo -e "${GREEN}Starting rollback process...${NC}"
echo ""

# Step 1: Clear Firebase data
echo -e "${GREEN}=========================================="
echo "Step 1: Clear Firebase Data"
echo "==========================================${NC}"
echo ""

echo -e "${BLUE}Running Firebase cleanup script...${NC}"
npx ts-node src/scripts/rollback-migration.ts

echo -e "${GREEN}✓ Firebase data cleared${NC}"
echo ""

# Step 2: Restore PostgreSQL
echo -e "${GREEN}=========================================="
echo "Step 2: Restore PostgreSQL Database"
echo "==========================================${NC}"
echo ""

if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}Error: DATABASE_URL not set${NC}"
    echo "Please configure DATABASE_URL and try again"
    exit 1
fi

# Find the most recent backup
LATEST_BACKUP=$(find migration-data/production -name "postgres_backup_*.sql" -type f | sort -r | head -n 1)

if [ -z "$LATEST_BACKUP" ]; then
    echo -e "${RED}Error: No PostgreSQL backup found${NC}"
    echo "Please restore from your own backup"
    exit 1
fi

echo -e "${BLUE}Found backup: ${LATEST_BACKUP}${NC}"
echo ""

read -p "Restore from this backup? (yes/no): " RESTORE_CONFIRM

if [ "$RESTORE_CONFIRM" = "yes" ]; then
    if command -v psql &> /dev/null; then
        echo -e "${BLUE}Restoring database...${NC}"
        psql $DATABASE_URL < "${LATEST_BACKUP}"
        echo -e "${GREEN}✓ Database restored${NC}"
    else
        echo -e "${RED}Error: psql not found${NC}"
        echo "Please restore manually using: psql \$DATABASE_URL < ${LATEST_BACKUP}"
        exit 1
    fi
else
    echo -e "${YELLOW}Skipping database restore${NC}"
fi

echo ""

# Step 3: Update environment configuration
echo -e "${GREEN}=========================================="
echo "Step 3: Update Configuration"
echo "==========================================${NC}"
echo ""

echo -e "${YELLOW}Manual steps required:${NC}"
echo ""
echo "1. Update .env file:"
echo "   - Set USE_FIREBASE=false (if you have this flag)"
echo "   - Ensure DATABASE_URL is configured"
echo ""
echo "2. Restart the application:"
echo "   - npm run dev (for development)"
echo "   - Or restart your production server"
echo ""
echo "3. Update frontend configuration:"
echo "   - Point API_URL back to your backend"
echo "   - Remove Firebase SDK calls if any"
echo ""

# Generate rollback report
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
REPORT_FILE="migration-data/production/rollback-report-${TIMESTAMP}.txt"

cat > "${REPORT_FILE}" << EOF
Production Rollback Report
==========================

Rollback Date: $(date)

Steps Completed:
1. ✓ Firebase data cleared
2. ✓ PostgreSQL database restored (if confirmed)
3. ⚠️  Configuration update required (manual)

Backup Used: ${LATEST_BACKUP}

Next Steps:
1. Update environment variables
2. Restart application servers
3. Test all features
4. Monitor for issues

Notes:
- Firebase data has been cleared
- PostgreSQL is now the active database
- Keep Firebase project for future migration attempts

EOF

echo -e "${GREEN}✓ Rollback report generated: ${REPORT_FILE}${NC}"
cat "${REPORT_FILE}"
echo ""

echo -e "${GREEN}=========================================="
echo "Rollback Process Complete"
echo "==========================================${NC}"
echo ""
echo -e "${YELLOW}Important: Complete the manual configuration steps above${NC}"
echo ""
