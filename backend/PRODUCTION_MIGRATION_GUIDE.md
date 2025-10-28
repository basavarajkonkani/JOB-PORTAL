# Production Migration Guide

## Overview

This guide provides step-by-step instructions for migrating the AI Job Portal from PostgreSQL to Firebase in production.

## Pre-Migration Checklist

### ✅ Prerequisites

- [ ] All staging tests passed successfully
- [ ] Firebase configuration deployed and verified
- [ ] Backup strategy in place
- [ ] Rollback plan documented and tested
- [ ] Team notified of migration schedule
- [ ] Maintenance window scheduled (recommended: low-traffic period)
- [ ] Monitoring tools configured

### ✅ Environment Verification

- [ ] Firebase project created: `jobportal-7918a`
- [ ] Service account credentials configured
- [ ] Environment variables set correctly
- [ ] Firebase CLI installed and authenticated
- [ ] Database backup tools available (pg_dump, psql)

## Migration Process

### Phase 1: Preparation (30 minutes before migration)

#### 1.1 Notify Users

```bash
# Post maintenance notice
# - Update status page
# - Send email notifications
# - Display banner on website
```

#### 1.2 Enable Maintenance Mode

```bash
# Set maintenance mode flag
export MAINTENANCE_MODE=true

# Or use a feature flag service
# This will show a maintenance page to users
```

#### 1.3 Final Backup

```bash
# Create final PostgreSQL backup
pg_dump $DATABASE_URL > backups/final_backup_$(date +%Y%m%d_%H%M%S).sql

# Verify backup
ls -lh backups/
```

### Phase 2: Data Migration (Estimated: 1-2 hours)

#### 2.1 Run Migration Script

```bash
cd backend
./scripts/production-migration.sh
```

This script will:

1. ✅ Backup PostgreSQL database
2. ✅ Export all data to JSON
3. ✅ Import data to Firebase
4. ✅ Verify data integrity
5. ✅ Generate migration report

#### 2.2 Review Migration Report

```bash
# Check the migration report
cat migration-data/production/[timestamp]/migration-report.txt

# Review verification results
cat migration-data/production/[timestamp]/verification-report.json
```

#### 2.3 Verify Data Integrity

**Manual Verification Steps:**

1. **Check Record Counts**

   ```bash
   # Compare counts between PostgreSQL and Firebase
   # The verification script should show this
   ```

2. **Verify Sample Data**
   - Check a few user accounts
   - Verify job postings
   - Check applications
   - Verify resume metadata

3. **Test Relationships**
   - User → Profile links
   - Job → Organization links
   - Application → Job/User links

### Phase 3: Application Deployment (Estimated: 30 minutes)

#### 3.1 Deploy Backend

```bash
# Build backend
cd backend
npm run build

# Deploy to production server
# (Method depends on your hosting platform)

# Example for Docker:
docker build -t jobportal-backend:firebase .
docker-compose -f docker-compose.prod.yml up -d backend

# Example for cloud platforms:
# gcloud app deploy
# heroku deploy
# aws deploy
```

#### 3.2 Deploy Frontend

```bash
# Build frontend
cd frontend
npm run build

# Deploy to production
# Example for Vercel:
vercel --prod

# Example for Netlify:
netlify deploy --prod

# Example for Docker:
docker build -t jobportal-frontend:firebase .
docker-compose -f docker-compose.prod.yml up -d frontend
```

#### 3.3 Verify Deployment

```bash
# Check backend health
curl https://your-api-domain.com/health

# Check frontend
curl https://your-app-domain.com

# Verify Firebase connection
curl https://your-api-domain.com/api/health/firebase
```

### Phase 4: Testing & Validation (Estimated: 1 hour)

#### 4.1 Smoke Tests

```bash
# Run automated smoke tests
./scripts/smoke-test.sh
```

#### 4.2 Manual Testing

**Critical Flows to Test:**

1. **Authentication**
   - [ ] User signup
   - [ ] User login
   - [ ] Password reset
   - [ ] Token refresh

2. **Candidate Flows**
   - [ ] Profile creation
   - [ ] Job search
   - [ ] Job application
   - [ ] Resume upload
   - [ ] Application tracking

3. **Recruiter Flows**
   - [ ] Job posting creation
   - [ ] Application review
   - [ ] Candidate shortlisting
   - [ ] Status updates

4. **Real-time Features**
   - [ ] Notifications
   - [ ] Application status updates
   - [ ] Presence tracking

#### 4.3 Performance Testing

```bash
# Run load tests
cd backend
npm run test:load

# Monitor Firebase metrics
# Check Firebase Console for:
# - Read/Write operations
# - Storage usage
# - Authentication requests
```

### Phase 5: Monitoring (First 24 hours)

#### 5.1 Monitor Key Metrics

**Firebase Metrics:**

- Firestore reads/writes per minute
- Authentication requests
- Storage bandwidth
- Realtime Database connections
- Error rates

**Application Metrics:**

- API response times
- Error rates
- User activity
- Feature usage

#### 5.2 Set Up Alerts

Configure alerts for:

- High error rates (> 1%)
- Slow response times (> 2s)
- Firebase quota warnings
- Authentication failures

#### 5.3 User Feedback

- Monitor support channels
- Check error logs
- Review user reports
- Track feature usage

### Phase 6: Stabilization (First Week)

#### 6.1 Daily Checks

**Days 1-3:**

- Check Firebase usage and costs
- Monitor error rates
- Review user feedback
- Verify all features working

**Days 4-7:**

- Analyze performance trends
- Optimize slow queries
- Address any issues
- Collect user feedback

#### 6.2 Keep PostgreSQL Backup

