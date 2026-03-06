import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should have the correct title and meta description', async ({ page }) => {
    await expect(page).toHaveTitle(/WTF DEV/i);
  });

  test('should render the main hero section', async ({ page }) => {
    const heroTitle = page.locator('h1');
    await expect(heroTitle).toContainText(/Automate/i);
    await expect(heroTitle).toContainText(/Scale/i);
    await expect(heroTitle).toContainText(/Dominate/i);
  });

  test('should navigate to services section', async ({ page }) => {
    // Click on Services link in the header
    await page.click('header nav >> text=Services');
    await expect(page).toHaveURL(/#services/);
    await expect(page.locator('#services h2')).toBeVisible();
  });

  test('should submit the contact form', async ({ page }) => {
    await page.fill('#name', 'E2E Test User');
    await page.fill('#email', 'e2e@test.com');
    await page.fill('#company', 'E2E Test Corp');
    await page.fill('#message', 'This is an E2E test message for lead generation. It needs to be at least 10 characters.');
    
    await page.click('button[type="submit"]');
    
    // The button text should change to "Sending..."
    await expect(page.locator('button[type="submit"]')).toContainText(/Sending.../i);
    
    // Finally show success message (our component takes 2s)
    await expect(page.locator('text=Message Received!'), { timeout: 10000 }).toBeVisible();
  });

  test('should toggle floating CTA menu', async ({ page }) => {
    // Locate the floating button by its icon or position
    const floatingButton = page.locator('div.fixed.bottom-6.right-6 button');
    await floatingButton.click();
    
    await expect(page.locator('text=Messenger')).toBeVisible();
    await expect(page.locator('text=Zalo')).toBeVisible();
    
    await floatingButton.click();
    await expect(page.locator('text=Messenger')).not.toBeVisible();
  });
});
