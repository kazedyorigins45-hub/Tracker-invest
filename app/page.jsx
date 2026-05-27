import SiteHeader from '@/components/SiteHeader';
import HomeContent from '@/components/HomeContent';
import SiteFooter from '@/components/SiteFooter';

export const metadata = {
  title: 'Journal de trading & suivi d\'investissement',
  description: 'Centralisez vos trades, actions, ETF et immobilier dans un seul tableau de bord. Suivi de patrimoine en temps réel. Gratuit pour démarrer.',
  alternates: { canonical: 'https://tracker-invest.com' },
};

export default function HomePage() {
  return (
    <main id="main-content">
      <SiteHeader />
      <HomeContent />
      <SiteFooter />
    </main>
  );
}
