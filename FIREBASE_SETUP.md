# Firebase Setup Guide

This guide explains how to configure Firebase for the AI Job Portal application.

## Overview

The application uses Firebase services for:

- **Firebase Authentication**: User authentication and authorization
- **Cloud Firestore**: NoSQL database for structured data
- **Cloud Storage**: File storage for resumes and avatars
- **Realtime Database**: Real-time updates for notifications and presence

## Prerequisites

1. A Firebase project (already created: `jobportal-7918a`)
2. Firebase service account credentials
3. Node.js and npm installed

## Configuration Steps

### 1. Backend Configuration

The backend uses Firebase Admin SDK for server-side operations.

#### Required Environment Variables

Add the following to `backend/.env`:

```bash
# Firebase Service Account (JSON as string)
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"jobportal-7918a",...}

# Firebase Storage Bucket
FIREBASE_STORAGE_BUCKET=jobportal-7918a.firebasestorage.app

# Firebase Realtime Database URL
FIREBASE_DATABASE_URL=https://jobportal-7918a-default-rtdb.firebaseio.com
```

#### Getting Service Account Credentials

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (`jobportal-7918a`)
3. Go to Project Settings > Service Accounts
4. Click "Generate New Private Key"
5. Download the JSON file
6. Convert the entire JSON to a single-line string and set as `FIREBASE_SERVICE_ACCOUNT`

**Important**: Keep the service account JSON secure and never commit it to version control.

### 2. Frontend Configuration

The frontend uses Firebase Client SDK for client-side operations.

#### Required Environment Variables

Add the following to `frontend/.env.local`:

```bash
# Firebase Client Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDv3qvDywNjL7sId8lL6ej-y7ucd-Rl_2M
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=jobportal-7918a.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=jobportal-7918a
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=jobportal-7918a.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=486520425901
NEXT_PUBLIC_FIREBASE_APP_ID=1:486520425901:web:c6c116a49dd706286a2524
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-PMZYC4JBDG
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://jobportal-7918a-default-rtdb.firebaseio.com
```

**Note**: These are public configuration values and are safe to include in client-side code.

### 3. Docker Configuration

For Docker deployments, set the environment variables in your `.env` file at the project root:

```bash
# Backend Firebase Configuration
FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...}
FIREBASE_STORAGE_BUCKET=jobportal-7918a.firebasestorage.app
FIREBASE_DATABASE_URL=https://jobportal-7918a-default-rtdb.firebaseio.com

# Frontend Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDv3qvDywNjL7sId8lL6ej-y7ucd-Rl_2M
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=jobportal-7918a.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=jobportal-7918a
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=jobportal-7918a.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=486520425901
NEXT_PUBLIC_FIREBASE_APP_ID=1:486520425901:web:c6c116a49dd706286a2524
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-PMZYC4JBDG
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://jobportal-7918a-default-rtdb.firebaseio.com
```

## Verification

### Backend Verification

Test the Firebase connection:

```bash
cd backend
npm install
ts-node src/scripts/test-firebase-connection.ts
```

Expected output:

```
=== Firebase Connection Test ===

Step 1: Checking environment variables...
✅ All required environment variables are set

Step 2: Initializing Firebase...
✅ Firebase initialized successfully

Step 3: Validating Firebase service connections...
✅ All Firebase services validated successfully

=== Test Completed Successfully ===
```

### Frontend Verification

The frontend will automatically validate Firebase configuration on initialization. Check the browser console for:

```
Firebase initialized successfully { projectId: 'jobportal-7918a', ... }
All Firebase services are accessible
```

### Health Check Endpoint

Once the backend is running, check the health endpoint:

```bash
curl http://localhost:3001/health
```

The response should include:

```json
{
  "status": "healthy",
  "firebase": "connected",
  ...
}
```

## Troubleshooting

### Common Issues

#### 1. "FIREBASE_SERVICE_ACCOUNT environment variable is not set"

**Solution**: Ensure the service account JSON is properly set in your `.env` file. The entire JSON should be on a single line.

#### 2. "Invalid service account: missing required fields"

**Solution**: Verify the service account JSON contains all required fields:

- `project_id`
- `private_key`
- `client_email`

#### 3. "Firebase connection validation failed"

**Solution**:

- Check your internet connection
- Verify the Firebase project exists and is active
- Ensure the service account has the necessary permissions
- Check Firebase Console for any service outages

#### 4. Frontend: "Missing required Firebase configuration"

**Solution**: Ensure all `NEXT_PUBLIC_FIREBASE_*` environment variables are set in `frontend/.env.local`

### Debugging

Enable detailed logging:

```bash
# Backend
LOG_LEVEL=debug npm run dev

# Check logs
tail -f logs/combined.log
```

## Security Best Practices

1. **Never commit credentials**: Add `.env` files to `.gitignore`
2. **Use environment-specific configs**: Different credentials for dev/staging/prod
3. **Rotate service accounts**: Regularly generate new service account keys
4. **Restrict permissions**: Use least-privilege principle for service accounts
5. **Monitor usage**: Set up Firebase usage alerts and quotas

## Firebase Console Access

- **Project URL**: https://console.firebase.google.com/project/jobportal-7918a
- **Authentication**: https://console.firebase.google.com/project/jobportal-7918a/authentication
- **Firestore**: https://console.firebase.google.com/project/jobportal-7918a/firestore
- **Storage**: https://console.firebase.google.com/project/jobportal-7918a/storage
- **Realtime Database**: https://console.firebase.google.com/project/jobportal-7918a/database

## Next Steps

After completing the Firebase setup:

1. ✅ Task 1: Set up Firebase configuration (Complete)
2. ⏭️ Task 2: Implement Firebase Authentication system
3. ⏭️ Task 3: Migrate data models to Firestore
4. ⏭️ Task 4: Implement Cloud Storage for file uploads
5. ⏭️ Task 5: Set up Realtime Database for live features

## Support

For issues or questions:

- Check Firebase documentation: https://firebase.google.com/docs
- Review Firebase status: https://status.firebase.google.com/
- Check application logs for detailed error messages
