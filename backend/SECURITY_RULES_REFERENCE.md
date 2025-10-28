# Firebase Security Rules Quick Reference

## Overview

This document provides a quick reference for the Firebase security rules implemented in the AI Job Portal.

## Rule Files

- **Firestore**: `firestore.rules`
- **Storage**: `storage.rules`
- **Realtime Database**: `database.rules.json`

## Authentication States

| State           | Description      | Access Level                            |
| --------------- | ---------------- | --------------------------------------- |
| Unauthenticated | No auth token    | Public read for jobs/logos only         |
| Authenticated   | Valid auth token | Read most collections                   |
| Candidate       | Role: candidate  | Create applications, manage own profile |
| Recruiter       | Role: recruiter  | Create jobs, manage applications        |
| Admin           | Role: admin      | Full access to all resources            |

## Firestore Collections

### Users (`/users/{userId}`)

| Operation | Candidate | Recruiter | Admin | Notes                      |
| --------- | --------- | --------- | ----- | -------------------------- |
| Read      | Own only  | Own only  | All   | Must be authenticated      |
| Create    | Own only  | Own only  | All   | userId must match auth.uid |
| Update    | Own only  | Own only  | All   | -                          |
| Delete    | Own only  | Own only  | All   | -                          |

### Candidate Profiles (`/candidateProfiles/{userId}`)

| Operation | Candidate | Recruiter | Admin | Notes                 |
| --------- | --------- | --------- | ----- | --------------------- |
| Read      | All       | All       | All   | Must be authenticated |
| Create    | Own only  | ❌        | All   | -                     |
| Update    | Own only  | ❌        | All   | -                     |
| Delete    | Own only  | ❌        | All   | -                     |

### Recruiter Profiles (`/recruiterProfiles/{userId}`)

| Operation | Candidate | Recruiter | Admin | Notes                    |
| --------- | --------- | --------- | ----- | ------------------------ |
| Read      | All       | All       | All   | Must be authenticated    |
| Create    | ❌        | Own only  | All   | Must have recruiter role |
| Update    | ❌        | Own only  | All   | -                        |
| Delete    | ❌        | Own only  | All   | -                        |

### Organizations (`/organizations/{orgId}`)

| Operation | Candidate | Recruiter | Admin | Notes                 |
| --------- | --------- | --------- | ----- | --------------------- |
| Read      | All       | All       | All   | Must be authenticated |
| Create    | ❌        | ✅        | ✅    | -                     |
| Update    | ❌        | ✅        | ✅    | -                     |
| Delete    | ❌        | ❌        | ✅    | Admin only            |

### Jobs (`/jobs/{jobId}`)

| Operation | Candidate | Recruiter    | Admin | Notes                         |
| --------- | --------- | ------------ | ----- | ----------------------------- |
| Read      | ✅        | ✅           | ✅    | Public read access            |
| Create    | ❌        | ✅           | ✅    | createdBy must match auth.uid |
| Update    | ❌        | Creator only | ✅    | Must be job creator           |
| Delete    | ❌        | Creator only | ✅    | Must be job creator or admin  |

### Applications (`/applications/{applicationId}`)

| Operation | Candidate | Recruiter    | Admin | Notes                              |
| --------- | --------- | ------------ | ----- | ---------------------------------- |
| Read      | Own only  | For own jobs | All   | Recruiters see apps for their jobs |
| Create    | ✅        | ❌           | ✅    | userId must match auth.uid         |
| Update    | ❌        | For own jobs | ✅    | Recruiters update status           |
| Delete    | ❌        | ❌           | ✅    | Admin only                         |

### Resumes (`/resumes/{resumeId}`)

| Operation | Candidate | Recruiter | Admin | Notes                      |
| --------- | --------- | --------- | ----- | -------------------------- |
| Read      | Own only  | ❌        | ❌    | Strict privacy             |
| Create    | Own only  | ❌        | ❌    | userId must match auth.uid |
| Update    | Own only  | ❌        | ❌    | -                          |
| Delete    | Own only  | ❌        | ❌    | -                          |

