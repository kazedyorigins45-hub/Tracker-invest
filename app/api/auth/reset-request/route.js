import { NextResponse } from 'next/server';
import { createSupabaseRouteClient } from '@/lib/supabase/server';

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const email = String(body.email || '').trim().toLowerCase();

    if (!email.includes('@')) {
      return NextResponse.json({ ok: false, error: 'E-mail invalide.' }, { status: 400 });
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const response = NextResponse.json({ ok: true });
    const supabase = createSupabaseRouteClient(request, response);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${siteUrl}/reset-password`,
    });

    if (error) {
      return NextResponse.json({ ok: false, error: 'Trop de tentatives. Attends quelques minutes avant de réessayer.' }, { status: 429 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ ok: false, error: 'Erreur serveur.' }, { status: 500 });
  }
}
