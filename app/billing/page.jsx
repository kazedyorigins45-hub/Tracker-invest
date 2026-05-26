import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { getSessionContext } from '@/lib/subscription';
import BillingHub from '@/components/BillingHub';

export const metadata = { title: 'Billing', robots: { index: false, follow: false } };

export default async function BillingPage() {
  const { user, subscription, planCode } = await getSessionContext();
  if (!user) redirect('/login?redirect=/billing');
  return (
    <Suspense fallback={<div className="mindset-shell" />}>
      <BillingHub userEmail={user.email || ''} planCode={planCode} subscription={subscription} />
    </Suspense>
  );
}
