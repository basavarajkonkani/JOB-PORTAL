# Firebase Security Rules Documentation

This document describes the security rules implemented for the AI Job Portal Firebase migration.

## Overview

Security rules have been implemented for three Firebase services:

- **Firestore Database**: Document-level security for structured data
- **Cloud Storage**: File-level security for uploads (resumes, avatars, etc.)
- **Realtime Database**: Real-time data security for live features

## Deployment Status

### ✅ Successfully Deployed

- **Firestore Rules**: Deployed and active
- **Realtime Database Rules**: Deployed and active

### ⚠️ Pending Setup

- **Cloud Storage Rules**: Requires Firebase Storage to be initialized in the Firebase Console
  - Go to: https://console.firebase.google.com/project/jobportal-7918a/storage
  - Click "Get Started" to enable Firebase Storage
  - After enabling, run: `firebase deploy --only storage`

## Firestore Security Rules

### Collections Protected

#### 1. Users Collection (`/users/{userId}`)

- **Read**: Any authenticated user
- **Create**: Only the user themselves
- **Update**: Only the user themselves
- **Delete**: User themselves or admin

#### 2. Candidate Profiles (`/candidateProfiles/{userId}`)

- **Read**: Any authenticated user
- **Create**: Only the user themselves
- **Update**: Only the user themselves
- **Delete**: User themselves or admin

#### 3. Recruiter Profiles (`/recruiterProfiles/{userId}`)

- **Read**: Any authenticated user
- **Create**: Only recruiters creating their own profile
- **Update**: User themselves or admin
- **Delete**: User themselves or admin

#### 4. Organizations (`/organizations/{orgId}`)

- **Read**: Any authenticated user
- **Create**: Recruiters or admins
- **Update**: Recruiters or admins
- **Delete**: Admins only

#### 5. Jobs (`/jobs/{jobId}`)

- **Read**: Public (unauthenticated access allowed)
- **Create**: Recruiters only (must set createdBy to their own UID)
- **Update**: Only the recruiter who created the job
- **Delete**: Job creator or admin

#### 6. Applications (`/applications/{applicationId}`)

- **Read**:
  - Candidate who submitted the application
  - Recruiter who created the job
- **Create**: Authenticated candidates only (must be for their own userId)
- **Update**: Recruiter who created the job, or admin
- **Delete**: Admins only

#### 7. Resumes (`/resumes/{resumeId}`)

- **Read**: Owner only
- **Create**: Owner only
- **Update**: Owner only
- **Delete**: Owner only
- **Subcollection** (`/versions/{versionId}`): Same owner-only access

#### 8. Events (`/events/{eventId}`)

- **Read**: Admins only
- **Create**: Any authenticated user
- **Update/Delete**: Admins only

#### 9. Metrics Cache (`/metricsCache/{metricId}`)

- **Read**: Any authenticated user
- **Write**: Admins only

### Helper Functions

```javascript
function isAuthenticated() {
  return request.auth != null;
}

function isOwner(userId) {
  return isAuthenticated() && request.auth.uid == userId;
}

function hasRole(role) {
  return isAuthenticated() && request.auth.token.role == role;
}

function isRecruiterOrAdmin() {
  return hasRole('recruiter') || hasRole('admin');
}
```

## Cloud Storage Security Rules

### Paths Protected

#### 1. Resumes (`/resumes/{userId}/{fileName}`)

- **Read**: Owner only
- **Create**: Owner only (max 10MB, PDF/DOC/DOCX only)
- **Update**: Owner only
- **Delete**: Owner only

#### 2. Avatars (`/avatars/{userId}/{fileName}`)

- **Read**: Any authenticated user
- **Create**: Owner only (max 5MB, images only)
- **Update**: Owner only
- **Delete**: Owner only

#### 3. Organization Logos (`/organizations/{orgId}/{fileName}`)

- **Read**: Public access
- **Create**: Recruiters or admins (max 5MB, images only)
- **Update**: Recruiters or admins
- **Delete**: Admins only

#### 4. Job Attachments (`/jobs/{jobId}/{fileName}`)

- **Read**: Any authenticated user
- **Create**: Recruiters only (max 10MB)
- **Update**: Recruiters only
- **Delete**: Recruiters or admins

### File Validation

```javascript
// File size validation
function isValidFileSize(maxSizeMB) {
  return request.resource.size < maxSizeMB * 1024 * 1024;
}

// Image type validation
function isValidImageType() {
  return request.resource.contentType.matches('image/.*');
}

// Resume type validation
function isValidResumeType() {
  return (
    request.resource.contentType.matches('application/pdf') ||
    request.resource.contentType.matches('application/msword') ||
    request.resource.contentType.matches(
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    )
  );
}
```

