import Link from 'next/link';

export const metadata = {
  title: 'CGU & Conditions de service – Tracker Invest',
};

export default function TermsPage() {
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
        <h1 className="home-title">Conditions générales</h1>
        <p className="tagline">CGU du site internet & Conditions générales de prestation de services</p>

        <nav className="legal-toc" aria-label="Table des matières">
          <a href="#cgu">Conditions générales d'utilisation (CGU)</a>
          <a href="#cgs">Conditions générales de services (CGS)</a>
        </nav>

        {/* ─── CGU ─── */}
        <div className="legal-content" id="cgu">
          <h2 className="legal-section-title">Conditions générales d'utilisation du site internet</h2>

          <section>
            <h3>Article 1 – Généralités</h3>
            <p>Le terme « utilisateur » fait référence à toute personne physique ou morale qui visite ou interagit d'une quelconque manière avec le Site.</p>
            <p>L'accès au présent site internet Tracker-invest, aux services et aux informations qu'il contient est entièrement soumis au respect des conditions générales reprises ci-dessous. En naviguant ou en utilisant ce site, l'utilisateur reconnaît avoir pris pleinement connaissance des présentes, les avoir comprises et les avoir acceptées.</p>
            <p>L'utilisateur est informé que le présent site a été créé et est géré par <strong>Gieraerts Jonathan</strong>, Clos du Renard 4, 5377 Somme-Leuze, numéro d'entreprise 1037.713.522, ci-après dénommé « Tracker-invest ».</p>
            <p>Contact : Tél. 0496/02.91.75 – Email : <a href="mailto:tracker-invest@proton.me">tracker-invest@proton.me</a></p>
          </section>

          <section>
            <h3>Article 2 – Modification</h3>
            <p>Tracker-invest se réserve le droit, à tout moment, de modifier, adapter, compléter ou supprimer les présentes conditions d'utilisation. L'utilisateur est donc invité à en prendre connaissance régulièrement.</p>
          </section>

          <section>
            <h3>Article 3 – Description des services</h3>
            <p>Tracker-invest est un outil de pilotage patrimonial conçu pour les investisseurs modernes. Le site permet de :</p>
            <ul>
              <li><strong>Centraliser :</strong> Regrouper sur une seule interface vos différents actifs (Bourse, Cryptomonnaies, Immobilier, etc.)</li>
              <li><strong>Analyser :</strong> Visualiser la répartition de votre portefeuille et l'évolution de votre performance globale</li>
              <li><strong>Suivre :</strong> Garder un historique précis de vos transactions, prix d'achat et plus-values ou moins-values</li>
            </ul>
          </section>

          <section>
            <h3>Article 4 – Propriété intellectuelle</h3>
            <p>Le présent site ainsi que ses textes, dessins, photos, illustrations, données, bases de données, logiciels, noms de domaines, logos et codes informatiques sont protégés par les droits de propriété intellectuelle. Toute copie, adaptation, traduction ou modification, en tout ou en partie, est strictement interdite sans autorisation préalable et écrite de Tracker-invest.</p>
          </section>

          <section>
            <h3>Article 5 – Contenu</h3>
            <p>Notre site est régulièrement mis à jour et le plus grand soin est apporté à la publication des informations qui y figurent (obligation de moyen). Si l'utilisateur constate une incohérence ou une erreur, il est invité à nous contacter.</p>
          </section>

          <section>
            <h3>Article 6 – Gestion du site</h3>
            <p>Tracker-invest se réserve le droit de supprimer tout compte, commentaire ou contenu jugé en contradiction avec les engagements ci-dessous. L'utilisateur s'engage notamment à :</p>
            <ul>
              <li>Ne pas exploiter les informations publiées de manière illégale</li>
              <li>Ne pas endommager, transformer ou interrompre le site par quelque moyen que ce soit</li>
              <li>Ne pas transmettre de virus ou de contenu illicite</li>
              <li>Ne pas porter atteinte aux droits de tiers (vie privée, propriété intellectuelle)</li>
              <li>Ne pas utiliser le site à des fins publicitaires sans autorisation préalable</li>
            </ul>
          </section>

          <section>
            <h3>Article 7 – Compte d'utilisateur</h3>
            <p>Certains services impliquent l'ouverture d'un compte utilisateur. L'utilisateur s'engage à fournir des informations exactes et à ne pas divulguer ses identifiants et mots de passe à des tiers. Le compte est strictement personnel.</p>
          </section>

          <section>
            <h3>Article 9 – Utilisation de cookies</h3>
            <p>Notre site utilise des cookies afin de vous identifier ou à des fins statistiques. Aucun d'entre eux n'enregistre de données permettant de vous contacter directement. Il vous est possible de modifier les réglages de votre navigateur pour empêcher leur création.</p>
          </section>

          <section>
            <h3>Article 10 – Liens hypertextes</h3>
            <p>Le site peut renvoyer, à titre indicatif, vers d'autres sites via des liens hypertextes. Tracker-invest décline toute responsabilité quant aux pratiques et informations des sites tiers.</p>
          </section>

          <section>
            <h3>Article 11 – Protection des données personnelles</h3>
            <p>Les données collectées via notre site sont traitées conformément à la <Link href="/privacy">Politique de confidentialité</Link> et au RGPD. Les données traitées incluent : nom, adresse de facturation, 4 derniers chiffres de la carte bancaire, historique des paiements, email, date de connexion, adresse IP.</p>
          </section>

          <section>
            <h3>Article 12 – Clause salvatrice</h3>
            <p>L'invalidité d'une des clauses des présentes n'entraîne pas la nullité des autres dispositions.</p>
          </section>

          <section>
            <h3>Article 13 – Juridiction et droit applicable</h3>
            <p>En cas de contestation, sont seuls compétents les tribunaux de l'arrondissement judiciaire de Dinant. Le droit applicable est le droit belge. Les parties acceptent les moyens de preuve électroniques (email, backups informatiques, etc.).</p>
          </section>
        </div>

        {/* ─── CGS ─── */}
        <div className="legal-content" id="cgs">
          <h2 className="legal-section-title">Conditions générales de prestation de services</h2>

          <section>
            <h3>1 – Dispositions générales</h3>
            <p>Les présentes conditions générales définissent les obligations respectives de <strong>Tracker-invest</strong> (siège social : Clos du Renard 4, 5377 Somme-Leuze, BCE 1037.713.522) et de son Client. En acceptant le devis, contrat ou tout commencement de prestation, le Client reconnaît avoir accepté les présentes conditions sans réserve.</p>
          </section>

          <section>
            <h3>2 – Offres – Validité et engagement</h3>
            <p>Sauf stipulation contraire, le délai de validité des offres est de 5 jours à dater de leur émission. Passé ce délai, l'offre est réputée caduque. L'acceptation sous quelque forme que ce soit (courriel, engagement verbal) constitue un engagement ferme et définitif du Client.</p>
          </section>

          <section>
            <h3>3 – Droit de rétractation</h3>
            <p>Le Client consommateur dispose d'un délai de 14 jours calendrier pour se rétracter de sa commande réalisée hors établissement ou à distance. Le Client ne bénéficie toutefois pas du droit de rétractation si le service a été pleinement exécuté avec son accord exprès avant l'expiration du délai (article VI.53 du Code de droit économique).</p>
            <p>Pour exercer ce droit : <a href="mailto:tracker-invest@proton.me">tracker-invest@proton.me</a> ou Clos du Renard 4, 5377 Somme-Leuze.</p>
          </section>

          <section>
            <h3>4 – Durée</h3>
            <p>L'abonnement est conclu pour une durée indéterminée avec une période de facturation mensuelle ou annuelle selon l'offre choisie. L'Utilisateur peut mettre fin à son abonnement à tout moment, sans frais, directement via son espace personnel sur le Site. Pour être effective avant le prochain prélèvement, la résiliation doit intervenir au plus tard 24 heures avant la date de renouvellement. L'accès aux services reste actif jusqu'à l'expiration de la période déjà réglée.</p>
          </section>

          <section>
            <h3>5 – Délais et lieux</h3>
            <p>Les délais d'exécution sont communiqués à titre indicatif (jours ouvrables). Si un délai est impératif et non respecté, le Client peut réclamer une indemnité forfaitaire de 5 % du montant total des prestations concernées.</p>
            <p>Les délais sont suspendus de plein droit en cas de force majeure (grèves, intempéries, bugs, maladie, crise sanitaire, etc.) ou si le Client ne respecte pas ses conditions de paiement.</p>
          </section>

          <section>
            <h3>6 – Obligations des parties</h3>
            <p>Les obligations de Tracker-invest sont des <em>obligations de moyens</em> (art. 5.72 du Code civil). La responsabilité de Tracker-invest est limitée aux dommages directs, pour un montant maximum équivalent au total effectivement payé par le Client au cours des 6 derniers mois précédant le fait générateur.</p>
            <p>Le Client s'engage à mettre à disposition de Tracker-invest, en temps utile, tous les documents, données et informations nécessaires. Les deux parties sont tenues à la confidentialité des données échangées.</p>
          </section>

          <section>
            <h3>7 – Propriété intellectuelle</h3>
            <p>Tracker-invest conserve tous les droits de propriété intellectuelle relatifs à ses créations, même réalisées dans le cadre du contrat. Sauf accord écrit contraire, le Client ne bénéficie que d'une licence d'utilisation interne.</p>
          </section>

          <section>
            <h3>8 – Prix et modalités de paiement</h3>
            <p>Les prix sont libellés en euros et comprennent un accès à la plateforme, sauf stipulation contraire. Ils ne comprennent pas la période d'essai de 5 jours.</p>
            <table className="legal-table">
              <thead>
                <tr>
                  <th>Formule</th>
                  <th>Mensuel</th>
                  <th>Annuel</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Accès Trading Elite + Mindset</td>
                  <td>12,50 €/mois</td>
                  <td>125 €/an</td>
                </tr>
                <tr>
                  <td>Accès Elite Invest + Mindset</td>
                  <td>12,50 €/mois</td>
                  <td>125 €/an</td>
                </tr>
                <tr>
                  <td>Accès complet au site</td>
                  <td>20 €/mois</td>
                  <td>200 €/an</td>
                </tr>
              </tbody>
            </table>
            <p>Tout retard de paiement entraîne la suspension de l'accès à la plateforme. Pour les professionnels : intérêt au taux légal + 2 pts et indemnité forfaitaire de 15 % (minimum 50 €). Pour les consommateurs : intérêt au taux légal + 2 pts et indemnité forfaitaire selon le barème légal.</p>
          </section>

          <section>
            <h3>9 – Théorie de l'imprévision</h3>
            <p>Conformément à l'article 5.74 du Code civil, si une partie souhaite demander la renégociation du contrat à la suite d'un changement de circonstances, la période de négociation sera limitée à 8 jours calendrier.</p>
          </section>

          <section>
            <h3>10 – Modifications</h3>
            <p>Le Prestataire se réserve le droit de modifier les présentes conditions générales. Les conditions modifiées seront communiquées au Client et, à défaut de contestation dans les 10 jours francs, applicables le premier jour du mois suivant leur envoi.</p>
          </section>

          <section>
            <h3>11 – Données à caractère personnel</h3>
            <p>Le Client est informé que des données personnelles le concernant sont traitées à des fins comptables et de gestion du contrat. Ces données incluent : nom, adresse de facturation, 4 derniers chiffres de la carte bancaire, historique des paiements, email, date de connexion, adresse IP.</p>
            <p>Les données sont conservées pendant toute la durée du contrat ainsi que pendant 10 ans conformément aux obligations légales de Stripe. Le responsable du traitement est <strong>Gieraerts Jonathan</strong>. Pour exercer vos droits (accès, rectification, effacement, opposition, portabilité) : <a href="mailto:tracker-invest@proton.me">tracker-invest@proton.me</a>.</p>
            <p>En cas de litige : <a href="https://www.autoriteprotectiondonnees.be" target="_blank" rel="noopener noreferrer">Autorité de protection des données</a>, Rue de la Presse 35, 1000 Bruxelles.</p>
          </section>

          <section>
            <h3>12 – Incessibilité</h3>
            <p>Les contrats et droits qui en découlent sont incessibles sans l'accord exprès préalable et écrit de l'autre partie.</p>
          </section>

          <section>
            <h3>13 – Clause salvatrice</h3>
            <p>L'invalidité d'une clause n'entraîne pas la nullité des autres dispositions.</p>
          </section>

          <section>
            <h3>14 – Litiges</h3>
            <p>Les parties s'engagent à tenter de résoudre tout litige par voie de médiation ou conciliation (délai maximal : 30 jours francs). En cas d'échec, sont seuls compétents les tribunaux dont dépend le siège social de Tracker-invest. Le droit applicable est le droit belge, en langue française.</p>
          </section>
        </div>

        <div className="legal-footer-nav">
          <Link href="/mentions-legales">Mentions légales</Link>
          <Link href="/privacy">Politique de confidentialité</Link>
        </div>
      </div>
    </main>
  );
}
