# Resume Feature - Quick Restart Guide

## 🚀 Quick Fix Commands

### 1. Stop Everything
```bash
# Press Ctrl+C in both terminal windows (frontend and backend)
```

### 2. Restart Backend
```bash
cd backend
npm run dev
```

**Wait for:**
```
Server running on port 3001
Firebase initialized successfully
```

### 3. Restart Frontend
```bash
cd frontend
npm run dev
```

**Wait for:**
```
Ready on http://localhost:3000
```

### 4. Clear Browser Cache
```
1. Open DevTools (F12)
2. Right-click refresh button
3. Select "Empty Cache and Hard Reload"
```

### 5. Test Resume Feature
```
1. Go to http://localhost:3000/resume
2. Sign in if needed
3. Upload a resume
4. Click "Parse Resume"
5. Verify data appears
```

## 🔍 Quick Verification

### Check Backend is Working
```bash
curl http://localhost:3001/health
```

**Expected:** `{"status":"healthy",...}`

### Check Frontend Environment
```bash
cd frontend
cat .env.local | grep NEXT_PUBLIC_API_URL
```

**Expected:** `NEXT_PUBLIC_API_URL=http://localhost:3001`

### Check Authentication
Open browser console at http://localhost:3000/resume:
```javascript
// Should see:
Fresh token obtained successfully
```

## ⚠️ If Still Getting Errors

### 401 Unauthorized
```bash
# Sign out and sign in again
# Go to http://localhost:3000
# Click sign out
# Sign in again
# Try resume upload
```

### 500 Internal Server Error
```bash
# Check backend logs for detailed error
cd backend
npm run dev

# Look for error messages with stack traces
# Common issues:
# - File not found in Firestore
# - Invalid file ID
# - Missing environment variables
```

### Connection Refused
```bash
# Make sure backend is running
cd backend
npm run dev

# Check port 3001 is not in use
lsof -i :3001

# If port is in use, kill the process
kill -9 <PID>
```

## 📋 Environment Checklist

### Backend `.env`
```bash
cd backend
cat .env
```

**Required:**
- ✅ `FIREBASE_PROJECT_ID`
- ✅ `FIREBASE_PRIVATE_KEY`
- ✅ `FIREBASE_CLIENT_EMAIL`
- ✅ `FIREBASE_DATABASE_URL`
- ✅ `FRONTEND_URL=http://localhost:3000`

### Frontend `.env.local`
```bash
cd frontend
cat .env.local
```

**Required:**
- ✅ `NEXT_PUBLIC_API_URL=http://localhost:3001`
- ✅ `NEXT_PUBLIC_FIREBASE_API_KEY`
- ✅ `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- ✅ `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- ✅ `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- ✅ `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- ✅ `NEXT_PUBLIC_FIREBASE_APP_ID`
- ✅ `NEXT_PUBLIC_FIREBASE_DATABASE_URL`

## 🧪 Test Commands

### Test Resume Upload
```bash
# Get auth token first (from browser console after signing in)
TOKEN="your_token_here"

# Test upload
curl -X POST http://localhost:3001/api/candidate/resume/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "resume=@path/to/resume.pdf"
```

### Test Resume Listing
```bash
curl http://localhost:3001/api/candidate/resumes \
  -H "Authorization: Bearer $TOKEN"
```

### Test Resume Parsing
```bash
curl -X POST http://localhost:3001/api/candidate/resume/parse \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"resumeId": "your_resume_id"}'
```

## 🔧 Common Fixes

### Fix: Port Already in Use
```bash
# Find process using port 3001
lsof -i :3001

# Kill the process
kill -9 <PID>

# Or use different port
PORT=3002 npm run dev
```

### Fix: Module Not Found
```bash
# Reinstall dependencies
cd backend
rm -rf node_modules package-lock.json
npm install

cd ../frontend
rm -rf node_modules package-lock.json .next
npm install
```

### Fix: Firebase Connection Error
```bash
# Check Firebase credentials
cd backend
cat .env | grep FIREBASE

# Test Firebase connection
npm run test:firebase
```

### Fix: CORS Error
```bash
# Check backend CORS config
cd backend
cat src/index.ts | grep cors

# Ensure FRONTEND_URL is set
echo $FRONTEND_URL
```

## 📊 Success Indicators

After restart, you should see:

### Backend Terminal
```
[INFO] Server running on port 3001
[INFO] Firebase initialized successfully
[INFO] Firebase connection validated
```

### Frontend Terminal
```
Ready on http://localhost:3000
Compiled successfully
```

### Browser Console
```
Firebase initialized successfully
Fresh token obtained successfully
```

### No Errors
- ❌ No 401 Unauthorized
- ❌ No 500 Internal Server Error
- ❌ No CORS errors
- ❌ No connection refused

## 🎯 Quick Test Flow

1. **Start Backend** → Wait for "Server running"
2. **Start Frontend** → Wait for "Ready on"
3. **Open Browser** → http://localhost:3000/resume
4. **Sign In** → Use Google or email
5. **Upload Resume** → Select PDF/DOCX file
6. **Parse Resume** → Click "Parse Resume" button
7. **Verify Data** → Check skills, experience, education appear

## 📞 Still Not Working?

### Check Logs
```bash
# Backend logs
cd backend
npm run dev
# Watch for errors

# Frontend logs
cd frontend
npm run dev
# Watch for errors
```

### Check Firestore
1. Go to Firebase Console
2. Navigate to Firestore Database
3. Check collections:
   - `resumes` - Should have documents
   - `file_storage` - Should have file content
   - `users` - Should have your user

### Check Network
1. Open DevTools (F12)
2. Go to Network tab
3. Try uploading resume
4. Check failed requests
5. Look at request/response details

## 💡 Pro Tips

1. **Keep terminals visible** - Watch for errors in real-time
2. **Use browser console** - Check for client-side errors
3. **Check both logs** - Frontend and backend errors
4. **Test incrementally** - Upload → Parse → List
5. **Clear cache often** - Avoid stale data issues

## ✅ Final Checklist

- [ ] Backend running on port 3001
- [ ] Frontend running on port 3000
- [ ] Signed in to application
- [ ] Can access /resume page
- [ ] Can upload resume file
- [ ] Can parse resume
- [ ] Can see parsed data
- [ ] No console errors
- [ ] No backend errors

If all checked, the resume feature is working! 🎉
