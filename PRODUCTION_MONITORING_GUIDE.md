# Production Monitoring Guide

## Overview

This guide provides comprehensive instructions for monitoring the AI Job Portal in production with Firebase backend.

## Quick Start

```bash
# Validate production deployment
./scripts/validate-production.sh

# Monitor application health
./scripts/monitor-production.sh --continuous

# Monitor Firebase usage
./scripts/monitor-firebase-usage.sh
```

## Monitoring Tools

### 1. Production Validation Script

**Purpose**: Comprehensive validation of production deployment

**Usage:**

```bash
./scripts/validate-production.sh
```

**Tests Performed:**

- Service health checks
- Firebase connection tests
- API endpoint tests
- Security tests
- Performance tests
- Database tests
- Real-time features tests
- Error handling tests

**Output**: Generates a validation report with pass/fail status for each test

### 2. Production Monitoring Script

**Purpose**: Real-time monitoring of application health and performance

**Usage:**

```bash
# Single check
./scripts/monitor-production.sh

# Continuous monitoring (updates every 60 seconds)
./scripts/monitor-production.sh --continuous
```

**Metrics Monitored:**

- Backend health status
- Frontend accessibility
- Firebase connection status
- Response times
- Error rates
- System resources (CPU, memory, disk)
- Docker container status

### 3. Firebase Usage Monitoring Script

**Purpose**: Monitor Firebase quotas, usage, and costs

**Usage:**

```bash
./scripts/monitor-firebase-usage.sh
```

**Information Provided:**

- Firestore usage and limits
- Authentication metrics
- Storage usage
- Realtime Database usage
- Cost optimization recommendations
- Billing alert setup

## Monitoring Schedule

### First 24 Hours (Critical Period)

**Every Hour:**

- Check application health
- Monitor error rates
- Review Firebase usage
- Check user feedback

**Actions:**

```bash
# Run validation
./scripts/validate-production.sh

# Check monitoring dashboard
./scripts/monitor-production.sh

# Review logs
tail -f backend/logs/error.log
```

### First Week (Stabilization Period)

**Daily:**

- Morning check (9 AM)
- Afternoon check (2 PM)
- Evening check (6 PM)

**Daily Checklist:**

- [ ] Run validation script
- [ ] Check Firebase console
- [ ] Review error logs
- [ ] Monitor response times
- [ ] Check user feedback
- [ ] Verify backups

### Ongoing (Normal Operations)

**Daily:**

- Quick health check
- Review error logs
- Check Firebase usage

**Weekly:**

- Comprehensive validation
- Performance analysis
- Cost review
- Security audit

**Monthly:**

- Full system review
- Optimization planning
- Budget analysis
- Capacity planning

## Key Metrics to Monitor

### Application Metrics

#### 1. Availability

- **Target**: 99.9% uptime
- **Measurement**: Health check success rate
- **Alert**: < 99% uptime

#### 2. Response Time

- **Target**: < 2s for backend, < 3s for frontend
- **Measurement**: Average response time
- **Alert**: > 3s average

#### 3. Error Rate

- **Target**: < 0.1%
- **Measurement**: Errors per request
- **Alert**: > 1% error rate

#### 4. Throughput

- **Target**: Varies by traffic
- **Measurement**: Requests per minute
- **Alert**: Sudden drops or spikes

### Firebase Metrics

#### 1. Firestore

- **Reads**: Monitor daily reads
- **Writes**: Monitor daily writes
- **Storage**: Monitor total storage
- **Alert**: Approaching quota limits

**Free Tier Limits:**

- 50,000 reads/day
- 20,000 writes/day
- 1 GB storage

#### 2. Authentication

- **Active Users**: Track daily active users
- **Sign-ins**: Monitor sign-in rate
- **Errors**: Track authentication failures
- **Alert**: High error rate

#### 3. Storage

- **Files**: Monitor file count
- **Size**: Track total storage
- **Bandwidth**: Monitor downloads
- **Alert**: Approaching 5 GB limit

#### 4. Realtime Database

- **Connections**: Monitor concurrent connections
- **Bandwidth**: Track data transfer
- **Operations**: Monitor read/write ops
- **Alert**: Approaching 100 connections

### System Metrics

#### 1. CPU Usage

- **Target**: < 70% average
- **Alert**: > 80% sustained

#### 2. Memory Usage

- **Target**: < 70% average
- **Alert**: > 80% sustained

#### 3. Disk Space

- **Target**: < 70% used
- **Alert**: > 80% used

#### 4. Network

- **Target**: Stable bandwidth
- **Alert**: Unusual spikes or drops

