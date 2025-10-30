# Quick Cleanup Guide

## 🚀 Fast Track - Run Everything

```bash
# Make scripts executable
chmod +x cleanup-project.sh cleanup-code.sh optimize-images.sh

# Run full cleanup (this will take a few minutes)
npm run cleanup

# Verify everything works
npm run dev
```

## 📋 Step-by-Step Cleanup

### Step 1: Clean Project Files
```bash
npm run cleanup
```
This removes:
- 60+ documentation files
- Build artifacts
- Debug files
- Migration data
- Reinstalls dependencies

### Step 2: Clean Source Code
```bash
npm run cleanup:code
```
This removes:
- console.log statements
- Debug code
- Unused imports

### Step 3: Optimize Images (Optional)
```bash
npm run optimize:images
```
This optimizes:
- PNG files
- JPG files
- SVG files

### Step 4: Verify
```bash
# Clean build
npm run build:clean

# Run linting
npm run lint

# Start development server
npm run dev

# Run tests
cd backend && npm test
cd frontend && npm run test:e2e
```

## 🎯 What Gets Cleaned

### ✅ Removed
- 60+ temporary documentation files
- Build artifacts (dist/, .next/)
- Test results and reports
- Debug components
- Migration data
- console.log statements
- TODO comments
- Unused imports

### ✅ Kept
- README.md
- SETUP.md
- DEPLOYMENT.md
- All source code (cleaned)
- All tests
- Configuration files
- Docker files
- CI/CD workflows

## 🔍 Manual Verification

After cleanup, check:

1. **Application runs:**
   ```bash
   npm run dev
   # Visit http://localhost:3000
   ```

2. **No console.log in browser:**
   - Open browser console
   - Navigate through the app
   - Should see no debug logs

3. **Linting passes:**
   ```bash
   npm run lint
   ```

4. **Tests pass:**
   ```bash
   cd backend && npm test
   ```

## 📊 Expected Results

### File Count
- Before: 150+ files in root
- After: ~20 essential files

### Code Quality
- Before: 50+ console.log statements
- After: 0 console.log (proper logging only)

### Size
- Before: ~150 MB (with artifacts)
- After: ~50 MB (clean)

## 🚨 Troubleshooting

### If cleanup fails:
```bash
# Reset to git state
git reset --hard

# Try manual cleanup
rm -rf backend/dist frontend/.next
npm install
```

### If app doesn't start:
```bash
# Reinstall dependencies
rm -rf node_modules backend/node_modules frontend/node_modules
npm install
```

### If tests fail:
```bash
# Check environment variables
cat backend/.env
cat frontend/.env.local

# Rebuild
npm run build:clean
npm run build
```

## ✨ Next Steps

After cleanup:
1. Commit changes: `git add . && git commit -m "Clean and optimize project"`
2. Test thoroughly: `npm run dev`
3. Run tests: `npm test`
4. Deploy: `npm run deploy`

## 📝 Maintenance

Run cleanup periodically:
- Before major releases
- After feature development
- Monthly maintenance

```bash
# Quick maintenance
npm run build:clean
npm run lint
npm test
```
