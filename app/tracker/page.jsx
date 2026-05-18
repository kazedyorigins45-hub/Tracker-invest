import { redirect } from 'next/navigation';
import TrackerHub from '@/components/TrackerHub';
import { canAccess } from '@/lib/plans';
import { getSessionContext } from '@/lib/subscription';

export const metadata = { title: 'Trading', robots: { index: false, follow: false } };

export default async function TrackerPage() {
  const { user, planCode, subscription, trialExpired } = await getSessionContext();
  if (!user) redirect('/login?redirect=/tracker');
  if (trialExpired) redirect('/pricing');
  if (!canAccess(planCode, 'tracker')) redirect('/upgrade?feature=tracker');

  return <TrackerHub userEmail={user.email} planCode={planCode} subscription={subscription} />;
}
