import { test, expect } from '@playwright/test';
test('auth links, password visibility, confirmation and privacy checkbox on phone', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Skip onboarding' }).click();
  const password = page.getByLabel('Password', { exact: true });
  await password.fill('sample-password');
  await expect(password).toHaveJSProperty('type', 'password');
  await page.getByRole('button', { name: 'Show password', exact: true }).click();
  await expect(password).toHaveJSProperty('type', 'text');
  await page.getByRole('button', { name: 'Hide password', exact: true }).click();
  await expect(password).toHaveJSProperty('type', 'password');
  await page.screenshot({ path: 'test-results/auth-login.png', fullPage: true });
  await page.getByRole('button', { name: 'Frequently asked questions', exact: true }).click();
  await expect(page.getByLabel('Search questions', { exact: true })).toBeVisible();
  await page.goBack();
  await page.getByRole('link', { name: 'Create an account', exact: true }).click();
  await page.getByLabel('Full name', { exact: true }).fill('Test Neighbor');
  await page.getByLabel('Email', { exact: true }).fill('neighbor@example.com');
  await password.fill('sample-password');
  await page.getByLabel('Confirm password', { exact: true }).fill('different-password');
  await page.getByRole('button', { name: 'Create account', exact: true }).click();
  await expect(page.getByText('Passwords do not match.', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Show confirm password', exact: true }).click();
  await expect(page.getByLabel('Confirm password', { exact: true })).toHaveJSProperty(
    'type',
    'text',
  );
  await page.getByLabel('Confirm password', { exact: true }).fill('sample-password');
  await page.getByRole('button', { name: 'Create account', exact: true }).click();
  await expect(
    page.getByText('Please read and accept the Privacy policy to create an account.', {
      exact: true,
    }),
  ).toBeVisible();
  await page.getByRole('link', { name: 'Privacy policy', exact: true }).click();
  await expect(page.getByText('Information you provide', { exact: true })).toBeVisible();
  await page.goBack();
  const consent = page.getByRole('checkbox', { name: 'Accept Privacy policy' });
  await expect(consent).not.toBeChecked();
  await consent.check();
  await expect(consent).toBeChecked();
  await consent.uncheck();
  await expect(consent).not.toBeChecked();
  await page.screenshot({ path: 'test-results/auth-register.png', fullPage: true });
  await page.getByRole('link', { name: 'Back to sign in', exact: true }).click();
  await expect(password).toHaveJSProperty('type', 'password');
  await page.getByRole('link', { name: 'Forgot password?', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'Reset your password', exact: true }),
  ).toBeVisible();
  await expect(page.getByRole('link', { name: 'Back to sign in', exact: true })).toBeVisible();
  await page.route('**/accounts:sendOobCode*', (route) =>
    route.fulfill({ json: { email: 'neighbor@example.com' } }),
  );
  await page.getByLabel('Email', { exact: true }).fill('neighbor@example.com');
  await page.getByRole('button', { name: 'Send reset email', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Check your inbox' })).toBeVisible();
  await page.screenshot({ path: 'test-results/auth-reset.png', fullPage: true });
  await page.getByRole('button', { name: 'Done', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Check your inbox' })).toBeHidden();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
});
