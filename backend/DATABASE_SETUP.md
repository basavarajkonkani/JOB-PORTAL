# Firebase Setup Guide

## Prerequisites

- Node.js 18+ installed
- Firebase account (free tier available)
- Firebase CLI installed: `npm install -g firebase-tools`

## Step-by-Step Setup

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Add project"
3. Enter project name (e.g., "jobportal")
4. Follow the setup wizard

### 2. Enable Firebase Services

In your Firebase project console:

#### Authentication

1. Go to Authentication > Sign-in method
2. Enable "Email/Password" provider
3. Save changes

#### Firestore Database

1. Go to Firestore Database
2. Click "Create database"
3. Start in production mode (we'll add security rules later)
4. Choose a location close to your users

#### Realtime Database

1. Go to Realtime Database
2. Click "Create database"
3. Start in locked mode
4. Choose a location

#### Cloud Storage

1. Go to Storage
2. Click "Get started"
3. Start in production mode
4. Choose a location

### 3. Get Service Account Key (Backend)

1. Go to Project Settings > Service Accounts
2. Click "Generate new private key"
3. Save the JSON file as `backend/firebase-service-account.json`
4. **Important**: Add this file to `.gitignore` (already done)

### 4. Get Web App Config (Frontend)

1. Go to Project Settings > General
2. Scroll to "Your apps"
3. Click "Add app" > Web (</>) icon
4. Register your app
5. Copy the Firebase configuration object

### 5. Configure Environment Variables

#### Backend (.env)

```env
PORT=3001
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key-change-in-production
FRONTEND_URL=http://localhost:3000

# Firebase Admin SDK - paste the entire service account JSON as a string
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"your-project-id",...}
```

#### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:3001

# Firebase Client SDK Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your-measurement-id
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your-project.firebaseio.com
```

### 6. Deploy Security Rules

Deploy Firestore, Storage, and Realtime Database security rules:

```bash
cd backend

# Login to Firebase
firebase login

# Initialize Firebase (if not already done)
firebase init

# Deploy all rules
npm run security:validate  # Validate rules first
./scripts/deploy-security-rules.sh
```

### 7. Create Firestore Indexes

Deploy composite indexes for efficient queries:

```bash
firebase deploy --only firestore:indexes
```

The indexes are defined in `backend/firestore.indexes.json`.

### 8. Verify Setup

Test the Firebase connection:

```bash
cd backend
npm run test:firebase
```

This will verify:

- Firebase Admin SDK initialization
- Firestore connection
- Authentication service
- Storage access
- Realtime Database connection

## Firebase Collections Structure

### Core Collections

- `users` - User authentication and profile data
- `candidateProfiles` - Candidate skills, experience, education
- `recruiterProfiles` - Recruiter information
- `organizations` - Company/organization data

### Jobs & Applications

- `jobs` - Job postings with search indexes
- `applications` - Job applications with AI scoring
- `resumes` - Resume metadata
  - `versions` (subcollection) - Resume versions

### Analytics

- `events` - User activity tracking
- `metricsCache` - Pre-calculated analytics

### Realtime Database Structure

```
/presence/{userId} - User online status
/notifications/{userId} - Real-time notifications
/applicationUpdates/{userId} - Application status updates
```

## Common Operations

### View Data in Console

1. Go to Firebase Console
2. Navigate to Firestore Database or Realtime Database
3. Browse collections and documents

### Query Data Programmatically

```typescript
import { firestore } from './config/firebase';

// Get all active jobs
const jobsSnapshot = await firestore.collection('jobs').where('status', '==', 'active').get();

// Get user by ID
const userDoc = await firestore.collection('users').doc(userId).get();
```

### Backup Data

```bash
# Export Firestore data
firebase firestore:export gs://your-bucket/backups/$(date +%Y%m%d)

# Import Firestore data
firebase firestore:import gs://your-bucket/backups/20240101
```

### Test Security Rules

```bash
cd backend
npm run test:security
```

## Troubleshooting

### Authentication Errors

If you get "permission denied" errors:

1. Check that Firebase Authentication is enabled
2. Verify the service account key is correct
3. Check security rules in Firebase Console

### Connection Issues

If Firebase won't connect:

1. Verify environment variables are set correctly
2. Check that the service account JSON is valid
3. Ensure Firebase services are enabled in console

### Security Rules Errors

If security rules fail:

1. Validate rules: `npm run security:validate`
2. Check Firebase Console for rule errors
3. Review the rules in `firestore.rules`, `storage.rules`, `database.rules.json`

### Quota Limits

Free tier limits:

- Firestore: 50K reads, 20K writes, 20K deletes per day
- Storage: 5GB total, 1GB downloads per day
- Realtime Database: 100 simultaneous connections, 1GB storage

Upgrade to Blaze (pay-as-you-go) for production use.

## Production Considerations

For production deployment:

1. **Security Rules**: Review and tighten security rules
2. **Indexes**: Ensure all composite indexes are deployed
3. **Backup Strategy**: Set up automated Firestore exports
4. **Monitoring**: Enable Firebase Performance Monitoring
5. **Budget Alerts**: Set up billing alerts in Google Cloud Console
6. **Environment Separation**: Use separate Firebase projects for dev/staging/prod

## Migration from PostgreSQL

If migrating from PostgreSQL:

1. Export PostgreSQL data:

   ```bash
   npm run migrate:export
   ```

2. Import to Firebase:

   ```bash
   npm run migrate:import
   ```

3. Verify migration:

   ```bash
   npm run migrate:verify
   ```

4. Rollback if needed:
   ```bash
   npm run migrate:rollback
   ```

See `MIGRATION_GUIDE.md` for detailed migration instructions.

## Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Data Model](https://firebase.google.com/docs/firestore/data-model)
- [Firebase Security Rules](https://firebase.google.com/docs/rules)
- [Firebase CLI Reference](https://firebase.google.com/docs/cli)
