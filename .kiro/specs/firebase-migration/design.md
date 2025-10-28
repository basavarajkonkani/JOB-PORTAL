# Firebase Migration Design Document

## Overview

This document outlines the comprehensive design for migrating the AI Job Portal from a PostgreSQL-based backend to a Firebase-based architecture. The migration will replace all database operations, authentication, and file storage with Firebase services while maintaining the existing API structure and functionality.

### Migration Goals

1. Replace PostgreSQL with Cloud Firestore for structured data storage
2. Replace custom JWT authentication with Firebase Authentication
3. Replace S3 storage with Firebase Cloud Storage for file uploads
4. Implement Firebase Realtime Database for live features (notifications, presence)
5. Maintain existing API endpoints and response formats for frontend compatibility
6. Improve scalability and reduce infrastructure management overhead
7. Enable direct client-to-Firebase communication for real-time features

### Firebase Configuration

```javascript
const firebaseConfig = {
  apiKey: 'AIzaSyDv3qvDywNjL7sId8lL6ej-y7ucd-Rl_2M',
  authDomain: 'jobportal-7918a.firebaseapp.com',
  projectId: 'jobportal-7918a',
  storageBucket: 'jobportal-7918a.firebasestorage.app',
  messagingSenderId: '486520425901',
  appId: '1:486520425901:web:c6c116a49dd706286a2524',
  measurementId: 'G-PMZYC4JBDG',
};
```

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (Next.js)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Firebase SDK │  │  Auth Context │  │  API Client  │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
└─────────┼──────────────────┼──────────────────┼─────────────┘
          │                  │                  │
          │ Direct Access    │ Auth Tokens      │ HTTP Requests
          │                  │                  │
┌─────────▼──────────────────▼──────────────────▼─────────────┐
│                    Firebase Services                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Firestore    │  │ Auth         │  │ Storage      │      │
│  │ (Data)       │  │ (Users)      │  │ (Files)      │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐                                           │
│  │ Realtime DB  │                                           │
│  │ (Live Data)  │                                           │
│  └──────────────┘                                           │
└──────────────────────────────────────────────────────────────┘
          ▲
          │ Admin SDK
          │
┌─────────┴─────────────────────────────────────────────────┐
│              Backend (Express.js)                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │ Firebase     │  │  API Routes  │  │  AI Service  │    │
│  │ Admin SDK    │  │              │  │              │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
└────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Authentication Flow**: Frontend → Firebase Auth → Backend (token verification)
2. **Data Operations**: Frontend → Backend API → Firebase Admin SDK → Firestore
3. **Real-time Updates**: Frontend → Firebase Realtime Database (direct)
4. **File Uploads**: Frontend → Backend API → Firebase Storage

## Components and Interfaces

### 1. Firebase Configuration Module

**Location**: `backend/src/config/firebase.ts` and `frontend/lib/firebase.ts`

**Backend Configuration**:

```typescript
import admin from 'firebase-admin';

// Initialize Firebase Admin SDK
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || '{}');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'jobportal-7918a.firebasestorage.app',
  databaseURL: 'https://jobportal-7918a-default-rtdb.firebaseio.com',
});

export const auth = admin.auth();
export const firestore = admin.firestore();
export const storage = admin.storage();
export const realtimeDb = admin.database();
```

**Frontend Configuration**:

```typescript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const firestore = getFirestore(app);
export const storage = getStorage(app);
export const realtimeDb = getDatabase(app);
```

### 2. Authentication System

**Firebase Authentication Integration**:

- Replace JWT token generation with Firebase ID tokens
- Store user roles in Firebase custom claims
- Implement middleware to verify Firebase ID tokens

**Backend Middleware** (`backend/src/middleware/firebaseAuth.ts`):

```typescript
import { auth } from '../config/firebase';
import { Request, Response, NextFunction } from 'express';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

export async function authenticateFirebase(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({ code: 'UNAUTHORIZED', message: 'No token provided' });
      return;
    }

    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await auth.verifyIdToken(idToken);

    req.user = {
      userId: decodedToken.uid,
      email: decodedToken.email!,
      role: decodedToken.role || 'candidate',
    };

    next();
  } catch (error) {
    res.status(401).json({ code: 'UNAUTHORIZED', message: 'Invalid token' });
  }
}
```

