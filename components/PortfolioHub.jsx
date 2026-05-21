"use client";

import { useState } from 'react';
import Link from 'next/link';
import { canAccess, getSubscriptionLabel } from '@/lib/plans';
import { useAccountPayload } from '@/lib/use-account-payload';
import { useLocale } from '@/lib/locale';
import { useFxRate } from '@/lib/fx';
import { useCurrency } from '@/lib/currency';
import LogoMark from '@/components/LogoMark';
import ThemeToggle from '@/components/ThemeToggle';
import CurrencyToggle from '@/components/CurrencyToggle';
import LanguageToggle from '@/components/LanguageToggle';

function parseAmt(raw) {
  return Number(String(raw ?? '').replace(/[^\d.,-]/g, '').replace(',', '.')) || 0;
}

export default function PortfolioHub({ userEmail = '', planCode = 'starter', subscription = null }) {
  const [data, setData] = useAccountPayload('portfolioHub_v1', {
    title: '',
    target: '',
    note: '',
    positionsValue: '',
    tradingNetValue: '',
  });

  const [investProfileState] = useAccountPayload('investHub_profiles_v1', { current: 'main' });
  const [trackerProfileState] = useAccountPayload('trackerHub_profiles_v1', { current: 'default' });
  const investProfile = investProfileState.current || 'main';
  const trackerProfile = trackerProfileState.current || 'default';

  const [investData] = useAccountPayload(`investHub_v2_${investProfile}`, { holdings: [] });
  const [trackerData] = useAccountPayload(`trackerHub_v2_${trackerProfile}`, { weeklyTrades: [] });

  const [saveStatus, setSaveStatus] = useState('');

  const update = (patch) => setData((prev) => ({ ...prev, ...patch }));
  const subscriptionLabel = getSubscriptionLabel(subscription, planCode);
  const { t, locale } = useLocale();
  const { currency } = useCurrency();
  const EUR_TO_USD = useFxRate();

  const autoInvestValue = (Array.isArray(investData.holdings) ? investData.holdings : [])
    .filter((h) => !h.sellDate && !h.saleDate)
    .reduce((sum, h) => {
      const direct = parseAmt(h.value);
      const fallback = parseAmt(h.quantity || h.qty) * parseAmt(h.avgPrice || h.buyAvg);
      return sum + (direct > 0 ? direct : fallback);
    }, 0);

  const autoTradingNet = (Array.isArray(trackerData.weeklyTrades) ? trackerData.weeklyTrades : [])
    .reduce((sum, row) => sum + parseAmt(row.result || 0), 0);

  const manualPositions = parseAmt(data.positionsValue);
  const manualTrading = parseAmt(data.tradingNetValue);

  const positionsValue = manualPositions > 0 ? manualPositions : autoInvestValue;
  const tradingNetValue = manualTrading !== 0 ? manualTrading : autoTradingNet;
  const isInvestLinked = manualPositions === 0;
  const isTradingLinked = manualTrading === 0;

  const totalValue = positionsValue + tradingNetValue;

  const formatEuro = (value) => {
    const v = Number.isFinite(value) ? value : 0;
    if (currency === 'usd') return `$${Math.round(v * EUR_TO_USD).toLocaleString('en-US')}`;
    return `${new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(v)}€`;
  };

  const axes = [
    { key: 'positions', title: t('portfolio.axisPositions'), value: positionsValue, linked: isInvestLinked, href: '/invest' },
    { key: 'trading', title: t('portfolio.axisTradingNet'), value: tradingNetValue, linked: isTradingLinked, href: '/tracker' },
    { key: 'total', title: t('portfolio.axisTotal'), value: totalValue, linked: false, href: null },
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
          <LanguageToggle className="theme-toggle--app" />
          <CurrencyToggle className="theme-toggle--app" />
        </div>
        <h1 className="page-title">{t('portfolio.mainTitle')}</h1>
        <p className="page-sub">{t('portfolio.mainSub')}</p>

        <div className="portfolio-stack">
          <div className="card portfolio-card portfolio-card--accent portfolio-card--large">
            <h2>{t('portfolio.objectiveSectionTitle')}</h2>
            <div className="grid-2 portfolio-grid-spaced">
              <div className="field-block"><label>{t('portfolio.objectiveTitleLabel')}</label><input className="input-dark" type="text" value={data.title} onChange={(e) => update({ title: e.target.value })} placeholder={t('portfolio.objectiveTitlePlaceholder')} /></div>
              <div className="field-block"><label>{t('portfolio.objectiveGlobalLabel')}</label><input className="input-dark" type="text" value={data.target} onChange={(e) => update({ target: e.target.value })} placeholder="ex. 200000" /></div>
            </div>
            <div className="grid-2" style={{ marginTop: '0.75rem' }}>
              <div className="field-block">
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  {t('portfolio.positionsValueLabel')}
                  {isInvestLinked && <span style={{ fontSize: '0.65rem', background: 'var(--gold)', color: '#000', borderRadius: '4px', padding: '0 5px', fontWeight: 700, letterSpacing: '0.06em' }}>AUTO</span>}
                </label>
                <input className="input-dark" type="text" value={data.positionsValue} onChange={(e) => update({ positionsValue: e.target.value })} placeholder={isInvestLinked ? `${formatEuro(autoInvestValue)} (auto)` : 'ex. 125000'} />
                {isInvestLinked && <p style={{ fontSize: '0.7rem', color: 'var(--muted)', marginTop: '0.25rem' }}>Lu depuis <a href="/invest" style={{ color: 'var(--gold-bright)' }}>Elite Invest</a> — {formatEuro(autoInvestValue)}</p>}
              </div>
              <div className="field-block">
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  {t('portfolio.tradingNetLabel')}
                  {isTradingLinked && <span style={{ fontSize: '0.65rem', background: 'var(--gold)', color: '#000', borderRadius: '4px', padding: '0 5px', fontWeight: 700, letterSpacing: '0.06em' }}>AUTO</span>}
                </label>
                <input className="input-dark" type="text" value={data.tradingNetValue} onChange={(e) => update({ tradingNetValue: e.target.value })} placeholder={isTradingLinked ? `${formatEuro(autoTradingNet)} (auto)` : 'ex. 4800'} />
                {isTradingLinked && <p style={{ fontSize: '0.7rem', color: 'var(--muted)', marginTop: '0.25rem' }}>Lu depuis <a href="/tracker" style={{ color: 'var(--gold-bright)' }}>Elite Tracker</a> — {formatEuro(autoTradingNet)}</p>}
              </div>
            </div>
            <label className="field-label">{t('portfolio.noteLabel')}</label>
            <textarea className="input-dark portfolio-note" rows="2" value={data.note} onChange={(e) => update({ note: e.target.value })} placeholder={t('portfolio.notePlaceholder')} />
            <div className="toolbar">
              <button className="btn" type="button" onClick={handleSaveObjective} disabled={saveStatus === 'saving'}>{t('portfolio.saveBtn')}</button>
            </div>
            {saveStatus ? <p className="form-message">{saveStatus === 'saving' ? t('portfolio.statusSaving') : saveStatus === 'saved' ? t('portfolio.statusSaved') : t('portfolio.statusError')}</p> : null}
          </div>

          <div className="card portfolio-card">
            <h2>{t('portfolio.progressTitle')}</h2>
            <div className="stats-row portfolio-stats">
              <div className="stat-box"><div className="v">{formatEuro(positionsValue)}</div><div className="l">{t('portfolio.statPositions')}</div></div>
              <div className="stat-box"><div className="v pos">+{formatEuro(tradingNetValue)}</div><div className="l">{t('portfolio.statTradingNet')}</div></div>
              <div className="stat-box"><div className="v">{formatEuro(totalValue)}</div><div className="l">{t('portfolio.statTotal')}</div></div>
              {parseAmt(data.target) > 0 && (
                <div className="stat-box"><div className="v" style={{ color: 'var(--gold)' }}>{Math.min(100, Math.round(totalValue / parseAmt(data.target) * 100))}%</div><div className="l">{t('portfolio.statPercent')}</div></div>
              )}
            </div>
            {parseAmt(data.target) > 0 ? (
              <div style={{ marginTop: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--muted)', marginBottom: '0.35rem' }}>
                  <span>{formatEuro(totalValue)}</span>
                  <span>{formatEuro(parseAmt(data.target))}</span>
                </div>
                <div style={{ background: 'var(--border, rgba(255,255,255,0.1))', borderRadius: '6px', height: '10px', overflow: 'hidden' }}>
                  <div style={{ width: `${Math.min(100, totalValue / parseAmt(data.target) * 100)}%`, height: '100%', background: 'var(--gold, #c9a84c)', borderRadius: '6px', transition: 'width 0.4s ease' }} />
                </div>
              </div>
            ) : (
              <p style={{ fontSize: '0.72rem', color: 'var(--muted)', marginTop: '0.75rem' }}>{t('portfolio.progressBarHint')}</p>
            )}
            <h3 style={{ fontFamily: 'Cinzel, serif', fontSize: '0.72rem', letterSpacing: '0.1em', color: 'var(--gold)', textTransform: 'uppercase', margin: '1.75rem 0 0.85rem' }}>{t('portfolio.axesTitle')}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {axes.map((axis) => (
                <div key={axis.key} style={{ padding: '0.85rem 1rem', background: 'var(--card-bg, rgba(255,255,255,0.03))', borderRadius: '8px', border: `1px solid ${axis.linked ? 'var(--gold, #c9a84c)' : 'var(--border, rgba(255,255,255,0.08))'}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.78rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      {axis.title}
                      {axis.linked && axis.href && (
                        <a href={axis.href} style={{ fontSize: '0.6rem', background: 'var(--gold)', color: '#000', borderRadius: '4px', padding: '1px 5px', fontWeight: 700, letterSpacing: '0.05em', textDecoration: 'none' }}>AUTO</a>
                      )}
                    </span>
                    <span style={{ fontSize: '1.1rem', fontWeight: 600, color: axis.key === 'total' ? 'var(--gold, #c9a84c)' : 'var(--text)' }}>{formatEuro(axis.value)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card portfolio-card">
            <h2>{t('portfolio.lastSimTitle')}</h2>
            <p className="hint" style={{ marginTop: 0 }}>{t('portfolio.lastSimHint')}</p>
            <a href="/invest" style={{ color: 'var(--gold-bright)', fontSize: '0.85rem', fontWeight: 600 }}>{t('portfolio.lastSimLink')}</a>
          </div>

          <div className="grid-2">
            <div className="card portfolio-card">
              <h2>{t('portfolio.tradingCardTitle')}</h2>
              <div className="stats-row">
                <div className="stat-box"><div className="v pos">+{formatEuro(tradingNetValue)}</div><div className="l">{t('portfolio.tradingCardGains')}</div></div>
                <div className="stat-box"><div className="v neg">—</div><div className="l">{t('portfolio.tradingCardLosses')}</div></div>
                <div className="stat-box"><div className="v">—</div><div className="l">{t('portfolio.tradingCardTrades')}</div></div>
              </div>
              <p className="hint"><a href="/tracker" style={{ color: 'var(--gold-bright)' }}>{t('portfolio.tradingCardLink')}</a></p>
            </div>
            <div className="card portfolio-card">
              <h2>{t('portfolio.investCardTitle')}</h2>
              <div className="stats-row">
                <div className="stat-box"><div className="v">{formatEuro(positionsValue)}</div><div className="l">{t('portfolio.investCardPositions')}</div></div>
              </div>
              <p className="hint"><a href="/invest" style={{ color: 'var(--gold-bright)' }}>{t('portfolio.investCardLink')}</a></p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
