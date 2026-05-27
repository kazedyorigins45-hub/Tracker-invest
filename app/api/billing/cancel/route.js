import Stripe from 'stripe';
import { NextResponse } from 'next/server';
import { createServiceClient, createSupabaseRouteClient } from '@/lib/supabase/server';
import { checkRateLimit, getClientIp } from '@/lib/ratelimit';

const stripeSecret = process.env.STRIPE_SECRET_KEY;

function getStripe() {
  if (!stripeSecret) return null;
  return new Stripe(stripeSecret);
}

export async function POST(request) {
  try {
    const ip = getClientIp(request);
    const { allowed } = await checkRateLimit('billing', ip);
    if (!allowed) {
      return NextResponse.json({ ok: false, error: 'Trop de tentatives. Réessaie dans 1 minute.' }, { status: 429 });
    }

    const response = NextResponse.json({ ok: false });
    const supabase = createSupabaseRouteClient(request, response);
    const { data: authData, error: authError } = await supabase.auth.getUser();

    if (authError || !authData?.user) {
      return NextResponse.json({ ok: false, error: 'Non authentifié.' }, { status: 401 });
    }

    const admin = createServiceClient();
    const { data: subscription } = await admin.from('user_subscriptions').select('*').eq('user_id', authData.user.id).maybeSingle();
    if (!subscription) return NextResponse.json({ ok: false, error: 'Abonnement introuvable.' }, { status: 404 });

    if (!subscription.stripe_subscription_id || !['active', 'trialing'].includes(subscription.status)) {
      return NextResponse.json({ ok: false, error: 'Aucun abonnement actif à annuler.' }, { status: 400 });
    }

    const stripe = getStripe();
    if (!stripe) {
      return NextResponse.json({ ok: false, error: 'Stripe non configuré.' }, { status: 500 });
    }

    await stripe.subscriptions.update(subscription.stripe_subscription_id, { cancel_at_period_end: true });
    // DB will be updated by the customer.subscription.updated webhook — no direct write here.

    return NextResponse.json({ ok: true }, { headers: response.headers });
  } catch (error) {
    console.error('[billing/cancel] Unexpected error:', error);
    return NextResponse.json({ ok: false, error: 'Erreur serveur.' }, { status: 500 });
  }
}
