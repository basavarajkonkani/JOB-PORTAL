# Firebase Migration Guide

This guide provides detailed instructions for migrating data from PostgreSQL to Firebase using the provided migration scripts.

## Overview

The migration process consists of four main scripts:

1. **Export Script** - Exports all data from PostgreSQL to JSON
2. **Import Script** - Imports JSON data into Firebase
3. **Verification Script** - Verifies data integrity after migration
4. **Rollback Script** - Provides rollback capabilities and backup/restore functionality

## Prerequisites

Before starting the migration, ensure you have:

- ✅ PostgreSQL database running with existing data
- ✅ Firebase project configured with Admin SDK credentials
- ✅ Environment variables properly set (see `.env.example`)
- ✅ All dependencies installed (`npm install`)
- ✅ Firebase security rules deployed
- ✅ Firestore indexes created

## Migration Process

### Step 1: Export PostgreSQL Data

Export all data from PostgreSQL to a JSON file:

```bash
npm run migrate:export
```

**What it does:**

- Connects to PostgreSQL database
- Exports all tables (users, organizations, profiles, jobs, applications, resumes)
- Creates a timestamped JSON file in `migration-data/` directory
- Generates a summary report with record counts

**Output:**

```
migration-data/
  └── postgres-export-2024-01-15T10-30-00-000Z.json
```

**Example output:**

```
🚀 Starting PostgreSQL data export...

✅ Database connection successful

📊 Exporting users...
   ✓ Exported 150 users

📊 Exporting organizations...
   ✓ Exported 25 organizations

📊 Exporting candidate profiles...
   ✓ Exported 120 candidate profiles

📊 Exporting recruiter profiles...
   ✓ Exported 30 recruiter profiles

📊 Exporting jobs...
   ✓ Exported 200 jobs

📊 Exporting applications...
   ✓ Exported 500 applications

📊 Exporting resumes...
   ✓ Exported 120 resumes

📊 Exporting resume versions...
   ✓ Exported 180 resume versions

✅ Export completed successfully!

📁 Export file: ./migration-data/postgres-export-2024-01-15T10-30-00-000Z.json

📊 Summary:
   Users: 150
   Organizations: 25
   Candidate Profiles: 120
   Recruiter Profiles: 30
   Jobs: 200
   Applications: 500
   Resumes: 120
   Resume Versions: 180

💾 Total records exported: 1325
```

### Step 2: Import Data to Firebase

Import the exported data into Firebase:

```bash
npm run migrate:import ./migration-data/postgres-export-2024-01-15T10-30-00-000Z.json
```

**What it does:**

- Creates Firebase Auth users (without passwords - users will need to reset)
- Sets custom claims for user roles
- Creates Firestore documents for all collections
- Maintains relationships between documents
- Generates an import report with success/failure counts

**Output:**

```
migration-data/
  └── import-report-2024-01-15T10-35-00-000Z.json
```

**Example output:**

```
🚀 Starting Firebase import...

📁 Reading export file: ./migration-data/postgres-export-2024-01-15T10-30-00-000Z.json
✅ Export file loaded successfully

👥 Importing users...
   ✓ Imported 10 users...
   ✓ Imported 20 users...
   ...
   ✅ Users import complete: 150 success, 0 failed

🏢 Importing organizations...
   ✅ Organizations import complete: 25 success, 0 failed

👤 Importing candidate profiles...
   ✅ Candidate profiles import complete: 120 success, 0 failed

💼 Importing recruiter profiles...
   ✅ Recruiter profiles import complete: 30 success, 0 failed

💼 Importing jobs...
   ✓ Imported 10 jobs...
   ✓ Imported 20 jobs...
   ...
   ✅ Jobs import complete: 200 success, 0 failed

📝 Importing applications...
   ✓ Imported 10 applications...
   ...
   ✅ Applications import complete: 500 success, 0 failed

📄 Importing resumes...
   ✅ Resumes import complete: 120 success, 0 failed

📑 Importing resume versions...
   ✅ Resume versions import complete: 180 success, 0 failed

✅ Import completed!

📊 Summary:
   Users: 150 success, 0 failed
   Organizations: 25 success, 0 failed
   Candidate Profiles: 120 success, 0 failed
   Recruiter Profiles: 30 success, 0 failed
   Jobs: 200 success, 0 failed
   Applications: 500 success, 0 failed
   Resumes: 120 success, 0 failed
   Resume Versions: 180 success, 0 failed

📈 Total: 1325 success, 0 failed

📁 Import report saved to: ./migration-data/import-report-2024-01-15T10-35-00-000Z.json
```

