"use client";

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FEATURE_LABELS, PLANS } from '@/lib/plans';
import { useLocale } from '@/lib/locale';
import { useCurrency } from '@/lib/currency';
import { useFxRate } from '@/lib/fx';

export default function PricingGrid() {
  const router = useRouter();
  const [cycle, setCycle] = useState('monthly');
  const [loadingPlan, setLoadingPlan] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('');
  const { locale, t } = useLocale();
  const { currency } = useCurrency();
  const fxRate = useFxRate();

  const formatPrice = (eur) => {
    if (eur === 0) return locale === 'en' ? 'Free' : 'Gratuit';
    if (currency === 'usd') {
      const usd = eur * fxRate;
      return `$${new Intl.NumberFormat('en-US', { minimumFractionDigits: Number.isInteger(usd) ? 0 : 2, maximumFractionDigits: 2 }).format(usd)}`;
    }
    return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2, minimumFractionDigits: Number.isInteger(eur) ? 0 : 2 }).format(eur);
  };

  async function startCheckout(planCode) {
    setLoadingPlan(planCode);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planCode, billingCycle: cycle }),
      });
      const text = await res.text();
      const data = text ? JSON.parse(text) : {};

      if (res.status === 401 && data.loginUrl) {
        router.push(data.loginUrl);
        return;
      }

      if (!res.ok || !data.ok) {
        alert(data.error || 'Impossible de lancer le paiement.');
        return;
      }

      if (data.url) {
        setSelectedPlan(planCode);
        window.location.href = data.url;
      }
    } catch {
      alert('Erreur réseau lors du lancement du paiement.');
    } finally {
      setLoadingPlan('');
    }
  }

  return (
    <div>
      <div className="pricing-switcher">
        <button type="button" className={cycle === 'monthly' ? 'active' : ''} onClick={() => setCycle('monthly')}>
          {t('pricing.monthly')}
        </button>
        <button type="button" className={cycle === 'yearly' ? 'active' : ''} onClick={() => setCycle('yearly')}>
          {t('pricing.yearly')}
        </button>
      </div>

      <p style={{ textAlign: 'center', fontSize: '0.78rem', color: 'var(--muted)', margin: '0.5rem 0 1rem' }}>
        {t('pricing.vatNotice')}
      </p>

      <div className="subs">
        {PLANS.map((plan) => (
          <article key={plan.code} className={`sub-card ${plan.highlight || selectedPlan === plan.code ? 'is-selected' : ''}`}>
            <span className="badge">{plan.highlight ? t('pricing.recommended') : t('pricing.plan')}</span>
            <strong>{locale === 'en' ? plan.nameEn || plan.name : plan.name}</strong>
            <span className="plan-price">{formatPrice(plan.prices[cycle])}{plan.prices[cycle] > 0 && currency !== 'usd' ? '€' : ''} {plan.prices[cycle] > 0 ? <small>/{cycle === 'monthly' ? t('pricing.monthly').toLowerCase() : t('pricing.yearly').toLowerCase()}</small> : null}</span>
            <span className="pricing-cycle">{cycle === 'monthly' ? t('pricing.monthly') : t('pricing.yearly')} — {t('pricing.autoRenew')}</span>
            <span className="desc">{locale === 'en' ? plan.descriptionEn || plan.description : plan.description}</span>
            <div className="billing-note">{plan.billing[cycle].note}</div>
            <ul className="pricing-features">
              {Object.entries(plan.features).map(([feature, enabled]) => (
                <li key={feature} className={enabled ? 'is-on' : 'is-off'}>
                  {enabled ? '✓' : '—'} {FEATURE_LABELS[feature] || feature}
                </li>
              ))}
            </ul>

            <div className="pricing-actions">
              <button
                type="button"
                className="btn btn-gold"
                onClick={() => startCheckout(plan.code)}
                disabled={loadingPlan === plan.code}
              >
                {loadingPlan === plan.code ? 'Ouverture…' : cycle === 'monthly' ? t('pricing.chooseMonthly') : t('pricing.chooseYearly')}
              </button>
              <Link href={`/login?plan=${plan.code}&billing=${cycle}`} className="btn btn-dark">
                {t('pricing.login')}
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
