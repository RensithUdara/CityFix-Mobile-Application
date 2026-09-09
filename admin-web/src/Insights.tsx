import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';
export function Insights() {
  const [data, setData] = useState<any>(null),
    [error, setError] = useState('');
  useEffect(
    () =>
      onSnapshot(
        doc(db, 'analytics/community'),
        (s) => setData(s.data() || {}),
        (e) => setError(e.message),
      ),
    [],
  );
  const resolved = data?.byStatus?.Resolved || 0;
  return (
    <>
      <h1>A clearer view of your community.</h1>
      <p>Live reporting totals and progress, calculated from community reports.</p>
      {error && <p role="alert">{error}</p>}
      {!data ? (
        <p>Loading insights…</p>
      ) : (
        <>
          <section className="metrics">
            {[
              ['Total reports', data.total || 0],
              ['Resolved', resolved],
              ['Resolution rate', `${data.total ? Math.round((resolved / data.total) * 100) : 0}%`],
              [
                'Average resolution',
                `${resolved ? Math.round(data.resolutionHours / resolved) : 0} hours`,
              ],
            ].map(([label, value]) => (
              <article key={label}>
                <p>{label}</p>
                <strong>{value}</strong>
              </article>
            ))}
          </section>
          <div className="cards">
            {[
              ['By category', data.byCategory],
              ['By status', data.byStatus],
              ['By priority', data.bySeverity],
              [
                'Reports · last 30 days',
                Object.fromEntries(
                  Object.entries(data.byDay || {})
                    .filter(
                      ([d]) => d >= new Date(Date.now() - 29 * 86400000).toISOString().slice(0, 10),
                    )
                    .sort(),
                ),
              ],
            ].map(([title, values]) => (
              <article key={title as string}>
                <h2>{title as string}</h2>
                {Object.entries(values || {}).map(([label, count]) => (
                  <div className="bar" key={label}>
                    <span>{label}</span>
                    <progress
                      max={Math.max(1, ...Object.values(values as Record<string, number>))}
                      value={count as number}
                    />
                    <b>{count as number}</b>
                  </div>
                ))}
              </article>
            ))}
          </div>
        </>
      )}
    </>
  );
}
