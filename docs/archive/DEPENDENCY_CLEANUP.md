# Dependency Cleanup Guide

## Overview
This guide helps identify and remove unused dependencies from the project.

## Current Status

### ✅ Already Migrated to Firebase
The project has been fully migrated from PostgreSQL to Firebase. The following dependencies are **NO LONGER NEEDED**:

#### Backend - Can Be Removed
```bash
cd backend
npm uninstall pg @types/pg node-pg-migrate
```

These packages were used for PostgreSQL but are now obsolete since we're using Firebase Firestore.

### ⚠️ AWS S3 Dependencies
The project currently has AWS S3 dependencies:
- `@aws-sdk/client-s3`
- `@aws-sdk/lib-storage`

**Status:** Check if these are being used. If Firebase Storage is handling all file uploads, these can be removed.

To check usage:
```bash
grep -r "@aws-sdk" backend/src/
```

If not used, remove with:
```bash
cd backend
npm uninstall @aws-sdk/client-s3 @aws-sdk/lib-storage
```

### ✅ Keep These Dependencies

#### Backend - Essential
- `express` - Web framework
- `cors` - CORS middleware
- `dotenv` - Environment variables
- `firebase-admin` - Firebase backend SDK
- `jsonwebtoken` - JWT authentication
- `bcrypt` - Password hashing
- `multer` - File upload handling
- `axios` - HTTP client
- `redis` - Caching
- `winston` - Logging
- `@sentry/node` - Error tracking
- `mammoth` - DOCX parsing
- `pdf-parse` - PDF parsing

#### Frontend - Essential
- `next` - React framework
- `react` - UI library
- `react-dom` - React DOM
- `firebase` - Firebase client SDK
- `lucide-react` - Icons
- `tailwindcss` - CSS framework

#### Dev Dependencies - Essential
- `typescript` - TypeScript compiler
- `eslint` - Linting
- `prettier` - Code formatting
- `jest` - Testing (backend)
- `@playwright/test` - E2E testing (frontend)
- `nodemon` - Development server
- `ts-node` - TypeScript execution
- `husky` - Git hooks
- `lint-staged` - Pre-commit linting

## Cleanup Steps

### Step 1: Remove PostgreSQL Dependencies
```bash
cd backend
npm uninstall pg @types/pg node-pg-migrate
cd ..
```

### Step 2: Check AWS Dependencies
```bash
# Check if AWS S3 is being used
grep -r "S3Client\|@aws-sdk" backend/src/

# If not used, remove
cd backend
npm uninstall @aws-sdk/client-s3 @aws-sdk/lib-storage
cd ..
```

### Step 3: Clean Package Lock Files
```bash
# Root
rm -f package-lock.json
npm install

# Backend
cd backend
rm -f package-lock.json
npm install
cd ..

# Frontend
cd frontend
rm -f package-lock.json
npm install
cd ..
```

### Step 4: Verify Everything Works
```bash
# Build
npm run build

# Test
cd backend && npm test
cd frontend && npm run test:e2e

# Run
npm run dev
```

## Dependency Audit

### Check for Vulnerabilities
```bash
npm audit
cd backend && npm audit
cd frontend && npm audit
```

### Fix Vulnerabilities
```bash
npm audit fix
cd backend && npm audit fix
cd frontend && npm audit fix
```

### Update Dependencies
```bash
# Check for updates
npm outdated
cd backend && npm outdated
cd frontend && npm outdated

# Update (carefully)
npm update
cd backend && npm update
cd frontend && npm update
```

## Size Optimization

### Before Cleanup
- node_modules: ~500 MB
- With PostgreSQL dependencies
- With potential unused AWS dependencies

### After Cleanup
- node_modules: ~450 MB
- No PostgreSQL dependencies
- Only essential dependencies

### Further Optimization
```bash
# Use npm ci for clean installs
npm ci

# Remove dev dependencies in production
npm install --production
```

## Maintenance

### Regular Checks
Run these commands monthly:

```bash
# Check for unused dependencies
npx depcheck

# Check for outdated packages
npm outdated

# Audit security
npm audit
```

### Before Deployment
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# Audit
npm audit fix

# Test
npm test

# Build
npm run build
```

## Automated Cleanup Script

Create `cleanup-dependencies.sh`:

```bash
#!/bin/bash

echo "🧹 Cleaning up dependencies..."

# Remove PostgreSQL dependencies
cd backend
npm uninstall pg @types/pg node-pg-migrate 2>/dev/null || true
cd ..

# Clean and reinstall
rm -rf node_modules package-lock.json
rm -rf backend/node_modules backend/package-lock.json
rm -rf frontend/node_modules frontend/package-lock.json

npm install
cd backend && npm install && cd ..
cd frontend && npm install && cd ..

echo "✅ Dependencies cleaned and reinstalled"
```

## Notes

### PostgreSQL Removal
- ✅ All data migrated to Firebase Firestore
- ✅ All queries converted to Firestore
- ✅ No PostgreSQL code remaining
- ✅ Safe to remove pg dependencies

### AWS S3 Consideration
- ⚠️ Check if Firebase Storage is handling all files
- ⚠️ Verify no S3 code in production
- ⚠️ Test file uploads after removal

### Redis
- ✅ Keep Redis for caching
- ✅ Used for performance optimization
- ✅ Essential for production

## Conclusion

After cleanup:
- ✅ Smaller node_modules
- ✅ Faster installs
- ✅ Fewer security vulnerabilities
- ✅ Cleaner dependency tree
- ✅ Production-ready
