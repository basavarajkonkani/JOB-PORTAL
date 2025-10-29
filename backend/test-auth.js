/**
 * Quick test script to verify Firebase Auth is working
 * Run with: node test-auth.js
 */

require('dotenv').config();
const admin = require('firebase-admin');

async function testAuth() {
  console.log('🔍 Testing Firebase Auth Configuration...\n');

  try {
    // Check if service account is configured
    if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
      console.error('❌ FIREBASE_SERVICE_ACCOUNT not found in .env');
      process.exit(1);
    }

    console.log('✅ FIREBASE_SERVICE_ACCOUNT found');

    // Parse service account
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    console.log('✅ Service account parsed successfully');
    console.log('   Project ID:', serviceAccount.project_id);
    console.log('   Client Email:', serviceAccount.client_email);

    // Initialize Firebase Admin
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      databaseURL: process.env.FIREBASE_DATABASE_URL,
    });

    console.log('✅ Firebase Admin initialized\n');

    // Test listing users
    console.log('Testing Firebase Auth...');
    const listUsersResult = await admin.auth().listUsers(1);
    console.log('✅ Firebase Auth is working');
    console.log('   Users found:', listUsersResult.users.length);

    if (listUsersResult.users.length > 0) {
      const user = listUsersResult.users[0];
      console.log('   Sample user:', user.uid, user.email);

      // Test token generation
      console.log('\nTesting token generation...');
      const customToken = await admin.auth().createCustomToken(user.uid);
      console.log('✅ Custom token created successfully');
      console.log('   Token:', customToken.substring(0, 20) + '...');
    }

    console.log('\n✅ All tests passed!');
    console.log('\nBackend Firebase Auth is properly configured.');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  }
}

testAuth();
