# End-to-End Tests

## Overview

This directory contains end-to-end (E2E) tests for the AI Job Portal using Playwright. These tests validate complete user journeys from the frontend through to the backend, ensuring all critical flows work correctly in a real browser environment.

## Test Suites

### 1. Candidate Onboarding (`candidate-onboarding.spec.ts`)

**User Journey**: signup → upload resume → view profile

Tests the complete onboarding experience for new candidates:

- User registration and authentication
- Resume file upload
- Resume parsing and profile data extraction
- Profile confirmation and completion
- Navigation to dashboard and profile pages

**Key Scenarios**:

- ✅ Complete onboarding flow with resume upload
- ✅ Error handling for invalid file types
- ✅ Skip onboarding option
- ✅ Manual profile entry fallback

### 2. Job Application (`job-application.spec.ts`)

**User Journey**: search → view detail → apply with AI cover letter

Tests the job search and application workflow:

- Job search with multiple filters (title, level, location, remote)
- Job listing pagination
- Job detail page with AI fit summary
- AI-generated hero images
- Application submission with AI cover letter
- Application tracking and status updates

**Key Scenarios**:

- ✅ Complete application flow with AI assistance
- ✅ Job search with filters
- ✅ Empty search results handling
- ✅ Save job for later
- ✅ Prevent duplicate applications
- ✅ Pagination navigation

### 3. Recruiter JD Creation (`recruiter-jd-creation.spec.ts`)

**User Journey**: login → create job with AI → publish

Tests the recruiter's job description creation workflow:

- Recruiter authentication
- JD wizard navigation
- AI-powered JD generation from notes
- Manual JD editing and refinement
- Hero banner image generation
- Job publishing
- Dashboard statistics

**Key Scenarios**:

- ✅ Complete JD creation with AI assistance
- ✅ Manual JD creation without AI
- ✅ Save job as draft
- ✅ Validation error handling
- ✅ Edit published jobs
- ✅ Dashboard statistics display

### 4. Shortlist Generation (`shortlist-generation.spec.ts`)

**User Journey**: view applicants → request AI ranking

Tests the recruiter's candidate evaluation workflow:

- View job applicants
- Request AI-powered candidate ranking
- Display AI scores and rationale
- Generate screening questions
- Filter and sort candidates
- Update candidate status

**Key Scenarios**:

- ✅ AI-powered shortlist generation
- ✅ Candidate filtering and sorting
- ✅ Candidate detail views
- ✅ Empty applicant list handling
- ✅ Status updates
- ✅ Job details display

## Prerequisites

### Required Services

Before running E2E tests, ensure the following services are running:

1. **PostgreSQL** (port 5432)

   ```bash
   docker-compose up -d postgres
   ```

2. **Redis** (port 6379)

   ```bash
   docker-compose up -d redis
   ```

3. **Backend API** (port 5000)

   ```bash
   cd backend
   npm run dev
   ```

4. **Frontend** (port 3000)
   ```bash
   cd frontend
   npm run dev
   ```

### Database Setup

Ensure database migrations are applied:

```bash
cd backend
npm run migrate:up
```

Optionally seed test data:

```bash
cd backend
npm run seed:dev
```

## Running Tests

### Install Dependencies

```bash
cd frontend
npm install
npx playwright install
```

### Run All Tests

```bash
npm run test:e2e
```

### Run Specific Test Suite

```bash
npx playwright test candidate-onboarding
npx playwright test job-application
npx playwright test recruiter-jd-creation
npx playwright test shortlist-generation
```

### Run in UI Mode (Interactive)

```bash
npx playwright test --ui
```

### Run in Debug Mode

```bash
npx playwright test --debug
```

### Run in Headed Mode (See Browser)

```bash
npx playwright test --headed
```

### Run Specific Test

```bash
npx playwright test -g "should complete full onboarding flow"
```

## Test Configuration

Configuration is defined in `playwright.config.ts`:

- **Base URL**: `http://localhost:3000` (configurable via `BASE_URL` env var)
- **Workers**: 1 (sequential execution to avoid conflicts)
- **Retries**: 2 in CI, 0 locally
- **Timeout**: 30 seconds per test
- **Screenshots**: On failure only
- **Trace**: On first retry
- **Browser**: Chromium (can be extended to Firefox, WebKit)

