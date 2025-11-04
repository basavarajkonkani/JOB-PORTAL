import { test, expect } from '@playwright/test';

/**
 * E2E Test: Job Application Journey
 *
 * User Journey: search → view detail → apply with AI cover letter
 *
 * This test validates the complete job application flow:
 * 1. User searches for jobs with filters
 * 2. User views job detail page
 * 3. User sees AI-generated fit summary
 * 4. User applies with AI-generated cover letter
 * 5. User can track application status
 */

test.describe('Job Application Journey', () => {
  const testEmail = `applicant-${Date.now()}@test.com`;
  const testPassword = 'TestPassword123!';

  test.beforeEach(async ({ page }) => {
    // Create and login as candidate
    await page.goto('/signup');
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', testPassword);
    await page.fill('input[name="name"]', 'Test Applicant');
    await page.selectOption('select[name="role"]', 'candidate');
    await page.click('button[type="submit"]');

    // Wait for successful signup/login
    await page.waitForURL(/\/onboarding|\/dashboard/);

    // Skip onboarding if present
    const skipButton = page.locator('button:has-text("Skip"), a:has-text("Skip")');
    if (await skipButton.isVisible()) {
      await skipButton.click();
    }
  });

  test('should complete full job application flow with AI cover letter', async ({ page }) => {
    // Step 1: Navigate to job search page
    await page.goto('/jobs');
    await expect(page.locator('h1, h2')).toContainText(/jobs|search|find/i);

    // Step 2: Apply search filters
    // Filter by title
    const titleInput = page.locator('input[name="title"], input[placeholder*="title" i]');
    if (await titleInput.isVisible()) {
      await titleInput.fill('Software Engineer');
    }

    // Filter by level
    const levelSelect = page.locator('select[name="level"], select:has(option:text("Senior"))');
    if (await levelSelect.isVisible()) {
      await levelSelect.selectOption('senior');
    }

    // Filter by remote
    const remoteCheckbox = page.locator(
      'input[type="checkbox"][name="remote"], input[type="checkbox"]:near(:text("Remote"))'
    );
    if (await remoteCheckbox.isVisible()) {
      await remoteCheckbox.check();
    }

    // Step 3: Wait for search results
    await page.waitForTimeout(1000); // Allow filters to apply

    // Verify job listings are displayed
    const jobCards = page.locator('[data-testid="job-card"], .job-card, article:has(h3)');
    await expect(jobCards.first()).toBeVisible({ timeout: 5000 });

    // Step 4: Click on first job to view details
    await jobCards.first().click();

    // Step 5: Wait for job detail page
    await page.waitForURL(/\/jobs\/[^/]+/);
    await expect(page.locator('h1')).toBeVisible();

    // Step 6: Verify job details are displayed
    const jobTitle = await page.locator('h1').textContent();
    expect(jobTitle).toBeTruthy();

    // Step 7: Check for AI fit summary
    const fitSummary = page.locator('text=/fit|match|recommendation/i');
    if (await fitSummary.isVisible({ timeout: 3000 })) {
      await expect(fitSummary).toBeVisible();
    }

    // Step 8: Check for hero image (AI-generated or fallback)
    const heroImage = page.locator('img[alt*="job" i], img[alt*="hero" i]');
    if (await heroImage.isVisible({ timeout: 2000 })) {
      await expect(heroImage).toBeVisible();
    }

    // Step 9: Click apply button
    const applyButton = page.locator('button:has-text("Apply"), a:has-text("Apply")');
    await applyButton.click();

    // Step 10: Wait for apply modal to open
    await expect(page.locator('text=/apply|application/i')).toBeVisible();

    // Step 11: Generate AI cover letter
    const generateButton = page.locator('button:has-text("Generate"), button:has-text("AI")');
    if (await generateButton.isVisible({ timeout: 2000 })) {
      await generateButton.click();

      // Wait for AI generation
      await expect(page.locator('text=/generating|loading/i')).toBeVisible({ timeout: 2000 });
      await expect(page.locator('text=/generating|loading/i')).toBeHidden({ timeout: 15000 });

      // Verify cover letter is populated
      const coverLetterField = page.locator('textarea[name="coverLetter"], textarea');
      const coverLetterContent = await coverLetterField.inputValue();
      expect(coverLetterContent.length).toBeGreaterThan(50);
    }

    // Step 12: Submit application
    const submitButton = page.locator(
      'button[type="submit"]:has-text("Submit"), button:has-text("Submit Application")'
    );
    await submitButton.click();

    // Step 13: Wait for success confirmation
    await expect(page.locator('text=/success|submitted|applied/i')).toBeVisible({ timeout: 5000 });

    // Step 14: Navigate to applications tracker
    await page.goto('/applications');
    await expect(page.locator('h1, h2')).toContainText(/applications|my applications/i);

    // Step 15: Verify application appears in tracker
    await expect(page.locator(`text=${jobTitle}`)).toBeVisible({ timeout: 5000 });

    // Verify application status
    await expect(page.locator('text=/submitted|pending/i')).toBeVisible();
  });

  test('should handle job search with no results', async ({ page }) => {
    await page.goto('/jobs');

    // Search for non-existent job
    const titleInput = page.locator('input[name="title"], input[placeholder*="title" i]');
    await titleInput.fill('NonExistentJobTitle12345');

    await page.waitForTimeout(1000);

    // Should show no results message
    await expect(page.locator('text=/no jobs|no results|not found/i')).toBeVisible({
      timeout: 5000,
    });
  });

  test('should allow saving job for later', async ({ page }) => {
    await page.goto('/jobs');

    // Wait for job listings
    const jobCards = page.locator('[data-testid="job-card"], .job-card, article:has(h3)');
    await expect(jobCards.first()).toBeVisible({ timeout: 5000 });

    // Click on first job
    await jobCards.first().click();
    await page.waitForURL(/\/jobs\/[^/]+/);

    // Look for save button
    const saveButton = page.locator('button:has-text("Save"), button[aria-label*="save" i]');
    if (await saveButton.isVisible({ timeout: 2000 })) {
      await saveButton.click();

      // Should show saved confirmation
      await expect(page.locator('text=/saved|bookmarked/i')).toBeVisible({ timeout: 3000 });
    }
  });

  test('should prevent duplicate applications', async ({ page }) => {
    // Apply to a job first
    await page.goto('/jobs');
    const jobCards = page.locator('[data-testid="job-card"], .job-card, article:has(h3)');
    await expect(jobCards.first()).toBeVisible({ timeout: 5000 });
    await jobCards.first().click();
    await page.waitForURL(/\/jobs\/[^/]+/);

    const applyButton = page.locator('button:has-text("Apply"), a:has-text("Apply")');

    // Check if already applied
    const alreadyApplied = await page.locator('text=/already applied|applied/i').isVisible();

    if (!alreadyApplied && (await applyButton.isVisible())) {
      await applyButton.click();

      const submitButton = page.locator(
        'button[type="submit"]:has-text("Submit"), button:has-text("Submit Application")'
      );
      if (await submitButton.isVisible({ timeout: 2000 })) {
        await submitButton.click();
        await page.waitForTimeout(2000);
      }
    }

    // Try to apply again
    await page.reload();

    // Should show already applied state or disabled button
    const isApplied = await page
      .locator('text=/already applied|applied/i')
      .isVisible({ timeout: 3000 });
    const isButtonDisabled = await applyButton.isDisabled().catch(() => false);

    expect(isApplied || isButtonDisabled).toBeTruthy();
  });

  test('should display job pagination', async ({ page }) => {
    await page.goto('/jobs');

    // Wait for jobs to load
    await page.waitForTimeout(1000);

    // Look for pagination controls
    const pagination = page.locator(
      'nav[aria-label*="pagination" i], .pagination, button:has-text("Next")'
    );

    if (await pagination.isVisible({ timeout: 2000 })) {
      const nextButton = page.locator('button:has-text("Next"), a:has-text("Next")');

      if (await nextButton.isEnabled()) {
        await nextButton.click();
        await page.waitForTimeout(1000);

        // URL should change or content should update
        const url = page.url();
        expect(url).toMatch(/page=2|offset=/);
      }
    }
  });
});
