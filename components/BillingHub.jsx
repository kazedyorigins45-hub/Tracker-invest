"use client";

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import LogoMark from '@/components/LogoMark';
import ThemeToggle from '@/components/ThemeToggle';
import CurrencyToggle from '@/components/CurrencyToggle';
import { PLANS, getPlan } from '@/lib/plans';
import { useLocale } from '@/lib/locale';

function formatMoney(value, locale = 'fr-FR') {
  return new Intl.NumberFormat(locale, { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value || 0);
}

function formatDate(value, locale = 'fr-FR') {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(date);
}

export default function BillingHub({ userEmail = '', planCode = 'starter', subscription = null }) {
  const { t, locale } = useLocale();
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(planCode);
  const [selectedCycle, setSelectedCycle] = useState(subscription?.billing_cycle || 'monthly');

  const currentPlan = useMemo(() => getPlan(overview?.subscription?.plan_code || planCode), [overview, planCode]);
  const currentSubscription = overview?.subscription || subscription;

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch('/api/billing/overview', { credentials: 'same-origin' });
        const data = await res.json();
        if (!cancelled && data.ok) {
          setOverview(data);
          setSelectedPlan(data.subscription?.plan_code || planCode);
          setSelectedCycle(data.subscription?.billing_cycle || 'monthly');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [planCode]);

  const runAction = async (url, body) => {
    setBusy(true);
    setMessage('');
    try {
      const res = await fetch(url, {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body || {}),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || 'Erreur');
      setMessage(t('billing.saved'));
      const refreshed = await fetch('/api/billing/overview', { credentials: 'same-origin' }).then((r) => r.json());
      if (refreshed.ok) setOverview(refreshed);
      return data;
    } catch {
      setMessage(t('billing.error'));
      return null;
    } finally {
      setBusy(false);
      setTimeout(() => setMessage(''), 1800);
    }
  };

  const handleChangePlan = async () => {
    const data = await runAction('/api/billing/change-plan', { planCode: selectedPlan, billingCycle: selectedCycle });
    if (data?.url) window.location.assign(data.url);
  };

  const sub = currentSubscription || {};
  const invoices = overview?.invoices || [];
  const paymentMethods = overview?.paymentMethods || [];
  const isPaymentFailed = sub.status === 'past_due' || sub.status === 'unpaid';
  const dateLocale = locale === 'en' ? 'en-US' : 'fr-FR';

  return (
    <div className="mindset-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <div className="brand-top">
            <div className="tag">Mindset</div>
            <Link href="/" className="brand-link"><h1>Mes investissements</h1></Link>
            <p>{t('billing.subtitle')}</p>
          </div>
          <nav className="sidebar-apps" aria-label="Navigation site">
            <div className="sidebar-apps-label">{t('mindset.spaces')}</div>
            <Link href="/mindset" className="app-link">{t('app.mindset')}</Link>
            <Link href="/portfolio" className="app-link">{t('app.portfolio')}</Link>
            <Link href="/billing" className="app-link is-current">{t('dashboard.manage')}</Link>
          </nav>
        </div>

        <div className="sidebar-bottom">
          <p className="app-plan">{userEmail}</p>
          <span>{t('app.subscription')}: {currentPlan?.name || planCode}</span>
          <form action="/api/auth/logout" method="post">
            <button type="submit" className="sidebar-logout">{t('site.logout')}</button>
          </form>
        </div>
      </aside>

      <main className="main">
        <div className="mindset-topbar">
          <LogoMark />
          <ThemeToggle className="theme-toggle--app" />
          <CurrencyToggle className="theme-toggle--app" />
        </div>

        <h1 className="page-title">{t('billing.title')}</h1>
        <p className="page-sub">{t('billing.subtitle')}</p>

        {isPaymentFailed && (
          <div className="billing-alert" role="alert">
            <strong>Paiement échoué.</strong> Ton abonnement est suspendu.{' '}
            <a href="/api/stripe/portal" className="billing-alert-link">
              Mettre à jour ma carte →
            </a>
          </div>
        )}

        <div className="portfolio-stack">
          <div className="card portfolio-card portfolio-card--large">
            <h2>{t('billing.summary')}</h2>
            <div className="mini-grid">
              <div className="stat"><span className="muted">{t('billing.currentPlan')}</span><strong>{currentPlan?.name || planCode}</strong></div>
              <div className="stat"><span className="muted">{t('billing.status')}</span><strong>{sub.status || '—'}</strong></div>
              <div className="stat"><span className="muted">{t('billing.cycle')}</span><strong>{sub.billing_cycle === 'yearly' ? 'Annuel' : 'Mensuel'}</strong></div>
              <div className="stat"><span className="muted">{t('billing.nextPayment')}</span><strong>{formatDate(sub.current_period_end, dateLocale)}</strong></div>
            </div>
            {sub.cancel_at_period_end ? (
              <p className="hint" style={{ marginTop: '0.75rem' }}>{t('billing.cancelAtEnd')}</p>
            ) : null}
          </div>

          <div className="card portfolio-card">
            <h2>{t('billing.changePlan')}</h2>
            <div className="grid-2 portfolio-grid-spaced">
              <div className="field-block">
                <label>Plan</label>
                <select className="input-dark" value={selectedPlan} onChange={(e) => setSelectedPlan(e.target.value)}>
                  {PLANS.map((plan) => <option key={plan.code} value={plan.code}>{plan.name}</option>)}
                </select>
              </div>
              <div className="field-block">
                <label>Cycle</label>
                <select className="input-dark" value={selectedCycle} onChange={(e) => setSelectedCycle(e.target.value)}>
                  <option value="monthly">Mensuel</option>
                  <option value="yearly">Annuel</option>
                </select>
              </div>
            </div>
            <div className="toolbar">
              <button className="btn" type="button" disabled={busy} onClick={handleChangePlan}>{t('billing.openCheckout')}</button>
              <button className="btn btn-ghost" type="button" disabled={busy || sub.cancel_at_period_end} onClick={() => runAction('/api/billing/cancel')}>
                {t('billing.cancel')}
              </button>
              <button className="btn btn-ghost" type="button" disabled={busy || !sub.cancel_at_period_end} onClick={() => runAction('/api/billing/resume')}>
                {t('billing.resume')}
              </button>
              {sub.stripe_customer_id ? (
                <a href="/api/stripe/portal" className="btn btn-ghost">{t('billing.portal') || 'Portail Stripe'}</a>
              ) : null}
            </div>
            {message ? <p className="form-message">{message}</p> : null}
          </div>

          <div className="portfolio-grid-2">
            <div className="card portfolio-card">
              <h2>{t('billing.paymentMethods')}</h2>
              {paymentMethods.length ? (
                <ul className="stack-list">
                  {paymentMethods.map((pm) => (
                    <li key={pm.id}>{pm.brand?.toUpperCase?.() || 'CARD'} •••• {pm.last4} {pm.exp_month}/{pm.exp_year}</li>
                  ))}
                </ul>
              ) : <p className="hint">{t('billing.noPaymentMethods')}</p>}
            </div>

            <div className="card portfolio-card">
              <h2>{t('billing.invoices')}</h2>
              {invoices.length ? (
                <ul className="stack-list">
                  {invoices.map((invoice) => (
                    <li key={invoice.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <strong>{formatMoney(invoice.total || invoice.amount_paid || 0, dateLocale)}</strong>
                      <span className="muted">— {formatDate(invoice.created, dateLocale)}</span>
                      <span className="muted">— {invoice.status}</span>
                      {invoice.hosted_invoice_url ? (
                        <a href={invoice.hosted_invoice_url} target="_blank" rel="noopener noreferrer" className="billing-invoice-link">Voir</a>
                      ) : null}
                      {invoice.invoice_pdf ? (
                        <a href={invoice.invoice_pdf} target="_blank" rel="noopener noreferrer" className="billing-invoice-link">PDF</a>
                      ) : null}
                    </li>
                  ))}
                </ul>
              ) : <p className="hint">{t('billing.noInvoices')}</p>}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
