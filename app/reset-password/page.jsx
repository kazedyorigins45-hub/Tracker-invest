import { Suspense } from 'react';
import ResetPasswordForm from '@/components/ResetPasswordForm';

export const metadata = {
  title: 'Nouveau mot de passe',
  robots: { index: false, follow: false },
};

export default function ResetPasswordPage() {
  return (
    <main className="auth-wrap">
      <Suspense fallback={<div className="auth-card"><div className="auth-head"><h1>Tracker-invest</h1></div></div>}>
        <ResetPasswordForm />
      </Suspense>
    </main>
  );
}