**Important Notes:**

- User passwords cannot be migrated from PostgreSQL password hashes to Firebase Auth
- Users will need to use the "Forgot Password" feature to reset their passwords
- Custom claims for roles are set during import
- If a user already exists in Firebase Auth, the script will skip creating them but will still update Firestore

### Step 3: Verify Migration

Verify that all data was migrated correctly:

```bash
npm run migrate:verify
```

**What it does:**

- Compares record counts between PostgreSQL and Firestore
- Performs sample data comparisons to verify field mappings
- Checks relationship integrity (foreign keys)
- Generates a detailed verification report

**Output:**

```
migration-data/
  └── verification-report-2024-01-15T10-40-00-000Z.json
```

**Example output:**

```
🔍 Starting migration verification...

👥 Verifying users...
   PostgreSQL: 150, Firestore: 150 ✅

🏢 Verifying organizations...
   PostgreSQL: 25, Firestore: 25 ✅

👤 Verifying candidate profiles...
   PostgreSQL: 120, Firestore: 120 ✅

💼 Verifying recruiter profiles...
   PostgreSQL: 30, Firestore: 30 ✅

💼 Verifying jobs...
   PostgreSQL: 200, Firestore: 200 ✅

📝 Verifying applications...
   PostgreSQL: 500, Firestore: 500 ✅

📄 Verifying resumes...
   PostgreSQL: 120, Firestore: 120 ✅

📑 Verifying resume versions...
   PostgreSQL: 180, Firestore: 180 ✅

🔗 Verifying relationships...
   ✅ All application relationships are valid
   ✅ All job-organization relationships are valid

============================================================
📊 VERIFICATION SUMMARY
============================================================
Overall Status: ✅ PASS
Total PostgreSQL Records: 1325
Total Firestore Records: 1325
All Counts Match: ✅ Yes
Relationship Errors: 0

📁 Verification report saved to: ./migration-data/verification-report-2024-01-15T10-40-00-000Z.json
============================================================
```

### Step 4: Rollback (if needed)

If you need to rollback the migration, you have two options:

#### Option A: Delete All Firebase Data

Delete all Firebase data with automatic backup:

```bash
npm run migrate:rollback delete
```

**Options:**

- `--no-backup` - Skip creating backup before deletion
- `--skip-auth` - Skip deleting Firebase Auth users
- `--skip-firestore` - Skip deleting Firestore collections
- `--skip-storage` - Skip deleting Storage files
- `--skip-realtime` - Skip deleting Realtime Database

**Example:**

```bash
# Delete everything with backup
npm run migrate:rollback delete

# Delete without backup (dangerous!)
npm run migrate:rollback delete --no-backup

# Delete only Firestore data
npm run migrate:rollback delete --skip-auth --skip-storage --skip-realtime
```

#### Option B: Restore from Backup

Restore Firebase data from a previous backup:

```bash
npm run migrate:rollback restore ./migration-data/backups/firebase-backup-2024-01-15T10-45-00-000Z.json
```

**What it does:**

- Reads the backup file
- Restores all collections to Firestore
- Restores subcollections (resume versions)

## Migration Reports

All migration scripts generate detailed JSON reports in the `migration-data/` directory:

### Export Report (embedded in export file)

```json
{
  "users": [...],
  "organizations": [...],
  "exportedAt": "2024-01-15T10:30:00.000Z",
  "recordCounts": {
    "users": 150,
    "organizations": 25,
    ...
  }
}
```

### Import Report

```json
{
  "importedAt": "2024-01-15T10:35:00.000Z",
  "sourceFile": "./migration-data/postgres-export-2024-01-15T10-30-00-000Z.json",
  "stats": {
    "users": { "success": 150, "failed": 0 },
    "organizations": { "success": 25, "failed": 0 },
    ...
  },
  "errors": [],
  "summary": {
    "totalSuccess": 1325,
    "totalFailed": 0
  }
}
```

### Verification Report

```json
{
  "verifiedAt": "2024-01-15T10:40:00.000Z",
  "overallStatus": "PASS",
  "summary": {
    "totalPostgresRecords": 1325,
    "totalFirestoreRecords": 1325,
    "allCountsMatch": true,
    "relationshipErrors": 0
  },
  "collectionResults": [...],
  "sampleComparisons": [...],
  "relationshipErrors": []
}
```

