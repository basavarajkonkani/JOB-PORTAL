# Firebase Security Rules Testing Guide

## Overview

This guide explains how to test Firebase security rules for Firestore, Cloud Storage, and Realtime Database. The security rules tests verify authentication requirements, role-based access control (RBAC), and owner-only access restrictions.

## Prerequisites

1. **Firebase CLI**: Install the Firebase CLI globally

   ```bash
   npm install -g firebase-tools
   ```

2. **Firebase Emulators**: Initialize emulators for your project

   ```bash
   firebase init emulators
   ```

   Select: Firestore, Realtime Database, and Storage emulators

3. **Testing Library**: Install Firebase testing utilities
   ```bash
   npm install --save-dev @firebase/rules-unit-testing
   ```

## Running Security Rules Tests

### Step 1: Start Firebase Emulators

Start all required emulators:

```bash
firebase emulators:start --only firestore,storage,database
```

Or start in the background:

```bash
firebase emulators:start --only firestore,storage,database &
```

### Step 2: Run Tests

Run the security rules tests:

```bash
npm test -- security-rules.test.ts
```

### Step 3: Stop Emulators

Stop the emulators when done:

```bash
firebase emulators:stop
```

## Test Coverage

The security rules tests cover the following areas:

### 1. Authentication Requirements

- **Firestore**: Verifies that unauthenticated users cannot access protected collections
- **Storage**: Verifies that unauthenticated users cannot access private files
- **Realtime Database**: Verifies that unauthenticated users cannot access presence, notifications, or application updates

### 2. Role-Based Access Control (RBAC)

#### Candidate Role

- Can create and update their own candidate profile
- Can create job applications
- Can read their own applications
- Cannot create jobs or recruiter profiles
- Cannot read other candidates' applications

#### Recruiter Role

- Can create and update jobs
- Can create organizations
- Can create recruiter profiles
- Can read applications for their own jobs only
- Can update application status for their jobs
- Cannot read applications for other recruiters' jobs

#### Admin Role

- Can delete any user, job, or application
- Can read events collection
- Can write to metrics cache
- Can delete organization logos
- Has elevated permissions across all collections

### 3. Owner-Only Access Restrictions

#### User Data

- Users can read and update their own user document
- Users cannot update other users' documents
- Users can delete their own account (with admin override)

#### Profiles

- Users can update their own candidate or recruiter profile
- Users cannot update other users' profiles
- Admins can update any profile

#### Resumes

- Users can only read, upload, and delete their own resumes
- Resume files are strictly private to the owner
- Resume versions follow the same ownership rules

#### Presence Data

- Users can update their own presence status
- All authenticated users can read presence data
- Users cannot modify other users' presence

#### Notifications

- Users can only read their own notifications
- Users can mark their own notifications as read
- Recruiters and admins can create notifications for users

#### Application Updates

- Users can only read their own application updates
- Recruiters can write application updates for candidates

### 4. File Validation (Storage)

#### Resume Files

- Allowed types: PDF, DOC, DOCX
- Maximum size: 10MB
- Must be uploaded to user's own folder

#### Avatar Files

- Allowed types: Image files (JPEG, PNG, GIF, etc.)
- Maximum size: 5MB
- Must be uploaded to user's own folder

#### Organization Logos

- Allowed types: Image files
- Maximum size: 5MB
- Can be uploaded by recruiters and admins

### 5. Data Validation (Realtime Database)

#### Presence Data

- `online`: Must be boolean
- `lastSeen`: Must be number, cannot be in the future
- `currentPage`: Must be string, max 500 characters
- No additional fields allowed

#### Notifications

- Required fields: `type`, `title`, `message`, `read`, `timestamp`
- `type`: String, 1-100 characters
- `title`: String, 1-200 characters
- `message`: String, 1-1000 characters
- `read`: Boolean
- `timestamp`: Number, max 1 minute in the future

#### Application Updates

- Required fields: `status`, `updatedAt`, `jobTitle`
- `status`: Must be one of: pending, reviewing, shortlisted, rejected, accepted
- `updatedAt`: Number, max 1 minute in the future
- `jobTitle`: String, 1-500 characters

## Implementation with Firebase Emulators

To implement actual tests that run against Firebase emulators, update the test file to use `@firebase/rules-unit-testing`:

```typescript
import {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
  RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import { readFileSync } from 'fs';

let testEnv: RulesTestEnvironment;

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: 'test-project',
    firestore: {
      rules: readFileSync('firestore.rules', 'utf8'),
    },
    storage: {
      rules: readFileSync('storage.rules', 'utf8'),
    },
    database: {
      rules: readFileSync('database.rules.json', 'utf8'),
    },
  });
});

afterAll(async () => {
  await testEnv.cleanup();
});

afterEach(async () => {
  await testEnv.clearFirestore();
  await testEnv.clearStorage();
  await testEnv.clearDatabase();
});

// Example test
it('should deny unauthenticated access to users collection', async () => {
  const unauthedDb = testEnv.unauthenticatedContext().firestore();
  await assertFails(unauthedDb.collection('users').doc('user1').get());
});

it('should allow authenticated users to read their own user document', async () => {
  const authedDb = testEnv.authenticatedContext('user1').firestore();
  await assertSucceeds(authedDb.collection('users').doc('user1').get());
});
```

## Continuous Integration

Add security rules testing to your CI/CD pipeline:

```yaml
# .github/workflows/security-rules-test.yml
name: Security Rules Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install -g firebase-tools
      - run: npm install
      - run: firebase emulators:exec --only firestore,storage,database "npm test -- security-rules.test.ts"
```

## Manual Testing

You can also manually test security rules using the Firebase Emulator UI:

1. Start emulators: `firebase emulators:start`
2. Open the Emulator UI: http://localhost:4000
3. Navigate to the Firestore, Storage, or Realtime Database tabs
4. Try operations with different authentication states
5. Verify that rules are enforced correctly

## Troubleshooting

### Emulators Not Starting

- Check if ports 8080, 9000, 9199 are available
- Try specifying custom ports in `firebase.json`

### Rules Not Loading

- Verify `firebase.json` points to correct rules files
- Check rules syntax with `firebase deploy --only firestore:rules --dry-run`

### Tests Failing

- Ensure emulators are running before tests
- Clear emulator data between test runs
- Check that test authentication tokens include correct custom claims

## Best Practices

1. **Test Early**: Write security rules tests before deploying to production
2. **Test Often**: Run tests on every code change
3. **Test Thoroughly**: Cover all authentication states and roles
4. **Test Edge Cases**: Test boundary conditions and invalid inputs
5. **Keep Rules Simple**: Complex rules are harder to test and maintain
6. **Document Rules**: Add comments explaining the purpose of each rule
7. **Version Control**: Keep rules in version control alongside code
8. **Monitor Production**: Use Firebase Console to monitor rule denials

## Resources

- [Firebase Security Rules Documentation](https://firebase.google.com/docs/rules)
- [Firebase Emulator Suite](https://firebase.google.com/docs/emulator-suite)
- [Rules Unit Testing](https://firebase.google.com/docs/rules/unit-tests)
- [Security Rules Best Practices](https://firebase.google.com/docs/rules/best-practices)
