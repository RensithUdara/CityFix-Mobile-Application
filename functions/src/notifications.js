const { createHash } = require('node:crypto');
const { db, FieldValue } = require('./shared');
async function notifyFollowers(issueId, issue, kind, eventId, actorId) {
  const followers = await db.collectionGroup('follows').where('issueId', '==', issueId).get();
  for (const follow of followers.docs) {
    const settings = follow.data();
    const uid = follow.ref.parent.parent.id;
    if (
      uid === actorId ||
      (kind === 'comment' ? !settings.commentUpdates : settings.statusUpdates === false)
    )
      continue;
    const id = createHash('sha256').update(`${eventId}:${uid}`).digest('hex');
    const title =
      kind === 'comment' ? 'New neighborhood observation' : 'An issue you follow has an update';
    const body =
      kind === 'comment' ? `A new comment on ${issue.title}` : `${issue.title}: ${issue.status}`;
    await db.runTransaction(async (tx) => {
      const inbox = db.doc(`users/${uid}/notifications/${id}`);
      if ((await tx.get(inbox)).exists) return;
      tx.set(inbox, {
        issueId,
        title,
        body,
        kind,
        read: false,
        createdAt: FieldValue.serverTimestamp(),
      });
      tx.set(db.doc(`notificationOutbox/${id}`), {
        uid,
        issueId,
        title,
        body,
        state: 'queued',
        attempts: 0,
        nextAttemptAt: 0,
        createdAt: FieldValue.serverTimestamp(),
      });
    });
  }
}
async function deliverPush(id) {
  const ref = db.doc(`notificationOutbox/${id}`);
  const job = await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const data = snap.data();
    if (
      !data ||
      ['sent', 'no-devices', 'failed'].includes(data.state) ||
      data.nextAttemptAt > Date.now()
    )
      return null;
    tx.update(ref, {
      state: 'sending',
      attempts: data.attempts + 1,
      nextAttemptAt: Date.now() + 120000,
    });
    return data;
  });
  if (!job) return;
  try {
    const devices = await db.collection(`users/${job.uid}/pushTokens`).limit(20).get();
    if (devices.empty) {
      await ref.update({ state: 'no-devices' });
      return;
    }
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(
        devices.docs.map((d) => ({
          to: d.data().token,
          title: job.title,
          body: job.body,
          sound: 'default',
          channelId: 'issue-updates',
          data: { issueId: job.issueId },
          priority: 'high',
        })),
      ),
      signal: AbortSignal.timeout(20000),
    });
    if (!response.ok) throw new Error(`Push service returned ${response.status}`);
    const result = await response.json();
    if (!Array.isArray(result.data)) throw new Error('Push service returned an invalid response');
    const receipts = [];
    for (const [index, ticket] of result.data.entries()) {
      if (ticket.status === 'ok')
        receipts.push({ id: ticket.id, devicePath: devices.docs[index].ref.path });
      else if (ticket.details?.error === 'DeviceNotRegistered')
        await devices.docs[index].ref.delete();
    }
    const failures = result.data.filter(
      (t) => t.status === 'error' && t.details?.error !== 'DeviceNotRegistered',
    );
    await ref.update({
      state: failures.length && !receipts.length ? 'failed' : 'sent',
      receipts,
      deliveryErrors: failures.map((t) => t.details?.error || 'unknown'),
      receiptsChecked: !receipts.length,
      sentAt: FieldValue.serverTimestamp(),
    });
  } catch (error) {
    await ref.update({
      state: job.attempts >= 4 ? 'failed' : 'retry',
      nextAttemptAt: Date.now() + Math.min(3600000, 30000 * 2 ** job.attempts),
      lastError: String(error.message).slice(0, 200),
    });
  }
}
async function maintainPush() {
  const pending = await db
    .collection('notificationOutbox')
    .where('state', 'in', ['queued', 'retry', 'sending'])
    .limit(100)
    .get();
  for (const job of pending.docs) await deliverPush(job.id);
  const sent = await db
    .collection('notificationOutbox')
    .where('receiptsChecked', '==', false)
    .limit(50)
    .get();
  for (const job of sent.docs) {
    const data = job.data();
    if (!data.sentAt || data.sentAt.toMillis() > Date.now() - 15 * 60000) continue;
    const response = await fetch('https://exp.host/--/api/v2/push/getReceipts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: data.receipts.map((r) => r.id) }),
      signal: AbortSignal.timeout(20000),
    });
    if (!response.ok) continue;
    const result = await response.json();
    let complete = true;
    for (const receipt of data.receipts) {
      const status = result.data?.[receipt.id];
      if (!status) {
        complete = false;
        continue;
      }
      if (status.details?.error === 'DeviceNotRegistered')
        await db.doc(receipt.devicePath).delete();
    }
    if (complete || data.sentAt.toMillis() < Date.now() - 86400000)
      await job.ref.update({ receiptsChecked: true });
  }
}
module.exports = { notifyFollowers, deliverPush, maintainPush };
