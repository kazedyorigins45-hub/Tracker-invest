import { NextResponse } from 'next/server';
import { createSupabaseRouteClient, createServiceClient } from '@/lib/supabase/server';

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const email = String(body.email || '').trim().toLowerCase();
    const password = String(body.password || '');

    if (!email.includes('@') || password.length < 8) {
      return NextResponse.json({ ok: false, error: 'E-mail invalide ou mot de passe trop court.' }, { status: 400 });
    }

    const response = NextResponse.json({ ok: true });
    const supabase = createSupabaseRouteClient(request, response);
    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
      return NextResponse.json({ ok: false, error: error.message || 'Inscription impossible.' }, { status: 400 });
    }

    if (data.user) {
      try {
        const admin = createServiceClient();
        await admin.from('user_subscriptions').upsert({
          user_id: data.user.id,
          plan_code: 'starter',
          billing_cycle: 'monthly',
          status: 'active',
          updated_at: new Date().toISOString(),
        });
      } catch (subscriptionError) {
        console.error('Subscription bootstrap failed:', subscriptionError);
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
    return NextResponse.json({ ok: false, error: error?.message || 'Erreur serveur lors de l’inscription.' }, { status: 500 });
  }
}
