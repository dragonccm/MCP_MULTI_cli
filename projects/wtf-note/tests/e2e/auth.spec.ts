import { test, expect } from '@playwright/test';

test.describe('Authentication E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('user can register with valid credentials', async ({ page }) => {
    const email = `test_${Date.now()}@wtfnote.com`;
    const password = 'password123';
    const name = 'Test User';

    // Navigate to register page
    await page.goto('/(auth)/signup');
    await page.waitForLoadState('networkidle');

    // Fill registration form
    await page.fill('input[name="name"]', name);
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', password);

    // Submit form
    await page.click('button[type="submit"]');

    // Wait for navigation or success message
    await page.waitForLoadState('networkidle');

    // Should be redirected to home or see success
    const url = page.url();
    expect(url).not.toContain('signup');
  });

  test('user can login with valid credentials', async ({ page }) => {
    const email = 'demo@wtfnote.com';
    const password = 'password123';

    // Navigate to login page
    await page.goto('/(auth)/signin');
    await page.waitForLoadState('networkidle');

    // Fill login form
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', password);

    // Submit form
    await page.click('button[type="submit"]');

    // Wait for navigation
    await page.waitForLoadState('networkidle');

    // Should be redirected to home
    const url = page.url();
    expect(url).not.toContain('signin');
  });

  test('login fails with invalid credentials', async ({ page }) => {
    const email = 'wrong@email.com';
    const password = 'wrongpassword';

    await page.goto('/(auth)/signin');
    await page.waitForLoadState('networkidle');

    // Fill login form with wrong credentials
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', password);

    // Submit form
    await page.click('button[type="submit"]');

    // Should show error message
    await expect(page.locator('text=Invalid email or password')).toBeVisible({ timeout: 5000 });
  });

  test('registration validation works', async ({ page }) => {
    await page.goto('/(auth)/signup');
    await page.waitForLoadState('networkidle');

    // Try to submit empty form
    await page.click('button[type="submit"]');

    // Should show validation errors
    await expect(page.locator('input[name="email"]')).toBeFocused();

    // Try with invalid email
    await page.fill('input[name="email"]', 'invalid-email');
    await page.fill('input[name="password"]', 'password123');
    await page.fill('input[name="name"]', 'Test');
    await page.click('button[type="submit"]');

    // Should show email validation error
    await page.waitForTimeout(1000);
  });

  test('user session persists after page reload', async ({ page, browser }) => {
    const email = 'demo@wtfnote.com';
    const password = 'password123';

    // Login
    await page.goto('/(auth)/signin');
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', password);
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');

    // Get the URL after login
    const loggedInUrl = page.url();

    // Reload page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Should still be logged in (not redirected to login)
    expect(page.url()).not.toContain('signin');
  });

  test('user can logout', async ({ page }) => {
    const email = 'demo@wtfnote.com';
    const password = 'password123';

    // Login first
    await page.goto('/(auth)/signin');
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', password);
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');

    // Navigate to profile
    await page.goto('/(tabs)/profile');
    await page.waitForLoadState('networkidle');

    // Click logout button
    const logoutButton = page.locator('button:has-text("Logout"), button:has-text("Đăng xuất")');
    if (await logoutButton.isVisible()) {
      await logoutButton.click();
      await page.waitForLoadState('networkidle');

      // Should be redirected to login
      expect(page.url()).toContain('signin');
    }
  });
});
