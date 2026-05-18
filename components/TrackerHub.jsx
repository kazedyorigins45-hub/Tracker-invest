"use client";

import Link from 'next/link';
import React, { useEffect } from 'react';
import { canAccess, getSubscriptionLabel } from '@/lib/plans';
import { useAccountPayload } from '@/lib/use-account-payload';
import { useLocale } from '@/lib/locale';
import LogoMark from '@/components/LogoMark';
import ThemeToggle from '@/components/ThemeToggle';
import LanguageToggle from '@/components/LanguageToggle';

const NAV = [
  ['cover', 'tracker.coverTitle'],
  ['mindset', 'tracker.mindsetTitle'],
  ['plan', 'tracker.planTitle'],
  ['weekly', 'tracker.weeklyTitle'],
  ['monthly', 'tracker.monthlyReview'],
  ['quarter', 'tracker.quarter'],
  ['year', 'tracker.yearTitle'],
  ['series20', 'tracker.series'],
];

const SERIES20_CELLS = ['date', 'symbol', 'side', 'entry', 'sl', 'tp', 'result', 'emotion', 'tvUrl'];
const ANALYSIS_LABELS = ['Opportunités marché', 'Technologie', 'Écosystème', 'Roadmap', 'Présence sociale & marketing', 'Performance & momentum'];

const MORNING_ITEMS_FR = ['Revue rapide du plan', 'Respiration / recentrage', 'Lecture des niveaux clés', 'Aucun trade impulsif'];
const MORNING_ITEMS_EN = ['Quick review of the plan', 'Breathing / reset', 'Read key levels', 'No impulsive trade'];
const COMMITMENT_ITEMS_FR = ['Je respecte ma discipline', 'Je coupe vite les pertes', 'Je n’ajoute pas sous émotion', 'Je stoppe si je ne suis pas concentré'];
const COMMITMENT_ITEMS_EN = ['I keep my discipline', 'I cut losses quickly', 'I do not add under emotion', 'I stop if I am not focused'];
const FX_EUR_USD = 1.1;

function monthKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function parseAmount(value) {
  const n = Number(String(value ?? '').replace(/\s+/g, '').replace(',', '.'));
  return Number.isFinite(n) ? n : null;
}

function computeTradeResult(row) {
  const entry = parseAmount(row.entry);
  const exit = parseAmount(row.exit);
  const lots = parseAmount(row.lots) ?? 1;
  if (entry == null || exit == null || !Number.isFinite(lots)) return null;
  const raw = row.direction === 'short' ? (entry - exit) * lots : (exit - entry) * lots;
  return Number.isFinite(raw) ? Number(raw.toFixed(2)) : null;
}

function withAutoTradeResult(row) {
  const auto = computeTradeResult(row);
  return auto == null ? row : { ...row, result: String(auto) };
}

