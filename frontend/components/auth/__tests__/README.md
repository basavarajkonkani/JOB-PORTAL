# SignIn Component Tests

This directory contains comprehensive unit tests for the SignIn page redesign components.

## Test Files

### SignInHero.test.tsx
Tests for the hero section component that displays platform branding and statistics.

**Test Coverage:**
- ✅ Renders all required elements (badge, heading, bullets, statistics, rating, image)
- ✅ ARIA labels and accessibility attributes
- ✅ Hero image with correct attributes
- ✅ Custom className support
- ✅ Responsive behavior (hidden on mobile, visible on desktop)
- ✅ Gradient background classes
- ✅ Star rating display (4.5 stars)
- ✅ Check icons for bullet points

### SignIn.test.tsx
Tests for the main sign-in component with split-screen layout and authentication functionality.

**Test Coverage:**

#### Component Rendering
- ✅ Split-screen layout with hero and form
- ✅ Google sign-in button
- ✅ OR divider
- ✅ Submit button with correct text
- ✅ Login link

#### Form Validation
- ✅ Required email and password fields
- ✅ Valid email format acceptance
- ✅ Password input handling
- ✅ Optional fields (firstName, lastName, mobile)

#### Email/Password Authentication
- ✅ Calls signIn with correct credentials
- ✅ Redirects to dashboard on success
- ✅ Tracks sign-in event
- ✅ Displays error message on failure
- ✅ Does not redirect on failure

#### Google Sign-In
- ✅ Calls signInWithGoogle when button clicked
- ✅ Redirects to dashboard on success
- ✅ Tracks Google sign-in event with method property
- ✅ Displays error message on failure

#### Loading States
- ✅ Shows loading state on submit button
- ✅ Shows loading state on Google button
- ✅ Disables submit button during loading
- ✅ Disables Google button during loading
- ✅ Disables all inputs during sign-in

#### Error Handling
- ✅ Displays error in alert box with proper styling
- ✅ Clears error when starting new sign-in attempt
- ✅ Handles non-Error objects in catch block

#### Accessibility
- ✅ Proper ARIA labels on form inputs
- ✅ Announces errors to screen readers (aria-live)
- ✅ Supports keyboard navigation with Tab
- ✅ Allows form submission with Enter key

#### Responsive Behavior
- ✅ Grid layout for split-screen
- ✅ Minimum height for full viewport
- ✅ Touch-friendly input heights (44px minimum)

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- SignInHero.test.tsx
```

## Test Statistics

- **Total Test Suites:** 2
- **Total Tests:** 41
- **Pass Rate:** 100%

## Mocked Dependencies

The tests mock the following dependencies:
- `@/lib/auth-context` - Authentication context with signIn and signInWithGoogle methods
- `next/navigation` - Next.js router for navigation
- `@/lib/useAnalytics` - Analytics tracking
- `next/image` - Next.js Image component
- Firebase modules (app, auth, firestore, database, storage)

## Test Environment

- **Framework:** Jest
- **Testing Library:** React Testing Library
- **User Interaction:** @testing-library/user-event
- **Environment:** jsdom

## Coverage Areas

All requirements from the spec are covered:
- ✅ Requirement 1: Split-screen layout with hero section
- ✅ Requirement 2: Trust indicators and statistics
- ✅ Requirement 3: Email/password and Google authentication
- ✅ Requirement 4: Responsive mobile design
- ✅ Requirement 5: Existing authentication functionality maintained
- ✅ Requirement 6: Visual feedback and loading states
- ✅ Requirement 7: Navigation to sign-up page
- ✅ Requirement 8: Accessibility best practices
