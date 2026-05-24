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
      setError(data.error || 'Une erreur est survenue.');
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

  return (
    <form className="auth-card" onSubmit={submit}>
      <div className="auth-head">
        <span className="badge">{t('site.login')}</span>
        <h1>Tracker-invest</h1>
        <p>Connecte-toi pour accéder à ton espace. Chaque compte a ses propres données ; avec Supabase, elles peuvent être synchronisées entre tes appareils.</p>
        {selectedPlan ? (
          <p className="auth-selection">
            {t('site.login')}: {selectedPlan.name} — {selectedBilling === 'yearly' ? t('pricing.yearly') : t('pricing.monthly')}
          </p>
        ) : null}
      </div>

      <div className="auth-toggle">
        <button type="button" className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>{t('site.login')}</button>
        <button type="button" className={mode === 'register' ? 'active' : ''} onClick={() => setMode('register')}>Créer un compte</button>
      </div>

      <label>
        E-mail
        <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" autoComplete="email" required />
      </label>

      <label>
        Mot de passe
        <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} required minLength={8} />
      </label>

      {error ? <p className="form-error">{error}</p> : null}
      {message ? <p className="form-message">{message}</p> : null}

      <button className="btn btn-gold" type="submit" disabled={loading}>
        {loading ? 'Chargement…' : mode === 'login' ? 'Se connecter' : 'Créer mon compte'}
      </button>
    </form>
  );
}