**Frontend Auth Context** (`frontend/lib/auth-context.tsx`):

```typescript
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth, firestore } from './firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

// Sign up with role
async function signUp(email: string, password: string, name: string, role: string) {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  // Create user document in Firestore
  await setDoc(doc(firestore, 'users', user.uid), {
    email,
    name,
    role,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // Set custom claims via backend API
  await fetch(`${API_URL}/api/auth/set-role`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${await user.getIdToken()}`,
    },
    body: JSON.stringify({ role }),
  });

  // Force token refresh to get new claims
  await user.getIdToken(true);

  return user;
}
```

### 3. Data Models and Firestore Collections

**Collection Structure**:

```
firestore/
├── users/
│   └── {userId}/
│       ├── email
│       ├── name
│       ├── role
│       ├── avatarUrl
│       ├── createdAt
│       └── updatedAt
│
├── candidateProfiles/
│   └── {userId}/
│       ├── userId
│       ├── skills[]
│       ├── experience[]
│       ├── education[]
│       ├── location
│       ├── preferences{}
│       └── timestamps
│
├── recruiterProfiles/
│   └── {userId}/
│       ├── userId
│       ├── orgId
│       ├── title
│       ├── department
│       └── timestamps
│
├── organizations/
│   └── {orgId}/
│       ├── name
│       ├── description
│       ├── website
│       ├── logoUrl
│       └── timestamps
│
├── jobs/
│   └── {jobId}/
│       ├── orgId
│       ├── createdBy
│       ├── title
│       ├── level
│       ├── location
│       ├── type
│       ├── remote
│       ├── description
│       ├── requirements[]
│       ├── compensation{}
│       ├── benefits[]
│       ├── status
│       └── timestamps
│
├── applications/
│   └── {applicationId}/
│       ├── jobId
│       ├── userId
│       ├── resumeVersionId
│       ├── coverLetter
│       ├── status
│       ├── notes
│       ├── aiScore
│       ├── aiRationale
│       └── timestamps
│
├── resumes/
│   └── {resumeId}/
│       ├── userId
│       ├── title
│       ├── fileUrl
│       ├── parsedData{}
│       └── versions/
│           └── {versionId}/
│               ├── versionNumber
│               ├── fileUrl
│               ├── parsedData{}
│               └── createdAt
│
└── events/
    └── {eventId}/
        ├── userId
        ├── eventType
        ├── metadata{}
        └── timestamp
```

**Firestore Indexes**:

```javascript
// Required composite indexes
[
  {
    collectionGroup: 'jobs',
    fields: [
      { fieldPath: 'status', order: 'ASCENDING' },
      { fieldPath: 'publishedAt', order: 'DESCENDING' },
    ],
  },
  {
    collectionGroup: 'jobs',
    fields: [
      { fieldPath: 'status', order: 'ASCENDING' },
      { fieldPath: 'location', order: 'ASCENDING' },
      { fieldPath: 'publishedAt', order: 'DESCENDING' },
    ],
  },
  {
    collectionGroup: 'applications',
    fields: [
      { fieldPath: 'userId', order: 'ASCENDING' },
      { fieldPath: 'createdAt', order: 'DESCENDING' },
    ],
  },
  {
    collectionGroup: 'applications',
    fields: [
      { fieldPath: 'jobId', order: 'ASCENDING' },
      { fieldPath: 'status', order: 'ASCENDING' },
      { fieldPath: 'aiScore', order: 'DESCENDING' },
    ],
  },
];
```

### 4. Model Layer Refactoring

**Example: User Model** (`backend/src/models/User.ts`):

```typescript
import { firestore, auth } from '../config/firebase';
import { Timestamp } from 'firebase-admin/firestore';

