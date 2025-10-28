import admin from 'firebase-admin';
import logger from '../utils/logger';

let firebaseInitialized = false;

/**
 * Initialize Firebase Admin SDK
 * This should be called once during application startup
 */
export function initializeFirebase(): void {
  // Skip initialization in test environment when mocked
  if (process.env.NODE_ENV === 'test') {
    firebaseInitialized = true;
    logger.info('Firebase initialization skipped in test environment');
    return;
  }

  if (firebaseInitialized) {
    logger.info('Firebase already initialized');
    return;
  }

  try {
    // Parse service account from environment variable
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;

    if (!serviceAccountJson) {
      throw new Error('FIREBASE_SERVICE_ACCOUNT environment variable is not set');
    }

    const serviceAccount = JSON.parse(serviceAccountJson);

    // Validate required fields
    if (!serviceAccount.project_id || !serviceAccount.private_key || !serviceAccount.client_email) {
      throw new Error('Invalid service account: missing required fields');
    }

    // Initialize Firebase Admin SDK
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'jobportal-7918a.firebasestorage.app',
      databaseURL:
        process.env.FIREBASE_DATABASE_URL || 'https://jobportal-7918a-default-rtdb.firebaseio.com',
    });

    firebaseInitialized = true;
    logger.info('Firebase Admin SDK initialized successfully', {
      projectId: serviceAccount.project_id,
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'jobportal-7918a.firebasestorage.app',
    });
  } catch (error) {
    logger.error('Failed to initialize Firebase Admin SDK', { error });
    throw new Error(
      `Firebase initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Validate Firebase connection by performing a simple operation
 */
export async function validateFirebaseConnection(): Promise<void> {
  try {
    // Test Firestore connection
    const firestore = admin.firestore();
    await firestore.collection('_health_check').doc('test').set({
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      status: 'ok',
    });

    logger.info('Firebase Firestore connection validated successfully');

    // Test Auth connection
    await admin.auth().listUsers(1);
    logger.info('Firebase Auth connection validated successfully');

    // Test Storage connection
    const bucket = admin.storage().bucket();
    await bucket.exists();
    logger.info('Firebase Storage connection validated successfully');

    // Test Realtime Database connection
    const realtimeDb = admin.database();
    await realtimeDb.ref('_health_check').set({
      timestamp: admin.database.ServerValue.TIMESTAMP,
      status: 'ok',
    });
    logger.info('Firebase Realtime Database connection validated successfully');

    logger.info('All Firebase services validated successfully');
  } catch (error) {
    logger.error('Firebase connection validation failed', { error });
    throw new Error(
      `Firebase validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Get Firebase Auth instance
 */
export function getAuth() {
  if (!firebaseInitialized && process.env.NODE_ENV !== 'test') {
    initializeFirebase();
  }
  return admin.auth();
}

/**
 * Get Firestore instance
 */
export function getFirestore() {
  if (!firebaseInitialized && process.env.NODE_ENV !== 'test') {
    initializeFirebase();
  }
  return admin.firestore();
}

/**
 * Get Firebase Storage instance
 */
export function getStorage() {
  if (!firebaseInitialized && process.env.NODE_ENV !== 'test') {
    initializeFirebase();
  }
  return admin.storage();
}

/**
 * Get Firebase Realtime Database instance
 */
export function getRealtimeDb() {
  if (!firebaseInitialized && process.env.NODE_ENV !== 'test') {
    initializeFirebase();
  }
  return admin.database();
}

// Export instances for backward compatibility
export const auth = new Proxy({} as admin.auth.Auth, {
  get: (target, prop) => {
    return (getAuth() as any)[prop];
  },
});

export const firestore = new Proxy({} as admin.firestore.Firestore, {
  get: (target, prop) => {
    return (getFirestore() as any)[prop];
  },
});

export const storage = new Proxy({} as admin.storage.Storage, {
  get: (target, prop) => {
    return (getStorage() as any)[prop];
  },
});

export const realtimeDb = new Proxy({} as admin.database.Database, {
  get: (target, prop) => {
    return (getRealtimeDb() as any)[prop];
  },
});

/**
 * Check if Firebase is initialized
 */
export function isFirebaseInitialized(): boolean {
  return firebaseInitialized;
}
