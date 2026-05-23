import SiteHeader from '@/components/SiteHeader';
import FeaturesContent from '@/components/FeaturesContent';
import SiteFooter from '@/components/SiteFooter';

export const metadata = {
  title: 'Fonctionnalités',
  description: 'Découvre les modules Mindset, trading, investissement et portfolio.',
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