export interface User {
  id: string;
  email: string;
  role: 'candidate' | 'recruiter' | 'admin';
  name: string;
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class UserModel {
  private static collection = firestore.collection('users');

  static async create(userData: {
    email: string;
    password: string;
    name: string;
    role: string;
  }): Promise<User> {
    // Create Firebase Auth user
    const userRecord = await auth.createUser({
      email: userData.email,
      password: userData.password,
      displayName: userData.name,
    });

    // Set custom claims for role
    await auth.setCustomUserClaims(userRecord.uid, { role: userData.role });

    // Create Firestore document
    const userDoc = {
      email: userData.email,
      name: userData.name,
      role: userData.role,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    await this.collection.doc(userRecord.uid).set(userDoc);

    return {
      id: userRecord.uid,
      ...userDoc,
      createdAt: userDoc.createdAt.toDate(),
      updatedAt: userDoc.updatedAt.toDate(),
    };
  }

  static async findById(id: string): Promise<User | null> {
    const doc = await this.collection.doc(id).get();

    if (!doc.exists) {
      return null;
    }

    const data = doc.data()!;
    return {
      id: doc.id,
      email: data.email,
      name: data.name,
      role: data.role,
      avatarUrl: data.avatarUrl,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
    };
  }

  static async findByEmail(email: string): Promise<User | null> {
    const snapshot = await this.collection.where('email', '==', email).limit(1).get();

    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
    const data = doc.data();

    return {
      id: doc.id,
      email: data.email,
      name: data.name,
      role: data.role,
      avatarUrl: data.avatarUrl,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
    };
  }

  static async update(id: string, updates: Partial<User>): Promise<User | null> {
    const updateData: any = {
      ...updates,
      updatedAt: Timestamp.now(),
    };

    await this.collection.doc(id).update(updateData);
    return this.findById(id);
  }

  static async emailExists(email: string): Promise<boolean> {
    const user = await this.findByEmail(email);
    return user !== null;
  }
}
```

### 5. Realtime Database Structure

**Purpose**: Handle real-time features like notifications and presence

```
realtimeDb/
├── presence/
│   └── {userId}/
│       ├── online: boolean
│       ├── lastSeen: timestamp
│       └── currentPage: string
│
├── notifications/
│   └── {userId}/
│       └── {notificationId}/
│           ├── type: string
│           ├── title: string
│           ├── message: string
│           ├── read: boolean
│           ├── data: object
│           └── timestamp: number
│
└── applicationUpdates/
    └── {userId}/
        └── {applicationId}/
            ├── status: string
            ├── updatedAt: timestamp
            └── jobTitle: string
```

**Frontend Realtime Listener**:

```typescript
import { ref, onValue, set } from 'firebase/database';
import { realtimeDb } from './firebase';

// Listen for application updates
function listenToApplicationUpdates(userId: string, callback: (updates: any) => void) {
  const updatesRef = ref(realtimeDb, `applicationUpdates/${userId}`);

  return onValue(updatesRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      callback(data);
    }
  });
}

// Update presence
function updatePresence(userId: string, online: boolean) {
  const presenceRef = ref(realtimeDb, `presence/${userId}`);

  set(presenceRef, {
    online,
    lastSeen: Date.now(),
    currentPage: window.location.pathname,
  });
}
```

### 6. Cloud Storage Integration

**File Upload Handler** (`backend/src/routes/resume.ts`):

```typescript
import { storage } from '../config/firebase';
import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage() });