**Important:** Do not delete PostgreSQL for at least 1 week

- Keep database running (read-only mode)
- Maintain backups
- Document any issues
- Be ready to rollback if needed

## Rollback Procedure

If critical issues are discovered:

### Quick Rollback (< 1 hour)

```bash
# Run rollback script
cd backend
./scripts/production-rollback.sh

# This will:
# 1. Clear Firebase data
# 2. Restore PostgreSQL
# 3. Generate rollback report
```

### Manual Rollback Steps

1. **Switch Database**

   ```bash
   # Update .env
   USE_FIREBASE=false
   DATABASE_URL=postgresql://...
   ```

2. **Restore Data**

   ```bash
   # Restore from backup
   psql $DATABASE_URL < backups/final_backup_[timestamp].sql
   ```

3. **Redeploy Application**

   ```bash
   # Deploy previous version
   git checkout [previous-commit]
   # Deploy backend and frontend
   ```

4. **Notify Users**
   - Explain the rollback
   - Provide timeline for retry
   - Apologize for inconvenience

## Post-Migration Cleanup (After 1 Week)

### If Migration Successful

#### 7.1 Remove PostgreSQL Dependencies

```bash
# Remove PostgreSQL packages
cd backend
npm uninstall pg @types/pg node-pg-migrate

# Remove database configuration
rm -rf migrations/
rm src/config/database.ts

# Update package.json
# Remove migration scripts
```

#### 7.2 Update Documentation

```bash
# Update README
# Update SETUP.md
# Update API documentation
# Update deployment guides
```

#### 7.3 Archive PostgreSQL Data

```bash
# Create final archive
tar -czf postgresql_archive_$(date +%Y%m%d).tar.gz \
  backups/ \
  migration-data/

# Move to long-term storage
# Keep for at least 6 months
```

#### 7.4 Announce Completion

- Send success notification to team
- Update status page
- Document lessons learned
- Celebrate! 🎉

## Troubleshooting

### Common Issues

#### Issue: High Firebase Costs

**Solution:**

- Review query patterns
- Add more indexes
- Implement caching
- Optimize data structure

#### Issue: Slow Queries

**Solution:**

- Check Firestore indexes
- Use composite indexes
- Implement pagination
- Cache frequently accessed data

#### Issue: Authentication Errors

**Solution:**

- Verify Firebase credentials
- Check token expiration
- Review security rules
- Check custom claims

#### Issue: Real-time Updates Not Working

**Solution:**

- Verify Realtime Database rules
- Check WebSocket connections
- Review listener setup
- Check network connectivity

## Support Contacts

- **Firebase Support**: https://firebase.google.com/support
- **Team Lead**: [Contact Info]
- **DevOps**: [Contact Info]
- **On-Call Engineer**: [Contact Info]

## Migration Timeline

| Phase              | Duration      | Description                              |
| ------------------ | ------------- | ---------------------------------------- |
| Preparation        | 30 min        | Backups, notifications, maintenance mode |
| Data Migration     | 1-2 hours     | Export, import, verify                   |
| Deployment         | 30 min        | Deploy backend and frontend              |
| Testing            | 1 hour        | Smoke tests, manual testing              |
| **Total Downtime** | **3-4 hours** | Expected maintenance window              |
| Monitoring         | 24 hours      | Active monitoring                        |
| Stabilization      | 7 days        | Keep PostgreSQL backup                   |
| Cleanup            | 1 hour        | Remove old dependencies                  |

## Success Criteria

Migration is considered successful when:

- ✅ All data migrated with 100% integrity
- ✅ All features working correctly
- ✅ Performance meets or exceeds baseline
- ✅ Error rates < 0.1%
- ✅ No critical bugs reported
- ✅ User feedback is positive
- ✅ Firebase costs within budget
- ✅ Stable operation for 7 days

## Lessons Learned

Document lessons learned after migration:

1. What went well?
2. What could be improved?
3. Unexpected issues?
4. Time estimates accuracy?
5. Communication effectiveness?

## Appendix

### A. Environment Variables

**Backend (.env)**

```env
NODE_ENV=production
PORT=3001

# Firebase
FIREBASE_SERVICE_ACCOUNT=<service-account-json>
FIREBASE_STORAGE_BUCKET=jobportal-7918a.firebasestorage.app
FIREBASE_DATABASE_URL=https://jobportal-7918a-default-rtdb.firebaseio.com

# Redis
REDIS_URL=redis://...

# Other services
POLLINATIONS_TEXT_API=https://text.pollinations.ai
```

**Frontend (.env.production)**

```env
NEXT_PUBLIC_API_URL=https://api.your-domain.com
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDv3qvDywNjL7sId8lL6ej-y7ucd-Rl_2M
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=jobportal-7918a.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=jobportal-7918a
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=jobportal-7918a.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=486520425901
NEXT_PUBLIC_FIREBASE_APP_ID=1:486520425901:web:c6c116a49dd706286a2524
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://jobportal-7918a-default-rtdb.firebaseio.com
```

### B. Useful Commands

```bash
# Check Firebase project
firebase projects:list

# Deploy all Firebase config
firebase deploy --project jobportal-7918a

# View Firestore data
firebase firestore:indexes --project jobportal-7918a

# Check authentication users
firebase auth:export users.json --project jobportal-7918a

# Monitor logs
firebase functions:log --project jobportal-7918a
```

### C. Monitoring Queries

```javascript
// Check Firestore usage
// Go to: https://console.firebase.google.com/project/jobportal-7918a/usage

// Check authentication
// Go to: https://console.firebase.google.com/project/jobportal-7918a/authentication/users

// Check storage
// Go to: https://console.firebase.google.com/project/jobportal-7918a/storage
```