## Test Patterns

### Authentication

Tests create unique users for each run using timestamps:

```typescript
const testEmail = `candidate-${Date.now()}@test.com`;
```

### Waiting Strategies

Tests use multiple waiting strategies:

- `waitForURL()` - Wait for navigation
- `waitForTimeout()` - Fixed delays (use sparingly)
- `expect().toBeVisible()` - Wait for elements
- `waitForLoadState()` - Wait for network idle

### Error Handling

Tests include graceful fallbacks:

- Check if elements exist before interacting
- Use conditional logic for optional features
- Verify multiple possible outcomes

### Data Isolation

Each test suite creates its own test data to avoid conflicts:

- Unique email addresses per test run
- Independent job postings
- Separate applications

## Debugging

### View Test Report

After running tests:

```bash
npx playwright show-report
```

### View Traces

For failed tests with traces:

```bash
npx playwright show-trace trace.zip
```

### Screenshots

Failed test screenshots are saved to `test-results/` directory.

### Console Logs

Enable verbose logging:

```bash
DEBUG=pw:api npx playwright test
```

## CI/CD Integration

### GitHub Actions

Add to `.github/workflows/e2e.yml`:

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: |
          cd backend && npm ci
          cd ../frontend && npm ci
      - name: Run migrations
        run: cd backend && npm run migrate:up
      - name: Install Playwright
        run: cd frontend && npx playwright install --with-deps
      - name: Run E2E tests
        run: cd frontend && npm run test:e2e
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: frontend/playwright-report/
```

## Best Practices

### 1. Test Independence

Each test should be independent and not rely on other tests:

- Create necessary data in `beforeEach` or `beforeAll`
- Clean up after tests if needed
- Use unique identifiers to avoid conflicts

### 2. Resilient Selectors

Use stable selectors in order of preference:

1. `data-testid` attributes
2. ARIA labels and roles
3. Text content (with regex for flexibility)
4. CSS classes (least preferred)

### 3. Explicit Waits

Always wait for elements explicitly:

```typescript
await expect(element).toBeVisible({ timeout: 5000 });
```

### 4. Realistic User Behavior

Simulate real user interactions:

- Fill forms field by field
- Click buttons naturally
- Wait for feedback before proceeding

### 5. Error Scenarios

Test both happy paths and error cases:

- Invalid inputs
- Network failures
- Empty states
- Permission errors

## Maintenance

### Adding New Tests

1. Create new spec file in `e2e/` directory
2. Follow existing naming convention: `feature-name.spec.ts`
3. Document user journey in file header
4. Use consistent test structure
5. Update this README

### Updating Tests

When UI changes:

1. Update selectors to match new structure
2. Adjust wait times if needed
3. Update assertions for new content
4. Run tests locally before committing

### Performance

Keep tests fast:

- Minimize `waitForTimeout()` usage
- Use parallel execution where possible
- Mock external services if needed
- Optimize test data creation

## Troubleshooting

### Tests Timing Out

- Increase timeout in `playwright.config.ts`
- Check if services are running
- Verify network connectivity
- Look for infinite loading states

### Flaky Tests

- Add explicit waits
- Check for race conditions
- Verify element visibility before interaction
- Use `waitForLoadState('networkidle')`

### Element Not Found

- Verify selector is correct
- Check if element is in viewport
- Ensure page has loaded completely
- Use Playwright Inspector to debug

### Authentication Issues

- Clear browser storage between tests
- Verify JWT tokens are valid
- Check cookie settings
- Ensure backend is running

## Future Enhancements

Potential improvements:

1. **Visual Regression Testing**: Add screenshot comparison
2. **API Mocking**: Mock external AI services for faster tests
3. **Performance Testing**: Add Lighthouse CI integration
4. **Accessibility Testing**: Integrate axe-core for a11y checks
5. **Mobile Testing**: Add mobile viewport tests
6. **Cross-Browser**: Enable Firefox and WebKit testing
7. **Parallel Execution**: Optimize for parallel test runs
8. **Test Data Management**: Implement test data factories

## Resources

- [Playwright Documentation](https://playwright.dev/)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Debugging Guide](https://playwright.dev/docs/debug)
- [CI/CD Integration](https://playwright.dev/docs/ci)
