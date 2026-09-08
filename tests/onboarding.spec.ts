import { test, expect } from '@playwright/test';
test('three onboarding screens, back, completion persistence, and supplied logo', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { name: /Small reports/ })).toBeVisible();
  await expect(page.getByTestId('onboarding-content')).toHaveCSS('opacity', '1');
  await expect(page.getByRole('button', { name: 'Continue', exact: true })).toBeInViewport();
  await expect(
    page.getByRole('img', { name: 'CityFix: Report, Track, Build a Better City' }),
  ).toBeVisible();
  await page.screenshot({ path: 'test-results/onboarding-1.png', fullPage: true });
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await expect(page.getByRole('heading', { name: /Follow the fix/ })).toBeVisible();
  await expect(page.getByTestId('onboarding-content')).toHaveCSS('opacity', '1');
  await page.screenshot({ path: 'test-results/onboarding-2.png', fullPage: true });
  await page.getByRole('button', { name: 'Back', exact: true }).click();
  await expect(page.getByRole('heading', { name: /Small reports/ })).toBeVisible();
  await page.getByRole('button', { name: 'Go to onboarding page 3' }).click();
  await expect(page.getByRole('heading', { name: /Your neighborhood/ })).toBeVisible();
  await expect(page.getByTestId('onboarding-content')).toHaveCSS('opacity', '1');
  await page.screenshot({ path: 'test-results/onboarding-3.png', fullPage: true });
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  await page.getByRole('button', { name: 'Get started', exact: true }).click();
  await expect(page.getByText('Welcome back, neighbor')).toBeVisible();
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.getByText('Welcome back, neighbor')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Skip onboarding' })).toHaveCount(0);
});
