import { test, expect } from '@playwright/test';
import { writeFileSync, mkdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';

test('live Firebase signup, profile, photo upload, report, realtime, follow, persistence and logout', async ({
  page,
  browser,
}) => {
  test.skip(process.env.CITYFIX_LIVE_TEST !== '1', 'Explicit live Firebase test opt-in required.');
  test.setTimeout(120000);
  const email = `cityfix-e2e-${Date.now()}@example.com`;
  const password = `CityFix-${randomUUID()}!`;
  const resources = { project: 'cityfix-community-20260908', email, uid: '', issueId: '' };
  const manifest = 'test-results/firebase-test-resources.json';
  const record = () => {
    mkdirSync('test-results', { recursive: true });
    writeFileSync(manifest, JSON.stringify(resources));
  };
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  try {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: 'Skip onboarding' }).click();
    await page.getByRole('button', { name: 'Create an account', exact: true }).click();
    await page
      .getByRole('textbox', { name: 'Full name', exact: true })
      .fill('CityFix Integration Test');
    await page.getByRole('textbox', { name: 'Email', exact: true }).fill(email);
    await page.getByRole('textbox', { name: 'Password', exact: true }).fill(password);
    const signup = page.waitForResponse((response) => response.url().includes('accounts:signUp'));
    await page.getByRole('button', { name: 'Create account', exact: true }).click();
    const response = await signup;
    expect(response.ok()).toBeTruthy();
    resources.uid = (await response.json()).localId;
    record();
    await expect(page.getByText('Around your neighborhood')).toBeVisible();
    await page.getByRole('button', { name: 'Report an issue', exact: true }).click();
    await page.getByRole('button', { name: 'Submit report', exact: true }).click();
    await expect(page.getByText('Use at least 5 characters for the title.')).toBeVisible();
    await page
      .getByRole('textbox', { name: 'Issue title', exact: true })
      .fill('CityFix integration verification');
    await page
      .getByRole('textbox', { name: 'What’s happening?', exact: true })
      .fill('Temporary automated integration report, removed when verification finishes.');
    await page
      .getByRole('textbox', { name: 'Location', exact: true })
      .fill('Automated test location');
    const chooser = page.waitForEvent('filechooser');
    await page.getByRole('button', { name: 'Upload photo', exact: true }).click();
    await (await chooser).setFiles('assets/icon.png');
    await expect(page.getByRole('button', { name: 'Change photo', exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Submit report', exact: true }).click();
    await page.waitForURL(/\/issue\//);
    resources.issueId = page.url().split('/issue/')[1];
    record();
    await expect(
      page.getByText('Your report is shared with the community. Thank you for caring.'),
    ).toBeVisible();
    await page.getByRole('button', { name: 'I noticed this too' }).click();
    await expect(page.getByRole('button', { name: 'Confirmed by you' })).toBeVisible();
    await page.getByRole('button', { name: 'Follow this issue', exact: true }).click();
    await expect(
      page.getByRole('button', { name: 'Following issue · Tap to unfollow' }),
    ).toBeVisible();
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.getByText('CityFix integration verification', { exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Confirmed by you' })).toBeVisible();
    // A separate browser session receives the same report from Firestore, not local state.
    const second = await browser.newContext();
    const remote = await second.newPage();
    await remote.goto('/', { waitUntil: 'domcontentloaded' });
    await remote.getByRole('button', { name: 'Skip onboarding' }).click();
    await remote.getByRole('textbox', { name: 'Email', exact: true }).fill(email);
    await remote.getByRole('textbox', { name: 'Password', exact: true }).fill(password);
    await remote.getByRole('button', { name: 'Sign in', exact: true }).click();
    await expect(remote.getByText('Around your neighborhood')).toBeVisible();
    await remote.goto(`/issue/${resources.issueId}`, { waitUntil: 'domcontentloaded' });
    await expect(remote.getByRole('button', { name: 'Confirmed by you' })).toBeVisible();
    await remote.getByRole('button', { name: 'Confirmed by you' }).click();
    await expect(remote.getByRole('button', { name: 'I noticed this too' })).toBeVisible({
      timeout: 15000,
    });
    await expect(page.getByRole('button', { name: 'I noticed this too' })).toBeVisible({
      timeout: 15000,
    });
    await second.close();
    await page.goto('/profile', { waitUntil: 'domcontentloaded' });
    await expect(page.getByText('Connected', { exact: true })).toBeVisible();
    await page
      .getByRole('textbox', { name: 'Neighborhood', exact: true })
      .fill('Integration test neighborhood');
    await page.getByRole('button', { name: 'Save profile', exact: true }).click();
    await expect(page.getByText('Profile updated.')).toBeVisible();
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('textbox', { name: 'Neighborhood', exact: true })).toHaveValue(
      'Integration test neighborhood',
    );
    await page.getByRole('button', { name: 'Sign out', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Sign in', exact: true })).toBeVisible();
    expect(errors).toEqual([]);
  } finally {
    if (resources.uid) {
      record();
      execFileSync(process.execPath, ['scripts/firebase-admin.cjs', 'cleanup-test'], {
        stdio: 'pipe',
      });
    }
  }
});
