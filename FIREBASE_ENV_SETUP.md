# Firebase Environment Configuration Guide

This guide explains how to configure Firebase environment variables for the AI Job Portal application after the PostgreSQL to Firebase migration.

## Overview

The application now uses Firebase as the primary backend for:

- **Authentication**: Firebase Authentication for user management
- **Database**: Cloud Firestore for structured data storage
- **Storage**: Firebase Cloud Storage for file uploads (resumes, avatars)
- **Real-time Features**: Firebase Realtime Database for live updates and notifications

PostgreSQL, AWS S3, and custom JWT authentication have been completely removed.

## Required Environment Variables

### Backend Configuration (`backend/.env`)

```bash
# Server Configuration
PORT=3001
NODE_ENV=development

# Redis Configuration (for caching)
REDIS_URL=redis://localhost:6379
REDIS_HOST=localhost
REDIS_PORT=6379

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000

# Firebase Configuration (REQUIRED)
FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...}
FIREBASE_STORAGE_BUCKET=your-project-id.firebasestorage.app
FIREBASE_DATABASE_URL=https://your-project-id-default-rtdb.firebaseio.com
```

### Frontend Configuration (`frontend/.env.local`)

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001

# Firebase Configuration (REQUIRED)
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=1:your-app-id:web:your-web-id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-YOUR-MEASUREMENT-ID
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your-project-id-default-rtdb.firebaseio.com
```

## Getting Firebase Credentials

### 1. Firebase Console Setup

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project (or create a new one)
3. Navigate to **Project Settings** (gear icon)

### 2. Backend Service Account (FIREBASE_SERVICE_ACCOUNT)

1. In Firebase Console, go to **Project Settings** > **Service Accounts**
2. Click **Generate New Private Key**
3. Download the JSON file
4. Convert the JSON to a single-line string:
   ```bash
   cat service-account.json | jq -c
   ```
5. Copy the output and set it as `FIREBASE_SERVICE_ACCOUNT`

**Security Note**: Never commit this file to version control. Store it securely in:

- Local development: `.env` file (gitignored)
- Production: Environment variables in your hosting platform
- CI/CD: GitHub Secrets or similar secure storage

### 3. Frontend Firebase Config (NEXT*PUBLIC_FIREBASE*\*)

1. In Firebase Console, go to **Project Settings** > **General**
2. Scroll to **Your apps** section
3. Click on your web app (or create one if it doesn't exist)
4. Copy the `firebaseConfig` object values:
   - `apiKey` → `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `authDomain` → `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `projectId` → `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `storageBucket` → `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `messagingSenderId` → `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `appId` → `NEXT_PUBLIC_FIREBASE_APP_ID`
   - `measurementId` → `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`

### 4. Firebase Realtime Database URL

1. In Firebase Console, go to **Realtime Database**
2. If not created, click **Create Database**
3. Copy the database URL (format: `https://your-project-id-default-rtdb.firebaseio.com`)
4. Set it as both:
   - `FIREBASE_DATABASE_URL` (backend)
   - `NEXT_PUBLIC_FIREBASE_DATABASE_URL` (frontend)

### 5. Firebase Storage Bucket

1. In Firebase Console, go to **Storage**
2. If not created, click **Get Started**
3. Copy the bucket name (format: `your-project-id.firebasestorage.app`)
4. Set it as both:
   - `FIREBASE_STORAGE_BUCKET` (backend)
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` (frontend)

## Docker Configuration

### Development (docker-compose.yml)

The Docker Compose file now:

- ✅ Includes Redis for caching
- ✅ Includes Firebase environment variables
- ❌ Removed PostgreSQL service
- ❌ Removed PostgreSQL volumes

To run with Docker:

```bash
# Create a .env file in the project root with Firebase credentials
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local

# Edit the files and add your Firebase credentials