### Rollback Report

```json
{
  "rolledBackAt": "2024-01-15T10:45:00.000Z",
  "backupPath": "./migration-data/backups/firebase-backup-2024-01-15T10-45-00-000Z.json",
  "stats": {
    "users": { "deleted": 150, "failed": 0 },
    ...
  },
  "summary": {
    "totalDeleted": 1325,
    "totalFailed": 0
  }
}
```

## Best Practices

### Before Migration

1. **Backup PostgreSQL database**

   ```bash
   pg_dump -U jobportal -d jobportal_db > backup.sql
   ```

2. **Test in staging environment first**
   - Run migration on a copy of production data
   - Verify all features work correctly
   - Test user authentication flows

3. **Deploy Firebase security rules**

   ```bash
   firebase deploy --only firestore:rules,storage:rules,database:rules
   ```

4. **Create Firestore indexes**
   ```bash
   firebase deploy --only firestore:indexes
   ```

### During Migration

1. **Put application in maintenance mode**
   - Prevent new data from being created during migration
   - Display maintenance message to users

2. **Monitor the migration process**
   - Watch for errors in the console output
   - Check import reports for failed records

3. **Keep PostgreSQL database running**
   - Don't delete PostgreSQL data until migration is verified
   - Keep it as a backup for at least 1 week

### After Migration

1. **Verify all features**
   - Test user authentication
   - Test data retrieval and updates
   - Test file uploads
   - Test real-time features

2. **Monitor Firebase usage**
   - Check Firebase console for usage metrics
   - Monitor error rates in application logs
   - Watch for quota limits

3. **Notify users about password reset**
   - Send email to all users about password reset requirement
   - Provide clear instructions for resetting passwords

## Troubleshooting

### Import Fails with "Permission Denied"

**Problem:** Firebase security rules are blocking the import.

**Solution:** The import script uses Firebase Admin SDK which bypasses security rules. Ensure your service account has proper permissions.

### Some Records Failed to Import

**Problem:** Import report shows failed records.

**Solution:**

1. Check the import report for error details
2. Common issues:
   - Invalid data format
   - Missing required fields
   - Relationship references to non-existent documents
3. Fix the data in PostgreSQL and re-run the import

### Verification Shows Mismatched Counts

**Problem:** PostgreSQL and Firestore have different record counts.

**Solution:**

1. Check the verification report for which collections don't match
2. Re-run the import for specific collections
3. Check for errors in the import report

### Users Can't Sign In After Migration

**Problem:** User passwords weren't migrated.

**Solution:** This is expected behavior. Users need to:

1. Click "Forgot Password" on the sign-in page
2. Enter their email address
3. Follow the password reset link sent to their email
4. Create a new password

### Rollback Doesn't Delete Everything

**Problem:** Some data remains in Firebase after rollback.

**Solution:**

1. Check the rollback report for failed deletions
2. Manually delete remaining data from Firebase console
3. Re-run the rollback script with specific options

## Security Considerations

1. **Service Account Credentials**
   - Keep Firebase service account JSON file secure
   - Never commit it to version control
   - Use environment variables for credentials

2. **Export Files**
   - Export files contain sensitive data
   - Store them securely
   - Delete them after successful migration
   - Never commit them to version control

3. **Backup Files**
   - Backup files contain all user data
   - Encrypt backups if storing long-term
   - Delete old backups after migration is stable

4. **Password Migration**
   - User passwords cannot be migrated
   - This is a security feature, not a bug
   - Users must reset passwords after migration

## Support

If you encounter issues during migration:

1. Check the generated reports for error details
2. Review the troubleshooting section above
3. Check Firebase console for quota limits or errors
4. Review application logs for additional context

## Cleanup After Successful Migration

Once the migration is verified and stable (after 1-2 weeks):

1. **Remove PostgreSQL dependencies** (Task 14 in the migration plan)
2. **Delete export and backup files**
3. **Update documentation**
4. **Remove migration scripts** (optional, keep for reference)

## Quick Reference

```bash
# Export PostgreSQL data
npm run migrate:export

# Import to Firebase
npm run migrate:import <export-file-path>

# Verify migration
npm run migrate:verify

# Rollback with backup
npm run migrate:rollback delete

# Restore from backup
npm run migrate:rollback restore <backup-file-path>
```
