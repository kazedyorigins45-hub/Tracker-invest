import SiteHeader from '@/components/SiteHeader';
import FaqContent from '@/components/FaqContent';
import SiteFooter from '@/components/SiteFooter';

export const metadata = {
  title: 'FAQ',
  description: 'Questions fréquentes sur Tracker-invest.',
};

export default function FaqPage() {
  return (
    <main>
      <SiteHeader />
      <FaqContent />
      <SiteFooter />
    </main>
  );
}
