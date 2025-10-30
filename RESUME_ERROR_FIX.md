# Resume Endpoints Error Fix

## Errors Fixed

### 1. 401 Unauthorized Error
**Error**: `Failed to load resource: the server responded with a status of 401 (Unauthorized)`

**Cause**: The ResumeEditor component was using expired tokens from `useAuth()` instead of the automatic token refresh mechanism.

**Fix**: Updated `frontend/components/resume/ResumeEditor.tsx` to use `apiRequest` from `api-client.ts` which automatically refreshes tokens.

### 2. 500 Internal Server Error
**Cause**: Backend errors when processing resume requests, likely due to:
- Missing file in Firestore storage
- Invalid file ID extraction
- Token validation issues

**Fix**: Already fixed in previous update to backend files.

## Changes Made

### Frontend: `frontend/components/resume/ResumeEditor.tsx`

**Before:**
```typescript
import { useAuth } from '@/lib/auth-context';

const { accessToken } = useAuth();

const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/candidate/resumes`, {
  headers: {
    Authorization: `Bearer ${accessToken}`,
  },
});
```

**After:**
```typescript
import { apiRequest } from '@/lib/api-client';

const data = await apiRequest('/api/candidate/resumes');
```

**Benefits:**
- ✅ Automatic token refresh
- ✅ Consistent error handling
- ✅ No expired token issues
- ✅ Cleaner code

## Verification Steps

### 1. Check Frontend Environment
```bash
cd frontend
cat .env.local
```

Ensure you have:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_FIREBASE_API_KEY=your-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-domain
# ... other Firebase config
```

### 2. Check Backend is Running
```bash
# In backend terminal
cd backend
npm run dev

# Should see:
# Server running on port 3001
# Firebase initialized successfully
```

### 3. Test Authentication
Open browser console on http://localhost:3000/resume and check:
```javascript
// Should see:
Fresh token obtained successfully
```

### 4. Test Resume Upload
1. Go to http://localhost:3000/resume
2. Upload a PDF or DOCX file
3. Check browser console - should see success
4. Check backend logs - should see:
   ```
   [INFO] Resume uploaded successfully { resumeId: '...', userId: '...', fileName: '...' }
   ```

### 5. Test Resume Parsing
1. After upload, click "Parse Resume"
2. Check browser console - should see success
3. Check backend logs - should see:
   ```
   [INFO] File downloaded from Firestore storage { storagePath: '...', fileId: '...', bufferSize: ... }
   [INFO] Resume parsed successfully { storagePath: '...', skillsCount: ..., experienceCount: ..., educationCount: ... }
   ```

### 6. Test Resume Listing
1. Refresh the page
2. Should automatically load resumes
3. Check backend logs - should see:
   ```
   [INFO] Resumes fetched successfully { userId: '...', count: ... }
   ```

## Common Issues & Solutions

### Issue: "Authentication required"
**Solution:**
1. Make sure you're signed in
2. Check Firebase config in `.env.local`
3. Clear browser cache and sign in again
4. Check browser console for Firebase errors

### Issue: "Failed to load resource: 401"
**Solution:**
1. Token expired - the fix should handle this automatically
2. If still happening, sign out and sign in again
3. Check that `apiRequest` is being used (not direct fetch)

### Issue: "Failed to load resource: 500"
**Possible Causes:**
1. File not found in Firestore
2. Invalid file ID
3. Backend error

**Debug Steps:**
```bash
# Check backend logs
cd backend
npm run dev

# Look for error messages with stack traces
```

**Check Firestore:**
1. Go to Firebase Console
2. Navigate to Firestore Database
3. Check collections:
   - `resumes` - Should have your resume documents
   - `file_storage` - Should have file content with matching IDs

### Issue: "File not found in storage"
**Solution:**
1. Check Firestore `file_storage` collection
2. Verify file ID matches between `resumes` and `file_storage`
3. Re-upload the file if necessary

### Issue: Parsing returns empty data
**Solution:**
1. Check that the resume has standard formatting
2. Try with a different resume
3. Check backend logs for parsing details
4. The parser looks for sections like "Skills", "Experience", "Education"

## Testing the Fix

### Quick Test Script
```bash
# 1. Start backend
cd backend
npm run dev

# 2. In another terminal, start frontend
cd frontend
npm run dev

# 3. Open browser to http://localhost:3000/resume
# 4. Sign in if not already
# 5. Upload a resume
# 6. Click "Parse Resume"
# 7. Check that data appears
```

### Expected Behavior
1. **Upload**: File uploads successfully, shows success message
2. **Parse**: Parsing completes, shows parsed data in editor
3. **List**: Resumes load automatically on page load
4. **No 401 errors**: Token refreshes automatically
5. **No 500 errors**: Backend processes requests successfully

## API URL Configuration

The frontend needs to know where the backend is running. Check your configuration:

### Development (Local)
```env
# frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Production
```env
# frontend/.env.local or hosting platform env vars
NEXT_PUBLIC_API_URL=https://your-backend-domain.com
```

### Verify API URL
```bash
# In frontend directory
echo $NEXT_PUBLIC_API_URL

# Or check in browser console
console.log(process.env.NEXT_PUBLIC_API_URL)
```

## Backend CORS Configuration

Ensure backend allows requests from frontend:

```typescript
// backend/src/index.ts
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  })
);
```

Check backend `.env`:
```env
FRONTEND_URL=http://localhost:3000
```

## Debugging Tips

### Enable Verbose Logging

**Frontend:**
```typescript
// In browser console
localStorage.setItem('debug', 'api:*');
```

**Backend:**
```bash
# In backend/.env
LOG_LEVEL=debug
```

### Check Network Tab
1. Open browser DevTools (F12)
2. Go to Network tab
3. Filter by "Fetch/XHR"
4. Look for resume-related requests
5. Check request headers (should have Authorization)
6. Check response status and body

### Check Backend Logs
```bash
# Backend terminal should show:
[INFO] POST /api/candidate/resume/upload
[INFO] Resume uploaded successfully
[INFO] POST /api/candidate/resume/parse
[INFO] File downloaded from Firestore storage
[INFO] Resume parsed successfully
[INFO] GET /api/candidate/resumes
[INFO] Resumes fetched successfully
```

## Files Modified

1. ✅ `frontend/components/resume/ResumeEditor.tsx` - Use apiRequest for token refresh
2. ✅ `backend/src/routes/resume.ts` - Better error handling
3. ✅ `backend/src/utils/resumeParser.ts` - Fixed Firestore file download
4. ✅ `backend/src/utils/storageHelper.ts` - Consistent file ID extraction

## Next Steps

1. ✅ Clear browser cache
2. ✅ Restart frontend dev server
3. ✅ Restart backend dev server
4. ✅ Sign in again
5. ✅ Test resume upload
6. ✅ Test resume parsing
7. ✅ Verify no 401/500 errors

## Success Indicators

✅ No 401 errors in console
✅ No 500 errors in console
✅ Resume uploads successfully
✅ Resume parses successfully
✅ Parsed data displays in editor
✅ Backend logs show successful operations
✅ Token refreshes automatically

## Still Having Issues?

1. **Check all environment variables** are set correctly
2. **Restart both servers** (frontend and backend)
3. **Clear browser cache** and cookies
4. **Sign out and sign in** again
5. **Check Firebase Console** for any service issues
6. **Review backend logs** for detailed error messages
7. **Check Firestore** collections for data integrity

## Contact Points

If issues persist:
1. Check backend logs for detailed error messages
2. Check browser console for client-side errors
3. Verify Firestore collections have correct data
4. Ensure Firebase config is correct
5. Test with a simple PDF resume first
