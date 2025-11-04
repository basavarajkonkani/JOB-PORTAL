import { test, expect } from '@playwright/test';

/**
 * E2E Test: Candidate Onboarding Journey
 *
 * User Journey: signup → upload resume → view profile
 *
 * This test validates the complete onboarding flow for a new candidate:
 * 1. User signs up with email and password
 * 2. User is redirected to onboarding wizard
 * 3. User uploads a resume file
 * 4. System parses resume and displays profile data
 * 5. User confirms profile and is redirected to dashboard
 * 6. User can view their complete profile
 */

test.describe('Candidate Onboarding Journey', () => {
  const testEmail = `candidate-${Date.now()}@test.com`;
  const testPassword = 'TestPassword123!';
  const testName = 'Test Candidate';

  test('should complete full onboarding flow from signup to profile view', async ({ page }) => {
    // Step 1: Navigate to signup page
    await page.goto('/signup');
    await expect(page).toHaveTitle(/Sign Up|AI Job Portal/i);

    // Step 2: Fill out signup form
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', testPassword);
    await page.fill('input[name="name"]', testName);
    await page.selectOption('select[name="role"]', 'candidate');

    // Step 3: Submit signup form
    await page.click('button[type="submit"]');

    // Step 4: Wait for redirect to onboarding wizard
    await page.waitForURL(/\/onboarding/);
    await expect(page.locator('h1, h2')).toContainText(/onboarding|welcome|get started/i);

    // Step 5: Upload resume file
    // Create a mock resume file
    const resumeContent = `
      John Doe
      Software Engineer
      
      Skills: TypeScript, React, Node.js, PostgreSQL
      
      Experience:
      Senior Software Engineer at Tech Corp (2020-2023)
      - Built scalable web applications
      - Led team of 5 developers
      
      Education:
      BS Computer Science, University of Technology (2016-2020)
    `;

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'resume.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from(resumeContent),
    });

    // Step 6: Wait for resume parsing to complete
    await expect(page.locator('text=/parsing|processing/i')).toBeVisible({ timeout: 2000 });
    await expect(page.locator('text=/parsing|processing/i')).toBeHidden({ timeout: 10000 });

    // Step 7: Verify parsed profile data is displayed
    await expect(page.locator('text=/skills|experience|education/i')).toBeVisible();

    // Step 8: Confirm profile and complete onboarding
    const confirmButton = page.locator(
      'button:has-text("Confirm"), button:has-text("Complete"), button:has-text("Continue")'
    );
    await confirmButton.click();

    // Step 9: Wait for redirect to dashboard
    await page.waitForURL(/\/dashboard/);
    await expect(page.locator('h1, h2')).toContainText(/dashboard|welcome/i);

    // Step 10: Navigate to profile page
    await page.click('a[href="/profile"], button:has-text("Profile")');
    await page.waitForURL(/\/profile/);

    // Step 11: Verify profile data is displayed
    await expect(page.locator('text=/profile/i')).toBeVisible();
    await expect(page.locator(`text=${testName}`)).toBeVisible();

    // Verify profile sections exist
    const profileContent = await page.textContent('body');
    expect(profileContent).toMatch(/skills|experience|education/i);
  });

  test('should handle resume upload errors gracefully', async ({ page }) => {
    // Login first (assuming user exists from previous test or seed data)
    await page.goto('/signin');
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', testPassword);
    await page.click('button[type="submit"]');

    // Navigate to onboarding
    await page.goto('/onboarding');

    // Try to upload invalid file type
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'document.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('Invalid file content'),
    });

    // Should show error message
    await expect(page.locator('text=/invalid|error|pdf|docx/i')).toBeVisible({ timeout: 5000 });
  });

  test('should allow skipping onboarding and manual profile entry', async ({ page }) => {
    const skipEmail = `candidate-skip-${Date.now()}@test.com`;

    // Signup
    await page.goto('/signup');
    await page.fill('input[name="email"]', skipEmail);
    await page.fill('input[name="password"]', testPassword);
    await page.fill('input[name="name"]', 'Skip Test User');
    await page.selectOption('select[name="role"]', 'candidate');
    await page.click('button[type="submit"]');

    // Wait for onboarding
    await page.waitForURL(/\/onboarding/);

    // Look for skip button
    const skipButton = page.locator('button:has-text("Skip"), a:has-text("Skip")');
    if (await skipButton.isVisible()) {
      await skipButton.click();

      // Should redirect to dashboard or profile
      await page.waitForURL(/\/dashboard|\/profile/);
      await expect(page).toHaveURL(/\/dashboard|\/profile/);
    }
  });
});
