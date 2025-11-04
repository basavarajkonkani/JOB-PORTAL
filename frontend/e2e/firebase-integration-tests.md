# Firebase Integration Tests

This directory contains comprehensive integration tests for Firebase functionality in the frontend application.

## Test Files

### 1. `firebase-auth.spec.ts`

Tests Firebase Authentication integration:

- ✅ User signup with Firebase Auth
- ✅ User signin with Firebase Auth
- ✅ Authentication state persistence across page reloads
- ✅ Invalid credentials error handling
- ✅ Sign out and auth state clearing
- ✅ Automatic Firebase token refresh
- ✅ Duplicate email prevention

**Requirements Covered**: 13.1, 13.2, 13.5

### 2. `firebase-data-fetching.spec.ts`

Tests data fetching operations with Firebase:

- ✅ Fetching user profile from Firestore
- ✅ Fetching jobs list from Firestore via API
- ✅ Fetching applications from Firestore
- ✅ API calls with Firebase ID token authentication
- ✅ Firestore query error handling
- ✅ Dashboard data aggregation from Firestore
- ✅ Job filtering and searching with Firestore queries
- ✅ Pagination through Firestore query results

**Requirements Covered**: 13.2, 13.3

### 3. `firebase-realtime.spec.ts`

Tests real-time features using Firebase Realtime Database:

- ✅ Real-time notifications reception
- ✅ Application status updates in real-time
- ✅ User presence status tracking
- ✅ Real-time notification banner display
- ✅ Real-time listener cleanup on navigation
- ✅ Data synchronization across multiple tabs
- ✅ Real-time connection error handling
- ✅ Notification count badge display
- ✅ UI updates when application status changes

**Requirements Covered**: 13.4

## Running the Tests

### Run all Firebase integration tests:

```bash
npm run test:e2e -- firebase
```

### Run specific test file:

```bash
npm run test:e2e -- firebase-auth.spec.ts
npm run test:e2e -- firebase-data-fetching.spec.ts
npm run test:e2e -- firebase-realtime.spec.ts
```

### Run in UI mode for debugging:

```bash
npm run test:e2e:ui
```

### Run in headed mode to see browser:

```bash
npm run test:e2e:headed -- firebase
```

## Test Environment Setup

The tests require:

1. **Backend API running** on `http://localhost:3001` (or configured `NEXT_PUBLIC_API_URL`)
2. **Frontend dev server** on `http://localhost:3000` (automatically started by Playwright)
3. **Firebase project** configured with:
   - Firebase Authentication enabled
   - Cloud Firestore database
   - Realtime Database
   - Security rules deployed

## Test Data

Tests create their own test users with unique email addresses using timestamps:

- `firebase-auth-{timestamp}@test.com`
- `firebase-data-{timestamp}@test.com`
- `firebase-realtime-candidate-{timestamp}@test.com`
- `firebase-realtime-recruiter-{timestamp}@test.com`

This ensures tests can run multiple times without conflicts.

## Coverage

These integration tests cover all requirements from the Firebase migration spec:

- **Requirement 13.1**: Firebase Authentication integration
  - User signup, signin, signout
  - Token management and refresh
  - Auth state persistence

- **Requirement 13.2**: API client with Firebase ID tokens
  - Authorization header with Bearer token
  - Automatic token refresh
  - Error handling

- **Requirement 13.3**: Direct Firestore queries
  - Profile data fetching
  - Jobs list queries
  - Applications queries
  - Filtering and pagination

- **Requirement 13.4**: Realtime Database listeners
  - Notifications
  - Application status updates
  - Presence tracking
  - Multi-tab synchronization

- **Requirement 13.5**: Auth context integration
  - Component updates with auth state
  - Protected routes
  - User data display

## Notes

- Tests use Playwright's built-in retry mechanism for flaky tests
- Screenshots are captured on failure for debugging
- Tests run sequentially to avoid race conditions with Firebase
- Each test is independent and creates its own test data
- Real-time tests may have slight delays due to Firebase propagation

## Troubleshooting

### Tests failing with "Network error"

- Ensure backend API is running
- Check Firebase configuration in `.env.local`
- Verify Firebase project has correct security rules

### Tests timing out

- Increase timeout in `playwright.config.ts`
- Check if Firebase services are responding
- Verify network connectivity

### Authentication tests failing

- Ensure Firebase Authentication is enabled in Firebase Console
- Check that email/password provider is enabled
- Verify security rules allow user creation

### Real-time tests not receiving updates

- Ensure Realtime Database is created in Firebase Console
- Check database security rules
- Verify database URL in configuration
