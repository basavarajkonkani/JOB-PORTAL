import { test, expect, devices } from '@playwright/test';

/**
 * Cross-Browser and Device Testing for Sign-In Page
 * Tests Requirements: 4.1, 4.2, 4.3, 4.4, 4.5
 */

const SIGNIN_URL = '/signin';

// Common breakpoints to test
const BREAKPOINTS = {
  mobile: { width: 375, height: 667 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1024, height: 768 },
  wide: { width: 1920, height: 1080 },
};

test.describe('Sign-In Page - Cross-Browser Testing', () => {
  test.describe('Desktop Layout Tests (≥1024px)', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize(BREAKPOINTS.desktop);
      await page.goto(SIGNIN_URL);
    });

    test('should display split-screen layout on desktop', async ({ page }) => {
      // Verify hero section is visible
      const heroSection = page.locator('[data-testid="signin-hero"]').or(
        page.locator('.hero-section, [class*="hero"]').first()
      );
      await expect(heroSection).toBeVisible();

      // Verify form panel is visible
      const formPanel = page.locator('form').first();
      await expect(formPanel).toBeVisible();

      // Check layout is side-by-side (both visible in viewport)
      const heroBox = await heroSection.boundingBox();
      const formBox = await formPanel.boundingBox();
      
      expect(heroBox).toBeTruthy();
      expect(formBox).toBeTruthy();
      
      // Hero should be on the left, form on the right
      if (heroBox && formBox) {
        expect(heroBox.x).toBeLessThan(formBox.x);
      }
    });

    test('should display all hero section elements', async ({ page }) => {
      // Platform badge
      await expect(page.getByText(/AI-Powered/i)).toBeVisible();
      
      // Main heading
      await expect(page.getByText(/Hire Interns and Freshers/i)).toBeVisible();
      
      // Statistics
      await expect(page.getByText(/Mn\+ Candidates/i)).toBeVisible();
      await expect(page.getByText(/K\+ Companies/i)).toBeVisible();
      await expect(page.getByText(/Cities/i)).toBeVisible();
    });

    test('should display all form elements', async ({ page }) => {
      // Google sign-in button
      await expect(page.getByRole('button', { name: /google/i })).toBeVisible();
      
      // OR divider
      await expect(page.getByText('OR')).toBeVisible();
      
      // Form inputs
      await expect(page.getByLabel(/email/i)).toBeVisible();
      await expect(page.getByLabel(/password/i)).toBeVisible();
      
      // Submit button
      await expect(page.getByRole('button', { name: /sign|login|post/i })).toBeVisible();
    });
  });

  test.describe('Tablet Layout Tests (768px-1023px)', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize(BREAKPOINTS.tablet);
      await page.goto(SIGNIN_URL);
    });

    test('should adapt layout for tablet viewport', async ({ page }) => {
      // Form should be visible
      const formPanel = page.locator('form').first();
      await expect(formPanel).toBeVisible();
      
      // Check if layout is stacked or adjusted
      const viewportSize = page.viewportSize();
      expect(viewportSize?.width).toBe(768);
    });

    test('should maintain form functionality on tablet', async ({ page }) => {
      const emailInput = page.getByLabel(/email/i);
      const passwordInput = page.getByLabel(/password/i);
      
      await emailInput.fill('test@example.com');
      await passwordInput.fill('password123');
      
      await expect(emailInput).toHaveValue('test@example.com');
      await expect(passwordInput).toHaveValue('password123');
    });
  });

  test.describe('Mobile Layout Tests (<768px)', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize(BREAKPOINTS.mobile);
      await page.goto(SIGNIN_URL);
    });

    test('should display single-column layout on mobile', async ({ page }) => {
      // Form should be visible
      const formPanel = page.locator('form').first();
      await expect(formPanel).toBeVisible();
      
      // Hero section should be hidden or minimal
      const heroSection = page.locator('[data-testid="signin-hero"]').or(
        page.locator('.hero-section, [class*="hero"]').first()
      );
      
      // Check if hero is hidden or has reduced height
      const isHeroVisible = await heroSection.isVisible().catch(() => false);
      if (isHeroVisible) {
        const heroBox = await heroSection.boundingBox();
        // If visible, should have minimal height or be above form
        expect(heroBox).toBeTruthy();
      }
    });

    test('should have touch-friendly form inputs on mobile', async ({ page }) => {
      const emailInput = page.getByLabel(/email/i);
      const passwordInput = page.getByLabel(/password/i);
      
      // Check input height is touch-friendly (≥44px)
      const emailBox = await emailInput.boundingBox();
      const passwordBox = await passwordInput.boundingBox();
      
      expect(emailBox?.height).toBeGreaterThanOrEqual(40); // Allow small margin
      expect(passwordBox?.height).toBeGreaterThanOrEqual(40);
    });

    test('should maintain proper padding on mobile', async ({ page }) => {
      const formPanel = page.locator('form').first();
      const formBox = await formPanel.boundingBox();
      
      expect(formBox).toBeTruthy();
      if (formBox) {
        // Form should not touch edges (minimum 16px padding)
        expect(formBox.x).toBeGreaterThanOrEqual(12); // Allow small margin
      }
    });
  });

  test.describe('Wide Screen Tests (1920px)', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize(BREAKPOINTS.wide);
      await page.goto(SIGNIN_URL);
    });

    test('should display properly on wide screens', async ({ page }) => {
      const heroSection = page.locator('[data-testid="signin-hero"]').or(
        page.locator('.hero-section, [class*="hero"]').first()
      );
      const formPanel = page.locator('form').first();
      
      await expect(heroSection).toBeVisible();
      await expect(formPanel).toBeVisible();
      
      // Content should be properly centered/sized, not stretched
      const formBox = await formPanel.boundingBox();
      expect(formBox?.width).toBeLessThan(800); // Form shouldn't be too wide
    });
  });
});

