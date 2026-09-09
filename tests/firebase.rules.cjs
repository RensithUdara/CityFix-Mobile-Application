const { test, before, after } = require('node:test');
const fs = require('node:fs');
const {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
} = require('@firebase/rules-unit-testing');
const { serverTimestamp } = require('firebase/firestore');
let env;
before(async () => {
  env = await initializeTestEnvironment({
    projectId: 'demo-cityfix',
    firestore: { rules: fs.readFileSync('firebase/firestore.rules', 'utf8') },
    database: { rules: fs.readFileSync('firebase/database.rules.json', 'utf8') },
    storage: { rules: fs.readFileSync('firebase/storage.rules', 'utf8') },
  });
});
after(async () => {
  await env?.cleanup();
});
function report(ownerId, id = 'a', count = 1) {
  const photos = Array.from({ length: count }, (_, index) => ({
    url: `https://firebasestorage.googleapis.com/example/${id}/${index}`,
    path: `issues/${ownerId}/${id}/photo-${index}.jpg`,
  }));
  return {
    ownerId,
    title: 'Pavement needs repair',
    description: 'The pavement outside the library is damaged.',
    category: 'Roads',
    severity: 'Medium',
    address: 'Library entrance',
    latitude: null,
    longitude: null,
    image: photos[0]?.url ?? null,
    imagePath: photos[0]?.path ?? null,
    photos,
    status: 'Reported',
    confirmedBy: {},
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
}
test('Firestore enforces ownership, profile isolation, confirmation integrity, and admin-only status', async () => {
  const alice = env.authenticatedContext('alice').firestore();
  const bob = env.authenticatedContext('bob').firestore();
  const anonymous = env.unauthenticatedContext().firestore();
  await assertFails(anonymous.doc('issues/a').set(report('alice')));
  await assertFails(bob.doc('issues/a').set(report('alice')));
  await assertSucceeds(alice.doc('issues/a').set(report('alice')));
  await assertFails(anonymous.doc('issues/a').get());
  await assertSucceeds(bob.doc('issues/a').get());
  await assertFails(bob.doc('issues/a').update({ status: 'Resolved' }));
  await assertSucceeds(bob.doc('issues/a').update({ confirmedBy: { bob: true } }));
  await assertFails(alice.doc('issues/a').update({ confirmedBy: { alice: true } }));
  await assertSucceeds(alice.doc('issues/a').update({ confirmedBy: { alice: true, bob: true } }));
  await assertFails(alice.doc('issues/a').update({ confirmedBy: { alice: false, bob: true } }));
  await assertSucceeds(
    alice.doc('users/alice').set({ displayName: 'Alice', neighborhood: 'Town' }),
  );
  await assertFails(bob.doc('users/alice').get());
  await assertFails(alice.doc('users/alice').update({ admin: true }));
  await assertSucceeds(
    alice
      .doc('users/alice/follows/a')
      .set({
        createdAt: serverTimestamp(),
        issueId: 'a',
        statusUpdates: true,
        commentUpdates: false,
      }),
  );
  await assertFails(bob.doc('users/alice/follows/a').get());
  await assertSucceeds(
    env
      .authenticatedContext('moderator', { admin: true })
      .firestore()
      .doc('issues/a')
      .update({ status: 'Resolved', updatedAt: serverTimestamp() }),
  );
});
test('Photo counts, private preferences/support, comments, and atomic auto-follow are enforced', async () => {
  const alice = env.authenticatedContext('alice').firestore();
  const bob = env.authenticatedContext('bob').firestore();
  await assertFails(alice.doc('issues/empty').set(report('alice', 'empty', 0)));
  await assertFails(alice.doc('issues/six').set(report('alice', 'six', 6)));
  await assertSucceeds(alice.doc('issues/five').set(report('alice', 'five', 5)));
  const wrongPath = report('alice', 'wrong');
  wrongPath.photos[0].path = 'issues/bob/wrong/photo-0.jpg';
  await assertFails(alice.doc('issues/wrong').set(wrongPath));
  const batch = alice.batch();
  batch.set(alice.doc('issues/auto'), report('alice', 'auto'));
  batch.set(alice.doc('users/alice/follows/auto'), {
    createdAt: serverTimestamp(),
    issueId: 'auto',
    statusUpdates: true,
    commentUpdates: false,
  });
  await assertSucceeds(batch.commit());
  const preferences = { autoFollow: true, showResolved: false, defaultSeverity: 'High' };
  await assertSucceeds(alice.doc('users/alice/preferences/app').set(preferences));
  await assertFails(bob.doc('users/alice/preferences/app').get());
  await assertFails(bob.doc('users/alice/preferences/app').set(preferences));
  await assertFails(alice.doc('users/alice/preferences/app').update({ defaultSeverity: 'Urgent' }));
  const support = {
    subject: 'A question',
    message: 'Please help me with this account.',
    status: 'Received',
    createdAt: serverTimestamp(),
  };
  await assertSucceeds(alice.doc('users/alice/supportRequests/a').set(support));
  await assertFails(bob.doc('users/alice/supportRequests/a').get());
  await assertFails(alice.doc('users/alice/supportRequests/b').set({ ...support, message: '' }));
  const comment = {
    authorId: 'alice',
    authorName: 'Alice',
    body: 'A helpful detail',
    createdAt: serverTimestamp(),
  };
  await assertFails(bob.doc('issues/five/comments/a').set(comment));
  await assertSucceeds(alice.doc('issues/five/comments/a').set(comment));
  await assertSucceeds(bob.doc('issues/five/comments/a').get());
  await assertFails(bob.doc('issues/five/comments/a').delete());
  await assertSucceeds(alice.doc('issues/five/comments/a').delete());
});
test('notification inbox, push tokens, subscriptions and trusted metrics are isolated', async () => {
  const alice = env.authenticatedContext('alice').firestore();
  const bob = env.authenticatedContext('bob').firestore();
  await env.withSecurityRulesDisabled(async (context) => {
    await context
      .firestore()
      .doc('users/alice/notifications/n')
      .set({ read: false, title: 'Update', issueId: 'a' });
  });
  await assertSucceeds(alice.doc('users/alice/notifications/n').update({ read: true }));
  await assertFails(alice.doc('users/alice/notifications/n').update({ title: 'Spoofed' }));
  await assertFails(bob.doc('users/alice/notifications/n').get());
  await assertFails(alice.doc('users/alice/achievements/summary').set({ points: 999 }));
  await assertFails(alice.doc('analytics/community').set({ total: 999 }));
  await assertFails(alice.doc('integrationKeys/key').get());
  await assertFails(alice.doc('moderationAudit/a').set({ action: 'delete' }));
  const token = {
    token: 'ExponentPushToken[test-token]',
    platform: 'ios',
    updatedAt: serverTimestamp(),
  };
  await assertSucceeds(alice.doc('users/alice/pushTokens/device').set(token));
  await assertFails(bob.doc('users/alice/pushTokens/device').get());
  await assertFails(
    alice.doc('users/alice/pushTokens/invalid').set({ ...token, token: 'invalid' }),
  );
  await assertFails(
    alice
      .doc('users/alice/follows/a')
      .set({
        issueId: 'other',
        createdAt: serverTimestamp(),
        statusUpdates: true,
        commentUpdates: true,
      }),
  );
  await assertSucceeds(alice.doc('users/alice/follows/a').update({ commentUpdates: true }));
});
test('Realtime Database restricts presence to the current user', async () => {
  const alice = env.authenticatedContext('alice').database();
  const bob = env.authenticatedContext('bob').database();
  await assertSucceeds(
    alice.ref('presence/alice/sessions/one').set({ connectedAt: { '.sv': 'timestamp' } }),
  );
  await assertFails(
    bob.ref('presence/alice/sessions/one').set({ connectedAt: { '.sv': 'timestamp' } }),
  );
  await assertFails(bob.ref('presence/alice').once('value'));
  await assertFails(alice.ref('presence/alice/sessions/two').set({ connectedAt: 'invalid' }));
  await assertSucceeds(alice.ref('presence/alice/sessions/one').remove());
});
test('Storage rejects unauthenticated, cross-account, non-image, and oversized uploads', async () => {
  const alice = env.authenticatedContext('alice').storage();
  const bob = env.authenticatedContext('bob').storage();
  const bytes = new Uint8Array([1, 2, 3]);
  await assertFails(
    env
      .unauthenticatedContext()
      .storage()
      .ref('issues/alice/a/photo')
      .put(bytes, { contentType: 'image/png' }),
  );
  await assertFails(bob.ref('issues/alice/a/photo').put(bytes, { contentType: 'image/png' }));
  await assertFails(alice.ref('issues/alice/a/photo').put(bytes, { contentType: 'text/plain' }));
  await assertFails(
    alice
      .ref('issues/alice/large/photo')
      .put(new Uint8Array(10 * 1024 * 1024), { contentType: 'image/png' }),
  );
  await assertSucceeds(alice.ref('issues/alice/a/photo').put(bytes, { contentType: 'image/png' }));
  await assertSucceeds(bob.ref('issues/alice/a/photo').getMetadata());
  await assertFails(bob.ref('issues/alice/a/photo').delete());
  await assertSucceeds(
    alice.ref('issues/alice/five/photo-4.jpg').put(bytes, { contentType: 'image/jpeg' }),
  );
  await assertFails(
    alice.ref('issues/alice/five/photo-5.jpg').put(bytes, { contentType: 'image/jpeg' }),
  );
});
