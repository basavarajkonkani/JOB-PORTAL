# Quick Authentication Debug Guide

## 🚨 Getting 401 Errors? Follow These Steps

### Step 1: Check if You're Signed In
1. Look at the top-right corner of the page
2. Do you see your name/email? ✅ You're signed in
3. Do you see "Sign In" button? ❌ You need to sign in

### Step 2: Use the Debug Component (Development Only)
1. Go to `/resume` page
2. Click the "🔐 Auth Status" button in bottom-right corner
3. Check the status:
   - **User Signed In: ✅ Yes** → Good!
   - **User Signed In: ❌ No** → Sign in first
   - **Token Status: ✅ Valid** → Good!
   - **Token Status: ❌ EXPIRED** → Click "🔄 Refresh Token"

### Step 3: Check Browser Console
Open DevTools (F12) and look for errors:

**Good Signs:**
```
✅ Firebase initialized successfully
✅ Fresh token obtained successfully
```

**Bad Signs:**
```
❌ No authenticated user found
❌ Error getting fresh token
❌ Authentication required
```

### Step 4: Try These Fixes

#### Fix 1: Sign In Again
```
1. Click "Sign Out" (if signed in)
2. Go to /signin
3. Sign in with your credentials
4. Try uploading again
```

#### Fix 2: Clear Browser Data
```
1. Open DevTools (F12)
2. Go to Application tab
3. Click "Clear site data"
4. Refresh page
5. Sign in again
```

#### Fix 3: Refresh Token Manually
```
1. Click "🔐 Auth Status" button
2. Click "🔄 Refresh Token"
3. Page will reload
4. Try uploading again
```

#### Fix 4: Check Backend
```bash
# Make sure backend is running
cd backend
npm run dev

# Should see:
# Server running on port 3001
```

#### Fix 5: Verify Environment Variables
Check `frontend/.env.local`:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain_here
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_here
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Step 5: Still Not Working?

Run this in browser console:
```javascript
// Check current user
console.log('User:', firebase.auth().currentUser);

// Try to get token
firebase.auth().currentUser?.getIdToken(true)
  .then(token => console.log('Token:', token.substring(0, 20) + '...'))
  .catch(err => console.error('Token error:', err));
```

## Common Error Messages & Solutions

| Error Message | What It Means | Solution |
|--------------|---------------|----------|
| "Authentication required. Please sign in to continue." | No user signed in | Sign in at `/signin` |
| "Failed to load resource: 401 (Unauthorized)" | Token invalid or missing | Refresh token or sign in again |
| "No authenticated user found" | Firebase auth not initialized | Check Firebase config |
| "Token expired" | Token older than 1 hour | Token should auto-refresh, try manual refresh |

## Need More Help?

1. Check `RESUME_UPLOAD_AUTH_FIX.md` for detailed technical info
2. Check browser Network tab to see the actual request/response
3. Check backend logs for server-side errors
4. Verify Firebase project settings match your `.env` files
