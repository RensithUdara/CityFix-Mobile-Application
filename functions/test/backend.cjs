const { test, after } = require('node:test');
const assert = require('node:assert/strict');
const enabled = !!process.env.FIRESTORE_EMULATOR_HOST;
test(
  'backend authorization, key lifecycle, pagination, moderation and analytics',
  { skip: !enabled },
  async () => {
    const { db } = require('../src/shared');
    const { Timestamp } = require('firebase-admin/firestore');
    const { getApps, deleteApp } = require('firebase-admin/app');
    const { syncAnalytics } = require('../src/analytics');
    const { moderateIssue, flagIssue } = require('../src/moderation');
    const {
      createIntegrationKey,
      revokeIntegrationKey,
      integrationApi,
    } = require('../src/integrations');
    const { notifyFollowers, deliverPush } = require('../src/notifications');
    const auth = { uid: 'backend-alice', token: {} };
    const admin = { uid: 'backend-moderator', token: {} };
    await db.doc('admin/' + admin.uid).set({ active: true, role: 'admin' });
    const report = {
      ownerId: auth.uid,
      title: 'Road needs repair',
      description: 'Damaged pavement at the crossing.',
      category: 'Roads',
      status: 'Reported',
      severity: 'High',
      createdAt: Timestamp.fromMillis(Date.UTC(2026, 0, 1)),
      updatedAt: Timestamp.fromMillis(Date.UTC(2026, 0, 1)),
      photos: [],
      confirmedBy: { privateUser: true },
      latitude: null,
      longitude: null,
      address: 'Library street',
    };
    for (let i = 0; i < 3; i++)
      await db
        .doc('issues/backend-' + i)
        .set({ ...report, createdAt: Timestamp.fromMillis(Date.UTC(2026, 0, 1) + i) });
    await syncAnalytics('backend-0');
    await syncAnalytics('backend-0');
    assert.equal(
      (await db.doc('users/' + auth.uid + '/achievements/summary').get()).data().reports,
      1,
    );
    await assert.rejects(
      moderateIssue({
        auth,
        data: { issueId: 'backend-0', reason: 'Useful note', action: 'status', status: 'Resolved' },
      }),
      (e) => e.code === 'permission-denied',
    );
    await assert.rejects(
      createIntegrationKey({ data: { label: 'Tool' } }),
      (e) => e.code === 'unauthenticated',
    );
    await flagIssue({
      auth,
      data: { issueId: 'backend-0', reason: 'This report needs moderator review.' },
    });
    await moderateIssue({
      auth: admin,
      data: {
        issueId: 'backend-0',
        reason: 'Repair verified',
        action: 'status',
        status: 'Resolved',
      },
    });
    await syncAnalytics('backend-0');
    const stats = (await db.doc('users/' + auth.uid + '/achievements/summary').get()).data();
    assert.equal(stats.resolved, 1);
    assert.ok(stats.badges.includes('positive-change'));
    const key = await createIntegrationKey({ auth, data: { label: 'Backend test' } });
    async function api(path, query = {}, token = key.key) {
      const result = { status: 200, body: null };
      const res = {
        set() {
          return this;
        },
        status(value) {
          result.status = value;
          return this;
        },
        json(value) {
          result.body = value;
          return this;
        },
      };
      await integrationApi(
        { method: 'GET', path, query, headers: { authorization: 'Bearer ' + token } },
        res,
      );
      return result;
    }
    const first = await api('/v1/issues', { limit: '2' });
    assert.equal(first.status, 200);
    assert.equal(first.body.issues.length, 2);
    assert.ok(first.body.nextCursor);
    assert.equal(first.body.issues[0].ownerId, undefined);
    const second = await api('/v1/issues', { limit: '2', cursor: first.body.nextCursor });
    assert.equal(second.body.issues.length, 1);
    assert.ok(!first.body.issues.some((i) => i.id === second.body.issues[0].id));
    assert.equal((await api('/v1/issues', { cursor: 'invalid' })).status, 400);
    await revokeIntegrationKey({ auth, data: { id: key.id } });
    assert.equal((await api('/v1/issues')).status, 401);
    await db
      .doc('users/backend-bob/follows/backend-0')
      .set({ issueId: 'backend-0', statusUpdates: true, commentUpdates: false });
    await notifyFollowers('backend-0', report, 'status', 'event-1');
    await notifyFollowers('backend-0', report, 'status', 'event-1');
    const inbox = await db.collection('users/backend-bob/notifications').get();
    assert.equal(inbox.size, 1);
    await deliverPush(inbox.docs[0].id);
    assert.equal(
      (await db.doc('notificationOutbox/' + inbox.docs[0].id).get()).data().state,
      'no-devices',
    );
    await notifyFollowers('backend-0', report, 'comment', 'event-2');
    assert.equal((await db.collection('users/backend-bob/notifications').get()).size, 1);
    await db.doc('issues/backend-0').delete();
    await syncAnalytics('backend-0');
    assert.equal(
      (await db.doc('users/' + auth.uid + '/achievements/summary').get()).data().reports,
      0,
    );
    const { searchIssues } = require('../src/search');
    const found = await searchIssues({ auth, data: { query: 'pavement', severity: 'High' } });
    assert.equal(found.items.length, 2);
    assert.equal(found.items[0].ownerId, undefined);
    await assert.rejects(
      searchIssues({ auth, data: { cursor: 'bad' } }),
      (e) => e.code === 'invalid-argument',
    );
    const { queueWebhooks, deliverWebhook, manageWebhook } = require('../src/webhooks');
    await assert.rejects(
      manageWebhook({ auth, data: { action: 'disable', id: 'test' } }),
      (e) => e.code === 'permission-denied',
    );
    await db.doc('webhooks/test').set({ active: true, events: ['issue.created'] });
    await queueWebhooks('unique-event', 'backend-1', null, report);
    await queueWebhooks('unique-event', 'backend-1', null, report);
    const deliveries = await db.collection('webhookDeliveries').get();
    assert.equal(deliveries.size, 1);
    await db.doc('webhooks/test').update({ active: false });
    await deliverWebhook(deliveries.docs[0].id);
    assert.equal((await deliveries.docs[0].ref.get()).data().state, 'cancelled');
    const dns = require('node:dns/promises'),
      https = require('node:https'),
      crypto = require('node:crypto');
    const originalResolve = dns.resolve4,
      originalRequest = https.request;
    let responseCode = 204;
    try {
      dns.resolve4 = async () => ['8.8.8.8'];
      https.request = (_url, options, callback) => ({
        setTimeout() {},
        on() {},
        end(body) {
          assert.equal(options.family, 4);
          assert.equal(
            options.headers['X-CityFix-Signature'],
            crypto
              .createHmac('sha256', 'test-secret')
              .update(`${options.headers['X-CityFix-Timestamp']}.${body}`)
              .digest('hex'),
          );
          options.lookup('example.com', {}, (_error, address, family) => {
            assert.equal(address, '8.8.8.8');
            assert.equal(family, 4);
          });
          callback({ statusCode: responseCode, destroy() {} });
        },
      });
      await db
        .doc('webhooks/test')
        .set({ active: true, events: ['issue.created'], url: 'https://example.com/events' });
      await db.doc('webhookSecrets/test').set({ secret: 'test-secret' });
      await queueWebhooks('delivery-test', 'backend-1', null, report);
      const queued = await db.collection('webhookDeliveries').where('state', '==', 'pending').get();
      await deliverWebhook(queued.docs[0].id);
      assert.equal((await queued.docs[0].ref.get()).data().state, 'delivered');
      responseCode = 503;
      await queueWebhooks('failure-test', 'backend-1', null, report);
      const failed = await db.collection('webhookDeliveries').where('state', '==', 'pending').get();
      for (let attempt = 0; attempt < 5; attempt++) {
        await failed.docs[0].ref.update({ nextAttemptAt: 0 });
        await deliverWebhook(failed.docs[0].id);
      }
      assert.equal((await failed.docs[0].ref.get()).data().state, 'failed');
      assert.equal((await failed.docs[0].ref.get()).data().attempts, 5);
    } finally {
      dns.resolve4 = originalResolve;
      https.request = originalRequest;
    }
    await db.doc('admin/' + admin.uid).update({ active: false });
    await assert.rejects(
      moderateIssue({
        auth: admin,
        data: {
          issueId: 'backend-1',
          action: 'status',
          status: 'Resolved',
          reason: 'Revocation test',
        },
      }),
      (e) => e.code === 'permission-denied',
    );
    await Promise.all(getApps().map(deleteApp));
  },
);
