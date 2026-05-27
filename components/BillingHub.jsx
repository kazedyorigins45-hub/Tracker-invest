"use client";

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import LogoMark from '@/components/LogoMark';
import ThemeToggle from '@/components/ThemeToggle';
import CurrencyToggle from '@/components/CurrencyToggle';
import { PLANS, getPlan } from '@/lib/plans';
import { useLocale } from '@/lib/locale';

function formatMoney(value, locale = 'fr-FR') {
  const num = value || 0;
  const digits = Number.isInteger(num) ? 0 : 2;
  return new Intl.NumberFormat(locale, { style: 'currency', currency: 'EUR', minimumFractionDigits: digits, maximumFractionDigits: 2 }).format(num);
}

function formatDate(value, locale = 'fr-FR') {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(date);
}

export default function BillingHub({ userEmail = '', planCode = 'starter', subscription = null }) {
  const { t, locale } = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const checkoutSuccess = searchParams.get('checkout') === 'success';
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(planCode);
  const [selectedCycle, setSelectedCycle] = useState(subscription?.billing_cycle || 'monthly');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [termsModal, setTermsModal] = useState(false);
  const [accepted, setAccepted] = useState({ cgv: false, cgs: false, cgu: false });

  useEffect(() => {
    if (!checkoutSuccess) return;
    router.refresh();
    const timer = setTimeout(() => {
      router.replace('/billing');
    }, 6000);
    return () => clearTimeout(timer);
  }, [checkoutSuccess, router]);

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
      } catch (err) {
        console.error('[BillingHub] Failed to load overview:', err?.message);
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
    } catch (err) {
      console.error('[BillingHub] runAction failed:', err?.message);
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
      <aside className={`sidebar${sidebarOpen ? ' sidebar--open' : ''}`}>
        <button type="button" className="sidebar-close" onClick={() => setSidebarOpen(false)} aria-label={t('app.closeMenu')}>✕</button>
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

      <main id="main-content" className="main">
        <div className="mindset-topbar">
          <div className="mindset-topbar-left">
            <button type="button" className="hamburger-btn" onClick={() => setSidebarOpen((v) => !v)} aria-label="Menu" aria-expanded={sidebarOpen}>
              <span /><span /><span />
            </button>
            <LogoMark />
          </div>
          <ThemeToggle className="theme-toggle--app" />
          <CurrencyToggle className="theme-toggle--app" />
        </div>

        <h1 className="page-title">{t('billing.title')}</h1>
        <p className="page-sub">{t('billing.subtitle')}</p>

        {checkoutSuccess && (
          <div className="billing-success" role="status">
            {t('billing.checkoutSuccess')}{' '}
            <Link href="/mindset" className="billing-alert-link">{t('billing.checkoutLink')}</Link>
          </div>
        )}

        {isPaymentFailed && (
          <div className="billing-alert" role="alert">
            {t('billing.paymentFailed')}{' '}
            <form method="post" action="/api/stripe/portal" style={{ display: 'inline' }}>
              <button type="submit" className="billing-alert-link" style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', font: 'inherit' }}>
                {t('billing.updateCard')}
              </button>
            </form>
          </div>
        )}

        <div className="portfolio-stack">
          <div className="card portfolio-card portfolio-card--large">
            <h2>{t('billing.summary')}</h2>
            <div className="mini-grid">
              <div className="stat"><span className="muted">{t('billing.currentPlan')}</span><strong>{currentPlan?.name || planCode}</strong></div>
              <div className="stat"><span className="muted">{t('billing.status')}</span><strong>{sub.status || '—'}</strong></div>
              <div className="stat"><span className="muted">{t('billing.cycle')}</span><strong>{sub.billing_cycle === 'yearly' ? t('pricing.yearly') : t('pricing.monthly')}</strong></div>
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
                <label>{t('app.plan')}</label>
                <select className="input-dark" value={selectedPlan} onChange={(e) => setSelectedPlan(e.target.value)}>
                  {PLANS.map((plan) => <option key={plan.code} value={plan.code}>{locale === 'en' ? plan.nameEn || plan.name : plan.name}</option>)}
                </select>
              </div>
              <div className="field-block">
                <label>{t('app.cycle')}</label>
                <select className="input-dark" value={selectedCycle} onChange={(e) => setSelectedCycle(e.target.value)}>
                  <option value="monthly">{t('pricing.monthly')}</option>
                  <option value="yearly">{t('pricing.yearly')}</option>
                </select>
              </div>
            </div>
            <div className="toolbar">
              <button className="btn" type="button" disabled={busy} onClick={() => { setAccepted({ cgv: false, cgs: false, cgu: false }); setTermsModal(true); }}>{t('billing.openCheckout')}</button>
              <button className="btn btn-ghost" type="button" disabled={busy || sub.cancel_at_period_end} onClick={() => runAction('/api/billing/cancel')}>
                {t('billing.cancel')}
              </button>
              <button className="btn btn-ghost" type="button" disabled={busy || !sub.cancel_at_period_end} onClick={() => runAction('/api/billing/resume')}>
                {t('billing.resume')}
              </button>
              {overview?.hasStripeCustomer ? (
                <form method="post" action="/api/stripe/portal" style={{ display: 'inline' }}>
                  <button type="submit" className="btn btn-ghost">{t('billing.portal')}</button>
                </form>
              ) : null}
              {overview?.hasStripeCustomer ? (
                <button className="btn btn-ghost" type="button" disabled={busy} onClick={async () => {
                  const data = await runAction('/api/billing/sync');
                  if (data && !data.synced) setMessage(t('billing.syncNotNeeded'));
                }}>
                  {t('billing.sync')}
                </button>
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
                        <a href={invoice.hosted_invoice_url} target="_blank" rel="noopener noreferrer" className="billing-invoice-link">{t('billing.invoiceView')}</a>
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

      {termsModal && (
        <div className="terms-overlay" role="dialog" aria-modal="true" aria-labelledby="billing-terms-title" aria-describedby="billing-terms-desc" onClick={(e) => { if (e.target === e.currentTarget) setTermsModal(false); }}>
          <div className="terms-dialog">
            <h2 id="billing-terms-title" className="terms-title">
              {locale === 'en' ? 'Accept terms before payment' : 'Acceptation des conditions avant paiement'}
            </h2>
            <p id="billing-terms-desc" className="terms-subtitle">
              {locale === 'en' ? 'Please read and accept the following terms to continue.' : 'Veuillez lire et accepter les conditions suivantes pour continuer.'}
            </p>
            <div className="terms-checks">
              <label className="terms-check-row">
                <input type="checkbox" checked={accepted.cgv} onChange={(e) => setAccepted((prev) => ({ ...prev, cgv: e.target.checked }))} />
                <span>{locale === 'en' ? "I accept the " : "J'accepte les "}<Link href="/terms#cgv" target="_blank" rel="noopener noreferrer" className="terms-link">{locale === 'en' ? 'General Terms of Sale (CGV)' : 'Conditions Générales de Vente (CGV)'}</Link></span>
              </label>
              <label className="terms-check-row">
                <input type="checkbox" checked={accepted.cgs} onChange={(e) => setAccepted((prev) => ({ ...prev, cgs: e.target.checked }))} />
                <span>{locale === 'en' ? "I accept the " : "J'accepte les "}<Link href="/terms#cgs" target="_blank" rel="noopener noreferrer" className="terms-link">{locale === 'en' ? 'General Terms of Service (CGS)' : 'Conditions Générales de Service (CGS)'}</Link></span>
              </label>
              <label className="terms-check-row">
                <input type="checkbox" checked={accepted.cgu} onChange={(e) => setAccepted((prev) => ({ ...prev, cgu: e.target.checked }))} />
                <span>{locale === 'en' ? "I accept the " : "J'accepte les "}<Link href="/terms#cgu" target="_blank" rel="noopener noreferrer" className="terms-link">{locale === 'en' ? 'General Terms of Use (CGU)' : "Conditions Générales d'Utilisation (CGU)"}</Link></span>
              </label>
            </div>
            <div className="terms-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setTermsModal(false)}>{locale === 'en' ? 'Cancel' : 'Annuler'}</button>
              <button type="button" className="btn btn-gold" disabled={!accepted.cgv || !accepted.cgs || !accepted.cgu} onClick={() => { setTermsModal(false); handleChangePlan(); }}>{locale === 'en' ? 'Confirm & Pay' : 'Confirmer et payer'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
