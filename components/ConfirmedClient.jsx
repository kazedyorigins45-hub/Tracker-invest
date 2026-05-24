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

    async function confirm() {
      const supabase = getSupabase();
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          const { data: { session } } = await supabase.auth.getSession();
          if (!session) {
            setStatus('error');
            return;
          }
        }
      }
      setStatus('success');
      setTimeout(() => router.push('/dashboard'), 3000);
    }

    confirm();
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
