# Mindset Invest

Structure Next.js prête pour un SaaS à abonnements.

## Pages publiques
- `/`
- `/pricing`
- `/features`
- `/faq`
- `/login`
- `/terms`
- `/privacy`

## App privée
- `/dashboard`
- `/mindset`
- `/tracker`
- `/invest`
- `/portfolio`

## Environnement
Copie `.env.example` vers `.env.local` puis renseigne Supabase et Stripe.

## Vérification
- `GET /api/health`
- `npm run build`

## Déploiement
Voir `DEPLOYMENT.md` pour la checklist locale, Stripe CLI et mise en prod.

## Abonnements
La page `/pricing` lance Stripe Checkout via `/api/stripe/checkout`.

## Lancer
```bash
npm install
npm run dev
```