## Realtime Database Security Rules

### Paths Protected

#### 1. Presence (`/presence/{userId}`)

- **Read**: Any authenticated user
- **Write**: User themselves only
- **Validation**: Must have `online` (boolean) and `lastSeen` (number)

#### 2. Notifications (`/notifications/{userId}/{notificationId}`)

- **Read**: User themselves only
- **Write**: User themselves, admins, or recruiters
- **Validation**: Must have `type`, `title`, `message`, `read`, `timestamp`
- **Field Limits**:
  - type: max 100 chars
  - title: max 200 chars
  - message: max 1000 chars

#### 3. Application Updates (`/applicationUpdates/{userId}/{applicationId}`)

- **Read**: User themselves only
- **Write**: Recruiters or admins only
- **Validation**: Must have `status`, `updatedAt`, `jobTitle`
- **Status Values**: pending, reviewing, shortlisted, rejected, accepted

#### 4. Active Recruiters (`/activeRecruiters/{jobId}/{recruiterId}`)

- **Read**: Recruiters or admins
- **Write**: Recruiters or admins
- **Validation**: Must have `name` and `lastActive`

#### 5. Typing Indicators (`/typing/{conversationId}/{userId}`)

- **Read**: Any authenticated user
- **Write**: Any authenticated user
- **Validation**: Must be boolean

## Deployment Commands

### Deploy All Rules

```bash
cd backend
./scripts/deploy-security-rules.sh
```

### Deploy Individual Services

```bash
# Firestore rules and indexes
firebase deploy --only firestore

# Storage rules (after enabling Storage in console)
firebase deploy --only storage

# Realtime Database rules
firebase deploy --only database
```

### Verify Deployment

```bash
cd backend
./scripts/verify-security-rules.sh
```

### View Current Rules

```bash
# View Firestore rules
firebase firestore:rules:get

# View Storage rules
firebase storage:rules:get

# View Realtime Database rules
firebase database:get /.settings/rules
```

## Testing Security Rules

### Firestore Rules Testing

You can test Firestore rules in the Firebase Console:

1. Go to: https://console.firebase.google.com/project/jobportal-7918a/firestore/rules
2. Click on "Rules Playground"
3. Test different scenarios with various authentication states

### Manual Testing Checklist

- [ ] Unauthenticated users cannot read user profiles
- [ ] Users can only update their own profiles
- [ ] Candidates cannot update other candidates' applications
- [ ] Recruiters can only update applications for their jobs
- [ ] Public can read job listings without authentication
- [ ] Users cannot read other users' resumes
- [ ] Presence updates only work for the authenticated user
- [ ] Notifications are only readable by the recipient

## Security Best Practices

1. **Authentication Required**: Most operations require authentication
2. **Owner-Based Access**: Users can only modify their own data
3. **Role-Based Access**: Admins and recruiters have elevated permissions
4. **Data Validation**: All writes are validated for correct structure
5. **File Size Limits**: Uploads are limited to prevent abuse
6. **File Type Validation**: Only allowed file types can be uploaded
7. **Timestamp Validation**: Prevents backdating or future-dating
8. **Default Deny**: All unspecified paths are denied by default

## Troubleshooting

### Rules Not Taking Effect

- Wait 1-2 minutes after deployment for rules to propagate
- Clear browser cache and refresh
- Check Firebase Console for deployment status

### Permission Denied Errors

- Verify user is authenticated
- Check user has correct role in custom claims
- Verify document ownership matches user ID
- Check field validation requirements

### Storage Rules Not Deploying

- Ensure Firebase Storage is enabled in console
- Check storage bucket exists
- Verify .firebaserc has correct project ID

## Console Links

- **Firestore Rules**: https://console.firebase.google.com/project/jobportal-7918a/firestore/rules
- **Storage Rules**: https://console.firebase.google.com/project/jobportal-7918a/storage/rules
- **Database Rules**: https://console.firebase.google.com/project/jobportal-7918a/database/rules
- **Project Overview**: https://console.firebase.google.com/project/jobportal-7918a/overview

## Next Steps

1. ✅ Firestore rules deployed
2. ✅ Realtime Database rules deployed
3. ⚠️ Enable Firebase Storage in console
4. ⚠️ Deploy Storage rules after enabling
5. ⚠️ Test all security rules with different user roles
6. ⚠️ Monitor Firebase Console for security violations
