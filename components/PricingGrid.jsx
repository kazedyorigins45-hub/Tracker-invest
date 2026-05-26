"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FEATURE_LABELS, PLANS } from '@/lib/plans';
import { useLocale } from '@/lib/locale';
import { useCurrency } from '@/lib/currency';
import { useFxRate } from '@/lib/fx';

const INITIAL_TERMS = { cgv: false, cgs: false, cgu: false };

export default function PricingGrid() {
  const router = useRouter();
  const [cycle, setCycle] = useState('monthly');
  const [loadingPlan, setLoadingPlan] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('');
  const [termsModal, setTermsModal] = useState(null);
  const [accepted, setAccepted] = useState(INITIAL_TERMS);
  const [checkoutError, setCheckoutError] = useState('');
  const { locale, t } = useLocale();
  const { currency } = useCurrency();
  const fxRate = useFxRate();

  const allAccepted = accepted.cgv && accepted.cgs && accepted.cgu;

  const formatPrice = (eur) => {
    if (eur === 0) return locale === 'en' ? 'Free' : 'Gratuit';
    if (currency === 'usd') {
      const usd = eur * fxRate;
      return `$${new Intl.NumberFormat('en-US', { minimumFractionDigits: Number.isInteger(usd) ? 0 : 2, maximumFractionDigits: 2 }).format(usd)}`;
    }
    return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2, minimumFractionDigits: Number.isInteger(eur) ? 0 : 2 }).format(eur);
  };

  function openTermsModal(planCode) {
    setAccepted(INITIAL_TERMS);
    setTermsModal(planCode);
  }

  function closeTermsModal() {
    setTermsModal(null);
    setAccepted(INITIAL_TERMS);
  }

  useEffect(() => {
    if (!termsModal) return;
    function onKeyDown(e) {
      if (e.key === 'Escape') closeTermsModal();
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [termsModal]);

  async function startCheckout(planCode) {
    closeTermsModal();
    setCheckoutError('');
    setLoadingPlan(planCode);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planCode, billingCycle: cycle, termsAccepted: true }),
      });
      const text = await res.text();
      const data = text ? JSON.parse(text) : {};

      if (res.status === 401 && data.loginUrl) {
        router.push(data.loginUrl);
        return;
      }

      if (!res.ok || !data.ok) {
        setCheckoutError(data.error || (locale === 'en' ? 'Unable to start payment.' : 'Impossible de lancer le paiement.'));
        return;
      }

      if (data.url) {
        setSelectedPlan(planCode);
        window.location.href = data.url;
      }
    } catch {
      setCheckoutError(locale === 'en' ? 'Network error. Please try again.' : 'Erreur réseau. Veuillez réessayer.');
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

      {checkoutError && (
        <p role="alert" style={{ textAlign: 'center', color: 'var(--error, #e53e3e)', margin: '0.5rem 0', fontSize: '0.9rem' }}>
          {checkoutError}
        </p>
      )}

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
                onClick={() => openTermsModal(plan.code)}
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

      {termsModal && (
        <div className="terms-overlay" role="dialog" aria-modal="true" aria-labelledby="terms-title" onClick={(e) => { if (e.target === e.currentTarget) closeTermsModal(); }}>
          <div className="terms-dialog">
            <h2 id="terms-title" className="terms-title">
              {locale === 'en' ? 'Accept terms before payment' : 'Acceptation des conditions avant paiement'}
            </h2>
            <p className="terms-subtitle">
              {locale === 'en'
                ? 'Please read and accept the following terms to continue.'
                : 'Veuillez lire et accepter les conditions suivantes pour continuer.'}
            </p>

            <div className="terms-checks">
              <label className="terms-check-row">
                <input
                  type="checkbox"
                  checked={accepted.cgv}
                  onChange={(e) => setAccepted((prev) => ({ ...prev, cgv: e.target.checked }))}
                />
                <span>
                  {locale === 'en' ? 'I accept the ' : "J'accepte les "}
                  <Link href="/terms#cgs" target="_blank" rel="noopener noreferrer" className="terms-link">
                    {locale === 'en' ? 'General Terms of Sale (CGV)' : 'Conditions Générales de Vente (CGV)'}
                  </Link>
                </span>
              </label>

              <label className="terms-check-row">
                <input
                  type="checkbox"
                  checked={accepted.cgs}
                  onChange={(e) => setAccepted((prev) => ({ ...prev, cgs: e.target.checked }))}
                />
                <span>
                  {locale === 'en' ? 'I accept the ' : "J'accepte les "}
                  <Link href="/terms#cgs" target="_blank" rel="noopener noreferrer" className="terms-link">
                    {locale === 'en' ? 'General Terms of Service (CGS)' : 'Conditions Générales de Service (CGS)'}
                  </Link>
                </span>
              </label>

              <label className="terms-check-row">
                <input
                  type="checkbox"
                  checked={accepted.cgu}
                  onChange={(e) => setAccepted((prev) => ({ ...prev, cgu: e.target.checked }))}
                />
                <span>
                  {locale === 'en' ? 'I accept the ' : "J'accepte les "}
                  <Link href="/terms#cgu" target="_blank" rel="noopener noreferrer" className="terms-link">
                    {locale === 'en' ? 'General Terms of Use (CGU)' : "Conditions Générales d'Utilisation (CGU)"}
                  </Link>
                </span>
              </label>
            </div>

            <div className="terms-actions">
              <button type="button" className="btn btn-ghost" onClick={closeTermsModal}>
                {locale === 'en' ? 'Cancel' : 'Annuler'}
              </button>
              <button
                type="button"
                className="btn btn-gold"
                disabled={!allAccepted}
                onClick={() => startCheckout(termsModal)}
              >
                {locale === 'en' ? 'Confirm & Pay' : 'Confirmer et payer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
