"use client";

import { useSyncExternalStore } from 'react';

const LOCALE_KEY = 'mindset-locale';
const EVENT_NAME = 'mindset-locale-change';

export const TRANSLATIONS = {
  fr: {
    app: {
      spaces: 'Espaces',
      dashboard: 'Dashboard',
      dashboardLink: 'Accueil & abonnements',
      mindset: 'Mindset Invest',
      trading: 'Trading — Elite Tracker',
      invest: 'Investissement — Elite Invest',
      portfolio: 'Mes investissements',
      subscription: 'Abonnement',
      status: 'Statut',
      upgrade: 'Upgrader',
      logout: 'Déconnexion',
      seePlans: 'Voir les abonnements',
      activeSubscription: 'Abonnement actif',
      save: 'Enregistrer',
      edit: 'Modifier',
      delete: 'Supprimer',
      cancel: 'Annuler',
      plan: 'Plan',
      cycle: 'Cycle',
      nextPayment: 'Prochain prélèvement',
    },
    site: {
      home: 'Accueil',
      subscriptions: 'Abonnements',
      features: 'Fonctionnalités',
      faq: 'FAQ',
      login: 'Connexion',
      mySpace: 'Mon espace',
      logout: 'Déconnexion',
    },
    legal: {
      privacyTitle: 'Confidentialité',
      termsTitle: 'CGU',
      placeholder: 'Page légale à compléter avant mise en production.',
    },
    pricing: {
      monthly: 'Mensuel',
      yearly: 'Annuel',
      recommended: 'Recommandé',
      plan: 'Plan',
      autoRenew: 'renouvellement automatique',
      chooseMonthly: 'Choisir mensuel',
      chooseYearly: 'Choisir annuel',
      login: 'Se connecter',
    },
    theme: {
      light: 'Mode clair',
      dark: 'Mode sombre',
    },
    language: {
      english: 'English',
      french: 'Français',
    },
    mindset: {
      home: 'Accueil',
      vision: 'Vision & identité',
      journal: 'Journal',
      routine: 'Routines',
      rules: 'Règles de vie',
      spaces: 'Espaces',
      preferences: 'Préférences',
      visionIdentity: 'Vision & identité',
      reflectionJournal: 'Journal de réflexion',
      lifeRules: 'Règles de vie',
      today: 'Aujourd’hui',
      noEntries: 'Aucune entrée pour l’instant.',
      savedAutomatically: 'Tes notes se sauvegardent automatiquement et restent modifiables.',
      reflectionIntro: 'Notes datées : émotions, apprentissages, décisions de vie — pas les setups de trading.',
      routinesIntro: 'Quatre actions que tu veux ancrer (modifiables). Coche ce que tu as fait aujourd’hui.',
      rulesIntro: 'Principes généraux (pas les règles de trading du carnet). Une ligne = une règle.',
      homeIntro: 'Ici tu poses le cadre humain : pourquoi tu investis, comment tu veux vivre, quelle discipline tu t’imposes. Ce n’est ni le suivi de trades (Elite Tracker), ni le portefeuille long terme (Elite Invest) — c’est la couche mental & valeurs.',
      quickAccess: 'Accès rapide',
      quickAccessText: 'Utilise le menu à gauche : définis ta vision, écris dans le journal, coche tes routines et rappelle-toi tes règles non négociables.',
      visionSub: 'Qui tu es en tant qu’investisseur et quelle vie tu construis avec ton patrimoine.',
      missionTitle: 'Mission personnelle',
      missionLabel: 'En une ou deux phrases : pourquoi tu places ton argent et ton énergie ici ?',
      missionPlaceholder: 'Ex. Construire une liberté progressive pour ma famille, sans parier mon sommeil…',
      valuesTitle: 'Valeurs & non-négociables',
      valuesLabel: 'Ce que tu refuses de sacrifier (temps, éthique, risque…)',
      promiseTitle: 'Engagement envers toi-même',
      promiseLabel: 'Promesse signée avec toi-même pour les 12 prochains mois',
      journalNew: 'Nouvelle entrée',
      journalTitleLabel: 'Titre (optionnel)',
      journalTextLabel: 'Texte',
      journalPlaceholder: 'Ex. Après la réunion, clarification sur mes priorités',
      journalBodyPlaceholder: 'Écris ce que tu ressens, ce que tu apprends, ce que tu décides…',
      routinesTitle: 'Libellés des quatre routines',
      routinesDay: 'Aujourd’hui',
      routinesHint: 'Les coches sont stockées par jour (clé date). Change de jour : les cases se réinitialisent pour demain.',
      routineLabel: 'Routine',
      rulesTitle: 'Mes règles',
      addRule: '+ Ajouter une règle',
      ruleLabel: 'Règle',
      rulePlaceholder: 'Ex. Je n’investis jamais sous émotion',
    },
    tracker: {
      nav: {
        cover: 'Introduction',
        overview: "Vue d'ensemble",
        journal: 'Journal hebdo',
        trades: 'Trades',
        stats: 'Statistiques',
        psych: 'Psychologie',
        report: 'Rapport',
      },
      title: 'Carnet de trading',
      subtitle: 'Le carnet reste distinct du mindset et du patrimoine long terme : ici, on suit l’exécution, les résultats et la discipline.',
      workFrame: 'Cadre de travail',
      workFrameText: 'Concentre-toi sur la méthode, le risque et le suivi des trades. Les sections ci-dessous reprennent le carnet, le bilan et la psychologie.',
      overview: 'Vue d\'ensemble',
      weeklySummary: 'Synthèse rapide des performances et du suivi de la semaine.',
      planExecution: 'Plan d’exécution',
      rules: 'Règles',
      journal: 'Journal hebdo',
      journalSub: 'Notes de marché et de comportement — pas le portefeuille long terme.',
      newNote: 'Nouvelle note',
      summary: 'Résumé',
      details: 'Détails',
      save: 'Enregistrer',
      trades: 'Trades',
      tradesSub: 'Suivi des positions et des sorties.',
      stats: 'Statistiques',
      statsSub: 'Performance, discipline et répétition.',
      psych: 'Psychologie',
      psychSub: 'L’état mental reste le cœur du trading.',
      report: 'Rapport',
      reportSub: 'Bilan synthétique pour la semaine.',
      tips: 'Ce qui m\'aide',
      costs: 'Ce qui me coûte',
      recap: 'Résumé',
    },
    invest: {
      nav: {
        cover: 'Introduction',
        overview: "Vue d'ensemble",
        classes: "Classes d'actifs",
        holdings: 'Mes positions',
        immo: 'Rentabilité immo',
        goals: 'Objectifs & horizon',
        monthly: 'Bilan mensuel',
      },
      title: 'Investissement & patrimoine',
      subtitle: 'Ici tu suis les actifs long terme : crypto, métaux, matières premières, immobilier, obligations et actions de fond de portefeuille.',
      identity: 'Identité du portefeuille',
      overview: 'Vue d\'ensemble',
      summary: 'Résumé de la répartition et des performances.',
      strategy: 'Stratégie',
      reminder: 'Rappel',
      classes: 'Classes d\'actifs',
      portfolio: 'Mes positions',
      portfolioSub: 'Vue portefeuille, rendement et allocation.',
      immo: 'Rentabilité immo',
      immoSub: 'Calcul simple pour comparer rendement, cashflow et effort d’épargne.',
      scenario: 'Scénario exemple',
      goals: 'Objectifs & horizon',
      goalsSub: 'Ce que tu veux atteindre à 1, 3 et 10 ans.',
      monthly: 'Bilan mensuel',
      monthlySub: 'Synthèse d’activité et d’allocations.',
      summaryBox: 'Résumé',
      objective: 'Ton objectif',
      saveObjective: 'Enregistrer l’objectif',
      refresh: 'Rafraîchir les totaux',
    },
    portfolio: {
      nav: {
        dashboard: 'Dashboard',
        mindset: 'Mindset Invest',
        portfolio: 'Mes investissements',
        tracker: 'Trading — Elite Tracker',
        invest: 'Investissement — Elite Invest',
      },
title: 'Vue consolidée',
      subtitle: 'Définis ton objectif patrimonial : le total affiché additionne la valeur estimée de toutes tes positions et le résultat cumulé de tous tes trades.',
      objective: 'Ton objectif',
      objectiveTitle: 'Titre (optionnel)',
      progress: "Progression vers l'objectif",
      globalGoal: 'Objectif global consolidé (€)',
      note: 'Note',
      saveObjective: "Enregistrer l'objectif",
      refresh: 'Rafraîchir les totaux',
      axes: 'Elite Invest — trois axes',
      axesText: 'Actifs ouverts, revenu passif et fonds disponibles — à relier à tes positions et ventes.',
      lastSim: 'Dernière simu immo',
      lastSimText: 'Résumé de la rentabilité immobilière et renvoi vers Elite Invest.',
      open: 'Ouvrir Rentabilité immo →',
      total: 'Total consolidé',
      reached: 'Objectif atteint',
      positions: 'Patrimoine positions',
      tradingNet: 'Trading net',
      progressGlobal: 'Progression globale',
    },
    home: {
      title: 'Accueil',
      headline: 'MINDSET INVEST',
      tagline: 'Deux univers : le trading (discipline court terme) et l’investissement (patrimoine long terme). Le mindset complète les deux sans les remplacer.',
      tradingPillar: 'Mindset, plan, suivi, bilans et discipline d’exécution pour les marchés à court terme.',
      investingPillar: 'Allocation, positions, objectifs patrimoniaux et suivi long terme sans mélanger les usages.',
      formationTitle: 'La formation, essentielle',
      formationText: 'Trading et investissement exigent méthode, gestion du risque et compréhension des décisions. Les espaces premium servent à structurer l’exécution, pas à la remplacer.',
      accessLabel: 'Accès & parcours',
      plans: 'Voir les plans',
      modules: 'Voir les modules',
      mindsetSpace: 'Mindset Invest — espace dédié',
      mindsetSpaceDesc: 'Vision, journal, routines et règles de vie. Indépendant du carnet trading et du portefeuille long terme.',
      portfolioSpace: 'Mes investissements — synthèse & objectif',
      portfolioSpaceDesc: 'Vue consolidée de l’investissement et du suivi global, prête pour relier les métriques clés.',
      subscriptionsTitle: 'Abonnements',
      pagesTitle: 'Pages complémentaires',
      dashboardDesc: 'vue compte et accès abonnés.',
      pricingDesc: 'mensuel / annuel et comparaison des offres.',
      footer: 'Ton abonnement sera relié à ton compte via Supabase puis Stripe. Les pages publiques restent SEO-friendly, les pages privées restent protégées.',
    },
    dashboard: {
      title: 'Dashboard',
      subtitle: 'Vue d’ensemble de ton espace premium.',
      subscription: 'Mon abonnement',
      subscriptionText: 'Gère ton abonnement directement dans l’application : plan, annulation, reprise et factures.',
      manage: 'Gérer mon abonnement',
      change: 'Changer de plan',
      active: 'Abonnement actif',
      nextPayment: 'Prochain prélèvement',
    },
    billing: {
      title: 'Gestion abonnement',
      subtitle: 'Gère ton abonnement directement dans l’application.',
      summary: 'Résumé',
      changePlan: 'Changer de plan',
      cancel: 'Annuler à la fin de la période',
      resume: 'Réactiver',
      paymentMethods: 'Moyens de paiement',
      invoices: 'Factures récentes',
      currentPlan: 'Plan actuel',
      status: 'Statut',
      cycle: 'Cycle',
      nextPayment: 'Prochain prélèvement',
      cancelAtEnd: 'Annulation prévue',
      noInvoices: 'Aucune facture disponible.',
      noPaymentMethods: 'Aucun moyen de paiement.',
      choosePlan: 'Choisir ce plan',
      openCheckout: 'Payer avec Stripe',
      actionSaving: 'Traitement...',
      saved: 'Action effectuée.',
      error: 'Action impossible.',
    },
  },
  en: {
    app: {
      spaces: 'Spaces',
      dashboard: 'Dashboard',
      dashboardLink: 'Home & subscriptions',
      mindset: 'Mindset',
      trading: 'Trading — Elite Tracker',
      invest: 'Investing — Elite Invest',
      portfolio: 'My investments',
      subscription: 'Subscription',
      status: 'Status',
      upgrade: 'Upgrade',
      logout: 'Logout',
      seePlans: 'View plans',
      activeSubscription: 'Active subscription',
      save: 'Save',
      edit: 'Edit',
      delete: 'Delete',
      cancel: 'Cancel',
    },
    site: {
      home: 'Home',
      subscriptions: 'Plans',
      features: 'Features',
      faq: 'FAQ',
      login: 'Login',
      mySpace: 'My space',
      logout: 'Logout',
    },
    legal: {
      privacyTitle: 'Privacy',
      termsTitle: 'Terms',
      placeholder: 'Legal page to complete before production.',
    },
    pricing: {
      monthly: 'Monthly',
      yearly: 'Yearly',
      recommended: 'Recommended',
      plan: 'Plan',
      autoRenew: 'auto-renewal',
      chooseMonthly: 'Choose monthly',
      chooseYearly: 'Choose yearly',
      login: 'Log in',
    },
    theme: {
      light: 'Light mode',
      dark: 'Dark mode',
    },
    language: {
      english: 'English',
      french: 'Français',
    },
    mindset: {
      home: 'Home',
      vision: 'Vision & identity',
      journal: 'Journal',
      routine: 'Routines',
      rules: 'Life rules',
      spaces: 'Spaces',
      preferences: 'Preferences',
      visionIdentity: 'Vision & identity',
      reflectionJournal: 'Reflection journal',
      lifeRules: 'Life rules',
      today: 'Today',
      noEntries: 'No entries yet.',
      savedAutomatically: 'Your notes are saved automatically and remain editable.',
      reflectionIntro: 'Dated notes: emotions, learnings, life decisions — not trading setups.',
      routinesIntro: 'Four actions you want to anchor (editable). Tick what you have done today.',
      rulesIntro: 'General principles (not the trading rules from the journal). One line = one rule.',
      homeIntro: 'Here you set the human frame: why you invest, how you want to live, and what discipline you impose on yourself. This is neither trade tracking (Elite Tracker) nor long-term portfolio (Elite Invest) — it is the mental & values layer.',
      quickAccess: 'Quick access',
      quickAccessText: 'Use the menu on the left: define your vision, write in the journal, tick your routines and remember your non-negotiable rules.',
      visionSub: 'Who you are as an investor and what kind of life you are building with your wealth.',
      missionTitle: 'Personal mission',
      missionLabel: 'In one or two sentences: why do you place your money and energy here?',
      missionPlaceholder: 'Ex. Build progressive freedom for my family without gambling my sleep…',
      valuesTitle: 'Values & non-negotiables',
      valuesLabel: 'What you refuse to sacrifice (time, ethics, risk…)',
      promiseTitle: 'Commitment to yourself',
      promiseLabel: 'Promise signed with yourself for the next 12 months',
      journalNew: 'New entry',
      journalTitleLabel: 'Title (optional)',
      journalTextLabel: 'Text',
      journalPlaceholder: 'Ex. After the meeting, clarity on my priorities',
      journalBodyPlaceholder: 'Write what you feel, what you learn, what you decide…',
      routinesTitle: 'Labels of the four routines',
      routinesDay: 'Today',
      routinesHint: 'Ticks are stored per day (date key). Change the day: the boxes reset for tomorrow.',
      routineLabel: 'Routine',
      rulesTitle: 'My rules',
      addRule: '+ Add a rule',
      ruleLabel: 'Rule',
      rulePlaceholder: 'Ex. I never invest while emotional',
    },
    tracker: {
      nav: {
        cover: 'Introduction',
        overview: 'Overview',
        journal: 'Weekly journal',
        trades: 'Trades',
        stats: 'Statistics',
        psych: 'Psychology',
        report: 'Report',
      },
      title: 'Trading journal',
      subtitle: 'This journal stays separate from mindset and long-term wealth: here we track execution, results and discipline.',
      workFrame: 'Work frame',
      workFrameText: 'Focus on method, risk and trade tracking. The sections below cover the journal, review and psychology.',
      overview: 'Overview',
      weeklySummary: 'Quick summary of weekly performance and tracking.',
      planExecution: 'Execution plan',
      rules: 'Rules',
      journal: 'Weekly journal',
      journalSub: 'Market and behavior notes — not the long-term portfolio.',
      newNote: 'New note',
      summary: 'Summary',
      details: 'Details',
      save: 'Save',
      trades: 'Trades',
      tradesSub: 'Tracking positions and exits.',
      stats: 'Statistics',
      statsSub: 'Performance, discipline and repetition.',
      psych: 'Psychology',
      psychSub: 'Mental state remains the heart of trading.',
      report: 'Report',
      reportSub: 'Weekly summary report.',
      tips: 'What helps me',
      costs: 'What costs me',
      recap: 'Recap',
    },
    invest: {
      nav: {
        cover: 'Introduction',
        overview: 'Overview',
        classes: 'Asset classes',
        holdings: 'My positions',
        immo: 'Real estate yield',
        goals: 'Goals & horizon',
        monthly: 'Monthly review',
      },
      title: 'Investing & wealth',
      subtitle: 'Here you track long-term assets: crypto, metals, commodities, real estate, bonds and core holdings.',
      identity: 'Portfolio identity',
      overview: 'Overview',
      summary: 'Allocation and performance summary.',
      strategy: 'Strategy',
      reminder: 'Reminder',
      classes: 'Asset classes',
      portfolio: 'My positions',
      portfolioSub: 'Portfolio view, yield and allocation.',
      immo: 'Real estate yield',
      immoSub: 'Simple calculation to compare yield, cashflow and savings effort.',
      scenario: 'Example scenario',
      goals: 'Goals & horizon',
      goalsSub: 'What you want to reach in 1, 3 and 10 years.',
      monthly: 'Monthly review',
      monthlySub: 'Activity and allocation summary.',
      summaryBox: 'Summary',
      objective: 'Your objective',
      saveObjective: 'Save objective',
      refresh: 'Refresh totals',
    },
    portfolio: {
      nav: {
        dashboard: 'Dashboard',
        mindset: 'Mindset',
        portfolio: 'My investments',
        tracker: 'Trading — Elite Tracker',
        invest: 'Investing — Elite Invest',
      },
      title: 'Consolidated view',
      subtitle: 'Set your wealth goal: the total displayed adds the estimated value of all your positions and the cumulative result of all your trades.',
      objective: 'Your objective',
      objectiveTitle: 'Title (optional)',
      progress: 'Progress toward goal',
      globalGoal: 'Consolidated global goal (€)',
      note: 'Note',
      saveObjective: 'Save objective',
      refresh: 'Refresh totals',
      axes: 'Elite Invest — three axes',
      axesText: 'Open assets, passive income and available cash — to connect with your positions and sales.',
      lastSim: 'Latest real estate simulation',
      lastSimText: 'Real estate yield summary and link back to Elite Invest.',
      open: 'Open Real Estate yield →',
      total: 'Consolidated total',
      reached: 'Goal reached',
      positions: 'Wealth positions',
      tradingNet: 'Net trading',
      progressGlobal: 'Overall progress',
    },
    home: {
      title: 'Home',
      headline: 'MINDSET INVEST',
      tagline: 'Two worlds: trading (short-term discipline) and investing (long-term wealth). Mindset complements both without replacing them.',
      tradingPillar: 'Mindset, plan, tracking, reviews and execution discipline for short-term markets.',
      investingPillar: 'Allocation, positions, wealth goals and long-term tracking without mixing use cases.',
      formationTitle: 'Training is essential',
      formationText: 'Trading and investing require method, risk management and decision-making clarity. Premium spaces help structure execution, not replace it.',
      accessLabel: 'Access & journey',
      plans: 'View plans',
      modules: 'View modules',
      mindsetSpace: 'Mindset Invest — dedicated space',
      mindsetSpaceDesc: 'Vision, journal, routines and life rules. Separate from trading journal and long-term portfolio.',
      portfolioSpace: 'My investments — summary & goal',
      portfolioSpaceDesc: 'A consolidated view of investing and global tracking, ready to connect key metrics.',
      subscriptionsTitle: 'Plans',
      pagesTitle: 'Additional pages',
      dashboardDesc: 'account view and subscriber access.',
      pricingDesc: 'monthly / yearly and offer comparison.',
      footer: 'Your subscription will be linked to your account through Supabase and then Stripe. Public pages remain SEO-friendly, private pages remain protected.',
    },
    dashboard: {
      title: 'Dashboard',
      subtitle: 'Overview of your premium space.',
      subscription: 'My subscription',
      subscriptionText: 'Manage your subscription directly in the app: plan, cancel, resume and invoices.',
      manage: 'Manage subscription',
      change: 'Change plan',
      active: 'Active subscription',
      nextPayment: 'Next payment',
    },
    billing: {
      title: 'Subscription management',
      subtitle: 'Manage your subscription directly in the app.',
      summary: 'Summary',
      changePlan: 'Change plan',
      cancel: 'Cancel at period end',
      resume: 'Resume',
      paymentMethods: 'Payment methods',
      invoices: 'Recent invoices',
      currentPlan: 'Current plan',
      status: 'Status',
      cycle: 'Cycle',
      nextPayment: 'Next payment',
      cancelAtEnd: 'Cancellation scheduled',
      noInvoices: 'No invoices available.',
      noPaymentMethods: 'No payment methods.',
      choosePlan: 'Choose this plan',
      openCheckout: 'Pay with Stripe',
      actionSaving: 'Processing...',
      saved: 'Action completed.',
      error: 'Action failed.',
    },
  },
};

