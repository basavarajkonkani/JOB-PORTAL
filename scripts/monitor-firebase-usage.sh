#!/bin/bash

# Firebase Usage Monitoring Script
# Monitors Firebase quotas, usage, and costs

set -e  # Exit on error

echo "=========================================="
echo "Firebase Usage Monitoring"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
FIREBASE_PROJECT="jobportal-7918a"
REPORT_FILE="firebase-usage-report-$(date +%Y%m%d_%H%M%S).md"

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo -e "${RED}Error: Firebase CLI is not installed${NC}"
    echo "Install it with: npm install -g firebase-tools"
    exit 1
fi

# Start report
cat > "$REPORT_FILE" << EOF
# Firebase Usage Report

**Date**: $(date)
**Project**: ${FIREBASE_PROJECT}

## Overview

EOF

echo -e "${GREEN}=========================================="
echo "1. Firebase Project Information"
echo "==========================================${NC}"
echo ""

echo -e "${BLUE}Project ID: ${FIREBASE_PROJECT}${NC}"
echo -e "${BLUE}Console: https://console.firebase.google.com/project/${FIREBASE_PROJECT}${NC}"
echo ""

cat >> "$REPORT_FILE" << EOF
### Project Information
- **Project ID**: ${FIREBASE_PROJECT}
- **Console**: https://console.firebase.google.com/project/${FIREBASE_PROJECT}

EOF

echo -e "${GREEN}=========================================="
echo "2. Firestore Usage"
echo "==========================================${NC}"
echo ""

echo -e "${BLUE}Firestore Console:${NC}"
echo "https://console.firebase.google.com/project/${FIREBASE_PROJECT}/firestore"
echo ""

cat >> "$REPORT_FILE" << EOF
### Firestore
- **Console**: https://console.firebase.google.com/project/${FIREBASE_PROJECT}/firestore
- **Usage**: Check console for detailed metrics
- **Indexes**: https://console.firebase.google.com/project/${FIREBASE_PROJECT}/firestore/indexes

**Key Metrics to Monitor:**
- Document reads per day
- Document writes per day
- Document deletes per day
- Storage size
- Index entries

**Free Tier Limits:**
- 50,000 document reads/day
- 20,000 document writes/day
- 20,000 document deletes/day
- 1 GB storage

EOF

echo -e "${GREEN}=========================================="
echo "3. Authentication Usage"
echo "==========================================${NC}"
echo ""

echo -e "${BLUE}Authentication Console:${NC}"
echo "https://console.firebase.google.com/project/${FIREBASE_PROJECT}/authentication"
echo ""

# Try to get user count
USER_COUNT=$(firebase auth:export /dev/null --project ${FIREBASE_PROJECT} 2>&1 | grep -o '[0-9]* user' | grep -o '[0-9]*' || echo "N/A")

echo -e "${BLUE}Total Users: ${USER_COUNT}${NC}"
echo ""

cat >> "$REPORT_FILE" << EOF
### Authentication
- **Console**: https://console.firebase.google.com/project/${FIREBASE_PROJECT}/authentication
- **Total Users**: ${USER_COUNT}

**Key Metrics to Monitor:**
- Active users
- Sign-in methods usage
- Authentication errors
- Token refresh rate

**Free Tier:**
- Unlimited authentication (email/password)
- Phone authentication: 10,000 verifications/month

EOF

echo -e "${GREEN}=========================================="
echo "4. Cloud Storage Usage"
echo "==========================================${NC}"
echo ""

echo -e "${BLUE}Storage Console:${NC}"
echo "https://console.firebase.google.com/project/${FIREBASE_PROJECT}/storage"
echo ""

cat >> "$REPORT_FILE" << EOF
### Cloud Storage
- **Console**: https://console.firebase.google.com/project/${FIREBASE_PROJECT}/storage
- **Bucket**: jobportal-7918a.firebasestorage.app

**Key Metrics to Monitor:**
- Total storage used
- Download bandwidth
- Upload bandwidth
- Number of operations

