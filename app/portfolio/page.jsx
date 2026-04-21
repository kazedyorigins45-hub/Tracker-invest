import { redirect } from 'next/navigation';
import PortfolioHub from '@/components/PortfolioHub';
import { getSessionContext } from '@/lib/subscription';

export const metadata = { title: 'Portfolio', robots: { index: false, follow: false } };

export default async function PortfolioPage() {
  const { user, planCode, subscription } = await getSessionContext();
  if (!user) redirect('/login?redirect=/portfolio');

  return <PortfolioHub userEmail={user.email} planCode={planCode} subscription={subscription} />;
}
