import { NextResponse } from 'next/server';
import { createSupabaseRouteClient, createServiceClient } from '@/lib/supabase/server';

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const email = String(body.email || '').trim().toLowerCase();
    const password = String(body.password || '');

    if (!email.includes('@') || password.length < 8) {
      return NextResponse.json({ ok: false, error: 'Identifiants invalides.' }, { status: 400 });
    }

    const response = NextResponse.json({ ok: true });
    const supabase = createSupabaseRouteClient(request, response);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error || !data.user) {
      return NextResponse.json({ ok: false, error: error?.message || 'Connexion impossible.' }, { status: 400 });
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
          status: 'active',
          updated_at: new Date().toISOString(),
        });
      }
    } catch (subscriptionError) {
      console.error('Subscription bootstrap failed:', subscriptionError);
    }

    return response;
  } catch (error) {
    return NextResponse.json({ ok: false, error: error?.message || 'Erreur serveur lors de la connexion.' }, { status: 500 });
  }
}