function isoWeekKey(dateString) {
  if (!dateString) return '';
  const date = new Date(`${dateString}T00:00:00`);
  if (Number.isNaN(date.getTime())) return '';
  const utc = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = utc.getUTCDay() || 7;
  utc.setUTCDate(utc.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(utc.getUTCFullYear(), 0, 1));
  const week = Math.ceil((((utc - yearStart) / 86400000) + 1) / 7);
  return `${utc.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}

function toStoredAmount(value, isEnglish) {
  if (!isEnglish) return value;
  const n = parseAmount(value);
  if (n == null) return value;
  return String(n / FX_EUR_USD);
}

function toDisplayAmount(value, isEnglish) {
  if (!isEnglish) return value || '';
  const n = parseAmount(value);
  if (n == null) return value || '';
  return String(Number((n * FX_EUR_USD).toFixed(2)));
}

function formatMoney(value, isEnglish) {
  const n = parseAmount(value);
  if (n == null) return value || '0.00';
  return Number((n * (isEnglish ? FX_EUR_USD : 1)).toFixed(2)).toLocaleString(isEnglish ? 'en-US' : 'fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatCalcNumber(value, locale = 'fr-FR', maximumFractionDigits = 2) {
  if (!Number.isFinite(value)) return '—';
  return value.toLocaleString(locale, { minimumFractionDigits: 0, maximumFractionDigits });
}

function computePositionSizing(data) {
  const mode = data.positionCalcMode === 'asset' ? 'asset' : 'forex';
  const capital = parseAmount(data.positionCapital);
  const riskPercent = parseAmount(data.positionRiskPercent);
  const riskAmount = capital != null && riskPercent != null ? capital * (riskPercent / 100) : null;

  if (capital == null || capital <= 0 || riskPercent == null || riskPercent <= 0 || riskAmount == null || riskAmount <= 0) {
    return { mode, valid: false, message: 'Renseigne un capital et un risque % supérieurs à 0.' };
  }

  if (mode === 'forex') {
    const stopLossPips = parseAmount(data.positionStopLossPips);
    const pipValue = parseAmount(data.positionPipValue) ?? 10;
    if (stopLossPips == null || stopLossPips <= 0 || pipValue == null || pipValue <= 0) {
      return { mode, valid: false, riskAmount, message: 'Renseigne un Stop Loss en pips et une valeur du pip supérieurs à 0.' };
    }
    const lots = riskAmount / (stopLossPips * pipValue);
    return { mode, valid: Number.isFinite(lots), riskAmount, lots, stopLossPips, pipValue };
  }

  const entryPrice = parseAmount(data.positionEntryPrice);
  const stopLossPrice = parseAmount(data.positionStopLossPrice);
  if (entryPrice == null || entryPrice <= 0 || stopLossPrice == null || stopLossPrice <= 0 || entryPrice === stopLossPrice) {
    return { mode, valid: false, riskAmount, message: 'Renseigne un prix d’entrée et un prix Stop Loss différents et supérieurs à 0.' };
  }
  const stopLossDistancePercent = Math.abs(entryPrice - stopLossPrice) / entryPrice;
  if (!Number.isFinite(stopLossDistancePercent) || stopLossDistancePercent <= 0) {
    return { mode, valid: false, riskAmount, message: 'La distance au Stop Loss doit être supérieure à 0.' };
  }
  const positionAmount = riskAmount / stopLossDistancePercent;
  return { mode, valid: Number.isFinite(positionAmount), riskAmount, entryPrice, stopLossPrice, stopLossDistancePercent, positionAmount };
}

function computeTradePositionSizing(row) {
  const mapped = {
    positionCalcMode: row.positionMode || row.positionCalcMode || 'forex',
    positionCapital: row.positionCapital,
    positionRiskPercent: row.positionRiskPercent,
    positionStopLossPips: row.stopLossPips,
    positionPipValue: row.pipValue || '10',
    positionEntryPrice: row.entry,
    positionStopLossPrice: row.stopLossPrice,
  };
  return computePositionSizing(mapped);
}

function buildMonthlyAutoMap(trades = []) {
  return trades.reduce((acc, row) => {
    const month = String(row.date || '').slice(0, 7);
    if (!month || month.length < 7) return acc;
    const result = parseAmount(row.result);
    const bucket = acc[month] || { trades: [], count: 0, net: 0, wins: 0, losses: 0 };
    bucket.trades.push({ ...row, result: result ?? row.result });
    if (result != null) {
      bucket.count += 1;
      bucket.net += result;
      if (result > 0) bucket.wins += 1;
      if (result < 0) bucket.losses += 1;
    }
    acc[month] = bucket;
    return acc;
  }, {});
}

function buildAnnualAutoRows(year, monthlyByMonth = {}, isEnglish) {
  const monthsFr = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
  const monthsEn = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const monthLabels = isEnglish ? monthsEn : monthsFr;
  return monthLabels.map((label, index) => {
    const monthKeyValue = `${year || new Date().getFullYear()}-${String(index + 1).padStart(2, '0')}`;
    const monthly = monthlyByMonth?.[monthKeyValue] || {};
    return {
      month: label,
      trades: monthly.monthlyTradesTotal ?? '',
      winners: monthly.monthlyWinnersLosers ? String(monthly.monthlyWinnersLosers).split('/')[0]?.trim() || '' : '',
      losers: monthly.monthlyWinnersLosers ? String(monthly.monthlyWinnersLosers).split('/')[1]?.trim() || '' : '',
      performance: monthly.monthlyGlobalResult != null ? String(monthly.monthlyGlobalResult) : '',
      emotions: monthly.monthlyEmotion || '',
      lesson: monthly.monthlyLesson || '',
    };
  });
}

function defaultTrackerState() {
  return {
    page: 'cover',
    journalName: '',
    journalPeriod: '',
    journalObjective: '',
    mindsetDreamLife: '',
    mindsetMeans: '',
    mindsetGoalShort: '',
    mindsetGoalMedium: '',
    mindsetGoalLong: '',
    mindsetMantras: '',
    mindsetTargetState: '',
    mindsetPitfalls: '',
    mindsetIntent: '',
    mindsetPerformanceRested: false,
    mindsetPerformanceAligned: false,
    mindsetPerformanceNoEmotion: false,
    mindsetMorningRoutine: [false, false, false, false],
    mindsetCommitments: [false, false, false, false],
    tradingPlanVision: '',
    tradingPlanGoals: '',
    tradingPlanAvailability: '',
    tradingPlanRiskBudget: '',
    tradingPlanMarkets: '',
    tradingPlanRiskPerTrade: '',
    tradingPlanDailyLoss: '',
    tradingPlanWeeklyLoss: '',
    tradingPlanSizing: '',
    tradingPlanSessions: '',
    tradingPlanTimeframes: '',
    tradingPlanInstruments: '',
    positionCalcMode: 'forex',
    positionCapital: '',
    positionRiskPercent: '',
    positionStopLossPips: '',
    positionPipValue: '10',
    positionEntryPrice: '',
    positionStopLossPrice: '',
    tradingPlanSetups: '',
    tradingPlanEntries: '',
    tradingPlanExits: '',
    tradingPlanNever: '',
    weeklyMonth: '',
    weeklyWeek: '',
    weeklyTrades: [],
    weeklyNotes: '',
    monthlyMonth: '',
    monthlyByMonth: {},
    monthlyCapital: '',
    monthlyBest: '',
    monthlyEmotion: '',
    monthlyRatio: '',
    monthlyLesson: '',
    monthlyResult: '',
    monthlyGoal: '',
    monthlyFeel: '',
    monthlyGood: '',
    monthlyBad: '',
    monthlyNext: '',
    quarterTheme: '',
    quarterLesson: '',
    quarterChange: '',
    quarterYear: '',
    quarterNumber: '1',
    quarterByKey: {},
    quarterSuccesses: '',
    quarterEmotionScore: 0,
    quarterEmotionReason: '',
    quarterImprove: '',
    quarterGoalsReeval: '',
    quarterShortTerm: 'oui',
    quarterShortPrecision: '',
    quarterCommitment: '',
    quarterSummary: '',
    quarterLessons: '',
    quarterStrategy: '',
    quarterForward: '',
    annualYear: '',
    annualRows: [],
    seriesHistory: [],
    seriesHistoryLabel: '',
    seriesP1: [],
    seriesP2: [],
    seriesPlan: '',
    seriesEmotion: '',
    seriesLesson: '',
    seriesNext: '',
    yearResult: '',
    yearDiscipline: '',
    yearFocus: '',
    seriesName: '',
    seriesObservation: '',
    seriesDecision: '',
    analysisName: '',
    analysisScores: [0, 0, 0, 0, 0, 0],
    analysisVerdict: '',
  };
}

function defaultProfileState() {
  return {
    current: 'default',
    labels: {
      default: 'Compte principal',
      alt: 'Compte secondaire',
    },
  };
}

export default function TrackerHub({ userEmail = '', planCode = 'starter', subscription = null }) {
  const [profileState, setProfileState] = useAccountPayload('trackerHub_profiles_v1', defaultProfileState());
  const profile = profileState.current || 'default';
  const [data, setData] = useAccountPayload(`trackerHub_v2_${profile}`, defaultTrackerState());
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const closeSidebar = () => setSidebarOpen(false);

  const page = data.page === 'tradingPlan' ? 'plan' : (data.page || 'cover');
  const subscriptionLabel = getSubscriptionLabel(subscription, planCode);
  const { t, locale } = useLocale();
  const isEnglish = locale === 'en';
  const currencySymbol = isEnglish ? '$' : '€';
  const currencyUnit = `${currencySymbol}/u`;
  const morningItems = locale === 'en' ? MORNING_ITEMS_EN : MORNING_ITEMS_FR;
  const commitmentItems = locale === 'en' ? COMMITMENT_ITEMS_EN : COMMITMENT_ITEMS_FR;
  const profileLabel = profileState.labels?.[profile] || (profile === 'alt' ? t('tracker.profileSecondary') : t('tracker.profilePrimary'));
  const journalMeta = {
    name: data.journalName || '',
    period: data.journalPeriod || '',
    mainGoal: data.journalObjective || '',
    ...(data.journalMeta || {}),
  };
  const selectedMonth = data.monthlyMonth || monthKey();
  const refMonthlySnapshot = data.monthly?.[selectedMonth] || {};
  const monthlySnapshot = {
    monthlyCapital: refMonthlySnapshot.capital || '',
    monthlyBest: refMonthlySnapshot.best || '',
    monthlyEmotion: refMonthlySnapshot.emotion || '',
    monthlyRatio: refMonthlySnapshot.ratioManual || '',
    monthlyLesson: refMonthlySnapshot.lesson || '',
    monthlyResult: refMonthlySnapshot.resultManual || '',
    monthlyGoal: refMonthlySnapshot.goal || '',
    monthlyFeel: refMonthlySnapshot.feel || '',
    monthlyGood: refMonthlySnapshot.good || '',
    monthlyBad: refMonthlySnapshot.bad || '',
    monthlyNext: refMonthlySnapshot.next || '',
    ...(data.monthlyByMonth?.[selectedMonth] || {}),
  };
  const quarterKey = `${data.quarterYear || new Date().getFullYear()}-Q${data.quarterNumber || '1'}`;
  const quarterDefaults = {
    quarterSuccesses: '', quarterEmotionScore: 0, quarterEmotionReason: '', quarterImprove: '', quarterGoalsReeval: '', quarterShortTerm: 'oui', quarterShortPrecision: '', quarterCommitment: '', quarterSummary: '', quarterLessons: '', quarterStrategy: '', quarterForward: '',
  };
  const quarterSnapshot = { ...quarterDefaults, ...(data.quarterByKey?.[quarterKey] || {}) };

  const update = (patch) => setData((prev) => ({ ...prev, ...patch }));
  const setJournalMeta = (key, value) => setData((prev) => {
    const flatKey = key === 'mainGoal' ? 'journalObjective' : key === 'name' ? 'journalName' : 'journalPeriod';
    return { ...prev, [flatKey]: value, journalMeta: { ...(prev.journalMeta || {}), [key]: value } };
  });
  const notify = (msg) => {
    if (typeof window !== 'undefined') window.setTimeout(() => update({ feedback: msg }), 0);
  };
  const setWeeklyMonth = (ym) => {
    if (!ym) { update({ weeklyMonth: '', weeklyWeek: '' }); return; }
    const firstDay = ym + '-01';
    const week = isoWeekKey(firstDay);
    update({ weeklyMonth: ym, weeklyWeek: week });
  };
  const weeklyTrades = Array.isArray(data.weeklyTrades) ? data.weeklyTrades : [];
  const selectedWeeklyMonth = data.weeklyMonth || '';
  const selectedWeeklyWeek = data.weeklyWeek || '';
  const weeklyNotesKey = selectedWeeklyWeek || selectedWeeklyMonth || monthKey();
  const weeklyNotesValue = typeof data.weeklyNotes === 'object' && data.weeklyNotes !== null ? (data.weeklyNotes[weeklyNotesKey] || '') : (data.weeklyNotes || data.weeklyNotesText || '');
  const visibleWeeklyTrades = weeklyTrades
    .map((row, originalIndex) => ({ row, originalIndex }))
    .filter(({ row }) => {
      if (selectedWeeklyMonth) return String(row.date || '').slice(0, 7) === selectedWeeklyMonth;
      return true;
    });
  const monthlyAutoMap = buildMonthlyAutoMap(weeklyTrades);
  const monthlyAutoSnapshot = monthlyAutoMap[selectedMonth] || { count: 0, net: 0, wins: 0, losses: 0 };
  const updateWeeklyTrade = (index, patch) => {
    const next = weeklyTrades.map((row, rowIndex) => {
      if (rowIndex !== index) return row;
      const merged = { ...row, ...patch };
      return merged;
    });
    update({ weeklyTrades: next });
  };
  const addWeeklyTrade = () => {
    const ym = data.weeklyMonth || monthKey();
    const parts = ym.split('-').map(Number);
    const today = new Date();
    let dateStr;
    if (today.getFullYear() === parts[0] && today.getMonth() + 1 === parts[1]) {
      dateStr = today.toISOString().slice(0, 10);
    } else {
      dateStr = ym + '-01';
    }
    update({ weeklyTrades: [...weeklyTrades, { date: dateStr, asset: '', direction: 'long', positionMode: 'forex', positionCapital: '', positionRiskPercent: '', stopLossPips: '', pipValue: '10', stopLossPrice: '', assetPrice: '', lots: '', entry: '', exit: '', rr: '', result: '', emotion: '', comment: '', tvUrl: '' }] });
  };
  const removeWeeklyTrade = (index) => {
    update({ weeklyTrades: weeklyTrades.filter((_, rowIndex) => rowIndex !== index) });
  };
  const toggleMindsetCheck = (key) => update({ [key]: !data[key] });
  const updateMindsetRoutine = (index, checked) => update({ mindsetMorningRoutine: (data.mindsetMorningRoutine || [false, false, false, false]).map((item, itemIndex) => (itemIndex === index ? checked : item)) });
  const updateMindsetCommitment = (index, checked) => update({ mindsetCommitments: (data.mindsetCommitments || [false, false, false, false]).map((item, itemIndex) => (itemIndex === index ? checked : item)) });
  const updateProfile = (patch) => setProfileState((prev) => ({ ...prev, ...patch }));

  const setMonthlyField = (key, value) => {
    setData((prev) => {
      const month = prev.monthlyMonth || monthKey();
      const bucket = prev.monthlyByMonth?.[month] || {};
      const refKeyMap = {
        monthlyCapital: 'capital', monthlyBest: 'best', monthlyEmotion: 'emotion', monthlyRatio: 'ratioManual', monthlyLesson: 'lesson', monthlyResult: 'resultManual', monthlyGoal: 'goal', monthlyFeel: 'feel', monthlyGood: 'good', monthlyBad: 'bad', monthlyNext: 'next',
      };
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

  const setQuarterField = (key, value) => {
    setData((prev) => {
      const qk = `${prev.quarterYear || new Date().getFullYear()}-Q${prev.quarterNumber || '1'}`;
      const bucket = prev.quarterByKey?.[qk] || {};
      return { ...prev, quarterByKey: { ...(prev.quarterByKey || {}), [qk]: { ...bucket, [key]: value } } };
    });
  };

  const setAnnualField = (index, key, value) => {
    setData((prev) => {
      const next = Array.isArray(prev.annualRows) && prev.annualRows.length ? prev.annualRows.slice() : buildAnnualAutoRows(prev.annualYear, prev.monthlyByMonth, isEnglish);
      next[index] = { ...(next[index] || {}), [key]: value };
      return { ...prev, annualRows: next };
    });
  };

  const updateSeriesRow = (partKey, index, key, value) => {
    setData((prev) => {
      const next = (prev[partKey] || []).slice();
      while (next.length < 10) next.push(normalizeS20Row());
      next[index] = { ...(next[index] || normalizeS20Row()), [key]: value };
      return { ...prev, [partKey]: next };
    });
  };

  const updateAnalysisScore = (index, value) => {
    setData((prev) => {
      const next = Array.isArray(prev.analysisScores) ? prev.analysisScores.slice() : [0, 0, 0, 0, 0, 0];
      if (value === '') {
        next[index] = '';
      } else {
        next[index] = Math.max(0, Math.min(10, Number(value) || 0));
      }
      return { ...prev, analysisScores: next };
    });
  };

  useEffect(() => {
    const autoByMonth = buildMonthlyAutoMap(Array.isArray(data.weeklyTrades) ? data.weeklyTrades : []);
    setData((prev) => {
      const nextMonthly = { ...(prev.monthlyByMonth || {}) };
      let changed = false;

      Object.entries(autoByMonth).forEach(([month, bucket]) => {
        const winrate = bucket.count ? Math.round((bucket.wins / bucket.count) * 100) : 0;
        const bestTrade = bucket.trades.reduce((best, row) => {
          const r = parseAmount(row.result);
          const currentBest = parseAmount(best?.result);
          if (r == null) return best;
          if (currentBest == null) return row;
          return r > currentBest ? row : best;
        }, null);
        const dominantEmotion = bucket.trades.reduce((map, row) => {
          const key = String(row.emotion || '').trim();
          if (!key) return map;
          map[key] = (map[key] || 0) + 1;
          return map;
        }, {});
        const emotion = Object.entries(dominantEmotion).sort((a, b) => b[1] - a[1])[0]?.[0] || '';
        const wins = bucket.wins;
        const losses = bucket.losses;
        const ratio = losses ? `${wins} / ${losses}` : `${wins} / 0`;
        const existing = nextMonthly[month] || {};
        const autoFields = {
          monthlyTradesTotal: bucket.count,
          monthlyGlobalResult: bucket.net,
          monthlyWinrate: winrate,
          monthlyWinnersLosers: `${wins} / ${losses}`,
          monthlyBest: bestTrade?.asset ? `${bestTrade.asset}${bestTrade.result != null ? ` (${bestTrade.result})` : ''}` : '',
          monthlyEmotion: emotion,
          monthlyRatio: ratio,
        };
        const merged = { ...existing, ...autoFields };
        if (JSON.stringify(existing) !== JSON.stringify(merged)) {
          nextMonthly[month] = merged;
          changed = true;
        }
      });

      return changed ? { ...prev, monthlyByMonth: nextMonthly } : prev;
    });
  }, [data.weeklyTrades, setData]);

  useEffect(() => {
    const autoRows = buildAnnualAutoRows(data.annualYear, data.monthlyByMonth, isEnglish);
    setData((prev) => {
      const current = Array.isArray(prev.annualRows) ? prev.annualRows : [];
      const synced = autoRows.map((row, index) => ({ ...(current[index] || {}), ...row }));
      return JSON.stringify(current) === JSON.stringify(synced) ? prev : { ...prev, annualRows: synced };
    });
  }, [data.annualYear, data.monthlyByMonth, isEnglish, setData]);

  const normalizeS20Row = (row = {}) => ({
    date: row.date || '',
    symbol: row.symbol || '',
    side: row.side || 'long',
    entry: row.entry || '',
    sl: row.sl || '',
    tp: row.tp || '',
    result: row.result || '',
    emotion: row.emotion || '',
    tvUrl: row.tvUrl || '',
  });

  const ensureS20Rows = (rows = []) => {
    const next = rows.slice(0, 10).map(normalizeS20Row);
    while (next.length < 10) next.push(normalizeS20Row());
    return next;
  };

  const switchProfile = (nextProfile) => {
    updateProfile({ current: nextProfile });
  };

  const renameCurrentProfile = () => {
    if (typeof window === 'undefined') return;
    const currentLabel = profileState.labels?.[profile] || profileLabel;
    const nextLabel = window.prompt(t('tracker.profileRename'), currentLabel);
    if (nextLabel === null) return;
    const trimmed = nextLabel.trim();
    if (!trimmed) return;
    updateProfile({ labels: { ...(profileState.labels || {}), [profile]: trimmed } });
  };

  const weeklyStats = visibleWeeklyTrades.reduce((acc, { row }) => {
    const result = Number(String(row.result || '').replace(',', '.'));
    if (Number.isFinite(result) && result !== 0) {
      acc.count += 1;
      acc.net += result;
      if (result > 0) acc.wins += 1;
      if (result < 0) acc.losses += 1;
      if (result > 0) acc.grossWins += result;
      if (result < 0) acc.grossLosses += Math.abs(result);
    }
    return acc;
  }, { count: 0, net: 0, wins: 0, losses: 0, grossWins: 0, grossLosses: 0 });
  const weeklyWinrate = weeklyStats.count ? Math.round((weeklyStats.wins / weeklyStats.count) * 100) : 0;
  const weeklyProfitFactor = weeklyStats.grossLosses > 0 ? weeklyStats.grossWins / weeklyStats.grossLosses : null;
  const annualBaseRows = buildAnnualAutoRows(data.annualYear, data.monthlyByMonth, isEnglish);
  const annualRows = annualBaseRows.map((autoRow, index) => ({ ...(data.annualRows?.[index] || {}), ...autoRow }));
  const sizingResult = computePositionSizing(data);
  const numberLocale = isEnglish ? 'en-US' : 'fr-FR';
  const seriesP1 = Array.isArray(data.seriesP1) ? data.seriesP1 : [];
  const seriesP2 = Array.isArray(data.seriesP2) ? data.seriesP2 : [];
  const series20Part1 = ensureS20Rows(seriesP1);
  const series20Part2 = ensureS20Rows(seriesP2);
  const analysisScores = Array.isArray(data.analysisScores) && data.analysisScores.length === 6 ? data.analysisScores : [0, 0, 0, 0, 0, 0];
  const seriesHistory = Array.isArray(data.seriesHistory) ? data.seriesHistory : [];
  const seriesStats = [...series20Part1, ...series20Part2].reduce((acc, row) => {
    const value = Number(String(row.result || '').replace(',', '.'));
    if (Number.isFinite(value) && value !== 0) {
      if (value > 0) acc.wins += 1;
      if (value < 0) acc.losses += 1;
      acc.net += value;
      if (value > 0) acc.grossWins += value;
      if (value < 0) acc.grossLosses += Math.abs(value);
    }
    return acc;
  }, { wins: 0, losses: 0, net: 0, grossWins: 0, grossLosses: 0 });
  const seriesWinrate = seriesStats.wins + seriesStats.losses ? Math.round((seriesStats.wins / (seriesStats.wins + seriesStats.losses)) * 100) : 0;
  const seriesProfitFactor = seriesStats.grossLosses > 0 ? seriesStats.grossWins / seriesStats.grossLosses : 0;
  const analysisAverage = Math.round((analysisScores.reduce((a, b) => a + Number(b || 0), 0) / analysisScores.length) * 10) / 10;

  useEffect(() => {
    if (page === 'analysis') update({ page: 'cover' });
  }, [page]);

  return (
    <div className="mindset-shell tracker-hub">
      <aside className={`sidebar${sidebarOpen ? ' sidebar--open' : ''}`}>
        <div className="sidebar-close" onClick={closeSidebar} aria-label="Fermer le menu">✕</div>
        <div className="brand">
          <div className="tag">ELITE TRACKER</div>
          <Link href="/dashboard" className="brand-link"><h1>Elite Tracker</h1></Link>
          <p className="tracker-quote">Carnet &amp; discipline</p>
          <p className="app-plan">Abonnement : {subscriptionLabel}</p>
        </div>

        <nav className="sidebar-apps" aria-label="Navigation site">
          <div className="sidebar-apps-label">Espaces</div>
          <Link href="/" className="app-link">Accueil &amp; abonnements</Link>
          <Link href="/tracker" className="app-link is-current">Trading — Elite Tracker</Link>
          <Link href="/mindset" className="app-link">Mindset Invest</Link>
          {canAccess(planCode, 'invest') ? <Link href="/invest" className="app-link">Investissement — Elite Invest</Link> : null}
          {canAccess(planCode, 'portfolio') ? <Link href="/portfolio" className="app-link">Mes investissements</Link> : null}
        </nav>

        <div className="profile-bar">
          <label htmlFor="trk-profile">Profil</label>
          <select id="trk-profile" value={profile} onChange={(e) => switchProfile(e.target.value)}>
            <option value="default">{profileState.labels?.default || 'Compte principal'}</option>
            <option value="alt">{profileState.labels?.alt || 'Compte secondaire'}</option>
          </select>
          <div className="btn-row">
            <button type="button" className="btn btn-ghost" onClick={() => switchProfile(profile === 'default' ? 'alt' : 'default')}>+ Profil</button>
            <button type="button" className="btn btn-ghost" onClick={renameCurrentProfile}>Renommer</button>
          </div>
        </div>

        <div className="sidebar-inner">
          {NAV.map(([key, label]) => (
            <button key={key} type="button" className={`nav-item ${page === key ? 'active' : ''}`} onClick={() => update({ page: key })}>
              {key === 'analysis' ? (locale === 'en' ? 'Project analysis' : 'Analyse de projet') : t(label)}
            </button>
          ))}
        </div>

        <div className="sidebar-bottom">
          <p className="app-plan">{profileLabel}</p>
          <span style={{ wordBreak: 'break-all' }}>{userEmail}</span>
          <form action="/api/auth/logout" method="post">
            <button type="submit" className="sidebar-logout">Déconnexion</button>
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
          <LanguageToggle className="theme-toggle--app" />
        </div>
        <section className={`page ${page === 'cover' ? 'active' : ''}`}>
          <span className="dec-arrow" aria-hidden="true">↗</span>
          <h1 className="page-title">Du mental au profit</h1>
          <p className="page-hero">Tout commence par ton mindset. Ce carnet t’accompagne vers la rigueur, la clarté et la croissance — pour ce profil d’investissement.</p>
          <div className="card">
            <h2>Journal de trading &amp; développement personnel</h2>
            <div className="grid-3 tracker-cover-grid" style={{ marginTop: '1rem' }}>
              <div className="field-block">
                <label>Nom</label>
                <input className="input-dark tracker-cover-input" type="text" value={journalMeta.name || ''} onChange={(e) => setJournalMeta('name', e.target.value)} placeholder="Ton nom" />
              </div>
              <div className="field-block">
                <label>Période</label>
                <input className="input-dark tracker-cover-input" type="text" value={journalMeta.period || ''} onChange={(e) => setJournalMeta('period', e.target.value)} placeholder="ex. 2026 — T1" />
              </div>
              <div className="field-block">
                <label>Objectif principal</label>
                <input className="input-dark tracker-cover-input" type="text" value={journalMeta.mainGoal || ''} onChange={(e) => setJournalMeta('mainGoal', e.target.value)} placeholder="Objectif clé" />
              </div>
            </div>
            <p className="quote-footer">« Au milieu de chaque difficulté se trouve une opportunité. » — Albert Einstein</p>
          </div>
        </section>

        <section className={`page ${page === 'monthly' ? 'active' : ''}`}>
          <h1 className="page-title">{t('tracker.monthlyReview')}</h1>
          <p className="page-sub">{t('tracker.monthlyReviewSub')}</p>
          <div className="toolbar">
            <div>
              <label htmlFor="mo-month">{t('tracker.monthlyMonth')}</label>
              <input type="month" id="mo-month" className="input-dark tracker-date-input tracker-date-mini" value={selectedMonth} onChange={(e) => update({ monthlyMonth: e.target.value })} />
            </div>
          </div>

          <div className="stats-row" id="mo-stats">
            <div className="stat-box"><div className="v">{monthlyAutoSnapshot.count || 0}</div><div className="l">{t('tracker.monthlyTradesTotal')}</div></div>
            <div className="stat-box"><div className={`v ${(monthlyAutoSnapshot.net || 0) >= 0 ? 'pos' : 'neg'}`}>{formatMoney(monthlyAutoSnapshot.net || 0, isEnglish)} {currencySymbol}</div><div className="l">{t('tracker.monthlyGlobalResult')}</div></div>
            <div className="stat-box"><div className="v">{monthlyAutoSnapshot.count ? Math.round((monthlyAutoSnapshot.wins / monthlyAutoSnapshot.count) * 100) : 0}%</div><div className="l">{t('tracker.monthlyWinrate')}</div></div>
            <div className="stat-box"><div className="v">{monthlyAutoSnapshot.wins || 0} / {monthlyAutoSnapshot.losses || 0}</div><div className="l">{t('tracker.monthlyWinnersLosers')}</div></div>
          </div>

          <div className="grid-2">
            <div className="card">
              <label htmlFor="mo-capital">{t('tracker.monthlyCapitalStart')}</label>
              <input type="text" id="mo-capital" className="input-dark tracker-monthly-single" value={monthlySnapshot.monthlyCapital || ''} onChange={(e) => setMonthlyField('monthlyCapital', e.target.value)} />
              <label htmlFor="mo-best">{t('tracker.monthlyBestTrade')}</label>
              <textarea id="mo-best" rows="2" className="input-dark portfolio-note" value={monthlySnapshot.monthlyBest || monthlyAutoSnapshot.monthlyBest || ''} onChange={(e) => setMonthlyField('monthlyBest', e.target.value)} />
              <label htmlFor="mo-emotion">{t('tracker.monthlyEmotion')}</label>
              <input type="text" id="mo-emotion" className="input-dark tracker-monthly-single" value={monthlySnapshot.monthlyEmotion || monthlyAutoSnapshot.monthlyEmotion || ''} onChange={(e) => setMonthlyField('monthlyEmotion', e.target.value)} />
            </div>
            <div className="card">
              <label htmlFor="mo-ratio-manual">{t('tracker.monthlyRatio')}</label>
              <input type="text" id="mo-ratio-manual" className="input-dark tracker-monthly-single" value={monthlySnapshot.monthlyRatio || monthlyAutoSnapshot.monthlyRatio || ''} onChange={(e) => setMonthlyField('monthlyRatio', e.target.value)} placeholder="Auto affiché dans les stats ci-dessus" />
              <label htmlFor="mo-lesson">{t('tracker.monthlyLesson')}</label>
              <textarea id="mo-lesson" rows="3" className="input-dark portfolio-note" value={monthlySnapshot.monthlyLesson || ''} onChange={(e) => setMonthlyField('monthlyLesson', e.target.value)} />
              <label htmlFor="mo-result-manual">{t('tracker.monthlyResult')}</label>
              <input type="text" id="mo-result-manual" className="input-dark tracker-monthly-single" value={monthlySnapshot.monthlyResult || formatMoney(monthlyAutoSnapshot.net || 0, isEnglish) || ''} onChange={(e) => setMonthlyField('monthlyResult', e.target.value)} placeholder="Synthèse manuelle" />
            </div>
          </div>

          <div className="grid-2" style={{ marginTop: '1rem' }}>
            <div className="card">
              <h2>{t('tracker.monthlyGoalTitle')}</h2>
              <label htmlFor="mo-goal">{t('tracker.monthlyGoal')}</label>
              <textarea id="mo-goal" rows="2" className="input-dark portfolio-note" value={monthlySnapshot.monthlyGoal || ''} onChange={(e) => setMonthlyField('monthlyGoal', e.target.value)} />
              <label htmlFor="mo-feel">{t('tracker.monthlyFeel')}</label>
              <textarea id="mo-feel" rows="2" className="input-dark portfolio-note" value={monthlySnapshot.monthlyFeel || ''} onChange={(e) => setMonthlyField('monthlyFeel', e.target.value)} />
            </div>
            <div className="card">
              <h2>{t('tracker.monthlyAnalysisTitle')}</h2>
              <label htmlFor="mo-good">{t('tracker.monthlyGood')}</label>
              <textarea id="mo-good" rows="2" className="input-dark portfolio-note" value={monthlySnapshot.monthlyGood || ''} onChange={(e) => setMonthlyField('monthlyGood', e.target.value)} />
              <label htmlFor="mo-bad">{t('tracker.monthlyBad')}</label>
              <textarea id="mo-bad" rows="2" className="input-dark portfolio-note" value={monthlySnapshot.monthlyBad || ''} onChange={(e) => setMonthlyField('monthlyBad', e.target.value)} />
            </div>
          </div>

          <div className="card" style={{ marginTop: '1rem' }}>
            <h2>{t('tracker.monthlyNextTitle')}</h2>
            <textarea id="mo-next" rows="3" className="input-dark portfolio-note" value={monthlySnapshot.monthlyNext || ''} onChange={(e) => setMonthlyField('monthlyNext', e.target.value)} />
          </div>
          <p className="quote-footer">« Ce que tu fais chaque jour t’amène là où tu seras demain. »</p>
        </section>

        <section className={`page ${page === 'mindset' ? 'active' : ''}`}>
          <h1 className="page-title">{t('tracker.mindsetTitle')}</h1>
          <p className="page-sub">{t('tracker.mindsetSub')}</p>
          <div className="grid-2 tracker-mindset-grid">
            <article className="card tracker-mindset-card">
              <h2>{t('tracker.mindsetDreamLife')}</h2>
              <textarea className="input-dark portfolio-note tracker-mindset-textarea" rows="4" value={data.mindsetDreamLife || ''} onChange={(e) => update({ mindsetDreamLife: e.target.value })} placeholder={t('tracker.mindsetDreamLifePlaceholder')} />
            </article>
            <article className="card tracker-mindset-card">
              <h2>{t('tracker.mindsetMeans')}</h2>
              <textarea className="input-dark portfolio-note tracker-mindset-textarea" rows="4" value={data.mindsetMeans || ''} onChange={(e) => update({ mindsetMeans: e.target.value })} placeholder={t('tracker.mindsetMeansPlaceholder')} />
            </article>
          </div>

          <div className="card tracker-mindset-card" style={{ marginTop: '1rem' }}>
            <h2>{t('tracker.mindsetGoals')}</h2>
            <div className="grid-3 tracker-mindset-grid-3">
               <div className="field-block"><label>{t('tracker.mindsetGoalShort')}</label><textarea className="input-dark tracker-mindset-textarea" rows="3" value={data.mindsetGoalShort || ''} onChange={(e) => update({ mindsetGoalShort: e.target.value })} placeholder={t('tracker.mindsetGoalShortPlaceholder')} /></div>
               <div className="field-block"><label>{t('tracker.mindsetGoalMedium')}</label><textarea className="input-dark tracker-mindset-textarea" rows="3" value={data.mindsetGoalMedium || ''} onChange={(e) => update({ mindsetGoalMedium: e.target.value })} placeholder={t('tracker.mindsetGoalMediumPlaceholder')} /></div>
               <div className="field-block"><label>{t('tracker.mindsetGoalLong')}</label><textarea className="input-dark tracker-mindset-textarea" rows="3" value={data.mindsetGoalLong || ''} onChange={(e) => update({ mindsetGoalLong: e.target.value })} placeholder={t('tracker.mindsetGoalLongPlaceholder')} /></div>
            </div>
          </div>

          <div className="grid-2 tracker-mindset-grid" style={{ marginTop: '1rem' }}>
            <article className="card tracker-mindset-card">
              <h2>{t('tracker.mindsetMantras')}</h2>
              <textarea className="input-dark tracker-mindset-textarea" rows="4" value={data.mindsetMantras || ''} onChange={(e) => update({ mindsetMantras: e.target.value })} placeholder={t('tracker.mindsetMantrasPlaceholder')} />
            </article>
            <article className="card tracker-mindset-card">
              <h2>État cible &amp; pièges</h2>
              <label className="field-label">{t('tracker.mindsetTargetState')}</label>
              <textarea className="input-dark tracker-mindset-textarea" rows="4" value={data.mindsetTargetState || ''} onChange={(e) => update({ mindsetTargetState: e.target.value })} placeholder={t('tracker.mindsetTargetStatePlaceholder')} />
              <label className="field-label">{t('tracker.mindsetPitfalls')}</label>
              <textarea className="input-dark tracker-mindset-textarea" rows="4" value={data.mindsetPitfalls || ''} onChange={(e) => update({ mindsetPitfalls: e.target.value })} placeholder={t('tracker.mindsetPitfallsPlaceholder')} />
            </article>
          </div>

          <div className="card tracker-mindset-card" style={{ marginTop: '1rem' }}>
            <article>
              <h2>{t('tracker.mindsetPerformanceZone')}</h2>
              <div className="tracker-check-grid">
                <label><input type="checkbox" checked={!!data.mindsetPerformanceRested} onChange={() => toggleMindsetCheck('mindsetPerformanceRested')} /> {t('tracker.mindsetPerformanceRested')}</label>
                <label><input type="checkbox" checked={!!data.mindsetPerformanceAligned} onChange={() => toggleMindsetCheck('mindsetPerformanceAligned')} /> {t('tracker.mindsetPerformanceAligned')}</label>
                <label><input type="checkbox" checked={!!data.mindsetPerformanceNoEmotion} onChange={() => toggleMindsetCheck('mindsetPerformanceNoEmotion')} /> {t('tracker.mindsetPerformanceNoEmotion')}</label>
              </div>
              <label className="field-label">{t('tracker.mindsetIntent')}</label>
              <textarea className="input-dark tracker-mindset-textarea" rows="3" value={data.mindsetIntent || ''} onChange={(e) => update({ mindsetIntent: e.target.value })} placeholder={t('tracker.mindsetIntentPlaceholder')} />
            </article>
          </div>

          <div className="grid-2 tracker-mindset-grid" style={{ marginTop: '1rem' }}>
            <article className="card tracker-mindset-card">
              <h2>{t('tracker.mindsetMorningRoutine')}</h2>
              <div className="tracker-check-grid">
                {morningItems.map((item, index) => (
                  <label key={item}>
                    <input type="checkbox" checked={!!data.mindsetMorningRoutine?.[index]} onChange={(e) => updateMindsetRoutine(index, e.target.checked)} /> {item}
                  </label>
                ))}
              </div>
            </article>
            <article className="card tracker-mindset-card">
              <h2>{t('tracker.mindsetCommitments')}</h2>
              <div className="tracker-check-grid">
                {commitmentItems.map((item, index) => (
                  <label key={item}>
                    <input type="checkbox" checked={!!data.mindsetCommitments?.[index]} onChange={(e) => updateMindsetCommitment(index, e.target.checked)} /> {item}
                  </label>
                ))}
              </div>
            </article>
          </div>
        </section>

        <section className={`page ${page === 'plan' ? 'active' : ''}`}>
          <h1 className="page-title">Plan de trading</h1>
          <p className="page-hero">« Un plan de trading clarifie tes objectifs, structure ta méthode et réduit les erreurs émotionnelles. »</p>

          <div className="card">
            <h2>{t('tracker.tradingPlanVisionTitle')}</h2>
            <p className="hint" style={{ marginTop: 0 }}>{t('tracker.tradingPlanVisionHint')}</p>
            <textarea className="input-dark tracker-mindset-textarea" rows="4" value={data.tradingPlanVision || ''} onChange={(e) => update({ tradingPlanVision: e.target.value })} />
          </div>

          <div className="card" style={{ marginTop: '1rem' }}>
            <h2>{t('tracker.tradingPlanAvailabilityTitle')}</h2>
            <p className="hint" style={{ marginTop: 0 }}>{t('tracker.tradingPlanAvailabilityHint')}</p>
            <textarea className="input-dark tracker-mindset-textarea" rows="3" value={data.tradingPlanAvailability || ''} onChange={(e) => update({ tradingPlanAvailability: e.target.value })} />
          </div>

          <div className="card" style={{ marginTop: '1rem' }}>
            <h2>{t('tracker.tradingPlanRiskBudgetTitle')}</h2>
            <p className="hint" style={{ marginTop: 0 }}>{t('tracker.tradingPlanRiskBudgetHint')}</p>
            <textarea className="input-dark tracker-mindset-textarea" rows="3" value={data.tradingPlanRiskBudget || ''} onChange={(e) => update({ tradingPlanRiskBudget: e.target.value })} />
          </div>

          <div className="card" style={{ marginTop: '1rem' }}>
            <h2>{t('tracker.tradingPlanMarketsTitle')}</h2>
            <p className="hint" style={{ marginTop: 0 }}>{t('tracker.tradingPlanMarketsHint')}</p>
            <textarea className="input-dark tracker-mindset-textarea" rows="3" value={data.tradingPlanMarkets || ''} onChange={(e) => update({ tradingPlanMarkets: e.target.value })} />
          </div>

          <div className="grid-2 tracker-mindset-grid" style={{ marginTop: '1rem' }}>
            <div className="card tracker-mindset-card">
              <h2>{t('tracker.tradingPlanRiskTitle')}</h2>
              <div className="field-stack">
                 <div className="field-block"><label>{t('tracker.tradingPlanRiskPerTrade')}</label><input className="input-dark tracker-trading-input" style={{ minHeight: '2.25rem', paddingTop: '0.45rem', paddingBottom: '0.45rem' }} type="text" value={data.tradingPlanRiskPerTrade || ''} onChange={(e) => update({ tradingPlanRiskPerTrade: e.target.value })} placeholder={t('tracker.tradingPlanRiskPerTradePlaceholder')} /></div>
                 <div className="field-block"><label>{t('tracker.tradingPlanDailyLoss')}</label><input className="input-dark tracker-trading-input" style={{ minHeight: '2.25rem', paddingTop: '0.45rem', paddingBottom: '0.45rem' }} type="text" value={data.tradingPlanDailyLoss || ''} onChange={(e) => update({ tradingPlanDailyLoss: e.target.value })} placeholder={t('tracker.tradingPlanDailyLossPlaceholder')} /></div>
                 <div className="field-block"><label>{t('tracker.tradingPlanWeeklyLoss')}</label><input className="input-dark tracker-trading-input" style={{ minHeight: '2.25rem', paddingTop: '0.45rem', paddingBottom: '0.45rem' }} type="text" value={data.tradingPlanWeeklyLoss || ''} onChange={(e) => update({ tradingPlanWeeklyLoss: e.target.value })} placeholder={t('tracker.tradingPlanWeeklyLossPlaceholder')} /></div>
              </div>
            </div>

            <div className="card tracker-mindset-card">
              <h2>{t('tracker.tradingPlanSessionsTitle')}</h2>
              <label>{t('tracker.tradingPlanSessions')}</label>
              <textarea className="input-dark tracker-mindset-textarea" rows="2" style={{ minHeight: '2.25rem', paddingTop: '0.45rem', paddingBottom: '0.45rem' }} value={data.tradingPlanSessions || ''} onChange={(e) => update({ tradingPlanSessions: e.target.value })} placeholder={t('tracker.tradingPlanSessionsPlaceholder')} />
              <label style={{ marginTop: '0.6rem' }}>{t('tracker.tradingPlanTimeframes')}</label>
              <textarea className="input-dark tracker-mindset-textarea" rows="2" style={{ minHeight: '2.25rem', paddingTop: '0.45rem', paddingBottom: '0.45rem' }} value={data.tradingPlanTimeframes || ''} onChange={(e) => update({ tradingPlanTimeframes: e.target.value })} placeholder={t('tracker.tradingPlanTimeframesPlaceholder')} />
            </div>
          </div>

          <div className="card" style={{ marginTop: '1rem' }}>
            <h2>{t('tracker.tradingPlanEntriesTitle')}</h2>
            <label>{t('tracker.tradingPlanSetups')}</label>
            <textarea className="input-dark tracker-mindset-textarea" rows="3" value={data.tradingPlanSetups || ''} onChange={(e) => update({ tradingPlanSetups: e.target.value })} placeholder={t('tracker.tradingPlanSetupsPlaceholder')} />
            <label>{t('tracker.tradingPlanEntries')}</label>
            <textarea className="input-dark tracker-mindset-textarea" rows="3" value={data.tradingPlanEntries || ''} onChange={(e) => update({ tradingPlanEntries: e.target.value })} placeholder={t('tracker.tradingPlanEntriesPlaceholder')} />
          </div>

          <div className="card" style={{ marginTop: '1rem' }}>
            <h2>{t('tracker.tradingPlanExitsTitle')}</h2>
            <label>{t('tracker.tradingPlanExits')}</label>
            <textarea className="input-dark tracker-mindset-textarea" rows="3" value={data.tradingPlanExits || ''} onChange={(e) => update({ tradingPlanExits: e.target.value })} placeholder={t('tracker.tradingPlanExitsPlaceholder')} />
            <label>{t('tracker.tradingPlanNever')}</label>
            <textarea className="input-dark tracker-mindset-textarea" rows="3" value={data.tradingPlanNever || ''} onChange={(e) => update({ tradingPlanNever: e.target.value })} placeholder={t('tracker.tradingPlanNeverPlaceholder')} />
          </div>
        </section>

        <section className={`page ${page === 'weekly' ? 'active' : ''}`}>
          <h1 className="page-title">{t('tracker.weeklyTitle')}</h1>
          <p className="page-sub">{t('tracker.weeklySub')}</p>

          <div className="card" style={{ marginBottom: '1rem' }}>
            <div className="section-head" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
              <div>
                <h2>Calculateur de taille de position</h2>
                <p className="hint" style={{ marginTop: 0 }}>Visible ici dans le suivi trading : utilise FOREX pour un résultat en lots, ou CRYPTO &amp; ACTIONS pour un montant de position.</p>
              </div>
              <div className="btn-row" role="group" aria-label="Mode de calcul" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: 0 }}>
                <button type="button" className={`btn ${sizingResult.mode === 'forex' ? '' : 'btn-ghost'}`} onClick={() => update({ positionCalcMode: 'forex' })}>FOREX</button>
                <button type="button" className={`btn ${sizingResult.mode === 'asset' ? '' : 'btn-ghost'}`} onClick={() => update({ positionCalcMode: 'asset' })}>CRYPTO &amp; ACTIONS</button>
              </div>
            </div>

            <div className="grid-3 tracker-mindset-grid-3" style={{ marginTop: '1rem' }}>
              <div className="field-block"><label htmlFor="w-pos-capital">Capital du compte</label><input id="w-pos-capital" className="input-dark tracker-trading-input" type="text" inputMode="decimal" value={data.positionCapital || ''} onChange={(e) => update({ positionCapital: e.target.value })} placeholder="ex. 5000" /></div>
              <div className="field-block"><label htmlFor="w-pos-risk">Risque par trade (%)</label><input id="w-pos-risk" className="input-dark tracker-trading-input" type="text" inputMode="decimal" value={data.positionRiskPercent || ''} onChange={(e) => update({ positionRiskPercent: e.target.value })} placeholder="ex. 1" /></div>
              <div className="field-block"><label>Argent risqué</label><div className="stat-box" style={{ minHeight: '3rem' }}><div className="v">{sizingResult.riskAmount != null ? `${formatCalcNumber(sizingResult.riskAmount, numberLocale)} ${currencySymbol}` : '—'}</div></div></div>
            </div>

            {sizingResult.mode === 'forex' ? (
              <div className="grid-3 tracker-mindset-grid-3" style={{ marginTop: '1rem' }}>
                <div className="field-block"><label htmlFor="w-pos-sl-pips">Stop Loss en pips</label><input id="w-pos-sl-pips" className="input-dark tracker-trading-input" type="text" inputMode="decimal" value={data.positionStopLossPips || ''} onChange={(e) => update({ positionStopLossPips: e.target.value })} placeholder="ex. 20" /></div>
                <div className="field-block"><label htmlFor="w-pos-pip-value">Valeur du pip</label><input id="w-pos-pip-value" className="input-dark tracker-trading-input" type="text" inputMode="decimal" value={data.positionPipValue ?? '10'} onChange={(e) => update({ positionPipValue: e.target.value })} placeholder="10" /></div>
                <div className="field-block"><label>Résultat</label><div className="stat-box" style={{ minHeight: '3rem' }}><div className="v pos">{sizingResult.valid ? `${formatCalcNumber(sizingResult.lots, numberLocale, 4)} lot` : '—'}</div><div className="l">Taille recommandée</div></div></div>
              </div>
            ) : (
              <>
                <div className="grid-3 tracker-mindset-grid-3" style={{ marginTop: '1rem' }}>
                  <div className="field-block"><label htmlFor="w-pos-entry">Prix d’entrée</label><input id="w-pos-entry" className="input-dark tracker-trading-input" type="text" inputMode="decimal" value={data.positionEntryPrice || ''} onChange={(e) => update({ positionEntryPrice: e.target.value })} placeholder="ex. 60000" /></div>
                  <div className="field-block"><label htmlFor="w-pos-stop-price">Prix du Stop Loss</label><input id="w-pos-stop-price" className="input-dark tracker-trading-input" type="text" inputMode="decimal" value={data.positionStopLossPrice || ''} onChange={(e) => update({ positionStopLossPrice: e.target.value })} placeholder="ex. 57000" /></div>
                  <div className="field-block"><label>Distance au stop</label><div className="stat-box" style={{ minHeight: '3rem' }}><div className="v">{sizingResult.stopLossDistancePercent != null ? `${formatCalcNumber(sizingResult.stopLossDistancePercent * 100, numberLocale, 2)} %` : '—'}</div></div></div>
                </div>
                <div className="stats-row" style={{ marginTop: '1rem', marginBottom: 0 }}><div className="stat-box"><div className="v pos">{sizingResult.valid ? `${formatCalcNumber(sizingResult.positionAmount, numberLocale, 2)} ${currencySymbol}` : '—'}</div><div className="l">Montant de position recommandé</div></div></div>
              </>
            )}
            {!sizingResult.valid ? <p className="hint neg" style={{ marginBottom: 0 }}>{sizingResult.message || 'Renseigne les champs nécessaires pour calculer ta position.'}</p> : null}
          </div>

          <div className="toolbar">
            <div>
              <label htmlFor="w-month">{t('tracker.weeklyMonth')}</label>
              <input type="month" id="w-month" className="input-dark tracker-date-input tracker-date-mini" title="Tous les trades de ce mois apparaissent dans le tableau" value={data.weeklyMonth || ''} onChange={(e) => setWeeklyMonth(e.target.value)} />
            </div>
            <div>
              <label htmlFor="w-week">{t('tracker.weeklyWeek')}</label>
              <input type="week" id="w-week" className="input-dark tracker-date-input tracker-date-mini" title="Sert aux notes de semaine en bas de page" value={data.weeklyWeek || ''} onChange={(e) => update({ weeklyWeek: e.target.value })} />
            </div>
            <div>
              <button type="button" className="btn" onClick={addWeeklyTrade}>{t('tracker.weeklyAddTrade')}</button>
            </div>
          </div>

          <div className="stats-row" id="w-stats">
            <div className="stat-box"><div className="v">{weeklyStats.count}</div><div className="l">{t('tracker.weeklyTradesCount')}</div></div>
            <div className="stat-box"><div className={`v ${weeklyStats.net >= 0 ? 'pos' : 'neg'}`}>{formatMoney(weeklyStats.net, isEnglish)} {currencySymbol}</div><div className="l">{t('tracker.weeklyNet')}</div></div>
            <div className="stat-box"><div className="v">{weeklyWinrate.toFixed(1)} %</div><div className="l">{t('tracker.weeklyWinrate')}</div></div>
            <div className="stat-box"><div className="v">{weeklyStats.wins} / {weeklyStats.losses}</div><div className="l">{t('tracker.weeklyWinLose')}</div></div>
            <div className="stat-box"><div className="v">{weeklyStats.count ? (weeklyStats.net / weeklyStats.count).toLocaleString(isEnglish ? 'en-US' : 'fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : (isEnglish ? '0.00' : '0,00')} {currencySymbol}</div><div className="l">Moyenne / trade</div></div>
            <div className="stat-box"><div className="v">{weeklyProfitFactor == null ? '—' : weeklyProfitFactor.toFixed(2)}</div><div className="l">Facteur profit</div></div>
          </div>

          <div className="card">
            <h2>{t('tracker.weeklyTradesTitle')}</h2>
            <div className="table-wrap">
              <table className="data" id="w-trades-table">
                <thead>
                  <tr>
                    <th>{t('tracker.weeklyDate')}</th>
                    <th>{t('tracker.weeklyAsset')}</th>
                    <th>{t('tracker.weeklyDirection')}</th>
                    <th>Mode calcul</th>
                    <th>Capital</th>
                    <th>Risque %</th>
                    <th>SL pips</th>
                    <th>Valeur pip</th>
                    <th>Prix stop</th>
                    <th>Taille recommandée</th>
                    <th>{isEnglish ? `Entry (${currencyUnit})` : `Entrée (${currencyUnit})`}</th>
                    <th>{isEnglish ? `Exit (${currencyUnit})` : `Sortie (${currencyUnit})`}</th>
                    <th>{t('tracker.weeklyRR')}</th>
                    <th>{isEnglish ? `Result (${currencySymbol})` : `Résultat (${currencySymbol})`}</th>
                    <th>{t('tracker.weeklyEmotion')}</th>
                    <th>{t('tracker.weeklyComment')}</th>
                    <th>TradingView</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {visibleWeeklyTrades.map(({ row, originalIndex }) => {
                    const rowSizing = computeTradePositionSizing(row);
                    return (
                    <tr key={`${originalIndex}-${row.date || 'trade'}`}>
                      <td><input className="input-dark invest-holding-input tracker-date-input" type="date" value={row.date || ''} onChange={(e) => updateWeeklyTrade(originalIndex, { date: e.target.value })} /></td>
                      <td><input className="input-dark invest-holding-input" type="text" value={row.asset || ''} onChange={(e) => updateWeeklyTrade(originalIndex, { asset: e.target.value })} /></td>
                      <td>
                        <select className="input-dark invest-holding-input" value={row.direction || 'long'} onChange={(e) => updateWeeklyTrade(originalIndex, { direction: e.target.value })}>
                          <option value="long">Long</option>
                          <option value="short">Short</option>
                        </select>
                      </td>
                      <td>
                        <select className="input-dark invest-holding-input" value={row.positionMode || 'forex'} onChange={(e) => updateWeeklyTrade(originalIndex, { positionMode: e.target.value })}>
                          <option value="forex">FOREX</option>
                          <option value="asset">Crypto/actions</option>
                        </select>
                      </td>
                      <td><input className="input-dark invest-holding-input" type="text" inputMode="decimal" value={row.positionCapital || ''} onChange={(e) => updateWeeklyTrade(originalIndex, { positionCapital: e.target.value })} placeholder="5000" /></td>
                      <td><input className="input-dark invest-holding-input" type="text" inputMode="decimal" value={row.positionRiskPercent || ''} onChange={(e) => updateWeeklyTrade(originalIndex, { positionRiskPercent: e.target.value })} placeholder="1" /></td>
                      <td>{(row.positionMode || 'forex') === 'forex' ? <input className="input-dark invest-holding-input" type="text" inputMode="decimal" value={row.stopLossPips || ''} onChange={(e) => updateWeeklyTrade(originalIndex, { stopLossPips: e.target.value })} placeholder="20" /> : <span className="hint" style={{ margin: 0 }}>—</span>}</td>
                      <td>{(row.positionMode || 'forex') === 'forex' ? <input className="input-dark invest-holding-input" type="text" inputMode="decimal" value={row.pipValue ?? '10'} onChange={(e) => updateWeeklyTrade(originalIndex, { pipValue: e.target.value })} placeholder="10" /> : <span className="hint" style={{ margin: 0 }}>—</span>}</td>
                      <td>{(row.positionMode || 'forex') === 'asset' ? <input className="input-dark invest-holding-input" type="text" inputMode="decimal" value={toDisplayAmount(row.stopLossPrice, isEnglish)} onChange={(e) => updateWeeklyTrade(originalIndex, { stopLossPrice: toStoredAmount(e.target.value, isEnglish) })} placeholder="57000" /> : <span className="hint" style={{ margin: 0 }}>—</span>}</td>
                      <td><strong>{rowSizing.valid ? (rowSizing.mode === 'forex' ? `${formatCalcNumber(rowSizing.lots, numberLocale, 4)} lot` : `${formatCalcNumber(rowSizing.positionAmount, numberLocale, 2)} ${currencySymbol}`) : '—'}</strong></td>
                      <td><input className="input-dark invest-holding-input" type="text" value={toDisplayAmount(row.entry, isEnglish)} onChange={(e) => updateWeeklyTrade(originalIndex, { entry: toStoredAmount(e.target.value, isEnglish) })} /></td>
                      <td><input className="input-dark invest-holding-input" type="text" value={toDisplayAmount(row.exit, isEnglish)} onChange={(e) => updateWeeklyTrade(originalIndex, { exit: toStoredAmount(e.target.value, isEnglish) })} /></td>
                      <td><input className="input-dark invest-holding-input" type="text" value={row.rr || ''} onChange={(e) => updateWeeklyTrade(originalIndex, { rr: e.target.value })} /></td>
                      <td><input className="input-dark invest-holding-input" type="text" value={toDisplayAmount(row.result, isEnglish)} onChange={(e) => updateWeeklyTrade(originalIndex, { result: toStoredAmount(e.target.value, isEnglish) })} /></td>
                      <td><input className="input-dark invest-holding-input" type="text" value={row.emotion || ''} onChange={(e) => updateWeeklyTrade(originalIndex, { emotion: e.target.value })} /></td>
                      <td><input className="input-dark invest-holding-input" type="text" value={row.comment || ''} onChange={(e) => updateWeeklyTrade(originalIndex, { comment: e.target.value })} /></td>
                      <td>
                        <div className="s20-tv-stack">
                          <input className="input-dark invest-holding-input" type="url" value={row.tvUrl || ''} onChange={(e) => updateWeeklyTrade(originalIndex, { tvUrl: e.target.value })} placeholder="tradingview.com/x/…" />
                          <button type="button" className="btn-ghost btn-compact s20-tv-open" onClick={() => {
                            const u = String(row.tvUrl || '').trim();
                            if (!u) return alert('Colle d’abord le lien TradingView.');
                            window.open(u.startsWith('http') ? u : `https://${u}`, '_blank', 'noopener,noreferrer');
                          }}>Ouvrir</button>
                        </div>
                      </td>
                      <td><button type="button" className="btn btn-ghost" aria-label="Supprimer ce trade" onClick={() => removeWeeklyTrade(originalIndex)}>✕</button></td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="hint"><strong>{t('tracker.weeklyResultHintLabel')} :</strong> {isEnglish ? 'enter the total amount if needed; the table keeps your current month rows.' : 'saisis le montant total si besoin ; la table conserve tes lignes du mois en cours.'}</p>
          </div>

          <div className="card">
            <h2>{t('tracker.weeklyNotesTitle')}</h2>
            <label htmlFor="w-notes">{t('tracker.weeklyNotesLabel')}</label>
            <textarea id="w-notes" className="input-dark portfolio-note" rows="5" value={weeklyNotesValue} onChange={(e) => {
              const value = e.target.value;
              update({
                weeklyNotes: { ...(typeof data.weeklyNotes === 'object' && data.weeklyNotes !== null ? data.weeklyNotes : {}), [weeklyNotesKey]: value },
                weeklyNotesText: value,
              });
            }} />
          </div>
          <p className="quote-footer">« La régularité bat le talent quand le talent n’est pas régulier. »</p>
        </section>

        <section className={`page ${page === 'quarter' ? 'active' : ''}`}>
          <h1 className="page-title">Réflexion trimestrielle</h1>
          <p className="page-sub">Grille type carnet : réussites, émotions, axes d’amélioration, objectifs.</p>
          <div className="toolbar">
            <div>
              <label htmlFor="q-year">Année</label>
              <input type="number" id="q-year" className="input-dark tracker-quarter-input" min="2020" max="2100" step="1" value={data.quarterYear || ''} onChange={(e) => update({ quarterYear: e.target.value })} />
            </div>
            <div>
              <label htmlFor="q-n">Trimestre</label>
              <select id="q-n" className="input-dark tracker-quarter-input" value={data.quarterNumber || '1'} onChange={(e) => update({ quarterNumber: e.target.value })}>
                <option value="1">T1</option>
                <option value="2">T2</option>
                <option value="3">T3</option>
                <option value="4">T4</option>
              </select>
            </div>
          </div>

          <div className="grid-2 tracker-mindset-grid" style={{ marginTop: '1rem' }}>
            <div className="card card-q">
              <h2>Mes réussites (3 derniers mois)</h2>
              <label>Qu’ai-je bien fait ? De quoi suis-je fier ?</label>
              <textarea className="input-dark portfolio-note" rows="5" value={quarterSnapshot.quarterSuccesses || ''} onChange={(e) => setQuarterField('quarterSuccesses', e.target.value)} />
            </div>
            <div className="card card-q">
              <h2>Bilan émotionnel</h2>
              <label>Respect du plan (ressenti)</label>
              <div className="stars" id="q-stars" role="group" aria-label="Note sur 5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className={`star-btn ${Number(quarterSnapshot.quarterEmotionScore || 0) >= star ? 'is-active' : ''}`}
                    onClick={() => setQuarterField('quarterEmotionScore', star)}
                    aria-label={`${star} étoile${star > 1 ? 's' : ''}`}
                  >
                    ★
                  </button>
                ))}
              </div>
              <label>Quelle émotion a dominé ? Pourquoi ?</label>
              <textarea className="input-dark portfolio-note" rows="4" value={quarterSnapshot.quarterEmotionReason || ''} onChange={(e) => setQuarterField('quarterEmotionReason', e.target.value)} />
            </div>
            <div className="card card-q">
              <h2>Points à améliorer</h2>
              <label>Freins, erreurs récurrentes…</label>
              <textarea className="input-dark portfolio-note" rows="5" value={quarterSnapshot.quarterImprove || ''} onChange={(e) => setQuarterField('quarterImprove', e.target.value)} />
            </div>
            <div className="card card-q">
              <h2>Réévaluation des objectifs</h2>
              <label>Ajuster mes objectifs ? Mes moyens sont-ils cohérents ?</label>
              <textarea className="input-dark portfolio-note" rows="5" value={quarterSnapshot.quarterGoalsReeval || ''} onChange={(e) => setQuarterField('quarterGoalsReeval', e.target.value)} />
            </div>
            <div className="card card-q">
              <h2>Objectifs court terme atteints ?</h2>
              <div className="check-row"><input type="radio" name="q-obj" id="q-obj-y" value="oui" checked={quarterSnapshot.quarterShortTerm === 'oui'} onChange={() => setQuarterField('quarterShortTerm', 'oui')} /><label htmlFor="q-obj-y" style={{ display: 'inline' }}>Oui</label></div>
              <div className="check-row"><input type="radio" name="q-obj" id="q-obj-n" value="non" checked={quarterSnapshot.quarterShortTerm === 'non'} onChange={() => setQuarterField('quarterShortTerm', 'non')} /><label htmlFor="q-obj-n" style={{ display: 'inline' }}>Non</label></div>
              <div className="check-row"><input type="radio" name="q-obj" id="q-obj-p" value="cours" checked={quarterSnapshot.quarterShortTerm === 'cours'} onChange={() => setQuarterField('quarterShortTerm', 'cours')} /><label htmlFor="q-obj-p" style={{ display: 'inline' }}>En cours</label></div>
              <label>Précisions</label>
              <textarea className="input-dark portfolio-note" rows="3" value={quarterSnapshot.quarterShortPrecision || ''} onChange={(e) => setQuarterField('quarterShortPrecision', e.target.value)} />
            </div>
            <div className="card card-q">
              <h2>Engagement pour le trimestre suivant</h2>
              <label>Ce que je m’engage à faire</label>
              <textarea className="input-dark portfolio-note" rows="5" value={quarterSnapshot.quarterCommitment || ''} onChange={(e) => setQuarterField('quarterCommitment', e.target.value)} />
            </div>
          </div>

          <div className="card" style={{ marginTop: '1rem' }}>
            <h2>Synthèse &amp; stratégie</h2>
            <label>Bilan chiffré / ressenti global</label>
            <textarea className="input-dark portfolio-note" rows="3" value={quarterSnapshot.quarterSummary || ''} onChange={(e) => setQuarterField('quarterSummary', e.target.value)} />
            <label>Principales leçons</label>
            <textarea className="input-dark portfolio-note" rows="3" value={quarterSnapshot.quarterLessons || ''} onChange={(e) => setQuarterField('quarterLessons', e.target.value)} />
            <label>Évolution du plan</label>
            <textarea className="input-dark portfolio-note" rows="3" value={quarterSnapshot.quarterStrategy || ''} onChange={(e) => setQuarterField('quarterStrategy', e.target.value)} />
            <label>Intentions prochain trimestre</label>
            <textarea className="input-dark portfolio-note" rows="3" value={quarterSnapshot.quarterForward || ''} onChange={(e) => setQuarterField('quarterForward', e.target.value)} />
          </div>
          <p className="quote-footer">« Ce que tu fais chaque jour t’amène là où tu seras demain. »</p>
        </section>

        <section className={`page ${page === 'year' ? 'active' : ''}`}>
          <span className="dec-arrow" aria-hidden="true">↗</span>
          <h1 className="page-title">Bilan annuel</h1>
          <p className="page-sub">Une ligne par mois — complète les stats et leçons (les totaux de trades peuvent être repris à la main ou depuis ton suivi).</p>
          <div className="toolbar">
            <div>
              <label htmlFor="an-year">{t('tracker.annualYear')}</label>
              <input type="number" id="an-year" className="input-dark tracker-date-input tracker-quarter-input" min="2020" max="2100" step="1" value={data.annualYear || ''} onChange={(e) => update({ annualYear: e.target.value })} />
            </div>
          </div>
          <div className="card">
            <div className="table-wrap">
              <table className="data">
                <thead>
                  <tr>
                    <th>{t('tracker.annualMonth')}</th>
                    <th>{t('tracker.annualTrades')}</th>
                    <th>{t('tracker.annualWinners')}</th>
                    <th>{t('tracker.annualLosers')}</th>
                    <th>{t('tracker.annualPerf')}</th>
                    <th>{t('tracker.annualEmotions')}</th>
                    <th>{t('tracker.annualLesson')}</th>
                  </tr>
                </thead>
                <tbody id="an-body">
                  {annualRows.map((row, index) => (
                    <tr key={index}>
                      <td><input className="input-dark tracker-quarter-input" type="text" value={row.month || ''} onChange={(e) => setAnnualField(index, 'month', e.target.value)} /></td>
                      <td><input className="input-dark tracker-quarter-input" type="text" value={row.trades || ''} onChange={(e) => setAnnualField(index, 'trades', e.target.value)} /></td>
                      <td><input className="input-dark tracker-quarter-input" type="text" value={row.winners || ''} onChange={(e) => setAnnualField(index, 'winners', e.target.value)} /></td>
                      <td><input className="input-dark tracker-quarter-input" type="text" value={row.losers || ''} onChange={(e) => setAnnualField(index, 'losers', e.target.value)} /></td>
                      <td><input className="input-dark tracker-quarter-input" type="text" value={row.performance || ''} onChange={(e) => setAnnualField(index, 'performance', e.target.value)} /></td>
                      <td><input className="input-dark tracker-quarter-input" type="text" value={row.emotions || ''} onChange={(e) => setAnnualField(index, 'emotions', e.target.value)} /></td>
                      <td><input className="input-dark tracker-quarter-input" type="text" value={row.lesson || ''} onChange={(e) => setAnnualField(index, 'lesson', e.target.value)} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className={`page ${page === 'series20' ? 'active' : ''}`}>
          <span className="dec-arrow" aria-hidden="true">↗</span>
          <h1 className="page-title">Série de 20 trades</h1>
          <p className="page-sub">Deux parties de 10 + bilan G20 calculé automatiquement. Colle pour chaque ligne le <strong>lien snapshot TradingView</strong> (menu graphique → Partager → copier le lien) pour rouvrir le trade en un clic. <strong>Archive</strong> une série terminée pour comparer tes stats d’une série à l’autre.</p>

          <div className="card">
            <h2>Historique des séries enregistrées</h2>
            <p className="hint" style={{ marginTop: 0 }}>Chaque archive conserve les 20 lignes, le bilan et les indicateurs au moment de l’enregistrement. Utilise <strong>Restaurer</strong> pour recharger une série dans l’éditeur (remplace la série actuelle).</p>
            <div className="table-wrap">
              <table className="data">
                <thead>
                  <tr><th>Date</th><th>Libellé</th><th>% réussite</th><th>G / P</th><th>Ratio</th><th></th></tr>
                </thead>
                <tbody>
                  {seriesHistory.length ? seriesHistory.map((item, index) => (
                    <tr key={item.id || index}>
                      <td>{item.savedAt ? new Date(item.savedAt).toLocaleString('fr-FR') : '—'}</td>
                      <td>{item.label || '—'}</td>
                      <td>{typeof item.stats?.winrate === 'number' ? `${item.stats.winrate.toFixed(0)} %` : '—'}</td>
                      <td>{typeof item.stats?.wins === 'number' ? `${item.stats.wins} / ${item.stats.losses ?? '—'}` : '—'}</td>
                      <td>{typeof item.stats?.ratio === 'number' ? item.stats.ratio.toFixed(2) : '—'}</td>
                      <td>
                        <button type="button" className="btn btn-ghost btn-compact" onClick={() => update({ seriesP1: item.part1 || [], seriesP2: item.part2 || [], seriesPlan: item.bilan?.plan || '', seriesEmotion: item.bilan?.emotion || '', seriesLesson: item.bilan?.lesson || '', seriesNext: item.bilan?.next || '' })}>Restaurer</button>
                        <button type="button" className="btn btn-ghost btn-compact" aria-label={`Supprimer l’archive ${item.label || index + 1}`} style={{ marginLeft: '0.35rem', color: 'var(--danger)', borderColor: 'rgba(196,92,92,0.4)' }} onClick={() => update({ seriesHistory: seriesHistory.filter((_, i) => i !== index) })}>Suppr</button>
                      </td>
                    </tr>
                  )) : <tr><td colSpan="6" className="hint">Aucune archive pour l’instant.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card">
            <h2>Partie 1 (trades 1–10)</h2>
            <div className="table-wrap">
              <table className="data">
                <thead>
                  <tr><th>N°</th><th>Date</th><th>Actif</th><th>Direction</th><th>Entrée</th><th>SL</th><th>TP</th><th>Résultat</th><th>Émotion</th><th>TradingView</th></tr>
                </thead>
                <tbody>
                  {series20Part1.map((row, index) => (
                    <tr key={`s20-p1-${index}`}>
                      <td>{index + 1}</td>
                      <td><input type="date" className="input-dark tracker-series-input" value={row.date || ''} onChange={(e) => updateSeriesRow('seriesP1', index, 'date', e.target.value)} /></td>
                      <td><input type="text" className="input-dark tracker-series-input" value={row.symbol || ''} onChange={(e) => updateSeriesRow('seriesP1', index, 'symbol', e.target.value)} /></td>
                      <td><select className="input-dark tracker-series-input" value={row.side || 'long'} onChange={(e) => updateSeriesRow('seriesP1', index, 'side', e.target.value)}><option value="long">Long</option><option value="short">Short</option></select></td>
                      <td><input type="text" className="input-dark tracker-series-input" value={row.entry || ''} onChange={(e) => updateSeriesRow('seriesP1', index, 'entry', e.target.value)} /></td>
                      <td><input type="text" className="input-dark tracker-series-input" value={row.sl || ''} onChange={(e) => updateSeriesRow('seriesP1', index, 'sl', e.target.value)} /></td>
                      <td><input type="text" className="input-dark tracker-series-input" value={row.tp || ''} onChange={(e) => updateSeriesRow('seriesP1', index, 'tp', e.target.value)} /></td>
                      <td><input type="text" className="input-dark tracker-series-input" value={row.result || ''} onChange={(e) => updateSeriesRow('seriesP1', index, 'result', e.target.value)} /></td>
                      <td><input type="text" className="input-dark tracker-series-input" value={row.emotion || ''} onChange={(e) => updateSeriesRow('seriesP1', index, 'emotion', e.target.value)} /></td>
                      <td>
                        <div className="s20-tv-stack">
                          <input type="url" className="input-dark tracker-series-input" value={row.tvUrl || ''} onChange={(e) => updateSeriesRow('seriesP1', index, 'tvUrl', e.target.value)} placeholder="tradingview.com/x/…" />
                          <button type="button" className="btn-ghost btn-compact s20-tv-open" onClick={() => {
                            const u = String(row.tvUrl || '').trim();
                            if (!u) return alert('Colle d’abord le lien TradingView.');
                            window.open(u.startsWith('http') ? u : `https://${u}`, '_blank', 'noopener,noreferrer');
                          }}>Ouvrir</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card">
            <h2>Partie 2 (trades 11–20)</h2>
            <div className="table-wrap">
              <table className="data">
                <thead>
                  <tr><th>N°</th><th>Date</th><th>Actif</th><th>Direction</th><th>Entrée</th><th>SL</th><th>TP</th><th>Résultat</th><th>Émotion</th><th>TradingView</th></tr>
                </thead>
                <tbody>
                  {series20Part2.map((row, index) => (
                    <tr key={`s20-p2-${index}`}>
                      <td>{index + 11}</td>
                      <td><input type="date" className="input-dark tracker-series-input" value={row.date || ''} onChange={(e) => updateSeriesRow('seriesP2', index, 'date', e.target.value)} /></td>
                      <td><input type="text" className="input-dark tracker-series-input" value={row.symbol || ''} onChange={(e) => updateSeriesRow('seriesP2', index, 'symbol', e.target.value)} /></td>
                      <td><select className="input-dark tracker-series-input" value={row.side || 'long'} onChange={(e) => updateSeriesRow('seriesP2', index, 'side', e.target.value)}><option value="long">Long</option><option value="short">Short</option></select></td>
                      <td><input type="text" className="input-dark tracker-series-input" value={row.entry || ''} onChange={(e) => updateSeriesRow('seriesP2', index, 'entry', e.target.value)} /></td>
                      <td><input type="text" className="input-dark tracker-series-input" value={row.sl || ''} onChange={(e) => updateSeriesRow('seriesP2', index, 'sl', e.target.value)} /></td>
                      <td><input type="text" className="input-dark tracker-series-input" value={row.tp || ''} onChange={(e) => updateSeriesRow('seriesP2', index, 'tp', e.target.value)} /></td>
                      <td><input type="text" className="input-dark tracker-series-input" value={row.result || ''} onChange={(e) => updateSeriesRow('seriesP2', index, 'result', e.target.value)} /></td>
                      <td><input type="text" className="input-dark tracker-series-input" value={row.emotion || ''} onChange={(e) => updateSeriesRow('seriesP2', index, 'emotion', e.target.value)} /></td>
                      <td>
                        <div className="s20-tv-stack">
                          <input type="url" className="input-dark tracker-series-input" value={row.tvUrl || ''} onChange={(e) => updateSeriesRow('seriesP2', index, 'tvUrl', e.target.value)} placeholder="tradingview.com/x/…" />
                          <button type="button" className="btn-ghost btn-compact s20-tv-open" onClick={() => {
                            const u = String(row.tvUrl || '').trim();
                            if (!u) return alert('Colle d’abord le lien TradingView.');
                            window.open(u.startsWith('http') ? u : `https://${u}`, '_blank', 'noopener,noreferrer');
                          }}>Ouvrir</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card">
            <h2>Bilan G20</h2>
            <div className="stats-row">
              <div className="stat-box"><div className="v">{seriesWinrate}%</div><div className="l">% réussite</div></div>
              <div className="stat-box"><div className="v">{seriesStats.wins} / {seriesStats.losses}</div><div className="l">Gagnants / perdants</div></div>
              <div className="stat-box"><div className={`v ${seriesStats.net >= 0 ? 'pos' : 'neg'}`}>{seriesStats.net.toFixed(2)}€</div><div className="l">Net</div></div>
            </div>
            <div className="grid-2 s20-bilan-grid">
              <div>
                <label>Respect du plan</label>
                <textarea className="input-dark" rows="2" value={data.seriesPlan || ''} onChange={(e) => update({ seriesPlan: e.target.value })} />
              </div>
              <div className="s20-emotion-row s20-emotion-row--stacked">
                <label>Émotion dominante du bloc</label>
                <input className="input-dark tracker-series-input" type="text" value={data.seriesEmotion || ''} onChange={(e) => update({ seriesEmotion: e.target.value })} />
              </div>
            </div>
            <label>Leçon principale</label>
            <textarea className="input-dark" rows="2" value={data.seriesLesson || ''} onChange={(e) => update({ seriesLesson: e.target.value })} />
            <label>Objectif pour la prochaine série</label>
            <textarea className="input-dark" rows="2" value={data.seriesNext || ''} onChange={(e) => update({ seriesNext: e.target.value })} />
            <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <button type="button" className="btn" onClick={() => {
                const label = window.prompt('Libellé pour cette série', data.seriesHistoryLabel || `Série du ${new Date().toLocaleDateString('fr-FR')}`);
                if (label === null) return;
                const entry = {
                  id: `s20-${Date.now()}`,
                  savedAt: new Date().toISOString(),
                  label: label.trim() || `Série du ${new Date().toLocaleDateString('fr-FR')}`,
                  part1: series20Part1,
                  part2: series20Part2,
                  bilan: { plan: data.seriesPlan || '', emotion: data.seriesEmotion || '', lesson: data.seriesLesson || '', next: data.seriesNext || '' },
                  stats: { winrate: seriesWinrate, wins: seriesStats.wins, losses: seriesStats.losses, ratio: seriesProfitFactor },
                };
                update({ seriesHistory: [entry, ...seriesHistory], seriesHistoryLabel: entry.label });
              }}>Archiver cette série dans l’historique</button>
              <span className="hint" style={{ margin: 0 }}>Crée une copie figée (20 trades + bilan + stats).</span>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
