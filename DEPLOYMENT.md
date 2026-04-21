# Deployment & test checklist

## 1) Local setup
1. Copy `.env.example` to `.env.local`.
2. Fill in Supabase + Stripe env vars.
3. Run:
   ```bash
   npm install
   npm run dev
   ```

## 2) Local verification
- Open `http://localhost:3000/health` in the browser
- Check API health: `http://localhost:3000/api/health`
- Test signup/login
- Check that subscription data is saved in Supabase
- Verify starter/trader/investor access gates

## 3) Stripe local testing
1. Install Stripe CLI.
2. Forward webhooks:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```
3. Use the webhook secret provided by Stripe CLI in `.env.local`.
4. Trigger checkout and confirm webhook updates in Supabase.
5. Ensure `pricing_plans` contains `stripe_price_monthly_id` and `stripe_price_yearly_id` for each plan.

## 4) Production deployment
Recommended hosts:
- Vercel
- Netlify

Set production env vars:
- `NEXT_PUBLIC_SITE_URL=https://your-domain.com`
- `NEXT_PUBLIC_SUPABASE_URL=...`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY=...`
- `SUPABASE_SERVICE_ROLE_KEY=...`
- `STRIPE_PUBLISHABLE_KEY=...`
- `STRIPE_SECRET_KEY=...`
- `STRIPE_WEBHOOK_SECRET=...`

## 5) Production Stripe webhook
Configure Stripe webhook URL to:
`https://your-domain.com/api/stripe/webhook`

## 6) Pre-launch checks
- `npm run build`
- confirm `/api/health`
- confirm emails use the right sender name
- confirm RLS policies
- confirm billing cycles monthly/yearly