## Monitoring Dashboards

### Firebase Console

**Main Dashboard:**
https://console.firebase.google.com/project/jobportal-7918a/overview

**Key Sections:**

1. **Firestore**
   - URL: https://console.firebase.google.com/project/jobportal-7918a/firestore
   - Monitor: Reads, writes, storage
   - Check: Query performance, indexes

2. **Authentication**
   - URL: https://console.firebase.google.com/project/jobportal-7918a/authentication
   - Monitor: User count, sign-ins
   - Check: Error rates, methods

3. **Storage**
   - URL: https://console.firebase.google.com/project/jobportal-7918a/storage
   - Monitor: File count, bandwidth
   - Check: Storage size, operations

4. **Realtime Database**
   - URL: https://console.firebase.google.com/project/jobportal-7918a/database
   - Monitor: Connections, bandwidth
   - Check: Data structure, rules

5. **Usage & Billing**
   - URL: https://console.firebase.google.com/project/jobportal-7918a/usage
   - Monitor: Daily usage, costs
   - Check: Quota usage, trends

### Application Logs

**Backend Logs:**

```bash
# Error logs
tail -f backend/logs/error.log

# Combined logs
tail -f backend/logs/combined.log

# Docker logs (if using Docker)
docker logs -f jobportal-backend
```

**Frontend Logs:**

```bash
# Next.js logs
tail -f frontend/.next/server/logs/

# Docker logs (if using Docker)
docker logs -f jobportal-frontend
```

## Alert Configuration

### Critical Alerts (Immediate Action Required)

1. **Service Down**
   - Condition: Health check fails
   - Action: Investigate immediately
   - Escalation: 5 minutes

2. **High Error Rate**
   - Condition: > 5% errors
   - Action: Check logs, investigate
   - Escalation: 10 minutes

3. **Firebase Quota Exceeded**
   - Condition: Quota limit reached
   - Action: Optimize or upgrade
   - Escalation: 15 minutes

### Warning Alerts (Action Within Hours)

1. **Slow Response Times**
   - Condition: > 3s average
   - Action: Investigate performance
   - Review: Within 1 hour

2. **High Resource Usage**
   - Condition: > 80% CPU/memory
   - Action: Check for issues
   - Review: Within 2 hours

3. **Approaching Quota Limits**
   - Condition: > 80% of quota
   - Action: Plan optimization
   - Review: Within 4 hours

### Info Alerts (Monitor and Review)

1. **Unusual Traffic Patterns**
   - Condition: Significant change
   - Action: Monitor closely
   - Review: Daily

2. **New Error Types**
   - Condition: New error patterns
   - Action: Investigate cause
   - Review: Daily

## Troubleshooting Guide

### Issue: High Error Rate

**Symptoms:**

- Increased errors in logs
- User complaints
- Failed requests

**Investigation Steps:**

1. Check error logs
2. Review recent deployments
3. Check Firebase status
4. Verify configuration

**Solutions:**

- Rollback if recent deployment
- Fix identified bugs
- Scale resources if needed
- Contact Firebase support

### Issue: Slow Performance

**Symptoms:**

- High response times
- User complaints about speed
- Timeouts

**Investigation Steps:**

1. Check response times
2. Review Firebase queries
3. Check system resources
4. Analyze slow queries

**Solutions:**

- Optimize queries
- Add indexes
- Implement caching
- Scale resources

### Issue: Firebase Quota Exceeded

**Symptoms:**

- Operations failing
- Quota limit errors
- Service degradation

**Investigation Steps:**

1. Check Firebase console
2. Review usage patterns
3. Identify high-usage operations
4. Analyze query efficiency

**Solutions:**

- Implement caching
- Optimize queries
- Upgrade plan
- Reduce unnecessary operations

### Issue: Authentication Failures

**Symptoms:**

- Users can't sign in
- Token errors
- Authentication timeouts

**Investigation Steps:**

1. Check Firebase Auth status
2. Review error logs
3. Verify configuration
4. Test authentication flow

**Solutions:**

- Verify Firebase credentials
- Check security rules
- Review token expiration
- Contact Firebase support

## Performance Optimization

### Backend Optimization

1. **Implement Caching**

   ```javascript
   // Cache frequently accessed data
   const cachedData = await redis.get(key);
   if (cachedData) return cachedData;

   const data = await firestore.collection('jobs').get();
   await redis.setEx(key, 300, JSON.stringify(data));
   ```

2. **Optimize Queries**

   ```javascript
   // Use indexes
   const jobs = await firestore
     .collection('jobs')
     .where('status', '==', 'published')
     .orderBy('publishedAt', 'desc')
     .limit(20)
     .get();
   ```

