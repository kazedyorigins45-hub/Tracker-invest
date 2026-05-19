"use client";

import React from 'react';
import Link from 'next/link';
import { canAccess, getSubscriptionLabel } from '@/lib/plans';
import { useAccountPayload } from '@/lib/use-account-payload';
import { useLocale } from '@/lib/locale';
import { useFxRate } from '@/lib/fx';
import LogoMark from '@/components/LogoMark';
import ThemeToggle from '@/components/ThemeToggle';
import CurrencyToggle from '@/components/CurrencyToggle';

const NAV = [
  ['cover', 'cover'],
  ['overview', 'overview'],
  ['holdings', 'holdings'],
  ['immo', 'immo'],
  ['monthly', 'monthly'],
  ['annual', 'annual'],
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

const HUB_SEGMENTS = [
  { v: 'actif', l: 'Actifs' },
  { v: 'passif', l: 'Revenu passif' },
];

function classLabel(row = {}) {
  const raw = String(row.className || row.class || 'autre').toLowerCase();
  if (raw === 'immobilier') return 'immo';
  if (raw === 'oblig') return 'obligations';
  return raw || 'autre';
}

const MAX_IMMO_FICHES = 3;

const IMMO_FIELD_IDS = [
  'immo-prix', 'immo-frais-pct', 'immo-travaux', 'immo-ltv', 'immo-taux', 'immo-duree',
  'immo-charges', 'immo-frais-vente', 'immo-tmi', 'immo-abatt',
  'immo-s1-loyer', 'immo-s1-vac', 'immo-s2-nb', 'immo-s2-loyer', 'immo-s2-vac',
  'immo-s3-nuits', 'immo-s3-prix', 'immo-s3-com', 'immo-s4-pay', 'immo-s4-rec',
  'immo-s5-ans', 'immo-s5-revalo', 'immo-s5-loyer', 'immo-s5-vac',
  'immo-s6-mois', 'immo-s6-plus', 'immo-s7-travaux', 'immo-s7-lots', 'immo-s7-prixlot', 'immo-s7-delai',
  'immo-s8-prime', 'immo-s8-prix', 'immo-s8-mois',
];

const IMMO_DEFAULTS = {
  'immo-frais-pct': '8',
  'immo-ltv': '80',
  'immo-taux': '3,5',
  'immo-duree': '20',
  'immo-frais-vente': '7',
  'immo-tmi': '30',
  'immo-abatt': '30',
  'immo-s1-vac': '8',
  'immo-s2-vac': '10',
  'immo-s3-com': '35',
  'immo-s5-revalo': '2',
  'immo-s5-vac': '5',
  'immo-s6-mois': '14',
  'immo-s6-plus': '12',
  'immo-s7-lots': '2',
  'immo-s7-delai': '24',
  'immo-s8-mois': '6',
};

const IMMO_CHECKS = [
  { k: 'diag', l: 'Diagnostics obligatoires (amiante, plomb, termites, gaz, élec…)' },
  { k: 'dpe', l: 'DPE / audit énergétique' },
  { k: 'ass', l: 'Assurance PNO / loyers impayés' },
  { k: 'bail', l: 'Bail, état des lieux, inventaire' },
  { k: 'copro', l: 'Règlement de copro & PV AG' },
  { k: 'urban', l: 'Urbanisme / autorisation location / taxe séjour' },
  { k: 'finance', l: 'Offre de prêt signée & assurance emprunteur' },
];

function emptyImmoFields() {
  return IMMO_FIELD_IDS.reduce((acc, id) => ({ ...acc, [id]: IMMO_DEFAULTS[id] || '' }), {});
}

function defaultImmoCalcState() {
  return {
    activePropertyId: 'p0',
    propertyOrder: ['p0'],
    properties: {
      p0: { name: 'Fiche 1', fields: emptyImmoFields(), checklist: {} },
    },
    global: {
      stress: { taux: '', vac: '', revente: '', show: false },
      alerts: { cfmin: '0', rnet: '', mens: '80' },
      indexation: { on: false, pct: '1,5', years: '10' },
      pv: { taux: '', abatt: '0' },
      linkHolding: '',
    },
  };
}

function defaultInvestState() {
  return {
    page: 'cover',
    name: '',
    horizon: '',
    vision: '',
    memoDocs: {},
    immoActiveFiche: 'fiche-1',
    immoFicheLabels: {
      'fiche-1': 'Fiche 1',
      'fiche-2': 'Fiche 2',
      'fiche-3': 'Fiche 3',
    },
    immoCalc: defaultImmoCalcState(),
    immoLinkedHoldingIndex: '',
      holdings: [
      { className: 'crypto', hubSegment: 'actif', synth: 'Actifs', asset: 'BTC', geckoId: 'bitcoin', quantity: '0.82', avgPrice: '42 000€', sellPrice: '', sellDate: '', saleResult: '', notes: '', value: '34 400€' },
      { className: 'metaux', hubSegment: 'actif', synth: 'Actifs', asset: 'Or', geckoId: '', quantity: '150g', avgPrice: '63€', sellPrice: '', sellDate: '', saleResult: '', notes: '', value: '9 450€' },
    ],
    purchasePrice: '',
    acquisitionFeesPct: '3',
    workCost: '0',
    downPaymentPct: '20',
    loanRate: '4.2',
    loanYears: '30',
    annualCharges: '0',
    saleFeesPct: '0',
    rentalIncome: '',
    loanPayment: '',
    monthlyCashflow: '',
    profitability: '',
    monthlyMonth: '',
    monthlyByMonth: {},
    monthlySummary: '',
    monthlyLesson: '',
    monthlyNext: '',
    annualYear: '',
    annualPride: '',
    annualLessons: '',
    annualAdjustments: '',
    annualNextFocus: '',
    goals: { target: '', why: '', steps: '' },
    goalTarget: '',
    goalWhy: '',
    goalSteps: '',
    projectName: '',
    projectOpportunities: 7,
    projectTechnology: 7,
    projectEcosystem: 7,
    projectRoadmap: 7,
    projectMarketing: 7,
    projectMomentum: 7,
    projectVerdict: '',
    projectArchives: [],
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

function buildInvestAnnualRows(year, monthlyByMonth = {}) {
  const labels = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
  const selectedYear = year || String(new Date().getFullYear());
  return labels.map((label, index) => {
    const key = `${selectedYear}-${String(index + 1).padStart(2, '0')}`;
    const month = monthlyByMonth?.[key] || {};
    return {
      key,
      month: label,
      movements: month.monthlySummary || month.sum || '',
      lesson: month.monthlyLesson || month.lesson || '',
      next: month.monthlyNext || month.next || '',
    };
  });
}

function buildInvestMonthlyGains(year, holdings = []) {
  const selectedYear = String(year || new Date().getFullYear());
  return holdings.reduce((acc, row) => {
    const sellMonth = String(row.sellDate || row.saleDate || '').slice(0, 7);
    if (sellMonth.startsWith(`${selectedYear}-`)) {
      acc[sellMonth] = (acc[sellMonth] || 0) + parseAmount(row.saleResult || 0);
    }
    const monthlyPassive = parseAmount(row.monthlyPassiveIncome || row.passiveMonthlyIncome || 0);
    if (!String(row.sellDate || row.saleDate || '').trim() && String(row.hubSegment || '') === 'passif' && monthlyPassive > 0) {
      for (let month = 1; month <= 12; month += 1) {
        const key = `${selectedYear}-${String(month).padStart(2, '0')}`;
        acc[key] = (acc[key] || 0) + monthlyPassive;
      }
    }
    return acc;
  }, {});
}

function normalizeInvestHolding(row = {}) {
  const rawClassName = row.className || row.class || 'autre';
  const className = rawClassName === 'oblig' ? 'obligations' : rawClassName;
  const normalized = {
    ...row,
    className,
    class: className,
    hubSegment: row.hubSegment || 'actif',
    asset: row.asset || row.label || '',
    geckoId: row.geckoId || '',
    quantity: row.quantity || row.qty || '',
    avgPrice: row.avgPrice || row.buyAvg || '',
    sellPrice: row.sellPrice || row.salePrice || '',
    sellDate: row.sellDate || row.saleDate || '',
    saleResult: row.saleResult || '',
    notes: row.notes || '',
    monthlyPassiveIncome: row.monthlyPassiveIncome || row.passiveMonthlyIncome || '',
    value: row.value || '',
  };
  return {
    ...normalized,
    computedValue: normalized.value || computeHoldingValue(normalized.quantity, normalized.avgPrice),
  };
}

function investHoldingPatch(patch = {}) {
  const next = { ...patch };
  if (next.className === 'oblig') next.className = 'obligations';
  if (Object.prototype.hasOwnProperty.call(patch, 'className')) next.class = patch.className;
  if (Object.prototype.hasOwnProperty.call(patch, 'asset')) next.label = patch.asset;
  if (Object.prototype.hasOwnProperty.call(patch, 'quantity')) next.qty = patch.quantity;
  if (Object.prototype.hasOwnProperty.call(patch, 'avgPrice')) next.buyAvg = patch.avgPrice;
  if (Object.prototype.hasOwnProperty.call(patch, 'sellPrice')) next.salePrice = patch.sellPrice;
  if (Object.prototype.hasOwnProperty.call(patch, 'sellDate')) next.saleDate = patch.sellDate;
  if (Object.prototype.hasOwnProperty.call(patch, 'monthlyPassiveIncome')) next.passiveMonthlyIncome = patch.monthlyPassiveIncome;
  return next;
}

function storedHoldingsOrDefaults(holdings) {
  return Array.isArray(holdings) ? holdings : defaultInvestState().holdings;
}

function emptyHolding() {
  return { className: 'crypto', class: 'crypto', hubSegment: 'actif', synth: 'Actifs', asset: '', label: '', geckoId: '', quantity: '', qty: '', avgPrice: '', buyAvg: '', sellPrice: '', salePrice: '', sellDate: '', saleDate: '', saleResult: '', monthlyPassiveIncome: '', passiveMonthlyIncome: '', notes: '', value: '' };
}

function parseAmount(input) {
  let normalized = String(input ?? '')
    .replace(/\s+/g, '')
    .replace(/[^\d,.-]/g, '');
  const lastComma = normalized.lastIndexOf(',');
  const lastDot = normalized.lastIndexOf('.');
  if (lastComma > -1 && lastDot > -1) {
    normalized = lastComma > lastDot
      ? normalized.replace(/\./g, '').replace(',', '.')
      : normalized.replace(/,/g, '');
  } else if (lastComma > -1) {
    normalized = normalized.replace(',', '.');
  }
  const value = Number.parseFloat(normalized);
  return Number.isFinite(value) ? value : 0;
}

function safeExportCell(value) {
  const text = String(value ?? '');
  return /^[=+\-@]/.test(text.trim()) ? `'${text}` : text;
}

function formatEuro(value) {
  if (!Number.isFinite(value)) return '';
  return `${Math.round(value).toLocaleString('fr-FR')}€`;
}

function formatEuro2(value) {
  const safe = Number.isFinite(Number(value)) ? Number(value) : 0;
  return `${safe.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;
}

function formatPct(value) {
  const safe = Number.isFinite(Number(value)) ? Number(value) : 0;
  return `${(Math.round(safe * 10) / 10).toLocaleString('fr-FR')} %`;
}

function computeHoldingValue(quantity, avgPrice) {
  const total = parseAmount(quantity) * parseAmount(avgPrice);
  return formatEuro(total);
}

function monthlyPayment(principal, annualPct, years) {
  if (principal <= 0 || years <= 0) return 0;
  const rate = annualPct / 100 / 12;
  const months = Math.round(years * 12);
  if (rate <= 0) return principal / months;
  return (principal * (rate * Math.pow(1 + rate, months))) / (Math.pow(1 + rate, months) - 1);
}

function balanceAfterMonths(principal, annualPct, yearsTotal, monthsPaid) {
  if (principal <= 0) return 0;
  const rate = annualPct / 100 / 12;
  const pay = monthlyPayment(principal, annualPct, yearsTotal);
  const months = Math.min(Math.round(monthsPaid), Math.round(yearsTotal * 12));
  if (rate <= 0) return Math.max(0, principal - pay * months);
  return Math.max(0, principal * Math.pow(1 + rate, months) - pay * ((Math.pow(1 + rate, months) - 1) / rate));
}

function immoField(fields, id) {
  return fields?.[id] != null ? String(fields[id]) : '';
}

function capVac(value) {
  return Math.min(95, Math.max(0, value));
}

function baseParamsFromFields(fields, stressTauxPts = 0) {
  const prix = parseAmount(immoField(fields, 'immo-prix'));
  const fraisPct = parseAmount(immoField(fields, 'immo-frais-pct'));
  const travaux = parseAmount(immoField(fields, 'immo-travaux'));
  const ltv = Math.min(100, Math.max(0, parseAmount(immoField(fields, 'immo-ltv'))));
  const taux = parseAmount(immoField(fields, 'immo-taux')) + stressTauxPts;
  const duree = Math.max(0.5, parseAmount(immoField(fields, 'immo-duree')));
  const charges = parseAmount(immoField(fields, 'immo-charges'));
  const fraisVente = Math.min(99, Math.max(0, parseAmount(immoField(fields, 'immo-frais-vente'))));
  const tmi = Math.max(0, parseAmount(immoField(fields, 'immo-tmi')));
  const abatt = Math.min(100, Math.max(0, parseAmount(immoField(fields, 'immo-abatt'))));
  const totalProjet = prix + prix * (fraisPct / 100) + travaux;
  const emprunt = totalProjet * (ltv / 100);
  const apport = totalProjet - emprunt;
  const mens = monthlyPayment(emprunt, taux, duree);
  return { prix, travaux, fraisPct, totalProjet, ltv, taux, duree, charges, fraisVente, tmi, abatt, emprunt, apport, mens, annCredit: mens * 12 };
}

function cfAnnualFromGross(base, gross) {
  if (gross <= 0 && base.charges <= 0) return -base.annCredit - base.charges;
  const imposable = gross * (1 - base.abatt / 100);
  return gross - base.charges - base.annCredit - imposable * (base.tmi / 100);
}

function pvTaxEuro(saleNet, fields, base, pvTaux, pvAbatt, extraDeduct = 0) {
  if (pvTaux <= 0) return 0;
  const feeRatio = base.fraisVente / 100;
  const grossSale = feeRatio >= 0.999 ? saleNet : saleNet / (1 - feeRatio);
  const pvBase = Math.max(0, grossSale - parseAmount(immoField(fields, 'immo-prix')) - parseAmount(immoField(fields, 'immo-travaux')) - extraDeduct);
  return pvBase * (1 - Math.min(100, Math.max(0, pvAbatt)) / 100) * (pvTaux / 100);
}

function buildImmoRows(fields, stressTauxPts = 0, stressVacPts = 0, stressRevPct = 0, pvTaux = 0, pvAbatt = 0) {
  const revMult = 1 + stressRevPct / 100;
  const base = baseParamsFromFields(fields, stressTauxPts);
  const rows = [];
  const rentalScen = (label, gross, remark) => {
    const cf = cfAnnualFromGross(base, gross);
    const rBrut = base.totalProjet > 0 ? (gross / base.totalProjet) * 100 : 0;
    const rNet = base.apport > 0 ? (cf / base.apport) * 100 : 0;
    const row = { label, brut: gross, cf, rBrut, rNet, remark, score: cf, apportForYield: base.apport };
    rows.push(row);
    return row;
  };

  const vac1 = capVac(parseAmount(immoField(fields, 'immo-s1-vac')) + stressVacPts);
  const row1 = rentalScen('Location longue durée', parseAmount(immoField(fields, 'immo-s1-loyer')) * 12 * (1 - vac1 / 100), 'Loueur nu ou meublé long.');
  const nb2 = Math.max(0, parseAmount(immoField(fields, 'immo-s2-nb')));
  const vac2 = capVac(parseAmount(immoField(fields, 'immo-s2-vac')) + stressVacPts);
  const row2 = rentalScen('Colocation', nb2 * parseAmount(immoField(fields, 'immo-s2-loyer')) * 12 * (1 - vac2 / 100), 'Charges souvent plus élevées.');
  const comm3 = Math.min(100, Math.max(0, parseAmount(immoField(fields, 'immo-s3-com'))));
  const row3 = rentalScen('Location nuitée', parseAmount(immoField(fields, 'immo-s3-nuits')) * parseAmount(immoField(fields, 'immo-s3-prix')) * 12 * (1 - comm3 / 100), 'Seuils & fiscalité courtes durées.');
  const row4 = rentalScen('Sous-location (marge)', Math.max(0, (parseAmount(immoField(fields, 'immo-s4-rec')) - parseAmount(immoField(fields, 'immo-s4-pay'))) * 12), 'Cadre légal à vérifier.');

  const ans5 = Math.max(0.5, parseAmount(immoField(fields, 'immo-s5-ans')));
  const gross5 = parseAmount(immoField(fields, 'immo-s5-loyer')) * 12 * (1 - capVac(parseAmount(immoField(fields, 'immo-s5-vac')) + stressVacPts) / 100);
  const saleNet5 = base.totalProjet * Math.pow(1 + parseAmount(immoField(fields, 'immo-s5-revalo')) / 100, ans5) * (1 - base.fraisVente / 100) * revMult;
  const bal5 = balanceAfterMonths(base.emprunt, base.taux, base.duree, Math.round(ans5 * 12));
  const annualCf5 = cfAnnualFromGross(base, gross5);
  const cumCf5 = annualCf5 * ans5;
  const tax5 = pvTaxEuro(saleNet5, fields, base, pvTaux, pvAbatt);
  const profit5 = cumCf5 + saleNet5 - bal5 - base.apport - tax5;
  const eq5 = profit5 / ans5;
  rows.push({ label: 'Achat → revente (avec loyer)', brut: gross5, cf: eq5, rBrut: base.totalProjet > 0 ? (gross5 / base.totalProjet) * 100 : 0, rNet: base.apport > 0 ? (eq5 / base.apport) * 100 : 0, remark: `Profit total ${formatEuro2(profit5)} (dont PV estimée ${formatEuro2(tax5)}).`, score: eq5, apportForYield: base.apport });

  const mois6 = Math.max(1, parseAmount(immoField(fields, 'immo-s6-mois')));
  const saleNet6 = base.prix * (1 + parseAmount(immoField(fields, 'immo-s6-plus')) / 100) * (1 - base.fraisVente / 100) * revMult;
  const bal6 = balanceAfterMonths(base.emprunt, base.taux, base.duree, mois6);
  const cumCf6 = (-base.charges / 12 - base.mens) * mois6;
  const tax6 = pvTaxEuro(saleNet6, fields, base, pvTaux, pvAbatt);
  const profit6 = cumCf6 + saleNet6 - bal6 - base.apport - tax6;
  const eq6 = profit6 / (mois6 / 12);
  rows.push({ label: 'Revente rapide (flip)', brut: 0, cf: eq6, rBrut: 0, rNet: base.apport > 0 ? (eq6 / base.apport) * 100 : 0, remark: `${mois6} mois — PV fisc. estimée ${formatEuro2(tax6)}.`, score: eq6, apportForYield: base.apport });

  const trav7 = parseAmount(immoField(fields, 'immo-s7-travaux'));
  const lots7 = Math.max(1, parseAmount(immoField(fields, 'immo-s7-lots')));
  const del7 = Math.max(1, parseAmount(immoField(fields, 'immo-s7-delai')));
  const total7 = base.totalProjet + trav7;
  const emprunt7 = total7 * (base.ltv / 100);
  const apport7 = total7 - emprunt7;
  const mens7 = monthlyPayment(emprunt7, base.taux, base.duree);
  const saleNet7 = lots7 * parseAmount(immoField(fields, 'immo-s7-prixlot')) * (1 - base.fraisVente / 100) * revMult;
  const bal7 = balanceAfterMonths(emprunt7, base.taux, base.duree, del7);
  const tax7 = pvTaxEuro(saleNet7, fields, base, pvTaux, pvAbatt, trav7);
  const profit7 = del7 * (-base.charges / 12 - mens7) + saleNet7 - bal7 - apport7 - tax7;
  const eq7 = profit7 / (del7 / 12);
  rows.push({ label: 'Division / lots', brut: 0, cf: eq7, rBrut: 0, rNet: apport7 > 0 ? (eq7 / apport7) * 100 : 0, remark: `${lots7} lots — PV estimée ${formatEuro2(tax7)}.`, score: eq7, apportForYield: apport7 });

  const prime8 = parseAmount(immoField(fields, 'immo-s8-prime'));
  const mois8 = Math.max(1, parseAmount(immoField(fields, 'immo-s8-mois')));
  const prix8 = parseAmount(immoField(fields, 'immo-s8-prix'));
  rows.push({ label: 'Promesse / cession (lecture)', brut: 0, cf: (-prime8 / mois8) * 12, rBrut: 0, rNet: 0, remark: prix8 > 0 ? `Prix cible ${formatEuro2(prix8)}.` : '—', score: null, apportForYield: 0 });

  return { rows, base, details: { row1, row2, row3, row4, gross5, annualCf5, saleNet5, bal5, profit5, eq5, saleNet6, cumCf6, profit6, eq6, total7, apport7, saleNet7, profit7, eq7, mens7, prime8, mois8, prix8 } };
}

function bestImmoRow(rows) {
  return rows.reduce((best, row) => (row.score != null && Number.isFinite(row.score) && (!best || row.score > best.score) ? row : best), null);
}

export default function InvestHub({ userEmail = '', planCode = 'starter', subscription = null }) {
  const [portfolioState, setPortfolioState] = useAccountPayload('investHub_profiles_v1', defaultPortfolioState());
  const profile = portfolioState.current || 'main';
  const profileLabel = portfolioState.labels?.[profile] || (profile === 'pea' ? 'PEA long terme' : profile === 'crypto' ? 'Crypto' : 'Patrimoine principal');
  const [data, setData] = useAccountPayload(`investHub_v2_${profile}`, defaultInvestState());

  const page = data.page || 'cover';
  const subscriptionLabel = getSubscriptionLabel(subscription, planCode);
  const { t, locale } = useLocale();
  const EUR_TO_USD = useFxRate();
  const fmtC = (value) => {
    if (!Number.isFinite(value)) return '';
    if (locale === 'en') return `$${Math.round(value * EUR_TO_USD).toLocaleString('en-US')}`;
    return `${Math.round(value).toLocaleString('fr-FR')}€`;
  };
  const fmtC2 = (value) => {
    const safe = Number.isFinite(Number(value)) ? Number(value) : 0;
    if (locale === 'en') return `$${(safe * EUR_TO_USD).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    return `${safe.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;
  };
  const update = (patch) => setData((prev) => ({ ...prev, ...patch }));
  const setInvestMeta = (key, value) => setData((prev) => ({
    ...prev,
    [key]: value,
    meta: { ...(prev.meta || {}), [key]: value },
  }));
  const updateProfile = (patch) => setPortfolioState((prev) => ({ ...prev, ...patch }));
  const [liveStatus, setLiveStatus] = React.useState('');
  const [feedback, setFeedback] = React.useState('');
  const [isRefreshingLive, setIsRefreshingLive] = React.useState(false);
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const closeSidebar = () => setSidebarOpen(false);

  const notify = (message) => {
    setFeedback(message);
    if (typeof window !== 'undefined') window.setTimeout(() => setFeedback(''), 2800);
  };
  const immoCalc = data.immoCalc || defaultImmoCalcState();
  const activePropertyId = immoCalc.activePropertyId || immoCalc.propertyOrder?.[0] || 'p0';
  const immoProperties = immoCalc.properties || defaultImmoCalcState().properties;
  const activeProperty = immoProperties[activePropertyId] || immoProperties.p0 || { name: 'Fiche 1', fields: emptyImmoFields(), checklist: {} };
  const activeFields = { ...emptyImmoFields(), ...(activeProperty.fields || {}) };
  const immoGlobal = { ...defaultImmoCalcState().global, ...(immoCalc.global || {}), stress: { ...defaultImmoCalcState().global.stress, ...(immoCalc.global?.stress || {}) }, alerts: { ...defaultImmoCalcState().global.alerts, ...(immoCalc.global?.alerts || {}) }, indexation: { ...defaultImmoCalcState().global.indexation, ...(immoCalc.global?.indexation || {}) }, pv: { ...defaultImmoCalcState().global.pv, ...(immoCalc.global?.pv || {}) } };

  React.useEffect(() => {
    if (['export', 'memo', 'finance'].includes(page)) update({ page: 'cover' });
  }, [page]);
  const projectScoreKeys = ['projectOpportunities', 'projectTechnology', 'projectEcosystem', 'projectRoadmap', 'projectMarketing', 'projectMomentum'];
  const projectScores = projectScoreKeys.map((key) => Math.min(10, Math.max(0, parseAmount(data[key]))));
  const projectAverage = projectScores.length ? Math.round((projectScores.reduce((sum, score) => sum + score, 0) / projectScores.length) * 10) / 10 : 0;
  const projectScore = projectAverage;
  const projectArchives = Array.isArray(data.projectArchives) ? data.projectArchives : [];
  const projectVerdictLabel = projectAverage >= 7.5 ? 'Projet intéressant' : projectAverage >= 5 ? 'Projet à surveiller' : 'Projet risqué';
  const projectVerdictClass = projectAverage >= 7.5 ? 'pos' : projectAverage >= 5 ? '' : 'neg';
  const investMeta = { name: data.name || '', horizon: data.horizon || '', vision: data.vision || '', ...(data.meta || {}) };
  const selectedMonth = data.monthlyMonth || monthKey();
  const monthlySnapshot = {
    monthlySummary: '', monthlyLesson: '', monthlyNext: '',
    ...(data.monthly?.[selectedMonth] ? {
      monthlySummary: data.monthly[selectedMonth].sum || '',
      monthlyLesson: data.monthly[selectedMonth].lesson || '',
      monthlyNext: data.monthly[selectedMonth].next || '',
    } : {}),
    ...(data.monthlyByMonth?.[selectedMonth] || {}),
  };
  const selectedAnnualYear = data.annualYear || String(new Date().getFullYear());
  const annualMonthlySource = { ...(data.monthly || {}), ...(data.monthlyByMonth || {}) };
  const goalsState = { target: data.goalTarget || '', why: data.goalWhy || '', steps: data.goalSteps || '', ...(data.goals || {}) };
  const holdings = (Array.isArray(data.holdings) && data.holdings.length ? data.holdings : defaultInvestState().holdings).map(normalizeInvestHolding);
  const isHoldingSold = (row) => !!String(row.sellDate || row.saleDate || '').trim();
  const openHoldings = holdings.filter((row) => !isHoldingSold(row));
  const immoLinkedHoldings = openHoldings.filter((row) => ['immobilier', 'immo'].includes(String(row.className || '').toLowerCase()));
  const annualGainsByMonth = buildInvestMonthlyGains(selectedAnnualYear, holdings);
  const annualRows = buildInvestAnnualRows(selectedAnnualYear, annualMonthlySource).map((row) => ({ ...row, gain: annualGainsByMonth[row.key] || 0 }));
  const annualFilledMonths = annualRows.filter((row) => row.movements || row.lesson || row.next || row.gain).length;

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
  const totalOverviewValue = openHoldings.reduce((sum, row) => sum + parseAmount(row.computedValue || row.value || 0), 0);
  const classTotals = openHoldings.reduce((acc, row) => {
    const key = classLabel(row);
    acc[key] = (acc[key] || 0) + parseAmount(row.computedValue || row.value || 0);
    return acc;
  }, {});

  const overviewClasses = ['crypto', 'metaux', 'matieres', 'immo', 'obligations', 'actions', 'autre'];
  const overviewLabels = {
    crypto: 'Crypto',
    metaux: 'Métaux précieux',
    matieres: 'Matières premières',
    immo: 'Immobilier',
    obligations: 'Obligations / monétaire',
    actions: 'Actions / ETF',
    autre: 'Autre',
  };

  const pvTaux = parseAmount(immoGlobal.pv.taux);
  const pvAbatt = parseAmount(immoGlobal.pv.abatt);
  const immoResult = buildImmoRows(activeFields, 0, 0, 0, pvTaux, pvAbatt);
  const immoBase = immoResult.base;
  const immoBest = bestImmoRow(immoResult.rows);
  const stressResult = immoGlobal.stress.show
    ? buildImmoRows(activeFields, parseAmount(immoGlobal.stress.taux), parseAmount(immoGlobal.stress.vac), parseAmount(immoGlobal.stress.revente), pvTaux, pvAbatt)
    : null;
  const indexationText = (() => {
    if (!immoGlobal.indexation.on || parseAmount(immoGlobal.indexation.years) <= 0 || parseAmount(immoGlobal.indexation.pct) === 0) {
      return "Active la projection et renseigne un horizon pour estimer l'effet d'une indexation type IRL.";
    }
    const gross0 = parseAmount(immoField(activeFields, 'immo-s1-loyer')) * 12 * (1 - capVac(parseAmount(immoField(activeFields, 'immo-s1-vac'))) / 100);
    const years = Math.max(1, Math.floor(parseAmount(immoGlobal.indexation.years)));
    const grossN = gross0 * Math.pow(1 + parseAmount(immoGlobal.indexation.pct) / 100, Math.max(0, years - 1));
    return `Projection loc. longue (réf.) : brut an 1 ≈ ${fmtC2(gross0)}, brut terminal (an ${years}) ≈ ${fmtC2(grossN)} — CF net terminal indicatif ≈ ${fmtC2(cfAnnualFromGross(immoBase, grossN))}.`;
  })();

  const toggleDoc = (doc) => update({ memoDocs: { ...(data.memoDocs || {}), [doc]: !data.memoDocs?.[doc] } });

  const updateHolding = (index, patch) => {
    setData((prev) => {
      const baseHoldings = storedHoldingsOrDefaults(prev.holdings);
      const aliases = investHoldingPatch(patch);
      return { ...prev, holdings: baseHoldings.map((row, rowIndex) => (rowIndex === index ? { ...row, ...aliases } : row)) };
    });
  };

  const updateHoldingGeckoId = (index, value) => {
    setData((prev) => {
      const baseHoldings = storedHoldingsOrDefaults(prev.holdings);
      return { ...prev, holdings: baseHoldings.map((row, rowIndex) => (rowIndex === index ? { ...row, geckoId: value } : row)) };
    });
  };

  const addHolding = () => {
    setData((prev) => {
      const baseHoldings = storedHoldingsOrDefaults(prev.holdings);
      return { ...prev, holdings: [...baseHoldings, emptyHolding()] };
    });
  };

  const removeHolding = (index) => {
    setData((prev) => {
      const baseHoldings = storedHoldingsOrDefaults(prev.holdings);
      return { ...prev, holdings: baseHoldings.filter((_, rowIndex) => rowIndex !== index) };
    });
  };

  const updateImmoCalc = (producer) => {
    setData((prev) => {
      const base = prev.immoCalc || defaultImmoCalcState();
      return { ...prev, immoCalc: producer(base) };
    });
  };

  const setImmoField = (id, value) => {
    updateImmoCalc((prev) => {
      const pid = prev.activePropertyId || prev.propertyOrder?.[0] || 'p0';
      const props = { ...(prev.properties || {}) };
      const property = props[pid] || { name: 'Fiche 1', fields: emptyImmoFields(), checklist: {} };
      props[pid] = { ...property, fields: { ...emptyImmoFields(), ...(property.fields || {}), [id]: value } };
      return { ...prev, activePropertyId: pid, properties: props };
    });
  };

  const setImmoGlobal = (group, key, value) => {
    updateImmoCalc((prev) => ({
      ...prev,
      global: { ...defaultImmoCalcState().global, ...(prev.global || {}), [group]: { ...defaultImmoCalcState().global[group], ...(prev.global?.[group] || {}), [key]: value } },
    }));
  };

  const setImmoChecklist = (key, value) => {
    updateImmoCalc((prev) => {
      const pid = prev.activePropertyId || prev.propertyOrder?.[0] || 'p0';
      const props = { ...(prev.properties || {}) };
      const property = props[pid] || { name: 'Fiche 1', fields: emptyImmoFields(), checklist: {} };
      props[pid] = { ...property, checklist: { ...(property.checklist || {}), [key]: value } };
      return { ...prev, activePropertyId: pid, properties: props };
    });
  };

  const switchImmoProperty = (pid) => updateImmoCalc((prev) => ({ ...prev, activePropertyId: pid }));

  const addImmoProperty = () => updateImmoCalc((prev) => {
    const order = prev.propertyOrder || ['p0'];
    if (order.length >= MAX_IMMO_FICHES) {
      if (typeof window !== 'undefined') window.alert(`Maximum ${MAX_IMMO_FICHES} fiches.`);
      return prev;
    }
    const id = `p${Date.now()}`;
    notify(`Fiche ${order.length + 1} ajoutée.`);
    return { ...prev, activePropertyId: id, propertyOrder: [...order, id], properties: { ...(prev.properties || {}), [id]: { name: `Fiche ${order.length + 1}`, fields: emptyImmoFields(), checklist: {} } } };
  });

  const duplicateImmoProperty = () => updateImmoCalc((prev) => {
    const order = prev.propertyOrder || ['p0'];
    if (order.length >= MAX_IMMO_FICHES) {
      if (typeof window !== 'undefined') window.alert(`Maximum ${MAX_IMMO_FICHES} fiches.`);
      return prev;
    }
    const pid = prev.activePropertyId || order[0];
    const current = prev.properties?.[pid] || { name: 'Fiche', fields: emptyImmoFields(), checklist: {} };
    const id = `p${Date.now()}`;
    notify('Fiche dupliquée.');
    return { ...prev, activePropertyId: id, propertyOrder: [...order, id], properties: { ...(prev.properties || {}), [id]: { name: `${current.name || 'Fiche'} (copie)`, fields: { ...emptyImmoFields(), ...(current.fields || {}) }, checklist: { ...(current.checklist || {}) } } } };
  });

  const renameActiveImmoProperty = () => {
    if (typeof window === 'undefined') return;
    const next = window.prompt('Nom de la fiche :', activeProperty.name || 'Fiche');
    if (!next || !next.trim()) return;
    updateImmoCalc((prev) => {
      const pid = prev.activePropertyId || prev.propertyOrder?.[0] || 'p0';
      const props = { ...(prev.properties || {}) };
      props[pid] = { ...(props[pid] || { fields: emptyImmoFields(), checklist: {} }), name: next.trim() };
      notify('Fiche renommée.');
      return { ...prev, properties: props };
    });
  };

  const renameImmoFiche = renameActiveImmoProperty;

  const fetchLiveSellPrice = async (index) => {
    const row = holdings[index];
    if (!row) return;
    if (classLabel(row) !== 'crypto') {
      setLiveStatus('Cours automatique disponible uniquement pour les cryptos via CoinGecko.');
      return;
    }
    const gid = String(row.geckoId || '').trim().toLowerCase().replace(/\s+/g, '-');
    if (!gid) return;
    try {
      const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(gid)}&vs_currencies=eur`);
      const json = await res.json();
      const price = json?.[gid]?.eur;
      if (Number.isFinite(Number(price))) {
        const sale = Number(price);
        setData((prev) => {
          const baseHoldings = storedHoldingsOrDefaults(prev.holdings);
          const next = baseHoldings.map((current, rowIndex) => {
            if (rowIndex !== index) return current;
            const qty = parseAmount(current.quantity || current.qty || 0) || 1;
            const buy = parseAmount(current.avgPrice || current.buyAvg || 0);
            const result = Number.isFinite(qty) && Number.isFinite(buy) ? ((sale - buy) * qty) : 0;
            return { ...current, sellPrice: String(price), salePrice: String(price), saleResult: String(Math.round(result * 100) / 100) };
          });
          return { ...prev, holdings: next };
        });
      }
    } catch {}
  };

  const refreshLiveValues = async () => {
    const ids = [];
    holdings.forEach((row) => {
      if (classLabel(row) !== 'crypto') return;
      const gid = String(row.geckoId || '').trim().toLowerCase().replace(/\s+/g, '-');
      if (gid) ids.push(gid);
    });
    const uniq = [...new Set(ids)];
    if (!uniq.length) {
      setLiveStatus('Renseigne au moins un ID CoinGecko sur une ligne crypto ouverte.');
      return;
    }
    setLiveStatus('Récupération…');
    setIsRefreshingLive(true);
    try {
      const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(uniq.join(','))}&vs_currencies=eur`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const prices = await res.json();
      let updated = 0;
      setData((prev) => {
        const baseHoldings = storedHoldingsOrDefaults(prev.holdings);
        const nextHoldings = baseHoldings.map((row) => {
          const gid = String(row.geckoId || '').trim().toLowerCase().replace(/\s+/g, '-');
          const price = prices?.[gid]?.eur;
          if (!gid || isHoldingSold(row) || !Number.isFinite(Number(price))) return row;
          const q = parseAmount(row.quantity || row.qty || 0) || 1;
          updated += 1;
          return { ...row, value: String(Math.round(Number(price) * q * 100) / 100) };
        });
        return { ...prev, holdings: nextHoldings };
      });
      setLiveStatus(updated ? `${updated} position(s) mise(s) à jour.` : 'Aucun prix trouvé.');
      if (updated) notify('Cours CoinGecko actualisés.');
    } catch {
      setLiveStatus('Erreur réseau ou limite CoinGecko. Réessaie plus tard.');
    } finally {
      setIsRefreshingLive(false);
    }
  };

  const setMonthlyField = (key, value) => {
    setData((prev) => {
      const month = prev.monthlyMonth || monthKey();
      const bucket = prev.monthlyByMonth?.[month] || {};
      const refKeyMap = { monthlySummary: 'sum', monthlyLesson: 'lesson', monthlyNext: 'next' };
      const refKey = refKeyMap[key] || key;
      const refBucket = prev.monthly?.[month] || {};
      return {
        ...prev,
        monthlyMonth: month,
        monthlyByMonth: { ...(prev.monthlyByMonth || {}), [month]: { ...bucket, [key]: value } },
        monthly: { ...(prev.monthly || {}), [month]: { ...refBucket, [refKey]: value } },
      };
    });
  };

  const setGoalField = (key, value) => {
    setData((prev) => ({
      ...prev,
      goals: { target: prev.goalTarget || '', why: prev.goalWhy || '', steps: prev.goalSteps || '', ...(prev.goals || {}), [key]: value },
    }));
  };

  const currentProjectSnapshot = () => ({
    id: `project-${Date.now()}`,
    savedAt: new Date().toISOString(),
    name: String(data.projectName || '').trim() || `Projet ${projectArchives.length + 1}`,
    scores: projectScoreKeys.reduce((acc, key) => ({ ...acc, [key]: Math.min(10, Math.max(0, parseAmount(data[key]))) }), {}),
    average: projectAverage,
    verdict: data.projectVerdict || '',
  });

  const saveProjectAnalysis = () => {
    const snapshot = currentProjectSnapshot();
    setData((prev) => ({ ...prev, projectArchives: [snapshot, ...(Array.isArray(prev.projectArchives) ? prev.projectArchives : [])] }));
    notify(`Projet « ${snapshot.name} » enregistré.`);
  };

  const resetProjectAnalysis = () => {
    setData((prev) => ({
      ...prev,
      projectName: '',
      projectOpportunities: 0,
      projectTechnology: 0,
      projectEcosystem: 0,
      projectRoadmap: 0,
      projectMarketing: 0,
      projectMomentum: 0,
      projectVerdict: '',
    }));
    notify('Nouveau projet prêt à être analysé.');
  };

  const loadProjectAnalysis = (project) => {
    if (!project) return;
    update({
      projectName: project.name || '',
      ...projectScoreKeys.reduce((acc, key) => ({ ...acc, [key]: project.scores?.[key] ?? 0 }), {}),
      projectVerdict: project.verdict || '',
    });
    notify(`Projet « ${project.name || 'archivé'} » rechargé.`);
  };

  const deleteProjectAnalysis = (id) => {
    setData((prev) => ({ ...prev, projectArchives: (Array.isArray(prev.projectArchives) ? prev.projectArchives : []).filter((project) => project.id !== id) }));
    notify('Projet supprimé des archives.');
  };

  const exportRows = [
    ['Actif', 'Quantité', 'Prix moyen', 'Valeur'],
    ...holdings.map((row) => [row.asset || '', row.quantity || row.qty || '', row.avgPrice || row.buyAvg || '', row.computedValue || '']),
  ];

  const copyTsv = async () => {
    const text = exportRows.map((row) => row.map(safeExportCell).join('\t')).join('\n');
    try { await navigator.clipboard.writeText(text); notify('Export portefeuille copié.'); } catch {}
  };

  const downloadCsv = () => {
    const csv = '\uFEFF' + exportRows.map((row) => row.map((cell) => `"${safeExportCell(cell).replace(/"/g, '""')}"`).join(';')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'invest-portfolio.csv';
    a.click();
    URL.revokeObjectURL(url);
    notify('CSV portefeuille téléchargé.');
  };

  const immoCompareRows = immoBase.prix > 0 ? [...immoResult.rows, ...(stressResult ? stressResult.rows.map((row) => ({ ...row, stress: true, label: `${row.label} — stress` })) : [])] : [];
  const immoMultiRows = (immoCalc.propertyOrder || ['p0']).map((pid) => {
    const property = immoProperties[pid];
    const fields = { ...emptyImmoFields(), ...(property?.fields || {}) };
    if (parseAmount(immoField(fields, 'immo-prix')) <= 0) return { pid, name: property?.name || pid, empty: true };
    const result = buildImmoRows(fields, 0, 0, 0, pvTaux, pvAbatt);
    const best = bestImmoRow(result.rows);
    return { pid, name: property?.name || pid, prix: parseAmount(immoField(fields, 'immo-prix')), best };
  });

  const miniStat = (label, value, cls = '') => <div><div className="k">{label}</div><div className={`v ${cls}`}>{value}</div></div>;
  const immoRentabilityBadge = (score, label = '') => {
    const rentable = Number(score) > 0;
    return (
      <div className={`immo-profit-badge ${rentable ? 'is-profitable' : 'is-not-profitable'}`}>
        <span className="immo-profit-dot" aria-hidden="true" />
        <div>
          <strong>{rentable ? t('invest.immoRentable') : t('invest.immoNotRentable')}</strong>
          <span>{label || t('invest.immoCfAnnual')} : {fmtC2(Number.isFinite(Number(score)) ? Number(score) : 0)}</span>
        </div>
      </div>
    );
  };
  const rentalMini = (row) => (
    <>
      <div className="immo-mini-stats">
        {miniStat(t('invest.immoMiniGross'), fmtC2(row.brut))}
        {miniStat(t('invest.immoMiniCf'), fmtC2(row.cf), row.cf >= 0 ? 'pos' : 'neg')}
        {miniStat(t('invest.immoMiniRBrut'), formatPct(row.rBrut))}
        {miniStat(t('invest.immoMiniRNet'), row.apportForYield > 0 ? formatPct(row.rNet) : '—', row.apportForYield > 0 ? (row.cf >= 0 ? 'pos' : 'neg') : '')}
      </div>
      {immoRentabilityBadge(row.cf, t('invest.immoCfAnnual'))}
    </>
  );

  const exportImmoTsv = async () => {
    const rows = [['Scénario', 'Brut / an', 'CF net / an', 'R. brut', 'R. net / apport', 'Remarque'], ...immoCompareRows.map((row) => [row.label, fmtC2(row.brut), row.score != null ? fmtC2(row.cf) : '—', formatPct(row.rBrut), row.apportForYield > 0 ? formatPct(row.rNet) : '—', row.remark])];
    const text = rows.map((row) => row.map(safeExportCell).join('\t')).join('\n');
    try { await navigator.clipboard.writeText(text); notify('Tableau immo copié (TSV).'); } catch {}
  };

  const downloadImmoCsv = () => {
    const rows = [['Scenario', 'Brut', 'CF', 'RBrut', 'RNet', 'Note'], ...immoCompareRows.map((row) => [row.label, fmtC2(row.brut), row.score != null ? fmtC2(row.cf) : '—', formatPct(row.rBrut), row.apportForYield > 0 ? formatPct(row.rNet) : '—', row.remark])];
    const csv = '\uFEFF' + rows.map((row) => row.map((cell) => `"${safeExportCell(cell).replace(/"/g, '""')}"`).join(';')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'elite-invest-immo.csv';
    a.click();
    URL.revokeObjectURL(url);
    notify('CSV immobilier téléchargé.');
  };

  return (
    <div className="mindset-shell invest-hub">
      <aside className={`sidebar${sidebarOpen ? ' sidebar--open' : ''}`}>
        <div className="sidebar-close" onClick={closeSidebar} aria-label={t('tracker.sidebarClose')}>✕</div>
        <div className="brand">
          <div className="tag">{t('app.invest')}</div>
          <Link href="/dashboard" className="brand-link"><h1>Elite Invest</h1></Link>
        </div>

        <nav className="sidebar-apps" aria-label="Navigation site">
          <div className="sidebar-apps-label">{t('mindset.spaces')}</div>
          <Link href="/mindset" className="app-link">{t('app.dashboardLink')}</Link>
          {canAccess(planCode, 'tracker') ? <Link href="/tracker" className="app-link">{t('app.trading')}</Link> : null}
          <Link href="/mindset" className="app-link">{t('app.mindset')}</Link>
          <Link href="/invest" className="app-link is-current">{t('app.invest')}</Link>
          {canAccess(planCode, 'portfolio') ? <Link href="/portfolio" className="app-link">{t('app.portfolio')}</Link> : null}
        </nav>

        <div className="profile-bar profile-bar--hidden">
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
          <div className="mindset-topbar-left">
            <button type="button" className="hamburger-btn" onClick={() => setSidebarOpen((v) => !v)} aria-label="Menu">
              <span /><span /><span />
            </button>
            <LogoMark />
          </div>
          <ThemeToggle className="theme-toggle--app" />
          <CurrencyToggle className="theme-toggle--app" />
        </div>
        {feedback ? <div className="ui-feedback" role="status" aria-live="polite">{feedback}</div> : null}
        <section className={`page ${page === 'cover' ? 'active' : ''}`}>
          <h1 className="page-title">{t('invest.title')}</h1>
          <p className="page-sub invest-quote">{t('invest.coverSub')}</p>
          <div className="class-pills">{t('invest.coverClassPills').split(' · ').map((pill) => <span key={pill}>{pill}</span>)}</div>
          <div className="card">
            <h2>{t('invest.identity')}</h2>
            <div className="grid-2">
              <div className="field-block"><label>{t('invest.coverIdentityLabel')}</label><input className="input-dark invest-short-input" type="text" value={investMeta.name || ''} onChange={(e) => setInvestMeta('name', e.target.value)} placeholder={`ex. ${profileLabel}`} /></div>
              <div className="field-block"><label>{t('invest.coverHorizonLabel')}</label><input className="input-dark invest-medium-input" type="text" value={investMeta.horizon || ''} onChange={(e) => setInvestMeta('horizon', e.target.value)} placeholder="ex. 5–15 ans" /></div>
            </div>
            <label className="field-label">{t('invest.coverVisionLabel')}</label>
            <textarea className="input-dark invest-vision-textarea" rows="4" value={investMeta.vision || ''} onChange={(e) => setInvestMeta('vision', e.target.value)} placeholder={t('invest.coverVisionPlaceholder')} />
          </div>
        </section>

        <section className={`page ${page === 'overview' ? 'active' : ''}`}>
          <h1 className="page-title">{t('invest.overview')}</h1>
          <p className="page-sub">{t('invest.overviewSub')}</p>
          <div className="stats-row">
            <div className="stat-box"><div className="v">{fmtC(totalOverviewValue)}</div><div className="l">{t('invest.overviewTotal')}</div></div>
            <div className="stat-box"><div className="v">{holdings.length}</div><div className="l">{t('invest.overviewPositions')}</div></div>
          </div>
          <div className="card">
            <h2>{t('invest.overviewBreakdown')}</h2>
            <div className="overview-breakdown">
              {overviewClasses.map((key) => {
                const amt = classTotals[key] || 0;
                const pct = totalOverviewValue > 0 ? ((amt / totalOverviewValue) * 100).toFixed(1) : '0.0';
                return (
                  <div key={key} className="overview-breakdown-row">
                    <span>{overviewLabels[key]}</span>
                    <span>{Math.round(amt).toLocaleString('fr-FR')}€ <span style={{ color: 'var(--muted)' }}>({pct}%)</span></span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className={`page ${page === 'holdings' ? 'active' : ''}`}>
          <h1 className="page-title">{t('invest.portfolio')}</h1>
          <p className="page-sub">{t('invest.holdingsSub')}</p>
          <datalist id="inv-gecko-presets">
            <option value="bitcoin" /><option value="ethereum" /><option value="solana" /><option value="cardano" />
            <option value="ripple" /><option value="dogecoin" /><option value="polkadot" /><option value="avalanche-2" />
            <option value="matic-network" /><option value="chainlink" /><option value="wrapped-bitcoin" />
          </datalist>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center', marginBottom: '1rem' }}>
            <button type="button" className="btn" onClick={addHolding} style={{ marginBottom: 0, fontSize: '0.85rem' }}>{t('invest.holdingsAddPosition')}</button>
            <button type="button" className="btn btn-ghost" onClick={refreshLiveValues} disabled={isRefreshingLive} style={{ fontSize: '0.85rem' }}>{isRefreshingLive ? t('invest.holdingsRefreshing') : t('invest.holdingsRefreshLive')}</button>
            <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }} />
          </div>
          {liveStatus ? <p className="hint" style={{ marginTop: 0 }}>{liveStatus}</p> : null}
          <div className="card">
            <div className="table-wrap">
              <table className="data">
                <thead>
                  <tr>
                    <th>{t('invest.holdingsColClass')}</th><th>{t('invest.holdingsColSynth')}</th><th>{t('invest.holdingsColIncome')}</th><th>{t('invest.holdingsColLabel')}</th><th>{t('invest.holdingsColGecko')}</th><th>{t('invest.holdingsColValue')}</th><th>{t('invest.holdingsColQty')}</th><th>{t('invest.holdingsColBuyPrice')}</th><th>{t('invest.holdingsColSellPrice')}</th><th>{t('invest.holdingsColSellDate')}</th><th>{t('invest.holdingsColSaleResult')}</th><th>{t('invest.holdingsColNotes')}</th><th></th>
                  </tr>
                </thead>
                <tbody>
                  {holdings.map((row, index) => (
                    <tr key={`${row.asset || 'row'}-${index}`} className={isHoldingSold(row) ? 'row-sold' : ''}>
                      <td>
                        <select className="input-dark invest-holding-input" value={row.className === 'immobilier' ? 'immo' : row.className === 'oblig' ? 'obligations' : (row.className || 'autre')} onChange={(e) => updateHolding(index, { className: e.target.value })}>
                          <option value="crypto">{t('invest.holdingsClassCrypto')}</option>
                          <option value="metaux">{t('invest.holdingsClassMetaux')}</option>
                          <option value="matieres">{t('invest.holdingsClassMatieres')}</option>
                          <option value="immo">{t('invest.holdingsClassImmo')}</option>
                          <option value="obligations">{t('invest.holdingsClassOblig')}</option>
                          <option value="actions">{t('invest.holdingsClassActions')}</option>
                          <option value="autre">{t('invest.holdingsClassAutre')}</option>
                        </select>
                      </td>
                      <td>
                        <select className="input-dark invest-holding-input" value={row.hubSegment || 'actif'} onChange={(e) => updateHolding(index, { hubSegment: e.target.value })}>
                          <option value="actif">{t('invest.holdingsSegmentActif')}</option>
                          <option value="passif">{t('invest.holdingsSegmentPassif')}</option>
                        </select>
                      </td>
                      <td>
                        {(row.hubSegment || 'actif') === 'passif' ? (
                          <input className="input-dark invest-holding-input" type="text" value={row.monthlyPassiveIncome || ''} onChange={(e) => updateHolding(index, { monthlyPassiveIncome: e.target.value })} placeholder="Ex. 450€ / mois" />
                        ) : <span className="hint" style={{ margin: 0 }}>—</span>}
                      </td>
                      <td><input className="input-dark invest-holding-input" type="text" value={row.asset} onChange={(e) => updateHolding(index, { asset: e.target.value })} placeholder="Ex. BTC" /></td>
                      <td><input className="input-dark invest-holding-input" list="inv-gecko-presets" type="text" value={row.geckoId || ''} onInput={(e) => updateHoldingGeckoId(index, e.currentTarget.value)} onChange={(e) => updateHoldingGeckoId(index, e.currentTarget.value)} placeholder="bitcoin" autoComplete="off" /></td>
                      <td><input className="input-dark invest-holding-input" type="text" value={fmtC(parseAmount(row.computedValue || '0'))} readOnly placeholder="Ex. 34 400€" /></td>
                      <td><input className="input-dark invest-holding-input" type="text" value={row.quantity} onChange={(e) => updateHolding(index, { quantity: e.target.value, value: '' })} placeholder="Ex. 0.82" /></td>
                      <td><input className="input-dark invest-holding-input" type="text" value={row.avgPrice} onChange={(e) => updateHolding(index, { avgPrice: e.target.value, value: '' })} placeholder="Ex. 42 000€" /></td>
                      <td>
                        <div className="inv-sale-cell">
                          <input className="input-dark invest-holding-input" type="text" value={row.sellPrice || ''} onChange={(e) => {
                            const nextSell = e.target.value;
                            const qty = parseAmount(row.quantity || row.qty || 0) || 1;
                            const buy = parseAmount(row.avgPrice || row.buyAvg || 0);
                            const sale = parseAmount(nextSell);
                            const result = Number.isFinite(qty) && Number.isFinite(buy) && Number.isFinite(sale) ? ((sale - buy) * qty) : 0;
                            updateHolding(index, { sellPrice: nextSell, saleResult: String(Math.round(result * 100) / 100) });
                          }} placeholder="Prix de vente" />
                          <button type="button" className="btn-inv-sale-live" onClick={() => fetchLiveSellPrice(index)} disabled={classLabel(row) !== 'crypto'} title={classLabel(row) === 'crypto' ? "Remplir le prix de vente au cours CoinGecko actuel (€ par unité). Nécessite l'ID CoinGecko." : "Cours automatique disponible uniquement pour les cryptos via CoinGecko."}>Cours</button>
                        </div>
                      </td>
                      <td><input className="input-dark invest-holding-input" type="date" value={row.sellDate || row.saleDate || ''} onChange={(e) => updateHolding(index, { sellDate: e.target.value, saleDate: e.target.value })} /></td>
                      <td><input className="input-dark invest-holding-input" type="text" value={row.saleResult || ''} onChange={(e) => updateHolding(index, { saleResult: e.target.value })} placeholder="Résultat" /></td>
                      <td><input className="input-dark invest-holding-input" type="text" value={row.notes || ''} onChange={(e) => updateHolding(index, { notes: e.target.value })} placeholder="Notes" /></td>
                      <td><button type="button" className="link-del" onClick={() => removeHolding(index)}>×</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="toolbar" style={{ marginTop: '1rem' }}>
              <button type="button" className="btn btn-gold" onClick={addHolding}>{t('invest.holdingsAddLine')}</button>
            </div>
            <p className="hint">{t('invest.holdingsHint')}</p>
          </div>
          {(() => {
            const passiveRows = openHoldings.filter((r) => r.hubSegment === 'passif');
            const immoPassiveRows = passiveRows.filter((r) => classLabel(r) === 'immo');
            const totalMonthly = passiveRows.reduce((sum, r) => sum + parseAmount(r.monthlyPassiveIncome || 0), 0);
            const immoMonthly = immoPassiveRows.reduce((sum, r) => sum + parseAmount(r.monthlyPassiveIncome || 0), 0);
            if (passiveRows.length === 0) return null;
            return (
              <div className="card" style={{ marginTop: '1rem' }}>
                <h2>{t('invest.passiveIncomeTitle')}</h2>
                <div className="stats-row" style={{ marginBottom: 0 }}>
                  <div className="stat-box">
                    <div className="v">{fmtC(totalMonthly)}</div>
                    <div className="l">{t('invest.passiveIncomeMonthly')}</div>
                  </div>
                  <div className="stat-box">
                    <div className="v">{fmtC(totalMonthly * 12)}</div>
                    <div className="l">{t('invest.passiveIncomeAnnual')}</div>
                  </div>
                  {immoPassiveRows.length > 0 && (
                    <div className="stat-box">
                      <div className="v">{fmtC(immoMonthly)}</div>
                      <div className="l">{t('invest.passiveIncomeImmo')}</div>
                    </div>
                  )}
                  <div className="stat-box">
                    <div className="v">{passiveRows.length}</div>
                    <div className="l">{t('invest.passiveIncomePositions')}</div>
                  </div>
                </div>
              </div>
            );
          })()}
        </section>

        <section className={`page ${page === 'immo' ? 'active' : ''}`}>
          <h1 className="page-title">{t('invest.immo')}</h1>
          <p className="page-sub">{t('invest.immoSub')}</p>
          <div className="immo-section-label">{t('invest.immoFicheLabel')}</div>
          <div className="card">
            <h2>{t('invest.immoFicheTitle')}</h2>
            <div className="immo-tool-row">
              <div style={{ flex: '1 1 18rem', minWidth: '18rem' }}>
                <label htmlFor="immo-select-fiche">{t('invest.immoFicheActive')}</label>
                <select id="immo-select-fiche" className="input-dark immo-active-select" value={activePropertyId} onChange={(e) => switchImmoProperty(e.target.value)}>
                  {(immoCalc.propertyOrder || ['p0']).map((pid) => <option key={pid} value={pid}>{immoProperties[pid]?.name || pid}</option>)}
                </select>
              </div>
              <button type="button" className="btn btn-ghost" onClick={renameImmoFiche}>{t('invest.immoFicheRename')}</button>
              <button type="button" className="btn btn-ghost" onClick={duplicateImmoProperty}>{t('invest.immoFicheDuplicate')}</button>
              <button type="button" className="btn" onClick={addImmoProperty}>{t('invest.immoFicheAdd')}</button>
            </div>
            <p className="hint" style={{ marginTop: 0 }}>{t('invest.immoFicheHint')} <strong>{activeProperty.name}</strong>.</p>
          </div>

          <div className="immo-section-label">{t('invest.immoGlobalLabel')}</div>
          <div className="card">
            <h2>{t('invest.immoIndexTitle')}</h2>
            <div className="grid-2">
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem', paddingBottom: '0.75rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                  <input type="checkbox" id="immo-idx-on" checked={!!immoGlobal.indexation.on} onChange={(e) => setImmoGlobal('indexation', 'on', e.target.checked)} style={{ width: 'auto', margin: 0 }} />
                  {t('invest.immoIndexActivate')}
                </label>
              </div>
              <div>
                <label htmlFor="immo-idx-pct">{t('invest.immoIndexPct')}</label>
                <input type="text" id="immo-idx-pct" className="input-dark" value={immoGlobal.indexation.pct || ''} onChange={(e) => setImmoGlobal('indexation', 'pct', e.target.value)} placeholder="ex. 1,5" />
              </div>
              <div>
                <label htmlFor="immo-idx-years">{t('invest.immoIndexYears')}</label>
                <input type="text" id="immo-idx-years" className="input-dark" value={immoGlobal.indexation.years || ''} onChange={(e) => setImmoGlobal('indexation', 'years', e.target.value)} placeholder="ex. 10" />
              </div>
            </div>
            <p className="hint" id="immo-idx-out">{indexationText}</p>
          </div>

          <div className="immo-section-label">{t('invest.immoExportLabel')}</div>
          <div className="card">
            <h2>{t('invest.immoExportTitle')}</h2>
            <div className="immo-tool-row">
              <button type="button" className="btn" onClick={exportImmoTsv}>{t('invest.immoExportTsv')}</button>
              <button type="button" className="btn btn-ghost" onClick={downloadImmoCsv}>{t('invest.immoExportCsv')}</button>
            </div>
          </div>

          <div className="card">
            <h2>{t('invest.immoMemoTitle')}</h2>
            <div className="immo-check-grid">
              {IMMO_CHECKS.map((doc) => (
                <label key={doc.k} className="memo-check"><input type="checkbox" checked={!!activeProperty.checklist?.[doc.k]} onChange={(e) => setImmoChecklist(doc.k, e.target.checked)} /><span>{doc.l}</span></label>
              ))}
            </div>
            <p className="hint">{t('invest.immoMemoHint')}</p>
          </div>

          <div className="immo-section-label">{t('invest.immoDataLabel')}</div>
          <div className="card">
            <h2>{t('invest.immoDataTitle')}</h2>
            <div className="grid-2">
              <div>
                <label htmlFor="immo-prix">{t('invest.immoPrice')}</label>
                <input type="text" id="immo-prix" className="input-dark immo-persist" value={immoField(activeFields, 'immo-prix')} onChange={(e) => setImmoField('immo-prix', e.target.value)} placeholder="ex. 280000" />
              </div>
              <div>
                <label htmlFor="immo-frais-pct">{t('invest.immoFeesPct')}</label>
                <input type="text" id="immo-frais-pct" className="input-dark immo-persist" value={immoField(activeFields, 'immo-frais-pct')} onChange={(e) => setImmoField('immo-frais-pct', e.target.value)} placeholder="ex. 8" />
              </div>
              <div>
                <label htmlFor="immo-travaux">{t('invest.immoWorks')}</label>
                <input type="text" id="immo-travaux" className="input-dark immo-persist" value={immoField(activeFields, 'immo-travaux')} onChange={(e) => setImmoField('immo-travaux', e.target.value)} placeholder="ex. 15000" />
              </div>
              <div>
                <label htmlFor="immo-ltv">{t('invest.immoLtv')}</label>
                <input type="text" id="immo-ltv" className="input-dark immo-persist" value={immoField(activeFields, 'immo-ltv')} onChange={(e) => setImmoField('immo-ltv', e.target.value)} placeholder="ex. 80 — 0 = tout comptant" />
              </div>
              <div>
                <label htmlFor="immo-taux">{t('invest.immoRate')}</label>
                <input type="text" id="immo-taux" className="input-dark immo-persist" value={immoField(activeFields, 'immo-taux')} onChange={(e) => setImmoField('immo-taux', e.target.value)} placeholder="ex. 3,5" />
              </div>
              <div>
                <label htmlFor="immo-duree">{t('invest.immoDuration')}</label>
                <input type="text" id="immo-duree" className="input-dark immo-persist" value={immoField(activeFields, 'immo-duree')} onChange={(e) => setImmoField('immo-duree', e.target.value)} placeholder="ex. 20" />
              </div>
              <div>
                <label htmlFor="immo-charges">{t('invest.immoCharges')}</label>
                <input type="text" id="immo-charges" className="input-dark immo-persist" value={immoField(activeFields, 'immo-charges')} onChange={(e) => setImmoField('immo-charges', e.target.value)} placeholder="ex. 2400" />
              </div>
              <div>
                <label htmlFor="immo-frais-vente">{t('invest.immoSaleFees')}</label>
                <input type="text" id="immo-frais-vente" className="input-dark immo-persist" value={immoField(activeFields, 'immo-frais-vente')} onChange={(e) => setImmoField('immo-frais-vente', e.target.value)} placeholder="ex. 7" />
              </div>
              <div>
                <label htmlFor="immo-tmi">{t('invest.immoTmi')}</label>
                <input type="text" id="immo-tmi" className="input-dark immo-persist" value={immoField(activeFields, 'immo-tmi')} onChange={(e) => setImmoField('immo-tmi', e.target.value)} placeholder="ex. 30 — 0 pour ignorer" />
              </div>
              <div>
                <label htmlFor="immo-abatt">{t('invest.immoAbatt')}</label>
                <input type="text" id="immo-abatt" className="input-dark immo-persist" value={immoField(activeFields, 'immo-abatt')} onChange={(e) => setImmoField('immo-abatt', e.target.value)} placeholder="ex. 30 (nu) ou 50 (meublé micro-BIC)" />
              </div>
            </div>
            <p className="hint" id="immo-base-recap">{immoBase.prix > 0 ? <>Budget total acquisition : <strong>{fmtC2(immoBase.totalProjet)}</strong> — apport <strong>{fmtC2(immoBase.apport)}</strong>, mensualité <strong>{fmtC2(immoBase.mens)}</strong>/mo (<strong>{fmtC2(immoBase.annCredit)}</strong>/an).</> : t('invest.immoBaseRecapEmpty')}</p>
          </div>

          <div className="immo-section-label">{t('invest.immoScenariosLabel')}</div>
          <div className="grid-2 immo-scenario-grid">
            <div className="card immo-scen">
              <h3>{t('invest.immoS1Title')}</h3>
              <label htmlFor="immo-s1-loyer">{t('invest.immoS1Loyer')}</label>
              <input type="text" id="immo-s1-loyer" className="input-dark immo-persist" value={immoField(activeFields, 'immo-s1-loyer')} onChange={(e) => setImmoField('immo-s1-loyer', e.target.value)} placeholder="ex. 950" />
              <label htmlFor="immo-s1-vac">{t('invest.immoS1Vac')}</label>
              <input type="text" id="immo-s1-vac" className="input-dark immo-persist" value={immoField(activeFields, 'immo-s1-vac')} onChange={(e) => setImmoField('immo-s1-vac', e.target.value)} placeholder="ex. 8" />
              <div className="immo-scen-out" id="immo-out-s1">{rentalMini(immoResult.details.row1)}</div>
            </div>
            <div className="card immo-scen">
              <h3>{t('invest.immoS2Title')}</h3>
              <label htmlFor="immo-s2-nb">{t('invest.immoS2Nb')}</label>
              <input type="text" id="immo-s2-nb" className="input-dark immo-persist" value={immoField(activeFields, 'immo-s2-nb')} onChange={(e) => setImmoField('immo-s2-nb', e.target.value)} placeholder="ex. 3" />
              <label htmlFor="immo-s2-loyer">{t('invest.immoS2Loyer')}</label>
              <input type="text" id="immo-s2-loyer" className="input-dark immo-persist" value={immoField(activeFields, 'immo-s2-loyer')} onChange={(e) => setImmoField('immo-s2-loyer', e.target.value)} placeholder="ex. 420" />
              <label htmlFor="immo-s2-vac">{t('invest.immoS2Vac')}</label>
              <input type="text" id="immo-s2-vac" className="input-dark immo-persist" value={immoField(activeFields, 'immo-s2-vac')} onChange={(e) => setImmoField('immo-s2-vac', e.target.value)} placeholder="ex. 10" />
              <div className="immo-scen-out" id="immo-out-s2">{rentalMini(immoResult.details.row2)}</div>
            </div>
            <div className="card immo-scen">
              <h3>{t('invest.immoS3Title')}</h3>
              <label htmlFor="immo-s3-nuits">{t('invest.immoS3Nuits')}</label>
              <input type="text" id="immo-s3-nuits" className="input-dark immo-persist" value={immoField(activeFields, 'immo-s3-nuits')} onChange={(e) => setImmoField('immo-s3-nuits', e.target.value)} placeholder="ex. 18" />
              <label htmlFor="immo-s3-prix">{t('invest.immoS3Prix')}</label>
              <input type="text" id="immo-s3-prix" className="input-dark immo-persist" value={immoField(activeFields, 'immo-s3-prix')} onChange={(e) => setImmoField('immo-s3-prix', e.target.value)} placeholder="ex. 85" />
              <label htmlFor="immo-s3-com">{t('invest.immoS3Com')}</label>
              <input type="text" id="immo-s3-com" className="input-dark immo-persist" value={immoField(activeFields, 'immo-s3-com')} onChange={(e) => setImmoField('immo-s3-com', e.target.value)} placeholder="ex. 35" />
              <div className="immo-scen-out" id="immo-out-s3">{rentalMini(immoResult.details.row3)}</div>
              <p className="hint">{t('invest.immoS3Hint')}</p>
            </div>
            <div className="card immo-scen">
              <h3>{t('invest.immoS4Title')}</h3>
              <label htmlFor="immo-s4-pay">{t('invest.immoS4Pay')}</label>
              <input type="text" id="immo-s4-pay" className="input-dark immo-persist" value={immoField(activeFields, 'immo-s4-pay')} onChange={(e) => setImmoField('immo-s4-pay', e.target.value)} placeholder="ex. 800" />
              <label htmlFor="immo-s4-rec">{t('invest.immoS4Rec')}</label>
              <input type="text" id="immo-s4-rec" className="input-dark immo-persist" value={immoField(activeFields, 'immo-s4-rec')} onChange={(e) => setImmoField('immo-s4-rec', e.target.value)} placeholder="ex. 1200" />
              <div className="immo-scen-out" id="immo-out-s4">{rentalMini(immoResult.details.row4)}</div>
              <p className="hint">{t('invest.immoS4Hint')}</p>
            </div>
            <div className="card immo-scen">
              <h3>{t('invest.immoS5Title')}</h3>
              <label htmlFor="immo-s5-ans">{t('invest.immoS5Ans')}</label>
              <input type="text" id="immo-s5-ans" className="input-dark immo-persist" value={immoField(activeFields, 'immo-s5-ans')} onChange={(e) => setImmoField('immo-s5-ans', e.target.value)} placeholder="ex. 7" />
              <label htmlFor="immo-s5-revalo">{t('invest.immoS5Revalo')}</label>
              <input type="text" id="immo-s5-revalo" className="input-dark immo-persist" value={immoField(activeFields, 'immo-s5-revalo')} onChange={(e) => setImmoField('immo-s5-revalo', e.target.value)} placeholder="ex. 2" />
              <label htmlFor="immo-s5-loyer">{t('invest.immoS5Loyer')}</label>
              <input type="text" id="immo-s5-loyer" className="input-dark immo-persist" value={immoField(activeFields, 'immo-s5-loyer')} onChange={(e) => setImmoField('immo-s5-loyer', e.target.value)} placeholder="ex. 0 ou 900" />
              <label htmlFor="immo-s5-vac">{t('invest.immoS5Vac')}</label>
              <input type="text" id="immo-s5-vac" className="input-dark immo-persist" value={immoField(activeFields, 'immo-s5-vac')} onChange={(e) => setImmoField('immo-s5-vac', e.target.value)} placeholder="ex. 5" />
              <div className="immo-scen-out" id="immo-out-s5"><div className="immo-mini-stats">{miniStat(t('invest.immoS5Gross'), fmtC2(immoResult.details.gross5))}{miniStat(t('invest.immoS5Cf'), fmtC2(immoResult.details.annualCf5), immoResult.details.annualCf5 >= 0 ? 'pos' : 'neg')}{miniStat(t('invest.immoS5SaleNet'), fmtC2(immoResult.details.saleNet5))}{miniStat(t('invest.immoS5Profit'), fmtC2(immoResult.details.profit5), immoResult.details.profit5 >= 0 ? 'pos' : 'neg')}</div><p className="hint">{t('invest.immoS5Eq')} : <strong>{fmtC2(immoResult.details.eq5)}</strong> — {t('invest.immoS5Crd')} : {fmtC2(immoResult.details.bal5)}.</p>{immoRentabilityBadge(immoResult.details.profit5, t('invest.immoGainLabel'))}</div>
            </div>
            <div className="card immo-scen">
              <h3>{t('invest.immoS6Title')}</h3>
              <label htmlFor="immo-s6-mois">{t('invest.immoS6Mois')}</label>
              <input type="text" id="immo-s6-mois" className="input-dark immo-persist" value={immoField(activeFields, 'immo-s6-mois')} onChange={(e) => setImmoField('immo-s6-mois', e.target.value)} placeholder="ex. 14" />
              <label htmlFor="immo-s6-plus">{t('invest.immoS6Plus')}</label>
              <input type="text" id="immo-s6-plus" className="input-dark immo-persist" value={immoField(activeFields, 'immo-s6-plus')} onChange={(e) => setImmoField('immo-s6-plus', e.target.value)} placeholder="ex. 12" />
              <div className="immo-scen-out" id="immo-out-s6"><div className="immo-mini-stats">{miniStat(t('invest.immoS6SaleNet'), fmtC2(immoResult.details.saleNet6))}{miniStat(t('invest.immoS6Charges'), fmtC2(-immoResult.details.cumCf6), 'neg')}{miniStat(t('invest.immoS6Profit'), fmtC2(immoResult.details.profit6), immoResult.details.profit6 >= 0 ? 'pos' : 'neg')}{miniStat(t('invest.immoS6Eq'), fmtC2(immoResult.details.eq6), immoResult.details.eq6 >= 0 ? 'pos' : 'neg')}</div>{immoRentabilityBadge(immoResult.details.profit6, t('invest.immoGainLabel'))}</div>
              <p className="hint">{t('invest.immoS6Hint')}</p>
            </div>
            <div className="card immo-scen">
              <h3>{t('invest.immoS7Title')}</h3>
              <label htmlFor="immo-s7-travaux">{t('invest.immoS7Travaux')}</label>
              <input type="text" id="immo-s7-travaux" className="input-dark immo-persist" value={immoField(activeFields, 'immo-s7-travaux')} onChange={(e) => setImmoField('immo-s7-travaux', e.target.value)} placeholder="ex. 45000" />
              <label htmlFor="immo-s7-lots">{t('invest.immoS7Lots')}</label>
              <input type="text" id="immo-s7-lots" className="input-dark immo-persist" value={immoField(activeFields, 'immo-s7-lots')} onChange={(e) => setImmoField('immo-s7-lots', e.target.value)} placeholder="ex. 2" />
              <label htmlFor="immo-s7-prixlot">{t('invest.immoS7Prixlot')}</label>
              <input type="text" id="immo-s7-prixlot" className="input-dark immo-persist" value={immoField(activeFields, 'immo-s7-prixlot')} onChange={(e) => setImmoField('immo-s7-prixlot', e.target.value)} placeholder="ex. 195000" />
              <label htmlFor="immo-s7-delai">{t('invest.immoS7Delai')}</label>
              <input type="text" id="immo-s7-delai" className="input-dark immo-persist" value={immoField(activeFields, 'immo-s7-delai')} onChange={(e) => setImmoField('immo-s7-delai', e.target.value)} placeholder="ex. 24" />
              <div className="immo-scen-out" id="immo-out-s7"><div className="immo-mini-stats">{miniStat(t('invest.immoS7Total'), fmtC2(immoResult.details.total7))}{miniStat(t('invest.immoS7Apport'), fmtC2(immoResult.details.apport7))}{miniStat(t('invest.immoS7SaleNet'), fmtC2(immoResult.details.saleNet7))}{miniStat(t('invest.immoS7Profit'), fmtC2(immoResult.details.profit7), immoResult.details.profit7 >= 0 ? 'pos' : 'neg')}</div><p className="hint">{t('invest.immoS7Eq')} : <strong>{fmtC2(immoResult.details.eq7)}</strong> — {t('invest.immoS7Mens')} : {fmtC2(immoResult.details.mens7)}/mo.</p>{immoRentabilityBadge(immoResult.details.profit7, t('invest.immoGainLabel'))}</div>
              <p className="hint">{t('invest.immoS7Hint')}</p>
            </div>
            <div className="card immo-scen">
              <h3>{t('invest.immoS8Title')}</h3>
              <label htmlFor="immo-s8-prime">{t('invest.immoS8Prime')}</label>
              <input type="text" id="immo-s8-prime" className="input-dark immo-persist" value={immoField(activeFields, 'immo-s8-prime')} onChange={(e) => setImmoField('immo-s8-prime', e.target.value)} placeholder="ex. 5000" />
              <label htmlFor="immo-s8-prix">{t('invest.immoS8Prix')}</label>
              <input type="text" id="immo-s8-prix" className="input-dark immo-persist" value={immoField(activeFields, 'immo-s8-prix')} onChange={(e) => setImmoField('immo-s8-prix', e.target.value)} placeholder="ex. 260000" />
              <label htmlFor="immo-s8-mois">{t('invest.immoS8Mois')}</label>
              <input type="text" id="immo-s8-mois" className="input-dark immo-persist" value={immoField(activeFields, 'immo-s8-mois')} onChange={(e) => setImmoField('immo-s8-mois', e.target.value)} placeholder="ex. 6" />
              <div className="immo-scen-out" id="immo-out-s8"><div className="immo-mini-stats">{miniStat(t('invest.immoS8Engagement'), fmtC2(immoResult.details.prime8))}{miniStat(t('invest.immoS8Duration'), String(Math.round(immoResult.details.mois8)))}{miniStat(t('invest.immoS8CostPerMonth'), fmtC2(immoResult.details.prime8 / immoResult.details.mois8), 'neg')}{miniStat(t('invest.immoS8Target'), immoResult.details.prix8 > 0 ? fmtC2(immoResult.details.prix8) : '—')}</div>{immoRentabilityBadge(immoResult.details.prix8 - immoBase.totalProjet - immoResult.details.prime8, t('invest.immoEcartLabel'))}</div>
              <p className="hint">{t('invest.immoS8Hint')}</p>
            </div>
          </div>

          <div className="immo-section-label">{t('invest.immoCompareLabel')}</div>
          <div className="card">
            <h2>{t('invest.immoCompareTitle')}</h2>
            <p className="hint" style={{ marginTop: 0 }}>{t('invest.immoCompareHint')}</p>
            <div style={{ overflowX: 'auto' }}>
              <table className="immo-compare">
                <thead>
                  <tr>
                    <th>{t('invest.immoCompareColScenario')}</th>
                    <th className="num">{t('invest.immoCompareColBrut')}</th>
                    <th className="num">{t('invest.immoCompareColCf')}</th>
                    <th className="num">{t('invest.immoCompareColRBrut')}</th>
                    <th className="num">{t('invest.immoCompareColRNet')}</th>
                    <th>{t('invest.immoCompareColNote')}</th>
                  </tr>
                </thead>
                <tbody>
                  {immoBase.prix <= 0 ? <tr><td colSpan="6" className="hint">{t('invest.immoCompareEmpty')}</td></tr> : immoCompareRows.map((row, index) => (
                    <tr key={`${row.label}-${index}`} className={`${row.stress ? 'stress-row' : ''} ${!row.stress && immoBest && row.label === immoBest.label ? 'best' : ''}`}>
                      <td>{row.label}</td>
                      <td className="num">{fmtC2(row.brut)}</td>
                      <td className="num">{row.score != null ? fmtC2(row.cf) : '—'}</td>
                      <td className="num">{formatPct(row.rBrut)}</td>
                      <td className="num">{row.apportForYield > 0 ? formatPct(row.rNet) : '—'}</td>
                      <td>{row.remark}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card">
            <h2>{t('invest.immoMultiTitle')}</h2>
            <p className="hint" style={{ marginTop: 0 }}>{t('invest.immoMultiHint')}</p>
            <div style={{ overflowX: 'auto' }}>
              <table className="immo-compare immo-multi">
                <thead>
                  <tr>
                    <th>{t('invest.immoMultiColFiche')}</th>
                    <th className="num">{t('invest.immoMultiColPrix')}</th>
                    <th>{t('invest.immoMultiColBest')}</th>
                    <th className="num">{t('invest.immoMultiColIndic')}</th>
                    <th className="num">{t('invest.immoMultiColRNet')}</th>
                  </tr>
                </thead>
                <tbody>
                  {immoMultiRows.map((row) => row.empty ? (
                    <tr key={row.pid}><td>{row.name}</td><td className="num">—</td><td colSpan="3" className="hint">{t('invest.immoMultiEmpty')}</td></tr>
                  ) : (
                    <tr key={row.pid}>
                      <td>{row.name}</td>
                      <td className="num">{fmtC2(row.prix)}</td>
                      <td>{row.best?.label || '—'}</td>
                      <td className="num">{row.best?.score != null ? fmtC2(row.best.cf) : '—'}</td>
                      <td className="num">{row.best?.apportForYield > 0 ? formatPct(row.best.rNet) : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className={`page ${page === 'monthly' ? 'active' : ''}`}>
          <h1 className="page-title">{t('invest.monthlyTitle')}</h1>
          <p className="page-sub">{t('invest.monthlySub2')}</p>
          <div className="toolbar" style={{ marginBottom: '1rem' }}>
            <label htmlFor="inv-mo-month" style={{ display: 'inline-block', marginRight: '0.5rem' }}>{t('invest.monthlyMonthLabel')}</label>
            <input type="month" id="inv-mo-month" className="input-dark" style={{ maxWidth: '12rem', display: 'inline-block' }} value={selectedMonth} onChange={(e) => update({ monthlyMonth: e.target.value })} />
          </div>
          {(() => {
            const passiveRows = openHoldings.filter((r) => r.hubSegment === 'passif');
            const monthPassiveTotal = passiveRows.reduce((sum, r) => sum + parseAmount(r.monthlyPassiveIncome || 0), 0);
            const monthGain = annualGainsByMonth[selectedMonth] || 0;
            if (passiveRows.length === 0 && monthGain === 0) return null;
            return (
              <div className="stats-row" style={{ marginBottom: '1rem' }}>
                {monthPassiveTotal > 0 && <div className="stat-box"><div className="v pos">{fmtC(monthPassiveTotal)}</div><div className="l">{t('invest.monthlyPassiveLabel')}</div></div>}
                {monthPassiveTotal > 0 && <div className="stat-box"><div className="v">{fmtC(monthPassiveTotal * 12)}</div><div className="l">{t('invest.monthlyPassiveAnnualLabel')}</div></div>}
                {monthGain > 0 && <div className="stat-box"><div className="v pos">{fmtC(monthGain)}</div><div className="l">{t('invest.monthlyGainLabel')}</div></div>}
              </div>
            );
          })()}
          <div className="card">
            <label htmlFor="inv-mo-sum">{t('invest.monthlySumLabel')}</label>
            <textarea id="inv-mo-sum" rows="4" className="input-dark" value={monthlySnapshot.monthlySummary || ''} onChange={(e) => setMonthlyField('monthlySummary', e.target.value)} />
            <label htmlFor="inv-mo-lesson">{t('invest.monthlyLessonLabel')}</label>
            <textarea id="inv-mo-lesson" rows="3" className="input-dark" value={monthlySnapshot.monthlyLesson || ''} onChange={(e) => setMonthlyField('monthlyLesson', e.target.value)} />
            <label htmlFor="inv-mo-next">{t('invest.monthlyNextLabel')}</label>
            <textarea id="inv-mo-next" rows="3" className="input-dark" value={monthlySnapshot.monthlyNext || ''} onChange={(e) => setMonthlyField('monthlyNext', e.target.value)} />
          </div>
        </section>

        <section className={`page ${page === 'annual' ? 'active' : ''}`}>
          <h1 className="page-title">{t('invest.annualTitle')}</h1>
          <p className="page-sub">{t('invest.annualSub2')}</p>
          <div className="toolbar" style={{ marginBottom: '1rem' }}>
            <label htmlFor="inv-annual-year" style={{ display: 'inline-block', marginRight: '0.5rem' }}>{t('invest.annualYearLabel')}</label>
            <input type="number" id="inv-annual-year" className="input-dark" min="2020" max="2100" step="1" style={{ maxWidth: '10rem', display: 'inline-block' }} value={selectedAnnualYear} onChange={(e) => update({ annualYear: e.target.value })} />
            <span className="hint" style={{ margin: 0 }}>{annualFilledMonths}/12 {t('invest.annualMonthsFilled')}</span>
          </div>
          <div className="card table-wrap">
            <table className="immo-compare invest-annual-table">
              <thead>
                  <tr>
                    <th>{t('invest.annualColMonth')}</th>
                    <th>{t('invest.annualColGain')}</th>
                    <th>{t('invest.annualColMovements')}</th>
                    <th>{t('invest.annualColLesson')}</th>
                    <th>{t('invest.annualColNext')}</th>
                </tr>
              </thead>
              <tbody>
                {annualRows.map((row) => (
                  <tr key={row.key}>
                    <td>{row.month}</td>
                    <td className="num"><strong className={row.gain >= 0 ? 'pos' : 'neg'}>{fmtC2(row.gain || 0)}</strong></td>
                    <td>{row.movements || <span className="hint">—</span>}</td>
                    <td>{row.lesson || <span className="hint">—</span>}</td>
                    <td>{row.next || <span className="hint">—</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="grid-2" style={{ marginTop: '1rem' }}>
            <div className="card">
              <h2>{t('invest.annualPrideTitle')}</h2>
              <textarea className="input-dark" rows="4" value={data.annualPride || ''} onChange={(e) => update({ annualPride: e.target.value })} placeholder={t('invest.annualPridePlaceholder')} />
            </div>
            <div className="card">
              <h2>{t('invest.annualLessonsTitle')}</h2>
              <textarea className="input-dark" rows="4" value={data.annualLessons || ''} onChange={(e) => update({ annualLessons: e.target.value })} placeholder={t('invest.annualLessonsPlaceholder')} />
            </div>
            <div className="card">
              <h2>{t('invest.annualAdjustmentsTitle')}</h2>
              <textarea className="input-dark" rows="4" value={data.annualAdjustments || ''} onChange={(e) => update({ annualAdjustments: e.target.value })} placeholder={t('invest.annualAdjustmentsPlaceholder')} />
            </div>
            <div className="card">
              <h2>{t('invest.annualNextFocusTitle')}</h2>
              <textarea className="input-dark" rows="4" value={data.annualNextFocus || ''} onChange={(e) => update({ annualNextFocus: e.target.value })} placeholder={t('invest.annualNextFocusPlaceholder')} />
            </div>
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
              <div className="field-block"><label>Moyenne du projet</label><input className="input-dark invest-project-input" type="text" value={`${projectAverage.toLocaleString('fr-FR')} / 10`} readOnly /></div>
            </div>
            <div className="stats-row" style={{ marginTop: '1rem' }}>
              <div className="stat-box"><div className={`v ${projectVerdictClass}`}>{projectAverage.toLocaleString('fr-FR')} / 10</div><div className="l">Moyenne calculée</div></div>
              <div className="stat-box"><div className={`v ${projectVerdictClass}`}>{projectVerdictLabel}</div><div className="l">Verdict automatique</div></div>
              <div className="stat-box"><div className="v">{projectArchives.length}</div><div className="l">Projet(s) enregistré(s)</div></div>
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
            <div className="toolbar" style={{ marginTop: '1rem' }}>
              <button type="button" className="btn" onClick={saveProjectAnalysis}>Enregistrer ce projet</button>
              <button type="button" className="btn btn-ghost" onClick={resetProjectAnalysis}>Nouveau projet</button>
            </div>
            <p className="hint"><strong>Calcul :</strong> moyenne automatique des 6 critères notés sur 10. Les archives restent enregistrées quand tu démarres un nouveau projet.</p>
          </div>

          <div className="card portfolio-card portfolio-card--large" style={{ marginTop: '1rem' }}>
            <h2>Projets enregistrés</h2>
            {projectArchives.length ? (
              <div className="table-wrap">
                <table className="immo-compare invest-project-archive-table">
                  <thead>
                    <tr>
                      <th>Projet</th>
                      <th className="num">Moyenne</th>
                      <th>Date</th>
                      <th>Verdict</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projectArchives.map((project) => (
                      <tr key={project.id || `${project.name}-${project.savedAt}`}>
                        <td>{project.name || 'Projet sans nom'}</td>
                        <td className="num">{Number(project.average || 0).toLocaleString('fr-FR')} / 10</td>
                        <td>{project.savedAt ? new Date(project.savedAt).toLocaleDateString('fr-FR') : '—'}</td>
                        <td>{project.verdict || <span className="hint">—</span>}</td>
                        <td>
                          <div className="btn-row" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            <button type="button" className="btn btn-ghost" onClick={() => loadProjectAnalysis(project)}>Recharger</button>
                            <button type="button" className="btn btn-ghost" onClick={() => deleteProjectAnalysis(project.id)}>Supprimer</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : <p className="hint">Aucun projet enregistré pour l'instant.</p>}
          </div>
        </section>
      </main>
    </div>
  );
}
