import { test, expect as baseExpect } from '@playwright/test';
import { writeFileSync, mkdirSync, readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
const expect = baseExpect.configure({ timeout: 15000 });

test('live Firebase signup, profile, photo upload, report, realtime, follow, persistence and logout', async ({
  page,
  browser,
}) => {
  test.skip(process.env.CITYFIX_LIVE_TEST !== '1', 'Explicit live Firebase test opt-in required.');
  test.setTimeout(240000);
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
  // Deterministic address provider responses; Firebase operations remain live.
  await page.route('https://photon.komoot.io/**', async (route) => {
    const reverse = route.request().url().includes('/reverse');
    await route.fulfill({
      json: {
        features: [
          {
            geometry: { coordinates: [80.217, 6.033] },
            properties: {
              name: reverse ? 'Pinned test location' : 'Galle test landmark',
              city: 'Galle',
              country: 'Sri Lanka',
              osm_id: 1,
              osm_type: 'N',
            },
          },
        ],
      },
    });
  });
  try {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: 'Skip onboarding' }).click();
    await page.getByRole('link', { name: 'Create an account', exact: true }).click();
    await page
      .getByRole('textbox', { name: 'Full name', exact: true })
      .fill('CityFix Integration Test');
    await page.getByRole('textbox', { name: 'Email', exact: true }).fill(email);
    await page.getByRole('textbox', { name: 'Password', exact: true }).fill(password);
    await page.getByLabel('Confirm password', { exact: true }).fill(password);
    await page.getByRole('checkbox', { name: 'Accept Privacy policy' }).check();
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
    await page.getByRole('textbox', { name: 'Location', exact: true }).fill('Galle');
    await page
      .getByRole('button', {
        name: 'Select location Galle test landmark, Galle, Sri Lanka',
        exact: true,
      })
      .click();
    await expect(page.getByRole('textbox', { name: 'Location', exact: true })).toHaveValue(
      'Galle test landmark, Galle, Sri Lanka',
    );
    await page.getByRole('button', { name: 'Choose location on map', exact: true }).click();
    const pickerMap = page.getByLabel('Choose report location on map', { exact: true });
    await pickerMap.click({ position: { x: 170, y: 160 } });
    await expect(
      page.getByText('Pinned test location, Galle, Sri Lanka', { exact: true }),
    ).toBeVisible();
    await page.getByRole('button', { name: 'Close location picker', exact: true }).click();
    await expect(page.getByRole('textbox', { name: 'Location', exact: true })).toHaveValue(
      'Galle test landmark, Galle, Sri Lanka',
    );
    await page.getByRole('button', { name: 'Choose location on map', exact: true }).click();
    await pickerMap.click({ position: { x: 190, y: 180 } });
    await expect(
      page.getByText('Pinned test location, Galle, Sri Lanka', { exact: true }),
    ).toBeVisible();
    await page.getByRole('button', { name: 'Use this location', exact: true }).click();
    await expect(page.getByRole('textbox', { name: 'Location', exact: true })).toHaveValue(
      'Pinned test location, Galle, Sri Lanka',
    );
    await page.getByRole('textbox', { name: 'Location', exact: true }).fill('Manual location');
    await expect(page.getByRole('link', { name: 'Remove map pin', exact: true })).toHaveCount(0);
    const chooser = page.waitForEvent('filechooser');
    await page.getByRole('button', { name: 'Submit report', exact: true }).click();
    await expect(page.getByText('Add at least one photo before submitting.')).toBeVisible();
    await page.getByRole('button', { name: 'Upload photos', exact: true }).click();
    // Reproduce camera/library files whose MIME metadata is absent.
    await (
      await chooser
    ).setFiles({ name: 'mobile-photo.png', mimeType: '', buffer: readFileSync('assets/icon.png') });
    await expect(page.getByText('1 / 5 photos', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Submit report', exact: true }).click();
    await expect(page.getByText('Report submitted!', { exact: true })).toBeVisible({
      timeout: 60000,
    });
    await expect(page.getByText(/^CF-/)).toBeVisible();
    await page.screenshot({ path: 'test-results/submission-success.png', fullPage: true });
    await page.getByRole('button', { name: 'View my report', exact: true }).click();
    await page.waitForURL(/\/issue\//);
    resources.issueId = page.url().split('/issue/')[1];
    record();
    await expect(page.getByRole('button', { name: 'Open photo 1 full screen' })).toBeVisible();
    await expect(
      page.getByText('Your report is shared with the community. Thank you for caring.'),
    ).toBeVisible();
    await page.getByRole('button', { name: 'I noticed this too' }).click();
    await expect(page.getByRole('button', { name: 'Confirmed by you' })).toBeVisible();
    await page
      .getByRole('textbox', { name: 'Add a comment', exact: true })
      .fill('Verified neighborhood detail from the first session.');
    await page.getByRole('button', { name: 'Post comment', exact: true }).click();
    await expect(
      page.getByText('Verified neighborhood detail from the first session.', { exact: true }),
    ).toBeVisible();
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
    await expect(
      remote.getByText('Verified neighborhood detail from the first session.', { exact: true }),
    ).toBeVisible();
    await expect(remote.getByRole('button', { name: 'Confirmed by you' })).toBeVisible();
    await remote.getByRole('button', { name: 'Confirmed by you' }).click();
    await expect(remote.getByRole('button', { name: 'I noticed this too' })).toBeVisible({
      timeout: 15000,
    });
    await expect(page.getByRole('button', { name: 'I noticed this too' })).toBeVisible({
      timeout: 15000,
    });
    await second.close();
    await page.goto('/settings', { waitUntil: 'domcontentloaded' });
    await page.getByRole('switch', { name: 'Follow my new reports', exact: true }).check();
    await page.getByRole('button', { name: 'Default severity High', exact: true }).click();
    await expect(
      page.getByRole('button', { name: 'Default severity High', exact: true }),
    ).toHaveAttribute('aria-selected', 'true');
    await expect(
      page.getByRole('button', { name: 'Default severity High', exact: true }),
    ).toBeEnabled();
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(
      page.getByRole('switch', { name: 'Follow my new reports', exact: true }),
    ).toBeChecked();
    await expect(
      page.getByRole('button', { name: 'Default severity High', exact: true }),
    ).toHaveAttribute('aria-selected', 'true');
    await page.screenshot({ path: 'test-results/settings.png', fullPage: true });
    await page.goto('/report', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('button', { name: 'High', exact: true })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    await page
      .getByRole('textbox', { name: 'Issue title', exact: true })
      .fill('Five photo integration verification');
    await page
      .getByRole('textbox', { name: 'What’s happening?', exact: true })
      .fill('Temporary five photo report, removed after testing finishes.');
    await page
      .getByRole('textbox', { name: 'Location', exact: true })
      .fill('Automated test location');
    await page.context().grantPermissions(['geolocation']);
    await page.context().setGeolocation({ latitude: 6.12653, longitude: 80.12819 });
    await page.getByRole('button', { name: 'Use my current location', exact: true }).click();
    await expect(page.getByText('GPS coordinates attached.', { exact: true })).toBeVisible();
    const fiveChooser = page.waitForEvent('filechooser');
    await page.getByRole('button', { name: 'Upload photos', exact: true }).click();
    await (
      await fiveChooser
    ).setFiles(
      Array.from({ length: 5 }, (_, i) => ({
        name: `photo-${i}.png`,
        mimeType: 'image/png',
        buffer: readFileSync(i === 4 ? 'assets/cityfix-logo.png' : 'assets/icon.png'),
      })),
    );
    await expect(page.getByText('5 / 5 photos', { exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Add photos', exact: true })).toBeDisabled();
    await page.getByRole('button', { name: 'Use photo 5 as cover' }).click();
    await page.getByRole('button', { name: 'Remove photo 3' }).click();
    await expect(page.getByText('4 / 5 photos', { exact: true })).toBeVisible();
    const addChooser = page.waitForEvent('filechooser');
    await page.getByRole('button', { name: 'Add photos', exact: true }).click();
    await (await addChooser).setFiles('assets/icon.png');
    await expect(page.getByText('5 / 5 photos', { exact: true })).toBeVisible();
    await page.screenshot({ path: 'test-results/report-photos.png', fullPage: true });
    await page.getByRole('button', { name: 'Submit report', exact: true }).click();
    await expect(page.getByText('Report submitted!', { exact: true })).toBeVisible({
      timeout: 60000,
    });
    await expect(page.getByText(/^CF-/)).toBeVisible();
    await page.getByRole('button', { name: 'View my report', exact: true }).click();
    await page.waitForURL(/\/issue\//, { timeout: 60000 });
    await expect(
      page.getByRole('button', { name: 'Following issue · Tap to unfollow' }),
    ).toBeVisible();
    await page.getByRole('button', { name: 'View photo 5', exact: true }).click();
    await page.getByRole('button', { name: 'Open photo 5 full screen' }).click();
    await expect(page.getByText('Photo 5 of 5', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Next photo', exact: true }).click();
    await expect(page.getByText('Photo 1 of 5', { exact: true })).toBeVisible();
    await expect
      .poll(() =>
        page
          .getByTestId('fullscreen-photo')
          .locator('img')
          .evaluate((img: HTMLImageElement) => img.naturalWidth),
      )
      .toBeGreaterThan(0);
    await page.screenshot({ path: 'test-results/gallery.png', fullPage: true });
    await page.getByRole('button', { name: 'Close photo viewer' }).click();
    await expect(page.getByRole('button', { name: 'Close photo viewer' })).toBeHidden();
    await page.screenshot({ path: 'test-results/issue-details.png', fullPage: true });
    await page.goto('/map', { waitUntil: 'domcontentloaded' });
    await expect(page.getByLabel('Community issue map', { exact: true })).toBeVisible();
    await page
      .getByRole('textbox', { name: 'Search the map', exact: true })
      .fill('Five photo integration');
    await expect(page.getByRole('button', { name: 'View issue', exact: true })).toBeVisible();
    await expect(page.locator('.leaflet-interactive')).toHaveCount(1);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.screenshot({ path: 'test-results/map-phone.png', fullPage: true });
    await page.setViewportSize({ width: 1280, height: 1000 });
    await page.goto('/search', { waitUntil: 'domcontentloaded' });
    await page
      .getByRole('textbox', { name: 'Search all reports', exact: true })
      .fill('CF-' + resources.issueId);
    await page.getByRole('button', { name: 'Search reports', exact: true }).click();
    await expect(page.getByText('CityFix integration verification', { exact: true })).toBeVisible({
      timeout: 60000,
    });
    await page.goto('/help', { waitUntil: 'domcontentloaded' });
    await page
      .getByRole('textbox', { name: 'Subject', exact: true })
      .fill('Integration support question');
    await page
      .getByRole('textbox', { name: 'Your message', exact: true })
      .fill('Temporary support request for integration verification.');
    await page.getByRole('button', { name: 'Submit support request', exact: true }).click();
    await expect(
      page.getByText('Your request was submitted. You can find it below.'),
    ).toBeVisible();
    await expect(page.getByText('Integration support question', { exact: true })).toBeVisible();
    await page.goto('/profile', { waitUntil: 'domcontentloaded' });
    await expect(page.getByText('Connected', { exact: true })).toBeVisible();
    await page
      .getByRole('textbox', { name: 'Neighborhood', exact: true })
      .fill('Integration test neighborhood');
    await page
      .getByRole('textbox', { name: 'Phone number (optional)', exact: true })
      .fill('+94 770000000');
    await page
      .getByRole('textbox', { name: 'About you (optional)', exact: true })
      .fill('Temporary profile details.');
    const avatarChooser = page.waitForEvent('filechooser');
    await page.getByRole('button', { name: 'Change profile photo', exact: true }).click();
    await (await avatarChooser).setFiles('assets/icon.png');
    await expect(page.getByLabel('Your profile photo', { exact: true })).toBeVisible({
      timeout: 60000,
    });
    await expect(
      page.getByRole('textbox', { name: 'About you (optional)', exact: true }),
    ).toHaveValue('Temporary profile details.');
    await page.getByRole('button', { name: 'Save profile', exact: true }).click();
    await expect(page.getByText('Profile updated.')).toBeVisible();
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('textbox', { name: 'Neighborhood', exact: true })).toHaveValue(
      'Integration test neighborhood',
    );
    await expect(
      page.getByRole('textbox', { name: 'Phone number (optional)', exact: true }),
    ).toHaveValue('+94 770000000');
    await expect(
      page.getByRole('textbox', { name: 'About you (optional)', exact: true }),
    ).toHaveValue('Temporary profile details.');
    await expect(page.getByLabel('Your profile photo', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Remove photo', exact: true }).click();
    await expect(page.getByLabel('Your profile photo', { exact: true })).toHaveCount(0);
    await page.getByRole('button', { name: 'Log out', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Log out of CityFix?' })).toBeVisible();
    await page.getByRole('button', { name: 'Stay signed in', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Save profile', exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Log out', exact: true }).click();
    await page.getByRole('button', { name: 'Yes, log out', exact: true }).click();
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
