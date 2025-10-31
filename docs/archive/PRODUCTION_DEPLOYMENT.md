# Production Deployment Guide

## Overview

This guide provides comprehensive instructions for deploying the AI Job Portal to production with Firebase backend.

## Quick Start

```bash
# Deploy to production
./scripts/deploy-production.sh

# Monitor production
./scripts/monitor-production.sh --continuous
```

## Prerequisites

### Required Software

- ✅ Node.js 18+ installed
- ✅ npm or yarn installed
- ✅ Firebase CLI installed (`npm install -g firebase-tools`)
- ✅ Docker (optional, for containerized deployment)
- ✅ Git for version control

### Required Configuration

- ✅ Firebase project created (`jobportal-7918a`)
- ✅ Service account credentials configured
- ✅ Environment variables set
- ✅ Domain/hosting configured (if applicable)

## Deployment Methods

### Method 1: Docker Deployment (Recommended)

**Advantages:**

- Consistent environment
- Easy rollback
- Isolated dependencies
- Simple scaling

**Steps:**

1. **Build Images**

   ```bash
   # Backend
   cd backend
   docker build -t jobportal-backend:latest .

   # Frontend
   cd frontend
   docker build -t jobportal-frontend:latest .
   ```

2. **Deploy with Docker Compose**

   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

3. **Verify Deployment**
   ```bash
   docker ps
   docker logs jobportal-backend
   docker logs jobportal-frontend
   ```

### Method 2: PM2 Deployment

**Advantages:**

- Process management
- Auto-restart on failure
- Log management
- Cluster mode support

**Steps:**

1. **Install PM2**

   ```bash
   npm install -g pm2
   ```

2. **Deploy Backend**

   ```bash
   cd backend
   npm ci --production
   npm run build
   pm2 start dist/index.js --name jobportal-backend
   pm2 save
   ```

3. **Deploy Frontend**

   ```bash
   cd frontend
   npm ci --production
   npm run build
   pm2 start npm --name jobportal-frontend -- start
   pm2 save
   ```

4. **Setup PM2 Startup**
   ```bash
   pm2 startup
   # Follow the instructions provided
   ```

### Method 3: Cloud Platform Deployment

#### Vercel (Frontend)

```bash
cd frontend
vercel --prod
```

#### Heroku (Backend)

```bash
cd backend
heroku create jobportal-backend
git push heroku main
```

#### Google Cloud Run

```bash
# Backend
gcloud run deploy jobportal-backend \
  --source backend \
  --platform managed \
  --region us-central1

# Frontend
gcloud run deploy jobportal-frontend \
  --source frontend \
  --platform managed \
  --region us-central1
```

## Environment Configuration

### Backend Environment Variables

Create `backend/.env.production`:

```env
# Server Configuration
NODE_ENV=production
PORT=3001

# Firebase Configuration
FIREBASE_SERVICE_ACCOUNT=<service-account-json>
FIREBASE_STORAGE_BUCKET=jobportal-7918a.firebasestorage.app
FIREBASE_DATABASE_URL=https://jobportal-7918a-default-rtdb.firebaseio.com

# Redis Configuration
REDIS_URL=redis://your-redis-host:6379

# API Configuration
FRONTEND_URL=https://your-domain.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Monitoring (Optional)
SENTRY_DSN=<your-sentry-dsn>
```

### Frontend Environment Variables

Create `frontend/.env.production`:

```env
# API Configuration
NEXT_PUBLIC_API_URL=https://api.your-domain.com

# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDv3qvDywNjL7sId8lL6ej-y7ucd-Rl_2M
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=jobportal-7918a.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=jobportal-7918a
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=jobportal-7918a.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=486520425901
NEXT_PUBLIC_FIREBASE_APP_ID=1:486520425901:web:c6c116a49dd706286a2524
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-PMZYC4JBDG
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://jobportal-7918a-default-rtdb.firebaseio.com

# Environment
NEXT_PUBLIC_ENV=production
```

## Deployment Checklist

### Pre-Deployment

