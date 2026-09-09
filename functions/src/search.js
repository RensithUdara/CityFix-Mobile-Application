const { db, requireUser, rateLimit, HttpsError } = require('./shared');
const { publicIssue } = require('./domain');
async function searchIssues(request) {
  const uid = requireUser(request);
  await rateLimit(uid, 'search', 60);
  const {
    query = '',
    category = '',
    status = '',
    severity = '',
    since = '',
    until = '',
    cursor = '',
  } = request.data || {};
  if (
    [query, category, status, severity, since, until, cursor].some((v) => typeof v !== 'string') ||
    query.length > 160
  )
    throw new HttpsError('invalid-argument', 'Invalid search filters.');
  for (const date of [since, until])
    if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date))
      throw new HttpsError('invalid-argument', 'Use YYYY-MM-DD dates.');
  let source = db.collection('issues').orderBy('createdAt', 'desc').orderBy('__name__', 'desc');
  if (cursor) {
    try {
      const { seconds, nanos, id } = JSON.parse(Buffer.from(cursor, 'base64url').toString());
      if (!Number.isInteger(seconds) || !Number.isInteger(nanos) || !/^[\w-]{1,128}$/.test(id))
        throw Error();
      const { Timestamp } = require('firebase-admin/firestore');
      source = source.startAfter(new Timestamp(seconds, nanos), id);
    } catch {
      throw new HttpsError('invalid-argument', 'Invalid search cursor.');
    }
  }
  const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  const page = await source.limit(200).get();
  const items = page.docs
    .filter((doc) => {
      const d = doc.data(),
        day = d.createdAt?.toDate().toISOString().slice(0, 10) || '';
      const content = `${d.title} ${d.description} ${d.address} CF-${doc.id}`.toLowerCase();
      return (
        (!category || d.category === category) &&
        (!status || d.status === status) &&
        (!severity || d.severity === severity) &&
        (!since || day >= since) &&
        (!until || day <= until) &&
        terms.every((t) => content.includes(t))
      );
    })
    .map((d) => publicIssue(d.id, d.data()));
  const last = page.docs.at(-1),
    stamp = last?.data().createdAt;
  return {
    items,
    scanned: page.size,
    nextCursor:
      page.size === 200 && stamp
        ? Buffer.from(
            JSON.stringify({ seconds: stamp.seconds, nanos: stamp.nanoseconds, id: last.id }),
          ).toString('base64url')
        : null,
  };
}
module.exports = { searchIssues };
