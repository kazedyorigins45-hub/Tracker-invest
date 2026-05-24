export const FEATURE_LABELS = {
  mindset: 'Tracker-invest',
  tracker: 'Elite Tracker',
  invest: 'Elite Invest',
  portfolio: 'Mes investissements',
};

export const APP_NAV = [
  { href: '/dashboard', label: 'Dashboard', feature: 'mindset' },
  { href: '/mindset', label: 'Mindset', feature: 'mindset' },
  { href: '/tracker', label: 'Trading', feature: 'tracker' },
  { href: '/invest', label: 'Investissement', feature: 'invest' },
  { href: '/portfolio', label: 'Portfolio', feature: 'portfolio' },
];

export const PLANS = [
  {
    code: 'starter',
    name: 'Starter',
    nameEn: 'Starter',
    description: 'Le socle essentiel pour travailler ton mindset et ta discipline.',
    descriptionEn: 'The essential foundation to work on your mindset and discipline.',
    prices: { monthly: 0, yearly: 0 },
    monthlyLabel: 'Mensuel',
    yearlyLabel: 'Annuel',
    billing: {
      monthly: { autoRenew: true, note: 'Renouvellement automatique chaque mois, résiliable à tout moment. TVA non applicable – régime de la franchise de la taxe. Aucune déduction de TVA.' },
      yearly: { autoRenew: true, note: 'Renouvellement automatique chaque année, résiliable à tout moment. TVA non applicable – régime de la franchise de la taxe. Aucune déduction de TVA.' },
    },
    features: { mindset: true, tracker: false, invest: false, portfolio: true },
    order: 1,
    highlight: false,
  },
  {
    code: 'trader',
    name: 'Trading',
    nameEn: 'Trading',
    description: 'Accès Trading seul pour suivre ton activité avec plus de rigueur.',
    descriptionEn: 'Trading-only access to track your activity with more discipline.',
    prices: { monthly: 12.5, yearly: 125 },
    monthlyLabel: 'Mensuel',
    yearlyLabel: 'Annuel',
    billing: {
      monthly: { autoRenew: true, note: 'Renouvellement automatique chaque mois, résiliable à tout moment. TVA non applicable – régime de la franchise de la taxe. Aucune déduction de TVA.' },
      yearly: { autoRenew: true, note: 'Renouvellement automatique chaque année, résiliable à tout moment. TVA non applicable – régime de la franchise de la taxe. Aucune déduction de TVA.' },
    },
    features: { mindset: true, tracker: true, invest: false, portfolio: true },
    order: 2,
    highlight: false,
  },
  {
    code: 'investor',
    name: 'Investissement',
    nameEn: 'Investing',
    description: 'Accès Investissement seul pour structurer le long terme.',
    descriptionEn: 'Investing-only access to structure your long term strategy.',
    prices: { monthly: 12.5, yearly: 125 },
    monthlyLabel: 'Mensuel',
    yearlyLabel: 'Annuel',
    billing: {
      monthly: { autoRenew: true, note: 'Renouvellement automatique chaque mois, résiliable à tout moment. TVA non applicable – régime de la franchise de la taxe. Aucune déduction de TVA.' },
      yearly: { autoRenew: true, note: 'Renouvellement automatique chaque année, résiliable à tout moment. TVA non applicable – régime de la franchise de la taxe. Aucune déduction de TVA.' },
    },
    features: { mindset: true, tracker: false, invest: true, portfolio: true },
    order: 3,
    highlight: false,
  },
  {
    code: 'empire',
    name: 'Trading + Investissement',
    nameEn: 'Trading + Investing',
    description: 'Accès complet à la partie Trading et Investissement.',
    descriptionEn: 'Full access to both Trading and Investing.',
    prices: { monthly: 20, yearly: 200 },
    monthlyLabel: 'Mensuel',
    yearlyLabel: 'Annuel',
    billing: {
      monthly: { autoRenew: true, note: 'Renouvellement automatique chaque mois, résiliable à tout moment. TVA non applicable – régime de la franchise de la taxe. Aucune déduction de TVA.' },
      yearly: { autoRenew: true, note: 'Renouvellement automatique chaque année, résiliable à tout moment. TVA non applicable – régime de la franchise de la taxe. Aucune déduction de TVA.' },
    },
    features: { mindset: true, tracker: true, invest: true, portfolio: true },
    order: 4,
    highlight: true,
  },
];

export function getPlan(code) {
  return PLANS.find((plan) => plan.code === code) || PLANS[0];
}

export function canAccess(planCode, feature) {
  const plan = getPlan(planCode);
  return !!plan.features[feature];
}

export function formatBillingCycle(cycle) {
  return cycle === 'yearly' ? 'Annuel' : 'Mensuel';
}

export function getSubscriptionLabel(subscription, planCode) {
  const plan = getPlan(planCode || subscription?.plan_code);
  const cycle = formatBillingCycle(subscription?.billing_cycle);
  return `${plan.name} • ${cycle}`;
}
