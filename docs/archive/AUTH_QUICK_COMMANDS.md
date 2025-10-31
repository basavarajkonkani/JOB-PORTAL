# Authentication Fix - Quick Commands

## 🚀 Quick Start (Run These Commands)

### 1. Test Backend Configuration
```bash
cd backend
node test-auth.js
```
**Expected:** All checks pass ✅

### 2. Start Backend
```bash
cd backend
npm run dev
```
**Expected:** "Server running on port 3001" ✅

### 3. Start Frontend (in new terminal)
```bash
cd frontend
npm run dev
```
**Expected:** "Ready on http://localhost:3000" ✅

### 4. Test Upload
1. Go to: http://localhost:3000/resume
2. Sign in if needed
3. Upload a resume
4. Should succeed ✅

## 🔍 Debugging Commands

### Check if Backend is Running
```bash
curl http://localhost:3001/health
# or
lsof -i :3001
```

### Check Backend Logs
```bash
cd backend
npm run dev
# Watch for:
# ✅ "Firebase Admin SDK initialized successfully"
# ✅ "Token verified successfully for user: ..."
```

### Check Frontend Auth State (Browser Console)
```javascript
// Check current user
firebase.auth().currentUser

// Get token
firebase.auth().currentUser?.getIdToken(true)
  .then(token => console.log('Token:', token.substring(0, 20) + '...'))
```

### Test Backend Auth Directly
```bash
cd backend
node test-auth.js
```

## 🛠️ Fix Commands

### Restart Everything
```bash
# Kill all processes
pkill -f "node.*backend"
pkill -f "node.*frontend"

# Start backend
cd backend && npm run dev &

# Start frontend
cd frontend && npm run dev &
```

### Clear Browser Cache
```javascript
// In browser console
localStorage.clear();
sessionStorage.clear();
location.reload();
```

### Reset Redis (if installed)
```bash
redis-cli FLUSHALL
# or restart Redis
brew services restart redis
```

### Check Environment Variables
```bash
# Backend
cd backend
cat .env | grep FIREBASE

# Frontend
cd frontend
cat .env.local | grep FIREBASE
```

## ⚡ One-Line Fixes

### "Authentication failed" error
```bash
cd backend && node test-auth.js
```

### "No authenticated user found" error
- Sign out and sign in again in the browser

### "Token expired" error
- Refresh the page (token should auto-refresh)

### Backend won't start
```bash
cd backend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Frontend won't start
```bash
cd frontend
rm -rf node_modules .next package-lock.json
npm install
npm run dev
```

## 📊 Health Check Commands

### Full System Check
```bash
# 1. Backend health
curl http://localhost:3001/health

# 2. Backend auth test
cd backend && node test-auth.js

# 3. Check processes
ps aux | grep node

# 4. Check ports
lsof -i :3000  # Frontend
lsof -i :3001  # Backend
lsof -i :6379  # Redis (optional)
```

### Quick Status Check
```bash
echo "Backend:" && curl -s http://localhost:3001/health && echo "\nFrontend:" && curl -s http://localhost:3000 > /dev/null && echo "✅ Running" || echo "❌ Not running"
```

## 🐛 Debug Mode

### Enable Verbose Logging (Backend)
```bash
cd backend
DEBUG=* npm run dev
```

### Enable Verbose Logging (Frontend)
Add to `frontend/.env.local`:
```
NEXT_PUBLIC_DEBUG=true
```

### Check Network Requests (Browser)
1. Open DevTools (F12)
2. Go to Network tab
3. Filter: "resume/upload"
4. Check request headers for Authorization token
5. Check response for error details

## 📝 Quick Verification

Run this checklist:
```bash
# 1. Backend test
cd backend && node test-auth.js && echo "✅ Backend OK"

# 2. Backend running
curl -s http://localhost:3001/health && echo "✅ Backend running"

# 3. Frontend running
curl -s http://localhost:3000 > /dev/null && echo "✅ Frontend running"

# 4. Redis (optional)
redis-cli ping && echo "✅ Redis running" || echo "⚠️ Redis not running (optional)"
```

## 🆘 Emergency Reset

If nothing works, nuclear option:
```bash
# Stop everything
pkill -f node

# Backend reset
cd backend
rm -rf node_modules package-lock.json .next
npm install

# Frontend reset
cd ../frontend
rm -rf node_modules package-lock.json .next
npm install

# Start fresh
cd ../backend && npm run dev &
cd ../frontend && npm run dev &
```

## 📞 Still Having Issues?

1. Check `AUTH_FIX_COMPLETE.md` for detailed troubleshooting
2. Check `QUICK_AUTH_DEBUG.md` for user-friendly guide
3. Verify all environment variables are set
4. Check both frontend and backend console logs
5. Use the AuthStatus debug component (🔐 button)
