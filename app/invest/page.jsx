import { redirect } from 'next/navigation';
import InvestHub from '@/components/InvestHub';
import { canAccess } from '@/lib/plans';
import { getSessionContext } from '@/lib/subscription';

export const metadata = { title: 'Investissement', robots: { index: false, follow: false } };

export default async function InvestPage() {
  const { user, planCode, subscription, trialExpired } = await getSessionContext();
  if (!user) redirect('/login?redirect=/invest');
  if (trialExpired) redirect('/pricing');
  if (!canAccess(planCode, 'invest')) redirect('/upgrade?feature=invest');

  return <InvestHub userEmail={user.email} planCode={planCode} subscription={subscription} />;
}
