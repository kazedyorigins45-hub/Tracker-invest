"use client";

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { canAccess, getSubscriptionLabel } from '@/lib/plans';
import { useAccountPayload } from '@/lib/use-account-payload';
import { useLocale } from '@/lib/locale';
import DashboardContent from '@/components/DashboardContent';
import LogoMark from '@/components/LogoMark';
import ThemeToggle from '@/components/ThemeToggle';
import CurrencyToggle from '@/components/CurrencyToggle';

const STORAGE_KEY = 'mindsetInvestHub_v1';

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function defaultState() {
  return {
    vision: { mission: '', values: '', promise: '' },
    journal: [],
    routineLabels: ['', '', '', ''],
    routineByDay: {},
    morningRoutineByDay: {},
    rules: [],
  };
}

export default function MindsetHub({ userEmail = '', planCode = 'starter', subscription = null }) {
  const { t, locale } = useLocale();
  const dateLocale = locale === 'en' ? 'en-US' : 'fr-FR';
  const subscriptionLabel = getSubscriptionLabel(subscription, planCode);
  const [state, setState] = useAccountPayload(STORAGE_KEY, defaultState());
  const [activePage, setActivePage] = useState('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const closeSidebar = () => setSidebarOpen(false);

  function renderPage(name) {
    setActivePage(name);
    setSidebarOpen(false);
    const el = document.getElementById(`page-${name}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  const stats = useMemo(() => {
    const journalCount = (state.journal || []).length;
    const rulesCount = (state.rules || []).length;
    const days = Object.keys(state.routineByDay || {});
    let streak = 0;
    for (let i = days.length - 1; i >= 0; i--) {
      const day = days[i];
      const checks = state.routineByDay[day] || [];
      if (checks.every((v) => v === true)) { streak++; } else { break; }
    }
    return { journalCount, rulesCount, streak: streak > 0 ? streak : '—' };
  }, [state]);
  const isTraderPlan = planCode === 'tracker' || planCode === 'both';

  const activeRoutine = state.routineByDay[todayKey()] || [false, false, false, false];
  const activeRoutineCount = (activeRoutine || []).filter(Boolean).length;
  const morningRoutine = state.morningRoutineByDay?.[todayKey()] || [false, false, false, false];
  const morningRoutineCount = (morningRoutine || []).filter(Boolean).length;

  function setVisionField(key, value) {
    setState((prev) => ({ ...prev, vision: { ...prev.vision, [key]: value } }));
  }

  function setRoutineLabel(index, value) {
    setState((prev) => {
      const labels = [...prev.routineLabels];
      labels[index] = value;
      return { ...prev, routineLabels: labels };
    });
  }

  function toggleRoutine(index, checked) {
    setState((prev) => {
      const key = todayKey();
      const day = Array.isArray(prev.routineByDay[key]) ? [...prev.routineByDay[key]] : [false, false, false, false];
      day[index] = checked;
      return { ...prev, routineByDay: { ...prev.routineByDay, [key]: day } };
    });
  }

  function toggleMorningRoutine(index, checked) {
    setState((prev) => {
      const key = todayKey();
      const day = Array.isArray(prev.morningRoutineByDay?.[key]) ? [...prev.morningRoutineByDay[key]] : [false, false, false, false];
      day[index] = checked;
      return { ...prev, morningRoutineByDay: { ...(prev.morningRoutineByDay || {}), [key]: day } };
    });
  }

  function addJournal() {
    const title = String(document.getElementById('mi-je-title')?.value || '').trim();
    const body = String(document.getElementById('mi-je-body')?.value || '').trim();
    if (!body && !title) return;

    setState((prev) => ({
      ...prev,
      journal: [
        ...prev.journal,
        { id: `je_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`, ts: Date.now(), title, body },
      ],
    }));

    if (document.getElementById('mi-je-title')) document.getElementById('mi-je-title').value = '';
    if (document.getElementById('mi-je-body')) document.getElementById('mi-je-body').value = '';
  }

  function startEditJournal(entry) {
    setEditingJournalId(entry.id);
    setJournalDraft({ title: entry.title || '', body: entry.body || '' });
  }

  function cancelEditJournal() {
    setEditingJournalId(null);
    setJournalDraft({ title: '', body: '' });
  }

  function saveEditJournal(id) {
    setState((prev) => ({
      ...prev,
      journal: prev.journal.map((entry) => (entry.id === id ? { ...entry, title: journalDraft.title.trim(), body: journalDraft.body.trim() } : entry)),
    }));
    cancelEditJournal();
  }

  function addRule() {
    setState((prev) => ({ ...prev, rules: [...prev.rules, { text: '' }] }));
  }

  function renderPage(name) {
    setActivePage(name);
    const el = document.getElementById(`page-${name}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  const sortedJournal = [...state.journal].sort((a, b) => (b.ts || 0) - (a.ts || 0));

  return (
    <div className="mindset-shell">
      <aside className={`sidebar${sidebarOpen ? ' sidebar--open' : ''}`}>
        <div className="sidebar-close" onClick={closeSidebar} aria-label="Fermer le menu">✕</div>
        {isTraderPlan ? (
          <div className="brand-block">
            <div className="brand-top">
              <div className="tag">{t('app.trading')}</div>
              <Link href="/dashboard" className="brand-link"><h1>Elite Tracker</h1></Link>
              <p className="tracker-quote">{t('tracker.subtitle')}</p>
              <p className="app-plan">{t('app.subscription')} : {subscriptionLabel}</p>
            </div>

            <nav className="sidebar-apps" aria-label="Navigation site">
              <div className="sidebar-apps-label">{t('mindset.spaces')}</div>
              <button type="button" className={`app-link ${activePage === 'home' ? 'is-current' : ''}`} onClick={() => renderPage('home')}>
                {t('app.dashboardLink')}
              </button>
              {canAccess(planCode, 'tracker') ? <Link href="/tracker" className="app-link">{t('app.trading')}</Link> : null}
              <Link href="/mindset" className="app-link is-current">{t('app.mindset')}</Link>
              {canAccess(planCode, 'invest') ? <Link href="/invest" className="app-link">{t('app.invest')}</Link> : null}
              {canAccess(planCode, 'portfolio') ? <Link href="/portfolio" className="app-link">{t('app.portfolio')}</Link> : null}
            </nav>
          </div>
        ) : (
          <div className="brand-block">
            <div className="brand-top">
              <div className="tag">Mindset</div>
              <Link href="/" className="brand-link"><h1>Mindset Invest</h1></Link>
              <p>{t('home.mindsetSpaceDesc')}</p>
            </div>

            <nav className="sidebar-apps" aria-label="Navigation site">
              <div className="sidebar-apps-label">{t('mindset.spaces')}</div>
              <button type="button" className={`app-link ${activePage === 'home' ? 'is-current' : ''}`} onClick={() => renderPage('home')}>
                {t('app.dashboardLink')}
              </button>
              {canAccess(planCode, 'tracker') ? <Link href="/tracker" className="app-link">{t('app.trading')}</Link> : null}
              <Link href="/mindset" className="app-link is-current">{t('app.mindset')}</Link>
              {canAccess(planCode, 'invest') ? <Link href="/invest" className="app-link">{t('app.invest')}</Link> : null}
              {canAccess(planCode, 'portfolio') ? <Link href="/portfolio" className="app-link">{t('app.portfolio')}</Link> : null}
            </nav>
          </div>
        )}

        <div className="sidebar-inner">
          <button type="button" className={`nav-item ${activePage === 'vision' ? 'active' : ''}`} onClick={() => renderPage('vision')}>{t('mindset.vision')}</button>
          <button type="button" className={`nav-item ${activePage === 'journal' ? 'active' : ''}`} onClick={() => renderPage('journal')}>{t('mindset.journal')}</button>
          <button type="button" className={`nav-item ${activePage === 'routine' ? 'active' : ''}`} onClick={() => renderPage('routine')}>{t('mindset.routine')}</button>
          <button type="button" className={`nav-item ${activePage === 'rules' ? 'active' : ''}`} onClick={() => renderPage('rules')}>{t('mindset.rules')}</button>
        </div>

        <div className="sidebar-bottom">
          <p className="app-plan">{subscriptionLabel}</p>
          <span id="auth-user-email" style={{ wordBreak: 'break-all' }}>{userEmail}</span>
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
        <section id="page-home" className={`page ${activePage === 'home' ? 'active' : ''}`}>
          <div className="mindset-home-hero">
            <div className="mindset-home-copy">
              <h1 className="page-title">{t('app.dashboardLink')}</h1>
              <p className="page-sub">{t('mindset.homeIntro')}</p>
              <div className="stats-row">
                <div className="stat"><div className="v">{stats.journalCount}</div><div className="l">{t('mindset.journal')}</div></div>
                <div className="stat"><div className="v">{stats.rulesCount}</div><div className="l">{t('mindset.lifeRules')}</div></div>
                <div className="stat"><div className="v">{activeRoutineCount}/4</div><div className="l">{t('mindset.routine')}</div></div>
                <div className="stat"><div className="v">{morningRoutineCount}/3</div><div className="l">{t('mindset.morningRoutine')}</div></div>
              </div>
              <div className="card">
                <h2>{t('mindset.quickAccess')}</h2>
                <p className="hint">{t('mindset.quickAccessText')}</p>
              </div>
            </div>
            <div className="mindset-home-panel">
              <DashboardContent planCode={planCode} subscription={subscription} userEmail={userEmail} />
            </div>
          </div>
        </section>

        <section id="page-vision" className={`page ${activePage === 'vision' ? 'active' : ''}`}>
          <h1 className="page-title">{t('mindset.visionIdentity')}</h1>
          <p className="page-sub">{t('mindset.visionSub')}</p>
          <div className="vision-stack">
            <div className="card">
              <h2>{t('mindset.missionTitle')}</h2>
              <div className="vision-field">
                <label htmlFor="mi-mission">{t('mindset.missionLabel')}</label>
                <textarea id="mi-mission" className="input-dark" rows="6" value={state.vision.mission} onChange={(e) => setVisionField('mission', e.target.value)} placeholder={t('mindset.missionPlaceholder')} />
              </div>
            </div>
            <div className="card">
              <h2>{t('mindset.valuesTitle')}</h2>
              <div className="vision-field">
                <label htmlFor="mi-values">{t('mindset.valuesLabel')}</label>
                <textarea id="mi-values" className="input-dark" rows="7" value={state.vision.values} onChange={(e) => setVisionField('values', e.target.value)} />
              </div>
            </div>
            <div className="card">
              <h2>{t('mindset.promiseTitle')}</h2>
              <div className="vision-field">
                <label htmlFor="mi-promise">{t('mindset.promiseLabel')}</label>
                <textarea id="mi-promise" className="input-dark" rows="6" value={state.vision.promise} onChange={(e) => setVisionField('promise', e.target.value)} />
              </div>
            </div>
          </div>
        </section>

        <section id="page-journal" className={`page ${activePage === 'journal' ? 'active' : ''}`}>
          <h1 className="page-title">{t('mindset.reflectionJournal')}</h1>
          <p className="page-sub">{t('mindset.reflectionIntro')}</p>
          <div className="journal-layout">
            <div className="card journal-editor">
              <h2>{t('mindset.journalNew')}</h2>
              <label htmlFor="mi-je-title">{t('mindset.journalTitleLabel')}</label>
              <input type="text" id="mi-je-title" className="input-dark" placeholder={t('mindset.journalPlaceholder')} />
              <label htmlFor="mi-je-body">{t('mindset.journalTextLabel')}</label>
              <textarea id="mi-je-body" className="input-dark" rows="7" placeholder={t('mindset.journalBodyPlaceholder')} />
              <button type="button" className="btn" id="mi-je-add" onClick={addJournal}>{t('app.save')}</button>
            </div>

            <div className="journal-list-wrap">
              {sortedJournal.length ? sortedJournal.map((entry) => {
                const d = new Date(entry.ts || Date.now());
                const ds = d.toLocaleDateString(dateLocale, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
                const isEditing = editingJournalId === entry.id;
                return (
                  <div className="journal-entry" key={entry.id}>
                    <div className="journal-entry-actions">
                      {!isEditing ? (
                        <button type="button" className="journal-action" onClick={() => startEditJournal(entry)}>{t('app.edit')}</button>
                      ) : null}
                      <button
                        type="button"
                        className="journal-action journal-delete"
                        onClick={() => setState((prev) => ({ ...prev, journal: prev.journal.filter((e) => e.id !== entry.id) }))}
                      >{t('app.delete')}</button>
                    </div>
                    <div className="meta">{ds}</div>
                    {isEditing ? (
                      <div className="journal-edit-form">
                        <input
                          type="text"
                          className="input-dark"
                          value={journalDraft.title}
                          onChange={(e) => setJournalDraft((prev) => ({ ...prev, title: e.target.value }))}
                          placeholder={t('mindset.journalTitleLabel')}
                        />
                        <textarea
                          className="input-dark"
                          rows="6"
                          value={journalDraft.body}
                          onChange={(e) => setJournalDraft((prev) => ({ ...prev, body: e.target.value }))}
                        />
                        <div className="journal-edit-actions">
                          <button type="button" className="btn" onClick={() => saveEditJournal(entry.id)}>{t('app.save')}</button>
                          <button type="button" className="btn btn-ghost" onClick={cancelEditJournal}>{t('app.cancel')}</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {entry.title ? <h3>{entry.title}</h3> : null}
                        <p>{entry.body}</p>
                      </>
                    )}
                  </div>
                );
              }) : (
                <div className="journal-empty">
                  <p className="hint">{t('mindset.noEntries')}</p>
                  <p className="note journal-empty-note">{t('mindset.savedAutomatically')}</p>
                </div>
              )}
            </div>
          </div>
        </section>

        <section id="page-routine" className={`page ${activePage === 'routine' ? 'active' : ''}`}>
          <h1 className="page-title">{t('mindset.routine')}</h1>
          <p className="page-sub">{t('mindset.routinesIntro')}</p>
          <div className="routine-stack">
            <div className="card">
              <h2>{t('mindset.routinesTitle')}</h2>
              <p className="hint">{t('mindset.routinesEditHint')}</p>
              <div className="routine-fields">
                {state.routineLabels.map((label, index) => (
                  <div key={index} className="routine-field">
                    <label htmlFor={`mi-routine-${index}`}>{t('mindset.routineLabel')} {index + 1}</label>
                    <input
                      id={`mi-routine-${index}`}
                      type="text"
                      className="input-dark"
                      placeholder={`Ex. Routine ${index + 1}`}
                      value={label}
                      onChange={(e) => setRoutineLabel(index, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </div>
            <div className="card">
              <h2>{t('mindset.routinesDay')} — <span suppressHydrationWarning>{mounted ? new Date().toLocaleDateString(dateLocale, { weekday: 'long', day: 'numeric', month: 'long' }) : ''}</span></h2>
              <div className="routine-checklist">
                {state.routineLabels.map((label, index) => (
                  <div className="routine-row" key={index}>
                    <input
                      type="checkbox"
                      id={`mi-rc-${index}`}
                      checked={!!activeRoutine[index]}
                      onChange={(e) => toggleRoutine(index, e.target.checked)}
                    />
                    <label htmlFor={`mi-rc-${index}`}>{(label && label.trim()) || `${t('mindset.routineLabel')} ${index + 1}`}</label>
                  </div>
                ))}
              </div>
              <p className="hint">{t('mindset.routinesHint')}</p>
            </div>
            <div className="card">
              <h2>{t('mindset.morningRoutineTitle')}</h2>
              <div className="routine-checklist">
                {[t('mindset.morningItem1'), t('mindset.morningItem2'), t('mindset.morningItem3'), t('mindset.morningItem4')].map((label, index) => (
                  <div className="routine-row" key={`mi-morning-${index}`}>
                    <input
                      type="checkbox"
                      id={`mi-morning-${index}`}
                      checked={!!morningRoutine[index]}
                      onChange={(e) => toggleMorningRoutine(index, e.target.checked)}
                    />
                    <label htmlFor={`mi-morning-${index}`}>{label}</label>
                  </div>
                ))}
              </div>
              <p className="hint">{t('mindset.morningRoutineHint')}</p>
            </div>
          </div>
        </section>

        <section id="page-rules" className={`page ${activePage === 'rules' ? 'active' : ''}`}>
          <h1 className="page-title">{t('mindset.lifeRules')}</h1>
          <p className="page-sub">{t('mindset.rulesIntro')}</p>
          <div className="card">
            <h2>{t('mindset.rulesTitle')}</h2>
            <div id="mi-rules-list" className="rules-list">
              {state.rules.map((rule, idx) => (
                <div className="rule-item" key={idx}>
                  <label htmlFor={`mi-rule-${idx}`}>{t('mindset.ruleLabel')} {idx + 1}</label>
                  <div className="rule-line">
                    <input
                      id={`mi-rule-${idx}`}
                      type="text"
                      className="input-dark"
                      placeholder={t('mindset.rulePlaceholder')}
                      value={rule.text || ''}
                      onChange={(e) => setState((prev) => {
                        const rules = [...prev.rules];
                        rules[idx] = { text: e.target.value };
                        return { ...prev, rules };
                      })}
                    />
                    <button
                      type="button"
                      className="btn-ghost"
                      onClick={() => setState((prev) => ({ ...prev, rules: prev.rules.filter((_, i) => i !== idx) }))}
                    >×</button>
                  </div>
                </div>
              ))}
            </div>
            <button type="button" className="btn btn-ghost" id="mi-rule-add" onClick={addRule} style={{ marginTop: '0.5rem' }}>{t('mindset.addRule')}</button>
          </div>
        </section>

      </main>
    </div>
  );
}
