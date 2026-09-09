// Uses an existing Firebase CLI login in memory; never prints or writes credentials.
const path = require('path');
const fs = require('fs');
process.env.DEBUG = '';
const cli =
  process.env.FIREBASE_CLI_LIB ||
  path.join(process.env.APPDATA, 'npm/node_modules/firebase-tools/lib');
const auth = require(path.join(cli, 'auth.js'));
const project = 'cityfix-community-20260908';
const number = '718750168831';
async function main() {
  const account = auth.getGlobalDefaultAccount();
  if (!account) throw new Error('Run firebase login first.');
  const token = await auth.getAccessToken(account.tokens.refresh_token, [
    'https://www.googleapis.com/auth/cloud-platform',
    'https://www.googleapis.com/auth/firebase',
    'https://www.googleapis.com/auth/userinfo.email',
  ]);
  async function request(url, method = 'GET', body) {
    const response = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${token.access_token}`,
        'Content-Type': 'application/json',
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    const raw = await response.text();
    const data = raw ? JSON.parse(raw) : {};
    if (!response.ok)
      throw new Error(
        `${response.status} ${new URL(url).hostname}: ${data.error?.message || (typeof data.error === 'string' ? data.error : 'Request failed')}`,
      );
    return data;
  }
  const action = process.argv[2];
  if (action === 'grant-admin' || action === 'revoke-admin') {
    const email = process.argv[3];
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      throw new Error('Provide the existing Firebase account email.');
    const lookup = await request(
      `https://identitytoolkit.googleapis.com/v1/projects/${project}/accounts:lookup`,
      'POST',
      { email: [email] },
    );
    const user = lookup.users?.[0];
    if (!user || user.email.toLowerCase() !== email.toLowerCase())
      throw new Error('Registered account not found. Create an account in CityFix first.');
    await request(
      `https://firestore.googleapis.com/v1/projects/${project}/databases/(default)/documents/admin/${user.localId}`,
      'PATCH',
      {
        fields: {
          email: { stringValue: user.email },
          role: { stringValue: 'admin' },
          active: { booleanValue: action === 'grant-admin' },
          updatedAt: { timestampValue: new Date().toISOString() },
        },
      },
    );
    console.log(
      action === 'grant-admin'
        ? 'Admin access activated for the specified account.'
        : 'Admin access revoked for the specified account.',
    );
  } else if (action === 'cleanup-test') {
    const manifest = JSON.parse(
      fs.readFileSync('test-results/firebase-test-resources.json', 'utf8'),
    );
    if (
      manifest.project !== project ||
      !/^cityfix-e2e-\d+@example.com$/.test(manifest.email) ||
      !/^[A-Za-z0-9]+$/.test(manifest.uid)
    )
      throw new Error('Invalid test cleanup manifest.');
    const account = await request(
      `https://identitytoolkit.googleapis.com/v1/projects/${project}/accounts:lookup`,
      'POST',
      { localId: [manifest.uid] },
    );
    if (account.users?.[0]?.email !== manifest.email)
      throw new Error('Test user identity does not match.');
    const base = `https://firestore.googleapis.com/v1/projects/${project}/databases/(default)/documents`;
    const reports = await request(`${base}:runQuery`, 'POST', {
      structuredQuery: {
        from: [{ collectionId: 'issues' }],
        where: {
          fieldFilter: {
            field: { fieldPath: 'ownerId' },
            op: 'EQUAL',
            value: { stringValue: manifest.uid },
          },
        },
      },
    });
    for (const row of reports) {
      if (row.document) {
        const comments = await request(
          `https://firestore.googleapis.com/v1/${row.document.name}/comments`,
        );
        for (const comment of comments.documents || [])
          await request(`https://firestore.googleapis.com/v1/${comment.name}`, 'DELETE');
        await request(`https://firestore.googleapis.com/v1/${row.document.name}`, 'DELETE');
      }
    }
    for (const collection of [
      'preferences',
      'supportRequests',
      'notifications',
      'pushTokens',
      'apiKeys',
      'achievements',
    ]) {
      const items = await request(`${base}/users/${manifest.uid}/${collection}`);
      for (const item of items.documents || []) {
        if (collection === 'apiKeys')
          await request(`${base}/integrationKeys/${item.name.split('/').at(-1)}`, 'DELETE');
        await request(`https://firestore.googleapis.com/v1/${item.name}`, 'DELETE');
      }
    }
    const follows = await request(`${base}/users/${manifest.uid}/follows`);
    for (const document of follows.documents || [])
      await request(`https://firestore.googleapis.com/v1/${document.name}`, 'DELETE');
    await request(`${base}/users/${manifest.uid}`, 'DELETE');
    const bucket = `${project}.firebasestorage.app`;
    const prefix = `issues/${manifest.uid}/`;
    const photos = await request(
      `https://storage.googleapis.com/storage/v1/b/${bucket}/o?prefix=${encodeURIComponent(prefix)}`,
    );
    for (const item of photos.items || []) {
      if (!item.name.startsWith(prefix)) throw new Error('Unexpected storage path.');
      await request(
        `https://storage.googleapis.com/storage/v1/b/${bucket}/o/${encodeURIComponent(item.name)}`,
        'DELETE',
      );
    }
    await request(
      `https://${project}-default-rtdb.asia-southeast1.firebasedatabase.app/presence/${manifest.uid}.json`,
      'DELETE',
    );
    await request(
      `https://identitytoolkit.googleapis.com/v1/projects/${project}/accounts:delete`,
      'POST',
      { localId: manifest.uid },
    );
    console.log('Temporary integration account, reports, photos, follows, and presence removed.');
  } else if (action === 'status') {
    for (const [label, url] of Object.entries({
      firestore: `https://firestore.googleapis.com/v1/projects/${project}/databases`,
      storage: `https://firebasestorage.googleapis.com/v1alpha/projects/${project}/defaultBucket`,
      auth: `https://identitytoolkit.googleapis.com/admin/v2/projects/${project}/config`,
      database: `https://firebasedatabase.googleapis.com/v1beta/projects/${number}/locations/-/instances`,
      service: `https://serviceusage.googleapis.com/v1/projects/${number}/services/firestore.googleapis.com`,
    })) {
      try {
        const data = await request(url);
        console.log(
          label,
          JSON.stringify(
            label === 'auth'
              ? { email: data.signIn?.email, type: data.subtype }
              : label === 'service'
                ? { state: data.state }
                : data,
          ),
        );
      } catch (error) {
        console.log(label, error.message);
      }
    }
  } else if (action === 'enable') {
    const operation = await request(
      `https://serviceusage.googleapis.com/v1/projects/${number}/services:batchEnable`,
      'POST',
      {
        serviceIds: [
          'firestore.googleapis.com',
          'firebasedatabase.googleapis.com',
          'identitytoolkit.googleapis.com',
          'firebasestorage.googleapis.com',
        ],
      },
    );
    console.log('Service enablement requested:', operation.name);
  } else if (action === 'auth') {
    await request(
      `https://identitytoolkit.googleapis.com/v2/projects/${project}/identityPlatform:initializeAuth`,
      'POST',
      {},
    );
    await request(
      `https://identitytoolkit.googleapis.com/admin/v2/projects/${project}/config?updateMask=signIn.email,authorizedDomains`,
      'PATCH',
      {
        signIn: { email: { enabled: true, passwordRequired: true } },
        authorizedDomains: ['localhost', `${project}.firebaseapp.com`, `${project}.web.app`],
      },
    );
    console.log('Email/password authentication enabled.');
  } else if (action === 'rtdb') {
    const result = await request(
      `https://firebasedatabase.googleapis.com/v1beta/projects/${number}/locations/asia-southeast1/instances?databaseId=${project}-default-rtdb`,
      'POST',
      { type: 'DEFAULT_DATABASE' },
    );
    console.log('Realtime Database:', result.databaseUrl || result.name);
  } else if (action === 'storage') {
    const result = await request(
      `https://firebasestorage.googleapis.com/v1alpha/projects/${project}/defaultBucket`,
      'POST',
      { location: 'ASIA-SOUTH1' },
    );
    console.log('Storage bucket provisioned:', result.bucket?.name || result.name);
  } else if (action === 'billing') {
    const result = await request(
      `https://cloudbilling.googleapis.com/v1/projects/${project}/billingInfo`,
    );
    console.log('Billing enabled:', result.billingEnabled === true);
  } else if (action === 'config') {
    const result = await request(
      `https://firebase.googleapis.com/v1beta1/projects/${project}/webApps/1:718750168831:web:ac26b18f297ebc08907eca/config`,
    );
    const fields = {
      API_KEY: result.apiKey,
      AUTH_DOMAIN: result.authDomain,
      PROJECT_ID: result.projectId,
      STORAGE_BUCKET: result.storageBucket || `${project}.firebasestorage.app`,
      MESSAGING_SENDER_ID: result.messagingSenderId,
      APP_ID: result.appId,
      DATABASE_URL: `https://${project}-default-rtdb.asia-southeast1.firebasedatabase.app`,
    };
    fs.writeFileSync(
      '.env.local',
      Object.entries(fields)
        .map(([key, value]) => `EXPO_PUBLIC_FIREBASE_${key}=${value}`)
        .join('\n') + '\n',
    );
    console.log('Firebase client configuration written to ignored .env.local.');
  } else throw new Error('Use enable, auth, rtdb, billing, or config.');
}
main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
