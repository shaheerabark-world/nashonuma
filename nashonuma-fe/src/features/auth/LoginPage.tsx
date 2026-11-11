import { useState, type FormEvent } from 'react';
import { login } from '@/api/http';
import { Logo } from '@/components/ui/Logo';
import { NAV } from '@/data/mock/app';

/** Shown only in development: the accounts created by `npm run seed` in nashonuma-api. */
const DEMO_ROLES = ['clinician', 'parent', 'supervisor', 'programme', 'researcher', 'admin'];

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      const user = await login(email.trim(), password);
      // Full reload so the data store starts with the new token.
      window.location.assign(`/${user.role}/${NAV[user.role][0][0]}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not sign in');
      setBusy(false);
    }
  };

  return (
    <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: 'var(--color-surface)', padding: 16 }}>
      <form
        onSubmit={submit}
        style={{ width: '100%', maxWidth: 380, background: 'var(--color-bg)', border: '1px solid var(--color-divider)', borderRadius: 16, padding: 28, display: 'flex', flexDirection: 'column', gap: 16 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Logo size={32} />
          <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-heading)' }}>NashoNuma</span>
        </div>
        <h1 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: 'var(--color-heading)' }}>Sign in</h1>

        <div className="field">
          <label htmlFor="login-email">Email</label>
          <input id="login-email" className="input" type="email" autoComplete="username" required value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="login-password">Password</label>
          <input id="login-password" className="input" type="password" autoComplete="current-password" required value={password} onChange={e => setPassword(e.target.value)} />
        </div>

        {error ? (
          <p role="alert" style={{ margin: 0, fontSize: 13, color: '#B91C1C' }}>
            {error}
          </p>
        ) : null}

        <button className="btn btn-primary" type="submit" disabled={busy}>
          {busy ? 'Signing in…' : 'Sign in'}
        </button>

        {import.meta.env.DEV ? (
          <div style={{ fontSize: 12, color: 'var(--color-text-2)', borderTop: '1px solid var(--color-divider)', paddingTop: 12 }}>
            Demo accounts (password from SEED_PASSWORD):
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
              {DEMO_ROLES.map(r => (
                <button key={r} type="button" className="btn btn-ghost" style={{ minHeight: 28, padding: '0 8px', fontSize: 12 }} onClick={() => setEmail(`${r}@nashonuma.test`)}>
                  {r}
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </form>
    </main>
  );
}
