import { redirect } from 'next/navigation';
import MindsetHub from '@/components/MindsetHub';
import { getSessionContext } from '@/lib/subscription';

export const metadata = { title: 'Mindset', robots: { index: false, follow: false } };

export default async function MindsetPage() {
  const { user, planCode, subscription } = await getSessionContext();
  if (!user) redirect('/login?redirect=/mindset');

  return <MindsetHub userEmail={user.email} planCode={planCode} subscription={subscription} />;
}