### Resume Versions (`/resumes/{resumeId}/versions/{versionId}`)

| Operation | Candidate  | Recruiter | Admin | Notes                  |
| --------- | ---------- | --------- | ----- | ---------------------- |
| Read      | Owner only | ❌        | ❌    | Must own parent resume |
| Create    | Owner only | ❌        | ❌    | -                      |
| Update    | Owner only | ❌        | ❌    | -                      |
| Delete    | Owner only | ❌        | ❌    | -                      |

### Events (`/events/{eventId}`)

| Operation | Candidate | Recruiter | Admin | Notes                   |
| --------- | --------- | --------- | ----- | ----------------------- |
| Read      | ❌        | ❌        | ✅    | Admin only              |
| Create    | ✅        | ✅        | ✅    | All authenticated users |
| Update    | ❌        | ❌        | ✅    | Admin only              |
| Delete    | ❌        | ❌        | ✅    | Admin only              |

### Metrics Cache (`/metricsCache/{metricId}`)

| Operation | Candidate | Recruiter | Admin | Notes                   |
| --------- | --------- | --------- | ----- | ----------------------- |
| Read      | ✅        | ✅        | ✅    | All authenticated users |
| Write     | ❌        | ❌        | ✅    | Admin only              |

## Cloud Storage

### Resume Files (`/resumes/{userId}/{fileName}`)

| Operation | Owner | Others | File Types     | Size Limit |
| --------- | ----- | ------ | -------------- | ---------- |
| Read      | ✅    | ❌     | -              | -          |
| Upload    | ✅    | ❌     | PDF, DOC, DOCX | 10MB       |
| Update    | ✅    | ❌     | PDF, DOC, DOCX | 10MB       |
| Delete    | ✅    | ❌     | -              | -          |

### Avatar Files (`/avatars/{userId}/{fileName}`)

| Operation | Owner | Authenticated | Public | File Types | Size Limit |
| --------- | ----- | ------------- | ------ | ---------- | ---------- |
| Read      | ✅    | ✅            | ❌     | -          | -          |
| Upload    | ✅    | ❌            | ❌     | Images     | 5MB        |
| Update    | ✅    | ❌            | ❌     | Images     | 5MB        |
| Delete    | ✅    | ❌            | ❌     | -          | -          |

### Organization Logos (`/organizations/{orgId}/{fileName}`)

| Operation | Recruiter | Admin | Public | File Types | Size Limit |
| --------- | --------- | ----- | ------ | ---------- | ---------- |
| Read      | ✅        | ✅    | ✅     | -          | -          |
| Upload    | ✅        | ✅    | ❌     | Images     | 5MB        |
| Update    | ✅        | ✅    | ❌     | Images     | 5MB        |
| Delete    | ❌        | ✅    | ❌     | -          | -          |

### Job Attachments (`/jobs/{jobId}/{fileName}`)

| Operation | Recruiter    | Authenticated | Public | Size Limit |
| --------- | ------------ | ------------- | ------ | ---------- |
| Read      | ✅           | ✅            | ❌     | -          |
| Upload    | ✅           | ❌            | ❌     | 10MB       |
| Update    | ✅           | ❌            | ❌     | 10MB       |
| Delete    | ✅ (+ Admin) | ❌            | ❌     | -          |

## Realtime Database

### Presence (`/presence/{userId}`)

| Operation | Owner | Others | Required Fields                     |
| --------- | ----- | ------ | ----------------------------------- |
| Read      | ✅    | ✅     | -                                   |
| Write     | ✅    | ❌     | online (boolean), lastSeen (number) |

**Validation Rules:**

- `online`: Must be boolean
- `lastSeen`: Must be number, cannot be in future
- `currentPage`: Optional string, max 500 chars
- No other fields allowed

