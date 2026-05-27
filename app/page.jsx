import SiteHeader from '@/components/SiteHeader';
import HomeContent from '@/components/HomeContent';
import SiteFooter from '@/components/SiteFooter';
import { getSessionContext } from '@/lib/subscription';

export const metadata = {
  title: 'Journal de trading & suivi d\'investissement',
  description: 'Centralisez vos trades, actions, ETF et immobilier dans un seul tableau de bord. Suivi de patrimoine en temps réel. Gratuit pour démarrer.',
  alternates: { canonical: 'https://tracker-invest.com' },
};

export default async function HomePage() {
  let planCode = 'starter', subscription = null, userEmail = '';
  try {
    const ctx = await getSessionContext();
    if (ctx.user) {
      planCode = ctx.planCode;
      subscription = ctx.subscription;
      userEmail = ctx.user.email;
    }
  } catch {}

  return (
    <main id="main-content">
      <SiteHeader />
      <HomeContent planCode={planCode} subscription={subscription} userEmail={userEmail} />
      <SiteFooter />
    </main>
  );
}
