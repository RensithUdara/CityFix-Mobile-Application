const adminRequire = require('node:module').createRequire(
  require('node:path').resolve('functions/package.json'),
);
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const { chromium } = require('@playwright/test');
test(
  'admin web authenticates, gates normal accounts, shows live insights and revokes access',
  { timeout: 90000 },
  async () => {
    assert.ok(
      process.env.FIRESTORE_EMULATOR_HOST && process.env.FIREBASE_AUTH_EMULATOR_HOST,
      'Emulators are required',
    );
    const { initializeApp, deleteApp } = adminRequire('firebase-admin/app');
    const { getAuth } = adminRequire('firebase-admin/auth');
    const { getFirestore } = adminRequire('firebase-admin/firestore');
    const app = initializeApp({ projectId: 'demo-cityfix' }),
      db = getFirestore(app);
    const user = await getAuth(app).createUser({
      email: 'admin-test@example.com',
      password: 'Emulator-test-4821!',
    });
    const server = spawn(
      process.execPath,
      [
        'admin-web/node_modules/vite/bin/vite.js',
        'admin-web',
        '--port',
        '5181',
        '--host',
        '127.0.0.1',
      ],
      {
        windowsHide: true,
        stdio: 'pipe',
        env: {
          ...process.env,
          VITE_USE_EMULATORS: 'true',
          VITE_FIRESTORE_EMULATOR_PORT: process.env.FIRESTORE_EMULATOR_HOST.split(':').at(-1),
          VITE_FIREBASE_PROJECT_ID: 'demo-cityfix',
          VITE_FIREBASE_API_KEY: 'fake-key',
          VITE_FIREBASE_AUTH_DOMAIN: 'demo-cityfix.firebaseapp.com',
        },
      },
    );
    server.stdout.resume();
    server.stderr.resume();
    let browser;
    try {
      for (let i = 0; i < 60; i++) {
        try {
          if ((await fetch('http://127.0.0.1:5181')).ok) break;
        } catch {}
        await new Promise((r) => setTimeout(r, 500));
      }
      browser = await chromium.launch();
      const page = await browser.newPage();
      await page.goto('http://127.0.0.1:5181');
      await page.getByLabel('Email', { exact: true }).fill('admin-test@example.com');
      await page.getByLabel('Password', { exact: true }).fill('Emulator-test-4821!');
      await page.getByRole('button', { name: 'Sign in', exact: true }).click();
      await page.getByRole('heading', { name: 'Administrator access required' }).waitFor();
      await db.doc(`admin/${user.uid}`).set({ active: true, role: 'admin' });
      await db.doc('analytics/community').set({
        total: 12,
        byStatus: { Resolved: 3, Reported: 9 },
        byCategory: { Roads: 12 },
        bySeverity: { High: 12 },
        byDay: {},
        resolutionHours: 72,
      });
      await page.getByRole('heading', { name: 'A clearer view of your community.' }).waitFor();
      await page.getByText('25%', { exact: true }).waitFor();
      await page.screenshot({ path: 'test-results/admin-dashboard.png', fullPage: true });
      await page.getByRole('button', { name: 'Webhooks', exact: true }).click();
      await page.getByRole('heading', { name: 'Keep your systems connected.' }).waitFor();
      await db.doc(`admin/${user.uid}`).update({ active: false });
      await page.getByRole('heading', { name: 'Administrator access required' }).waitFor();
      await page.getByRole('button', { name: 'Sign out', exact: true }).click();
      await page.getByRole('button', { name: 'Sign in', exact: true }).waitFor();
    } finally {
      await browser?.close();
      server.kill();
      await getAuth(app).deleteUser(user.uid);
      await db.doc(`admin/${user.uid}`).delete();
      await deleteApp(app);
    }
  },
);
