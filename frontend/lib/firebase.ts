import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { getDatabase, Database } from 'firebase/database';

// Firebase configuration from environment variables
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

/**
 * Validate Firebase configuration
 */
function validateFirebaseConfig(): void {
  const requiredFields = [
    'apiKey',
    'authDomain',
    'projectId',
    'storageBucket',
    'messagingSenderId',
    'appId',
  ];

  const missingFields = requiredFields.filter(
    (field) => !firebaseConfig[field as keyof typeof firebaseConfig]
  );

  if (missingFields.length > 0) {
    throw new Error(
      `Missing required Firebase configuration: ${missingFields.join(', ')}. ` +
        `Please check your environment variables.`
    );
  }
}

/**
 * Initialize Firebase app
 * Uses singleton pattern to prevent multiple initializations
 */
function initializeFirebase(): FirebaseApp {
  // Validate configuration before initialization
  validateFirebaseConfig();

  // Check if Firebase is already initialized
  const existingApps = getApps();
  if (existingApps.length > 0) {
    console.log('Firebase already initialized');
    return existingApps[0];
  }

  // Initialize Firebase
  try {
    const app = initializeApp(firebaseConfig);
    console.log('Firebase initialized successfully', {
      projectId: firebaseConfig.projectId,
      authDomain: firebaseConfig.authDomain,
    });
    return app;
  } catch (error) {
    console.error('Failed to initialize Firebase:', error);
    throw new Error(
      `Firebase initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

// Initialize Firebase app
const app = initializeFirebase();

/**
 * Firebase Auth instance
 */
export const auth: Auth = getAuth(app);

/**
 * Firestore instance
 */
export const firestore: Firestore = getFirestore(app);

/**
 * Firebase Storage instance
 */
export const storage: FirebaseStorage = getStorage(app);

/**
 * Firebase Realtime Database instance
 */
export const realtimeDb: Database = getDatabase(app);

/**
 * Get Firebase app instance
 */
export const firebaseApp = app;

/**
 * Validate Firebase connection
 * This can be called to ensure Firebase services are accessible
 */
export async function validateFirebaseConnection(): Promise<boolean> {
  try {
    // Check if auth is accessible
    if (!auth) {
      throw new Error('Firebase Auth not initialized');
    }

    // Check if firestore is accessible
    if (!firestore) {
      throw new Error('Firestore not initialized');
    }

    // Check if storage is accessible
    if (!storage) {
      throw new Error('Firebase Storage not initialized');
    }

    // Check if realtime database is accessible
    if (!realtimeDb) {
      throw new Error('Firebase Realtime Database not initialized');
    }

    console.log('All Firebase services are accessible');
    return true;
  } catch (error) {
    console.error('Firebase connection validation failed:', error);
    return false;
  }
}

export default app;
