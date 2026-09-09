const { db, FieldValue } = require('./shared');
const { contribution, adjust, achievements } = require('./domain');
async function syncAnalytics(issueId) {
  await db.runTransaction(async tx => {
    const source = db.doc(`issues/${issueId}`), ledger = db.doc(`analyticsContributions/${issueId}`), summaryRef = db.doc('analytics/community');
    const [current, previous, summary] = await Promise.all([tx.get(source), tx.get(ledger), tx.get(summaryRef)]);
    const next = contribution(current.data());
    const old = previous.data()?.value ?? null;
    if (JSON.stringify(next) === JSON.stringify(old)) return;
    const owners = [...new Set([next?.ownerId, old?.ownerId].filter(Boolean))];
    const ownerStats = await Promise.all(owners.map(uid => tx.get(db.doc(`users/${uid}/achievements/summary`))));
    const metrics = adjust(adjust({ ...(summary.data() || {}) }, old, -1), next, 1);
    // Keep two years of daily trends bounded; lifetime totals remain complete.
    const cutoff = new Date(Date.now() - 730 * 86400000).toISOString().slice(0, 10);
    metrics.byDay = Object.fromEntries(Object.entries(metrics.byDay || {}).filter(([day]) => day >= cutoff));
    tx.set(summaryRef, { ...metrics, updatedAt: FieldValue.serverTimestamp() });
    owners.forEach((uid, index) => {
      const stats = ownerStats[index].data() || {};
      const reports = (stats.reports || 0) + Number(next?.ownerId === uid) - Number(old?.ownerId === uid);
      const resolved = (stats.resolved || 0) + Number(next?.ownerId === uid && next.status === 'Resolved') - Number(old?.ownerId === uid && old.status === 'Resolved');
      tx.set(ownerStats[index].ref, { ...achievements(reports, resolved), updatedAt: FieldValue.serverTimestamp() });
    });
    if (next) tx.set(ledger, { value: next }); else tx.delete(ledger);
  });
}
module.exports = { syncAnalytics };
