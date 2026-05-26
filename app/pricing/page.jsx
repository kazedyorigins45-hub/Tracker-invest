import PricingGrid from '@/components/PricingGrid';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';

export const metadata = {
  title: 'Abonnements',
  description: 'Starter gratuit, Trading à partir de 12,50 €/mois, accès complet à 20 €/mois. Résiliable à tout moment. Comparez les formules Tracker-invest pour le journal de trading et le suivi de patrimoine.',
  alternates: { canonical: 'https://tracker-invest.com/pricing' },
};

export default function PricingPage() {
  return (
    <main>
      <SiteHeader />

      <div className="home-wrap pricing-wrap">
        <h1 className="home-title">ABONNEMENTS</h1>
        <p className="tagline">Mensuel ou annuel, avec renouvellement automatique sur le cycle choisi et possibilité d’annuler à tout moment.</p>
        <PricingGrid />
        <footer className="note">Le choix mensuel/annuel est déjà prêt. Le bouton d’abonnement ouvre maintenant Stripe Checkout.</footer>
      </div>
      <SiteFooter />
    </main>
  );
}
