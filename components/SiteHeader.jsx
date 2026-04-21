import { getSessionContext } from '@/lib/subscription';
import SiteHeaderClient from '@/components/SiteHeaderClient';

export default async function SiteHeader() {
  const { user, planCode, subscription } = await getSessionContext();
  return <SiteHeaderClient user={user} planCode={planCode} subscription={subscription} />;
}
