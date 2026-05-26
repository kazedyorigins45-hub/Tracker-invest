"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';

function getSupabase() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export default function ConfirmedClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    const code = searchParams.get('code');
    const tokenHash = searchParams.get('token_hash');
    const type = searchParams.get('type') || 'email';
    const errorParam = searchParams.get('error');

    async function confirm() {
      if (errorParam) {
        setStatus('error');
        return;
      }

      const supabase = getSupabase();

      if (tokenHash) {
        const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
        if (error) {
          setStatus('error');
          return;
        }
      } else if (code) {
        // Supabase already verified the email before redirecting here with the code.
        // Try to establish a session, but show success either way.
        await supabase.auth.exchangeCodeForSession(code);
      }

      setStatus('success');
      return 'redirect';
    }

    let timer;
    confirm().then((result) => {
      if (result === 'redirect') {
        timer = setTimeout(() => router.push('/dashboard'), 3000);
      }
    });
    return () => clearTimeout(timer);
  }, [searchParams, router]);

  if (status === 'loading') {
    return (
      <div className="auth-card">
        <div className="auth-head">
          <h1>Tracker-invest</h1>
          <p>Vérification en cours…</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="auth-card">
        <div className="auth-head">
          <span className="badge">Erreur</span>
          <h1>Tracker-invest</h1>
          <p>Lien invalide ou déjà utilisé.</p>
        </div>
        <a href="/login" className="btn btn-gold" style={{ textAlign: 'center' }}>Se connecter</a>
      </div>
    );
  }

  return (
    <div className="auth-card">
      <div className="auth-head">
        <span className="badge">✓ Compte activé</span>
        <h1>Tracker-invest</h1>
        <p>Ton adresse e-mail a bien été confirmée. Tu vas être redirigé vers ton espace…</p>
      </div>
      <a href="/dashboard" className="btn btn-gold" style={{ textAlign: 'center' }}>Accéder au dashboard</a>
    </div>
  );
}
