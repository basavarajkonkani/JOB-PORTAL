# Quick Start Guide

## Firebase Setup (First Time)

```bash
# 1. Create Firebase project at https://console.firebase.google.com
# 2. Enable Authentication, Firestore, Realtime Database, and Storage
# 3. Download service account key and save as firebase-service-account.json

# 4. Navigate to backend
cd backend

# 5. Install dependencies (if not done)
npm install

# 6. Configure environment variables
cp .env.example .env
# Edit .env and add your Firebase service account JSON

# 7. Deploy security rules
firebase login
./scripts/deploy-security-rules.sh

# 8. Deploy Firestore indexes
firebase deploy --only firestore:indexes
```

## Test Credentials

Create test users through the application signup flow or Firebase Console.

## Available Commands

```bash
# Development
npm run dev                # Start development server
npm run build              # Build for production
npm start                  # Run production build

# Testing
npm test                   # Run all tests
npm run test:watch         # Run tests in watch mode
npm run test:coverage      # Generate coverage report
npm run test:security      # Test security rules

# Code Quality
npm run lint               # Check code style
npm run lint:fix           # Fix code style issues
npm run format             # Format code with Prettier

# Security Rules
npm run security:validate  # Validate security rules
./scripts/deploy-security-rules.sh  # Deploy rules
```

## Firebase Services

### Firestore Collections

- `users` - User profiles and authentication data
- `candidateProfiles` - Candidate skills and experience
- `recruiterProfiles` - Recruiter information
- `organizations` - Company data
- `jobs` - Job postings
- `applications` - Job applications
- `resumes` - Resume metadata with versions subcollection
- `events` - Analytics events
- `metricsCache` - Cached analytics

### Realtime Database

- `/presence/{userId}` - User online status
- `/notifications/{userId}` - Real-time notifications
- `/applicationUpdates/{userId}` - Application status updates

### Cloud Storage

- `/resumes/{userId}/` - Resume files
- `/avatars/{userId}/` - User avatars

## Project Structure

```
backend/
├── src/
│   ├── config/           # Firebase and Redis config
│   ├── models/           # Firestore data models
│   ├── routes/           # API endpoints
│   ├── services/         # Business logic
│   ├── middleware/       # Auth and error handling
│   ├── utils/            # Helper functions
│   ├── scripts/          # Migration and utility scripts
│   └── index.ts          # Application entry point
├── firestore.rules       # Firestore security rules
├── storage.rules         # Storage security rules
├── database.rules.json   # Realtime DB security rules
├── firestore.indexes.json # Composite indexes
├── .env                  # Environment variables
└── package.json          # Dependencies and scripts
```

## What's Been Implemented

### Firebase Integration

- ✅ Firebase Admin SDK configuration
- ✅ Firebase Authentication with custom claims
- ✅ Firestore data models for all entities
- ✅ Cloud Storage for file uploads
- ✅ Realtime Database for live features
- ✅ Security rules for all services
- ✅ Composite indexes for efficient queries

### API Features

- ✅ Authentication (signup, signin, token verification)
- ✅ User profiles (candidate and recruiter)
- ✅ Job management (CRUD, search, filters)
- ✅ Application tracking
- ✅ Resume upload and parsing
- ✅ AI-powered features (resume enhancement, cover letters, JD generation)
- ✅ Real-time notifications
- ✅ Analytics and metrics

## Accessing Firebase Data

### Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Navigate to Firestore Database, Authentication, Storage, or Realtime Database

### Programmatically

```typescript
import { firestore } from './config/firebase';

// Query Firestore
const jobsSnapshot = await firestore.collection('jobs').where('status', '==', 'active').get();

// Get document by ID
const userDoc = await firestore.collection('users').doc(userId).get();
```

## Next Steps

1. ✅ Firebase migration completed
2. ✅ All core features implemented
3. 🔄 Continue with additional features or optimizations

## Need Help?

- See `DATABASE_SETUP.md` for detailed Firebase setup
- See `MIGRATION_GUIDE.md` for PostgreSQL to Firebase migration
- See `SECURITY_RULES.md` for security rules documentation
- See `FIRESTORE_INDEXES.md` for index configuration
- See `REALTIME_DATABASE.md` for real-time features

## Troubleshooting

### Firebase Connection Issues

```bash
# Test Firebase connection
npm run test:firebase

# Check environment variables
cat .env | grep FIREBASE

# Verify service account
cat firebase-service-account.json
```

### Security Rules Errors

```bash
# Validate rules
npm run security:validate

# Check Firebase Console for errors
# Go to Firestore > Rules tab
```

### Index Errors

```bash
# Deploy indexes
firebase deploy --only firestore:indexes

# Check Firebase Console for index status
# Go to Firestore > Indexes tab
```
