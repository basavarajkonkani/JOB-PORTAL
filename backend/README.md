# Backend API - AI Job Portal

Express.js backend API with Firebase integration for the AI Job Portal.

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: Firebase (Firestore, Realtime Database)
- **Authentication**: Firebase Authentication
- **Storage**: Firebase Cloud Storage
- **Cache**: Redis
- **AI**: Pollinations API
- **Monitoring**: Sentry
- **Testing**: Jest

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your Firebase credentials

# Run development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
npm start
```

## Environment Variables

Required environment variables (see `.env.example`):

```bash
# Server
PORT=3001
NODE_ENV=development

# Firebase Configuration
FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...}
FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
FIREBASE_DATABASE_URL=https://your-project.firebaseio.com

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Sentry (optional)
SENTRY_DSN=your-sentry-dsn
```

## Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   │   ├── firebase.ts  # Firebase initialization
│   │   ├── redis.ts     # Redis client
│   │   └── sentry.ts    # Sentry monitoring
│   ├── middleware/      # Express middleware
│   │   ├── auth.ts      # Legacy auth (deprecated)
│   │   ├── firebaseAuth.ts  # Firebase auth middleware
│   │   ├── errorHandler.ts  # Error handling
│   │   └── rateLimiter.ts   # Rate limiting
│   ├── models/          # Data models
│   │   ├── User.ts
│   │   ├── Job.ts
│   │   ├── Application.ts
│   │   └── ...
│   ├── routes/          # API routes
│   │   ├── auth.ts
│   │   ├── jobs.ts
│   │   ├── applications.ts
│   │   └── ...
│   ├── services/        # Business logic
│   │   ├── aiService.ts
│   │   ├── realtimeService.ts
│   │   └── ...
│   ├── utils/           # Utility functions
│   ├── scripts/         # Migration and utility scripts
│   └── __tests__/       # Test files
├── reports/             # Load test reports
├── scripts/             # Shell scripts
└── package.json
```

## API Documentation

### Authentication

All protected endpoints require Firebase ID token in Authorization header:

```
Authorization: Bearer <firebase-id-token>
```

### Endpoints

#### Auth

- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/signin` - Sign in user
- `POST /api/auth/set-role` - Set user role (requires auth)

#### Jobs

- `GET /api/jobs` - List jobs with filters
- `GET /api/jobs/:id` - Get job details
- `POST /api/jobs` - Create job (recruiter only)
- `PUT /api/jobs/:id` - Update job (recruiter only)
- `DELETE /api/jobs/:id` - Delete job (recruiter only)

#### Applications

- `GET /api/applications` - List user's applications
- `POST /api/applications` - Submit application
- `PUT /api/applications/:id` - Update application status (recruiter only)

#### Profile

- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update user profile
- `POST /api/profile/candidate` - Create candidate profile
- `POST /api/profile/recruiter` - Create recruiter profile

#### Resume

- `POST /api/resume/upload` - Upload resume
- `GET /api/resume/:id` - Get resume details
- `POST /api/resume/:id/parse` - Parse resume with AI

See individual route files for detailed API documentation.

## Testing

### Unit Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- user-model.test.ts

# Watch mode
npm run test:watch
```

### Load Testing

Comprehensive load testing suite for Firebase services:

```bash
# Run load tests with report
npm run test:load:report

# Run load tests directly
npm run test:load

# Skip load tests (for CI/CD)
SKIP_LOAD_TESTS=true npm test
```

**Load Testing Documentation:**

- **[QUICK_LOAD_TEST_GUIDE.md](QUICK_LOAD_TEST_GUIDE.md)** - Quick reference
- **[LOAD_TESTING.md](LOAD_TESTING.md)** - Complete guide
- **[PERFORMANCE_COMPARISON.md](PERFORMANCE_COMPARISON.md)** - Firebase vs PostgreSQL
- **[LOAD_TEST_SUMMARY.md](LOAD_TEST_SUMMARY.md)** - Implementation summary

### Security Rules Testing

```bash
# Test Firestore security rules
npm run test:security

# Validate security rules
npm run security:validate
```

## Firebase Migration

The backend has been migrated from PostgreSQL to Firebase. Migration scripts are available:

```bash
# Export data from PostgreSQL (if needed)
npm run migrate:export

# Import data to Firebase
npm run migrate:import

# Verify migration
npm run migrate:verify

# Rollback migration
npm run migrate:rollback

# Test migration scripts
npm run migrate:test
```

**Migration Documentation:**

- **[MIGRATION_GUIDE.md](MIGRATION_GUIDE.md)** - Complete migration guide
- **[DATABASE_SETUP.md](DATABASE_SETUP.md)** - Database setup
- **[FIRESTORE_INDEXES.md](FIRESTORE_INDEXES.md)** - Index configuration

## Security

### Firebase Security Rules

Security rules are defined for:

- **Firestore**: `firestore.rules`
- **Cloud Storage**: `storage.rules`
- **Realtime Database**: `database.rules.json`

Deploy security rules:

```bash
# Deploy all rules
firebase deploy --only firestore:rules,storage:rules,database:rules

# Or use the script
./scripts/deploy-security-rules.sh
```

**Security Documentation:**

- **[SECURITY_RULES.md](SECURITY_RULES.md)** - Security rules guide
- **[SECURITY_RULES_REFERENCE.md](SECURITY_RULES_REFERENCE.md)** - Rules reference
- **[SECURITY_RULES_TESTING.md](SECURITY_RULES_TESTING.md)** - Testing guide

### Rate Limiting

Rate limiting is implemented for sensitive endpoints:

