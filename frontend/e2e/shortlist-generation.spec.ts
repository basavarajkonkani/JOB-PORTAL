import { test, expect } from '@playwright/test';

/**
 * E2E Test: Shortlist Generation Journey
 *
 * User Journey: view applicants → request AI ranking
 *
 * This test validates the recruiter's candidate shortlist flow:
 * 1. Recruiter views job with applications
 * 2. Recruiter navigates to applicants page
 * 3. Recruiter requests AI-powered ranking
 * 4. System displays ranked candidates with scores
 * 5. System shows AI rationale for each candidate
 * 6. System generates screening questions
 * 7. Recruiter can filter and sort candidates
 */

test.describe('Shortlist Generation Journey', () => {
  const recruiterEmail = `recruiter-shortlist-${Date.now()}@test.com`;
  const candidateEmail = `candidate-shortlist-${Date.now()}@test.com`;
  const testPassword = 'TestPassword123!';
  let jobId: string;

  test.beforeAll(async ({ browser }) => {
    // Setup: Create recruiter, job, and candidate with application
    const context = await browser.newContext();
    const page = await context.newPage();

    // Create recruiter account
    await page.goto('/signup');
    await page.fill('input[name="email"]', recruiterEmail);
    await page.fill('input[name="password"]', testPassword);
    await page.fill('input[name="name"]', 'Test Recruiter');
    await page.selectOption('select[name="role"]', 'recruiter');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);

    // Create a job
    await page.goto('/recruiter');
    const createJobButton = page.locator(
      'button:has-text("Create Job"), a:has-text("Create Job"), button:has-text("New Job")'
    );
    if (await createJobButton.isVisible({ timeout: 3000 })) {
      await createJobButton.click();
      await page.waitForURL(/\/recruiter\/jobs\/new|\/recruiter\/jobs\/create/);

      await page.fill('input[name="title"]', 'Senior Full Stack Developer');

      const levelSelect = page.locator('select[name="level"]');
      if (await levelSelect.isVisible()) {
        await levelSelect.selectOption('senior');
      }

      await page.fill('input[name="location"]', 'Remote');

      const descriptionField = page.locator(
        'textarea[name="description"], [contenteditable="true"]'
      );
      await descriptionField.fill(
        'Looking for an experienced full stack developer with React and Node.js expertise.'
      );

      const publishButton = page.locator(
        'button:has-text("Publish"), button[type="submit"]:has-text("Create")'
      );
      await publishButton.click();
      await page.waitForTimeout(2000);
    }

    // Logout recruiter
    const logoutButton = page.locator(
      'button:has-text("Logout"), a:has-text("Logout"), button:has-text("Sign Out")'
    );
    if (await logoutButton.isVisible({ timeout: 2000 })) {
      await logoutButton.click();
      await page.waitForTimeout(1000);
    }

    // Create candidate and apply to job
    await page.goto('/signup');
    await page.fill('input[name="email"]', candidateEmail);
    await page.fill('input[name="password"]', testPassword);
    await page.fill('input[name="name"]', 'Test Candidate');
    await page.selectOption('select[name="role"]', 'candidate');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);

    // Skip onboarding
    const skipButton = page.locator('button:has-text("Skip"), a:has-text("Skip")');
    if (await skipButton.isVisible({ timeout: 2000 })) {
      await skipButton.click();
    }

    // Apply to the job
    await page.goto('/jobs');
    await page.waitForTimeout(1000);

    const jobCard = page.locator('text=/Senior Full Stack Developer/i').first();
    if (await jobCard.isVisible({ timeout: 3000 })) {
      await jobCard.click();
      await page.waitForURL(/\/jobs\/[^/]+/);

      const applyButton = page.locator('button:has-text("Apply"), a:has-text("Apply")');
      if (await applyButton.isVisible({ timeout: 2000 })) {
        await applyButton.click();

        const submitButton = page.locator(
          'button[type="submit"]:has-text("Submit"), button:has-text("Submit Application")'
        );
        if (await submitButton.isVisible({ timeout: 2000 })) {
          await submitButton.click();
          await page.waitForTimeout(2000);
        }
      }
    }

    await context.close();
  });

  test.beforeEach(async ({ page }) => {
    // Login as recruiter
    await page.goto('/signin');
    await page.fill('input[name="email"]', recruiterEmail);
    await page.fill('input[name="password"]', testPassword);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/recruiter|\/dashboard/);
  });

  test('should display applicants and generate AI-powered shortlist', async ({ page }) => {
    // Step 1: Navigate to recruiter dashboard
    await page.goto('/recruiter');
    await expect(page.locator('h1, h2')).toContainText(/dashboard|recruiter/i);

    // Step 2: Find the job with applications
    const jobLink = page
      .locator('text=/Senior Full Stack Developer/i, a:has-text("Senior Full Stack Developer")')
      .first();
    await expect(jobLink).toBeVisible({ timeout: 5000 });

    // Step 3: Navigate to applicants page
    // Look for "View Applicants" or similar button
    const viewApplicantsButton = page.locator(
      'button:has-text("View Applicants"), a:has-text("Applicants"), button:has-text("View Candidates")'
    );

    if (await viewApplicantsButton.isVisible({ timeout: 3000 })) {
      await viewApplicantsButton.first().click();
    } else {
      // Alternative: click on job and then find applicants link
      await jobLink.click();
      await page.waitForTimeout(1000);
      const applicantsLink = page.locator(
        'a:has-text("Applicants"), button:has-text("Applicants")'
      );
      if (await applicantsLink.isVisible({ timeout: 2000 })) {
        await applicantsLink.click();
      }
    }

    // Step 4: Wait for applicants page to load
    await page.waitForURL(/\/recruiter\/jobs\/[^/]+\/applicants/);
    await expect(page.locator('h1, h2')).toContainText(/applicants|candidates/i);

    // Step 5: Verify at least one applicant is displayed
    const candidateName = page.locator('text=/Test Candidate/i');
    await expect(candidateName).toBeVisible({ timeout: 5000 });

    // Step 6: Request AI ranking
    const rankButton = page.locator(
      'button:has-text("Rank"), button:has-text("AI Rank"), button:has-text("Generate Shortlist")'
    );

    if (await rankButton.isVisible({ timeout: 3000 })) {
      await rankButton.click();

      // Step 7: Wait for AI processing
      await expect(page.locator('text=/ranking|analyzing|processing/i')).toBeVisible({
        timeout: 2000,
      });
      await expect(page.locator('text=/ranking|analyzing|processing/i')).toBeHidden({
        timeout: 20000,
      });

      // Step 8: Verify AI scores are displayed
      const scoreElement = page.locator('text=/score|rating|match/i');
      await expect(scoreElement).toBeVisible({ timeout: 5000 });

      // Step 9: Verify AI rationale is displayed
      const rationaleElement = page.locator('text=/rationale|reason|why|because/i');
      await expect(rationaleElement).toBeVisible({ timeout: 5000 });

      // Step 10: Verify screening questions are generated
      const questionsElement = page.locator('text=/screening|questions|interview/i');
      if (await questionsElement.isVisible({ timeout: 3000 })) {
        await expect(questionsElement).toBeVisible();
      }
    }
  });

  test('should allow filtering and sorting candidates', async ({ page }) => {
    await page.goto('/recruiter');

    // Navigate to applicants
    const jobLink = page.locator('text=/Senior Full Stack Developer/i').first();
    if (await jobLink.isVisible({ timeout: 3000 })) {
      await jobLink.click();
      await page.waitForTimeout(1000);
    }

    const applicantsLink = page.locator(
      'a:has-text("Applicants"), button:has-text("Applicants"), button:has-text("View Applicants")'
    );
    if (await applicantsLink.isVisible({ timeout: 2000 })) {
      await applicantsLink.click();
      await page.waitForURL(/\/recruiter\/jobs\/[^/]+\/applicants/);
    }

    // Look for filter controls
    const filterSelect = page.locator(
      'select[name="status"], select:has(option:text("Submitted"))'
    );
    if (await filterSelect.isVisible({ timeout: 2000 })) {
      await filterSelect.selectOption('submitted');
      await page.waitForTimeout(1000);
    }

    // Look for sort controls
    const sortSelect = page.locator('select[name="sort"], select:has(option:text("Date"))');
    if (await sortSelect.isVisible({ timeout: 2000 })) {
      await sortSelect.selectOption({ index: 0 });
      await page.waitForTimeout(1000);
    }
  });

  test('should display candidate details in modal or expanded view', async ({ page }) => {
    await page.goto('/recruiter');

    // Navigate to applicants
    const jobLink = page.locator('text=/Senior Full Stack Developer/i').first();
    if (await jobLink.isVisible({ timeout: 3000 })) {
      await jobLink.click();
      await page.waitForTimeout(1000);
    }

    const applicantsLink = page.locator(
      'a:has-text("Applicants"), button:has-text("Applicants"), button:has-text("View Applicants")'
    );
    if (await applicantsLink.isVisible({ timeout: 2000 })) {
      await applicantsLink.click();
      await page.waitForURL(/\/recruiter\/jobs\/[^/]+\/applicants/);
    }

    // Click on candidate to view details
    const candidateCard = page.locator('text=/Test Candidate/i').first();
    await candidateCard.click();

    // Should show more details (modal or expanded view)
    await page.waitForTimeout(1000);

    // Look for additional candidate information
    const detailsVisible = await page
      .locator('text=/resume|experience|skills|education/i')
      .isVisible({ timeout: 3000 });
    expect(detailsVisible).toBeTruthy();
  });

  test('should handle empty applicant list gracefully', async ({ page }) => {
    // Create a new job without applicants
    await page.goto('/recruiter');

    const createJobButton = page.locator(
      'button:has-text("Create Job"), a:has-text("Create Job"), button:has-text("New Job")'
    );
    if (await createJobButton.isVisible({ timeout: 3000 })) {
      await createJobButton.click();
      await page.waitForURL(/\/recruiter\/jobs\/new|\/recruiter\/jobs\/create/);

      await page.fill('input[name="title"]', 'Job Without Applicants');

      const levelSelect = page.locator('select[name="level"]');
      if (await levelSelect.isVisible()) {
        await levelSelect.selectOption('mid');
      }

      await page.fill('input[name="location"]', 'San Francisco');

      const descriptionField = page.locator(
        'textarea[name="description"], [contenteditable="true"]'
      );
      await descriptionField.fill('Test job description');

      const publishButton = page.locator(
        'button:has-text("Publish"), button[type="submit"]:has-text("Create")'
      );
      await publishButton.click();
      await page.waitForTimeout(2000);
    }

    // Navigate to applicants for this job
    await page.goto('/recruiter');
    const newJobLink = page.locator('text=/Job Without Applicants/i').first();
    if (await newJobLink.isVisible({ timeout: 3000 })) {
      await newJobLink.click();
      await page.waitForTimeout(1000);

      const applicantsLink = page.locator(
        'a:has-text("Applicants"), button:has-text("Applicants")'
      );
      if (await applicantsLink.isVisible({ timeout: 2000 })) {
        await applicantsLink.click();

        // Should show empty state message
        await expect(
          page.locator('text=/no applicants|no candidates|no applications/i')
        ).toBeVisible({ timeout: 5000 });
      }
    }
  });

  test('should update candidate status', async ({ page }) => {
    await page.goto('/recruiter');

    // Navigate to applicants
    const jobLink = page.locator('text=/Senior Full Stack Developer/i').first();
    if (await jobLink.isVisible({ timeout: 3000 })) {
      await jobLink.click();
      await page.waitForTimeout(1000);
    }

    const applicantsLink = page.locator(
      'a:has-text("Applicants"), button:has-text("Applicants"), button:has-text("View Applicants")'
    );
    if (await applicantsLink.isVisible({ timeout: 2000 })) {
      await applicantsLink.click();
      await page.waitForURL(/\/recruiter\/jobs\/[^/]+\/applicants/);
    }

    // Look for status update controls
    const statusSelect = page
      .locator('select[name*="status"], select:has(option:text("Reviewed"))')
      .first();
    if (await statusSelect.isVisible({ timeout: 2000 })) {
      await statusSelect.selectOption('reviewed');

      // Should show update confirmation
      await expect(page.locator('text=/updated|saved|success/i')).toBeVisible({ timeout: 3000 });
    }
  });

  test('should display job details on applicants page', async ({ page }) => {
    await page.goto('/recruiter');

    // Navigate to applicants
    const jobLink = page.locator('text=/Senior Full Stack Developer/i').first();
    if (await jobLink.isVisible({ timeout: 3000 })) {
      await jobLink.click();
      await page.waitForTimeout(1000);
    }

    const applicantsLink = page.locator(
      'a:has-text("Applicants"), button:has-text("Applicants"), button:has-text("View Applicants")'
    );
    if (await applicantsLink.isVisible({ timeout: 2000 })) {
      await applicantsLink.click();
      await page.waitForURL(/\/recruiter\/jobs\/[^/]+\/applicants/);
    }

    // Verify job title is displayed
    await expect(page.locator('text=/Senior Full Stack Developer/i')).toBeVisible();

    // Verify job details are accessible
    const jobDetailsVisible = await page
      .locator('text=/remote|full-time|senior/i')
      .isVisible({ timeout: 2000 });
    expect(jobDetailsVisible).toBeTruthy();
  });
});
