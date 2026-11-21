import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { isRateLimited } from '@/lib/rateLimit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// "কল করুন" চাপলে একজন ডোনারের নম্বর দেয়। একসাথে সব নম্বর নামানো ঠেকাতে সীমা আছে।
export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';

  if (isRateLimited(`ph:${ip}`, 20, 10 * 60 * 1000)) {
    return NextResponse.json({ ok: false, error: 'rate' }, { status: 429 });
  }

  let id = '';
  try {
    const b = await req.json();
    id = typeof b?.id === 'string' ? b.id : '';
  } catch {
    return NextResponse.json({ ok: false, error: 'bad' }, { status: 400 });
  }
  if (!UUID.test(id)) return NextResponse.json({ ok: false, error: 'bad' }, { status: 400 });

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const { data, error } = await supabase.from('donors').select('phone').eq('id', id).maybeSingle();
  if (error || !data?.phone) return NextResponse.json({ ok: false, error: 'notfound' }, { status: 404 });

  return NextResponse.json({ ok: true, phone: data.phone }, { headers: { 'Cache-Control': 'no-store' } });
}