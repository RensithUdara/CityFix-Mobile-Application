import { FormEvent, useEffect, useState } from 'react';
import { call } from './firebase';
type Report = {
  id: string;
  title: string;
  description: string;
  status: string;
  severity: string;
  category: string;
  address: string;
  photos: { url: string }[];
  createdAt: string;
};
export function Reports({ initialQuery = '' }: { initialQuery?: string }) {
  const [filters, setFilters] = useState({
      query: initialQuery,
      category: '',
      status: '',
      severity: '',
      since: '',
      until: '',
    }),
    [rows, setRows] = useState<Report[]>([]),
    [cursor, setCursor] = useState<string | null>(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [selected, setSelected] = useState<Report | null>(null),
    [reason, setReason] = useState(''),
    [status, setStatus] = useState('In progress'),
    [message, setMessage] = useState('');
  async function search(next = false, f = filters) {
    setBusy(true);
    setError('');
    try {
      const data = await call<{ items: Report[]; nextCursor: string | null }>('searchIssues', {
        ...f,
        cursor: next ? cursor : '',
      });
      setRows((old) => (next ? [...old, ...data.items] : data.items));
      setCursor(data.nextCursor);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  useEffect(() => {
    const f = { ...filters, query: initialQuery };
    setFilters(f);
    void search(false, f);
  }, [initialQuery]);
  async function moderate(action: string) {
    if (!selected) return;
    if (
      action === 'delete' &&
      !window.confirm('Permanently delete this report, photos, and comments?')
    )
      return;
    setBusy(true);
    setError('');
    try {
      await call('moderateIssue', { issueId: selected.id, action, status, reason });
      setMessage('Decision saved to the audit log.');
      setSelected(null);
      setReason('');
      await search();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <h1>Every report is a place to start.</h1>
      <p>Search all reports by words, reference, category, priority, and date.</p>
      <form
        className="filters"
        onSubmit={(e: FormEvent) => {
          e.preventDefault();
          void search();
        }}
      >
        <label className="wide">
          Search
          <input
            value={filters.query}
            onChange={(e) => setFilters({ ...filters, query: e.target.value })}
            placeholder="Street, title, description, or CF-reference"
          />
        </label>
        {(['category', 'status', 'severity'] as const).map((key) => (
          <label key={key}>
            {key}
            <select
              value={filters[key]}
              onChange={(e) => setFilters({ ...filters, [key]: e.target.value })}
            >
              <option value="">All</option>
              {(key === 'category'
                ? ['Roads', 'Lighting', 'Waste', 'Water', 'Public spaces']
                : key === 'status'
                  ? ['Reported', 'In progress', 'Resolved']
                  : ['Low', 'Medium', 'High']
              ).map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </label>
        ))}
        {(['since', 'until'] as const).map((key) => (
          <label key={key}>
            {key}
            <input
              type="date"
              value={filters[key]}
              onChange={(e) => setFilters({ ...filters, [key]: e.target.value })}
            />
          </label>
        ))}
        <button disabled={busy}>Search</button>
      </form>
      {error && <p role="alert">{error}</p>}
      {message && <p role="status">{message}</p>}
      {selected && (
        <article className="detail">
          <button className="subtle" onClick={() => setSelected(null)}>
            Close review
          </button>
          <h2>{selected.title}</h2>
          <p>{selected.description}</p>
          <p>{selected.address}</p>
          <div className="photos">
            {selected.photos.map((p, i) => (
              <a href={p.url} target="_blank" rel="noreferrer" key={i}>
                <img src={p.url} alt={`Evidence ${i + 1}`} />
              </a>
            ))}
          </div>
          <label>
            Decision note
            <textarea value={reason} onChange={(e) => setReason(e.target.value)} minLength={5} />
          </label>
          <label>
            Status
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              {['Reported', 'In progress', 'Resolved'].map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </label>
          <div className="actions">
            <button
              disabled={busy || reason.trim().length < 5}
              onClick={() => void moderate('status')}
            >
              Update status
            </button>
            <button
              disabled={busy || reason.trim().length < 5}
              onClick={() => void moderate('dismiss')}
            >
              Dismiss flags
            </button>
            <button
              className="danger"
              disabled={busy || reason.trim().length < 5}
              onClick={() => void moderate('delete')}
            >
              Delete report
            </button>
          </div>
        </article>
      )}
      <div className="table">
        <table>
          <thead>
            <tr>
              <th>Report</th>
              <th>Category</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>
                  <strong>{r.title}</strong>
                  <small>CF-{r.id}</small>
                  <small>{r.address}</small>
                </td>
                <td>{r.category}</td>
                <td>{r.severity}</td>
                <td>
                  <span className="pill">{r.status}</span>
                </td>
                <td>
                  <button
                    className="subtle"
                    onClick={() => {
                      setSelected(r);
                      setMessage('');
                    }}
                  >
                    Review
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!rows.length && !busy && (
        <p>No matches in the scanned reports. Continue searching if more pages are available.</p>
      )}
      {cursor && (
        <button disabled={busy} onClick={() => void search(true)}>
          Search next 200 reports
        </button>
      )}
    </>
  );
}
