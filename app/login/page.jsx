import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import AuthForm from '@/components/AuthForm';
import { getSessionContext } from '@/lib/subscription';

export const metadata = {
  title: 'Connexion',
  robots: { index: false, follow: false },
};

export default async function LoginPage() {
  const { user } = await getSessionContext();
  if (user) redirect('/dashboard');

  return (
    <main id="main-content" className="auth-wrap">
      <Suspense fallback={<div className="auth-card"><div className="auth-head"><h1>Tracker-invest</h1></div></div>}>
        <AuthForm />
      </Suspense>
    </main>
  );
}
