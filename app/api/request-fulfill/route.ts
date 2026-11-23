import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createHash, timingSafeEqual } from 'crypto';
import { isRateLimited } from '@/lib/rateLimit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (isRateLimited(`rf:${ip}`, 20, 10 * 60 * 1000)) {
    return NextResponse.json({ ok: false, error: 'rate' }, { status: 429 });
  }

  let b: { id?: unknown; token?: unknown };
  try {
    b = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'bad' }, { status: 400 });
  }
  const id = typeof b.id === 'string' ? b.id : '';
  const token = typeof b.token === 'string' ? b.token : '';
  if (!UUID.test(id) || token.length < 20 || token.length > 200) {
    return NextResponse.json({ ok: false, error: 'invalid' }, { status: 400 });
  }

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const { data } = await supabase.from('blood_requests').select('manage_token_hash').eq('id', id).maybeSingle();

  const stored = data?.manage_token_hash as string | null | undefined;
  const given = createHash('sha256').update(token).digest('hex');
  const ok = !!stored && stored.length === given.length && timingSafeEqual(Buffer.from(stored), Buffer.from(given));
  if (!ok) {
    return NextResponse.json({ ok: false, error: 'forbidden' }, { status: 403 });
  }

  const { error } = await supabase.from('blood_requests').update({ urgency_status: 'fulfilled' }).eq('id', id);
  if (error) return NextResponse.json({ ok: false, error: 'db' }, { status: 500 });
  return NextResponse.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } });
}