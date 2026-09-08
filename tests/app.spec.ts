import { test, expect } from '@playwright/test';
test('authentication gate and form validation on phone', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: 'Skip onboarding' }).click();
  await expect(page.getByText('Welcome back, neighbor')).toBeVisible();
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page.getByText('Enter a valid email address.')).toBeVisible();
  await page.getByRole('button', { name: 'Create an account', exact: true }).click();
  await expect(page.getByRole('textbox', { name: 'Full name', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Back to sign in', exact: true }).click();
  await page.getByRole('button', { name: 'Forgot password?', exact: true }).click();
  await expect(page.getByText('Reset your password', { exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  await page.goto('/issue/missing', { waitUntil: 'domcontentloaded' });
  await expect(page.getByText('Welcome back, neighbor')).toBeVisible();
});
