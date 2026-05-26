import PricingGrid from '@/components/PricingGrid';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';

export const metadata = {
  title: 'Abonnements',
  description: 'Starter gratuit, Trading à partir de 12,50 €/mois, accès complet à 20 €/mois. Résiliable à tout moment. Comparez les formules Tracker-invest pour le journal de trading et le suivi de patrimoine.',
  alternates: { canonical: 'https://tracker-invest.com/pricing' },
};

const pricingJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Tracker-invest',
  applicationCategory: 'FinanceApplication',
  operatingSystem: 'Web',
  url: 'https://tracker-invest.com',
  description: 'Journal de trading et suivi de patrimoine — bourse, crypto, immobilier, mindset.',
  offers: [
    { '@type': 'Offer', name: 'Starter', price: '0', priceCurrency: 'EUR', description: 'Accès gratuit aux fonctionnalités de base' },
    { '@type': 'Offer', name: 'Trader', price: '12.50', priceCurrency: 'EUR', priceSpecification: { '@type': 'UnitPriceSpecification', price: '12.50', priceCurrency: 'EUR', unitText: 'MONTH' } },
    { '@type': 'Offer', name: 'Investor', price: '20', priceCurrency: 'EUR', priceSpecification: { '@type': 'UnitPriceSpecification', price: '20', priceCurrency: 'EUR', unitText: 'MONTH' } },
  ],
};

export default function PricingPage() {
  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(pricingJsonLd) }} />
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
