import SiteHeader from '@/components/SiteHeader';
import HomeContent from '@/components/HomeContent';

export const metadata = {
  title: 'Accueil',
  description: 'Mindset Invest — trading, investissement et mindset dans un même univers.',
};

export default function HomePage() {
  return (
    <main>
      <SiteHeader />
      <HomeContent />
    </main>
  );
}
