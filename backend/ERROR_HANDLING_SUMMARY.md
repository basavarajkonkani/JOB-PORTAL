# Error Handling and Graceful Degradation Implementation

This document summarizes the error handling and graceful degradation features implemented for the AI Job Portal.

## Overview

Task 13 has been completed, implementing comprehensive error handling, graceful degradation for AI failures, rate limiting, and frontend error boundaries.

## Backend Implementation

### 1. Error Handling Utilities (`backend/src/utils/errors.ts`)

**Features:**
- Centralized error codes enum (UNAUTHORIZED, VALIDATION_ERROR, AI_SERVICE_ERROR, etc.)
- `AppError` class for structured error handling
- `ErrorFactory` with factory methods for common errors
- `ErrorLogger` for contextual error logging

**Key Error Types:**
- Authentication errors (401, 403)
- Validation errors (400)
- Resource errors (404, 409)
- External service errors (503)
- Rate limiting errors (429)
- Internal server errors (500)

### 2. Error Handler Middleware (`backend/src/middleware/errorHandler.ts`)

**Features:**
- Centralized error handling middleware
- Consistent error response formatting
- Special handling for JWT, validation, and database errors
- `asyncHandler` wrapper for async route handlers
- `notFoundHandler` for 404 routes

**Error Response Format:**
```typescript
{
  code: ErrorCode,
  message: string,
  details?: any,
  fallback?: any,
  timestamp: string,
  path: string
}
```

### 3. Enhanced Rate Limiter (`backend/src/middleware/rateLimiter.ts`)

**Features:**
- IP-based rate limiting
- User-based rate limiting (requires authentication)
- Combined rate limiting (both IP and user)
- Rate limit headers (X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset)
- Retry-After header for 429 responses

**Rate Limits:**
- Auth endpoints: 5 requests per 15 minutes
- AI endpoints: 100 requests per minute per user, 500 per IP

### 4. AI Service Graceful Degradation (`backend/src/services/aiService.ts`)

**Features:**
- Fallback to cached results when AI service fails
- Default placeholder images for image generation failures
- Circuit breaker pattern for repeated failures
- Retry logic with exponential backoff
- Comprehensive error logging

**Fallback Strategy:**
- Text generation: Return cached result with warning
- Image generation: Return default SVG placeholder
- Circuit breaker: Temporarily disable service after 5 failures

### 5. Updated AI Routes (`backend/src/routes/ai.ts`)

**Features:**
- All routes use `asyncHandler` for error handling
- Rate limiting applied to all AI endpoints
- Graceful degradation with fallback support
- Warning messages for cached results
- Consistent error responses

## Frontend Implementation

### 1. Error Boundary Component (`frontend/components/ErrorBoundary.tsx`)

**Features:**
- React error boundary to catch component errors
- Prevents entire app from crashing
- Custom fallback UI support
- Error logging and reporting
- Try again and go home actions

### 2. Error Pages

**404 Not Found (`frontend/app/not-found.tsx`):**
- Friendly 404 page with navigation options
- Links to home and job browsing

**500 Error Page (`frontend/app/error.tsx`):**
- Next.js error boundary
- Error details in development mode
- Try again and go home actions

### 3. Toast Notification System (`frontend/components/Toast.tsx`)

**Features:**
- Toast notifications for user-facing errors
- Four types: success, error, warning, info
- Auto-dismiss with configurable duration
- `useToast` hook for easy integration
- Accessible with ARIA live regions

**Usage:**
```typescript
const { success, error, warning, info } = useToast();
error('Error', 'Something went wrong');
```

### 4. API Error Handler (`frontend/lib/api-error-handler.ts`)

**Features:**
- Parse API error responses
- User-friendly error messages
- Fallback value extraction
- Retry logic support
- Toast notification integration

**Key Functions:**
- `parseAPIError`: Parse error response
- `getUserFriendlyMessage`: Get readable message
- `hasFallback`: Check for fallback value
- `isRetryable`: Check if error is retryable
- `handleAPIError`: Handle error with toast

### 5. Enhanced AI Copilot Panel (`frontend/components/ai/AICopilotPanel.tsx`)

**Features:**
- Warning banner for degraded service
- Display cached results with warning
- Error state with fallback message
- Image fallback handling

## Integration

### Backend Integration

The error handling middleware is integrated in `backend/src/index.ts`:

```typescript
// 404 handler - must be after all routes
app.use(notFoundHandler);

// Error handler - must be last
app.use(errorHandler);
```

### Frontend Integration

Error boundaries can be wrapped around components:

```typescript
<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>
```

Toast notifications can be used in any component:

```typescript
const { error, success } = useToast();
// ... use in error handling
```

## Testing Recommendations

1. **Rate Limiting:**
   - Test auth endpoints with >5 requests in 15 minutes
   - Test AI endpoints with >100 requests per minute
   - Verify Retry-After headers

2. **AI Service Failures:**
   - Simulate Pollinations API failures
   - Verify fallback to cached results
   - Test circuit breaker behavior

3. **Error Boundaries:**
   - Throw errors in components
   - Verify error boundary catches them
   - Test reset functionality

4. **Toast Notifications:**
   - Test all toast types
   - Verify auto-dismiss
   - Test multiple toasts

## Requirements Satisfied

✅ **Requirement 11.1:** Fallback UI for AI text generation failures
✅ **Requirement 11.2:** Default placeholder images for AI image failures
✅ **Requirement 11.3:** Rate limiting for auth and AI endpoints
✅ **Requirement 11.4:** Error logging with context
✅ **Requirement 8.5:** Graceful degradation with cached results

## Future Enhancements

1. **Production Error Tracking:**
   - Integrate Sentry or similar service
   - Add error reporting to ErrorBoundary
   - Track error rates and patterns

2. **Redis-Based Rate Limiting:**
   - Replace in-memory store with Redis
   - Support distributed rate limiting
   - Persist rate limit data

3. **Advanced Circuit Breaker:**
   - Configurable thresholds
   - Half-open state testing
   - Per-endpoint circuit breakers

4. **Enhanced Fallback Strategy:**
   - Multiple fallback levels
   - Degraded mode indicators
   - User preference for fallbacks
