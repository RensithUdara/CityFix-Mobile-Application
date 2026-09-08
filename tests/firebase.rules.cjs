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
function report(ownerId) {
  return {
    ownerId,
    title: 'Pavement needs repair',
    description: 'The pavement outside the library is damaged.',
    category: 'Roads',
    severity: 'Medium',
    address: 'Library entrance',
    latitude: null,
    longitude: null,
    image: null,
    imagePath: null,
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
  await assertSucceeds(alice.doc('users/alice/follows/a').set({ createdAt: serverTimestamp() }));
  await assertFails(bob.doc('users/alice/follows/a').get());
  await assertSucceeds(
    env
      .authenticatedContext('moderator', { admin: true })
      .firestore()
      .doc('issues/a')
      .update({ status: 'Resolved', updatedAt: serverTimestamp() }),
  );
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
});
