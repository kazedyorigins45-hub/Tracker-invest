import Link from 'next/link';

export const metadata = {
  title: 'Mentions légales – Tracker Invest',
};

export default function MentionsLegalesPage() {
  return (
    <main>
      <div className="user-strip">
        <span className="brand">Tracker Invest</span>
        <nav className="footer-links" aria-label="Navigation rapide">
          <Link href="/">Accueil</Link>
          <Link href="/pricing">Abonnements</Link>
          <Link href="/login">Connexion</Link>
        </nav>
      </div>

      <div className="legal-wrap">
        <h1 className="home-title">Mentions légales</h1>

        <div className="legal-content">
          <section>
            <h2>1. Éditeur du site</h2>
            <p>Le site <strong>www.tracker-invest.com</strong> est édité par :</p>
            <ul>
              <li><strong>Nom :</strong> Jonathan Gieraerts</li>
              <li><strong>Statut :</strong> Indépendant complémentaire / Personne physique</li>
              <li><strong>Siège social :</strong> Belgique (adresse complète disponible sur demande)</li>
              <li><strong>Numéro d'entreprise (BCE) :</strong> 1037.713.522</li>
              <li><strong>Statut :</strong> Assujetti franchisé – régime particulier de franchise des petites entreprises</li>
              <li><strong>Email :</strong> <a href="mailto:tracker-invest@proton.me">tracker-invest@proton.me</a></li>
            </ul>
          </section>

          <section>
            <h2>2. Hébergement du site et des données</h2>
            <p>Le site <strong>www.tracker-invest.com</strong> est hébergé par :</p>
            <p><strong>Hébergeur du site (Frontend) :</strong> Vercel Inc.<br />
            Siège social : 340 S Lemon Ave #4133, Walnut, CA 91789, USA.<br />
            Site web : <a href="https://vercel.com" target="_blank" rel="noopener noreferrer">https://vercel.com</a></p>
            <p>La gestion de la base de données et de l'authentification est assurée par :</p>
            <p><strong>Prestataire de stockage (Backend) :</strong> Supabase Inc.<br />
            Siège social : 970 Summer St, Stamford, CT 06905, USA.<br />
            <strong>Localisation des données :</strong> Union Européenne (Région : Francfort, Allemagne)</p>
          </section>
        </div>

        <div className="legal-footer-nav">
          <Link href="/privacy">Politique de confidentialité</Link>
          <Link href="/terms">CGU & Conditions de service</Link>
        </div>
      </div>
    </main>
  );
}
