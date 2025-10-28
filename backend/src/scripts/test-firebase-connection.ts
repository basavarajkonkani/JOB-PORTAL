/**
 * Test script to verify Firebase configuration and connection
 * Run with: ts-node src/scripts/test-firebase-connection.ts
 */

import dotenv from 'dotenv';
import {
  initializeFirebase,
  validateFirebaseConnection,
  isFirebaseInitialized,
} from '../config/firebase';
import logger from '../utils/logger';

// Load environment variables
dotenv.config();

async function testFirebaseConnection() {
  console.log('=== Firebase Connection Test ===\n');

  try {
    // Step 1: Check environment variables
    console.log('Step 1: Checking environment variables...');
    const requiredEnvVars = [
      'FIREBASE_SERVICE_ACCOUNT',
      'FIREBASE_STORAGE_BUCKET',
      'FIREBASE_DATABASE_URL',
    ];

    const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);

    if (missingVars.length > 0) {
      console.error('❌ Missing required environment variables:', missingVars.join(', '));
      console.log('\nPlease set these variables in your .env file');
      process.exit(1);
    }

    console.log('✅ All required environment variables are set\n');

    // Step 2: Initialize Firebase
    console.log('Step 2: Initializing Firebase...');
    initializeFirebase();

    if (isFirebaseInitialized()) {
      console.log('✅ Firebase initialized successfully\n');
    } else {
      console.error('❌ Firebase initialization failed');
      process.exit(1);
    }

    // Step 3: Validate connections
    console.log('Step 3: Validating Firebase service connections...');
    await validateFirebaseConnection();
    console.log('✅ All Firebase services validated successfully\n');

    console.log('=== Test Completed Successfully ===');
    console.log('Firebase is properly configured and all services are accessible.');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Test Failed:', error instanceof Error ? error.message : error);
    logger.error('Firebase connection test failed', { error });
    process.exit(1);
  }
}

// Run the test
testFirebaseConnection();
