import { NextResponse } from 'next/server';
import { createSupabaseRouteClient, createServiceClient } from '@/lib/supabase/server';
import { checkRateLimit, getClientIp } from '@/lib/ratelimit';

export async function POST(request) {
  try {
    const ip = getClientIp(request);
    const { allowed } = await checkRateLimit('login', ip);
    if (!allowed) {
      return NextResponse.json({ ok: false, error: 'Trop de tentatives. Réessaie dans 1 minute.' }, { status: 429 });
    }

    const body = await request.json().catch(() => ({}));
    const email = String(body.email || '').trim().toLowerCase();
    const password = String(body.password || '');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email) || password.length < 8) {
      return NextResponse.json({ ok: false, error: 'Identifiants invalides.' }, { status: 400 });
    }

    const response = NextResponse.json({ ok: true });
    const supabase = createSupabaseRouteClient(request, response);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error || !data.user) {
      return NextResponse.json({ ok: false, error: 'Email ou mot de passe incorrect.' }, { status: 400 });
    }

    try {
      const admin = createServiceClient();
      const { data: existingSubscription } = await admin
        .from('user_subscriptions')
        .select('user_id')
        .eq('user_id', data.user.id)
        .maybeSingle();

      if (!existingSubscription) {
        await admin.from('user_subscriptions').insert({
          user_id: data.user.id,
          plan_code: 'starter',
          billing_cycle: 'monthly',
          status: 'inactive',
          updated_at: new Date().toISOString(),
        });
      }
    } catch (subscriptionError) {
      console.error('Subscription bootstrap failed:', subscriptionError?.message);
    }

    return response;
  } catch (error) {
    console.error('[auth/login] Unexpected error:', error?.message);
    return NextResponse.json({ ok: false, error: 'Erreur serveur.' }, { status: 500 });
  }
}
