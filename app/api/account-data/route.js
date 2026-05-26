import { NextResponse } from 'next/server';
import { createSupabaseRouteClient } from '@/lib/supabase/server';

const STORAGE_KEY_PATTERN = /^[a-zA-Z0-9_\-]{1,100}$/;

function isValidStorageKey(key) {
  return typeof key === 'string' && STORAGE_KEY_PATTERN.test(key);
}

export async function GET(request) {
  try {
    const storageKey = new URL(request.url).searchParams.get('storageKey');
    if (!storageKey || !isValidStorageKey(storageKey)) {
      return NextResponse.json({ ok: false, error: 'storageKey invalide.' }, { status: 400 });
    }

    const response = NextResponse.json({ ok: false });
    const supabase = createSupabaseRouteClient(request, response);
    const { data: authData, error: authError } = await supabase.auth.getUser();

    if (authError || !authData?.user) {
      return NextResponse.json({ ok: false, error: 'Non authentifié.' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('user_app_data')
      .select('payload')
      .eq('user_id', authData.user.id)
      .eq('storage_key', storageKey)
      .maybeSingle();

    if (error) {
      console.error('[account-data GET] DB error:', error);
      return NextResponse.json({ ok: false, error: 'Erreur serveur.' }, { status: 500 });
    }

    return NextResponse.json({ ok: true, payload: data?.payload || '' }, { headers: response.headers });
  } catch (error) {
    console.error('[account-data GET] Unexpected error:', error);
    return NextResponse.json({ ok: false, error: 'Erreur serveur.' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const storageKey = String(body.storageKey || '').trim();
    const payload = String(body.payload || '');

    if (!storageKey || !isValidStorageKey(storageKey)) {
      return NextResponse.json({ ok: false, error: 'storageKey invalide.' }, { status: 400 });
    }

    const response = NextResponse.json({ ok: false });
    const supabase = createSupabaseRouteClient(request, response);
    const { data: authData, error: authError } = await supabase.auth.getUser();

    if (authError || !authData?.user) {
      return NextResponse.json({ ok: false, error: 'Non authentifié.' }, { status: 401 });
    }

    const { error } = await supabase.from('user_app_data').upsert(
      {
        user_id: authData.user.id,
        storage_key: storageKey,
        payload,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,storage_key' }
    );

    if (error) {
      console.error('[account-data POST] DB error:', error);
      return NextResponse.json({ ok: false, error: 'Erreur serveur.' }, { status: 500 });
    }

    return NextResponse.json({ ok: true }, { headers: response.headers });
  } catch (error) {
    console.error('[account-data POST] Unexpected error:', error);
    return NextResponse.json({ ok: false, error: 'Erreur serveur.' }, { status: 500 });
  }
}
