"use client";

import { useState } from 'react';
import Link from 'next/link';
import { canAccess, getSubscriptionLabel } from '@/lib/plans';
import { useAccountPayload } from '@/lib/use-account-payload';
import { useLocale } from '@/lib/locale';
import ThemeToggle from '@/components/ThemeToggle';
import LanguageToggle from '@/components/LanguageToggle';

export default function PortfolioHub({ userEmail = '', planCode = 'starter', subscription = null }) {
  const [data, setData] = useAccountPayload('portfolioHub_v1', {
    title: '',
    target: '',
    note: '',
  });
  const [saveStatus, setSaveStatus] = useState('');

  const update = (patch) => setData((prev) => ({ ...prev, ...patch }));
  const subscriptionLabel = getSubscriptionLabel(subscription, planCode);
  const { t } = useLocale();

  const positionsValue = 125000;
  const tradingNetValue = 4800;
  const totalValue = positionsValue + tradingNetValue;
  const targetValue = Number(String(data.target).replace(/[^\d.,-]/g, '').replace(',', '.'));
  const progressValue = targetValue > 0 ? Math.min(100, Math.round((totalValue / targetValue) * 100)) : 0;

  const formatEuro = (value) => new Intl.NumberFormat('fr-FR', {
    maximumFractionDigits: 0,
  }).format(value) + '€';

  const handleSaveObjective = async () => {
    setSaveStatus('saving');
    try {
      await fetch('/api/account-data', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storageKey: 'portfolioHub_v1',
          payload: JSON.stringify(data),
        }),
      });
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus(''), 1800);
    } catch {
      setSaveStatus('error');
    }
  };

  return (
    <div className="mindset-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <div className="brand-top">
            <div className="tag">Mindset</div>
            <Link href="/" className="brand-link"><h1>Mes investissements</h1></Link>
            <p>{t('home.portfolioSpaceDesc')}</p>
          </div>

          <nav className="sidebar-apps" aria-label="Navigation site">
            <div className="sidebar-apps-label">{t('mindset.spaces')}</div>
            <button type="button" className="app-link" onClick={() => window.location.assign('/mindset')}>{t('app.dashboardLink')}</button>
            <Link href="/mindset" className="app-link">{t('app.mindset')}</Link>
            <Link href="/portfolio" className="app-link is-current">{t('app.portfolio')}</Link>
            {canAccess(planCode, 'tracker') ? <Link href="/tracker" className="app-link">{t('portfolio.nav.tracker')}</Link> : null}
            {canAccess(planCode, 'invest') ? <Link href="/invest" className="app-link">{t('portfolio.nav.invest')}</Link> : null}
          </nav>
        </div>

        <div className="sidebar-bottom">
          <p className="app-plan">{subscriptionLabel}</p>
          <span style={{ wordBreak: 'break-all' }}>{userEmail}</span>
          <a href="/login?logout=1" className="sidebar-logout">{t('site.logout')}</a>
        </div>
      </aside>

      <main className="main">
        <div className="mindset-topbar">
          <ThemeToggle className="theme-toggle--app" />
          <LanguageToggle className="theme-toggle--app" />
        </div>
        <h1 className="page-title">{t('portfolio.title')}</h1>
        <p className="page-sub">{t('portfolio.subtitle')}</p>

        <div className="portfolio-stack">
          <div className="card portfolio-card portfolio-card--accent portfolio-card--large">
            <h2>{t('portfolio.objective')}</h2>
            <div className="grid-2 portfolio-grid-spaced">
              <div className="field-block"><label>{t('portfolio.objectiveTitle')}</label><input className="input-dark" type="text" value={data.title} onChange={(e) => update({ title: e.target.value })} placeholder="Ex. Liberté financière, retraite…" /></div>
              <div className="field-block"><label>{t('portfolio.globalGoal')}</label><input className="input-dark" type="text" value={data.target} onChange={(e) => update({ target: e.target.value })} placeholder="500000" /></div>
            </div>
            <label className="field-label">{t('portfolio.note')}</label>
            <textarea className="input-dark portfolio-note" rows="3" value={data.note} onChange={(e) => update({ note: e.target.value })} placeholder="Ce que tu inclus ou exclus de ce chiffre…" />
            <div className="toolbar">
              <button className="btn" type="button" onClick={handleSaveObjective} disabled={saveStatus === 'saving'}>{t('portfolio.saveObjective')}</button>
              <button className="btn btn-ghost" type="button">{t('portfolio.refresh')}</button>
            </div>
            {saveStatus ? <p className="form-message">{saveStatus === 'saving' ? 'Sauvegarde...' : saveStatus === 'saved' ? 'Objectif enregistré.' : 'Erreur de sauvegarde.'}</p> : null}
          </div>

          <div className="card portfolio-card">
            <h2>{t('portfolio.progress')}</h2>
            <div className="stats-row portfolio-stats">
              <div className="stat-box"><div className="v">{formatEuro(positionsValue)}</div><div className="l">{t('portfolio.positions')}</div></div>
              <div className="stat-box"><div className="v pos">+{formatEuro(tradingNetValue)}</div><div className="l">{t('portfolio.tradingNet')}</div></div>
              <div className="stat-box"><div className="v">{formatEuro(totalValue)}</div><div className="l">{t('portfolio.total')}</div></div>
              <div className="stat-box"><div className="v">{progressValue}%</div><div className="l">{t('portfolio.reached')}</div></div>
            </div>
            <div className="progress-wrap">
              <div className="progress-bar"><div className="fill" style={{ width: `${progressValue}%` }} /></div>
              <div className="progress-meta"><span>{t('portfolio.progressGlobal')}</span><span><strong>{progressValue}%</strong></span></div>
            </div>
          </div>

          <div className="portfolio-grid-2">
            <div className="card portfolio-card">
              <h2>{t('portfolio.axes')}</h2>
              <p className="hint">{t('portfolio.axesText')}</p>
            </div>
            <div className="card portfolio-card">
              <h2>{t('portfolio.lastSim')}</h2>
              <p className="hint">{t('portfolio.lastSimText')}</p>
              <a href="/invest" style={{ color: 'var(--gold-bright)', fontSize: '0.85rem', fontWeight: 600 }}>{t('portfolio.open')}</a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