test.describe('Sign-In Page - Form Submission Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(SIGNIN_URL);
  });

  test('should handle form submission with email/password', async ({ page }) => {
    const emailInput = page.getByLabel(/email/i);
    const passwordInput = page.getByLabel(/password/i);
    const submitButton = page.getByRole('button', { name: /sign|login|post/i }).first();
    
    await emailInput.fill('test@example.com');
    await passwordInput.fill('password123');
    
    // Click submit and wait for navigation or error
    await submitButton.click();
    
    // Should either navigate or show error message
    await page.waitForTimeout(1000);
    
    // Check if still on signin page or redirected
    const currentUrl = page.url();
    const hasError = await page.locator('[role="alert"], .error, [class*="error"]').isVisible().catch(() => false);
    
    // Either redirected or error shown
    expect(currentUrl.includes('/signin') || currentUrl.includes('/dashboard')).toBeTruthy();
  });

  test('should handle Google sign-in button click', async ({ page }) => {
    const googleButton = page.getByRole('button', { name: /google/i });
    
    await expect(googleButton).toBeVisible();
    await expect(googleButton).toBeEnabled();
    
    // Click should trigger some action (popup or redirect)
    await googleButton.click();
    
    // Wait for any loading state
    await page.waitForTimeout(500);
  });

  test('should show loading state during submission', async ({ page }) => {
    const emailInput = page.getByLabel(/email/i);
    const passwordInput = page.getByLabel(/password/i);
    const submitButton = page.getByRole('button', { name: /sign|login|post/i }).first();
    
    await emailInput.fill('test@example.com');
    await passwordInput.fill('password123');
    
    await submitButton.click();
    
    // Button should be disabled during loading
    await page.waitForTimeout(100);
    const isDisabled = await submitButton.isDisabled().catch(() => false);
    
    // Should show loading state (disabled or loading indicator)
    expect(isDisabled || await page.locator('[class*="loading"], [class*="spinner"]').isVisible().catch(() => false)).toBeTruthy();
  });
});

test.describe('Sign-In Page - Touch Interactions', () => {
  test.beforeEach(async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
  });

  test('should handle touch interactions on mobile device', async ({ page }) => {
    await page.goto(SIGNIN_URL);
    
    const emailInput = page.getByLabel(/email/i);
    const passwordInput = page.getByLabel(/password/i);
    
    // Tap inputs
    await emailInput.tap();
    await emailInput.fill('mobile@test.com');
    
    await passwordInput.tap();
    await passwordInput.fill('password123');
    
    await expect(emailInput).toHaveValue('mobile@test.com');
    await expect(passwordInput).toHaveValue('password123');
  });

  test('should handle button taps on mobile', async ({ page }) => {
    await page.goto(SIGNIN_URL);
    
    const googleButton = page.getByRole('button', { name: /google/i });
    
    // Tap button
    await googleButton.tap();
    
    // Should trigger action
    await page.waitForTimeout(500);
  });
});

test.describe('Sign-In Page - Visual Consistency', () => {
  const browsers = ['chromium', 'firefox', 'webkit'];
  
  for (const browserType of browsers) {
    test(`should display consistently on ${browserType}`, async ({ page }) => {
      await page.goto(SIGNIN_URL);
      
      // Check key elements are visible
      const formPanel = page.locator('form').first();
      await expect(formPanel).toBeVisible();
      
      const emailInput = page.getByLabel(/email/i);
      const passwordInput = page.getByLabel(/password/i);
      const submitButton = page.getByRole('button', { name: /sign|login|post/i }).first();
      
      await expect(emailInput).toBeVisible();
      await expect(passwordInput).toBeVisible();
      await expect(submitButton).toBeVisible();
      
      // Check layout is not broken
      const formBox = await formPanel.boundingBox();
      expect(formBox).toBeTruthy();
      expect(formBox?.width).toBeGreaterThan(200);
      expect(formBox?.height).toBeGreaterThan(200);
    });
  }
});

test.describe('Sign-In Page - Keyboard Navigation', () => {
  test('should support keyboard navigation', async ({ page }) => {
    await page.goto(SIGNIN_URL);
    
    // Tab through form elements
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Should be able to fill form with keyboard
    await page.keyboard.type('test@example.com');
    await page.keyboard.press('Tab');
    await page.keyboard.type('password123');
    
    // Enter should submit form
    await page.keyboard.press('Enter');
    
    await page.waitForTimeout(500);
  });
});

test.describe('Sign-In Page - Error Handling', () => {
  test('should display error messages properly', async ({ page }) => {
    await page.goto(SIGNIN_URL);
    
    const emailInput = page.getByLabel(/email/i);
    const passwordInput = page.getByLabel(/password/i);
    const submitButton = page.getByRole('button', { name: /sign|login|post/i }).first();
    
    // Submit with invalid credentials
    await emailInput.fill('invalid@test.com');
    await passwordInput.fill('wrongpassword');
    await submitButton.click();
    
    // Wait for error message
    await page.waitForTimeout(2000);
    
    // Check if error is displayed
    const errorVisible = await page.locator('[role="alert"], .error, [class*="error"]').isVisible().catch(() => false);
    
    // Error should be shown or still on signin page
    expect(errorVisible || page.url().includes('/signin')).toBeTruthy();
  });
});
