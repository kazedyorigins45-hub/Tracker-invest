import SiteHeader from '@/components/SiteHeader';
import FeaturesContent from '@/components/FeaturesContent';

export const metadata = {
  title: 'Fonctionnalités',
  description: 'Découvre les modules Mindset, trading, investissement et portfolio.',
};

export default function FeaturesPage() {
  return (
    <main>
      <SiteHeader />
      <FeaturesContent />
    </main>
  );
}
