import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="section container">
      <h1 className="page-title">Page introuvable</h1>
      <p className="page-subtitle">Le lien demandé n’existe pas.</p>
      <Link className="btn btn-gold" href="/">Retour à l’accueil</Link>
    </main>
  );
}
