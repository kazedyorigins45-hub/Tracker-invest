"use client";

import React from 'react';
import Link from 'next/link';
import { canAccess, getSubscriptionLabel } from '@/lib/plans';
import { useAccountPayload } from '@/lib/use-account-payload';
import { useLocale } from '@/lib/locale';
import ThemeToggle from '@/components/ThemeToggle';
import LanguageToggle from '@/components/LanguageToggle';

const NAV = [
  ['cover', 'cover'],
  ['overview', 'overview'],
  ['classes', 'classes'],
  ['holdings', 'holdings'],
  ['immo', 'immo'],
  ['goals', 'goals'],
  ['monthly', 'monthly'],
  ['export', 'export'],
  ['memo', 'memo'],
  ['finance', 'finance'],
  ['project', 'project'],
];

const MANDATORY_DOCS = [
  'Diagnostics obligatoires',
  'DPE / audit énergétique',
  'Assurance PNO / loyers impayés',
  'Bail, état des lieux, inventaire',
  'Règlement de copro & PV AG',
  'Urbanisme / autorisation location',
  'Offre de prêt signée & assurance emprunteur',
];

function defaultInvestState() {
  return {
    page: 'cover',
    name: '',
    horizon: '',
    vision: '',
    memoDocs: {},
    holdings: [
      { className: 'crypto', synth: 'Actifs', asset: 'BTC', geckoId: 'bitcoin', quantity: '0.82', avgPrice: '42 000€', sellPrice: '', sellDate: '', saleResult: '', notes: '', value: '34 400€' },
      { className: 'metaux', synth: 'Actifs', asset: 'Or', geckoId: '', quantity: '150g', avgPrice: '63€', sellPrice: '', sellDate: '', saleResult: '', notes: '', value: '9 450€' },
    ],
    purchasePrice: '300000',
    acquisitionFeesPct: '3',
    workCost: '0',
    downPaymentPct: '20',
    loanRate: '4.2',
    loanYears: '30',
    annualCharges: '0',
    saleFeesPct: '0',
    rentalIncome: '1200',
    loanPayment: '780',
    monthlyCashflow: '110',
    profitability: '7.2',
    monthlyMonth: '',
    monthlyByMonth: {},
    monthlySummary: '',
    monthlyLesson: '',
    monthlyNext: '',
    projectName: '',
    projectOpportunities: 7,
    projectTechnology: 7,
    projectEcosystem: 7,
    projectRoadmap: 7,
    projectMarketing: 7,
    projectMomentum: 7,
    projectVerdict: '',
  };
}

function monthKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function defaultPortfolioState() {
  return {
    current: 'main',
    labels: {
      main: 'Patrimoine principal',
      pea: 'PEA long terme',
      crypto: 'Crypto',
    },
  };
}

function parseAmount(input) {
  const normalized = String(input ?? '')
    .replace(/\s+/g, '')
    .replace(/[^\d,.-]/g, '')
    .replace(',', '.');
  const value = Number.parseFloat(normalized);
  return Number.isFinite(value) ? value : 0;
}

function formatEuro(value) {
  if (!Number.isFinite(value)) return '';
  return `${Math.round(value).toLocaleString('fr-FR')}€`;
}

function computeHoldingValue(quantity, avgPrice) {
  const total = parseAmount(quantity) * parseAmount(avgPrice);
  return formatEuro(total);
}

