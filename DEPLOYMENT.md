# Deployment Guide

This guide covers deploying the AI Job Portal to various environments.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Local Development](#local-development)
- [Docker Deployment](#docker-deployment)
- [CI/CD Pipeline](#cicd-pipeline)
- [Environment Variables](#environment-variables)
- [Monitoring](#monitoring)

## Prerequisites

- Docker and Docker Compose installed
- Node.js 20+ (for local development)
- PostgreSQL 16+ (if not using Docker)
- Redis 7+ (if not using Docker)
- AWS account (for S3 storage)

## Local Development

### Using Docker Compose

1. Start all services:

```bash
docker-compose up -d
```

2. Run database migrations:

```bash
cd backend
npm run migrate:up
```

3. Seed development data (optional):

```bash
npm run seed:dev
```

4. Access the application:

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- PostgreSQL: localhost:5432
- Redis: localhost:6379

5. Stop services:

```bash
docker-compose down
```

### Without Docker

1. Start PostgreSQL and Redis locally

2. Install backend dependencies:

```bash
cd backend
npm install
```

3. Run migrations:

```bash
npm run migrate:up
```

4. Start backend:

```bash
npm run dev
```

5. Install frontend dependencies:

```bash
cd frontend
npm install
```

6. Start frontend:

```bash
npm run dev
```

## Docker Deployment

### Production Deployment

1. Create `.env` file with production variables:

```bash
cp .env.example .env
# Edit .env with production values
```

2. Build and start production containers:

```bash
docker-compose -f docker-compose.prod.yml up -d
```

3. Run migrations:

```bash
docker-compose -f docker-compose.prod.yml exec backend npm run migrate:up
```

4. Verify deployment:

```bash
./scripts/smoke-test.sh
```

### Using Deployment Script

```bash
# Deploy to staging
./scripts/deploy.sh staging

# Deploy to production
./scripts/deploy.sh production
```

## CI/CD Pipeline

The project uses GitHub Actions for continuous integration and deployment.

### Workflows

1. **CI/CD Pipeline** (`.github/workflows/ci-cd.yml`)
   - Runs on push to `main` or `develop` branches
   - Lints and type checks code
   - Builds Docker images
   - Deploys to staging (develop branch) or production (main branch)
   - Runs smoke tests

2. **Test Suite** (`.github/workflows/test.yml`)
   - Runs on all pushes and pull requests
   - Executes unit and integration tests
   - Uses PostgreSQL and Redis services

### Required GitHub Secrets

Configure these secrets in your GitHub repository settings:

**Staging:**

- `STAGING_HOST`: Staging server hostname
- `STAGING_SSH_KEY`: SSH private key for staging server

**Production:**

- `PRODUCTION_HOST`: Production server hostname
- `PRODUCTION_SSH_KEY`: SSH private key for production server

**Container Registry:**

- `GITHUB_TOKEN`: Automatically provided by GitHub Actions

**Application:**

- `NEXT_PUBLIC_API_URL`: Backend API URL for frontend

### Manual Deployment Trigger

You can manually trigger deployments from the GitHub Actions tab.

## Environment Variables

### Backend (.env)

```bash
# Server
NODE_ENV=production
PORT=3001

# Database
DATABASE_URL=postgresql://user:password@host:5432/database

# Redis
REDIS_URL=redis://host:6379

# JWT
JWT_SECRET=your-secret-key-change-in-production
JWT_REFRESH_SECRET=your-refresh-secret-key-change-in-production

# AWS S3
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
S3_BUCKET_NAME=your-bucket-name

# Optional: Sentry
SENTRY_DSN=your-sentry-dsn
```

### Frontend (.env.local)

```bash
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

## Deployment Platforms

### AWS ECS

1. Create ECR repositories for backend and frontend
2. Push Docker images to ECR
3. Create ECS task definitions
4. Create ECS services
5. Configure Application Load Balancer
6. Set up RDS PostgreSQL and ElastiCache Redis

### Railway

1. Connect GitHub repository
2. Create services for backend and frontend
3. Add PostgreSQL and Redis plugins
4. Configure environment variables
5. Deploy from main branch

### Render

1. Create Web Services for backend and frontend
2. Add PostgreSQL and Redis instances
3. Configure environment variables
4. Set up auto-deploy from GitHub

### DigitalOcean App Platform

1. Connect GitHub repository
2. Create components for backend and frontend
3. Add managed PostgreSQL and Redis
4. Configure environment variables
5. Enable auto-deploy

## Monitoring

### Health Checks

- Backend: `GET /health`
- Frontend: `GET /` (should return 200)

### Smoke Tests

Run smoke tests after deployment:

```bash
./scripts/smoke-test.sh https://api.yourdomain.com https://yourdomain.com
```

### Logs

View logs from Docker containers:

```bash
# All services
docker-compose -f docker-compose.prod.yml logs -f

# Specific service
docker-compose -f docker-compose.prod.yml logs -f backend
```

### Monitoring Tools

Configure these tools for production monitoring:

1. **Error Tracking**: Sentry (see monitoring configuration)
2. **Application Monitoring**: Datadog, New Relic, or similar
3. **Uptime Monitoring**: Pingdom, UptimeRobot, or similar
4. **Log Aggregation**: CloudWatch, Papertrail, or similar

## Rollback

If deployment fails, rollback to previous version:

```bash
# Stop current containers
docker-compose -f docker-compose.prod.yml down

# Pull previous image version
docker pull ghcr.io/your-org/jobportal/backend:previous-tag
docker pull ghcr.io/your-org/jobportal/frontend:previous-tag

# Start with previous version
docker-compose -f docker-compose.prod.yml up -d
```

## Backup and Recovery

### Database Backup

```bash
# Backup
docker-compose -f docker-compose.prod.yml exec postgres pg_dump -U jobportal jobportal_db > backup.sql

# Restore
docker-compose -f docker-compose.prod.yml exec -T postgres psql -U jobportal jobportal_db < backup.sql
```

### Automated Backups

Configure automated backups based on your hosting platform:

- AWS RDS: Enable automated backups with point-in-time recovery
- Railway/Render: Use platform backup features
- Self-hosted: Set up cron jobs for regular backups

## Scaling

### Horizontal Scaling

1. Increase number of backend/frontend containers
2. Use load balancer to distribute traffic
3. Ensure database connection pooling is configured
4. Use Redis for session storage (already configured)

### Vertical Scaling

Adjust resource limits in `docker-compose.prod.yml`:

```yaml
deploy:
  resources:
    limits:
      cpus: '2'
      memory: 2G
```

## Troubleshooting

### Container won't start

```bash
# Check logs
docker-compose -f docker-compose.prod.yml logs backend

# Check container status
docker-compose -f docker-compose.prod.yml ps
```

### Database connection issues

```bash
# Test database connection
docker-compose -f docker-compose.prod.yml exec backend node -e "require('pg').Client({connectionString: process.env.DATABASE_URL}).connect().then(() => console.log('Connected')).catch(console.error)"
```

### Redis connection issues

```bash
# Test Redis connection
docker-compose -f docker-compose.prod.yml exec redis redis-cli ping
```

## Security Checklist

- [ ] Change default JWT secrets
- [ ] Use strong database passwords
- [ ] Enable HTTPS/TLS
- [ ] Configure CORS properly
- [ ] Set up firewall rules
- [ ] Enable database encryption at rest
- [ ] Regular security updates
- [ ] Configure rate limiting
- [ ] Set up monitoring and alerts
- [ ] Regular backups
- [ ] Implement secrets management (AWS Secrets Manager, HashiCorp Vault)

## Support

For issues or questions:

1. Check application logs
2. Review error tracking (Sentry)
3. Check monitoring dashboards
4. Contact development team
