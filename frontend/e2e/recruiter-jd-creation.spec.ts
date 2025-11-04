import { test, expect } from '@playwright/test';

/**
 * E2E Test: Recruiter JD Creation Journey
 *
 * User Journey: login → create job with AI → publish
 *
 * This test validates the complete recruiter job description creation flow:
 * 1. Recruiter logs in
 * 2. Recruiter navigates to JD wizard
 * 3. Recruiter inputs job notes
 * 4. AI generates structured job description
 * 5. Recruiter edits and refines JD
 * 6. AI generates hero banner image
 * 7. Recruiter publishes job
 * 8. Job appears in recruiter dashboard
 */

test.describe('Recruiter JD Creation Journey', () => {
  const testEmail = `recruiter-${Date.now()}@test.com`;
  const testPassword = 'TestPassword123!';
  const testOrgName = 'Test Company Inc';

  test.beforeEach(async ({ page }) => {
    // Create and login as recruiter
    await page.goto('/signup');
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', testPassword);
    await page.fill('input[name="name"]', 'Test Recruiter');
    await page.selectOption('select[name="role"]', 'recruiter');
    await page.click('button[type="submit"]');

    // Wait for successful signup/login
    await page.waitForURL(/\/recruiter|\/dashboard/);
  });

  test('should complete full JD creation flow with AI assistance', async ({ page }) => {
    // Step 1: Navigate to recruiter dashboard
    await page.goto('/recruiter');
    await expect(page.locator('h1, h2')).toContainText(/dashboard|recruiter/i);

    // Step 2: Click create job button
    const createJobButton = page.locator(
      'button:has-text("Create Job"), a:has-text("Create Job"), button:has-text("New Job")'
    );
    await createJobButton.click();

    // Step 3: Wait for JD wizard to load
    await page.waitForURL(/\/recruiter\/jobs\/new|\/recruiter\/jobs\/create/);
    await expect(page.locator('h1, h2')).toContainText(/create|new job|job description/i);

    // Step 4: Fill in job notes for AI generation
    const jobNotes = `
      We need a Senior Software Engineer for our backend team.
      
      Requirements:
      - 5+ years of experience with Node.js and TypeScript
      - Experience with PostgreSQL and Redis
      - Strong understanding of REST APIs and microservices
      - Experience with AWS or similar cloud platforms
      
      Responsibilities:
      - Design and implement scalable backend services
      - Mentor junior developers
      - Collaborate with frontend team
      
      Compensation: $120k-$160k + equity
      Location: Remote (US only)
      Type: Full-time
    `;

    const notesField = page.locator(
      'textarea[name="notes"], textarea[placeholder*="notes" i], textarea'
    );
    await notesField.fill(jobNotes);

    // Step 5: Generate JD with AI
    const generateButton = page.locator(
      'button:has-text("Generate"), button:has-text("AI Generate"), button:has-text("Create with AI")'
    );
    await generateButton.click();

    // Step 6: Wait for AI generation
    await expect(page.locator('text=/generating|creating|processing/i')).toBeVisible({
      timeout: 2000,
    });
    await expect(page.locator('text=/generating|creating|processing/i')).toBeHidden({
      timeout: 20000,
    });

    // Step 7: Verify JD fields are populated
    const titleField = page.locator('input[name="title"]');
    const titleValue = await titleField.inputValue();
    expect(titleValue.length).toBeGreaterThan(0);
    expect(titleValue).toMatch(/senior|software|engineer/i);

    // Verify description is populated
    const descriptionField = page.locator('textarea[name="description"], [contenteditable="true"]');
    const descriptionValue =
      (await descriptionField.textContent()) || (await descriptionField.inputValue());
    expect(descriptionValue.length).toBeGreaterThan(100);

    // Step 8: Edit JD if needed
    await titleField.fill('Senior Backend Engineer - Remote');

    // Step 9: Fill additional required fields
    const levelSelect = page.locator('select[name="level"]');
    if (await levelSelect.isVisible()) {
      await levelSelect.selectOption('senior');
    }

    const locationField = page.locator('input[name="location"]');
    if (await locationField.isVisible()) {
      await locationField.fill('Remote - United States');
    }

    const typeSelect = page.locator('select[name="type"]');
    if (await typeSelect.isVisible()) {
      await typeSelect.selectOption('full-time');
    }

    const remoteCheckbox = page.locator('input[type="checkbox"][name="remote"]');
    if (await remoteCheckbox.isVisible()) {
      await remoteCheckbox.check();
    }

    // Step 10: Generate hero image
    const generateImageButton = page.locator(
      'button:has-text("Generate Image"), button:has-text("Hero Image")'
    );
    if (await generateImageButton.isVisible({ timeout: 2000 })) {
      await generateImageButton.click();

      // Wait for image generation
      await page.waitForTimeout(2000);

      // Verify image preview appears
      const imagePreview = page.locator('img[alt*="hero" i], img[alt*="preview" i]');
      await expect(imagePreview).toBeVisible({ timeout: 5000 });
    }

    // Step 11: Publish job
    const publishButton = page.locator(
      'button:has-text("Publish"), button[type="submit"]:has-text("Create")'
    );
    await publishButton.click();

    // Step 12: Wait for success confirmation
    await expect(page.locator('text=/published|created|success/i')).toBeVisible({ timeout: 5000 });

    // Step 13: Verify redirect to recruiter dashboard or job list
    await page.waitForURL(/\/recruiter/);

    // Step 14: Verify job appears in dashboard
    await expect(
      page.locator('text=/Senior Backend Engineer|Senior Software Engineer/i')
    ).toBeVisible({ timeout: 5000 });
  });

  test('should allow manual JD creation without AI', async ({ page }) => {
    await page.goto('/recruiter');

    // Create new job
    const createJobButton = page.locator(
      'button:has-text("Create Job"), a:has-text("Create Job"), button:has-text("New Job")'
    );
    await createJobButton.click();

    await page.waitForURL(/\/recruiter\/jobs\/new|\/recruiter\/jobs\/create/);

    // Fill fields manually
    await page.fill('input[name="title"]', 'Manual Test Job');

    const levelSelect = page.locator('select[name="level"]');
    if (await levelSelect.isVisible()) {
      await levelSelect.selectOption('mid');
    }

    await page.fill('input[name="location"]', 'San Francisco, CA');

    const typeSelect = page.locator('select[name="type"]');
    if (await typeSelect.isVisible()) {
      await typeSelect.selectOption('full-time');
    }

    const descriptionField = page.locator('textarea[name="description"], [contenteditable="true"]');
    await descriptionField.fill('This is a manually created job description for testing purposes.');

    // Publish
    const publishButton = page.locator(
      'button:has-text("Publish"), button[type="submit"]:has-text("Create")'
    );
    await publishButton.click();

    // Verify success
    await expect(page.locator('text=/published|created|success/i')).toBeVisible({ timeout: 5000 });
  });

  test('should save JD as draft', async ({ page }) => {
    await page.goto('/recruiter');

    const createJobButton = page.locator(
      'button:has-text("Create Job"), a:has-text("Create Job"), button:has-text("New Job")'
    );
    await createJobButton.click();

    await page.waitForURL(/\/recruiter\/jobs\/new|\/recruiter\/jobs\/create/);

    // Fill minimal fields
    await page.fill('input[name="title"]', 'Draft Job Title');

    // Look for save as draft button
    const saveDraftButton = page.locator('button:has-text("Save Draft"), button:has-text("Draft")');
    if (await saveDraftButton.isVisible({ timeout: 2000 })) {
      await saveDraftButton.click();

      // Should show saved confirmation
      await expect(page.locator('text=/saved|draft/i')).toBeVisible({ timeout: 5000 });
    }
  });

  test('should display validation errors for incomplete JD', async ({ page }) => {
    await page.goto('/recruiter');

    const createJobButton = page.locator(
      'button:has-text("Create Job"), a:has-text("Create Job"), button:has-text("New Job")'
    );
    await createJobButton.click();

    await page.waitForURL(/\/recruiter\/jobs\/new|\/recruiter\/jobs\/create/);

    // Try to publish without filling required fields
    const publishButton = page.locator(
      'button:has-text("Publish"), button[type="submit"]:has-text("Create")'
    );
    await publishButton.click();

    // Should show validation errors
    await expect(page.locator('text=/required|error|invalid/i')).toBeVisible({ timeout: 3000 });
  });

  test('should allow editing published job', async ({ page }) => {
    // First create a job
    await page.goto('/recruiter');

    const createJobButton = page.locator(
      'button:has-text("Create Job"), a:has-text("Create Job"), button:has-text("New Job")'
    );
    await createJobButton.click();

    await page.waitForURL(/\/recruiter\/jobs\/new|\/recruiter\/jobs\/create/);

    // Fill and publish
    await page.fill('input[name="title"]', 'Job to Edit');

    const levelSelect = page.locator('select[name="level"]');
    if (await levelSelect.isVisible()) {
      await levelSelect.selectOption('senior');
    }

    await page.fill('input[name="location"]', 'New York, NY');

    const descriptionField = page.locator('textarea[name="description"], [contenteditable="true"]');
    await descriptionField.fill('Original job description');

    const publishButton = page.locator(
      'button:has-text("Publish"), button[type="submit"]:has-text("Create")'
    );
    await publishButton.click();

    await page.waitForTimeout(2000);

    // Navigate back to dashboard
    await page.goto('/recruiter');

    // Find and click edit button for the job
    const editButton = page.locator('button:has-text("Edit"), a:has-text("Edit")').first();
    if (await editButton.isVisible({ timeout: 3000 })) {
      await editButton.click();

      // Should navigate to edit page
      await page.waitForURL(/\/recruiter\/jobs\/[^/]+\/edit|\/recruiter\/jobs\/[^/]+/);

      // Modify title
      const titleField = page.locator('input[name="title"]');
      await titleField.fill('Edited Job Title');

      // Save changes
      const saveButton = page.locator('button:has-text("Save"), button:has-text("Update")');
      await saveButton.click();

      // Verify success
      await expect(page.locator('text=/updated|saved|success/i')).toBeVisible({ timeout: 5000 });
    }
  });

  test('should display recruiter dashboard statistics', async ({ page }) => {
    await page.goto('/recruiter');

    // Verify dashboard elements
    await expect(page.locator('h1, h2')).toContainText(/dashboard|recruiter/i);

    // Look for statistics
    const statsElements = page.locator('text=/open roles|active jobs|applicants|pipeline/i');
    await expect(statsElements.first()).toBeVisible({ timeout: 5000 });
  });
});
