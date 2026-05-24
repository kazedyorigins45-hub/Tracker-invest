"use client";

const FEATURES = [
  {
    number: "01",
    emoji: "📈",
    title: "Le Journal de Trading Pro",
    tagline: "Arrêtez de trader à l'aveugle. Apprenez de chaque position.",
    items: [
      {
        icon: "⚡",
        label: "Saisie intuitive",
        desc: "Enregistrez vos trades en quelques secondes (Point d'entrée, Sortie, Stop Loss).",
      },
      {
        icon: "🧠",
        label: "Analyse du Mindset",
        desc: "Notez vos émotions pour identifier vos blocages psychologiques.",
      },
      {
        icon: "📂",
        label: "Historique complet",
        desc: "Retrouvez tous vos trades passés, classés par actif et par date.",
      },
    ],
  },
  {
    number: "02",
    emoji: "💰",
    title: "Pilotage de l'Investissement",
    subtitle: "Bourse & Crypto",
    tagline: "Suivez la croissance de votre patrimoine sur le long terme.",
    items: [
      {
        icon: "🌐",
        label: "Portefeuille global",
        desc: "Visualisez vos actions, ETF et cryptomonnaies en un seul endroit.",
      },
      {
        icon: "🎯",
        label: "Diversification",
        desc: "Comprenez immédiatement comment votre capital est réparti.",
      },
      {
        icon: "📊",
        label: "Vision long terme",
        desc: "Suivez l'évolution de vos plus-values latentes.",
      },
    ],
  },
  {
    number: "03",
    emoji: "🏠",
    title: "Gestionnaire de Patrimoine Immobilier",
    tagline: "L'immobilier, pilier de votre richesse, enfin intégré.",
    items: [
      {
        icon: "🏗️",
        label: "Inventaire d'actifs",
        desc: "Ajoutez vos biens immobiliers (locatif, résidence, SCPI).",
      },
      {
        icon: "💎",
        label: "Calcul de la Net Worth",
        desc: "Tracker-invest additionne votre immobilier, votre trading et vos investissements pour vous donner votre Fortune Totale en temps réel.",
      },
      {
        icon: "🔗",
        label: "Centralisation",
        desc: "Ne jonglez plus entre trois applis et un Excel.",
      },
    ],
  },
  {
    number: "04",
    emoji: "🖥️",
    title: "Tableau de Bord Intelligent",
    subtitle: "Dashboard",
    tagline: "Une vue à 360° sur votre empire financier.",
    items: [
      {
        icon: "📉",
        label: "Graphiques dynamiques",
        desc: "Visualisez vos performances via des diagrammes clairs.",
      },
      {
        icon: "☁️",
        label: "Interface Cloud",
        desc: "Accédez à vos données depuis votre PC, tablette ou smartphone.",
      },
      {
        icon: "🔐",
        label: "Sécurité maximale",
        desc: "Vos données sont cryptées et protégées par la technologie Supabase.",
      },
    ],
  },
];

export default function FeaturesContent() {
  return (
    <div className="feat-wrap">
      <div className="feat-hero">
        <div className="feat-badge">Nos Fonctionnalités</div>
        <h1 className="feat-title">
          Transformez votre désordre financier
          <span className="feat-title-accent"> en une stratégie de précision.</span>
        </h1>
      </div>

      <div className="feat-grid">
        {FEATURES.map((f) => (
          <article key={f.number} className="feat-card">
            <div className="feat-card-glow" aria-hidden="true" />

            <div className="feat-card-header">
              <span className="feat-number">{f.number}</span>
              <span className="feat-emoji" aria-hidden="true">{f.emoji}</span>
            </div>

            <div className="feat-card-body">
              <h2 className="feat-card-title">
                {f.title}
                {f.subtitle && (
                  <span className="feat-card-subtitle"> — {f.subtitle}</span>
                )}
              </h2>
              <p className="feat-card-tagline">{f.tagline}</p>

              <ul className="feat-items">
                {f.items.map((item) => (
                  <li key={item.label} className="feat-item">
                    <span className="feat-item-icon" aria-hidden="true">{item.icon}</span>
                    <div className="feat-item-text">
                      <strong className="feat-item-label">{item.label}</strong>
                      <span className="feat-item-desc"> {item.desc}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
