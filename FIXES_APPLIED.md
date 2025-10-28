# Fixes Applied

## Issues Fixed

### 1. Next.js Metadata Warnings ✅

**Problem:** Unsupported metadata viewport and themeColor in metadata export

**Solution:**

- Separated `viewport` and `themeColor` into a dedicated `viewport` export in `frontend/app/layout.tsx`
- This follows Next.js 15 best practices for viewport configuration

**Files Changed:**

- `frontend/app/layout.tsx`

### 2. Scroll Behavior Warning ✅

**Problem:** Missing `data-scroll-behavior` attribute on `<html>` element

**Solution:**

- Added `data-scroll-behavior="smooth"` to the `<html>` element

**Files Changed:**

- `frontend/app/layout.tsx`

### 3. 401 Unauthorized Errors on Profile Page ✅

**Problem:** API calls to `/api/candidate/profile` were failing with 401 errors because the component was making requests before the Firebase auth token was available. React Strict Mode in development was causing double-mounting, triggering API calls before authentication completed.

**Solution:**

- Updated `CandidateProfile` component to wait for both `accessToken` AND `authLoading` state
- Updated `RecruiterProfile` component with the same fix
- Added dependencies on both `accessToken` and `authLoading` in useEffect
- Only fetch profile when auth is complete (`!authLoading`) and token exists (`accessToken`)
- Stop loading state if auth completes without a token

**Files Changed:**

- `frontend/components/profile/CandidateProfile.tsx`
- `frontend/components/profile/RecruiterProfile.tsx`

## Testing

After these changes:

1. ✅ No more Next.js metadata warnings in console
2. ✅ No more scroll-behavior warnings
3. ✅ Profile page loads without 401 errors
4. ✅ Authentication flow works correctly with proper token timing

## Technical Details

### Viewport Export Pattern

```typescript
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#4F46E5',
};
```

### Auth Token Dependency Pattern

```typescript
useEffect(() => {
  // Only fetch when auth is ready and we have a token
  if (!authLoading && accessToken) {
    fetchProfile();
  } else if (!authLoading && !accessToken) {
    // Auth is ready but no token - stop loading
    setLoading(false);
  }
}, [accessToken, authLoading]);
```

This ensures API calls only happen after:

1. Firebase authentication completes (`!authLoading`)
2. A valid token is available (`accessToken`)

This prevents premature API calls during React Strict Mode's double-mounting in development.
