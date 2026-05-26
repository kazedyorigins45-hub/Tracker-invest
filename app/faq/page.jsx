import SiteHeader from '@/components/SiteHeader';
import FaqContent from '@/components/FaqContent';
import SiteFooter from '@/components/SiteFooter';

export const metadata = {
  title: 'FAQ',
  description: 'Comment suivre vos trades, actions, ETF et immobilier ? Abonnements sans engagement, paiement sécurisé Stripe. Toutes les réponses à vos questions sur Tracker-invest.',
  alternates: { canonical: 'https://tracker-invest.com/faq' },
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
