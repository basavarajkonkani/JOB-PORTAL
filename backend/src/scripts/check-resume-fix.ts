#!/usr/bin/env ts-node

/**
 * Quick check script for resume endpoint fix
 * Verifies that the Firestore index is working
 */

import { firestore } from '../config/firebase';
import logger from '../utils/logger';

async function checkResumeQuery() {
  console.log('🔍 Checking Resume Query...\n');
  
  try {
    // Test the query that was failing
    const testUserId = 'test-user-id';
    
    console.log('Testing query: resumes where userId == test-user-id orderBy uploadedAt desc');
    
    const snapshot = await firestore
      .collection('resumes')
      .where('userId', '==', testUserId)
      .orderBy('uploadedAt', 'desc')
      .limit(1)
      .get();
    
    console.log('✅ Query executed successfully!');
    console.log(`   Documents found: ${snapshot.size}`);
    
    if (snapshot.empty) {
      console.log('   (No documents found for test user, which is expected)');
    }
    
    console.log('\n✅ The Firestore index is working correctly!');
    console.log('   The resume endpoint should now work without errors.');
    
  } catch (error: any) {
    console.error('❌ Query failed:', error.message);
    
    if (error.message.includes('index')) {
      console.log('\n⚠️  Index is still building. This can take a few minutes.');
      console.log('   Check status at: https://console.firebase.google.com/project/jobportal-7918a/firestore/indexes');
      console.log('\n   The index was just deployed. Please wait 2-5 minutes and try again.');
    } else {
      console.error('\n❌ Unexpected error:', error);
    }
    
    process.exit(1);
  }
}

checkResumeQuery();
