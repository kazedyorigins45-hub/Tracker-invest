import Link from 'next/link';

export const metadata = {
  title: 'Politique de confidentialité – Tracker Invest',
};

export default function PrivacyPage() {
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
        <h1 className="home-title">Politique de confidentialité</h1>
        <p className="tagline">Dernière mise à jour le 18 mai 2026</p>

        <div className="legal-content">
          <section>
            <h2>Préambule</h2>
            <p>La présente politique a pour objet d'expliquer en toute transparence aux personnes concernées la manière dont leurs données sont traitées ainsi que de les informer quant aux mesures prises pour en préserver la confidentialité et la sécurité.</p>
            <p>Nous vous informons que cette politique peut être modifiée à tout moment. Il est ainsi conseillé de la consulter régulièrement.</p>
          </section>

          <section>
            <h2>1. Le responsable du traitement</h2>
            <p>Le responsable du traitement des données collectées et traitées est <strong>Jonathan Gieraerts</strong>, établi à Clos du Renard 4, 5377 Somme-Leuze.</p>
            <p><strong>Numéro de BCE :</strong> 1037.713.522</p>
            <p>Vous pouvez contacter notre référent à la protection des données en lui envoyant un e-mail à <a href="mailto:tracker-invest@proton.me">tracker-invest@proton.me</a>.</p>
          </section>

          <section>
            <h2>2. Quelles sont les données que nous traitons ?</h2>
            <p>Seules les données adéquates, pertinentes et limitées à la finalité du traitement peuvent être traitées.</p>
            <table className="legal-table">
              <thead>
                <tr>
                  <th>Finalité</th>
                  <th>Données collectées</th>
                  <th>Modalités de collecte</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Gestion des clients (contrats, factures, comptes)</td>
                  <td>Nom, prénom, adresse postale, adresse email, mot de passe (haché via Supabase), adresse IP</td>
                  <td>Collectées directement via les formulaires d'inscription et de profil sur le site</td>
                </tr>
                <tr>
                  <td>Gestion des paiements</td>
                  <td>Informations de carte bancaire (traitées par Stripe), historique des transactions, statut de l'abonnement</td>
                  <td>Collectées via l'interface sécurisée de notre prestataire Stripe</td>
                </tr>
                <tr>
                  <td>Support client</td>
                  <td>Historique des échanges, adresse email</td>
                  <td>Collectées via l'envoi d'emails ou formulaire de contact</td>
                </tr>
              </tbody>
            </table>
          </section>

          <section>
            <h2>3. Comment justifions-nous vos traitements ?</h2>
            <table className="legal-table">
              <thead>
                <tr>
                  <th>Finalité d'utilisation</th>
                  <th>Fondement juridique</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Gestion des clients et des comptes clients</td>
                  <td>Exécution d'un contrat conclu avec vous (Art. 6.1.b RGPD)</td>
                </tr>
                <tr>
                  <td>Traitement des paiements via Stripe</td>
                  <td>Exécution d'un contrat conclu avec vous (Art. 6.1.b RGPD)</td>
                </tr>
                <tr>
                  <td>Conservation des factures</td>
                  <td>Obligation légale comptable (Art. 6.1.c RGPD)</td>
                </tr>
              </tbody>
            </table>
          </section>

          <section>
            <h2>4. Durée de conservation</h2>
            <table className="legal-table">
              <thead>
                <tr>
                  <th>Finalité</th>
                  <th>Délai de conservation</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Données du compte utilisateur</td>
                  <td>Jusqu'à la suppression du compte par l'utilisateur ou après 2 ans d'inactivité</td>
                </tr>
                <tr>
                  <td>Données de facturation</td>
                  <td>10 ans à partir de la date de la facture (obligation légale belge)</td>
                </tr>
                <tr>
                  <td>Données de navigation (IP, logs)</td>
                  <td>12 mois maximum (sécurité technique)</td>
                </tr>
              </tbody>
            </table>
          </section>

          <section>
            <h2>5. Communication des données</h2>
            <p>Nous partageons vos données dans le cadre de nos activités avec notre personnel ou avec nos fournisseurs ou sous-traitants dûment habilités (comptable, fournisseur de services de courriels, etc.).</p>
            <p>Nous communiquons vos données aux autorités de contrôle, tribunaux et organismes gouvernementaux lorsqu'une obligation légale, la réglementation ou une procédure judiciaire nous l'impose.</p>
            <p>Pour toute question : <a href="mailto:tracker-invest@proton.me">tracker-invest@proton.me</a></p>
          </section>

          <section>
            <h2>6. Transfert de données</h2>
            <p>Certaines de vos données sont transférées au sein de l'Union européenne (Supabase – région Francfort, Allemagne). Nous ne procédons pas à des transferts hors de l'Union européenne sans garanties appropriées conformes au RGPD.</p>
          </section>

          <section>
            <h2>7. Vos droits</h2>
            <p>Conformément au règlement 2016/679 (RGPD) et à la loi belge du 30 juillet 2018, vous disposez des droits suivants :</p>
            <ul>
              <li>Droit d'accès à vos données collectées</li>
              <li>Droit d'obtenir une copie des données traitées</li>
              <li>Droit de rectification en cas d'erreur</li>
              <li>Droit à l'effacement (droit à l'oubli)</li>
              <li>Droit à la limitation du traitement</li>
              <li>Droit d'opposition au traitement</li>
              <li>Droit à la portabilité de vos données</li>
            </ul>
            <p>Pour exercer ces droits : <a href="mailto:tracker-invest@proton.me">tracker-invest@proton.me</a></p>
          </section>

          <section>
            <h2>8. Dépôt d'une plainte</h2>
            <p>Vous pouvez déposer une plainte auprès de l'Autorité de protection des données :</p>
            <address>
              Autorité de protection des données<br />
              Rue de la Presse, 35 – 1000 Bruxelles<br />
              Tél. : +32 (0)2 274 48 00<br />
              Email : <a href="mailto:contact@apd-gba.be">contact@apd-gba.be</a><br />
              <a href="https://www.autoriteprotectiondonnees.be" target="_blank" rel="noopener noreferrer">www.autoriteprotectiondonnees.be</a>
            </address>
          </section>

          <section>
            <h2>9. Sécurité des données</h2>
            <p>Nous mettons en place les mesures techniques et organisationnelles adéquates pour protéger vos données contre toute modification, perte accidentelle, ou accès non autorisé, conformément aux principes de <em>privacy by design</em> et <em>privacy by default</em>.</p>
          </section>

          <section>
            <h2>10. Cookies</h2>
            <p>Nous utilisons des cookies sur notre site internet à des fins d'identification et statistiques. Aucun cookie n'enregistre de données personnelles permettant de vous contacter directement. Vous pouvez modifier les réglages de votre navigateur pour les désactiver.</p>
          </section>

          <section>
            <h2>11. Droit applicable et juridiction</h2>
            <p>La présente politique est régie par le droit belge. Tout litige sera soumis à la compétence exclusive des tribunaux de l'arrondissement judiciaire de Dinant.</p>
          </section>

          <section className="legal-gdpr-box">
            <h2>Clause GDPR</h2>
            <p>Les données à caractère personnel communiquées par le client sont gérées par le responsable de traitement : <strong>Gieraerts Jonathan</strong> – <a href="mailto:tracker-invest@proton.me">tracker-invest@proton.me</a>.</p>
            <p>Les données collectées sont : nom, prénom, adresse email, adresse postale, adresse IP, ainsi que les données relatives aux transactions bancaires (traitées de manière sécurisée par Stripe).</p>
            <p>Ces données seront conservées pendant une durée de 5 ans. Une fois arrivées au terme du délai, les données comptables et/ou légales sont archivées et les autres données sont effacées.</p>
            <p>Le client dispose des droits d'accès, de rectification, d'effacement, de limitation, d'opposition et de portabilité de ses données, à exercer à l'adresse <a href="mailto:tracker-invest@proton.me">tracker-invest@proton.me</a>.</p>
          </section>
        </div>

        <div className="legal-footer-nav">
          <Link href="/mentions-legales">Mentions légales</Link>
          <Link href="/terms">CGU & Conditions de service</Link>
        </div>
      </div>
    </main>
  );
}
