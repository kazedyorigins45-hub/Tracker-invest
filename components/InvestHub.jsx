"use client";

import { useState } from 'react';
import Link from 'next/link';
import { canAccess, getSubscriptionLabel } from '@/lib/plans';
import { useAccountPayload } from '@/lib/use-account-payload';
import { useLocale } from '@/lib/locale';

const NAV = [
  ['cover', 'cover'],
  ['overview', 'overview'],
  ['classes', 'classes'],
  ['holdings', 'holdings'],
  ['immo', 'immo'],
  ['goals', 'goals'],
  ['monthly', 'monthly'],
];

export default function InvestHub({ userEmail = '', planCode = 'starter', subscription = null }) {
  const [data, setData] = useAccountPayload('investHub_v1', {
    page: 'cover',
    profile: 'Patrimoine principal',
    name: '',
    horizon: '',
    vision: '',
  });

  const page = data.page || 'cover';
  const profile = data.profile || 'Patrimoine principal';
  const subscriptionLabel = getSubscriptionLabel(subscription, planCode);
  const { t } = useLocale();
  const update = (patch) => setData((prev) => ({ ...prev, ...patch }));

  return (
    <div className="mindset-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="tag">{t('app.invest')}</div>
          <Link href="/dashboard" className="brand-link"><h1>Elite Invest</h1></Link>
          <p>{t('invest.subtitle')}</p>
          <p className="app-plan">{t('app.subscription')} : {subscriptionLabel}</p>
        </div>

        <nav className="sidebar-apps" aria-label="Navigation site">
          <div className="sidebar-apps-label">{t('mindset.spaces')}</div>
          <Link href="/mindset" className="app-link">{t('app.dashboardLink')}</Link>
          <Link href="/mindset" className="app-link">{t('app.mindset')}</Link>
          {canAccess(planCode, 'tracker') ? <Link href="/tracker" className="app-link">{t('app.trading')}</Link> : null}
          <Link href="/invest" className="app-link is-current">{t('app.invest')}</Link>
          {canAccess(planCode, 'portfolio') ? <Link href="/portfolio" className="app-link">{t('app.portfolio')}</Link> : null}
        </nav>

        <div className="auth-user">
          <span style={{ wordBreak: 'break-all' }}>{userEmail}</span>
          <a href="/login?logout=1">{t('site.logout')}</a>
        </div>

        <div className="profile-bar">
          <label htmlFor="inv-profile-select">Portefeuille</label>
          <select id="inv-profile-select" value={profile} onChange={(e) => update({ profile: e.target.value })}>
            <option>Patrimoine principal</option>
            <option>PEA long terme</option>
            <option>Crypto</option>
          </select>
          <div className="btn-row">
            <button type="button" className="btn btn-ghost">+ Portefeuille</button>
            <button type="button" className="btn btn-ghost">Renommer</button>
          </div>
        </div>

        <div className="sidebar-inner">
          {NAV.map(([key, label]) => (
            <button key={key} type="button" className={`nav-item ${page === key ? 'active' : ''}`} onClick={() => update({ page: key })}>
              {t(`invest.nav.${label}`)}
            </button>
          ))}
        </div>
      </aside>

      <main className="main">
        <section className={`page ${page === 'cover' ? 'active' : ''}`}>
          <h1 className="page-title">{t('invest.title')}</h1>
          <p className="page-sub">{t('invest.subtitle')}</p>
          <div className="class-pills"><span>Crypto</span><span>Métaux précieux</span><span>Matières premières</span><span>Immobilier</span><span>ETF / Obligations</span><span>Autre</span></div>
          <div className="card">
            <h2>{t('invest.identity')}</h2>
            <div className="grid-2">
              <div><label>Nom / famille de portefeuille</label><input className="input-dark" type="text" value={data.name} onChange={(e) => update({ name: e.target.value })} placeholder={`ex. ${profile}`} /></div>
              <div><label>Horizon principal</label><input className="input-dark" type="text" value={data.horizon} onChange={(e) => update({ horizon: e.target.value })} placeholder="ex. 5–15 ans" /></div>
            </div>
            <label>Vision &amp; règles (DCA, pas de levier, etc.)</label>
            <textarea className="input-dark" rows="4" value={data.vision} onChange={(e) => update({ vision: e.target.value })} placeholder="Décris ton cadre d'investissement…" />
          </div>
        </section>

        <section className={`page ${page === 'overview' ? 'active' : ''}`}>
          <h1 className="page-title">{t('invest.overview')}</h1>
          <p className="page-sub">{t('invest.summary')}</p>
          <div className="stats-row">
            <div className="stat-box"><div className="v">125k€</div><div className="l">Valeur totale</div></div>
            <div className="stat-box"><div className="v pos">+14%</div><div className="l">Perf cumulée</div></div>
            <div className="stat-box"><div className="v">7</div><div className="l">Actifs</div></div>
            <div className="stat-box"><div className="v">5</div><div className="l">Années</div></div>
          </div>
          <div className="grid-2">
            <article className="card"><h2>{t('invest.strategy')}</h2><p className="hint">Conservation des convictions fortes, achats progressifs et exposition diversifiée.</p></article>
            <article className="card"><h2>{t('invest.reminder')}</h2><p className="hint">L’investissement long terme ne se pilote pas comme le trading court terme.</p></article>
          </div>
        </section>

        <section className={`page ${page === 'classes' ? 'active' : ''}`}>
          <h1 className="page-title">{t('invest.classes')}</h1>
          <p className="page-sub">Structure par catégories principales.</p>
          <div className="grid-3">
            <article className="card"><h2>Crypto</h2><p className="hint">Positions long terme, thèse et horizon.</p></article>
            <article className="card"><h2>Métaux</h2><p className="hint">Or et argent physique / papier.</p></article>
            <article className="card"><h2>Immobilier</h2><p className="hint">SCPI, locatif, rendement et cashflow.</p></article>
          </div>
        </section>

        <section className={`page ${page === 'holdings' ? 'active' : ''}`}>
          <h1 className="page-title">{t('invest.portfolio')}</h1>
          <p className="page-sub">{t('invest.portfolioSub')}</p>
          <div className="card table-wrap">
            <table className="data">
              <thead><tr><th>Actif</th><th>Quantité</th><th className="num">Prix moyen</th><th className="num">Valeur</th></tr></thead>
              <tbody>
                <tr><td>BTC</td><td>0.82</td><td className="num">42 000€</td><td className="num">34 400€</td></tr>
                <tr><td>Or</td><td>150g</td><td className="num">63€</td><td className="num">9 450€</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className={`page ${page === 'immo' ? 'active' : ''}`}>
          <h1 className="page-title">{t('invest.immo')}</h1>
          <p className="page-sub">{t('invest.immoSub')}</p>
          <div className="card immo-scen">
            <h3>{t('invest.scenario')}</h3>
            <div className="immo-mini-stats">
              <div><div className="k">Loyer</div><div className="v">1 200€</div></div>
              <div><div className="k">Mensualité</div><div className="v neg">-780€</div></div>
              <div><div className="k">Cashflow</div><div className="v pos">+110€</div></div>
              <div><div className="k">Rendement</div><div className="v">7.2%</div></div>
            </div>
          </div>
        </section>

        <section className={`page ${page === 'goals' ? 'active' : ''}`}>
          <h1 className="page-title">{t('invest.goals')}</h1>
          <p className="page-sub">{t('invest.goalsSub')}</p>
          <div className="grid-2">
            <article className="card"><h2>Objectif 1 an</h2><p className="hint">Renforcer la base et automatiser l'épargne.</p></article>
            <article className="card"><h2>Objectif 10 ans</h2><p className="hint">Capital suffisant pour la liberté financière progressive.</p></article>
          </div>
        </section>

        <section className={`page ${page === 'monthly' ? 'active' : ''}`}>
          <h1 className="page-title">{t('invest.monthly')}</h1>
          <p className="page-sub">{t('invest.monthlySub')}</p>
          <div className="card">
            <h2>Résumé</h2>
            <p className="hint">Achat progressif maintenu, allocation conservée, pas de vente impulsive.</p>
          </div>
        </section>
      </main>
    </div>
  );
}
