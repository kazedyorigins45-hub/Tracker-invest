import PricingGrid from '@/components/PricingGrid';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';

export const metadata = {
  title: 'Abonnements',
  description: 'Compare les abonnements Mindset Invest et choisis le niveau adapté à ton usage.',
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
