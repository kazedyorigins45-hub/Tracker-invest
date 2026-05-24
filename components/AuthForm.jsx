"use client";

import { useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getPlan } from '@/lib/plans';
import { useLocale } from '@/lib/locale';

export default function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = useMemo(() => searchParams.get('redirect') || '/dashboard', [searchParams]);
  const selectedPlanCode = searchParams.get('plan');
  const selectedBilling = searchParams.get('billing') || 'monthly';
  const selectedPlan = selectedPlanCode ? getPlan(selectedPlanCode) : null;

  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const { t } = useLocale();

  async function readJson(response) {
    const text = await response.text();
    if (!text) return {};
    try {
      return JSON.parse(text);
    } catch {
      return {};
    }
  }

  async function submitReset(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    const res = await fetch('/api/auth/reset-request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await readJson(res);

    setLoading(false);
    if (!res.ok || !data.ok) {
      setError(data.error || t('auth.genericError'));
      return;
    }
    setMessage(t('auth.resetSent'));
  }

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await readJson(res);

    if (!res.ok || !data.ok) {
      setError(data.error || t('auth.genericError'));
      setLoading(false);
      return;
    }

    if (data.message) setMessage(data.message);
    setLoading(false);

    if (mode === 'register' && data.needsConfirmation) {
      setMode('login');
      return;
    }

    router.push(data.redirectTo || redirectTo);
    router.refresh();
  }

  if (mode === 'forgot') {
    return (
      <form className="auth-card" onSubmit={submitReset}>
        <div className="auth-head">
          <span className="badge">{t('auth.resetTitle')}</span>
          <h1>Tracker-invest</h1>
          <p>{t('auth.resetDesc')}</p>
        </div>

        <label>
          {t('auth.email')}
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" autoComplete="email" required />
        </label>

        {error ? <p className="form-error">{error}</p> : null}
        {message ? <p className="form-message">{message}</p> : null}

        <button className="btn btn-gold" type="submit" disabled={loading}>
          {loading ? t('auth.loading') : t('auth.sendLink')}
        </button>

        <button type="button" className="auth-link" onClick={() => { setMode('login'); setError(''); setMessage(''); }}>
          {t('auth.backToLogin')}
        </button>
      </form>
    );
  }

  return (
    <form className="auth-card" onSubmit={submit}>
      <div className="auth-head">
        <span className="badge">{t('site.login')}</span>
        <h1>Tracker-invest</h1>
        <p>{t('auth.tagline')}</p>
        {selectedPlan ? (
          <p className="auth-selection">
            {t('site.login')}: {selectedPlan.name} — {selectedBilling === 'yearly' ? t('pricing.yearly') : t('pricing.monthly')}
          </p>
        ) : null}
      </div>

      <div className="auth-toggle">
        <button type="button" className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>{t('site.login')}</button>
        <button type="button" className={mode === 'register' ? 'active' : ''} onClick={() => setMode('register')}>{t('auth.createAccount')}</button>
      </div>

      <label>
        {t('auth.email')}
        <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" autoComplete="email" required />
      </label>

      <label>
        {t('auth.password')}
        <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} required minLength={8} />
      </label>

      {mode === 'login' ? (
        <button type="button" className="auth-link auth-link--right" onClick={() => { setMode('forgot'); setError(''); setMessage(''); }}>
          {t('auth.forgotPassword')}
        </button>
      ) : null}

      {error ? <p className="form-error">{error}</p> : null}
      {message ? <p className="form-message">{message}</p> : null}

      <button className="btn btn-gold" type="submit" disabled={loading}>
        {loading ? t('auth.loading') : mode === 'login' ? t('auth.signIn') : t('auth.signUp')}
      </button>
    </form>
  );
}
