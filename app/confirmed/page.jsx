import { Suspense } from 'react';
import ConfirmedClient from '@/components/ConfirmedClient';

export const metadata = {
  title: 'Compte confirmé',
  robots: { index: false, follow: false },
};

export default function ConfirmedPage() {
  return (
    <main className="auth-wrap">
      <Suspense fallback={<div className="auth-card"><div className="auth-head"><h1>Tracker-invest</h1></div></div>}>
        <ConfirmedClient />
      </Suspense>
    </main>
  );
}
