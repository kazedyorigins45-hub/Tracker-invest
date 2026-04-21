import { redirect } from 'next/navigation';
import { getSessionContext } from '@/lib/subscription';

export const metadata = { title: 'Dashboard', robots: { index: false, follow: false } };

export default async function DashboardPage() {
  const { user, subscription, planCode } = await getSessionContext();
  if (!user) redirect('/login?redirect=/dashboard');
  redirect('/mindset');
}
