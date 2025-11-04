/**
 * Debug utility to check Firebase authentication state
 * Use this in the browser console to diagnose auth issues
 */

import { auth } from './firebase';

export async function debugAuth() {
  console.group('🔍 Firebase Auth Debug');
  
  try {
    // Check if auth is initialized
    console.log('✅ Firebase Auth initialized:', !!auth);
    
    // Check current user
    const currentUser = auth.currentUser;
    console.log('Current User:', currentUser ? {
      uid: currentUser.uid,
      email: currentUser.email,
      emailVerified: currentUser.emailVerified,
      displayName: currentUser.displayName,
    } : '❌ No user signed in');
    
    // Try to get token
    if (currentUser) {
      try {
        const token = await currentUser.getIdToken(false);
        console.log('✅ Token retrieved (cached):', token.substring(0, 20) + '...');
        
        const freshToken = await currentUser.getIdToken(true);
        console.log('✅ Fresh token retrieved:', freshToken.substring(0, 20) + '...');
        
        // Decode token to check expiry
        const tokenParts = token.split('.');
        if (tokenParts.length === 3) {
          const payload = JSON.parse(atob(tokenParts[1]));
          const expiryDate = new Date(payload.exp * 1000);
          const now = new Date();
          const isExpired = expiryDate < now;
          
          console.log('Token Expiry:', expiryDate.toLocaleString());
          console.log('Current Time:', now.toLocaleString());
          console.log('Token Status:', isExpired ? '❌ EXPIRED' : '✅ Valid');
          console.log('Time until expiry:', Math.round((expiryDate.getTime() - now.getTime()) / 1000 / 60), 'minutes');
        }
      } catch (error) {
        console.error('❌ Error getting token:', error);
      }
    }
    
    // Check auth state listener
    console.log('Auth State Listener:', 'Active (check auth-context.tsx)');
    
  } catch (error) {
    console.error('❌ Debug error:', error);
  }
  
  console.groupEnd();
}

// Make it available globally for console debugging
if (typeof window !== 'undefined') {
  (window as any).debugAuth = debugAuth;
}

export default debugAuth;
