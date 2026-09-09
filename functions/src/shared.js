const { initializeApp, getApps } = require('firebase-admin/app');
const { getFirestore, FieldValue, FieldPath } = require('firebase-admin/firestore');
const { HttpsError } = require('firebase-functions/v2/https');
if (!getApps().length) initializeApp();
const db = getFirestore();
function requireUser(request) {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Please sign in.');
  return request.auth.uid;
}
async function requireAdmin(request) {
  const uid = requireUser(request);
  if ((await db.doc(`admin/${uid}`).get()).data()?.active !== true)
    throw new HttpsError('permission-denied', 'Moderator access is required.');
  return uid;
}
function text(value, min, max, label) {
  if (typeof value !== 'string' || value.trim().length < min || value.trim().length > max)
    throw new HttpsError('invalid-argument', `${label} must contain ${min}–${max} characters.`);
  return value.trim();
}
function id(value) {
  if (typeof value !== 'string' || !/^[A-Za-z0-9_-]{1,128}$/.test(value))
    throw new HttpsError('invalid-argument', 'Invalid identifier.');
  return value;
}
async function rateLimit(uid, operation, maximum = 30) {
  const minute = Math.floor(Date.now() / 60000);
  const target = db.doc(`rateLimits/${uid}_${operation}`);
  await db.runTransaction(async (tx) => {
    const snap = await tx.get(target);
    const previous = snap.data();
    const count = previous?.minute === minute ? previous.count : 0;
    if (count >= maximum)
      throw new HttpsError('resource-exhausted', 'Too many requests. Try again in a minute.');
    tx.set(target, { minute, count: count + 1 });
  });
}
module.exports = {
  db,
  FieldValue,
  FieldPath,
  HttpsError,
  requireUser,
  requireAdmin,
  text,
  id,
  rateLimit,
};
