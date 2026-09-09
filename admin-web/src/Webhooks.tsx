import { FormEvent, useState } from 'react';
import { call } from './firebase';
import { useRows } from './App';
export function Webhooks() {
  const { rows, error } = useRows('webhooks'),
    deliveries = useRows('webhookDeliveries');
  const [label, setLabel] = useState(''),
    [url, setUrl] = useState(''),
    [secret, setSecret] = useState(''),
    [message, setMessage] = useState(''),
    [busy, setBusy] = useState(false);
  async function create(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage('');
    try {
      const d = await call<{ secret: string }>('manageWebhook', {
        action: 'create',
        label,
        url,
        events: ['issue.created', 'issue.status_changed', 'issue.deleted'],
      });
      setSecret(d.secret);
      setLabel('');
      setUrl('');
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <h1>Keep your systems connected.</h1>
      <p>Signed HTTPS events for new reports, status changes, and deletions.</p>
      <form className="filters" onSubmit={create}>
        <label>
          Name
          <input required minLength={3} value={label} onChange={(e) => setLabel(e.target.value)} />
        </label>
        <label className="wide">
          Endpoint
          <input
            type="url"
            required
            placeholder="https://your-service.example/events"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
        </label>
        <button disabled={busy}>Add webhook</button>
      </form>
      {secret && (
        <article>
          <h2>Save your signing secret</h2>
          <p>This value is shown once. Store it securely in your receiver.</p>
          <code>{secret}</code>
          <button onClick={() => setSecret('')}>I saved it</button>
        </article>
      )}
      {(message || error || deliveries.error) && (
        <p role="alert">{message || error || deliveries.error}</p>
      )}
      <div className="cards">
        {rows.map((r) => (
          <article key={r.id}>
            <span className="pill">{r.active ? 'Active' : 'Disabled'}</span>
            <h2>{r.label}</h2>
            <p>{r.url}</p>
            {r.active && (
              <button
                className="subtle"
                onClick={() => {
                  if (window.confirm('Disable this webhook and cancel pending deliveries?'))
                    void call('manageWebhook', { action: 'disable', id: r.id }).catch((e) =>
                      setMessage(e.message),
                    );
                }}
              >
                Disable
              </button>
            )}
          </article>
        ))}
      </div>
      <h2>Recent deliveries</h2>
      <div className="table">
        <table>
          <thead>
            <tr>
              <th>Delivery</th>
              <th>State</th>
              <th>Attempts</th>
              <th>Result</th>
            </tr>
          </thead>
          <tbody>
            {deliveries.rows.map((r) => (
              <tr key={r.id}>
                <td>
                  <small>{r.id}</small>
                </td>
                <td>{r.state}</td>
                <td>{r.attempts}</td>
                <td>{r.httpStatus || r.lastError || 'Waiting'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
