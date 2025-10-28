# Integration Tests

This directory contains integration tests for the AI Job Portal backend API.

## Test Coverage

The integration tests cover the following critical flows:

### 1. Authentication Flow (`auth.test.ts`)

- User signup with validation
- User signin with credentials
- Token refresh mechanism
- Complete auth flow (signup → signin → refresh)

### 2. Job Search and Application Flow (`jobs-applications.test.ts`)

- Job search with filters (title, level, location, remote)
- Job pagination
- Job detail retrieval
- Application submission
- Application tracking
- Complete candidate flow (search → view → apply → track)

### 3. Resume Upload and Parsing (`resume.test.ts`)

- Resume file upload to S3
- Resume parsing (PDF/DOCX)
- Resume version management
- Complete resume flow (upload → parse → retrieve)

### 4. AI Service Integration (`ai-service.test.ts`)

- Fit summary generation
- Cover letter generation
- Resume improvement suggestions
- Job description generation
- Candidate ranking
- Screening questions generation
- Image URL generation
- AI service caching
- Error handling and graceful degradation

### 5. Recruiter JD Creation and Shortlist (`recruiter.test.ts`)

- Job creation with AI-generated JD
- Manual job creation
- Job updates and hero image generation
- Job closure (soft delete)
- Recruiter dashboard statistics
- Candidate shortlist without AI
- Candidate shortlist with AI ranking
- Complete recruiter flow (create JD → publish → view candidates → rank)

## Prerequisites

Before running the tests, ensure you have:

1. **PostgreSQL** running locally with the database schema migrated
2. **Redis** running locally for caching
3. **Environment variables** configured (see `.env.test`)

## Running Tests

### Run all tests

```bash
npm test
```

### Run specific test file

```bash
npm test -- auth.test.ts
```

### Run tests with coverage

```bash
npm run test:coverage
```

### Run tests in watch mode

```bash
npm run test:watch
```

## Test Setup

The tests use the following setup:

- **Test Database**: Uses the same database as development but cleans up after each test
- **Mocked Services**:
  - S3 upload is mocked to avoid actual file uploads
  - Resume parser is mocked with sample data
  - AI service (Pollinations API) is mocked with predefined responses
  - Rate limiter is disabled for tests
- **Test Isolation**: Each test suite cleans the database before and after tests

## Test Structure

Each test file follows this structure:

1. **Setup**: Create test users, organizations, and initial data
2. **Test Cases**: Individual test scenarios with assertions
3. **Teardown**: Clean up database and close connections

## Mocking Strategy

The tests use Jest mocks for external dependencies:

- **S3 Client**: Mocked to return success without actual uploads
- **Resume Parser**: Mocked to return structured resume data
- **AI Service**: Mocked to return predefined AI responses
- **Rate Limiter**: Disabled to avoid rate limiting during tests

## Notes

- Tests run in band (`--runInBand`) to avoid database conflicts
- Each test has a 30-second timeout for async operations
- Database is cleaned between tests to ensure isolation
- Redis cache is cleared after all tests complete

## Troubleshooting

### Database Connection Errors

Ensure PostgreSQL is running and the database exists:

```bash
psql -U postgres -c "CREATE DATABASE job_portal;"
npm run migrate:up
```

### Redis Connection Errors

Ensure Redis is running:

```bash
redis-server
```

### Test Timeouts

Increase the timeout in jest.config.js or use `--testTimeout` flag:

```bash
npm test -- --testTimeout=60000
```

### Port Conflicts

If port 3001 is in use, update the PORT in `.env.test`
