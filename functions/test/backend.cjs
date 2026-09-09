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
    const admin = { uid: 'backend-moderator', token: { admin: true } };
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
    await Promise.all(getApps().map(deleteApp));
  },
);
