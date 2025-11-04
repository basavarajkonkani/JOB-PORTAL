import { test, expect } from '@playwright/test';

/**
 * Visual Regression Testing for Sign-In Page
 * Captures screenshots at different breakpoints and browsers
 */

const SIGNIN_URL = '/signin';

test.describe('Sign-In Page - Visual Regression', () => {
  test('desktop layout - 1920x1080', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto(SIGNIN_URL);
    await page.waitForLoadState('networkidle');
    
    // Wait for any animations to complete
    await page.waitForTimeout(500);
    
    await expect(page).toHaveScreenshot('signin-desktop-1920.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('desktop layout - 1024x768', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto(SIGNIN_URL);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    
    await expect(page).toHaveScreenshot('signin-desktop-1024.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('tablet layout - 768x1024', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto(SIGNIN_URL);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    
    await expect(page).toHaveScreenshot('signin-tablet-768.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('mobile layout - 375x667', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(SIGNIN_URL);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    
    await expect(page).toHaveScreenshot('signin-mobile-375.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('form with error state', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto(SIGNIN_URL);
    await page.waitForLoadState('networkidle');
    
    // Trigger error by submitting invalid form
    const emailInput = page.getByLabel(/email/i);
    const passwordInput = page.getByLabel(/password/i);
    const submitButton = page.getByRole('button', { name: /sign|login|post/i }).first();
    
    await emailInput.fill('invalid@test.com');
    await passwordInput.fill('wrong');
    await submitButton.click();
    
    // Wait for error to appear
    await page.waitForTimeout(2000);
    
    await expect(page).toHaveScreenshot('signin-error-state.png', {
      animations: 'disabled',
    });
  });

  test('form with loading state', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto(SIGNIN_URL);
    await page.waitForLoadState('networkidle');
    
    const emailInput = page.getByLabel(/email/i);
    const passwordInput = page.getByLabel(/password/i);
    const submitButton = page.getByRole('button', { name: /sign|login|post/i }).first();
    
    await emailInput.fill('test@example.com');
    await passwordInput.fill('password123');
    
    // Click and immediately capture loading state
    await submitButton.click();
    await page.waitForTimeout(100);
    
    await expect(page).toHaveScreenshot('signin-loading-state.png', {
      animations: 'disabled',
    });
  });

  test('hero section detail - desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto(SIGNIN_URL);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    
    // Capture just the hero section
    const heroSection = page.locator('[data-testid="signin-hero"]').or(
      page.locator('.hero-section, [class*="hero"]').first()
    );
    
    if (await heroSection.isVisible()) {
      await expect(heroSection).toHaveScreenshot('signin-hero-section.png', {
        animations: 'disabled',
      });
    }
  });

  test('form panel detail - desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto(SIGNIN_URL);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    
    // Capture just the form panel
    const formPanel = page.locator('form').first();
    
    await expect(formPanel).toHaveScreenshot('signin-form-panel.png', {
      animations: 'disabled',
    });
  });
});

test.describe('Sign-In Page - Hover States', () => {
  test('button hover states', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto(SIGNIN_URL);
    await page.waitForLoadState('networkidle');
    
    const submitButton = page.getByRole('button', { name: /sign|login|post/i }).first();
    
    // Hover over button
    await submitButton.hover();
    await page.waitForTimeout(200);
    
    await expect(page).toHaveScreenshot('signin-button-hover.png', {
      animations: 'disabled',
    });
  });

  test('input focus states', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto(SIGNIN_URL);
    await page.waitForLoadState('networkidle');
    
    const emailInput = page.getByLabel(/email/i);
    
    // Focus input
    await emailInput.focus();
    await page.waitForTimeout(200);
    
    await expect(page).toHaveScreenshot('signin-input-focus.png', {
      animations: 'disabled',
    });
  });
});
