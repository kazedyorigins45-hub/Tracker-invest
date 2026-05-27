import PricingGrid from '@/components/PricingGrid';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import { PLANS } from '@/lib/plans';

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
  offers: PLANS.map((plan) => ({
    '@type': 'Offer',
    name: plan.name,
    price: String(plan.prices.monthly),
    priceCurrency: 'EUR',
    description: plan.description,
    ...(plan.prices.monthly > 0 ? {
      priceSpecification: {
        '@type': 'UnitPriceSpecification',
        price: String(plan.prices.monthly),
        priceCurrency: 'EUR',
        unitText: 'MONTH',
      },
    } : {}),
  })),
};

export default function PricingPage() {
  return (
    <main id="main-content">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(pricingJsonLd) }} />
      <SiteHeader />

      <div className="home-wrap pricing-wrap">
        <h1 className="home-title">ABONNEMENTS</h1>
        <p className="tagline">Mensuel ou annuel, avec renouvellement automatique sur le cycle choisi et possibilité d’annuler à tout moment.</p>
        <PricingGrid />
      </div>
      <SiteFooter />
    </main>
  );
}