# Start services
docker-compose up -d
```

### Production (docker-compose.prod.yml)

Production deployment requires:

1. Set environment variables in your hosting platform
2. Ensure Firebase credentials are securely stored
3. Deploy Firebase security rules before deploying the application

## CI/CD Configuration (GitHub Actions)

### Required GitHub Secrets

Add these secrets to your GitHub repository (**Settings** > **Secrets and variables** > **Actions**):

#### Firebase Configuration

- `FIREBASE_TOKEN`: Firebase CLI token (get with `firebase login:ci`)
- `FIREBASE_SERVICE_ACCOUNT_STAGING`: Service account JSON for staging
- `FIREBASE_SERVICE_ACCOUNT_PRODUCTION`: Service account JSON for production
- `FIREBASE_STORAGE_BUCKET_STAGING`: Storage bucket for staging
- `FIREBASE_STORAGE_BUCKET_PRODUCTION`: Storage bucket for production
- `FIREBASE_DATABASE_URL_STAGING`: Realtime Database URL for staging
- `FIREBASE_DATABASE_URL_PRODUCTION`: Realtime Database URL for production

#### Frontend Firebase Configuration (for build)

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` (optional)
- `NEXT_PUBLIC_FIREBASE_DATABASE_URL`

#### Deployment

- `STAGING_HOST`: Staging server hostname
- `STAGING_SSH_KEY`: SSH key for staging
- `PRODUCTION_HOST`: Production server hostname
- `PRODUCTION_SSH_KEY`: SSH key for production
- `NEXT_PUBLIC_API_URL`: Backend API URL

### Getting Firebase CLI Token

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login and get token
firebase login:ci

# Copy the token and add it to GitHub Secrets as FIREBASE_TOKEN
```

## Environment-Specific Configuration

### Local Development

```bash
# Backend
cd backend
cp .env.example .env
# Edit .env and add your Firebase credentials

# Frontend
cd frontend
cp .env.example .env.local
# Edit .env.local and add your Firebase credentials

# Start services
npm run dev
```

### Staging Environment

1. Create a separate Firebase project for staging
2. Set up staging-specific environment variables
3. Deploy security rules to staging project
4. Test thoroughly before promoting to production

### Production Environment

1. Use a dedicated Firebase project for production
2. Store credentials in secure environment variable storage
3. Enable Firebase security rules
4. Monitor Firebase usage and quotas
5. Set up billing alerts

## Security Best Practices

### Backend Service Account

- ✅ Store in environment variables, never in code
- ✅ Use different service accounts for staging and production
- ✅ Rotate service accounts periodically
- ✅ Limit service account permissions to minimum required
- ❌ Never commit service account JSON to version control

### Frontend Firebase Config

- ✅ These values are safe to expose in client-side code
- ✅ Security is enforced through Firebase Security Rules
- ✅ Use different Firebase projects for staging and production
- ✅ Monitor Firebase usage to detect abuse

### Firebase Security Rules

- ✅ Deploy security rules before deploying application code
- ✅ Test security rules thoroughly
- ✅ Use Firebase Emulator Suite for local testing
- ✅ Review security rules regularly

## Troubleshooting

### "Firebase not initialized" Error

- Check that all required environment variables are set
- Verify the service account JSON is valid
- Ensure the Firebase project exists and is active

### "Permission denied" Errors

- Check Firebase Security Rules
- Verify user authentication is working
- Ensure custom claims are set correctly

### "Storage bucket not found" Error

- Verify the storage bucket name is correct
- Ensure Firebase Storage is enabled in the console
- Check that the service account has storage permissions

### Build Failures in CI/CD

- Verify all GitHub Secrets are set correctly
- Check that Firebase credentials are valid
- Ensure the Firebase project is accessible

## Migration Checklist

- [x] Remove PostgreSQL environment variables
- [x] Remove AWS S3 environment variables
- [x] Remove JWT secret variables
- [x] Add Firebase service account configuration
- [x] Add Firebase storage bucket configuration
- [x] Add Firebase Realtime Database URL
- [x] Update Docker Compose files
- [x] Update CI/CD configuration
- [x] Update deployment scripts
- [x] Document all required secrets
- [ ] Set up staging Firebase project
- [ ] Set up production Firebase project
- [ ] Configure GitHub Secrets
- [ ] Deploy Firebase security rules
- [ ] Test deployment pipeline

## Additional Resources

- [Firebase Console](https://console.firebase.google.com)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Security Rules](https://firebase.google.com/docs/rules)
- [Firebase CLI Reference](https://firebase.google.com/docs/cli)
- [GitHub Actions Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)

## Support

For issues or questions:

1. Check the [Firebase Setup Guide](./FIREBASE_SETUP.md)
2. Review the [Migration Guide](./backend/MIGRATION_GUIDE.md)
3. Check Firebase Console for service status
4. Review application logs for detailed error messages
