# Firebase Integration Tests - Quick Reference

## Overview

Comprehensive integration tests for Firebase functionality covering authentication, data fetching, and real-time features.

## Test Files

| File                             | Tests | Coverage                               |
| -------------------------------- | ----- | -------------------------------------- |
| `firebase-auth.spec.ts`          | 8     | Authentication flows, token management |
| `firebase-data-fetching.spec.ts` | 8     | Firestore queries, API calls           |
| `firebase-realtime.spec.ts`      | 9     | Real-time notifications, presence      |

**Total**: 25 integration tests

## Quick Start

### Run All Firebase Tests

```bash
npm run test:e2e -- firebase
```

### Run Specific Test Suite

```bash
# Authentication tests
npm run test:e2e -- firebase-auth.spec.ts

# Data fetching tests
npm run test:e2e -- firebase-data-fetching.spec.ts

# Real-time features tests
npm run test:e2e -- firebase-realtime.spec.ts
```

### Debug Tests

```bash
# Interactive UI mode
npm run test:e2e:ui

# Watch browser actions
npm run test:e2e:headed -- firebase

# Step-by-step debugging
npm run test:e2e:debug -- firebase-auth.spec.ts
```

### View Results

```bash
npm run test:e2e:report
```

## Prerequisites

### 1. Backend API Running

```bash
cd backend
npm run dev
```

Should be accessible at `http://localhost:3001`

### 2. Firebase Configuration

Ensure `frontend/.env.local` has:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your_project.firebaseio.com
```

### 3. Firebase Services Enabled

- ✅ Firebase Authentication (email/password provider)
- ✅ Cloud Firestore
- ✅ Realtime Database
- ✅ Security rules deployed

## What's Tested

### Authentication (firebase-auth.spec.ts)

- ✅ User signup with email/password
- ✅ User signin
- ✅ Auth state persistence across reloads
- ✅ Invalid credentials handling
- ✅ Sign out functionality
- ✅ Automatic token refresh
- ✅ Duplicate email prevention

### Data Fetching (firebase-data-fetching.spec.ts)

- ✅ Profile data from Firestore
- ✅ Jobs list queries
- ✅ Applications queries
- ✅ API calls with Firebase tokens
- ✅ Error handling
- ✅ Dashboard data aggregation
- ✅ Search and filtering
- ✅ Pagination

### Real-time Features (firebase-realtime.spec.ts)

- ✅ Real-time notifications
- ✅ Application status updates
- ✅ User presence tracking
- ✅ Notification banners
- ✅ Listener cleanup
- ✅ Multi-tab sync
- ✅ Connection error handling
- ✅ Notification badges
- ✅ Live UI updates

## Test Data

Tests automatically create unique test users:

- `firebase-auth-{timestamp}@test.com`
- `firebase-data-{timestamp}@test.com`
- `firebase-realtime-candidate-{timestamp}@test.com`

No manual cleanup needed!

## CI/CD Integration

Tests are configured for CI/CD with:

- Automatic retries on failure (2 retries in CI)
- Screenshot capture on failure
- HTML report generation
- Parallel execution disabled for Firebase consistency

### GitHub Actions Example

```yaml
- name: Run Firebase Integration Tests
  run: |
    cd frontend
    npm run test:e2e -- firebase
```

## Troubleshooting

### "Network error" or timeouts

- ✅ Check backend is running on port 3001
- ✅ Verify Firebase config in `.env.local`
- ✅ Check Firebase Console for service status

### Authentication tests failing

- ✅ Enable email/password provider in Firebase Console
- ✅ Check Firebase Auth security settings
- ✅ Verify API endpoint is accessible

### Real-time tests not working

- ✅ Create Realtime Database in Firebase Console
- ✅ Deploy database security rules
- ✅ Verify database URL in config

### Tests are slow

- ✅ Normal - Playwright starts browser and dev server
- ✅ Use `reuseExistingServer: true` in config
- ✅ Run specific test files instead of all tests

## Best Practices

1. **Run tests before committing** to catch Firebase integration issues
2. **Check test report** after failures for screenshots and traces
3. **Use headed mode** when debugging to see browser actions
4. **Run specific suites** during development for faster feedback
5. **Keep Firebase config updated** when switching projects

## Requirements Coverage

These tests fulfill Firebase migration requirements:

- ✅ **13.1**: Firebase Authentication integration
- ✅ **13.2**: API client with Firebase ID tokens
- ✅ **13.3**: Direct Firestore queries
- ✅ **13.4**: Realtime Database listeners
- ✅ **13.5**: Auth context integration

## Additional Resources

- [Playwright Documentation](https://playwright.dev)
- [Firebase Testing Guide](https://firebase.google.com/docs/rules/unit-tests)
- [Test Implementation Details](./e2e/firebase-integration-tests.md)

## Support

For issues or questions:

1. Check test output and screenshots
2. Review Firebase Console for errors
3. Verify environment configuration
4. Check backend API logs
