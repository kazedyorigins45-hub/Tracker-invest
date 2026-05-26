import SiteHeader from '@/components/SiteHeader';
import FeaturesContent from '@/components/FeaturesContent';
import SiteFooter from '@/components/SiteFooter';

export const metadata = {
  title: 'Fonctionnalités',
  description: 'Journal de trading Pro, suivi de portefeuille bourse et crypto, gestion de patrimoine immobilier et dashboard temps réel. Découvrez les 4 modules de Tracker-invest.',
  alternates: { canonical: 'https://tracker-invest.com/features' },
};

export default function FeaturesPage() {
  return (
    <main>
      <SiteHeader />
      <FeaturesContent />
      <SiteFooter />
    </main>
  );
}
