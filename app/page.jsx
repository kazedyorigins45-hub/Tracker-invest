import SiteHeader from '@/components/SiteHeader';
import HomeContent from '@/components/HomeContent';

export const metadata = {
  title: 'Accueil',
  description: 'Découvre Mindset Invest, une suite premium d’abonnements pour progresser en discipline et en investissement.',
};

export default function HomePage() {
  return (
    <main>
      <SiteHeader />
      <HomeContent />
    </main>
  );
}
