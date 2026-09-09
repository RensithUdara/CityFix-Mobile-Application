const crypto = require('node:crypto');
const https = require('node:https');
const dns = require('node:dns/promises');
const { db, requireAdmin, text, id, FieldValue, HttpsError } = require('./shared');
const { publicIssue } = require('./domain');
const events = ['issue.created', 'issue.status_changed', 'issue.deleted'];
function publicAddress(ip) {
  const p = ip.split('.').map(Number);
  return (
    p.length === 4 &&
    p.every((n) => Number.isInteger(n) && n >= 0 && n <= 255) &&
    ![0, 10, 127].includes(p[0]) &&
    p[0] < 224 &&
    !(p[0] === 100 && p[1] >= 64 && p[1] <= 127) &&
    !(p[0] === 169 && p[1] === 254) &&
    !(p[0] === 172 && p[1] >= 16 && p[1] <= 31) &&
    !(p[0] === 192 && (p[1] === 168 || p[1] === 0 || p[1] === 2)) &&
    !(p[0] === 198 && [18, 19, 51].includes(p[1])) &&
    !(p[0] === 203 && p[1] === 0)
  );
}
async function endpoint(value) {
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new HttpsError('invalid-argument', 'Enter a valid HTTPS URL.');
  }
  if (
    url.protocol !== 'https:' ||
    url.username ||
    url.password ||
    url.hash ||
    (url.port && url.port !== '443')
  )
    throw new HttpsError('invalid-argument', 'Use a public HTTPS endpoint on port 443.');
  const addresses = await dns.resolve4(url.hostname);
  if (!addresses.length || addresses.some((ip) => !publicAddress(ip)))
    throw new HttpsError('invalid-argument', 'Only public IPv4 endpoints are supported.');
  return { url, address: addresses[0] };
}
async function manageWebhook(request) {
  const uid = await requireAdmin(request),
    data = request.data || {};
  if (data.action === 'disable') {
    await db.doc(`webhooks/${id(data.id)}`).update({ active: false });
    return { ok: true };
  }
  if (data.action !== 'create') throw new HttpsError('invalid-argument', 'Unknown webhook action.');
  const label = text(data.label, 3, 80, 'Name');
  const { url } = await endpoint(text(data.url, 10, 2000, 'URL'));
  if (
    !Array.isArray(data.events) ||
    !data.events.length ||
    data.events.some((e) => !events.includes(e))
  )
    throw new HttpsError('invalid-argument', 'Select supported events.');
  const secret = crypto.randomBytes(32).toString('hex'),
    ref = db.collection('webhooks').doc();
  await db.runTransaction(async (tx) => {
    const existing = await tx.get(db.collection('webhooks').where('active', '==', true));
    if (existing.size >= 20)
      throw new HttpsError('resource-exhausted', 'Limit of 20 active webhooks reached.');
    tx.set(ref, {
      label,
      url: url.toString(),
      events: [...new Set(data.events)],
      active: true,
      createdBy: uid,
      createdAt: FieldValue.serverTimestamp(),
    });
    tx.set(db.doc(`webhookSecrets/${ref.id}`), { secret });
  });
  return { id: ref.id, secret };
}
async function queueWebhooks(eventId, issueId, before, after) {
  const type =
    !before && after
      ? events[0]
      : before && !after
        ? events[2]
        : before?.status !== after?.status
          ? events[1]
          : null;
  if (!type) return;
  const hooks = await db.collection('webhooks').where('active', '==', true).get();
  for (const hook of hooks.docs) {
    if (!hook.data().events.includes(type)) continue;
    const deliveryId = crypto.createHash('sha256').update(`${eventId}:${hook.id}`).digest('hex');
    const ref = db.doc(`webhookDeliveries/${deliveryId}`);
    await db.runTransaction(async (tx) => {
      if ((await tx.get(ref)).exists) return;
      tx.set(ref, {
        webhookId: hook.id,
        state: 'pending',
        attempts: 0,
        nextAttemptAt: 0,
        createdAt: FieldValue.serverTimestamp(),
        payload: JSON.stringify({
          id: deliveryId,
          type,
          issue: publicIssue(issueId, after || before),
        }),
      });
    });
  }
}
async function deliverWebhook(deliveryId) {
  const ref = db.doc(`webhookDeliveries/${deliveryId}`),
    now = Date.now();
  const delivery = await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref),
      d = snap.data();
    if (!d || ['delivered', 'failed', 'cancelled'].includes(d.state) || d.nextAttemptAt > now)
      return null;
    if (d.attempts >= 5) {
      tx.update(ref, { state: 'failed', lastError: 'Delivery attempt limit reached.' });
      return null;
    }
    tx.update(ref, { state: 'sending', attempts: d.attempts + 1, nextAttemptAt: now + 120000 });
    return { ...d, attempts: d.attempts + 1 };
  });
  if (!delivery) return;
  try {
    const hook = (await db.doc(`webhooks/${delivery.webhookId}`).get()).data();
    if (!hook?.active) {
      await ref.update({ state: 'cancelled' });
      return;
    }
    const secret = (await db.doc(`webhookSecrets/${delivery.webhookId}`).get()).data().secret;
    const { url, address } = await endpoint(hook.url),
      timestamp = String(Math.floor(Date.now() / 1000));
    const signature = crypto
      .createHmac('sha256', secret)
      .update(`${timestamp}.${delivery.payload}`)
      .digest('hex');
    const status = await new Promise((resolve, reject) => {
      const req = https.request(
        url,
        {
          method: 'POST',
          agent: false,
          family: 4,
          autoSelectFamily: false,
          lookup: (_host, _options, cb) => cb(null, address, 4),
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(delivery.payload),
            'X-CityFix-Id': deliveryId,
            'X-CityFix-Timestamp': timestamp,
            'X-CityFix-Signature': signature,
          },
        },
        (res) => {
          res.destroy();
          resolve(res.statusCode);
        },
      );
      req.setTimeout(10000, () => req.destroy(new Error('Endpoint timed out')));
      req.on('error', reject);
      req.end(delivery.payload);
    });
    if (status < 200 || status >= 300) throw new Error(`HTTP ${status}`);
    await ref.update({
      state: 'delivered',
      httpStatus: status,
      finishedAt: FieldValue.serverTimestamp(),
    });
  } catch (e) {
    await ref.update({
      state: delivery.attempts >= 5 ? 'failed' : 'pending',
      lastError: String(e.message).slice(0, 200),
      nextAttemptAt: Date.now() + Math.min(3600000, 60000 * 2 ** delivery.attempts),
    });
  }
}
async function retryWebhooks() {
  const due = await db
    .collection('webhookDeliveries')
    .where('state', 'in', ['pending', 'sending'])
    .where('nextAttemptAt', '<=', Date.now())
    .limit(100)
    .get();
  for (const d of due.docs) await deliverWebhook(d.id);
}
module.exports = { manageWebhook, queueWebhooks, deliverWebhook, retryWebhooks, publicAddress };
