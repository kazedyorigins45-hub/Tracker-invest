import Stripe from 'stripe';
import { NextResponse } from 'next/server';
import { createServiceClient, createSupabaseRouteClient } from '@/lib/supabase/server';

const stripeSecret = process.env.STRIPE_SECRET_KEY;

function getStripe() {
  if (!stripeSecret) return null;
  return new Stripe(stripeSecret);
}

export async function POST(request) {
  try {
    const response = NextResponse.json({ ok: false });
    const supabase = createSupabaseRouteClient(request, response);
    const { data: authData, error: authError } = await supabase.auth.getUser();

    if (authError || !authData?.user) {
      return NextResponse.json({ ok: false, error: 'Non authentifié.' }, { status: 401 });
    }

    const admin = createServiceClient();
    const { data: subscription } = await admin.from('user_subscriptions').select('*').eq('user_id', authData.user.id).maybeSingle();
    if (!subscription) return NextResponse.json({ ok: false, error: 'Abonnement introuvable.' }, { status: 404 });

    const stripe = getStripe();
    if (stripe && subscription.stripe_subscription_id) {
      await stripe.subscriptions.update(subscription.stripe_subscription_id, { cancel_at_period_end: true });
    }

    await admin.from('user_subscriptions').update({ cancel_at_period_end: true, status: 'active', updated_at: new Date().toISOString() }).eq('user_id', authData.user.id);

    return NextResponse.json({ ok: true }, { headers: response.headers });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error?.message || 'Erreur serveur.' }, { status: 500 });
  }
}
