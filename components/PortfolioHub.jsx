"use client";

import { useState } from 'react';
import Link from 'next/link';
import { canAccess, getSubscriptionLabel } from '@/lib/plans';
import { useAccountPayload } from '@/lib/use-account-payload';
import { useLocale } from '@/lib/locale';
import { useFxRate } from '@/lib/fx';
import LogoMark from '@/components/LogoMark';
import ThemeToggle from '@/components/ThemeToggle';
import CurrencyToggle from '@/components/CurrencyToggle';

export default function PortfolioHub({ userEmail = '', planCode = 'starter', subscription = null }) {
  const [data, setData] = useAccountPayload('portfolioHub_v1', {
    title: '',
    target: '',
    note: '',
    targetActifs: '',
    targetPassif: '',
    targetDispo: '',
    positionsValue: '',
    tradingNetValue: '',
  });
  const [saveStatus, setSaveStatus] = useState('');

  const update = (patch) => setData((prev) => ({ ...prev, ...patch }));
  const subscriptionLabel = getSubscriptionLabel(subscription, planCode);
  const { t, locale } = useLocale();

  const positionsValue = Number(String(data.positionsValue).replace(/[^\d.,-]/g, '').replace(',', '.')) || 0;
  const tradingNetValue = Number(String(data.tradingNetValue).replace(/[^\d.,-]/g, '').replace(',', '.')) || 0;
  const totalValue = positionsValue + tradingNetValue;
  const targetValue = Number(String(data.target).replace(/[^\d.,-]/g, '').replace(',', '.'));
  const progressValue = targetValue > 0 ? Math.min(100, Math.round((totalValue / targetValue) * 100)) : 0;

  const EUR_TO_USD = useFxRate();
  const formatEuro = (value) => {
    const v = Number.isFinite(value) ? value : 0;
    if (locale === 'en') return `$${Math.round(v * EUR_TO_USD).toLocaleString('en-US')}`;
    return `${new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(v)}€`;
  };

  const axes = [
    { key: 'positions', title: t('portfolio.axisPositions'), value: positionsValue, target: Number(String(data.targetActifs).replace(/[^\d.,-]/g, '').replace(',', '.')) || 0 },
    { key: 'trading', title: t('portfolio.axisTradingNet'), value: tradingNetValue, target: Number(String(data.targetPassif).replace(/[^\d.,-]/g, '').replace(',', '.')) || 0 },
    { key: 'total', title: t('portfolio.axisTotal'), value: totalValue, target: Number(String(data.targetDispo).replace(/[^\d.,-]/g, '').replace(',', '.')) || 0 },
  ];

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
            <div className="tag">{t('portfolio.sidebarTag')}</div>
            <Link href="/" className="brand-link"><h1>{t('portfolio.sidebarTitle')}</h1></Link>
            <p>{t('portfolio.sidebarDesc')}</p>
          </div>

          <nav className="sidebar-apps" aria-label="Navigation site">
            <div className="sidebar-apps-label">{t('mindset.spaces')}</div>
            <button type="button" className="app-link" onClick={() => window.location.assign('/')}>{t('app.dashboardLink')}</button>
            {canAccess(planCode, 'tracker') ? <Link href="/tracker" className="app-link">{t('app.trading')}</Link> : null}
            <Link href="/mindset" className="app-link">{t('app.mindset')}</Link>
            {canAccess(planCode, 'invest') ? <Link href="/invest" className="app-link">{t('app.invest')}</Link> : null}
            <Link href="/portfolio" className="app-link is-current">{t('app.portfolio')}</Link>
          </nav>
        </div>

        <div className="sidebar-bottom">
          <p className="app-plan">{subscriptionLabel}</p>
          <span style={{ wordBreak: 'break-all' }}>{userEmail}</span>
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
        <h1 className="page-title">{t('portfolio.mainTitle')}</h1>
        <p className="page-sub">{t('portfolio.mainSub')}</p>

        <div className="portfolio-stack">
          <div className="card portfolio-card portfolio-card--accent portfolio-card--large">
            <h2>{t(‘portfolio.objectiveSectionTitle’)}</h2>
            <div className="grid-2 portfolio-grid-spaced">
              <div className="field-block"><label>{t(‘portfolio.objectiveTitleLabel’)}</label><input className="input-dark" type="text" value={data.title} onChange={(e) => update({ title: e.target.value })} placeholder="Ex. Liberté financière, retraite…" /></div>
              <div className="field-block"><label>{t(‘portfolio.objectiveGlobalLabel’)}</label><input className="input-dark" type="text" value={data.target} onChange={(e) => update({ target: e.target.value })} placeholder="500000" /></div>
            </div>
            <div className="grid-2" style={{ marginTop: ‘0.5rem’ }}>
              <div className="field-block"><label>{t(‘portfolio.positionsValueLabel’)}</label><input className="input-dark" type="text" value={data.positionsValue} onChange={(e) => update({ positionsValue: e.target.value })} placeholder="ex. 125000" /></div>
              <div className="field-block"><label>{t(‘portfolio.tradingNetLabel’)}</label><input className="input-dark" type="text" value={data.tradingNetValue} onChange={(e) => update({ tradingNetValue: e.target.value })} placeholder="ex. 4800" /></div>
            </div>
            <p className="hint" style={{ marginTop: ‘0.25rem’ }}>{t(‘portfolio.optionalTargetsHint’)}</p>
            <div className="grid-2" style={{ marginTop: ‘0.5rem’ }}>
              <div><label>{t(‘portfolio.targetActifsLabel’)}</label><input className="input-dark" type="text" value={data.targetActifs} onChange={(e) => update({ targetActifs: e.target.value })} placeholder="ex. 200000" /></div>
              <div><label>{t(‘portfolio.targetPassifLabel’)}</label><input className="input-dark" type="text" value={data.targetPassif} onChange={(e) => update({ targetPassif: e.target.value })} placeholder="ex. 80000" /></div>
            </div>
            <div className="portfolio-single-field">
              <label>{t(‘portfolio.targetDispoLabel’)}</label>
              <input className="input-dark" type="text" value={data.targetDispo} onChange={(e) => update({ targetDispo: e.target.value })} placeholder="ex. 50000" />
            </div>
            <label className="field-label">{t(‘portfolio.noteLabel’)}</label>
            <textarea className="input-dark portfolio-note" rows="2" value={data.note} onChange={(e) => update({ note: e.target.value })} placeholder="Rappel : ce que tu inclus ou exclus de ce chiffre…" />
            <div className="toolbar">
              <button className="btn" type="button" onClick={handleSaveObjective} disabled={saveStatus === ‘saving’}>{t(‘portfolio.saveBtn’)}</button>
              <button className="btn btn-ghost" type="button" onClick={() => setSaveStatus(‘refreshed’)}>{t(‘portfolio.refreshBtn’)}</button>
            </div>
            {saveStatus ? <p className="form-message">{saveStatus === ‘saving’ ? t(‘portfolio.statusSaving’) : saveStatus === ‘saved’ ? t(‘portfolio.statusSaved’) : saveStatus === ‘refreshed’ ? t(‘portfolio.statusRefreshed’) : t(‘portfolio.statusError’)}</p> : null}
          </div>

          <div className="card portfolio-card">
            <h2>{t(‘portfolio.progressTitle’)}</h2>
            <div className="stats-row portfolio-stats">
              <div className="stat-box"><div className="v">{formatEuro(positionsValue)}</div><div className="l">{t(‘portfolio.statPositions’)}</div></div>
              <div className="stat-box"><div className="v pos">+{formatEuro(tradingNetValue)}</div><div className="l">{t(‘portfolio.statTradingNet’)}</div></div>
              <div className="stat-box"><div className="v">{formatEuro(totalValue)}</div><div className="l">{t(‘portfolio.statTotal’)}</div></div>
              <div className="stat-box"><div className="v">{progressValue}%</div><div className="l">{t(‘portfolio.statPercent’)}</div></div>
            </div>
            <div className="progress-wrap">
              <div className="progress-bar"><div className="fill" style={{ width: `${progressValue}%` }} /></div>
              <div className="progress-meta"><span>{t(‘portfolio.progressBarHint’)}</span><span><strong>{progressValue}%</strong></span></div>
            </div>
            <h3 style={{ fontFamily: ‘Cinzel, serif’, fontSize: ‘0.72rem’, letterSpacing: ‘0.1em’, color: ‘var(--gold)’, textTransform: ‘uppercase’, margin: ‘1.75rem 0 0.85rem’ }}>{t(‘portfolio.axesTitle’)}</h3>
            <p className="hint" style={{ marginBottom: ‘1.1rem’ }}>{t(‘portfolio.axesHint’)}</p>
            {axes.map((axis) => (
              <div key={axis.key} className="hub-axis">
                <div className="hub-axis-head">
                  <span className="hub-axis-title">{axis.title}</span>
                  <span className="hub-axis-amt">{formatEuro(axis.value)}</span>
                </div>
                <div className="progress-bar">
                  <div className="fill" style={{ width: `${axis.target ? Math.min(100, Math.round((axis.value / axis.target) * 100)) : 0}%` }} />
                </div>
              </div>
            ))}
            <p className="hint">{t(‘portfolio.dataSourceHint’)}</p>
          </div>

          <div className="card portfolio-card">
            <h2>{t(‘portfolio.lastSimTitle’)}</h2>
            <p className="hint" style={{ marginTop: 0 }}>{t(‘portfolio.lastSimHint’)}</p>
            <a href="/invest" style={{ color: ‘var(--gold-bright)’, fontSize: ‘0.85rem’, fontWeight: 600 }}>{t(‘portfolio.lastSimLink’)}</a>
          </div>

          <div className="grid-2">
            <div className="card portfolio-card">
              <h2>{t(‘portfolio.tradingCardTitle’)}</h2>
              <div className="stats-row">
                <div className="stat-box"><div className="v pos">+{formatEuro(tradingNetValue)}</div><div className="l">{t(‘portfolio.tradingCardGains’)}</div></div>
                <div className="stat-box"><div className="v neg">—</div><div className="l">{t(‘portfolio.tradingCardLosses’)}</div></div>
                <div className="stat-box"><div className="v">—</div><div className="l">{t(‘portfolio.tradingCardTrades’)}</div></div>
              </div>
              <p className="hint"><a href="/tracker" style={{ color: ‘var(--gold-bright)’ }}>{t(‘portfolio.tradingCardLink’)}</a></p>
            </div>
            <div className="card portfolio-card">
              <h2>{t(‘portfolio.investCardTitle’)}</h2>
              <div className="stats-row">
                <div className="stat-box"><div className="v">{formatEuro(positionsValue)}</div><div className="l">{t(‘portfolio.investCardPositions’)}</div></div>
              </div>
              <p className="hint"><a href="/invest" style={{ color: ‘var(--gold-bright)’ }}>{t(‘portfolio.investCardLink’)}</a></p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
