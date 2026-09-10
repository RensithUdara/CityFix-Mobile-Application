import { test, expect } from '@playwright/test';
test('authentication gate and form validation on phone', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: 'Skip onboarding' }).click();
  await expect(page.getByText('Welcome back, neighbor')).toBeVisible();
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page.getByText('Enter a valid email address.')).toBeVisible();
  await page.getByRole('link', { name: 'Create an account', exact: true }).click();
  await expect(page.getByRole('textbox', { name: 'Full name', exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'Back to sign in', exact: true }).click();
  await page.getByRole('link', { name: 'Forgot password?', exact: true }).click();
  await expect(page.getByText('Reset your password', { exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  await page.goto('/issue/missing', { waitUntil: 'domcontentloaded' });
  await expect(page.getByText('Welcome back, neighbor')).toBeVisible();
});
test('public help pages and searchable FAQ work on phone', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Skip onboarding' }).click();
  await page.goto('/faq');
  await page
    .getByRole('textbox', { name: 'Search questions', exact: true })
    .fill('How many photos');
  await page.getByRole('button', { name: /How many photos can I add/ }).click();
  await expect(page.getByText(/Add between one and five photos from your camera/)).toBeVisible();
  await page.goto('/privacy');
  await expect(page.getByText('Information you provide', { exact: true })).toBeVisible();
  await page.goto('/guidelines');
  await expect(page.getByText('Report what you can observe', { exact: true })).toBeVisible();
  await page.goto('/about');
  await expect(page.getByText('About CityFix', { exact: true }).first()).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
});
