"use client";

import Link from 'next/link';
import { useLocale } from '@/lib/locale';
import SiteFooter from '@/components/SiteFooter';
import { AccordionGroup } from '@/components/Accordion';

const FAQ_SECTIONS = [
  {
    category: "LE CONCEPT",
    emoji: "💡",
    items: [
      {
        question: "Qu'est-ce que Tracker-invest ?",
        answer: "Tracker-invest est votre tour de contrôle financière. C'est une plateforme conçue pour centraliser, analyser et piloter l'ensemble de votre patrimoine : du trading actif à court terme jusqu'à vos investissements immobiliers à long terme.",
      },
      {
        question: "À qui s'adresse cette plateforme ?",
        answer: "À tous les investisseurs qui veulent passer du \"bricolage\" sur Excel à une gestion professionnelle. Que vous soyez trader débutant ou investisseur chevronné, Tracker-invest vous apporte la clarté nécessaire pour prendre de meilleures décisions.",
      },
    ],
  },
  {
    category: "TRADING & INVESTISSEMENT",
    emoji: "📊",
    items: [
      {
        question: "Quels types d'actifs puis-je suivre ?",
        answer: (
          <span>
            Vous pouvez centraliser trois piliers majeurs :<br /><br />
            <strong>Trading :</strong> Suivi de vos performances quotidiennes (Forex, Indices, Crypto).<br />
            <strong>Bourse :</strong> Pilotage de votre portefeuille d'actions et d'ETF.<br />
            <strong>Immobilier :</strong> Gestion de votre patrimoine immobilier (physique, SCPI, crowdfunding).
          </span>
        ),
      },
      {
        question: "Le site donne-t-il des conseils financiers ?",
        answer: "Non. Tracker-invest est un outil de suivi et d'analyse. Nous ne donnons pas de signaux ou d'incitations à l'achat. Vous restez le seul maître de vos décisions et de votre capital.",
      },
      {
        question: "Le calcul des lots est-il disponible ?",
        answer: "Pour le moment, nous nous concentrons sur la puissance du journal de bord et du tracking de performance. Des outils de calcul assistés sont prévus dans nos prochaines mises à jour.",
      },
    ],
  },
  {
    category: "MODULE IMMOBILIER",
    emoji: "🏠",
    items: [
      {
        question: "Comment fonctionne le suivi immobilier ?",
        answer: "Vous pouvez ajouter vos biens, estimer votre valeur patrimoniale et suivre l'évolution de vos actifs immobiliers à côté de vos liquidités. Cela vous permet de visualiser votre \"Net Worth\" (Fortune totale) en temps réel.",
      },
    ],
  },
  {
    category: "PAIEMENT & ABONNEMENT",
    emoji: "💳",
    items: [
      {
        question: "Quels sont les moyens de paiement acceptés ?",
        answer: "Grâce à notre partenaire Stripe, nous acceptons les paiements internationaux par Carte Bancaire (Visa, Mastercard, Amex), ainsi qu'Apple Pay et Google Pay pour une sécurité maximale.",
      },
      {
        question: "L'abonnement est-il sans engagement ?",
        answer: "Oui. Vous êtes libre de stopper votre abonnement à tout moment depuis votre espace client. L'accès aux outils reste valide jusqu'à la fin de la période payée.",
      },
    ],
  },
  {
    category: "SÉCURITÉ & CONFIDENTIALITÉ",
    emoji: "🔐",
    items: [
      {
        question: "Mes données financières sont-elles en sécurité ?",
        answer: "C'est notre priorité absolue. Nous utilisons l'infrastructure Supabase, une technologie de pointe pour le stockage et le cryptage des données. Tracker-invest ne détient jamais vos fonds (nous ne sommes pas un broker), nous ne faisons que lister les données que vous choisissez de suivre.",
      },
      {
        question: "Mes informations sont-elles partagées ?",
        answer: (
          <span>
            Jamais. Vos données de trading et d&apos;investissement sont strictement privées. Elles ne sont ni vendues, ni partagées avec des tiers.<br /><br />
            Une question ? Notre support est disponible pour vous accompagner dans la gestion de votre empire financier.{' '}
            <a href="mailto:jonathangieraerts@hotmail.com" className="faq-email-link">
              jonathangieraerts@hotmail.com
            </a>
          </span>
        ),
      },
    ],
  },
];

export default function FaqPage() {
  const { t } = useLocale();

  return (
    <main>
      <div className="user-strip">
        <span className="brand">Tracker-invest</span>
        <nav className="footer-links" aria-label="Navigation rapide">
          <Link href="/">{t('site.home')}</Link>
          <Link href="/pricing">{t('site.subscriptions')}</Link>
          <Link href="/login">{t('site.login')}</Link>
        </nav>
      </div>

      <div className="faq-wrap">
        <div className="faq-header">
          <h1 className="faq-title">Questions fréquentes</h1>
          <p className="faq-subtitle">Tout ce que vous devez savoir sur Tracker-invest</p>
        </div>

        <div className="faq-sections">
          {FAQ_SECTIONS.map((section) => (
            <section key={section.category} className="faq-section">
              <h2 className="faq-category">
                <span className="faq-category-emoji">{section.emoji}</span>
                {section.category}
              </h2>
              <AccordionGroup items={section.items} />
            </section>
          ))}
        </div>
      </div>

      <SiteFooter />
    </main>
  );
}
