# Firebase Storage Setup Guide

## Problem
The Firebase Storage bucket doesn't exist yet. You need to enable and create it in the Firebase Console.

## Quick Fix - Enable Firebase Storage

### Option 1: Via Firebase Console (Recommended)

1. **Go to Firebase Console**
   - Visit: https://console.firebase.google.com/
   - Select your project: `jobportal-7918a`

2. **Enable Storage**
   - Click on "Storage" in the left sidebar
   - Click "Get Started"
   - Click "Next" on the security rules dialog
   - Select a location (choose closest to your users, e.g., `us-central1`)
   - Click "Done"

3. **Verify Bucket Name**
   - After creation, you should see the bucket name
   - It should be: `jobportal-7918a.appspot.com`
   - If different, update `backend/.env` with the correct name

4. **Set Storage Rules (Important!)**
   - Go to the "Rules" tab in Storage
   - Replace with these rules:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Allow authenticated users to upload to their own folder
    match /resumes/{userId}/{fileName} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Allow authenticated users to upload avatars
    match /avatars/{userId}/{fileName} {
      allow read: if true; // Public read
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

5. **Publish the rules**
   - Click "Publish"

### Option 2: Via Firebase CLI

```bash
# Install Firebase CLI if not already installed
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in your project
cd /path/to/your/project
firebase init storage

# Select your project: jobportal-7918a
# Accept default storage rules file location

# Deploy storage rules
firebase deploy --only storage
```

## Verify Setup

After enabling storage, restart your backend and try uploading again:

```bash
# In backend directory
npm run dev
```

Then try uploading a resume. You should see:
```
✅ Storage bucket obtained
✅ File uploaded to Firebase Storage successfully
```

## Alternative: Use Firestore for File Metadata Only

If you can't enable Storage right now, you can temporarily store files as base64 in Firestore (not recommended for production):

1. Update `backend/src/utils/storageHelper.ts` to use Firestore
2. Store file as base64 string
3. Return data URL instead of storage URL

But this is NOT recommended because:
- Firestore has document size limits (1MB)
- It's more expensive
- Slower performance

## Troubleshooting

### Error: "The specified bucket does not exist"
**Solution:** Enable Firebase Storage in the console (see steps above)

### Error: "Permission denied"
**Solution:** Check storage rules allow authenticated users to write

### Error: "Bucket name mismatch"
**Solution:** Verify bucket name in Firebase Console matches `backend/.env`

## Check Current Configuration

Your current backend configuration:
```
FIREBASE_STORAGE_BUCKET=jobportal-7918a.appspot.com
```

This should match the bucket name shown in Firebase Console under Storage.

## Quick Test

After enabling storage, test with this command:

```bash
cd backend
node test-auth.js
```

This will verify Firebase is properly configured.

## Next Steps

1. ✅ Enable Firebase Storage in console
2. ✅ Set storage rules
3. ✅ Restart backend
4. ✅ Try uploading resume
5. ✅ Verify file appears in Firebase Storage console

---

**Need Help?**
- Firebase Storage Docs: https://firebase.google.com/docs/storage
- Firebase Console: https://console.firebase.google.com/
