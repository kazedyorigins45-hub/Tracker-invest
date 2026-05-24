"use client";

import Link from 'next/link';
import PricingGrid from '@/components/PricingGrid';
import { useLocale } from '@/lib/locale';

const FEATURE_TEXT = {
  tracker: 'Elite Tracker — carnet de trading',
  invest: 'Elite Invest — patrimoine long terme',
  portfolio: 'Mes investissements — synthèse globale',
  mindset: 'Tracker-invest — espace mental',
};

export default function UpgradeContent({ feature }) {
  const { t } = useLocale();
  const label = FEATURE_TEXT[feature] || 'fonctionnalité premium';

  return (
    <section className="section">
      <div className="container pricing-wrap">
        <div className="section-heading section-heading--center">
          <span className="eyebrow">Accès limité</span>
          <h1>{label} n’est pas inclus dans ton plan actuel</h1>
          <p>Tu peux garder ton plan actuel ou passer à une formule supérieure pour débloquer cette section.</p>
        </div>

        <div className="callout-row">
          <div className="callout-card"><strong>Pourquoi upgrader ?</strong><p>Pour activer les modules adaptés à ton niveau d’usage.</p></div>
          <div className="callout-card"><strong>Ce que tu gagnes</strong><p>Plus de fonctionnalités, plus de suivi, plus de clarté.</p></div>
          <div className="callout-card"><strong>Étape suivante</strong><p>Choisis un abonnement et débloque l’accès immédiatement.</p></div>
        </div>

        <PricingGrid />

        <div style={{ display: 'flex', justifyContent: 'center', margin: '2rem 0 0' }}>
          <Link className="btn btn-dark" href="/dashboard">Retour au dashboard</Link>
        </div>
      </div>
    </section>
  );
}
