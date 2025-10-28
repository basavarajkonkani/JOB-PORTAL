# 🔧 Linting Issues - Action Items

## Summary
- **Frontend:** 11 warnings, 11 errors (mostly TypeScript and React best practices)
- **Backend:** 45 errors (all in test files - Jest configuration issue)
- **Impact:** Non-blocking, but should be fixed for code quality

---

## Frontend Issues to Fix

### 1. TypeScript `any` Types (8 instances) - HIGH PRIORITY

**Files:**
- `components/jobs/JobDetailPage.tsx` (lines 34, 35)
- `components/onboarding/OnboardingWizard.tsx` (lines 9, 10, 16, 17, 222)
- `components/profile/CandidateProfile.tsx` (line 121)

**Fix:** Replace `any` with proper TypeScript types

**Example:**
```typescript
// ❌ Bad
const handleSubmit = (data: any) => { ... }

// ✅ Good
interface FormData {
  name: string;
  email: string;
}
const handleSubmit = (data: FormData) => { ... }
```

---

### 2. React Hooks Dependencies (4 instances) - MEDIUM PRIORITY

**Files:**
- `components/jobs/JobDetailPage.tsx` (lines 66, 72)
- `components/jobs/JobSearchPage.tsx` (line 64)
- `components/onboarding/OnboardingWizard.tsx` (line 182)
- `components/profile/CandidateProfile.tsx` (line 61)

**Fix:** Add missing dependencies to useEffect dependency arrays

**Example:**
```typescript
// ❌ Bad
useEffect(() => {
  fetchData();
}, [id]); // Missing 'fetchData'

// ✅ Good
useEffect(() => {
  fetchData();
}, [id, fetchData]);

// Or wrap fetchData in useCallback
const fetchData = useCallback(() => { ... }, [dependencies]);
```

---

### 3. Unused Variables (7 instances) - LOW PRIORITY

**Files:**
- `components/applications/ApplicationsTracker.tsx` - `fetchApplications`
- `components/dashboard/CandidateDashboard.tsx` - `fetchRecentActivity`
- `components/jobs/JobCard.tsx` - `Image`, `err`
- `components/jobs/JobDetailPage.tsx` - `err`
- `components/onboarding/OnboardingWizard.tsx` - `user`, `totalSteps`, `i`, `handleAddSkill`

**Fix:** Either use the variables or remove them

---

### 4. Next.js Best Practices (2 instances) - MEDIUM PRIORITY

**Image Optimization:**
- `components/jobs/ImageWithFallback.tsx` (line 55)
- Replace `<img>` with Next.js `<Image />` component

**Link Component:**
- `components/jobs/JobDetailPage.tsx` (line 221)
- Replace `<a>` with Next.js `<Link />` component

**Example:**
```typescript
// ❌ Bad
<a href="/jobs/">Back to Jobs</a>

// ✅ Good
import Link from 'next/link';
<Link href="/jobs/">Back to Jobs</Link>
```

---

### 5. JSX Unescaped Entities (3 instances) - LOW PRIORITY

**File:** `components/onboarding/OnboardingWizard.tsx` (lines 314, 337, 594)

**Fix:** Escape apostrophes in JSX

**Example:**
```typescript
// ❌ Bad
<p>Let's get started</p>

// ✅ Good
<p>Let&apos;s get started</p>
// or
<p>{"Let's get started"}</p>
```

---

### 6. Const vs Let (1 instance) - LOW PRIORITY

**File:** `components/profile/CandidateProfile.tsx` (line 187)

**Fix:** Use `const` instead of `let` for variables that aren't reassigned

---

## Backend Issues to Fix

### Jest Configuration Issue (45 errors) - EASY FIX

**File:** `backend/src/__tests__/ai-service.test.ts`

**Problem:** ESLint doesn't recognize Jest globals (describe, it, expect, jest)

**Solution 1: Add Jest environment to ESLint config**

Update `backend/eslint.config.mjs` or `.eslintrc`:
```javascript
module.exports = {
  env: {
    jest: true,
    node: true,
  },
  // ... rest of config
};
```

**Solution 2: Add Jest types**
```bash
cd backend
npm install --save-dev @types/jest
```

**Solution 3: Add ESLint Jest plugin**
```bash
cd backend
npm install --save-dev eslint-plugin-jest
```

Then update ESLint config:
```javascript
module.exports = {
  plugins: ['jest'],
  extends: ['plugin:jest/recommended'],
  // ... rest of config
};
```

---

## Quick Fix Commands

### Auto-fix what's possible:
```bash
# Frontend
cd frontend
npm run lint -- --fix

# Backend
cd backend
npm run lint:fix
```

### Manual fixes needed:
- TypeScript `any` types
- React hooks dependencies
- Next.js Link/Image components

---

## Priority Order

1. **Backend Jest config** (5 min) - Fixes 45 errors at once
2. **Frontend TypeScript types** (30 min) - Improves type safety
3. **React hooks dependencies** (20 min) - Prevents bugs
4. **Next.js best practices** (15 min) - Performance & SEO
5. **Unused variables** (10 min) - Code cleanup
6. **JSX entities** (5 min) - Minor cleanup

**Total estimated time:** ~1.5 hours

---

## Testing After Fixes

```bash
# Run linting
npm run lint --workspaces

# Run tests
cd backend && npm test
cd frontend && npm run test:e2e

# Verify connections still work
./scripts/test-connections.sh
```

---

## Notes

- All linting issues are **non-blocking** - the application works fine
- These are **code quality improvements** for maintainability
- The connection test shows **all systems are operational**
- Focus on high-priority items first for maximum impact
