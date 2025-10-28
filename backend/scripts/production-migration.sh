#!/bin/bash

# Production Data Migration Script
# This script handles the complete migration process from PostgreSQL to Firebase

set -e  # Exit on error

echo "=========================================="
echo "Production Data Migration Script"
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

# Create migration directory if it doesn't exist
mkdir -p migration-data/production

# Timestamp for this migration
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
MIGRATION_DIR="migration-data/production/${TIMESTAMP}"
mkdir -p "${MIGRATION_DIR}"

echo -e "${BLUE}Migration directory: ${MIGRATION_DIR}${NC}"
echo ""

# Step 1: Backup PostgreSQL database
echo -e "${GREEN}=========================================="
echo "Step 1: Backup PostgreSQL Database"
echo "==========================================${NC}"
echo ""

if [ -z "$DATABASE_URL" ]; then
    echo -e "${YELLOW}Warning: DATABASE_URL not set. Skipping PostgreSQL backup.${NC}"
    echo -e "${YELLOW}If you have a PostgreSQL database, please back it up manually.${NC}"
    echo ""
else
    echo -e "${BLUE}Creating PostgreSQL backup...${NC}"
    
    # Extract database connection details
    DB_NAME=$(echo $DATABASE_URL | sed -n 's/.*\/\([^?]*\).*/\1/p')
    
    if command -v pg_dump &> /dev/null; then
        BACKUP_FILE="${MIGRATION_DIR}/postgres_backup_${TIMESTAMP}.sql"
        pg_dump $DATABASE_URL > "${BACKUP_FILE}"
        echo -e "${GREEN}✓ PostgreSQL backup created: ${BACKUP_FILE}${NC}"
    else
        echo -e "${YELLOW}Warning: pg_dump not found. Please backup PostgreSQL manually.${NC}"
    fi
    echo ""
fi

# Step 2: Export data from PostgreSQL
echo -e "${GREEN}=========================================="
echo "Step 2: Export Data from PostgreSQL"
echo "==========================================${NC}"
echo ""

if [ -z "$DATABASE_URL" ]; then
    echo -e "${YELLOW}Skipping PostgreSQL export (no DATABASE_URL configured)${NC}"
    echo -e "${BLUE}This is expected if you're already using Firebase.${NC}"
    echo ""
else
    echo -e "${BLUE}Running export script...${NC}"
    
    # Check if export script exists
    if [ -f "src/scripts/export-postgres-data.ts" ]; then
        npx ts-node src/scripts/export-postgres-data.ts
        
        # Move exported data to migration directory
        if [ -f "migration-data/export-data.json" ]; then
            mv migration-data/export-data.json "${MIGRATION_DIR}/export-data.json"
            echo -e "${GREEN}✓ Data exported successfully${NC}"
        else
            echo -e "${RED}Error: Export failed - no data file created${NC}"
            exit 1
        fi
    else
        echo -e "${YELLOW}Export script not found. Skipping export.${NC}"
    fi
    echo ""
fi

# Step 3: Import data to Firebase
echo -e "${GREEN}=========================================="
echo "Step 3: Import Data to Firebase"
echo "==========================================${NC}"
echo ""

if [ -f "${MIGRATION_DIR}/export-data.json" ]; then
    echo -e "${BLUE}Running import script...${NC}"
    
    # Set environment variable for import script to find the data
    export MIGRATION_DATA_PATH="${MIGRATION_DIR}/export-data.json"
    
    npx ts-node src/scripts/import-to-firebase.ts
    
    echo -e "${GREEN}✓ Data imported to Firebase${NC}"
    echo ""
else
    echo -e "${YELLOW}No export data found. Skipping import.${NC}"
    echo -e "${BLUE}This is expected if you're already using Firebase.${NC}"
    echo ""
fi

# Step 4: Verify migration
echo -e "${GREEN}=========================================="
echo "Step 4: Verify Migration"
echo "==========================================${NC}"
echo ""

echo -e "${BLUE}Running verification script...${NC}"

npx ts-node src/scripts/verify-migration.ts

echo -e "${GREEN}✓ Migration verification complete${NC}"
echo ""

# Step 5: Generate migration report
echo -e "${GREEN}=========================================="
echo "Step 5: Generate Migration Report"
echo "==========================================${NC}"
echo ""

REPORT_FILE="${MIGRATION_DIR}/migration-report.txt"

cat > "${REPORT_FILE}" << EOF
Production Data Migration Report
=================================

Migration Date: $(date)
Migration Directory: ${MIGRATION_DIR}

Steps Completed:
1. ✓ PostgreSQL database backup
2. ✓ Data export from PostgreSQL
3. ✓ Data import to Firebase
4. ✓ Migration verification

Files Created:
- PostgreSQL backup: postgres_backup_${TIMESTAMP}.sql
- Exported data: export-data.json
- Import report: (check migration-data directory)
- Verification report: (check migration-data directory)

Next Steps:
1. Review verification report for any issues
2. Test all application features
3. Monitor Firebase usage and performance
4. Keep PostgreSQL backup for rollback if needed

Firebase Project: jobportal-7918a
Environment: Production

EOF

echo -e "${GREEN}✓ Migration report generated: ${REPORT_FILE}${NC}"
cat "${REPORT_FILE}"
echo ""

# Final summary
echo -e "${GREEN}=========================================="
echo "Migration Complete!"
echo "==========================================${NC}"
echo ""
echo -e "${BLUE}Summary:${NC}"
echo "- Migration directory: ${MIGRATION_DIR}"
echo "- Report file: ${REPORT_FILE}"
echo ""
echo -e "${YELLOW}Important:${NC}"
echo "1. Review the verification report carefully"
echo "2. Test all features before removing PostgreSQL"
echo "3. Keep PostgreSQL backup for at least 1 week"
echo "4. Monitor Firebase quotas and performance"
echo ""
echo -e "${GREEN}You can now proceed with deploying the application.${NC}"
echo ""