### Notifications (`/notifications/{userId}/{notificationId}`)

| Operation | Owner | Recruiter/Admin | Others |
| --------- | ----- | --------------- | ------ |
| Read      | ✅    | ❌              | ❌     |
| Write     | ✅    | ✅              | ❌     |

**Validation Rules:**

- `type`: String, 1-100 chars (required)
- `title`: String, 1-200 chars (required)
- `message`: String, 1-1000 chars (required)
- `read`: Boolean (required)
- `timestamp`: Number, max 1 min in future (required)
- `data`: Optional object
- No other fields allowed

### Application Updates (`/applicationUpdates/{userId}/{applicationId}`)

| Operation | Owner | Recruiter/Admin | Others |
| --------- | ----- | --------------- | ------ |
| Read      | ✅    | ❌              | ❌     |
| Write     | ❌    | ✅              | ❌     |

**Validation Rules:**

- `status`: Enum (pending, reviewing, shortlisted, rejected, accepted) (required)
- `updatedAt`: Number, max 1 min in future (required)
- `jobTitle`: String, 1-500 chars (required)
- `jobId`: Optional string
- `applicationId`: Optional string
- No other fields allowed

### Active Recruiters (`/activeRecruiters/{jobId}/{recruiterId}`)

| Operation | Recruiter | Admin | Others |
| --------- | --------- | ----- | ------ |
| Read      | ✅        | ✅    | ❌     |
| Write     | ✅        | ✅    | ❌     |

**Validation Rules:**

- `name`: String, 1-200 chars (required)
- `lastActive`: Number, max 1 min in future (required)
- No other fields allowed

### Typing Indicators (`/typing/{conversationId}/{userId}`)

| Operation | Authenticated | Public |
| --------- | ------------- | ------ |
| Read      | ✅            | ❌     |
| Write     | ✅            | ❌     |

**Validation Rules:**

- Value must be boolean

## Helper Functions

### Firestore

```javascript
isAuthenticated(); // Check if user is authenticated
isOwner(userId); // Check if user owns the resource
hasRole(role); // Check if user has specific role
isRecruiterOrAdmin(); // Check if user is recruiter or admin
```

### Storage

```javascript
isAuthenticated(); // Check if user is authenticated
isOwner(userId); // Check if user owns the resource
hasRole(role); // Check if user has specific role
isValidFileSize(maxSizeMB); // Check file size limit
isValidImageType(); // Check if file is an image
isValidResumeType(); // Check if file is valid resume type
```

## Common Patterns

### Owner-Only Access

```javascript
allow read, write: if isOwner(resource.data.userId);
```

### Role-Based Access

```javascript
allow create: if hasRole('recruiter');
```

### Cross-Collection Access

```javascript
allow read: if hasRole('recruiter') &&
  get(/databases/$(database)/documents/jobs/$(resource.data.jobId)).data.createdBy == request.auth.uid;
```

### Public Read, Authenticated Write

```javascript
allow read: if true;
allow write: if isAuthenticated();
```

## Testing

Run security rules tests:

```bash
npm run test:security
```

Validate rules syntax:

```bash
npm run security:validate
```

Deploy rules:

```bash
./scripts/test-security-rules.sh deploy
```

## Best Practices

1. ✅ Always authenticate users before granting access
2. ✅ Use custom claims for role-based access control
3. ✅ Validate data types and field values
4. ✅ Limit file sizes and types in Storage rules
5. ✅ Use helper functions to keep rules DRY
6. ✅ Test rules thoroughly before deployment
7. ✅ Monitor rule denials in Firebase Console
8. ✅ Keep rules simple and maintainable
9. ✅ Document complex rules with comments
10. ✅ Version control all rules files

## Resources

- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Storage Security Rules](https://firebase.google.com/docs/storage/security)
- [Realtime Database Rules](https://firebase.google.com/docs/database/security)
- [Testing Guide](./SECURITY_RULES_TESTING.md)