router.post('/upload', authenticateFirebase, upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    const userId = req.user!.userId;

    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Upload to Firebase Storage
    const bucket = storage.bucket();
    const fileName = `resumes/${userId}/${Date.now()}_${file.originalname}`;
    const fileUpload = bucket.file(fileName);

    await fileUpload.save(file.buffer, {
      metadata: {
        contentType: file.mimetype,
        metadata: {
          uploadedBy: userId,
        },
      },
    });

    // Make file publicly accessible (or use signed URLs)
    const [url] = await fileUpload.getSignedUrl({
      action: 'read',
      expires: Date.now() + 365 * 24 * 60 * 60 * 1000, // 1 year
    });

    // Save metadata to Firestore
    const resumeRef = firestore.collection('resumes').doc();
    await resumeRef.set({
      userId,
      fileName: file.originalname,
      fileUrl: url,
      storagePath: fileName,
      uploadedAt: Timestamp.now(),
    });

    res.json({ resumeId: resumeRef.id, fileUrl: url });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Upload failed' });
  }
});
```

### 7. Security Rules

**Firestore Security Rules** (`firestore.rules`):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }

    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }

    function hasRole(role) {
      return isAuthenticated() && request.auth.token.role == role;
    }

    // Users collection
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow write: if isOwner(userId);
    }

    // Candidate profiles
    match /candidateProfiles/{userId} {
      allow read: if isAuthenticated();
      allow write: if isOwner(userId);
    }

    // Recruiter profiles
    match /recruiterProfiles/{userId} {
      allow read: if isAuthenticated();
      allow write: if isOwner(userId) || hasRole('admin');
    }

    // Organizations
    match /organizations/{orgId} {
      allow read: if isAuthenticated();
      allow write: if hasRole('recruiter') || hasRole('admin');
    }

    // Jobs
    match /jobs/{jobId} {
      allow read: if true; // Public read
      allow create: if hasRole('recruiter');
      allow update, delete: if hasRole('recruiter') &&
        resource.data.createdBy == request.auth.uid;
    }

    // Applications
    match /applications/{applicationId} {
      allow read: if isOwner(resource.data.userId) ||
        (hasRole('recruiter') &&
         get(/databases/$(database)/documents/jobs/$(resource.data.jobId)).data.createdBy == request.auth.uid);
      allow create: if isAuthenticated() && isOwner(request.resource.data.userId);
      allow update: if hasRole('recruiter') &&
        get(/databases/$(database)/documents/jobs/$(resource.data.jobId)).data.createdBy == request.auth.uid;
    }

    // Resumes
    match /resumes/{resumeId} {
      allow read, write: if isOwner(resource.data.userId);

      match /versions/{versionId} {
        allow read, write: if isOwner(get(/databases/$(database)/documents/resumes/$(resumeId)).data.userId);
      }
    }
  }
}
```

**Storage Security Rules** (`storage.rules`):

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /resumes/{userId}/{fileName} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && request.auth.uid == userId;
    }

    match /avatars/{userId}/{fileName} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

**Realtime Database Security Rules** (`database.rules.json`):

```json
{
  "rules": {
    "presence": {
      "$userId": {
        ".read": true,
        ".write": "$userId === auth.uid"
      }
    },
    "notifications": {
      "$userId": {
        ".read": "$userId === auth.uid",
        ".write": "$userId === auth.uid"
      }
    },
    "applicationUpdates": {
      "$userId": {
        ".read": "$userId === auth.uid",
        ".write": "auth.token.role === 'recruiter' || auth.token.role === 'admin'"
      }
    }
  }
}
```

## Data Migration Strategy

### Phase 1: Preparation

1. **Backup existing PostgreSQL database**
2. **Set up Firebase project and configure services**
3. **Deploy security rules**
4. **Create Firestore indexes**

### Phase 2: Data Export

```typescript
// Migration script: backend/src/scripts/export-postgres-data.ts
import pool from '../config/database';
import fs from 'fs';

async function exportData() {
  const tables = [
    'users',
    'candidate_profiles',
    'recruiter_profiles',
    'organizations',
    'jobs',
    'applications',
    'resumes',
  ];

  const exportData: any = {};

  for (const table of tables) {
    const result = await pool.query(`SELECT * FROM ${table}`);
    exportData[table] = result.rows;
  }

  fs.writeFileSync('migration-data.json', JSON.stringify(exportData, null, 2));
  console.log('Data exported successfully');
}
```

### Phase 3: Data Import

```typescript
// Migration script: backend/src/scripts/import-to-firebase.ts
import { firestore, auth } from '../config/firebase';
import fs from 'fs';

async function importData() {
  const data = JSON.parse(fs.readFileSync('migration-data.json', 'utf-8'));

  // Import users
  for (const user of data.users) {
    try {
      // Create auth user
      const userRecord = await auth.createUser({
        uid: user.id,
        email: user.email,
        displayName: user.name,
      });

      // Set custom claims
      await auth.setCustomUserClaims(user.id, { role: user.role });

      // Create Firestore document
      await firestore.collection('users').doc(user.id).set({
        email: user.email,
        name: user.name,
        role: user.role,
        avatarUrl: user.avatar_url,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
      });
    } catch (error) {
      console.error(`Failed to import user ${user.id}:`, error);
    }
  }

  // Import other collections similarly...
  console.log('Data imported successfully');
}
```

### Phase 4: Verification

1. **Compare record counts between PostgreSQL and Firestore**
2. **Verify data integrity and relationships**
3. **Test authentication flow**
4. **Test CRUD operations**

## Error Handling

### Firebase-Specific Error Handling

