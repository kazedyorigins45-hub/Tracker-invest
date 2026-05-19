"use client";

import { useState } from 'react';
import Link from 'next/link';
import { canAccess, getSubscriptionLabel } from '@/lib/plans';
import { useAccountPayload } from '@/lib/use-account-payload';
import { useLocale } from '@/lib/locale';
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
  const { t } = useLocale();

  const positionsValue = Number(String(data.positionsValue).replace(/[^\d.,-]/g, '').replace(',', '.')) || 0;
  const tradingNetValue = Number(String(data.tradingNetValue).replace(/[^\d.,-]/g, '').replace(',', '.')) || 0;
  const totalValue = positionsValue + tradingNetValue;
  const targetValue = Number(String(data.target).replace(/[^\d.,-]/g, '').replace(',', '.'));
  const progressValue = targetValue > 0 ? Math.min(100, Math.round((totalValue / targetValue) * 100)) : 0;

  const formatEuro = (value) => new Intl.NumberFormat('fr-FR', {
    maximumFractionDigits: 0,
  }).format(value) + '€';

  const axes = [
    { key: 'positions', title: 'Patrimoine positions', value: positionsValue, target: Number(String(data.targetActifs).replace(/[^\d.,-]/g, '').replace(',', '.')) || 0 },
    { key: 'trading', title: 'Trading — résultat net', value: tradingNetValue, target: Number(String(data.targetPassif).replace(/[^\d.,-]/g, '').replace(',', '.')) || 0 },
    { key: 'total', title: 'Total consolidé', value: totalValue, target: Number(String(data.targetDispo).replace(/[^\d.,-]/g, '').replace(',', '.')) || 0 },
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
            <div className="tag">Synthèse</div>
            <Link href="/" className="brand-link"><h1>Mes investissements</h1></Link>
            <p>Objectif global, trading &amp; patrimoine — données reliées automatiquement</p>
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
        <h1 className="page-title">Vue consolidée</h1>
        <p className="page-sub">
          Définis ton <strong style={{ color: 'var(--gold-bright)' }}>objectif patrimonial</strong> : le total affiché additionne
          la <strong>valeur estimée</strong> de toutes tes positions (Elite Invest, tous portefeuilles) et le
          <strong>résultat cumulé</strong> de tous tes trades (Elite Tracker, tous profils). Les pertes et gains de trading sont calculés comme dans le carnet (entrée / sortie ou colonne résultat).
        </p>

        <div className="portfolio-stack">
          <div className="card portfolio-card portfolio-card--accent portfolio-card--large">
            <h2>Ton objectif</h2>
            <div className="grid-2 portfolio-grid-spaced">
              <div className="field-block"><label>Titre (optionnel)</label><input className="input-dark" type="text" value={data.title} onChange={(e) => update({ title: e.target.value })} placeholder="Ex. Liberté financière, retraite…" /></div>
              <div className="field-block"><label>Objectif global consolidé (€)</label><input className="input-dark" type="text" value={data.target} onChange={(e) => update({ target: e.target.value })} placeholder="500000" /></div>
            </div>
            <div className="grid-2" style={{ marginTop: '0.5rem' }}>
              <div className="field-block"><label>Valeur patrimoine positions (€)</label><input className="input-dark" type="text" value={data.positionsValue} onChange={(e) => update({ positionsValue: e.target.value })} placeholder="ex. 125000" /></div>
              <div className="field-block"><label>Résultat net trading (€)</label><input className="input-dark" type="text" value={data.tradingNetValue} onChange={(e) => update({ tradingNetValue: e.target.value })} placeholder="ex. 4800" /></div>
            </div>
            <p className="hint" style={{ marginTop: '0.25rem' }}>Objectifs <strong>optionnels</strong> pour les trois barres Elite Invest ci-dessous (actifs ouverts, revenu passif ouvert, encaissements des ventes).</p>
            <div className="grid-2" style={{ marginTop: '0.5rem' }}>
              <div><label>Cible actifs ouverts (€)</label><input className="input-dark" type="text" value={data.targetActifs} onChange={(e) => update({ targetActifs: e.target.value })} placeholder="ex. 200000" /></div>
              <div><label>Cible revenu passif (€)</label><input className="input-dark" type="text" value={data.targetPassif} onChange={(e) => update({ targetPassif: e.target.value })} placeholder="ex. 80000" /></div>
            </div>
            <div className="portfolio-single-field">
              <label>Cible fonds disponibles — ventes (€)</label>
              <input className="input-dark" type="text" value={data.targetDispo} onChange={(e) => update({ targetDispo: e.target.value })} placeholder="ex. 50000" />
            </div>
            <label className="field-label">Note</label>
            <textarea className="input-dark portfolio-note" rows="2" value={data.note} onChange={(e) => update({ note: e.target.value })} placeholder="Rappel : ce que tu inclus ou exclus de ce chiffre…" />
            <div className="toolbar">
              <button className="btn" type="button" onClick={handleSaveObjective} disabled={saveStatus === 'saving'}>Enregistrer l’objectif</button>
              <button className="btn btn-ghost" type="button" onClick={() => setSaveStatus('refreshed')}>Rafraîchir les totaux</button>
            </div>
            {saveStatus ? <p className="form-message">{saveStatus === 'saving' ? 'Sauvegarde...' : saveStatus === 'saved' ? 'Objectif enregistré.' : saveStatus === 'refreshed' ? 'Totaux rafraîchis.' : 'Erreur de sauvegarde.'}</p> : null}
          </div>

          <div className="card portfolio-card">
            <h2>Progression vers l’objectif</h2>
            <div className="stats-row portfolio-stats">
              <div className="stat-box"><div className="v">{formatEuro(positionsValue)}</div><div className="l">Patrimoine positions (€)</div></div>
              <div className="stat-box"><div className="v pos">+{formatEuro(tradingNetValue)}</div><div className="l">Trading — résultat net (€)</div></div>
              <div className="stat-box"><div className="v">{formatEuro(totalValue)}</div><div className="l">Total consolidé (€)</div></div>
              <div className="stat-box"><div className="v">{progressValue}%</div><div className="l">% de l’objectif</div></div>
            </div>
            <div className="progress-wrap">
              <div className="progress-bar"><div className="fill" style={{ width: `${progressValue}%` }} /></div>
              <div className="progress-meta"><span>Saisis un objectif &gt; 0 pour voir la barre.</span><span><strong>{progressValue}%</strong></span></div>
            </div>
            <h3 style={{ fontFamily: 'Cinzel, serif', fontSize: '0.72rem', letterSpacing: '0.1em', color: 'var(--gold)', textTransform: 'uppercase', margin: '1.75rem 0 0.85rem' }}>Elite Invest — trois axes</h3>
            <p className="hint" style={{ marginBottom: '1.1rem' }}>
              <strong>Actifs</strong> et <strong>revenu passif</strong> : somme des valeurs des positions <strong>ouvertes</strong> (sans date de vente), selon la colonne « Synthèse » dans Elite Invest.
              <strong>Fonds disponibles</strong> : uniquement les encaissements des lignes <strong>vendues</strong> → prix de vente × quantité.
            </p>
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
            <p className="hint">Données lues depuis <code style={{ fontSize: '0.7rem' }}>eliteInvest_v1</code> et <code style={{ fontSize: '0.7rem' }}>eliteTracker_v2</code>. Va dans Elite Invest pour les positions et dans Elite Tracker pour les trades — cette page se met à jour au rafraîchissement.</p>
          </div>

          <div className="card portfolio-card">
            <h2>Dernière simu immo (Elite Invest)</h2>
            <p className="hint" style={{ marginTop: 0 }}>Retrouve ici le dernier calcul immobilier utilisé dans Elite Invest pour garder une vue rapide avant comparaison avec ton objectif global.</p>
            <a href="/invest" style={{ color: 'var(--gold-bright)', fontSize: '0.85rem', fontWeight: 600 }}>Ouvrir Rentabilité immo →</a>
          </div>

          <div className="grid-2">
            <div className="card portfolio-card">
              <h2>Trading — gains &amp; pertes</h2>
              <div className="stats-row">
                <div className="stat-box"><div className="v pos">+{formatEuro(tradingNetValue)}</div><div className="l">Gains (Σ trades +)</div></div>
                <div className="stat-box"><div className="v neg">—</div><div className="l">Pertes (Σ trades −)</div></div>
                <div className="stat-box"><div className="v">—</div><div className="l">Trades</div></div>
              </div>
              <p className="hint"><a href="/tracker" style={{ color: 'var(--gold-bright)' }}>Ouvrir Elite Tracker →</a></p>
            </div>
            <div className="card portfolio-card">
              <h2>Investissement — patrimoine</h2>
              <div className="stats-row">
                <div className="stat-box"><div className="v">{formatEuro(positionsValue)}</div><div className="l">Lignes de positions</div></div>
              </div>
              <p className="hint"><a href="/invest" style={{ color: 'var(--gold-bright)' }}>Ouvrir Elite Invest →</a></p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