- Auth endpoints: 5 requests per 15 minutes
- File uploads: 10 requests per hour
- AI operations: 20 requests per hour

## Real-time Features

The backend implements real-time features using Firebase Realtime Database:

- **Presence Tracking**: User online/offline status
- **Notifications**: Real-time notification delivery
- **Application Updates**: Live application status updates

**Real-time Documentation:**

- **[REALTIME_DATABASE.md](REALTIME_DATABASE.md)** - Real-time features guide

## Monitoring & Logging

### Sentry Integration

Error tracking and performance monitoring with Sentry:

```typescript
import { captureException } from '@sentry/node';

try {
  // Your code
} catch (error) {
  captureException(error);
  throw error;
}
```

### Logging

Winston logger with daily rotation:

```typescript
import logger from './utils/logger';

logger.info('Info message');
logger.error('Error message', { error });
logger.warn('Warning message');
```

Logs are stored in `logs/` directory with daily rotation.

## Performance

### Caching Strategy

Redis caching for frequently accessed data:

```typescript
// Cache job listings for 5 minutes
const cacheKey = 'jobs:published';
const cached = await redisClient.get(cacheKey);

if (cached) {
  return JSON.parse(cached);
}

const jobs = await fetchJobs();
await redisClient.setEx(cacheKey, 300, JSON.stringify(jobs));
```

### Performance Optimization

- Firestore composite indexes for complex queries
- Redis caching for expensive operations
- Data denormalization for faster reads
- Batch operations for multiple writes

**Performance Documentation:**

- **[PERFORMANCE_COMPARISON.md](PERFORMANCE_COMPARISON.md)** - Performance analysis
- **[LOAD_TESTING.md](LOAD_TESTING.md)** - Load testing guide

## Deployment

### Docker

```bash
# Build image
docker build -t job-portal-backend .

# Run container
docker run -p 3001:3001 --env-file .env job-portal-backend
```

### Production

```bash
# Build
npm run build

# Start
NODE_ENV=production npm start
```

**Deployment Documentation:**

- **[DEPLOYMENT.md](../DEPLOYMENT.md)** - Complete deployment guide

## Development

### Code Style

```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format
```

### Git Hooks

Husky is configured for pre-commit hooks:

- Linting
- Type checking
- Tests

## Troubleshooting

### Firebase Connection Issues

```bash
# Test Firebase connection
ts-node src/scripts/test-firebase-connection.ts
```

### Redis Connection Issues

```bash
# Check Redis is running
docker-compose ps

# Restart Redis
docker-compose restart redis
```

### Common Errors

**"Firebase not initialized"**

- Check `FIREBASE_SERVICE_ACCOUNT` in `.env`
- Verify service account JSON is valid

**"Permission denied"**

- Check Firebase security rules
- Verify user authentication token
- Check custom claims for role-based access

**"Rate limit exceeded"**

- Wait for rate limit window to reset
- Check rate limiter configuration

## Contributing

1. Create a feature branch
2. Make your changes
3. Write tests
4. Run linting and tests
5. Submit pull request

## Scripts Reference

| Script                     | Description                |
| -------------------------- | -------------------------- |
| `npm run dev`              | Start development server   |
| `npm run build`            | Build for production       |
| `npm start`                | Start production server    |
| `npm test`                 | Run all tests              |
| `npm run test:coverage`    | Run tests with coverage    |
| `npm run test:load`        | Run load tests             |
| `npm run test:load:report` | Run load tests with report |
| `npm run test:security`    | Test security rules        |
| `npm run lint`             | Lint code                  |
| `npm run lint:fix`         | Fix linting issues         |
| `npm run format`           | Format code                |
| `npm run migrate:export`   | Export PostgreSQL data     |
| `npm run migrate:import`   | Import to Firebase         |
| `npm run migrate:verify`   | Verify migration           |
| `npm run migrate:rollback` | Rollback migration         |

## Documentation Index

### Setup & Configuration

- [DATABASE_SETUP.md](DATABASE_SETUP.md) - Database setup
- [QUICK_START.md](QUICK_START.md) - Quick start guide
- [FIRESTORE_INDEXES.md](FIRESTORE_INDEXES.md) - Index configuration

### Migration

- [MIGRATION_GUIDE.md](MIGRATION_GUIDE.md) - Migration guide
- [LOAD_TEST_SUMMARY.md](LOAD_TEST_SUMMARY.md) - Load testing summary

### Security

- [SECURITY_RULES.md](SECURITY_RULES.md) - Security rules
- [SECURITY_RULES_REFERENCE.md](SECURITY_RULES_REFERENCE.md) - Rules reference
- [SECURITY_RULES_TESTING.md](SECURITY_RULES_TESTING.md) - Testing guide

### Performance

- [LOAD_TESTING.md](LOAD_TESTING.md) - Load testing guide
- [QUICK_LOAD_TEST_GUIDE.md](QUICK_LOAD_TEST_GUIDE.md) - Quick reference
- [PERFORMANCE_COMPARISON.md](PERFORMANCE_COMPARISON.md) - Performance comparison

### Features

- [REALTIME_DATABASE.md](REALTIME_DATABASE.md) - Real-time features
- [ERROR_HANDLING_SUMMARY.md](ERROR_HANDLING_SUMMARY.md) - Error handling

### Testing

- [TESTING.md](TESTING.md) - Testing guide
- [src/**tests**/README.md](src/__tests__/README.md) - Test documentation

## Support

For issues or questions:

1. Check documentation above
2. Review error logs in `logs/` directory
3. Check Firebase Console for errors
4. Review Sentry for error tracking

## License

MIT License - See LICENSE file for details