```typescript
import { FirebaseError } from 'firebase-admin';

export function handleFirebaseError(error: any, res: Response) {
  if (error instanceof FirebaseError) {
    switch (error.code) {
      case 'auth/email-already-exists':
        return res.status(400).json({
          code: 'ALREADY_EXISTS',
          message: 'Email already registered',
        });

      case 'auth/invalid-email':
        return res.status(400).json({
          code: 'VALIDATION_ERROR',
          message: 'Invalid email format',
        });

      case 'auth/user-not-found':
        return res.status(404).json({
          code: 'NOT_FOUND',
          message: 'User not found',
        });

      case 'permission-denied':
        return res.status(403).json({
          code: 'FORBIDDEN',
          message: 'Permission denied',
        });

      default:
        console.error('Firebase error:', error);
        return res.status(500).json({
          code: 'INTERNAL_ERROR',
          message: 'An error occurred',
        });
    }
  }

  console.error('Unexpected error:', error);
  return res.status(500).json({
    code: 'INTERNAL_ERROR',
    message: 'An unexpected error occurred',
  });
}
```

## Testing Strategy

### Unit Tests

1. **Model layer tests**: Test Firestore CRUD operations
2. **Authentication tests**: Test Firebase Auth integration
3. **Storage tests**: Test file upload/download operations

### Integration Tests

1. **API endpoint tests**: Test complete request/response cycles
2. **Security rules tests**: Test Firestore and Storage security rules
3. **Real-time features tests**: Test Realtime Database listeners

### Migration Tests

1. **Data integrity tests**: Verify migrated data matches source
2. **Performance tests**: Compare query performance
3. **Load tests**: Test Firebase scalability

## Performance Considerations

### Firestore Optimization

1. **Use composite indexes** for complex queries
2. **Implement pagination** using `startAfter()` cursors
3. **Cache frequently accessed data** in Redis
4. **Denormalize data** where appropriate to reduce reads
5. **Use batch operations** for multiple writes

### Caching Strategy

```typescript
// Maintain Redis caching for expensive operations
import redisClient from '../config/redis';

async function getCachedJob(jobId: string) {
  const cacheKey = `job:${jobId}`;

  // Try cache first
  const cached = await redisClient.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }

  // Fetch from Firestore
  const doc = await firestore.collection('jobs').doc(jobId).get();
  const job = { id: doc.id, ...doc.data() };

  // Cache for 5 minutes
  await redisClient.setEx(cacheKey, 300, JSON.stringify(job));

  return job;
}
```

## Rollback Plan

### Rollback Strategy

1. **Keep PostgreSQL database intact** during migration
2. **Maintain dual-write capability** (write to both databases)
3. **Feature flag** to switch between Firebase and PostgreSQL
4. **Monitor error rates** and performance metrics
5. **Quick rollback** by switching feature flag

### Rollback Implementation

```typescript
// Feature flag for database selection
const USE_FIREBASE = process.env.USE_FIREBASE === 'true';

export class UserModel {
  static async findById(id: string): Promise<User | null> {
    if (USE_FIREBASE) {
      return this.findByIdFirebase(id);
    } else {
      return this.findByIdPostgres(id);
    }
  }

  private static async findByIdFirebase(id: string): Promise<User | null> {
    // Firebase implementation
  }

  private static async findByIdPostgres(id: string): Promise<User | null> {
    // PostgreSQL implementation
  }
}
```

## Deployment Plan

### Phase 1: Setup (Week 1)

1. Configure Firebase project
2. Set up service accounts and credentials
3. Deploy security rules
4. Create Firestore indexes

### Phase 2: Code Migration (Week 2-3)

1. Implement Firebase configuration modules
2. Refactor authentication system
3. Migrate model layer
4. Update API routes
5. Update frontend auth context

### Phase 3: Data Migration (Week 4)

1. Export PostgreSQL data
2. Import to Firebase
3. Verify data integrity
4. Test all features

### Phase 4: Testing & Deployment (Week 5)

1. Run comprehensive tests
2. Deploy to staging environment
3. Perform load testing
4. Deploy to production with feature flag
5. Monitor and gradually roll out

### Phase 5: Cleanup (Week 6)

1. Remove PostgreSQL dependencies
2. Remove dual-write code
3. Remove feature flags
4. Update documentation
