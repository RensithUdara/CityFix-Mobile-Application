import { FormEvent, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, User } from 'firebase/auth';
import { collection, doc, limit, onSnapshot, orderBy, query } from 'firebase/firestore';
import { auth, db, configured } from './firebase';
import { Reports } from './Reports';
import { Webhooks } from './Webhooks';
import { Insights } from './Insights';
export function useRows(path: string) {
  const [rows, setRows] = useState<any[]>([]),
    [error, setError] = useState('');
  useEffect(
    () =>
      onSnapshot(
        query(collection(db, path), orderBy('createdAt', 'desc'), limit(100)),
        (s) => {
          setRows(s.docs.map((d) => ({ ...d.data(), id: d.id })));
          setError('');
        },
        (e) => setError(e.message),
      ),
    [path],
  );
  return { rows, error };
}
export function App() {
  const [user, setUser] = useState<User | null>(null),
    [ready, setReady] = useState(false),
    [admin, setAdmin] = useState(false),
    [checking, setChecking] = useState(true);
  const [tab, setTab] = useState('Overview'),
    [email, setEmail] = useState(''),
    [password, setPassword] = useState(''),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false);
  useEffect(
    () =>
      onAuthStateChanged(auth, (u) => {
        setUser(u);
        setAdmin(false);
        setChecking(!!u);
        setReady(true);
      }),
    [],
  );
  useEffect(() => {
    if (!user) return;
    return onSnapshot(
      doc(db, 'admin', user.uid),
      (s) => {
        setAdmin(s.data()?.active === true);
        setChecking(false);
      },
      (e) => {
        setError(e.message);
        setChecking(false);
      },
    );
  }, [user]);
  async function login(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      setPassword('');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  if (!configured)
    return (
      <main className="login">
        <h1>Configure CityFix Admin</h1>
        <p>Copy .env.example to .env.local and add your Firebase web app configuration.</p>
      </main>
    );
  if (!ready || (user && checking))
    return (
      <main className="login" role="status">
        Checking your access…
      </main>
    );
  if (!user)
    return (
      <main className="login">
        <img src="/logo.png" alt="CityFix" />
        <p className="eyebrow">COMMUNITY OPERATIONS</p>
        <h1>A better city starts with care.</h1>
        <p>Sign in to review reports and help your community move forward.</p>
        <form onSubmit={login}>
          <label>
            Email
            <input
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label>
            Password
            <input
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          <button disabled={busy}>Sign in</button>
        </form>
        {error && <p role="alert">{error}</p>}
      </main>
    );
  if (!admin)
    return (
      <main className="login">
        <h1>Administrator access required</h1>
        <p>
          You are signed in as {user.email}. Ask the project owner to activate your admin record.
        </p>
        <button onClick={() => void signOut(auth)}>Sign out</button>
        {error && <p role="alert">{error}</p>}
      </main>
    );
  return (
    <div className="shell">
      <aside>
        <div className="brand">
          <img src="/logo.png" alt="" />
          <strong>
            CityFix <small>ADMIN WORKSPACE</small>
          </strong>
        </div>
        <nav>
          {['Overview', 'Reports', 'Review queue', 'Webhooks', 'Audit log'].map((t) => (
            <button
              key={t}
              aria-current={tab === t ? 'page' : undefined}
              className={tab === t ? 'active' : ''}
              onClick={() => setTab(t)}
            >
              {t}
            </button>
          ))}
        </nav>
        <footer>
          <small>{user.email}</small>
          <button className="subtle" onClick={() => void signOut(auth)}>
            Sign out
          </button>
        </footer>
      </aside>
      <main>
        <header>
          <p className="eyebrow">CITYFIX / {tab.toUpperCase()}</p>
          <span className="pill">Administrator</span>
        </header>
        {tab === 'Overview' ? (
          <Insights />
        ) : tab === 'Reports' ? (
          <Reports />
        ) : tab === 'Webhooks' ? (
          <Webhooks />
        ) : (
          <Records
            path={tab === 'Review queue' ? 'moderationFlags' : 'moderationAudit'}
            title={tab}
          />
        )}
      </main>
    </div>
  );
}
function Records({ path, title }: { path: string; title: string }) {
  const { rows, error } = useRows(path);
  const [selected, setSelected] = useState('');
  return (
    <>
      <h1>{title}</h1>
      <p>Latest 100 records. Every moderation decision is recorded.</p>
      {error && <p role="alert">{error}</p>}
      {selected && <Reports initialQuery={'CF-' + selected} />}
      <div className="cards">
        {rows.map((r) => (
          <article key={r.id}>
            <span className="pill">{r.state || r.action}</span>
            <h3>CF-{r.issueId}</h3>
            <p>{r.reason}</p>
            <button className="subtle" onClick={() => setSelected(r.issueId)}>
              Review report
            </button>
          </article>
        ))}
        {!rows.length && <article>No records yet.</article>}
      </div>
    </>
  );
}