**Free Tier Limits:**
- 5 GB storage
- 1 GB/day download
- 20,000 uploads/day
- 50,000 downloads/day

EOF

echo -e "${GREEN}=========================================="
echo "5. Realtime Database Usage"
echo "==========================================${NC}"
echo ""

echo -e "${BLUE}Realtime Database Console:${NC}"
echo "https://console.firebase.google.com/project/${FIREBASE_PROJECT}/database"
echo ""

cat >> "$REPORT_FILE" << EOF
### Realtime Database
- **Console**: https://console.firebase.google.com/project/${FIREBASE_PROJECT}/database
- **URL**: https://jobportal-7918a-default-rtdb.firebaseio.com

**Key Metrics to Monitor:**
- Concurrent connections
- Storage used
- Download bandwidth
- Operations per second

**Free Tier Limits:**
- 1 GB storage
- 10 GB/month download
- 100 simultaneous connections

EOF

echo -e "${GREEN}=========================================="
echo "6. Usage Recommendations"
echo "==========================================${NC}"
echo ""

cat >> "$REPORT_FILE" << EOF
## Usage Recommendations

### Cost Optimization
1. **Implement Caching**
   - Cache frequently accessed data in Redis
   - Reduce Firestore reads
   - Cache authentication tokens

2. **Optimize Queries**
   - Use indexes for all queries
   - Implement pagination
   - Limit query results
   - Use batch operations

3. **Monitor Usage Daily**
   - Check Firebase console daily
   - Set up billing alerts
   - Review usage patterns
   - Identify optimization opportunities

### Billing Alerts
Set up alerts at:
- 50% of quota
- 75% of quota
- 90% of quota
- 100% of quota

### Budget Recommendations
- Start with \$25/month budget
- Monitor for first month
- Adjust based on actual usage
- Set spending limits

## Action Items

### Daily Checks
- [ ] Review Firebase console
- [ ] Check error logs
- [ ] Monitor usage metrics
- [ ] Verify backups

### Weekly Checks
- [ ] Review usage trends
- [ ] Check billing
- [ ] Optimize queries
- [ ] Update indexes if needed

### Monthly Checks
- [ ] Review total costs
- [ ] Analyze usage patterns
- [ ] Plan optimizations
- [ ] Update budget if needed

## Links

- **Firebase Console**: https://console.firebase.google.com/project/${FIREBASE_PROJECT}
- **Usage & Billing**: https://console.firebase.google.com/project/${FIREBASE_PROJECT}/usage
- **Firestore**: https://console.firebase.google.com/project/${FIREBASE_PROJECT}/firestore
- **Authentication**: https://console.firebase.google.com/project/${FIREBASE_PROJECT}/authentication
- **Storage**: https://console.firebase.google.com/project/${FIREBASE_PROJECT}/storage
- **Realtime Database**: https://console.firebase.google.com/project/${FIREBASE_PROJECT}/database

EOF

echo -e "${YELLOW}Important Monitoring Points:${NC}"
echo ""
echo "1. Firestore Usage"
echo "   - Monitor read/write operations"
echo "   - Check storage size"
echo "   - Review query performance"
echo ""
echo "2. Authentication"
echo "   - Track active users"
echo "   - Monitor sign-in errors"
echo "   - Check token refresh rate"
echo ""
echo "3. Storage"
echo "   - Monitor file uploads"
echo "   - Check bandwidth usage"
echo "   - Review storage size"
echo ""
echo "4. Realtime Database"
echo "   - Monitor connections"
echo "   - Check bandwidth usage"
echo "   - Review data structure"
echo ""
echo -e "${GREEN}Report saved to: ${REPORT_FILE}${NC}"
echo ""
echo -e "${BLUE}Next Steps:${NC}"
echo "1. Review the report"
echo "2. Check Firebase console for detailed metrics"
echo "3. Set up billing alerts"
echo "4. Monitor usage daily for first week"
echo ""
