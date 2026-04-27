"use client";

import Link from 'next/link';
import { PLANS } from '@/lib/plans';
import { useLocale } from '@/lib/locale';
import DashboardContent from '@/components/DashboardContent';

export default function HomeContent() {
  const { t } = useLocale();

  return (
    <div className="home-wrap">
      <section className="home-hero">
        <div className="home-hero-main">
          <span className="badge">Mindset Invest</span>
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
            <span className="badge">{plan.highlight ? 'Recommandé' : 'Plan'}</span>
            <strong>{plan.name}</strong>
            <span className="desc">{plan.description}</span>
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
        <div style={{ textAlign: 'center', fontSize: '0.72rem', color: 'var(--muted)', lineHeight: 1.5 }}>
          {t('home.footer')}
        </div>
      </footer>
    </div>
  );
}
