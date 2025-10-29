# Resume Upload Authentication Fix

## Problem
Users were experiencing 401 (Unauthorized) errors when uploading resumes. The error occurred because:

1. Firebase ID tokens expire after 1 hour
2. Components were using cached `accessToken` from the auth context
3. The cached token could be stale/expired when the upload request was made
4. API requests proceeded even when no valid token was available

## Solution
Updated components and API client to properly handle authentication:

### Core Fixes
1. **API Client Enhancement** - Added validation to ensure token exists before making requests
2. **Component Updates** - Migrated from manual fetch to centralized `api-client` utility
3. **Better Error Handling** - Clear error messages when authentication fails
4. **Loading States** - Proper loading indicators while checking auth status

### How It Works
The `api-client` utility now:
- Automatically fetches fresh Firebase ID tokens before each request
- Forces token refresh using `getIdToken(true)` to ensure validity
- Throws clear error if user is not authenticated
- Handles authentication errors consistently across the app

## Changes Made

### 1. API Client (`frontend/lib/api-client.ts`)
- ✅ Added validation to throw error if no token is available
- ✅ Enhanced logging to help debug auth issues
- ✅ Ensures Authorization header is always set when token exists

### 2. ResumeUpload Component (`frontend/components/resume/ResumeUpload.tsx`)
- ✅ Removed direct use of `accessToken` from auth context
- ✅ Replaced manual `fetch` calls with `apiRequestFormData` utility
- ✅ Added helpful error messages with auto-redirect to sign-in
- ✅ Better error logging for debugging

### 3. OnboardingWizard Component (`frontend/components/onboarding/OnboardingWizard.tsx`)
- ✅ Updated all API calls to use `apiRequest` and `apiRequestFormData`
- ✅ Removed dependency on `accessToken` prop
- ✅ Consistent token refresh across all operations:
  - Resume upload
  - Resume parsing
  - AI suggestions
  - Profile updates

### 4. Resume Page (`frontend/app/resume/page.tsx`)
- ✅ Added loading state while checking authentication
- ✅ Integrated AuthStatus debug component (dev mode only)
- ✅ Better UX with loading spinner

### 5. Debug Tools (New)
- ✅ `frontend/components/debug/AuthStatus.tsx` - Visual auth status indicator
- ✅ `frontend/lib/debug-auth.ts` - Console debugging utility
- ✅ Shows token expiry, user info, and manual refresh button

## Benefits

1. **Automatic Token Refresh**: No more expired token errors
2. **Consistent Auth**: All API calls use the same authentication pattern
3. **Better UX**: Users don't need to re-authenticate manually
4. **Maintainable**: Centralized auth logic in one place

## Testing
To verify the fix:

1. Sign in to the application
2. Wait for token to expire (or manually expire it)
3. Try uploading a resume
4. Upload should succeed with automatic token refresh

## Troubleshooting

If you still see 401 errors, check the following:

### 1. Use the Auth Status Debug Component
In development mode, you'll see a "🔐 Auth Status" button in the bottom-right corner of the resume page. Click it to see:
- Whether user is signed in
- Token status and expiry time
- Ability to manually refresh the token

### 2. Verify User is Signed In
Open browser console and check:
```javascript
// Import and run debug utility
import { debugAuth } from '@/lib/debug-auth';
debugAuth();
```

Or check manually:
```javascript
// Check if user is authenticated
console.log('Current user:', firebase.auth().currentUser);
```

### 2. Check Browser Console
Look for these messages:
- ✅ "Firebase initialized successfully" - Firebase is working
- ✅ "Fresh token obtained successfully" - Token refresh is working
- ❌ "No authenticated user found. User must sign in first." - User needs to sign in
- ❌ "Error getting fresh token" - Token refresh failed
- ❌ "Authentication required. Please sign in to continue." - No valid token available

**Common Issues:**
- If you see "No authenticated user found" → User is not signed in or session expired
- If you see 401 errors → Check that backend is running and Firebase config is correct
- If token is expired → The api-client should auto-refresh, but you can manually refresh using the debug component

### 3. Verify Environment Variables
Ensure these are set in `frontend/.env.local`:
```
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 4. Check Backend is Running
The backend must be running on port 3001:
```bash
cd backend
npm run dev
```

Look for these messages in backend console:
- ✅ "Firebase Admin SDK initialized successfully"
- ✅ "Server running on port 3001"
- ⚠️ "Redis Client Error" - Redis not running (non-critical, auth will still work)

### 4.5. Test Backend Firebase Auth
Run this test script to verify backend Firebase configuration:
```bash
cd backend
node test-auth.js
```

This will check:
- Service account is properly configured
- Firebase Admin SDK can initialize
- Token verification is working

### 5. Clear Browser Cache
Sometimes cached auth state can cause issues:
1. Open DevTools → Application → Storage
2. Clear all site data
3. Sign in again

## Quick Start

**For Users:**
1. Make sure you're signed in
2. If you see 401 errors, click the "🔐 Auth Status" button (dev mode)
3. Click "🔄 Refresh Token" if token is expired
4. See `QUICK_AUTH_DEBUG.md` for step-by-step troubleshooting

**For Developers:**
1. All changes are already applied
2. Test by signing in and uploading a resume
3. Use the AuthStatus component to monitor auth state
4. Check browser console for detailed logs

## Related Files
- `frontend/lib/api-client.ts` - Centralized API client with token refresh
- `frontend/lib/auth-context.tsx` - Auth context with `getIdToken()` method
- `frontend/lib/debug-auth.ts` - Debug utility for auth troubleshooting
- `frontend/components/debug/AuthStatus.tsx` - Visual auth status component
- `frontend/components/resume/ResumeUpload.tsx` - Updated resume upload component
- `frontend/components/onboarding/OnboardingWizard.tsx` - Updated onboarding component
- `frontend/app/resume/page.tsx` - Resume page with auth check
- `backend/src/middleware/firebaseAuth.ts` - Backend token verification
- `QUICK_AUTH_DEBUG.md` - Quick troubleshooting guide
