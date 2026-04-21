"use client";

import Link from 'next/link';
import { canAccess, getSubscriptionLabel } from '@/lib/plans';
import { useAccountPayload } from '@/lib/use-account-payload';
import { useLocale } from '@/lib/locale';

const NAV = [
  ['cover', 'cover'],
  ['overview', 'overview'],
  ['journal', 'journal'],
  ['trades', 'trades'],
  ['stats', 'stats'],
  ['psych', 'psych'],
  ['report', 'report'],
];

export default function TrackerHub({ userEmail = '', planCode = 'starter', subscription = null }) {
  const [data, setData] = useAccountPayload('trackerHub_v1', {
    page: 'cover',
    profile: 'default',
    journalTitle: '',
    journalBody: '',
  });

  const page = data.page || 'cover';
  const subscriptionLabel = getSubscriptionLabel(subscription, planCode);
  const { t } = useLocale();

  const update = (patch) => setData((prev) => ({ ...prev, ...patch }));

  return (
    <div className="mindset-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="tag">{t('app.trading')}</div>
          <Link href="/dashboard" className="brand-link"><h1>Elite Tracker</h1></Link>
          <p>{t('tracker.subtitle')}</p>
          <p className="app-plan">{t('app.subscription')} : {subscriptionLabel}</p>
        </div>

        <nav className="sidebar-apps" aria-label="Navigation site">
          <div className="sidebar-apps-label">{t('mindset.spaces')}</div>
          <Link href="/mindset" className="app-link">{t('app.dashboardLink')}</Link>
          <Link href="/tracker" className="app-link is-current">{t('app.trading')}</Link>
          <Link href="/mindset" className="app-link">{t('app.mindset')}</Link>
          {canAccess(planCode, 'invest') ? <Link href="/invest" className="app-link">{t('app.invest')}</Link> : null}
          {canAccess(planCode, 'portfolio') ? <Link href="/portfolio" className="app-link">{t('app.portfolio')}</Link> : null}
        </nav>

        <div className="auth-user">
          <span style={{ wordBreak: 'break-all' }}>{userEmail}</span>
          <a href="/login?logout=1">{t('site.logout')}</a>
        </div>

        <div className="profile-bar">
          <label htmlFor="trk-profile">Profil</label>
          <select id="trk-profile" value={data.profile} onChange={(e) => update({ profile: e.target.value })}>
            <option value="default">Compte principal</option>
            <option value="alt">Compte secondaire</option>
          </select>
          <div className="btn-row">
            <button type="button" className="btn btn-ghost">+ Profil</button>
            <button type="button" className="btn btn-ghost">Renommer</button>
          </div>
        </div>

        <div className="sidebar-inner">
          {NAV.map(([key, label]) => (
            <button key={key} type="button" className={`nav-item ${page === key ? 'active' : ''}`} onClick={() => update({ page: key })}>
              {t(`tracker.nav.${label}`)}
            </button>
          ))}
        </div>
      </aside>

      <main className="main">
        <section className={`page ${page === 'cover' ? 'active' : ''}`}>
          <h1 className="page-title">{t('tracker.title')}</h1>
          <p className="page-hero">{t('tracker.subtitle')}</p>
          <div className="class-pills"><span>Session</span><span>Risque</span><span>R/R</span><span>Journal</span><span>Bilan</span></div>
          <div className="card">
            <h2>{t('tracker.workFrame')}</h2>
            <p className="hint">{t('tracker.workFrameText')}</p>
          </div>
        </section>

        <section className={`page ${page === 'overview' ? 'active' : ''}`}>
          <h1 className="page-title">{t('tracker.overview')}</h1>
          <p className="page-sub">{t('tracker.weeklySummary')}</p>
          <div className="stats-row">
            <div className="stat-box"><div className="v">12</div><div className="l">Trades</div></div>
            <div className="stat-box"><div className="v">58%</div><div className="l">Win rate</div></div>
            <div className="stat-box"><div className="v">2.1</div><div className="l">R/R moyen</div></div>
            <div className="stat-box"><div className="v pos">+4.8%</div><div className="l">Semaine</div></div>
          </div>
          <div className="grid-2">
            <article className="card"><h2>{t('tracker.planExecution')}</h2><p className="hint">Avant d’entrer : contexte, setup, niveau, invalidation. Après : note ce qui a été respecté ou non.</p></article>
            <article className="card"><h2>{t('tracker.rules')}</h2><p className="hint">Pas de sur-trading, taille fixe, stop défini, et revue systématique après clôture.</p></article>
          </div>
        </section>

        <section className={`page ${page === 'journal' ? 'active' : ''}`}>
          <h1 className="page-title">{t('tracker.journal')}</h1>
          <p className="page-sub">{t('tracker.journalSub')}</p>
          <div className="card">
            <h2>{t('tracker.newNote')}</h2>
            <label>{t('tracker.summary')}</label>
            <input className="input-dark" type="text" value={data.journalTitle} onChange={(e) => update({ journalTitle: e.target.value })} placeholder="Ex. Patience sur EURUSD, pas d'entrée impulsive" />
            <label>{t('tracker.details')}</label>
            <textarea className="input-dark" rows="4" value={data.journalBody} onChange={(e) => update({ journalBody: e.target.value })} placeholder="Ce que j’ai vu, ressenti, corrigé…" />
            <button className="btn" type="button">{t('tracker.save')}</button>
          </div>
        </section>

        <section className={`page ${page === 'trades' ? 'active' : ''}`}>
          <h1 className="page-title">{t('tracker.trades')}</h1>
          <p className="page-sub">{t('tracker.tradesSub')}</p>
          <div className="card table-wrap">
            <table className="data">
              <thead><tr><th>Date</th><th>Actif</th><th>Setup</th><th className="num">Résultat</th></tr></thead>
              <tbody>
                <tr><td>04/04</td><td>BTC</td><td>Breakout</td><td className="num">+2.4R</td></tr>
                <tr><td>03/04</td><td>NAS100</td><td>Rejet</td><td className="num">-1.0R</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className={`page ${page === 'stats' ? 'active' : ''}`}>
          <h1 className="page-title">{t('tracker.stats')}</h1>
          <p className="page-sub">{t('tracker.statsSub')}</p>
          <div className="grid-3">
            <div className="card"><h2>Profit factor</h2><div className="stat"><strong>1.9</strong></div></div>
            <div className="card"><h2>Top setup</h2><div className="stat"><strong>Breakout</strong></div></div>
            <div className="card"><h2>Erreurs</h2><div className="stat"><strong>2</strong></div></div>
          </div>
        </section>

        <section className={`page ${page === 'psych' ? 'active' : ''}`}>
          <h1 className="page-title">{t('tracker.psych')}</h1>
          <p className="page-sub">{t('tracker.psychSub')}</p>
          <div className="grid-2">
            <article className="card"><h2>{t('tracker.tips')}</h2><p className="hint">Routine, sommeil, taille fixe, revue à froid.</p></article>
            <article className="card"><h2>{t('tracker.costs')}</h2><p className="hint">Entrées tardives, pression de résultat, manque de plan clair.</p></article>
          </div>
        </section>

        <section className={`page ${page === 'report' ? 'active' : ''}`}>
          <h1 className="page-title">{t('tracker.report')}</h1>
          <p className="page-sub">{t('tracker.reportSub')}</p>
          <div className="card">
            <h2>{t('tracker.recap')}</h2>
            <p className="hint">Semaine positive, discipline en hausse, un seul point à corriger : mieux cadrer les entrées de fin de session.</p>
          </div>
        </section>
      </main>
    </div>
  );
}
