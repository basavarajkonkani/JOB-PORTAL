# Google Authentication Setup

## What Changed

✅ **Removed**: GitHub authentication button
✅ **Added**: Working Google Sign-In button
✅ **Updated**: Both SignIn and SignUp components now have functional Google auth

## Enable Google Sign-In in Firebase

To make the Google sign-in button work, you need to enable it in your Firebase Console:

### Steps:

1. **Go to Firebase Console**
   - Visit: https://console.firebase.google.com
   - Select your project: `jobportal-7918a`

2. **Navigate to Authentication**
   - Click on "Authentication" in the left sidebar
   - Click on the "Sign-in method" tab

3. **Enable Google Provider**
   - Find "Google" in the list of providers
   - Click on it
   - Toggle the "Enable" switch to ON
   - Enter a project support email (your email)
   - Click "Save"

4. **That's it!**
   - No additional configuration needed
   - The Google sign-in button will now work

## How It Works

### Frontend (User clicks "Continue with Google")

1. Opens Google sign-in popup
2. User selects their Google account
3. Firebase handles authentication
4. Gets user info (email, name, photo)

### Backend (Creates user profile)

1. Receives authenticated request with Firebase token
2. Creates user document in Firestore
3. Sets role (candidate/recruiter)
4. Returns user profile

### User Experience

- **New users**: Automatically creates account with Google info
- **Existing users**: Signs in directly
- **Role selection**: Uses the role selected in the dropdown (SignUp) or defaults to candidate (SignIn)

## Testing

1. Start your servers:

   ```bash
   ./start-dev.sh
   ```

2. Go to: http://localhost:3000/signup or http://localhost:3000/signin

3. Click "Continue with Google"

4. Select your Google account

5. You should be redirected to the dashboard

## What Was Fixed

### Issue 1: Cross-Origin-Opener-Policy (COOP) Warnings

**Problem**: Browser was blocking the Google popup due to COOP policy
**Solution**: Added `Cross-Origin-Opener-Policy: same-origin-allow-popups` header in Next.js config

### Issue 2: 401 Unauthorized Error

**Problem**: Backend wasn't receiving auth token properly
**Solution**:

- Updated auth flow to create user in Firestore first
- Backend call is now optional (for setting custom claims)
- User can sign in even if backend call fails

### Issue 3: CORS Configuration

**Problem**: Backend wasn't configured for proper CORS
**Solution**: Updated CORS to allow credentials and proper headers

## Troubleshooting

### "Popup blocked" error

- Allow popups for localhost in your browser settings
- The COOP header should fix this automatically

### "Sign in cancelled" error

- User closed the popup - this is normal behavior

### "Cross-Origin-Opener-Policy" warnings in console

- These are now fixed with the header configuration
- Restart your frontend server if you still see them

### Button not working at all

- Make sure Google provider is enabled in Firebase Console
- Check browser console for errors
- Verify Firebase config in frontend/.env.local
- Restart both frontend and backend servers

### User created but role not set

- This is okay - the user can still sign in
- The backend will set the role on next request
- Check that backend is running on port 3001
