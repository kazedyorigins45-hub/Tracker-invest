import { getSessionContext } from '@/lib/subscription';
import SiteHeaderClient from '@/components/SiteHeaderClient';

export default async function SiteHeader() {
  let user = null, planCode = 'starter', subscription = null;
  try {
    const ctx = await getSessionContext();
    user = ctx.user;
    planCode = ctx.planCode;
    subscription = ctx.subscription;
  } catch {}
  return <SiteHeaderClient user={user} planCode={planCode} subscription={subscription} />;
}
