# Resume Endpoint Fix - Complete Guide

## Problem
The resume page was showing errors:
```
Failed to load resource: the server responded with a status of 500 (Internal Server Error)
Error loading versions: Error: Failed to fetch resumes
```

## Root Cause
The `/api/candidate/resumes` endpoint was failing because of a **missing Firestore composite index**.

The query in the backend code requires:
- Filter by `userId`
- Order by `uploadedAt` (descending)

This combination requires a composite index in Firestore.

## Solution Applied

### 1. ✅ Added Firestore Index
Updated `backend/firestore.indexes.json` with the required index:

```json
{
  "collectionGroup": "resumes",
  "queryScope": "COLLECTION",
  "fields": [
    {
      "fieldPath": "userId",
      "order": "ASCENDING"
    },
    {
      "fieldPath": "uploadedAt",
      "order": "DESCENDING"
    }
  ]
}
```

### 2. ✅ Deployed Index to Firebase
```bash
cd backend
firebase deploy --only firestore:indexes --project jobportal-7918a
```

Status: **Successfully deployed** ✅

### 3. ✅ Improved Error Messages
Updated the error handling in `backend/src/routes/resume.ts` to provide better feedback when the index is still building.

### 4. ✅ Started Backend Server
The backend is now running on http://localhost:3001

## Index Build Time
⏱️ **Important**: Firestore indexes take 2-5 minutes to build after deployment.

Check the status at:
https://console.firebase.google.com/project/jobportal-7918a/firestore/indexes

## Testing

### Option 1: Wait and Refresh
1. Wait 2-5 minutes for the index to build
2. Refresh your browser on the resume page
3. The error should be gone

### Option 2: Use Test Script
```bash
# Get your auth token from browser console after logging in
TEST_AUTH_TOKEN=your_token_here ./test-resume-endpoint.sh
```

### Option 3: Manual cURL Test
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:3001/api/candidate/resumes
```

## Expected Behavior After Fix

### Before (Error):
```json
{
  "code": "INTERNAL_ERROR",
  "message": "Failed to fetch resumes"
}
```

### After (Success):
```json
{
  "resumes": [
    {
      "id": "resume-id",
      "fileName": "my-resume.pdf",
      "fileUrl": "https://...",
      "uploadedAt": "2025-11-01T...",
      "versions": [...]
    }
  ]
}
```

## What Was Changed

### Files Modified:
1. `backend/firestore.indexes.json` - Added resume index
2. `backend/src/routes/resume.ts` - Improved error handling
3. `backend/RESUME_FIX_SUMMARY.md` - Documentation
4. `test-resume-endpoint.sh` - Test script

### Files Created:
- `backend/src/scripts/check-resume-fix.ts` - Index verification script
- `test-resume-endpoint.sh` - Quick endpoint test
- `RESUME_ENDPOINT_FIX.md` - This guide

## Troubleshooting

### Still seeing 500 errors after 5 minutes?

1. **Check Index Status**
   - Go to Firebase Console: https://console.firebase.google.com/project/jobportal-7918a/firestore/indexes
   - Look for the `resumes` index
   - Status should be "Enabled" (green)

2. **Check Backend Logs**
   - Look at the terminal where backend is running
   - Check for any error messages

3. **Verify Authentication**
   - Make sure you're logged in
   - Check browser console for auth token
   - Token should be valid and not expired

4. **Check Backend is Running**
   ```bash
   curl http://localhost:3001/api/health
   ```

### Index is taking longer than 5 minutes?

This can happen if:
- Firebase is under heavy load
- Your collection has many documents
- Network issues

Usually resolves within 10-15 minutes maximum.

## Next Steps

Once the index is ready:
1. ✅ Resume upload will work
2. ✅ Resume parsing will work
3. ✅ Resume listing will work
4. ✅ Resume editing will work

All resume functionality should be fully operational!

## Need Help?

If you're still experiencing issues after following this guide:
1. Check the backend logs for specific error messages
2. Verify the index status in Firebase Console
3. Try the test script to isolate the issue
4. Check your authentication token is valid

---

**Status**: Fix deployed, waiting for index to build (2-5 minutes)
**Backend**: Running on http://localhost:3001
**Index**: Deployed to Firebase