3. **Batch Operations**
   ```javascript
   // Use batch writes
   const batch = firestore.batch();
   items.forEach((item) => {
     const ref = firestore.collection('items').doc();
     batch.set(ref, item);
   });
   await batch.commit();
   ```

### Frontend Optimization

1. **Code Splitting**

   ```javascript
   // Lazy load components
   const HeavyComponent = dynamic(() => import('./HeavyComponent'));
   ```

2. **Image Optimization**

   ```javascript
   // Use Next.js Image
   <Image src="/image.jpg" width={500} height={300} />
   ```

3. **Caching Strategy**
   ```javascript
   // Implement SWR
   const { data } = useSWR('/api/jobs', fetcher);
   ```

### Firebase Optimization

1. **Reduce Reads**
   - Implement pagination
   - Cache results
   - Use real-time listeners efficiently

2. **Optimize Writes**
   - Batch operations
   - Reduce unnecessary updates
   - Use transactions

3. **Storage Optimization**
   - Compress files
   - Use appropriate formats
   - Implement CDN

## Cost Management

### Current Costs (Estimate)

**Free Tier Usage:**

- Firestore: Within limits
- Authentication: Free
- Storage: Within limits
- Realtime Database: Within limits

**Paid Usage (if exceeded):**

- Firestore: $0.06 per 100,000 reads
- Storage: $0.026 per GB
- Bandwidth: $0.12 per GB

### Cost Optimization Strategies

1. **Implement Caching**
   - Reduce Firestore reads by 50-70%
   - Use Redis for frequently accessed data
   - Cache API responses

2. **Optimize Queries**
   - Use indexes to reduce query time
   - Implement pagination
   - Limit result sets

3. **Monitor Usage**
   - Daily usage checks
   - Weekly cost reviews
   - Monthly optimization planning

4. **Set Budgets**
   - Start with $25/month
   - Set alerts at 50%, 75%, 90%
   - Review and adjust monthly

## Backup and Recovery

### Automated Backups

**Firestore:**

```bash
# Daily backup (set up cron job)
gcloud firestore export gs://jobportal-backups/$(date +%Y%m%d)
```

**Authentication:**

```bash
# Weekly backup
firebase auth:export users-backup-$(date +%Y%m%d).json
```

### Recovery Procedures

**Restore Firestore:**

```bash
gcloud firestore import gs://jobportal-backups/[backup-date]
```

**Restore Authentication:**

```bash
firebase auth:import users-backup-[date].json
```

## Incident Response

### Severity Levels

**P0 - Critical (Immediate Response)**

- Complete service outage
- Data loss
- Security breach

**P1 - High (Response within 1 hour)**

- Partial service outage
- High error rates
- Performance degradation

**P2 - Medium (Response within 4 hours)**

- Minor feature issues
- Slow performance
- Non-critical bugs

**P3 - Low (Response within 24 hours)**

- Cosmetic issues
- Enhancement requests
- Documentation updates

### Incident Response Process

1. **Detect**: Monitoring alerts or user reports
2. **Assess**: Determine severity and impact
3. **Respond**: Take immediate action
4. **Communicate**: Notify stakeholders
5. **Resolve**: Fix the issue
6. **Review**: Post-incident analysis

## Reporting

### Daily Report

**Contents:**

- Service availability
- Error count
- Response times
- Firebase usage
- Notable events

**Distribution:** Team email/Slack

### Weekly Report

**Contents:**

- Availability summary
- Performance trends
- Cost analysis
- Optimization opportunities
- Action items

**Distribution:** Team meeting

### Monthly Report

**Contents:**

- Overall health summary
- Cost analysis
- Performance trends
- Capacity planning
- Roadmap updates

**Distribution:** Stakeholders

## Support Contacts

- **Firebase Support**: https://firebase.google.com/support
- **Team Lead**: [Contact Info]
- **DevOps**: [Contact Info]
- **On-Call Engineer**: [Contact Info]

## Resources

- **Firebase Documentation**: https://firebase.google.com/docs
- **Monitoring Scripts**: `scripts/`
- **Deployment Guide**: `PRODUCTION_DEPLOYMENT.md`
- **Migration Guide**: `backend/PRODUCTION_MIGRATION_GUIDE.md`

## Conclusion

Effective monitoring is crucial for maintaining a healthy production environment. Follow this guide to ensure the AI Job Portal runs smoothly with Firebase backend.

**Remember:**

- Monitor proactively
- Respond quickly to alerts
- Optimize continuously
- Document everything
- Communicate clearly
