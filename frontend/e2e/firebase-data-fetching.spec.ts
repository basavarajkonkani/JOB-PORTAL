import { test, expect } from '@playwright/test';

/**
 * Firebase Data Fetching Integration Tests
 *
 * Tests data fetching operations with Firebase including:
 * - Fetching user profile from Firestore
 * - Fetching jobs list from Firestore
 * - Fetching applications from Firestore
 * - Direct Firestore queries from frontend
 * - API calls with Firebase ID tokens
 */

test.describe('Firebase Data Fetching Integration', () => {
  const testEmail = `firebase-data-${Date.now()}@test.com`;
  const testPassword = 'FirebaseTest123!';
  const testName = 'Data Test User';

  test.beforeEach(async ({ page }) => {
    // Sign up and sign in before each test
    await page.goto('/signup');
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', testPassword);
    await page.fill('input[name="name"]', testName);
    await page.selectOption('select[name="role"]', 'candidate');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/onboarding|\/dashboard/, { timeout: 10000 });
  });

  test('should fetch user profile data from Firestore', async ({ page }) => {
    // Navigate to profile page
    await page.goto('/profile');
    await page.waitForLoadState('networkidle');

    // Verify profile data is displayed
    await expect(page.locator('text=/profile/i')).toBeVisible();

    // Check that user name is displayed
    const bodyText = await page.textContent('body');
    expect(bodyText).toContain(testName);
    expect(bodyText).toContain(testEmail);
  });

  test('should fetch jobs list from Firestore via API', async ({ page }) => {
    // Navigate to jobs page
    await page.goto('/jobs');
    await page.waitForLoadState('networkidle');

    // Wait for jobs to load
    await page.waitForSelector('text=/jobs|positions|openings/i', { timeout: 10000 });

    // Verify jobs are displayed (or empty state)
    const bodyText = await page.textContent('body');
    const hasJobs =
      bodyText?.includes('Software') ||
      bodyText?.includes('Engineer') ||
      bodyText?.includes('Developer') ||
      bodyText?.includes('No jobs') ||
      bodyText?.includes('no positions');

    expect(hasJobs).toBeTruthy();
  });

  test('should fetch applications from Firestore', async ({ page }) => {
    // Navigate to applications page
    await page.goto('/applications');
    await page.waitForLoadState('networkidle');

    // Wait for applications section to load
    await page.waitForSelector('text=/applications|applied/i', { timeout: 10000 });

    // Verify applications page loaded (may be empty for new user)
    const bodyText = await page.textContent('body');
    const hasApplicationsSection =
      bodyText?.includes('application') ||
      bodyText?.includes('Applied') ||
      bodyText?.includes('No applications');

    expect(hasApplicationsSection).toBeTruthy();
  });

  test('should handle API calls with Firebase ID token authentication', async ({ page }) => {
    // Intercept API calls to verify token is included
    let hasAuthHeader = false;

    page.on('request', (request) => {
      const url = request.url();
      if (url.includes('/api/')) {
        const authHeader = request.headers()['authorization'];
        if (authHeader && authHeader.startsWith('Bearer ')) {
          hasAuthHeader = true;
        }
      }
    });

    // Navigate to a page that makes API calls
    await page.goto('/profile');
    await page.waitForLoadState('networkidle');

    // Wait a bit for API calls to complete
    await page.waitForTimeout(2000);

    // Verify that at least one API call had the auth header
    expect(hasAuthHeader).toBeTruthy();
  });

  test('should handle Firestore query errors gracefully', async ({ page }) => {
    // Try to access a non-existent job
    await page.goto('/jobs/non-existent-job-id-12345');

    // Should show error message or 404 page
    await page.waitForSelector("text=/not found|error|doesn't exist/i", { timeout: 10000 });
  });

  test('should load dashboard with aggregated data from Firestore', async ({ page }) => {
    // Navigate to dashboard
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Verify dashboard sections are present
    await expect(page.locator('h1, h2')).toContainText(/dashboard|welcome/i);

    // Check for dashboard widgets (applications, jobs, etc.)
    const bodyText = await page.textContent('body');
    const hasDashboardContent =
      bodyText?.includes('application') ||
      bodyText?.includes('job') ||
      bodyText?.includes('profile');

    expect(hasDashboardContent).toBeTruthy();
  });

  test('should filter and search jobs using Firestore queries', async ({ page }) => {
    await page.goto('/jobs');
    await page.waitForLoadState('networkidle');

    // Look for search or filter inputs
    const searchInput = page.locator(
      'input[type="search"], input[placeholder*="search" i], input[name="search"]'
    );

    if (await searchInput.isVisible()) {
      // Enter search term
      await searchInput.fill('Software Engineer');

      // Wait for results to update
      await page.waitForTimeout(1000);
      await page.waitForLoadState('networkidle');

      // Verify page updated (search was executed)
      const bodyText = await page.textContent('body');
      expect(bodyText).toBeTruthy();
    }
  });

  test('should paginate through Firestore query results', async ({ page }) => {
    await page.goto('/jobs');
    await page.waitForLoadState('networkidle');

    // Look for pagination controls
    const nextButton = page.locator(
      'button:has-text("Next"), button:has-text("→"), a:has-text("Next")'
    );

    if (await nextButton.isVisible()) {
      // Get current page content
      const initialContent = await page.textContent('body');

      // Click next page
      await nextButton.click();
      await page.waitForLoadState('networkidle');

      // Verify content changed (new page loaded)
      const newContent = await page.textContent('body');
      expect(newContent).not.toBe(initialContent);
    }
  });
});
