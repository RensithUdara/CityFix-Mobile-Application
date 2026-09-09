const { randomBytes, createHash } = require('node:crypto');
const {
  db,
  FieldValue,
  FieldPath,
  requireUser,
  text,
  id,
  rateLimit,
  HttpsError,
} = require('./shared');
const { categories, statuses, publicIssue } = require('./domain');
const hash = (value) => createHash('sha256').update(value).digest('hex');
async function createIntegrationKey(request) {
  const uid = requireUser(request);
  await rateLimit(uid, 'create-key', 3);
  const label = text(request.data?.label, 3, 60, 'Label');
  const existing = await db.collection(`users/${uid}/apiKeys`).where('revoked', '==', false).get();
  if (existing.size >= 5)
    throw new HttpsError('resource-exhausted', 'Revoke an existing key before creating another.');
  const secret = `cf_${randomBytes(32).toString('hex')}`,
    keyId = hash(secret);
  const data = {
    uid,
    label,
    scopes: ['issues:read', 'analytics:read'],
    revoked: false,
    expiresAt: Date.now() + 90 * 86400000,
    createdAt: FieldValue.serverTimestamp(),
  };
  const batch = db.batch();
  batch.set(db.doc(`integrationKeys/${keyId}`), data);
  batch.set(db.doc(`users/${uid}/apiKeys/${keyId}`), {
    label,
    scopes: data.scopes,
    revoked: false,
    expiresAt: data.expiresAt,
    createdAt: data.createdAt,
  });
  await batch.commit();
  return { key: secret, id: keyId, expiresAt: data.expiresAt };
}
async function revokeIntegrationKey(request) {
  const uid = requireUser(request),
    keyId = id(request.data?.id);
  await db.runTransaction(async (tx) => {
    const ref = db.doc(`integrationKeys/${keyId}`);
    const snap = await tx.get(ref);
    if (snap.data()?.uid !== uid)
      throw new HttpsError('permission-denied', 'Key does not belong to this account.');
    tx.update(ref, { revoked: true });
    tx.update(db.doc(`users/${uid}/apiKeys/${keyId}`), { revoked: true });
  });
  return { ok: true };
}
async function integrationApi(req, res) {
  res.set('Cache-Control', 'no-store');
  try {
    if (req.method !== 'GET')
      return res.status(405).set('Allow', 'GET').json({ error: 'Only GET is supported.' });
    const token = req.headers.authorization?.match(/^Bearer (cf_[a-f0-9]{64})$/)?.[1];
    if (!token)
      return res.status(401).json({ error: 'A CityFix integration bearer key is required.' });
    const keyId = hash(token),
      key = (await db.doc(`integrationKeys/${keyId}`).get()).data();
    if (!key || key.revoked || key.expiresAt <= Date.now())
      return res.status(401).json({ error: 'Key is invalid, revoked, or expired.' });
    await rateLimit(keyId, 'api', 60);
    const route = req.path.replace(/\/$/, '');
    if (route === '/v1/analytics')
      return res.json((await db.doc('analytics/community').get()).data() || { total: 0 });
    const match = route.match(/^\/v1\/issues\/([A-Za-z0-9_-]{1,128})$/);
    if (match) {
      const snap = await db.doc(`issues/${match[1]}`).get();
      return snap.exists
        ? res.json(publicIssue(snap.id, snap.data()))
        : res.status(404).json({ error: 'Issue not found.' });
    }
    if (route !== '/v1/issues') return res.status(404).json({ error: 'Unknown API endpoint.' });
    let query = db.collection('issues');
    if (req.query.category) {
      if (!categories.includes(req.query.category))
        return res.status(400).json({ error: 'Invalid category.' });
      query = query.where('category', '==', req.query.category);
    }
    if (req.query.status) {
      if (!statuses.includes(req.query.status))
        return res.status(400).json({ error: 'Invalid status.' });
      query = query.where('status', '==', req.query.status);
    }
    query = query.orderBy('createdAt', 'desc').orderBy(FieldPath.documentId(), 'desc');
    if (req.query.cursor) {
      if (typeof req.query.cursor !== 'string' || req.query.cursor.length > 500)
        return res.status(400).json({ error: 'Invalid cursor.' });
      let cursor;
      try {
        cursor = JSON.parse(Buffer.from(req.query.cursor, 'base64url').toString());
      } catch {
        return res.status(400).json({ error: 'Invalid cursor.' });
      }
      if (!Number.isFinite(cursor.time) || !/^[A-Za-z0-9_-]+$/.test(cursor.id))
        return res.status(400).json({ error: 'Invalid cursor.' });
      query = query.startAfter(new Date(cursor.time), cursor.id);
    }
    const limit = req.query.limit === undefined ? 20 : Number(req.query.limit);
    if (!Number.isInteger(limit) || limit < 1 || limit > 50)
      return res.status(400).json({ error: 'Limit must be between 1 and 50.' });
    const snapshot = await query.limit(limit + 1).get(),
      page = snapshot.docs.slice(0, limit),
      last = page.at(-1);
    return res.json({
      issues: page.map((d) => publicIssue(d.id, d.data())),
      nextCursor:
        snapshot.size > limit && last
          ? Buffer.from(
              JSON.stringify({ time: last.data().createdAt.toMillis(), id: last.id }),
            ).toString('base64url')
          : null,
    });
  } catch (error) {
    return res
      .status(error.code === 'resource-exhausted' ? 429 : 500)
      .json({
        error:
          error.code === 'resource-exhausted'
            ? 'Rate limit reached. Retry in one minute.'
            : 'Request could not be completed.',
      });
  }
}
module.exports = { createIntegrationKey, revokeIntegrationKey, integrationApi };