export default function InvestHub({ userEmail = '', planCode = 'starter', subscription = null }) {
  const [portfolioState, setPortfolioState] = useAccountPayload('investHub_profiles_v1', defaultPortfolioState());
  const profile = portfolioState.current || 'main';
  const profileLabel = portfolioState.labels?.[profile] || (profile === 'pea' ? 'PEA long terme' : profile === 'crypto' ? 'Crypto' : 'Patrimoine principal');
  const [data, setData] = useAccountPayload(`investHub_v2_${profile}`, defaultInvestState());

  const page = data.page || 'cover';
  const subscriptionLabel = getSubscriptionLabel(subscription, planCode);
  const { t } = useLocale();
  const update = (patch) => setData((prev) => ({ ...prev, ...patch }));
  const updateProfile = (patch) => setPortfolioState((prev) => ({ ...prev, ...patch }));
  const projectScoreKeys = ['projectOpportunities', 'projectTechnology', 'projectEcosystem', 'projectRoadmap', 'projectMarketing', 'projectMomentum'];
  const projectScore = Math.round(projectScoreKeys.reduce((sum, key) => sum + Number(data[key] || 0), 0) / projectScoreKeys.length);
  const selectedMonth = data.monthlyMonth || monthKey();
  const monthlySnapshot = data.monthlyByMonth?.[selectedMonth] || { monthlySummary: '', monthlyLesson: '', monthlyNext: '' };
  const holdings = (Array.isArray(data.holdings) && data.holdings.length ? data.holdings : defaultInvestState().holdings).map((row) => ({
    ...row,
    computedValue: computeHoldingValue(row.quantity, row.avgPrice),
  }));

  const switchProfile = (nextProfile) => {
    updateProfile({ current: nextProfile });
  };

  const renameCurrentProfile = () => {
    if (typeof window === 'undefined') return;
    const currentLabel = portfolioState.labels?.[profile] || profileLabel;
    const nextLabel = window.prompt(t('invest.profileRename'), currentLabel);
    if (nextLabel === null) return;
    const trimmed = nextLabel.trim();
    if (!trimmed) return;
    updateProfile({ labels: { ...(portfolioState.labels || {}), [profile]: trimmed } });
  };

  const value = Number(data.purchasePrice || 0);
  const fees = value * (Number(data.acquisitionFeesPct || 0) / 100);
  const works = Number(data.workCost || 0);
  const equity = value * (Number(data.downPaymentPct || 0) / 100);
  const financed = Math.max(0, value + fees + works - equity);
  const annualIncome = Number(data.rentalIncome || 0) * 12;
  const annualCharges = Number(data.annualCharges || 0);
  const annualPayment = Number(data.loanPayment || 0) * 12;
  const annualCashflow = annualIncome - annualPayment - annualCharges;

  const toggleDoc = (doc) => update({ memoDocs: { ...(data.memoDocs || {}), [doc]: !data.memoDocs?.[doc] } });

  const updateHolding = (index, patch) => {
    const next = holdings.map((row, rowIndex) => (rowIndex === index ? { ...row, ...patch } : row));
    update({ holdings: next });
  };

  const addHolding = () => {
    update({ holdings: [...holdings, { className: 'autre', synth: 'Actifs', asset: '', geckoId: '', quantity: '', avgPrice: '', sellPrice: '', sellDate: '', saleResult: '', notes: '', value: '' }] });
  };

  const removeHolding = (index) => {
    update({ holdings: holdings.filter((_, rowIndex) => rowIndex !== index) });
  };

  const setMonthlyField = (key, value) => {
    setData((prev) => {
      const month = prev.monthlyMonth || monthKey();
      const bucket = prev.monthlyByMonth?.[month] || {};
      return { ...prev, monthlyMonth: month, monthlyByMonth: { ...(prev.monthlyByMonth || {}), [month]: { ...bucket, [key]: value } } };
    });
  };

  const [immoStressShow, setImmoStressShow] = React.useState(false);

  const exportRows = [
    ['Actif', 'Quantité', 'Prix moyen', 'Valeur'],
    ...holdings.map((row) => [row.asset || '', row.quantity || '', row.avgPrice || '', row.computedValue || '']),
  ];

  const copyTsv = async () => {
    const text = exportRows.map((row) => row.join('\t')).join('\n');
    try { await navigator.clipboard.writeText(text); } catch {}
  };

  const downloadCsv = () => {
    const csv = '\uFEFF' + exportRows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(';')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'invest-portfolio.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mindset-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="tag">{t('app.invest')}</div>
          <Link href="/dashboard" className="brand-link"><h1>Elite Invest</h1></Link>
          <p className="invest-quote">{t('invest.subtitle')}</p>
          <p className="app-plan">{t('app.subscription')} : {subscriptionLabel}</p>
        </div>

        <nav className="sidebar-apps" aria-label="Navigation site">
          <div className="sidebar-apps-label">{t('mindset.spaces')}</div>
          <Link href="/mindset" className="app-link">{t('app.dashboardLink')}</Link>
          {canAccess(planCode, 'tracker') ? <Link href="/tracker" className="app-link">{t('app.trading')}</Link> : null}
          <Link href="/mindset" className="app-link">{t('app.mindset')}</Link>
          <Link href="/invest" className="app-link is-current">{t('app.invest')}</Link>
          {canAccess(planCode, 'portfolio') ? <Link href="/portfolio" className="app-link">{t('app.portfolio')}</Link> : null}
        </nav>

        <div className="profile-bar">
          <label htmlFor="inv-profile-select">{t('invest.profileLabel')}</label>
          <select id="inv-profile-select" value={profile} onChange={(e) => switchProfile(e.target.value)}>
            <option value="main">{portfolioState.labels?.main || t('invest.profileMain')}</option>
            <option value="pea">{portfolioState.labels?.pea || t('invest.profilePea')}</option>
            <option value="crypto">{portfolioState.labels?.crypto || t('invest.profileCrypto')}</option>
          </select>
          <p className="profile-hint">{t('invest.profileHint')}</p>
          <div className="btn-row">
            <button type="button" className="btn btn-ghost" onClick={() => switchProfile(profile === 'main' ? 'pea' : profile === 'pea' ? 'crypto' : 'main')}>{t('invest.profileAdd')}</button>
            <button type="button" className="btn btn-ghost" onClick={renameCurrentProfile}>{t('invest.profileRename')}</button>
          </div>
        </div>

        <div className="sidebar-inner">
          {NAV.map(([key, label]) => (
            <button key={key} type="button" className={`nav-item ${page === key ? 'active' : ''}`} onClick={() => update({ page: key })}>
              {t(`invest.nav.${label}`)}
            </button>
          ))}
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
          <ThemeToggle className="theme-toggle--app" />
          <LanguageToggle className="theme-toggle--app" />
        </div>
        <section className={`page ${page === 'cover' ? 'active' : ''}`}>
          <h1 className="page-title">{t('invest.title')}</h1>
          <p className="page-sub invest-quote">{t('invest.subtitle')}</p>
          <div className="class-pills"><span>Crypto</span><span>Métaux précieux</span><span>Matières premières</span><span>Immobilier</span><span>Obligations / ETF</span><span>Autre</span></div>
          <div className="card">
            <h2>{t('invest.identity')}</h2>
            <div className="grid-2">
              <div className="field-block"><label>Nom / famille de portefeuille</label><input className="input-dark invest-short-input" type="text" value={data.name} onChange={(e) => update({ name: e.target.value })} placeholder={`ex. ${profileLabel}`} /></div>
              <div className="field-block"><label>Horizon principal</label><input className="input-dark invest-medium-input" type="text" value={data.horizon} onChange={(e) => update({ horizon: e.target.value })} placeholder="ex. 5–15 ans" /></div>
            </div>
            <label className="field-label">Vision &amp; règles (DCA, pas de levier, etc.)</label>
            <textarea className="input-dark invest-vision-textarea" rows="4" value={data.vision} onChange={(e) => update({ vision: e.target.value })} placeholder="Décris ton cadre d'investissement…" />
          </div>
        </section>

        <section className={`page ${page === 'overview' ? 'active' : ''}`}>
          <h1 className="page-title">{t('invest.overview')}</h1>
          <p className="page-sub">Répartition par classe d'actifs (valeurs estimées en €).</p>
          <div className="stats-row">
            <div className="stat-box"><div className="v">125k€</div><div className="l">Valeur totale</div></div>
            <div className="stat-box"><div className="v pos">+14%</div><div className="l">Perf cumulée</div></div>
            <div className="stat-box"><div className="v">7</div><div className="l">Actifs</div></div>
            <div className="stat-box"><div className="v">5</div><div className="l">Années</div></div>
          </div>
          <div className="grid-2">
            <article className="card"><h2>Répartition</h2><p className="hint">Vue synthétique de l'allocation par classe d'actifs.</p></article>
            <article className="card"><h2>{t('invest.reminder')}</h2><p className="hint">L’investissement long terme ne se pilote pas comme le trading court terme.</p></article>
          </div>
        </section>

        <section className={`page ${page === 'classes' ? 'active' : ''}`}>
          <h1 className="page-title">{t('invest.classes')}</h1>
          <p className="page-sub">Rappel : une même classe peut contenir plusieurs lignes dans « Mes positions ».</p>
          <div className="card">
            <h2>Univers couverts</h2>
            <ul style={{ margin: 0, paddingLeft: '1.2rem', lineHeight: 1.8, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              <li><strong style={{ color: 'var(--gold-bright)' }}>Crypto</strong> — détention longue, staking, cold wallet…</li>
              <li><strong style={{ color: 'var(--gold-bright)' }}>Métaux précieux</strong> — or, argent, lingots, pièces</li>
              <li><strong style={{ color: 'var(--gold-bright)' }}>Matières premières</strong> — via ETF, contrats, ou produits dérivés <em>en prudence</em></li>
              <li><strong style={{ color: 'var(--gold-bright)' }}>Immobilier</strong> — SCPI, pierre directe, crowdfunding</li>
              <li><strong style={{ color: 'var(--gold-bright)' }}>Obligations / monétaire</strong> — fonds euros, obligations d'État</li>
              <li><strong style={{ color: 'var(--gold-bright)' }}>Actions / ETF</strong> — buy &amp; hold hors spéculation court terme</li>
              <li><strong style={{ color: 'var(--gold-bright)' }}>Autre</strong> — art, collectibles, private equity…</li>
            </ul>
          </div>
        </section>

        <section className={`page ${page === 'holdings' ? 'active' : ''}`}>
          <h1 className="page-title">{t('invest.portfolio')}</h1>
          <p className="page-sub">Une ligne par ligne d'actif. <strong>Valeur estimée</strong> = position ouverte. Pour les <strong>cryptos</strong>, renseigne l'<strong>ID CoinGecko</strong> + la <strong>qté</strong> et ton <strong>prix d'achat €/u</strong> : au moment de la vente, clique <strong>Cours</strong> à côté du prix de vente pour <strong>remplir automatiquement le prix de vente</strong> au cours actuel, puis indique la <strong>date de vente</strong> pour clôturer la ligne. Le bouton <strong>Actualiser les cours</strong> met surtout à jour la colonne <strong>Valeur €</strong> des positions encore détenues.</p>
          <datalist id="inv-gecko-presets">
            <option value="bitcoin" /><option value="ethereum" /><option value="solana" /><option value="cardano" />
            <option value="ripple" /><option value="dogecoin" /><option value="polkadot" /><option value="avalanche-2" />
            <option value="matic-network" /><option value="chainlink" /><option value="wrapped-bitcoin" />
          </datalist>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center', marginBottom: '1rem' }}>
            <button type="button" className="btn" onClick={addHolding} style={{ marginBottom: 0, fontSize: '0.85rem' }}>+ Ajouter une position</button>
            <button type="button" className="btn btn-ghost" onClick={() => {}} style={{ fontSize: '0.85rem' }}>Actualiser les cours (CoinGecko)</button>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }} />
          </div>
          <div className="card table-wrap">
            <table className="data">
              <thead>
                <tr>
                  <th>Classe</th><th>Synthèse « Mes invest. »</th><th>Libellé</th><th>ID CoinGecko</th><th className="num">Valeur €</th><th>Qté</th><th>Prix achat €/u</th><th>Prix vente €/u</th><th>Date vente</th><th>Rés. vente €</th><th>Notes</th><th></th>
                </tr>
              </thead>
              <tbody>
                {holdings.map((row, index) => (
                  <tr key={`${row.asset || 'row'}-${index}`}>
                    <td><input className="input-dark invest-holding-input" type="text" value={row.className || ''} onChange={(e) => updateHolding(index, { className: e.target.value })} placeholder="crypto" /></td>
                    <td><input className="input-dark invest-holding-input" type="text" value={row.synth || ''} onChange={(e) => updateHolding(index, { synth: e.target.value })} placeholder="Actifs" /></td>
                    <td><input className="input-dark invest-holding-input" type="text" value={row.asset} onChange={(e) => updateHolding(index, { asset: e.target.value })} placeholder="Ex. BTC" /></td>
                    <td><input className="input-dark invest-holding-input" list="inv-gecko-presets" type="text" value={row.geckoId || ''} onChange={(e) => updateHolding(index, { geckoId: e.target.value })} placeholder="bitcoin" /></td>
                    <td className="num"><input className="input-dark invest-holding-input invest-holding-input--num" type="text" value={row.computedValue} readOnly placeholder="Ex. 34 400€" /></td>
                    <td><input className="input-dark invest-holding-input" type="text" value={row.quantity} onChange={(e) => updateHolding(index, { quantity: e.target.value })} placeholder="Ex. 0.82" /></td>
                    <td><input className="input-dark invest-holding-input invest-holding-input--num" type="text" value={row.avgPrice} onChange={(e) => updateHolding(index, { avgPrice: e.target.value })} placeholder="Ex. 42 000€" /></td>
                    <td><input className="input-dark invest-holding-input invest-holding-input--num" type="text" value={row.sellPrice || ''} onChange={(e) => updateHolding(index, { sellPrice: e.target.value })} placeholder="Prix de vente" /></td>
                    <td><input className="input-dark invest-holding-input" type="date" value={row.sellDate || ''} onChange={(e) => updateHolding(index, { sellDate: e.target.value })} /></td>
                    <td><input className="input-dark invest-holding-input invest-holding-input--num" type="text" value={row.saleResult || ''} onChange={(e) => updateHolding(index, { saleResult: e.target.value })} placeholder="Résultat" /></td>
                    <td><input className="input-dark invest-holding-input" type="text" value={row.notes || ''} onChange={(e) => updateHolding(index, { notes: e.target.value })} placeholder="Notes" /></td>
                    <td style={{ width: '1%' }}><button type="button" className="btn btn-ghost" onClick={() => removeHolding(index)}>✕</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="toolbar" style={{ marginTop: '1rem' }}>
              <button type="button" className="btn btn-gold" onClick={addHolding}>+ Ajouter une ligne</button>
            </div>
          </div>
        </section>

        <section className={`page ${page === 'immo' ? 'active' : ''}`}>
          <h1 className="page-title">{t('invest.immo')}</h1>
          <p className="page-sub">Outil de <strong>comparaison indicatif</strong> : plusieurs <strong>fiches bien</strong> (jusqu'à 3), liaison optionnelle avec une position <strong>Immobilier</strong>, stress-tests, indexation des loyers, seuils d'alerte, PV simplifiée, export et mémo projet. Rien de juridique ou fiscal certifié.</p>
          <div className="card">
            <h2>Fiches bien (max. 3)</h2>
            <div className="immo-tool-row">
              <div style={{ flex: 1, minWidth: '12rem' }}>
                <label htmlFor="immo-select-fiche">Fiche active</label>
                <select id="immo-select-fiche" className="input-dark" />
              </div>
              <button type="button" className="btn btn-ghost">Renommer</button>
              <button type="button" className="btn btn-ghost">Dupliquer</button>
              <button type="button" className="btn">+ Fiche</button>
            </div>
            <p className="hint" style={{ marginTop: 0 }}>Chaque fiche mémorise ses propres champs et sa checklist. Change de fiche avant une autre simulation pour comparer ensuite dans le tableau multi-biens.</p>
          </div>

          <div className="card">
            <h2>Lier une position Elite Invest</h2>
            <label htmlFor="immo-link-holding">Préremplir depuis « Mes positions » (classe Immobilier)</label>
            <select id="immo-link-holding" className="input-dark">
              <option value="">— Aucune liaison</option>
            </select>
            <p className="hint">Utilise la <strong>valeur estimée</strong> de la ligne comme prix FAI indicatif. Tu peux ajuster après.</p>
          </div>

          <div className="card">
            <h2>Stress-test (indicatif)</h2>
            <div className="grid-2">
              <div>
                <label htmlFor="immo-stress-taux">Δ Taux crédit (points, ex. +0,5)</label>
                <input type="text" id="immo-stress-taux" className="input-dark" placeholder="0" />
              </div>
              <div>
                <label htmlFor="immo-stress-vac">Δ Vacance locative (points, ex. +5)</label>
                <input type="text" id="immo-stress-vac" className="input-dark" placeholder="0" />
              </div>
              <div>
                <label htmlFor="immo-stress-revente">Δ Prix de revente cumulé (%)</label>
                <input type="text" id="immo-stress-revente" className="input-dark" placeholder="0 ex. -10" />
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem', paddingBottom: '0.75rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                  <input type="checkbox" id="immo-stress-show" style={{ width: 'auto', margin: 0 }} />
                  Afficher les lignes « stress » dans le tableau
                </label>
              </div>
            </div>
          </div>

          <div className="card">
            <h2>Alertes &amp; objectifs locatifs</h2>
            <div className="grid-2">
              <div>
                <label htmlFor="immo-alert-cfmin">CF net minimum (€/an) — alerte si en dessous</label>
                <input type="text" id="immo-alert-cfmin" className="input-dark" placeholder="ex. 0" />
              </div>
              <div>
                <label htmlFor="immo-alert-rnet">Rendement net / apport minimum (%)</label>
                <input type="text" id="immo-alert-rnet" className="input-dark" placeholder="ex. 3" />
              </div>
              <div>
                <label htmlFor="immo-alert-mens">Mensualité max (% du loyer ref. loc. longue)</label>
                <input type="text" id="immo-alert-mens" className="input-dark" placeholder="ex. 80 — 0 = ignorer" />
              </div>
            </div>
          </div>

          <div className="card">
            <h2>Indexation des loyers (projection)</h2>
            <div className="grid-2">
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem', paddingBottom: '0.75rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                  <input type="checkbox" id="immo-idx-on" style={{ width: 'auto', margin: 0 }} />
                  Activer la projection
                </label>
              </div>
              <div>
                <label htmlFor="immo-idx-pct">Hausse moyenne annuelle (% type IRL / ILAT)</label>
                <input type="text" id="immo-idx-pct" className="input-dark" placeholder="ex. 1,5" />
              </div>
              <div>
                <label htmlFor="immo-idx-years">Horizon (ans)</label>
                <input type="text" id="immo-idx-years" className="input-dark" placeholder="ex. 10" />
              </div>
            </div>
            <p className="hint" id="immo-idx-out"></p>
          </div>

          <div className="card">
            <h2>Plus-value à la revente (très simplifié)</h2>
            <p className="hint" style={{ marginTop: 0 }}>Base approximative : prix de revente <strong>hors frais de vente</strong> - (prix d'achat + travaux initiaux). Aucun barème légal 22 ans, etc.</p>
            <div className="grid-2">
              <div>
                <label htmlFor="immo-pv-taux">Prélèvements sur PV estimée (%)</label>
                <input type="text" id="immo-pv-taux" className="input-dark" placeholder="0 = ignorer — ex. 36,2" />
              </div>
              <div>
                <label htmlFor="immo-pv-abatt">Abattement forfaitaire sur la PV brute (%)</label>
                <input type="text" id="immo-pv-abatt" className="input-dark" placeholder="ex. 0" />
              </div>
            </div>
          </div>

          <div className="card">
            <h2>Export</h2>
            <div className="immo-tool-row">
              <button type="button" className="btn">Copier le tableau (TSV)</button>
              <button type="button" className="btn btn-ghost">Télécharger CSV</button>
            </div>
          </div>

          <div className="card">
            <h2>Assistant dossier (mémo)</h2>
            <div className="immo-check-grid">
              {MANDATORY_DOCS.map((doc) => (
                <label key={doc} className="memo-check"><input type="checkbox" /><span>{doc}</span></label>
              ))}
            </div>
            <p className="hint">à cocher selon ton projet ; sauvegardé avec la <strong>fiche</strong> active.</p>
          </div>

          <div className="card">
            <h2>Données du bien &amp; financement</h2>
            <div className="grid-2">
              <div>
                <label htmlFor="immo-prix">Prix d'achat FAI (€)</label>
                <input type="text" id="immo-prix" className="input-dark immo-persist" placeholder="ex. 280000" />
              </div>
              <div>
                <label htmlFor="immo-frais-pct">Frais d'acquisition (% du prix)</label>
                <input type="text" id="immo-frais-pct" className="input-dark immo-persist" placeholder="ex. 8" />
              </div>
              <div>
                <label htmlFor="immo-travaux">Travaux initiaux (€)</label>
                <input type="text" id="immo-travaux" className="input-dark immo-persist" placeholder="ex. 15000" />
              </div>
              <div>
                <label htmlFor="immo-ltv">Financement : % emprunté sur total projet</label>
                <input type="text" id="immo-ltv" className="input-dark immo-persist" placeholder="ex. 80 — 0 = tout comptant" />
              </div>
              <div>
                <label htmlFor="immo-taux">Taux crédit annuel nominal (%)</label>
                <input type="text" id="immo-taux" className="input-dark immo-persist" placeholder="ex. 3,5" />
              </div>
              <div>
                <label htmlFor="immo-duree">Durée du prêt (ans)</label>
                <input type="text" id="immo-duree" className="input-dark immo-persist" placeholder="ex. 20" />
              </div>
              <div>
                <label htmlFor="immo-charges">Charges annuelles (taxe foncière, copro, assurance bien…)</label>
                <input type="text" id="immo-charges" className="input-dark immo-persist" placeholder="ex. 2400" />
              </div>
              <div>
                <label htmlFor="immo-frais-vente">Frais de vente estimés (% du prix revente)</label>
                <input type="text" id="immo-frais-vente" className="input-dark immo-persist" placeholder="ex. 7" />
              </div>
              <div>
                <label htmlFor="immo-tmi">TMI indicative (%) — impôt sur revenus locatifs</label>
                <input type="text" id="immo-tmi" className="input-dark immo-persist" placeholder="ex. 30 — 0 pour ignorer" />
              </div>
              <div>
                <label htmlFor="immo-abatt">Abattement forfaitaire (%) pour base imposable simplifiée</label>
                <input type="text" id="immo-abatt" className="input-dark immo-persist" placeholder="ex. 30 (nu) ou 50 (meublé micro-BIC)" />
              </div>
            </div>
            <p className="hint" id="immo-base-recap"></p>
          </div>

          <div className="grid-2">
            <div className="card immo-scen">
              <h3>Location longue durée</h3>
              <label htmlFor="immo-s1-loyer">Loyer mensuel encaissé (€)</label>
              <input type="text" id="immo-s1-loyer" className="input-dark immo-persist" placeholder="ex. 950" />
              <label htmlFor="immo-s1-vac">Vacance locative (% du temps)</label>
              <input type="text" id="immo-s1-vac" className="input-dark immo-persist" placeholder="ex. 8" />
              <div className="immo-scen-out" id="immo-out-s1"></div>
            </div>
            <div className="card immo-scen">
              <h3>Colocation</h3>
              <label htmlFor="immo-s2-nb">Nombre de chambres louées</label>
              <input type="text" id="immo-s2-nb" className="input-dark immo-persist" placeholder="ex. 3" />
              <label htmlFor="immo-s2-loyer">Loyer par chambre / mois (€)</label>
              <input type="text" id="immo-s2-loyer" className="input-dark immo-persist" placeholder="ex. 420" />
              <label htmlFor="immo-s2-vac">Vacance (%)</label>
              <input type="text" id="immo-s2-vac" className="input-dark immo-persist" placeholder="ex. 10" />
              <div className="immo-scen-out" id="immo-out-s2"></div>
            </div>
            <div className="card immo-scen">
              <h3>Location à la nuitée (courte durée)</h3>
              <label htmlFor="immo-s3-nuits">Nuitées louées en moyenne / mois</label>
              <input type="text" id="immo-s3-nuits" className="input-dark immo-persist" placeholder="ex. 18" />
              <label htmlFor="immo-s3-prix">Prix moyen / nuit (€)</label>
              <input type="text" id="immo-s3-prix" className="input-dark immo-persist" placeholder="ex. 85" />
              <label htmlFor="immo-s3-com">Commissions plateforme &amp; ménage (% du CA)</label>
              <input type="text" id="immo-s3-com" className="input-dark immo-persist" placeholder="ex. 35" />
              <div className="immo-scen-out" id="immo-out-s3"></div>
              <p className="hint">à rapprocher des seuils et règles locales (autorisations, résidence principale, Meublé tourisme…).</p>
            </div>
            <div className="card immo-scen">
              <h3>Sous-location</h3>
              <label htmlFor="immo-s4-pay">Loyer payé au bailleur / mois (€)</label>
              <input type="text" id="immo-s4-pay" className="input-dark immo-persist" placeholder="ex. 800" />
              <label htmlFor="immo-s4-rec">Loyer encaissé / mois (€)</label>
              <input type="text" id="immo-s4-rec" className="input-dark immo-persist" placeholder="ex. 1200" />
              <div className="immo-scen-out" id="immo-out-s4"></div>
              <p className="hint">Souvent soumis au <strong>consentement du bailleur</strong> et au droit au bail — usage à vérifier.</p>
            </div>
            <div className="card immo-scen">
              <h3>Achat → revente (patrimonial)</h3>
              <label htmlFor="immo-s5-ans">Détention (ans) avant revente</label>
              <input type="text" id="immo-s5-ans" className="input-dark immo-persist" placeholder="ex. 7" />
              <label htmlFor="immo-s5-revalo">Revalorisation annuelle du bien (%)</label>
              <input type="text" id="immo-s5-revalo" className="input-dark immo-persist" placeholder="ex. 2" />
              <label htmlFor="immo-s5-loyer">Loyer mensuel (€) — 0 si bien vide</label>
              <input type="text" id="immo-s5-loyer" className="input-dark immo-persist" placeholder="ex. 0 ou 900" />
              <label htmlFor="immo-s5-vac">Vacance (%)</label>
              <input type="text" id="immo-s5-vac" className="input-dark immo-persist" placeholder="ex. 5" />
              <div className="immo-scen-out" id="immo-out-s5"></div>
            </div>
            <div className="card immo-scen">
              <h3>Revente rapide (« flip »)</h3>
              <label htmlFor="immo-s6-mois">Durée avant vente (mois)</label>
              <input type="text" id="immo-s6-mois" className="input-dark immo-persist" placeholder="ex. 14" />
              <label htmlFor="immo-s6-plus">Plus-value à la revente (% sur prix d'achat)</label>
              <input type="text" id="immo-s6-plus" className="input-dark immo-persist" placeholder="ex. 12" />
              <div className="immo-scen-out" id="immo-out-s6"></div>
              <p className="hint">Sans loyer pendant la période : charges et crédit restent dus.</p>
            </div>
            <div className="card immo-scen">
              <h3>Achat → division / lots → revente</h3>
              <label htmlFor="immo-s7-travaux">Travaux de découp / lotissement (€)</label>
              <input type="text" id="immo-s7-travaux" className="input-dark immo-persist" placeholder="ex. 45000" />
              <label htmlFor="immo-s7-lots">Nombre de lots vendus</label>
              <input type="text" id="immo-s7-lots" className="input-dark immo-persist" placeholder="ex. 2" />
              <label htmlFor="immo-s7-prixlot">Prix de vente par lot (€)</label>
              <input type="text" id="immo-s7-prixlot" className="input-dark immo-persist" placeholder="ex. 195000" />
              <label htmlFor="immo-s7-delai">Délai avant vente (mois)</label>
              <input type="text" id="immo-s7-delai" className="input-dark immo-persist" placeholder="ex. 24" />
              <div className="immo-scen-out" id="immo-out-s7"></div>
              <p className="hint">Option, permis de diviser, copro : à modéliser en prolongeant le délai et les travaux.</p>
            </div>
            <div className="card immo-scen">
              <h3>Promesse / positionnement (cession future)</h3>
              <label htmlFor="immo-s8-prime">Indemnité ou dépôt de garantie versé (€)</label>
              <input type="text" id="immo-s8-prime" className="input-dark immo-persist" placeholder="ex. 5000" />
              <label htmlFor="immo-s8-prix">Prix d'exercice / cession envisagé (€)</label>
              <input type="text" id="immo-s8-prix" className="input-dark immo-persist" placeholder="ex. 260000" />
              <label htmlFor="immo-s8-mois">Durée avant décision (mois)</label>
              <input type="text" id="immo-s8-mois" className="input-dark immo-persist" placeholder="ex. 6" />
              <div className="immo-scen-out" id="immo-out-s8"></div>
              <p className="hint">Vue <strong>très simplifiée</strong> : compare le coût d'immobilisation du cash au rendement locatif ailleurs (pas de valorisation d'option réelle).</p>
            </div>
          </div>

          <div className="card">
            <h2>Tableau comparatif</h2>
            <p className="hint" style={{ marginTop: 0 }}>Classement indicatif selon le <strong>cash-flow annuel net</strong> (locations) ou le <strong>profit / an</strong> moyen (revente / division). La ligne surlignée = meilleur revenu annuel retenu.</p>
            <div style={{ overflowX: 'auto' }}>
              <table className="immo-compare">
                <thead>
                  <tr>
                    <th>Scénario</th>
                    <th className="num">Brut / an</th>
                    <th className="num">CF net / an</th>
                    <th className="num">R. brut</th>
                    <th className="num">R. net / apport</th>
                    <th>Remarque</th>
                  </tr>
                </thead>
                <tbody />
              </table>
            </div>
          </div>

          <div className="card">
            <h2>Vue multi-fiches</h2>
            <p className="hint" style={{ marginTop: 0 }}>Synthèse du <strong>meilleur scénario</strong> (score) pour chaque fiche enregistrée — utile pour comparer plusieurs biens sans les confondre.</p>
            <div style={{ overflowX: 'auto' }}>
              <table className="immo-compare immo-multi">
                <thead>
                  <tr>
                    <th>Fiche</th>
                    <th className="num">Prix ref.</th>
                    <th>Meilleur scénario</th>
                    <th className="num">Indic. / an</th>
                    <th className="num">R. net / apport</th>
                  </tr>
                </thead>
                <tbody />
              </table>
            </div>
          </div>
        </section>

        <section className={`page ${page === 'goals' ? 'active' : ''}`}>
          <h1 className="page-title">{t('invest.goals')}</h1>
          <p className="page-sub">Indépendamment du trading : retraite, patrimoine transmissible, indépendance…</p>
          <div className="grid-2">
            <div className="card">
              <h2>Objectif patrimonial</h2>
              <label htmlFor="inv-goal-target">Cible (€)</label>
              <input type="text" id="inv-goal-target" className="input-dark" placeholder="ex. 500 000" />
              <label htmlFor="inv-goal-why">Pourquoi</label>
              <textarea id="inv-goal-why" className="input-dark" rows="4" />
            </div>
            <div className="card">
              <h2>Échéances</h2>
              <label htmlFor="inv-goal-steps">Jalons (texte libre)</label>
              <textarea id="inv-goal-steps" className="input-dark" rows="6" />
            </div>
          </div>
        </section>

        <section className={`page ${page === 'monthly' ? 'active' : ''}`}>
          <h1 className="page-title">{t('invest.monthly')}</h1>
          <p className="page-sub">Synthèse qualitative — pas les trades intraday.</p>
          <div className="toolbar" style={{ marginBottom: '1rem' }}>
            <label htmlFor="inv-mo-month" style={{ display: 'inline-block', marginRight: '0.5rem' }}>Mois</label>
            <input type="month" id="inv-mo-month" className="input-dark" style={{ maxWidth: '12rem', display: 'inline-block' }} value={selectedMonth} onChange={(e) => update({ monthlyMonth: e.target.value })} />
          </div>
          <div className="card">
            <label htmlFor="inv-mo-sum">Mouvements du mois (apports, retraits, achats/ventes notables)</label>
            <textarea id="inv-mo-sum" rows="4" className="input-dark" value={monthlySnapshot.monthlySummary || ''} onChange={(e) => setMonthlyField('monthlySummary', e.target.value)} />
            <label htmlFor="inv-mo-lesson">Leçon ou observation</label>
            <textarea id="inv-mo-lesson" rows="3" className="input-dark" value={monthlySnapshot.monthlyLesson || ''} onChange={(e) => setMonthlyField('monthlyLesson', e.target.value)} />
            <label htmlFor="inv-mo-next">Focus mois suivant</label>
            <textarea id="inv-mo-next" rows="3" className="input-dark" value={monthlySnapshot.monthlyNext || ''} onChange={(e) => setMonthlyField('monthlyNext', e.target.value)} />
          </div>
        </section>

        <section className={`page ${page === 'export' ? 'active' : ''}`}>
          <h1 className="page-title">{t('invest.export')}</h1>
          <p className="page-sub">{t('invest.exportSub')}</p>
          <div className="card">
            <div className="toolbar">
              <button className="btn" type="button" onClick={copyTsv}>{t('invest.copyTsv')}</button>
              <button className="btn btn-ghost" type="button" onClick={downloadCsv}>{t('invest.downloadCsv')}</button>
            </div>
          </div>
        </section>

        <section className={`page ${page === 'memo' ? 'active' : ''}`}>
          <h1 className="page-title">{t('invest.memo')}</h1>
          <p className="page-sub">{t('invest.memoSub')}</p>
          <div className="card">
            <div className="grid-2 portfolio-grid-spaced">
              {MANDATORY_DOCS.map((doc) => (
                <label key={doc} className="memo-check">
                  <input type="checkbox" checked={!!data.memoDocs?.[doc]} onChange={() => toggleDoc(doc)} />
                  <span>{doc}</span>
                </label>
              ))}
            </div>
          </div>
        </section>

        <section className={`page ${page === 'finance' ? 'active' : ''}`}>
          <h1 className="page-title">{t('invest.finance')}</h1>
          <p className="page-sub">{t('invest.financeSub')}</p>
          <div className="card portfolio-card portfolio-card--large">
            <h2>{t('invest.financingOverview')}</h2>
            <div className="grid-2 portfolio-grid-spaced">
              <div className="field-block"><label>Prix d'achat FAI (€)</label><input className="input-dark invest-finance-input" type="number" value={data.purchasePrice} onChange={(e) => update({ purchasePrice: e.target.value })} /></div>
              <div className="field-block"><label>Frais d'acquisition (% du prix)</label><input className="input-dark invest-finance-input" type="number" value={data.acquisitionFeesPct} onChange={(e) => update({ acquisitionFeesPct: e.target.value })} /></div>
              <div className="field-block"><label>Travaux initiaux (€)</label><input className="input-dark invest-finance-input" type="number" value={data.workCost} onChange={(e) => update({ workCost: e.target.value })} /></div>
              <div className="field-block"><label>Financement : % emprunté sur total projet</label><input className="input-dark invest-finance-input" type="number" value={data.downPaymentPct} onChange={(e) => update({ downPaymentPct: e.target.value })} /></div>
              <div className="field-block"><label>Taux crédit annuel nominal (%)</label><input className="input-dark invest-finance-input" type="number" value={data.loanRate} onChange={(e) => update({ loanRate: e.target.value })} /></div>
              <div className="field-block"><label>Durée du prêt (ans)</label><input className="input-dark invest-finance-input" type="number" value={data.loanYears} onChange={(e) => update({ loanYears: e.target.value })} /></div>
              <div className="field-block"><label>Charges annuelles (€)</label><input className="input-dark invest-finance-input" type="number" value={data.annualCharges} onChange={(e) => update({ annualCharges: e.target.value })} /></div>
              <div className="field-block"><label>Prix de vente estimé (% du prix revente)</label><input className="input-dark invest-finance-input" type="number" value={data.saleFeesPct} onChange={(e) => update({ saleFeesPct: e.target.value })} /></div>
            </div>
            <div className="stats-row" style={{ marginTop: '1rem' }}>
              <div className="stat-box"><div className="v">{Math.round(financed).toLocaleString('fr-FR')}€</div><div className="l">Montant financé</div></div>
              <div className="stat-box"><div className="v">{annualIncome.toLocaleString('fr-FR')}€</div><div className="l">{t('invest.financingIncome')}</div></div>
              <div className="stat-box"><div className="v neg">-{annualPayment.toLocaleString('fr-FR')}€</div><div className="l">{t('invest.financingPayment')}</div></div>
              <div className="stat-box"><div className="v pos">{annualCashflow.toLocaleString('fr-FR')}€</div><div className="l">{t('invest.financingCashflow')}</div></div>
            </div>
          </div>
        </section>

        <section className={`page ${page === 'project' ? 'active' : ''}`}>
          <h1 className="page-title">{t('invest.project')}</h1>
          <p className="page-sub">{t('invest.projectSub')}</p>
          <div className="card portfolio-card portfolio-card--large">
            <div className="grid-2 portfolio-grid-spaced">
              <div className="field-block"><label>{t('invest.projectName')}</label><input className="input-dark invest-project-input" type="text" value={data.projectName || ''} onChange={(e) => update({ projectName: e.target.value })} placeholder={t('invest.projectNamePlaceholder')} /></div>
              <div className="field-block"><label>{t('invest.projectScore')}</label><input className="input-dark invest-project-input" type="text" value={projectScore} readOnly /></div>
            </div>
            <div className="grid-2 portfolio-grid-spaced">
              <div className="field-block"><label>{t('invest.projectOpportunities')}</label><input className="input-dark invest-project-input" type="number" min="0" max="10" value={data.projectOpportunities} onChange={(e) => update({ projectOpportunities: e.target.value })} /></div>
              <div className="field-block"><label>{t('invest.projectTechnology')}</label><input className="input-dark invest-project-input" type="number" min="0" max="10" value={data.projectTechnology} onChange={(e) => update({ projectTechnology: e.target.value })} /></div>
              <div className="field-block"><label>{t('invest.projectEcosystem')}</label><input className="input-dark invest-project-input" type="number" min="0" max="10" value={data.projectEcosystem} onChange={(e) => update({ projectEcosystem: e.target.value })} /></div>
              <div className="field-block"><label>{t('invest.projectRoadmap')}</label><input className="input-dark invest-project-input" type="number" min="0" max="10" value={data.projectRoadmap} onChange={(e) => update({ projectRoadmap: e.target.value })} /></div>
              <div className="field-block"><label>{t('invest.projectMarketing')}</label><input className="input-dark invest-project-input" type="number" min="0" max="10" value={data.projectMarketing} onChange={(e) => update({ projectMarketing: e.target.value })} /></div>
              <div className="field-block"><label>{t('invest.projectMomentum')}</label><input className="input-dark invest-project-input" type="number" min="0" max="10" value={data.projectMomentum} onChange={(e) => update({ projectMomentum: e.target.value })} /></div>
            </div>
            <label>{t('invest.projectVerdict')}</label>
            <textarea className="input-dark portfolio-note invest-project-textarea" rows="4" value={data.projectVerdict || ''} onChange={(e) => update({ projectVerdict: e.target.value })} placeholder={t('invest.projectVerdictPlaceholder')} />
          </div>
        </section>
      </main>
    </div>
  );
}
