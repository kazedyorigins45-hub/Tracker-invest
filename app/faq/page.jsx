import SiteHeader from '@/components/SiteHeader';
import FaqContent from '@/components/FaqContent';
import SiteFooter from '@/components/SiteFooter';

export const metadata = {
  title: 'FAQ',
  description: 'Comment suivre vos trades, actions, ETF et immobilier ? Abonnements sans engagement, paiement sécurisé Stripe. Toutes les réponses à vos questions sur Tracker-invest.',
  alternates: { canonical: 'https://tracker-invest.com/faq' },
};

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: "Qu'est-ce que Tracker-invest ?",
      acceptedAnswer: { '@type': 'Answer', text: "Tracker-invest est votre tour de contrôle financière. C'est une plateforme conçue pour centraliser, analyser et piloter l'ensemble de votre patrimoine : du trading actif à court terme jusqu'à vos investissements immobiliers à long terme." },
    },
    {
      '@type': 'Question',
      name: 'À qui s\'adresse cette plateforme ?',
      acceptedAnswer: { '@type': 'Answer', text: 'À tous les investisseurs qui veulent passer du bricolage sur Excel à une gestion professionnelle. Que vous soyez trader débutant ou investisseur chevronné, Tracker-invest vous apporte la clarté nécessaire pour prendre de meilleures décisions.' },
    },
    {
      '@type': 'Question',
      name: 'Le site donne-t-il des conseils financiers ?',
      acceptedAnswer: { '@type': 'Answer', text: "Non. Tracker-invest est un outil de suivi et d'analyse. Nous ne donnons pas de signaux ou d'incitations à l'achat. Vous restez le seul maître de vos décisions et de votre capital." },
    },
    {
      '@type': 'Question',
      name: 'Comment fonctionne le suivi immobilier ?',
      acceptedAnswer: { '@type': 'Answer', text: 'Vous pouvez ajouter vos biens, estimer votre valeur patrimoniale et suivre l\'évolution de vos actifs immobiliers à côté de vos liquidités. Cela vous permet de visualiser votre "Net Worth" en temps réel.' },
    },
    {
      '@type': 'Question',
      name: 'Quels sont les moyens de paiement acceptés ?',
      acceptedAnswer: { '@type': 'Answer', text: 'Grâce à notre partenaire Stripe, nous acceptons les paiements internationaux par Carte Bancaire (Visa, Mastercard, Amex), ainsi qu\'Apple Pay et Google Pay pour une sécurité maximale.' },
    },
    {
      '@type': 'Question',
      name: "L'abonnement est-il sans engagement ?",
      acceptedAnswer: { '@type': 'Answer', text: "Oui. Vous êtes libre de stopper votre abonnement à tout moment depuis votre espace client. L'accès aux outils reste valide jusqu'à la fin de la période payée." },
    },
    {
      '@type': 'Question',
      name: 'Mes données financières sont-elles en sécurité ?',
      acceptedAnswer: { '@type': 'Answer', text: "C'est notre priorité absolue. Nous utilisons l'infrastructure Supabase, une technologie de pointe pour le stockage et le cryptage des données. Tracker-invest ne détient jamais vos fonds, nous ne faisons que lister les données que vous choisissez de suivre." },
    },
  ],
};

export default function FaqPage() {
  return (
    <main id="main-content">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <SiteHeader />
      <FaqContent />
      <SiteFooter />
    </main>
  );
}
