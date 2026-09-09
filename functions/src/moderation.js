const {
  db,
  FieldValue,
  requireUser,
  requireAdmin,
  text,
  id,
  rateLimit,
  HttpsError,
} = require('./shared');
const { statuses } = require('./domain');
const { getStorage } = require('firebase-admin/storage');
async function flagIssue(request) {
  const uid = requireUser(request);
  await rateLimit(uid, 'flag', 5);
  const issueId = id(request.data?.issueId),
    reason = text(request.data?.reason, 10, 1000, 'Reason');
  if (!(await db.doc(`issues/${issueId}`).get()).exists)
    throw new HttpsError('not-found', 'Report not found.');
  await db.doc(`moderationFlags/${issueId}_${uid}`).set({
    issueId,
    reporterId: uid,
    reason,
    state: 'open',
    createdAt: FieldValue.serverTimestamp(),
  });
  return { ok: true };
}
async function moderateIssue(request) {
  const uid = await requireAdmin(request);
  await rateLimit(uid, 'moderate');
  const issueId = id(request.data?.issueId),
    action = request.data?.action,
    reason = text(request.data?.reason, 5, 1000, 'Moderation note');
  if (!['status', 'dismiss', 'delete'].includes(action))
    throw new HttpsError('invalid-argument', 'Unknown moderation action.');
  if (action === 'status' && !statuses.includes(request.data.status))
    throw new HttpsError('invalid-argument', 'Invalid status.');
  const ref = db.doc(`issues/${issueId}`);
  let ownerId;
  await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists) throw new HttpsError('not-found', 'Report not found.');
    ownerId = snap.data().ownerId;
    const audit = db.collection('moderationAudit').doc();
    tx.set(audit, {
      issueId,
      moderatorId: uid,
      action,
      reason,
      previousStatus: snap.data().status,
      nextStatus: request.data.status || null,
      createdAt: FieldValue.serverTimestamp(),
    });
    if (action === 'status')
      tx.update(ref, { status: request.data.status, updatedAt: FieldValue.serverTimestamp() });
    if (action === 'delete') {
      tx.delete(ref);
      tx.set(db.doc(`deletionJobs/${issueId}`), {
        ownerId,
        createdAt: FieldValue.serverTimestamp(),
      });
    }
  });
  const flags = await db.collection('moderationFlags').where('issueId', '==', issueId).get();
  for (const flag of flags.docs)
    await flag.ref.update({
      state: 'reviewed',
      reviewedBy: uid,
      reviewedAt: FieldValue.serverTimestamp(),
    });
  return { ok: true };
}
async function cleanupIssue(issueId, ownerId) {
  await db.recursiveDelete(db.collection(`issues/${issueId}/comments`));
  const follows = await db.collectionGroup('follows').where('issueId', '==', issueId).get();
  for (const follow of follows.docs) await follow.ref.delete();
  await getStorage()
    .bucket()
    .deleteFiles({ prefix: `issues/${ownerId}/${issueId}/` });
  await db.doc(`deletionJobs/${issueId}`).delete();
}
module.exports = { flagIssue, moderateIssue, cleanupIssue };
