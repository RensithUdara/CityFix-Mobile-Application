const { setGlobalOptions } = require('firebase-functions/v2');
const { onCall, onRequest } = require('firebase-functions/v2/https');
const { onDocumentWritten, onDocumentCreated } = require('firebase-functions/v2/firestore');
const { onSchedule } = require('firebase-functions/v2/scheduler');
const { db } = require('./shared');
const webhooks = require('./webhooks');

const { syncAnalytics } = require('./analytics');
const { notifyFollowers, deliverPush, maintainPush } = require('./notifications');
const moderation = require('./moderation');
const integrations = require('./integrations');
setGlobalOptions({ region: 'us-central1', maxInstances: 5, memory: '256MiB' });
exports.searchIssues = onCall(require('./search').searchIssues);
exports.manageWebhook = onCall(webhooks.manageWebhook);
exports.flagIssue = onCall(moderation.flagIssue);
exports.moderateIssue = onCall(moderation.moderateIssue);
exports.createIntegrationKey = onCall(integrations.createIntegrationKey);
exports.revokeIntegrationKey = onCall(integrations.revokeIntegrationKey);
exports.integrationApi = onRequest({ cors: false }, integrations.integrationApi);
exports.issueChanged = onDocumentWritten(
  { document: 'issues/{issueId}', retry: true },
  async (event) => {
    await syncAnalytics(event.params.issueId);
    await webhooks.queueWebhooks(
      event.id,
      event.params.issueId,
      event.data.before.data(),
      event.data.after.data(),
    );
    const before = event.data.before.data(),
      after = event.data.after.data();
    if (before && after && before.status !== after.status)
      await notifyFollowers(event.params.issueId, after, 'status', event.id);
  },
);
exports.commentAdded = onDocumentCreated(
  { document: 'issues/{issueId}/comments/{commentId}', retry: true },
  async (event) => {
    const issue = await db.doc(`issues/${event.params.issueId}`).get();
    if (issue.exists)
      await notifyFollowers(
        issue.id,
        issue.data(),
        'comment',
        event.id,
        event.data.data().authorId,
      );
  },
);
exports.pushQueued = onDocumentCreated(
  { document: 'notificationOutbox/{id}', retry: true },
  (event) => deliverPush(event.params.id),
);
exports.issueDeletion = onDocumentCreated(
  { document: 'deletionJobs/{issueId}', retry: true },
  (event) => moderation.cleanupIssue(event.params.issueId, event.data.data().ownerId),
);
exports.pushMaintenance = onSchedule('every 5 minutes', maintainPush);
exports.reconcileAnalytics = onSchedule(
  { schedule: 'every day 02:00', timeoutSeconds: 540 },
  async () => {
    let cursor;
    do {
      let query = db.collection('issues').orderBy('__name__').limit(100);
      if (cursor) query = query.startAfter(cursor);
      const page = await query.get();
      for (const doc of page.docs) await syncAnalytics(doc.id);
      cursor = page.size === 100 ? page.docs.at(-1) : null;
    } while (cursor);
  },
);

exports.webhookQueued = onDocumentCreated(
  { document: 'webhookDeliveries/{id}', retry: true },
  (event) => webhooks.deliverWebhook(event.params.id),
);
exports.webhookMaintenance = onSchedule('every 5 minutes', webhooks.retryWebhooks);
