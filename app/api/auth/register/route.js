import { NextResponse } from 'next/server';
import { createSupabaseRouteClient, createServiceClient } from '@/lib/supabase/server';
import { checkRateLimit, getClientIp } from '@/lib/ratelimit';

export async function POST(request) {
  try {
    const ip = getClientIp(request);
    const { allowed } = await checkRateLimit('register', ip);
    if (!allowed) {
      return NextResponse.json({ ok: false, error: 'Trop de tentatives. Réessaie dans 1 minute.' }, { status: 429 });
    }

    const body = await request.json().catch(() => ({}));
    const email = String(body.email || '').trim().toLowerCase();
    const password = String(body.password || '');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email) || password.length < 8) {
      return NextResponse.json({ ok: false, error: 'E-mail invalide ou mot de passe trop court.' }, { status: 400 });
    }

    const response = NextResponse.json({ ok: true });
    const supabase = createSupabaseRouteClient(request, response);
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${siteUrl}/confirmed` },
    });

    if (error) {
      return NextResponse.json({ ok: false, error: 'Inscription impossible. Cet email est peut-être déjà utilisé.' }, { status: 400 });
    }

    if (data.user) {
      try {
        const admin = createServiceClient();
        await admin.from('user_subscriptions').upsert({
          user_id: data.user.id,
          plan_code: 'starter',
          billing_cycle: 'monthly',
          status: 'inactive',
          updated_at: new Date().toISOString(),
        });
      } catch (subscriptionError) {
        console.error('Subscription bootstrap failed:', subscriptionError?.message);
      }
    }

    if (!data.session) {
      return NextResponse.json({
        ok: true,
        needsConfirmation: true,
        message: 'Compte créé. Vérifie ta boîte mail pour confirmer ton adresse.',
      });
    }

    return NextResponse.json({ ok: true, redirectTo: '/dashboard' }, { headers: response.headers });
  } catch (error) {
    console.error('[auth/register] Unexpected error:', error?.message);
    return NextResponse.json({ ok: false, error: 'Erreur serveur.' }, { status: 500 });
  }
}