function getLocaleSnapshot() {
  if (typeof document === 'undefined') return 'fr';

  const stored = (() => {
    try {
      return localStorage.getItem(LOCALE_KEY);
    } catch {
      return null;
    }
  })();

  const locale = stored || document.documentElement.dataset.locale || 'fr';
  return locale === 'en' ? 'en' : 'fr';
}

function emitLocaleChange(locale) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { locale } }));
}

export function applyLocale(nextLocale) {
  if (typeof document === 'undefined') return;
  const normalized = nextLocale === 'en' ? 'en' : 'fr';
  document.documentElement.dataset.locale = normalized;
  document.documentElement.lang = normalized;
  try {
    localStorage.setItem(LOCALE_KEY, normalized);
  } catch {
    // ignore
  }
  emitLocaleChange(normalized);
}

function subscribe(callback) {
  if (typeof window === 'undefined') return () => {};

  const onLocaleEvent = () => callback();
  const onStorage = (event) => {
    if (event.key === LOCALE_KEY) callback();
  };

  window.addEventListener(EVENT_NAME, onLocaleEvent);
  window.addEventListener('storage', onStorage);

  return () => {
    window.removeEventListener(EVENT_NAME, onLocaleEvent);
    window.removeEventListener('storage', onStorage);
  };
}

function getLocaleServerSnapshot() {
  return 'fr';
}

export function useLocale() {
  const locale = useSyncExternalStore(subscribe, getLocaleSnapshot, getLocaleServerSnapshot);
  const displayLocale = locale === 'en' ? 'fr' : 'en';

  const setLocale = (next) => applyLocale(next);

  const t = (key) => {
    const parts = String(key).split('.');
    const resolve = (dict) => {
      let current = dict;
      for (const part of parts) current = current?.[part];
      return typeof current === 'string' ? current : null;
    };

    return resolve(TRANSLATIONS[displayLocale]) || resolve(TRANSLATIONS.fr) || key;
  };

  return { locale, setLocale, t };
}
