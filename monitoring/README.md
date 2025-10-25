# Monitoring and Logging Guide

This guide covers the monitoring and logging setup for the AI Job Portal.

## Table of Contents

- [Overview](#overview)
- [Logging](#logging)
- [Error Tracking](#error-tracking)
- [Application Monitoring](#application-monitoring)
- [Uptime Monitoring](#uptime-monitoring)
- [Metrics](#metrics)
- [Alerts](#alerts)
- [Dashboards](#dashboards)

## Overview

The monitoring stack includes:

- **Logging**: Winston for structured logging with daily rotation
- **Error Tracking**: Sentry for error tracking and performance monitoring
- **Application Monitoring**: Custom metrics service with Sentry integration
- **Uptime Monitoring**: Health check endpoints for external monitoring services
- **Metrics**: Custom metrics for API performance, AI usage, database queries, and cache operations

## Logging

### Configuration

Logs are managed by Winston and configured in `backend/src/utils/logger.ts`.

**Log Levels:**
- `error`: Error messages
- `warn`: Warning messages
- `info`: Informational messages (default)
- `debug`: Debug messages
- `verbose`: Verbose messages

**Log Outputs:**
- Console (always enabled)
- File rotation (production only):
  - `logs/error-YYYY-MM-DD.log`: Error logs only
  - `logs/combined-YYYY-MM-DD.log`: All logs

**Configuration via Environment Variables:**
```bash
LOG_LEVEL=info              # Set log level
LOG_DIR=logs                # Set log directory
ENABLE_FILE_LOGGING=true    # Enable file logging in development
```

### Usage

```typescript
import logger from './utils/logger';

// Log messages
logger.info('User logged in', { userId: '123' });
logger.warn('Rate limit approaching', { userId: '123', requests: 95 });
logger.error('Database connection failed', { error: err.message });

// Log with context
logger.info('API request', {
  method: 'GET',
  url: '/api/jobs',
  duration: 150,
  statusCode: 200,
});
```

### Log Rotation

Logs are automatically rotated daily with the following settings:
- Max file size: 20MB
- Retention: 14 days
- Compression: Enabled (gzip)

### Viewing Logs

**Development:**
```bash
# View all logs
npm run dev

# View specific log file
tail -f logs/combined-2024-01-15.log

# View error logs only
tail -f logs/error-2024-01-15.log
```

**Production (Docker):**
```bash
# View container logs
docker-compose -f docker-compose.prod.yml logs -f backend

# View last 100 lines
docker-compose -f docker-compose.prod.yml logs --tail=100 backend

# View logs for all services
docker-compose -f docker-compose.prod.yml logs -f
```

## Error Tracking

### Sentry Setup

Sentry is configured in `backend/src/config/sentry.ts`.

**1. Create Sentry Account:**
- Sign up at https://sentry.io
- Create a new project for Node.js
- Copy the DSN

**2. Configure Environment Variable:**
```bash
SENTRY_DSN=https://your-dsn@sentry.io/project-id
```

**3. Sentry Features:**
- Automatic error capture
- Performance monitoring (10% sample rate in production)
- Profiling (10% sample rate in production)
- Request tracing
- Breadcrumbs for debugging

**4. Manual Error Capture:**
```typescript
import { Sentry } from './config/sentry';

try {
  // Your code
} catch (error) {
  Sentry.captureException(error, {
    extra: {
      userId: '123',
      operation: 'job_search',
    },
  });
}
```

**5. Custom Context:**
```typescript
Sentry.setUser({ id: '123', email: 'user@example.com' });
Sentry.setTag('feature', 'job_search');
Sentry.setContext('job', { id: '456', title: 'Software Engineer' });
```

### Privacy and Security

Sentry is configured to filter sensitive data:
- Authorization headers removed
- Cookie headers removed
- Password fields removed
- Token fields removed

## Application Monitoring

### Monitoring Service

The monitoring service (`backend/src/services/monitoringService.ts`) tracks:

**1. API Performance:**
- Response times by endpoint
- Request rates
- Status code distribution
- Slow request detection (>1s)

**2. AI Service Usage:**
- Operation duration
- Success/failure rates
- Operation types

**3. Database Performance:**
- Query execution times
- Connection pool status

**4. Cache Performance:**
- Hit/miss rates
- Operation types

### Health Checks

**Endpoint:** `GET /health`

**Response:**
```json
{
  "status": "healthy",
  "checks": {
    "database": true,
    "redis": true,
    "ai_service": true
  },
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 3600000
}
```

**Status Codes:**
- `200`: Healthy or degraded
- `503`: Unhealthy

**Status Values:**
- `healthy`: All checks passing
- `degraded`: Some checks failing
- `unhealthy`: All checks failing

### Custom Metrics

```typescript
import { monitoringService } from './services/monitoringService';

// Record custom metric
monitoringService.recordMetric({
  name: 'custom.metric',
  value: 100,
  tags: { feature: 'job_search' },
});

// Record API response time
monitoringService.recordResponseTime('/api/jobs', 'GET', 150, 200);

// Record AI usage
monitoringService.recordAIUsage('generate_jd', 2500, true);

// Record database query
monitoringService.recordDatabaseQuery('SELECT * FROM jobs', 50);

// Record cache operation
monitoringService.recordCacheOperation('hit', 'jobs:search:123');

// Record error
monitoringService.recordError(error, { userId: '123' });
```

## Uptime Monitoring

### External Monitoring Services

Configure external monitoring using `monitoring/uptime-config.yml`.

**Recommended Services:**
- **UptimeRobot**: Free tier available, easy setup
- **Pingdom**: Advanced features, detailed reports
- **StatusCake**: Free tier, multiple check locations
- **Datadog Synthetics**: Integrated with APM

**Endpoints to Monitor:**
- `GET /health`: Backend health check
- `GET /`: Frontend homepage
- `GET /api/jobs`: API functionality

**Configuration:**
1. Create account with monitoring service
2. Add HTTP monitors for each endpoint
3. Set check interval (60 seconds recommended)
4. Configure alert channels (email, Slack, PagerDuty)
5. Set alert threshold (3 consecutive failures)

### Self-Hosted Monitoring

For self-hosted monitoring, consider:
- **Uptime Kuma**: Simple, Docker-based
- **Prometheus + Alertmanager**: Advanced, scalable
- **Grafana Cloud**: Managed Prometheus

## Metrics

### Available Metrics

**API Metrics:**
- `api.response_time`: Response time in milliseconds
  - Tags: `endpoint`, `method`, `status`
- `api.requests`: Request count
  - Tags: `endpoint`, `method`, `status`

**AI Metrics:**
- `ai.operation`: AI operation duration
  - Tags: `operation`, `success`

**Database Metrics:**
- `database.query_time`: Query execution time
  - Tags: `query` (truncated)
- `database.connections`: Active connections

**Cache Metrics:**
- `cache.operation`: Cache operations
  - Tags: `operation` (hit/miss/set), `key_prefix`

### Querying Metrics

Metrics are sent to Sentry and can be queried in the Sentry dashboard.

**Example Queries:**
- Average response time: `avg(api.response_time)`
- Error rate: `rate(api.response_time{status=~"5.."})`
- Cache hit rate: `cache.operation{operation="hit"} / cache.operation`

## Alerts

### Alert Configuration

Alerts are configured in `monitoring/dashboard-config.json`.

**Default Alerts:**

1. **High Error Rate**
   - Condition: 5xx errors > 10/min
   - Duration: 5 minutes
   - Severity: Critical

2. **Slow Response Time**
   - Condition: p95 response time > 3s
   - Duration: 5 minutes
   - Severity: Warning

3. **Database Connection Issues**
   - Condition: Database health check failing
   - Duration: 1 minute
   - Severity: Critical

4. **Redis Connection Issues**
   - Condition: Redis health check failing
   - Duration: 1 minute
   - Severity: Warning

5. **AI Service Degraded**
   - Condition: AI failure rate > 20%
   - Duration: 5 minutes
   - Severity: Warning

### Alert Channels

Configure alert channels in your monitoring service:

**Email:**
```yaml
alerts:
  - type: email
    recipients:
      - ops@yourdomain.com
```

**Slack:**
```yaml
alerts:
  - type: slack
    webhook_url: "${SLACK_WEBHOOK_URL}"
    channel: "#alerts"
```

**PagerDuty:**
```yaml
alerts:
  - type: pagerduty
    integration_key: "${PAGERDUTY_KEY}"
```

## Dashboards

### Monitoring Dashboard

A sample dashboard configuration is provided in `monitoring/dashboard-config.json`.

**Dashboard Panels:**
1. System Health: Overall status and uptime
2. API Performance: Response times and request rates
3. Error Rate: 4xx and 5xx errors
4. AI Service Metrics: Operation duration and success rate
5. Database Performance: Query times and connections
6. Cache Performance: Hit/miss ratio
7. Top Endpoints: Most trafficked endpoints
8. Slowest Endpoints: Endpoints with highest p95 response time

### Creating Dashboards

**Sentry:**
1. Go to Dashboards in Sentry
2. Create new dashboard
3. Add widgets for each metric
4. Configure time ranges and aggregations

**Grafana:**
1. Install Grafana
2. Add Prometheus data source
3. Import dashboard from `monitoring/dashboard-config.json`
4. Customize as needed

**Datadog:**
1. Create new dashboard
2. Add timeseries widgets
3. Configure metrics and tags
4. Set up alerts

## Best Practices

1. **Log Levels:**
   - Use `error` for errors that need immediate attention
   - Use `warn` for potential issues
   - Use `info` for important events
   - Use `debug` for development only

2. **Structured Logging:**
   - Always include context (userId, requestId, etc.)
   - Use consistent field names
   - Avoid logging sensitive data

3. **Error Tracking:**
   - Capture errors with context
   - Set user information when available
   - Use tags for filtering
   - Add breadcrumbs for debugging

4. **Metrics:**
   - Use consistent naming conventions
   - Add relevant tags
   - Set appropriate sample rates
   - Monitor metric cardinality

5. **Alerts:**
   - Set appropriate thresholds
   - Avoid alert fatigue
   - Use severity levels correctly
   - Test alerts regularly

6. **Performance:**
   - Monitor response times
   - Track slow queries
   - Optimize hot paths
   - Use caching effectively

## Troubleshooting

### High Memory Usage

```bash
# Check memory usage
docker stats

# View heap snapshot
node --inspect dist/index.js
```

### High CPU Usage

```bash
# Check CPU usage
docker stats

# Profile application
node --prof dist/index.js
```

### Database Connection Pool Exhausted

```bash
# Check active connections
SELECT count(*) FROM pg_stat_activity;

# Increase pool size in config/database.ts
```

### Redis Connection Issues

```bash
# Test Redis connection
redis-cli ping

# Check Redis memory
redis-cli info memory
```

## Support

For monitoring issues:
1. Check application logs
2. Review Sentry errors
3. Check health endpoint
4. Review monitoring dashboards
5. Contact DevOps team