- [ ] All tests passing
- [ ] Code reviewed and approved
- [ ] Environment variables configured
- [ ] Firebase security rules deployed
- [ ] Firestore indexes created
- [ ] Database backup created (if migrating)
- [ ] Monitoring tools configured
- [ ] SSL certificates configured
- [ ] DNS records updated

### During Deployment

- [ ] Enable maintenance mode (if applicable)
- [ ] Deploy backend
- [ ] Deploy frontend
- [ ] Run smoke tests
- [ ] Verify Firebase connection
- [ ] Check error logs
- [ ] Disable maintenance mode

### Post-Deployment

- [ ] Monitor error rates
- [ ] Check Firebase usage
- [ ] Verify all features working
- [ ] Test critical user flows
- [ ] Monitor performance metrics
- [ ] Collect user feedback

## Monitoring

### Health Checks

**Backend Health:**

```bash
curl https://api.your-domain.com/health
```

**Frontend Health:**

```bash
curl https://your-domain.com
```

**Firebase Connection:**

```bash
curl https://api.your-domain.com/api/health/firebase
```

### Monitoring Dashboard

Run the monitoring script:

```bash
./scripts/monitor-production.sh --continuous
```

### Key Metrics to Monitor

1. **Application Metrics**
   - Response times
   - Error rates
   - Request throughput
   - Active users

2. **Firebase Metrics**
   - Firestore reads/writes
   - Authentication requests
   - Storage bandwidth
   - Realtime Database connections

3. **System Metrics**
   - CPU usage
   - Memory usage
   - Disk space
   - Network bandwidth

### Firebase Console

Monitor Firebase metrics at:

- **Overview**: https://console.firebase.google.com/project/jobportal-7918a/overview
- **Firestore**: https://console.firebase.google.com/project/jobportal-7918a/firestore
- **Authentication**: https://console.firebase.google.com/project/jobportal-7918a/authentication
- **Storage**: https://console.firebase.google.com/project/jobportal-7918a/storage
- **Realtime Database**: https://console.firebase.google.com/project/jobportal-7918a/database

## Scaling

### Horizontal Scaling

**Docker Swarm:**

```bash
docker swarm init
docker stack deploy -c docker-compose.prod.yml jobportal
docker service scale jobportal_backend=3
```

**Kubernetes:**

```bash
kubectl apply -f k8s/deployment.yaml
kubectl scale deployment jobportal-backend --replicas=3
```

### Vertical Scaling

Increase resources for containers:

```yaml
# docker-compose.prod.yml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 4G
```

## Rollback Procedure

### Quick Rollback

```bash
# Stop current deployment
docker-compose -f docker-compose.prod.yml down

# Checkout previous version
git checkout [previous-commit]

# Redeploy
./scripts/deploy-production.sh
```

### Detailed Rollback

1. **Identify Issue**
   - Check error logs
   - Review monitoring metrics
   - Identify root cause

2. **Decide on Rollback**
   - Can issue be fixed quickly?
   - Is rollback necessary?
   - What's the impact?

3. **Execute Rollback**

   ```bash
   # For Docker
   docker-compose -f docker-compose.prod.yml down
   git checkout [stable-version]
   docker-compose -f docker-compose.prod.yml up -d

   # For PM2
   pm2 stop all
   git checkout [stable-version]
   cd backend && npm run build
   cd frontend && npm run build
   pm2 restart all
   ```

4. **Verify Rollback**
   - Check application health
   - Test critical features
   - Monitor error rates

5. **Post-Rollback**
   - Document the issue
   - Plan fix for next deployment
   - Communicate with team

## Troubleshooting

### Common Issues

#### Issue: Backend Not Starting

**Symptoms:**

- Backend health check fails
- Connection refused errors

**Solutions:**

1. Check environment variables
2. Verify Firebase credentials
3. Check port availability
4. Review error logs

```bash
# Check logs
docker logs jobportal-backend
# or
pm2 logs jobportal-backend
```

#### Issue: Frontend Build Fails

**Symptoms:**

- Build errors during deployment
- Missing dependencies

**Solutions:**

