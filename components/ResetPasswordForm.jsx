"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { useLocale } from '@/lib/locale';

function getSupabase() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLocale();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const supabase = getSupabase();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') {
        setReady(true);
      }
    });

    const code = searchParams.get('code');
    if (code) {
      supabase.auth.exchangeCodeForSession(code).then(({ error: err }) => {
        if (err) setError('Lien invalide ou expiré.');
      });
    } else {
      const timer = setTimeout(() => {
        setError('Lien invalide ou expiré.');
      }, 2000);
      return () => {
        subscription.unsubscribe();
        clearTimeout(timer);
      };
    }

    return () => subscription.unsubscribe();
  }, [searchParams]);

  async function submit(e) {
    e.preventDefault();
    if (password !== confirm) {
      setError(t('auth.passwordMismatch'));
      return;
    }
    setLoading(true);
    setError('');

    const { error: updateError } = await getSupabase().auth.updateUser({ password });

    setLoading(false);
    if (updateError) {
      setError(updateError.message || t('auth.genericError'));
      return;
    }
    setMessage(t('auth.passwordUpdated'));
    setTimeout(() => router.push('/login'), 2000);
  }

  if (!ready) {
    return (
      <div className="auth-card">
        <div className="auth-head">
          <h1>Tracker-invest</h1>
          <p>{error || 'Vérification du lien…'}</p>
        </div>
      </div>
    );
  }

  return (
    <form className="auth-card" onSubmit={submit}>
      <div className="auth-head">
        <span className="badge">{t('auth.resetTitle')}</span>
        <h1>Tracker-invest</h1>
      </div>

      <label>
        {t('auth.newPassword')}
        <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" autoComplete="new-password" required minLength={8} />
      </label>

      <label>
        {t('auth.confirmPassword')}
        <input value={confirm} onChange={(e) => setConfirm(e.target.value)} type="password" autoComplete="new-password" required minLength={8} />
      </label>

      {error ? <p className="form-error">{error}</p> : null}
      {message ? <p className="form-message">{message}</p> : null}

      <button className="btn btn-gold" type="submit" disabled={loading}>
        {loading ? t('auth.loading') : t('auth.updatePassword')}
      </button>
    </form>
  );
}
