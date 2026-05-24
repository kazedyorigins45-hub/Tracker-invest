"use client";

import Link from 'next/link';
import { PLANS } from '@/lib/plans';
import { useLocale } from '@/lib/locale';
import { useCurrency } from '@/lib/currency';
import { useFxRate } from '@/lib/fx';
import DashboardContent from '@/components/DashboardContent';

export default function HomeContent() {
  const { t, locale } = useLocale();
  const { currency } = useCurrency();
  const fxRate = useFxRate();

  const formatPlanPrice = (eur) => {
    if (eur === 0) return locale === 'en' ? 'Free' : 'Gratuit';
    if (currency === 'usd') {
      const usd = eur * fxRate;
      return `$${new Intl.NumberFormat('en-US', { minimumFractionDigits: Number.isInteger(usd) ? 0 : 2, maximumFractionDigits: 2 }).format(usd)}`;
    }
    return `${new Intl.NumberFormat('fr-FR', { minimumFractionDigits: Number.isInteger(eur) ? 0 : 2, maximumFractionDigits: 2 }).format(eur)} €`;
  };

  return (
    <div className="home-wrap">
      <section className="home-hero">
        <div className="home-hero-main">
          <span className="badge">Tracker-invest</span>
          <h1 className="home-title">{t('home.headline')}</h1>
          <p className="tagline">{t('home.tagline')}</p>

          <div className="home-actions">
            <Link className="formation-link" href="/pricing">{t('home.plans')}</Link>
            <Link className="formation-link" href="/features">{t('home.modules')}</Link>
            <Link className="formation-link" href="/mindset">{t('app.dashboardLink')}</Link>
          </div>

          <section className="formation-callout home-formation" aria-labelledby="formation-title">
            <h3 id="formation-title">{t('home.formationTitle')}</h3>
            <p>{t('home.formationText')}</p>
          </section>
        </div>

        <div className="home-hero-side">
          <DashboardContent />
        </div>
      </section>

      <div className="hero-grid home-tiles">
        <Link href="/mindset" className="mindset-banner">
          <strong>{t('home.mindsetSpace')}</strong>
          <span>{t('home.mindsetSpaceDesc')}</span>
        </Link>

        <Link href="/portfolio" className="mindset-banner">
          <strong>{t('home.portfolioSpace')}</strong>
          <span>{t('home.portfolioSpaceDesc')}</span>
        </Link>
      </div>

      <h2 className="section-title" style={{ textAlign: 'center', marginTop: '1.5rem' }}>{t('home.subscriptionsTitle')}</h2>
      <nav className="subs" aria-label={t('home.subscriptionsTitle')}>
        {PLANS.map((plan) => (
          <Link key={plan.code} href="/pricing" className={`sub-card ${plan.highlight ? 'is-selected' : ''}`}>
            <span className="badge">{plan.highlight ? (locale === 'en' ? 'Recommended' : 'Recommandé') : (locale === 'en' ? 'Plan' : 'Plan')}</span>
            <strong>{locale === 'en' ? plan.nameEn : plan.name}</strong>
            <span className="desc">{locale === 'en' ? plan.descriptionEn : plan.description}</span>
            <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--gold, #c9a84c)' }}>{formatPlanPrice(plan.prices.monthly)}<span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--muted)' }}>{plan.prices.monthly > 0 ? (locale === 'en' ? '/mo' : '/mois') : ''}</span></span>
            <span className="cta">{t('home.plans')} →</span>
          </Link>
        ))}
      </nav>

      <div className="grid-legacy home-pages">
        <h3>{t('home.pagesTitle')}</h3>
        <Link href="/dashboard"><strong>Dashboard</strong> — {t('home.dashboardDesc')}</Link>
        <Link href="/pricing"><strong>Pricing</strong> — {t('home.pricingDesc')}</Link>
      </div>

      <footer className="site-footer" style={{ background: 'transparent', border: '0', marginTop: '2rem' }}>
        <div style={{ textAlign: 'center', fontSize: '0.8rem', fontWeight: 500, color: 'var(--muted)', lineHeight: 1.6, marginBottom: '0.5rem', padding: '0.5rem 1rem', border: '1px solid var(--border)', borderRadius: '6px', maxWidth: '600px', margin: '0 auto 0.75rem' }}>
          {t('home.disclaimer')}
        </div>

      </footer>
    </div>
  );
}