1. Clear node_modules and reinstall
2. Check Node.js version
3. Verify environment variables

```bash
cd frontend
rm -rf node_modules .next
npm ci
npm run build
```

#### Issue: Firebase Connection Errors

**Symptoms:**

- Authentication failures
- Firestore operation errors

**Solutions:**

1. Verify service account credentials
2. Check Firebase project ID
3. Verify security rules
4. Check network connectivity

```bash
# Test Firebase connection
npm run test:firebase-connection
```

#### Issue: High Error Rates

**Symptoms:**

- Increased error logs
- User complaints

**Solutions:**

1. Check Firebase quotas
2. Review recent code changes
3. Check external service status
4. Scale resources if needed

### Emergency Contacts

- **Firebase Support**: https://firebase.google.com/support
- **Team Lead**: [Contact Info]
- **DevOps**: [Contact Info]
- **On-Call Engineer**: [Contact Info]

## Performance Optimization

### Backend Optimization

1. **Enable Caching**
   - Use Redis for frequently accessed data
   - Cache Firestore query results
   - Implement CDN for static assets

2. **Optimize Queries**
   - Use Firestore indexes
   - Implement pagination
   - Limit query results

3. **Connection Pooling**
   - Configure Redis connection pool
   - Optimize Firebase Admin SDK usage

### Frontend Optimization

1. **Code Splitting**
   - Lazy load components
   - Dynamic imports
   - Route-based splitting

2. **Image Optimization**
   - Use Next.js Image component
   - Implement lazy loading
   - Compress images

3. **Caching Strategy**
   - Configure service worker
   - Use browser caching
   - Implement CDN

## Security Checklist

- [ ] HTTPS enabled
- [ ] Firebase security rules deployed
- [ ] Environment variables secured
- [ ] API rate limiting enabled
- [ ] CORS configured correctly
- [ ] Input validation implemented
- [ ] SQL injection prevention (N/A for Firebase)
- [ ] XSS protection enabled
- [ ] CSRF protection enabled
- [ ] Security headers configured

## Backup Strategy

### Automated Backups

1. **Firestore Backups**

   ```bash
   # Schedule daily backups
   gcloud firestore export gs://jobportal-backups/$(date +%Y%m%d)
   ```

2. **Authentication Backups**
   ```bash
   # Export users
   firebase auth:export users-backup-$(date +%Y%m%d).json
   ```

### Manual Backups

Before major deployments:

```bash
# Export all data
npm run backup:firebase
```

## Cost Optimization

### Firebase Cost Management

1. **Monitor Usage**
   - Check Firebase console daily
   - Set up billing alerts
   - Review usage patterns

2. **Optimize Operations**
   - Reduce unnecessary reads
   - Use batch operations
   - Implement caching

3. **Set Budgets**
   - Configure spending limits
   - Set up alerts at 50%, 75%, 90%
   - Review monthly costs

## Maintenance

### Regular Maintenance Tasks

**Daily:**

- Check error logs
- Monitor Firebase usage
- Verify backups

**Weekly:**

- Review performance metrics
- Update dependencies
- Check security advisories

**Monthly:**

- Review Firebase costs
- Analyze user feedback
- Plan optimizations

## Documentation

### Deployment Documentation

- **This Guide**: Production deployment procedures
- **Migration Guide**: `backend/PRODUCTION_MIGRATION_GUIDE.md`
- **Monitoring**: `monitoring/README.md`
- **Security**: `backend/SECURITY_RULES.md`

### API Documentation

- **Backend API**: `backend/README.md`
- **Frontend**: `frontend/README.md`

## Support Resources

- **Firebase Documentation**: https://firebase.google.com/docs
- **Next.js Documentation**: https://nextjs.org/docs
- **Express.js Documentation**: https://expressjs.com
- **Docker Documentation**: https://docs.docker.com

## Conclusion

This guide provides comprehensive instructions for deploying the AI Job Portal to production. Follow the checklist, monitor carefully, and be prepared to rollback if issues arise.

For questions or issues, contact the development team or refer to the troubleshooting section.

**Good luck with your deployment! 🚀**
