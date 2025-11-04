import { test, expect } from '@playwright/test';

/**
 * Firebase Authentication Integration Tests
 *
 * Tests the Firebase Authentication integration including:
 * - User signup with Firebase Auth
 * - User signin with Firebase Auth
 * - Token management and refresh
 * - Auth state persistence
 * - Sign out functionality
 */

test.describe('Firebase Authentication Integration', () => {
  const testEmail = `firebase-auth-${Date.now()}@test.com`;
  const testPassword = 'FirebaseTest123!';
  const testName = 'Firebase Test User';

  test('should sign up a new user with Firebase Authentication', async ({ page }) => {
    // Navigate to signup page
    await page.goto('/signup');

    // Fill signup form
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', testPassword);
    await page.fill('input[name="name"]', testName);
    await page.selectOption('select[name="role"]', 'candidate');

    // Submit form
    await page.click('button[type="submit"]');

    // Should redirect to onboarding or dashboard
    await page.waitForURL(/\/onboarding|\/dashboard/, { timeout: 10000 });

    // Verify user is authenticated by checking for user-specific elements
    const bodyText = await page.textContent('body');
    expect(bodyText).toContain(testName);
  });

  test('should sign in existing user with Firebase Authentication', async ({ page }) => {
    // Navigate to signin page
    await page.goto('/signin');

    // Fill signin form
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', testPassword);

    // Submit form
    await page.click('button[type="submit"]');

    // Should redirect to dashboard
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });

    // Verify user is authenticated
    await expect(page.locator('h1, h2')).toContainText(/dashboard|welcome/i);
  });

  test('should persist authentication state across page reloads', async ({ page }) => {
    // Sign in first
    await page.goto('/signin');
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', testPassword);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });

    // Reload the page
    await page.reload();

    // Should still be on dashboard (not redirected to signin)
    await expect(page).toHaveURL(/\/dashboard/);

    // User info should still be visible
    const bodyText = await page.textContent('body');
    expect(bodyText).toContain(testName);
  });

  test('should handle invalid credentials gracefully', async ({ page }) => {
    await page.goto('/signin');

    // Try to sign in with wrong password
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', 'WrongPassword123!');
    await page.click('button[type="submit"]');

    // Should show error message
    await expect(page.locator('text=/invalid|wrong|incorrect|error/i')).toBeVisible({
      timeout: 5000,
    });

    // Should stay on signin page
    await expect(page).toHaveURL(/\/signin/);
  });

  test('should sign out user and clear authentication state', async ({ page }) => {
    // Sign in first
    await page.goto('/signin');
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', testPassword);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });

    // Find and click sign out button
    const signOutButton = page.locator(
      'button:has-text("Sign Out"), button:has-text("Logout"), a:has-text("Sign Out"), a:has-text("Logout")'
    );
    await signOutButton.click();

    // Should redirect to home or signin page
    await page.waitForURL(/\/signin|^\/$/, { timeout: 5000 });

    // Try to access protected route
    await page.goto('/dashboard');

    // Should redirect to signin
    await page.waitForURL(/\/signin/, { timeout: 5000 });
  });

  test('should handle Firebase token refresh automatically', async ({ page, context }) => {
    // Sign in
    await page.goto('/signin');
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', testPassword);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });

    // Get initial token from localStorage or cookies
    const initialAuth = await page.evaluate(() => {
      return localStorage.getItem('firebase:authUser');
    });

    expect(initialAuth).toBeTruthy();

    // Make an API request that requires authentication
    await page.goto('/profile');
    await page.waitForLoadState('networkidle');

    // Verify the page loaded successfully (token was valid/refreshed)
    await expect(page.locator('text=/profile/i')).toBeVisible();
  });

  test('should prevent duplicate email registration', async ({ page }) => {
    // Try to sign up with existing email
    await page.goto('/signup');
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', 'AnotherPassword123!');
    await page.fill('input[name="name"]', 'Another User');
    await page.selectOption('select[name="role"]', 'candidate');
    await page.click('button[type="submit"]');

    // Should show error about email already in use
    await expect(page.locator('text=/already|exists|registered/i')).toBeVisible({ timeout: 5000 });
  });
});
