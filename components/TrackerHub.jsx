"use client";

import Link from 'next/link';
import { canAccess, getSubscriptionLabel } from '@/lib/plans';
import { useAccountPayload } from '@/lib/use-account-payload';
import { useLocale } from '@/lib/locale';
import ThemeToggle from '@/components/ThemeToggle';
import LanguageToggle from '@/components/LanguageToggle';

const NAV = [
  ['cover', 'cover'],
  ['mindset', 'mindset'],
  ['plan', 'plan'],
  ['weekly', 'weeklyReview'],
  ['monthly', 'monthlyReview'],
  ['quarter', 'quarterlyReview'],
  ['year', 'yearlyReview'],
  ['series', 'seriesReview'],
];

const AUTO_SCORE_KEYS = ['projectOpportunities', 'projectTechnology', 'projectEcosystem', 'projectRoadmap', 'projectMarketing', 'projectMomentum'];
const MORNING_ITEMS_FR = ['Revue rapide du plan', 'Respiration / recentrage', 'Lecture des niveaux clés', 'Aucun trade impulsif'];
const MORNING_ITEMS_EN = ['Quick review of the plan', 'Breathing / reset', 'Read key levels', 'No impulsive trade'];
const COMMITMENT_ITEMS_FR = ['Je respecte ma discipline', 'Je coupe vite les pertes', 'Je n’ajoute pas sous émotion', 'Je stoppe si je ne suis pas concentré'];
const COMMITMENT_ITEMS_EN = ['I keep my discipline', 'I cut losses quickly', 'I do not add under emotion', 'I stop if I am not focused'];

function monthKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
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
    analysisName: '',
    analysisScores: [0, 0, 0, 0, 0, 0],
    analysisVerdict: '',
    yearResult: '',
    yearDiscipline: '',
    yearFocus: '',
    seriesName: '',
    seriesObservation: '',
    seriesDecision: '',
    projectName: '',
    projectVerdict: '',
    projectOpportunities: 7,
    projectTechnology: 7,
    projectEcosystem: 7,
    projectRoadmap: 7,
    projectMarketing: 7,
    projectMomentum: 7,
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

  const page = data.page === 'tradingPlan' ? 'plan' : (data.page || 'cover');
  const subscriptionLabel = getSubscriptionLabel(subscription, planCode);
  const { t, locale } = useLocale();
  const morningItems = locale === 'en' ? MORNING_ITEMS_EN : MORNING_ITEMS_FR;
  const commitmentItems = locale === 'en' ? COMMITMENT_ITEMS_EN : COMMITMENT_ITEMS_FR;
  const profileLabel = profileState.labels?.[profile] || (profile === 'alt' ? t('tracker.profileSecondary') : t('tracker.profilePrimary'));
  const selectedMonth = data.monthlyMonth || monthKey();
  const monthlySnapshot = data.monthlyByMonth?.[selectedMonth] || {
    monthlyCapital: '', monthlyBest: '', monthlyEmotion: '', monthlyRatio: '', monthlyLesson: '', monthlyResult: '', monthlyGoal: '', monthlyFeel: '', monthlyGood: '', monthlyBad: '', monthlyNext: '',
  };
  const quarterKey = `${data.quarterYear || new Date().getFullYear()}-Q${data.quarterNumber || '1'}`;
  const quarterSnapshot = data.quarterByKey?.[quarterKey] || {
    quarterSuccesses: '', quarterEmotionReason: '', quarterImprove: '', quarterGoalsReeval: '', quarterShortTerm: 'oui', quarterShortPrecision: '', quarterCommitment: '', quarterSummary: '', quarterLessons: '', quarterStrategy: '', quarterForward: '',
  };

  const update = (patch) => setData((prev) => ({ ...prev, ...patch }));
  const weeklyTrades = Array.isArray(data.weeklyTrades) ? data.weeklyTrades : [];
  const updateWeeklyTrade = (index, patch) => {
    const next = weeklyTrades.map((row, rowIndex) => (rowIndex === index ? { ...row, ...patch } : row));
    update({ weeklyTrades: next });
  };
  const addWeeklyTrade = () => {
    update({ weeklyTrades: [...weeklyTrades, { date: '', asset: '', direction: 'long', lots: '', entry: '', exit: '', rr: '', result: '', emotion: '', comment: '' }] });
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
      return { ...prev, monthlyMonth: month, monthlyByMonth: { ...(prev.monthlyByMonth || {}), [month]: { ...bucket, [key]: value } } };
    });
  };

  const setQuarterField = (key, value) => {
    setData((prev) => {
      const qk = `${prev.quarterYear || new Date().getFullYear()}-Q${prev.quarterNumber || '1'}`;
      const bucket = prev.quarterByKey?.[qk] || {};
      return { ...prev, quarterByKey: { ...(prev.quarterByKey || {}), [qk]: { ...bucket, [key]: value } } };
    });
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

  const score = Math.round(AUTO_SCORE_KEYS.reduce((sum, key) => sum + Number(data[key] || 0), 0) / AUTO_SCORE_KEYS.length);
  const weeklyStats = weeklyTrades.reduce((acc, row) => {
    const result = Number(String(row.result || '').replace(',', '.'));
    if (Number.isFinite(result) && result !== 0) {
      acc.count += 1;
      acc.net += result;
      if (result > 0) acc.wins += 1;
      if (result < 0) acc.losses += 1;
    }
    return acc;
  }, { count: 0, net: 0, wins: 0, losses: 0 });
  const weeklyWinrate = weeklyStats.count ? Math.round((weeklyStats.wins / weeklyStats.count) * 100) : 0;
  const annualRows = Array.isArray(data.annualRows) && data.annualRows.length ? data.annualRows : [];
  const seriesP1 = Array.isArray(data.seriesP1) ? data.seriesP1 : [];
  const seriesP2 = Array.isArray(data.seriesP2) ? data.seriesP2 : [];
  const analysisScores = Array.isArray(data.analysisScores) ? data.analysisScores : [0, 0, 0, 0, 0, 0];

  return (
    <div className="mindset-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="tag">{t('app.trading')}</div>
          <Link href="/dashboard" className="brand-link"><h1>Elite Tracker</h1></Link>
          <p className="tracker-quote">{t('tracker.subtitle')}</p>
          <p className="app-plan">{t('app.subscription')} : {subscriptionLabel}</p>
        </div>

        <nav className="sidebar-apps" aria-label="Navigation site">
          <div className="sidebar-apps-label">{t('mindset.spaces')}</div>
          <Link href="/mindset" className="app-link">{t('app.dashboardLink')}</Link>
          <Link href="/tracker" className="app-link is-current">{t('app.trading')}</Link>
          {canAccess(planCode, 'invest') ? <Link href="/invest" className="app-link">{t('app.invest')}</Link> : null}
          <Link href="/mindset" className="app-link">{t('app.mindset')}</Link>
          {canAccess(planCode, 'portfolio') ? <Link href="/portfolio" className="app-link">{t('app.portfolio')}</Link> : null}
        </nav>

        <div className="profile-bar">
          <label htmlFor="trk-profile">{t('tracker.profileLabel')}</label>
          <select id="trk-profile" value={profile} onChange={(e) => switchProfile(e.target.value)}>
            <option value="default">{profileState.labels?.default || t('tracker.profilePrimary')}</option>
            <option value="alt">{profileState.labels?.alt || t('tracker.profileSecondary')}</option>
          </select>
          <p className="profile-hint">{t('tracker.profileHint')}</p>
          <div className="btn-row">
            <button type="button" className="btn btn-ghost" onClick={() => switchProfile(profile === 'default' ? 'alt' : 'default')}>{t('tracker.profileAdd')}</button>
            <button type="button" className="btn btn-ghost" onClick={renameCurrentProfile}>{t('tracker.profileRename')}</button>
          </div>
        </div>

        <div className="sidebar-inner">
          {NAV.map(([key, label]) => (
            <button key={key} type="button" className={`nav-item ${page === key ? 'active' : ''}`} onClick={() => update({ page: key })}>
              {t(`tracker.nav.${label}`)}
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
          <h1 className="page-title">{t('tracker.title')}</h1>
          <p className="page-hero tracker-quote">{t('tracker.subtitle')}</p>
          <div className="class-pills"><span>Session</span><span>Risque</span><span>R/R</span><span>Journal</span><span>Bilan</span></div>
          <div className="card">
            <h2>{t('tracker.coverTitle')}</h2>
            <p className="hint">{t('tracker.coverSub')}</p>
            <div className="grid-3 tracker-cover-grid" style={{ marginTop: '1rem' }}>
              <div className="field-block">
                <label>{t('tracker.coverName')}</label>
                <input className="input-dark tracker-cover-input" type="text" value={data.journalName} onChange={(e) => update({ journalName: e.target.value })} placeholder={t('tracker.coverNamePlaceholder')} />
              </div>
              <div className="field-block">
                <label>{t('tracker.coverPeriod')}</label>
                <input className="input-dark tracker-cover-input" type="text" value={data.journalPeriod} onChange={(e) => update({ journalPeriod: e.target.value })} placeholder={t('tracker.coverPeriodPlaceholder')} />
              </div>
              <div className="field-block">
                <label>{t('tracker.coverObjective')}</label>
                <input className="input-dark tracker-cover-input" type="text" value={data.journalObjective} onChange={(e) => update({ journalObjective: e.target.value })} placeholder={t('tracker.coverObjectivePlaceholder')} />
              </div>
            </div>
            <blockquote className="tracker-quote tracker-quote--block">{t('tracker.einsteinQuote')}</blockquote>
          </div>
        </section>

        <section className={`page ${page === 'monthly' ? 'active' : ''}`}>
          <h1 className="page-title">{t('tracker.monthlyReview')}</h1>
          <p className="page-sub">{t('tracker.monthlyReviewSub')}</p>
          <div className="toolbar">
            <div>
              <label htmlFor="mo-month">{t('tracker.monthlyMonth')}</label>
              <input type="month" id="mo-month" className="input-dark tracker-date-input" value={selectedMonth} onChange={(e) => update({ monthlyMonth: e.target.value })} />
            </div>
          </div>

          <div className="stats-row" id="mo-stats">
            <div className="stat-box"><div className="v">0</div><div className="l">{t('tracker.monthlyTradesTotal')}</div></div>
            <div className="stat-box"><div className="v">0€</div><div className="l">{t('tracker.monthlyGlobalResult')}</div></div>
            <div className="stat-box"><div className="v">0%</div><div className="l">{t('tracker.monthlyWinrate')}</div></div>
            <div className="stat-box"><div className="v">0 / 0</div><div className="l">{t('tracker.monthlyWinnersLosers')}</div></div>
          </div>

          <div className="grid-2">
            <div className="card">
              <label htmlFor="mo-capital">{t('tracker.monthlyCapitalStart')}</label>
              <input type="text" id="mo-capital" className="input-dark" value={monthlySnapshot.monthlyCapital || ''} onChange={(e) => setMonthlyField('monthlyCapital', e.target.value)} />
              <label htmlFor="mo-best">{t('tracker.monthlyBestTrade')}</label>
              <textarea id="mo-best" rows="2" className="input-dark portfolio-note" value={monthlySnapshot.monthlyBest || ''} onChange={(e) => setMonthlyField('monthlyBest', e.target.value)} />
              <label htmlFor="mo-emotion">{t('tracker.monthlyEmotion')}</label>
              <input type="text" id="mo-emotion" className="input-dark" value={monthlySnapshot.monthlyEmotion || ''} onChange={(e) => setMonthlyField('monthlyEmotion', e.target.value)} />
            </div>
            <div className="card">
              <label htmlFor="mo-ratio-manual">{t('tracker.monthlyRatio')}</label>
              <input type="text" id="mo-ratio-manual" className="input-dark" value={monthlySnapshot.monthlyRatio || ''} onChange={(e) => setMonthlyField('monthlyRatio', e.target.value)} placeholder={t('tracker.monthlyRatioPlaceholder')} />
              <label htmlFor="mo-lesson">{t('tracker.monthlyLesson')}</label>
              <textarea id="mo-lesson" rows="3" className="input-dark portfolio-note" value={monthlySnapshot.monthlyLesson || ''} onChange={(e) => setMonthlyField('monthlyLesson', e.target.value)} />
              <label htmlFor="mo-result-manual">{t('tracker.monthlyResult')}</label>
              <input type="text" id="mo-result-manual" className="input-dark" value={monthlySnapshot.monthlyResult || ''} onChange={(e) => setMonthlyField('monthlyResult', e.target.value)} placeholder={t('tracker.monthlyResultPlaceholder')} />
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
        </section>

        <section className={`page ${page === 'mindset' ? 'active' : ''}`}>
          <h1 className="page-title">{t('tracker.mindsetTitle')}</h1>
          <p className="page-sub">{t('tracker.mindsetSub')}</p>
          <div className="grid-2 tracker-mindset-grid">
            <article className="card tracker-mindset-card">
              <h2>{t('tracker.mindsetDreamLife')}</h2>
              <textarea className="input-dark portfolio-note tracker-mindset-textarea" rows="4" value={data.mindsetDreamLife} onChange={(e) => update({ mindsetDreamLife: e.target.value })} placeholder={t('tracker.mindsetDreamLifePlaceholder')} />
            </article>
            <article className="card tracker-mindset-card">
              <h2>{t('tracker.mindsetMeans')}</h2>
              <textarea className="input-dark portfolio-note tracker-mindset-textarea" rows="4" value={data.mindsetMeans} onChange={(e) => update({ mindsetMeans: e.target.value })} placeholder={t('tracker.mindsetMeansPlaceholder')} />
            </article>
          </div>

          <div className="card tracker-mindset-card" style={{ marginTop: '1rem' }}>
            <h2>{t('tracker.mindsetGoals')}</h2>
            <div className="grid-3 tracker-mindset-grid-3">
              <div className="field-block"><label>{t('tracker.mindsetGoalShort')}</label><textarea className="input-dark tracker-mindset-textarea" rows="3" value={data.mindsetGoalShort} onChange={(e) => update({ mindsetGoalShort: e.target.value })} placeholder={t('tracker.mindsetGoalShortPlaceholder')} /></div>
              <div className="field-block"><label>{t('tracker.mindsetGoalMedium')}</label><textarea className="input-dark tracker-mindset-textarea" rows="3" value={data.mindsetGoalMedium} onChange={(e) => update({ mindsetGoalMedium: e.target.value })} placeholder={t('tracker.mindsetGoalMediumPlaceholder')} /></div>
              <div className="field-block"><label>{t('tracker.mindsetGoalLong')}</label><textarea className="input-dark tracker-mindset-textarea" rows="3" value={data.mindsetGoalLong} onChange={(e) => update({ mindsetGoalLong: e.target.value })} placeholder={t('tracker.mindsetGoalLongPlaceholder')} /></div>
            </div>
          </div>

          <div className="grid-2 tracker-mindset-grid" style={{ marginTop: '1rem' }}>
            <article className="card tracker-mindset-card">
              <h2>{t('tracker.mindsetMantras')}</h2>
              <textarea className="input-dark tracker-mindset-textarea" rows="4" value={data.mindsetMantras} onChange={(e) => update({ mindsetMantras: e.target.value })} placeholder={t('tracker.mindsetMantrasPlaceholder')} />
            </article>
            <article className="card tracker-mindset-card">
              <h2>{t('tracker.mindsetTargetState')}</h2>
              <textarea className="input-dark tracker-mindset-textarea" rows="4" value={data.mindsetTargetState} onChange={(e) => update({ mindsetTargetState: e.target.value })} placeholder={t('tracker.mindsetTargetStatePlaceholder')} />
            </article>
          </div>

          <div className="grid-2 tracker-mindset-grid" style={{ marginTop: '1rem' }}>
            <article className="card tracker-mindset-card">
              <h2>{t('tracker.mindsetPitfalls')}</h2>
              <textarea className="input-dark tracker-mindset-textarea" rows="4" value={data.mindsetPitfalls} onChange={(e) => update({ mindsetPitfalls: e.target.value })} placeholder={t('tracker.mindsetPitfallsPlaceholder')} />
            </article>
            <article className="card tracker-mindset-card">
              <h2>{t('tracker.mindsetPerformanceZone')}</h2>
              <div className="tracker-check-grid">
                <label><input type="checkbox" checked={!!data.mindsetPerformanceRested} onChange={() => toggleMindsetCheck('mindsetPerformanceRested')} /> {t('tracker.mindsetPerformanceRested')}</label>
                <label><input type="checkbox" checked={!!data.mindsetPerformanceAligned} onChange={() => toggleMindsetCheck('mindsetPerformanceAligned')} /> {t('tracker.mindsetPerformanceAligned')}</label>
                <label><input type="checkbox" checked={!!data.mindsetPerformanceNoEmotion} onChange={() => toggleMindsetCheck('mindsetPerformanceNoEmotion')} /> {t('tracker.mindsetPerformanceNoEmotion')}</label>
              </div>
              <label className="field-label">{t('tracker.mindsetIntent')}</label>
              <textarea className="input-dark tracker-mindset-textarea" rows="3" value={data.mindsetIntent} onChange={(e) => update({ mindsetIntent: e.target.value })} placeholder={t('tracker.mindsetIntentPlaceholder')} />
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
          <h1 className="page-title">{t('tracker.tradingPlanTitle')}</h1>
          <p className="page-sub">{t('tracker.tradingPlanSub')}</p>

          <div className="grid-2 tracker-mindset-grid">
            <article className="card tracker-mindset-card">
              <h2>{t('tracker.tradingPlanVision')}</h2>
              <textarea className="input-dark tracker-mindset-textarea" rows="4" value={data.tradingPlanVision} onChange={(e) => update({ tradingPlanVision: e.target.value })} placeholder={t('tracker.tradingPlanVisionPlaceholder')} />
            </article>
            <article className="card tracker-mindset-card">
              <h2>{t('tracker.tradingPlanGoals')}</h2>
              <textarea className="input-dark tracker-mindset-textarea" rows="4" value={data.tradingPlanGoals} onChange={(e) => update({ tradingPlanGoals: e.target.value })} placeholder={t('tracker.tradingPlanGoalsPlaceholder')} />
            </article>
          </div>

          <div className="grid-2 tracker-mindset-grid" style={{ marginTop: '1rem' }}>
            <article className="card tracker-mindset-card">
              <h2>{t('tracker.tradingPlanAvailability')}</h2>
              <textarea className="input-dark tracker-mindset-textarea" rows="4" value={data.tradingPlanAvailability} onChange={(e) => update({ tradingPlanAvailability: e.target.value })} placeholder={t('tracker.tradingPlanAvailabilityPlaceholder')} />
            </article>
            <article className="card tracker-mindset-card">
              <h2>{t('tracker.tradingPlanRiskBudget')}</h2>
              <textarea className="input-dark tracker-mindset-textarea" rows="4" value={data.tradingPlanRiskBudget} onChange={(e) => update({ tradingPlanRiskBudget: e.target.value })} placeholder={t('tracker.tradingPlanRiskBudgetPlaceholder')} />
            </article>
          </div>

          <div className="grid-2 tracker-mindset-grid" style={{ marginTop: '1rem' }}>
            <article className="card tracker-mindset-card">
              <h2>{t('tracker.tradingPlanMarkets')}</h2>
              <textarea className="input-dark tracker-mindset-textarea" rows="4" value={data.tradingPlanMarkets} onChange={(e) => update({ tradingPlanMarkets: e.target.value })} placeholder={t('tracker.tradingPlanMarketsPlaceholder')} />
            </article>
            <article className="card tracker-mindset-card">
              <h2>{t('tracker.tradingPlanSizing')}</h2>
              <textarea className="input-dark tracker-mindset-textarea" rows="4" value={data.tradingPlanSizing} onChange={(e) => update({ tradingPlanSizing: e.target.value })} placeholder={t('tracker.tradingPlanSizingPlaceholder')} />
            </article>
          </div>

          <div className="card tracker-mindset-card" style={{ marginTop: '1rem' }}>
            <h2>{t('tracker.tradingPlanRiskTitle')}</h2>
            <div className="grid-3 tracker-mindset-grid-3">
              <div className="field-block"><label>{t('tracker.tradingPlanRiskPerTrade')}</label><input className="input-dark tracker-trading-input" type="text" value={data.tradingPlanRiskPerTrade} onChange={(e) => update({ tradingPlanRiskPerTrade: e.target.value })} placeholder={t('tracker.tradingPlanRiskPerTradePlaceholder')} /></div>
              <div className="field-block"><label>{t('tracker.tradingPlanDailyLoss')}</label><input className="input-dark tracker-trading-input" type="text" value={data.tradingPlanDailyLoss} onChange={(e) => update({ tradingPlanDailyLoss: e.target.value })} placeholder={t('tracker.tradingPlanDailyLossPlaceholder')} /></div>
              <div className="field-block"><label>{t('tracker.tradingPlanWeeklyLoss')}</label><input className="input-dark tracker-trading-input" type="text" value={data.tradingPlanWeeklyLoss} onChange={(e) => update({ tradingPlanWeeklyLoss: e.target.value })} placeholder={t('tracker.tradingPlanWeeklyLossPlaceholder')} /></div>
            </div>
          </div>

          <div className="grid-2 tracker-mindset-grid" style={{ marginTop: '1rem' }}>
            <article className="card tracker-mindset-card">
              <h2>{t('tracker.tradingPlanSessions')}</h2>
              <textarea className="input-dark tracker-mindset-textarea" rows="4" value={data.tradingPlanSessions} onChange={(e) => update({ tradingPlanSessions: e.target.value })} placeholder={t('tracker.tradingPlanSessionsPlaceholder')} />
            </article>
            <article className="card tracker-mindset-card">
              <h2>{t('tracker.tradingPlanTimeframes')}</h2>
              <textarea className="input-dark tracker-mindset-textarea" rows="4" value={data.tradingPlanTimeframes} onChange={(e) => update({ tradingPlanTimeframes: e.target.value })} placeholder={t('tracker.tradingPlanTimeframesPlaceholder')} />
            </article>
          </div>

          <div className="grid-2 tracker-mindset-grid" style={{ marginTop: '1rem' }}>
            <article className="card tracker-mindset-card">
              <h2>{t('tracker.tradingPlanInstruments')}</h2>
              <textarea className="input-dark tracker-mindset-textarea" rows="4" value={data.tradingPlanInstruments} onChange={(e) => update({ tradingPlanInstruments: e.target.value })} placeholder={t('tracker.tradingPlanInstrumentsPlaceholder')} />
            </article>
            <article className="card tracker-mindset-card">
              <h2>{t('tracker.tradingPlanSetups')}</h2>
              <textarea className="input-dark tracker-mindset-textarea" rows="4" value={data.tradingPlanSetups} onChange={(e) => update({ tradingPlanSetups: e.target.value })} placeholder={t('tracker.tradingPlanSetupsPlaceholder')} />
            </article>
          </div>

          <div className="grid-2 tracker-mindset-grid" style={{ marginTop: '1rem' }}>
            <article className="card tracker-mindset-card">
              <h2>{t('tracker.tradingPlanEntries')}</h2>
              <textarea className="input-dark tracker-mindset-textarea" rows="4" value={data.tradingPlanEntries} onChange={(e) => update({ tradingPlanEntries: e.target.value })} placeholder={t('tracker.tradingPlanEntriesPlaceholder')} />
            </article>
            <article className="card tracker-mindset-card">
              <h2>{t('tracker.tradingPlanExits')}</h2>
              <textarea className="input-dark tracker-mindset-textarea" rows="4" value={data.tradingPlanExits} onChange={(e) => update({ tradingPlanExits: e.target.value })} placeholder={t('tracker.tradingPlanExitsPlaceholder')} />
            </article>
          </div>

          <div className="card tracker-mindset-card" style={{ marginTop: '1rem' }}>
            <h2>{t('tracker.tradingPlanNever')}</h2>
            <textarea className="input-dark tracker-mindset-textarea" rows="4" value={data.tradingPlanNever} onChange={(e) => update({ tradingPlanNever: e.target.value })} placeholder={t('tracker.tradingPlanNeverPlaceholder')} />
          </div>
        </section>

        <section className={`page ${page === 'weekly' ? 'active' : ''}`}>
          <h1 className="page-title">{t('tracker.weeklyTitle')}</h1>
          <p className="page-sub">{t('tracker.weeklySub')}</p>

          <div className="toolbar">
            <div>
              <label>{t('tracker.weeklyMonth')}</label>
              <input type="month" className="input-dark tracker-date-input" value={data.weeklyMonth || ''} onChange={(e) => update({ weeklyMonth: e.target.value })} />
            </div>
            <div>
              <label>{t('tracker.weeklyWeek')}</label>
              <input type="week" className="input-dark tracker-date-input" value={data.weeklyWeek || ''} onChange={(e) => update({ weeklyWeek: e.target.value })} />
            </div>
            <div>
              <button type="button" className="btn" onClick={addWeeklyTrade}>{t('tracker.weeklyAddTrade')}</button>
            </div>
          </div>

          <div className="stats-row">
            <div className="stat-box"><div className="v">{weeklyStats.count}</div><div className="l">{t('tracker.weeklyTradesCount')}</div></div>
            <div className="stat-box"><div className={`v ${weeklyStats.net >= 0 ? 'pos' : 'neg'}`}>{weeklyStats.net.toFixed(0)}€</div><div className="l">{t('tracker.weeklyNet')}</div></div>
            <div className="stat-box"><div className="v">{weeklyWinrate}%</div><div className="l">{t('tracker.weeklyWinrate')}</div></div>
            <div className="stat-box"><div className="v">{weeklyStats.wins}/{weeklyStats.losses}</div><div className="l">{t('tracker.weeklyWinLose')}</div></div>
          </div>

          <div className="card">
            <h2>{t('tracker.weeklyTradesTitle')}</h2>
            <div className="table-wrap">
              <table className="data">
                <thead>
                  <tr>
                    <th>{t('tracker.weeklyDate')}</th>
                    <th>{t('tracker.weeklyAsset')}</th>
                    <th>{t('tracker.weeklyDirection')}</th>
                    <th>{t('tracker.weeklyLots')}</th>
                    <th>{t('tracker.weeklyEntry')}</th>
                    <th>{t('tracker.weeklyExit')}</th>
                    <th>{t('tracker.weeklyRR')}</th>
                    <th>{t('tracker.weeklyResult')}</th>
                    <th>{t('tracker.weeklyEmotion')}</th>
                    <th>{t('tracker.weeklyComment')}</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {weeklyTrades.map((row, index) => (
                    <tr key={`${index}-${row.date || 'trade'}`}>
                      <td><input className="input-dark invest-holding-input tracker-date-input" type="date" value={row.date || ''} onChange={(e) => updateWeeklyTrade(index, { date: e.target.value })} /></td>
                      <td><input className="input-dark invest-holding-input" type="text" value={row.asset || ''} onChange={(e) => updateWeeklyTrade(index, { asset: e.target.value })} /></td>
                      <td>
                        <select className="input-dark invest-holding-input" value={row.direction || 'long'} onChange={(e) => updateWeeklyTrade(index, { direction: e.target.value })}>
                          <option value="long">Long</option>
                          <option value="short">Short</option>
                        </select>
                      </td>
                      <td><input className="input-dark invest-holding-input" type="text" value={row.lots || ''} onChange={(e) => updateWeeklyTrade(index, { lots: e.target.value })} /></td>
                      <td><input className="input-dark invest-holding-input" type="text" value={row.entry || ''} onChange={(e) => updateWeeklyTrade(index, { entry: e.target.value })} /></td>
                      <td><input className="input-dark invest-holding-input" type="text" value={row.exit || ''} onChange={(e) => updateWeeklyTrade(index, { exit: e.target.value })} /></td>
                      <td><input className="input-dark invest-holding-input" type="text" value={row.rr || ''} onChange={(e) => updateWeeklyTrade(index, { rr: e.target.value })} /></td>
                      <td><input className="input-dark invest-holding-input" type="text" value={row.result || ''} onChange={(e) => updateWeeklyTrade(index, { result: e.target.value })} /></td>
                      <td><input className="input-dark invest-holding-input" type="text" value={row.emotion || ''} onChange={(e) => updateWeeklyTrade(index, { emotion: e.target.value })} /></td>
                      <td><input className="input-dark invest-holding-input" type="text" value={row.comment || ''} onChange={(e) => updateWeeklyTrade(index, { comment: e.target.value })} /></td>
                      <td><button type="button" className="btn btn-ghost" onClick={() => removeWeeklyTrade(index)}>✕</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="hint"><strong>Résultat :</strong> saisis le montant total si besoin ; la table conserve tes lignes du mois en cours.</p>
          </div>

          <div className="card" style={{ marginTop: '1rem' }}>
            <h2>{t('tracker.weeklyNotesTitle')}</h2>
            <label>{t('tracker.weeklyNotesLabel')}</label>
            <textarea className="input-dark portfolio-note" rows="5" value={data.weeklyNotes || ''} onChange={(e) => update({ weeklyNotes: e.target.value })} />
          </div>
        </section>

        <section className={`page ${page === 'quarter' ? 'active' : ''}`}>
          <h1 className="page-title">{t('tracker.quarter')}</h1>
          <p className="page-sub">{t('tracker.quarterSub')}</p>
          <div className="toolbar">
            <div>
              <label htmlFor="q-year">{t('tracker.quarterYear')}</label>
              <input type="number" id="q-year" className="input-dark" min="2020" max="2100" step="1" value={data.quarterYear || ''} onChange={(e) => update({ quarterYear: e.target.value })} />
            </div>
            <div>
              <label htmlFor="q-n">{t('tracker.quarterNumber')}</label>
              <select id="q-n" className="input-dark" value={data.quarterNumber || '1'} onChange={(e) => update({ quarterNumber: e.target.value })}>
                <option value="1">T1</option>
                <option value="2">T2</option>
                <option value="3">T3</option>
                <option value="4">T4</option>
              </select>
            </div>
          </div>

          <div className="grid-q6">
            <div className="card card-q">
              <h2>{t('tracker.quarterSuccesses')}</h2>
              <label>{t('tracker.quarterSuccessesLabel')}</label>
              <textarea className="input-dark portfolio-note" rows="5" value={quarterSnapshot.quarterSuccesses || ''} onChange={(e) => setQuarterField('quarterSuccesses', e.target.value)} />
            </div>
            <div className="card card-q">
              <h2>{t('tracker.quarterEmotion')}</h2>
              <label>{t('tracker.quarterRespect')}</label>
              <div className="stars" aria-label="Note sur 3"></div>
              <label>{t('tracker.quarterEmotionLabel')}</label>
              <textarea className="input-dark portfolio-note" rows="4" value={quarterSnapshot.quarterEmotionReason || ''} onChange={(e) => setQuarterField('quarterEmotionReason', e.target.value)} />
            </div>
            <div className="card card-q">
              <h2>{t('tracker.quarterImprove')}</h2>
              <label>{t('tracker.quarterImproveLabel')}</label>
              <textarea className="input-dark portfolio-note" rows="5" value={quarterSnapshot.quarterImprove || ''} onChange={(e) => setQuarterField('quarterImprove', e.target.value)} />
            </div>
            <div className="card card-q">
              <h2>{t('tracker.quarterGoalsReeval')}</h2>
              <label>{t('tracker.quarterGoalsReevalLabel')}</label>
              <textarea className="input-dark portfolio-note" rows="5" value={quarterSnapshot.quarterGoalsReeval || ''} onChange={(e) => setQuarterField('quarterGoalsReeval', e.target.value)} />
            </div>
            <div className="card card-q">
              <h2>{t('tracker.quarterShortTerm')}</h2>
              <div className="check-row"><input type="radio" name="q-obj" checked={quarterSnapshot.quarterShortTerm === 'oui'} onChange={() => setQuarterField('quarterShortTerm', 'oui')} /><label style={{ display: 'inline' }}>{t('tracker.yes')}</label></div>
              <div className="check-row"><input type="radio" name="q-obj" checked={quarterSnapshot.quarterShortTerm === 'non'} onChange={() => setQuarterField('quarterShortTerm', 'non')} /><label style={{ display: 'inline' }}>{t('tracker.no')}</label></div>
              <div className="check-row"><input type="radio" name="q-obj" checked={quarterSnapshot.quarterShortTerm === 'cours'} onChange={() => setQuarterField('quarterShortTerm', 'cours')} /><label style={{ display: 'inline' }}>{t('tracker.inProgress')}</label></div>
              <label>{t('tracker.quarterShortPrecision')}</label>
              <textarea className="input-dark portfolio-note" rows="3" value={quarterSnapshot.quarterShortPrecision || ''} onChange={(e) => setQuarterField('quarterShortPrecision', e.target.value)} />
            </div>
            <div className="card card-q">
              <h2>{t('tracker.quarterCommitment')}</h2>
              <label>{t('tracker.quarterCommitmentLabel')}</label>
              <textarea className="input-dark portfolio-note" rows="5" value={quarterSnapshot.quarterCommitment || ''} onChange={(e) => setQuarterField('quarterCommitment', e.target.value)} />
            </div>
          </div>

          <div className="card" style={{ marginTop: '1rem' }}>
            <h2>{t('tracker.quarterSummary')}</h2>
            <label>{t('tracker.quarterSummaryLabel')}</label>
            <textarea className="input-dark portfolio-note" rows="3" value={quarterSnapshot.quarterSummary || ''} onChange={(e) => setQuarterField('quarterSummary', e.target.value)} />
            <label>{t('tracker.quarterLessons')}</label>
            <textarea className="input-dark portfolio-note" rows="3" value={quarterSnapshot.quarterLessons || ''} onChange={(e) => setQuarterField('quarterLessons', e.target.value)} />
            <label>{t('tracker.quarterStrategy')}</label>
            <textarea className="input-dark portfolio-note" rows="3" value={quarterSnapshot.quarterStrategy || ''} onChange={(e) => setQuarterField('quarterStrategy', e.target.value)} />
            <label>{t('tracker.quarterForward')}</label>
            <textarea className="input-dark portfolio-note" rows="3" value={quarterSnapshot.quarterForward || ''} onChange={(e) => setQuarterField('quarterForward', e.target.value)} />
          </div>
        </section>

        <section className={`page ${page === 'year' ? 'active' : ''}`}>
          <h1 className="page-title">{t('tracker.year')}</h1>
          <p className="page-sub">{t('tracker.yearSub')}</p>
          <div className="toolbar">
            <div>
              <label htmlFor="an-year">{t('tracker.annualYear')}</label>
              <input type="number" id="an-year" className="input-dark tracker-date-input" min="2020" max="2100" step="1" value={data.annualYear || ''} onChange={(e) => update({ annualYear: e.target.value })} />
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
                <tbody>
                  {annualRows.map((row, index) => (
                    <tr key={index}>
                      <td>{row.month || ''}</td>
                      <td>{row.trades || ''}</td>
                      <td>{row.winners || ''}</td>
                      <td>{row.losers || ''}</td>
                      <td>{row.performance || ''}</td>
                      <td>{row.emotions || ''}</td>
                      <td>{row.lesson || ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className={`page ${page === 'series' ? 'active' : ''}`}>
          <h1 className="page-title">{t('tracker.series')}</h1>
          <p className="page-sub">{t('tracker.seriesSub')}</p>
          <div className="card">
            <h2>{t('tracker.seriesHistory')}</h2>
            <div className="table-wrap">
              <table className="data">
                <thead><tr><th>{t('tracker.seriesHistoryDate')}</th><th>{t('tracker.seriesHistoryLabel')}</th><th>{t('tracker.seriesHistoryRate')}</th><th>{t('tracker.seriesHistoryGP')}</th><th>{t('tracker.seriesHistoryRatio')}</th></tr></thead>
                <tbody>
                  {(data.seriesHistory || []).map((row, index) => (
                    <tr key={index}><td>{row.date || ''}</td><td>{row.label || ''}</td><td>{row.rate || ''}</td><td>{row.gp || ''}</td><td>{row.ratio || ''}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="card" style={{ marginTop: '1rem' }}>
            <h2>{t('tracker.seriesPart1')}</h2>
            <div className="table-wrap"><table className="data"><thead><tr><th>N°</th><th>Date</th><th>Actif</th><th>Direction</th><th>Entrée</th><th>SL</th><th>TP</th><th>Résultat</th><th>Émotion</th><th>TradingView</th></tr></thead><tbody>{seriesP1.map((row, index) => (<tr key={index}><td>{index+1}</td><td>{row.date || ''}</td><td>{row.asset || ''}</td><td>{row.direction || ''}</td><td>{row.entry || ''}</td><td>{row.sl || ''}</td><td>{row.tp || ''}</td><td>{row.result || ''}</td><td>{row.emotion || ''}</td><td>{row.tv || ''}</td></tr>))}</tbody></table></div>
          </div>
          <div className="card" style={{ marginTop: '1rem' }}>
            <h2>{t('tracker.seriesPart2')}</h2>
            <div className="table-wrap"><table className="data"><thead><tr><th>N°</th><th>Date</th><th>Actif</th><th>Direction</th><th>Entrée</th><th>SL</th><th>TP</th><th>Résultat</th><th>Émotion</th><th>TradingView</th></tr></thead><tbody>{seriesP2.map((row, index) => (<tr key={index}><td>{index+11}</td><td>{row.date || ''}</td><td>{row.asset || ''}</td><td>{row.direction || ''}</td><td>{row.entry || ''}</td><td>{row.sl || ''}</td><td>{row.tp || ''}</td><td>{row.result || ''}</td><td>{row.emotion || ''}</td><td>{row.tv || ''}</td></tr>))}</tbody></table></div>
          </div>
          <div className="card" style={{ marginTop: '1rem' }}>
            <h2>{t('tracker.seriesBilan')}</h2>
            <div className="stats-row">
              <div className="stat-box"><div className="v">0%</div><div className="l">{t('tracker.seriesRate')}</div></div>
              <div className="stat-box"><div className="v">0</div><div className="l">{t('tracker.seriesRatio')}</div></div>
              <div className="stat-box"><div className="v">0 / 0</div><div className="l">{t('tracker.seriesWinLose')}</div></div>
            </div>
            <label>{t('tracker.seriesPlanRespect')}</label>
            <textarea className="input-dark portfolio-note" rows="2" value={data.seriesPlan || ''} onChange={(e) => update({ seriesPlan: e.target.value })} />
            <label>{t('tracker.seriesDominantEmotion')}</label>
            <input className="input-dark" type="text" value={data.seriesEmotion || ''} onChange={(e) => update({ seriesEmotion: e.target.value })} />
            <label>{t('tracker.seriesMainLesson')}</label>
            <textarea className="input-dark portfolio-note" rows="2" value={data.seriesLesson || ''} onChange={(e) => update({ seriesLesson: e.target.value })} />
            <label>{t('tracker.seriesNextGoal')}</label>
            <textarea className="input-dark portfolio-note" rows="2" value={data.seriesNext || ''} onChange={(e) => update({ seriesNext: e.target.value })} />
            <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <button type="button" className="btn btn-compact">{t('tracker.seriesArchive')}</button>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
