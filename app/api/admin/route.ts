import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { timingSafeEqual } from 'crypto';

// সহজ র‍্যাঙ্ক-লিমিট: একই আইপি থেকে ১০ মিনিটে ৮ বার ভুল পাসওয়ার্ড দিলে ১০ মিনিট বন্ধ
const attempts = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_FAILS = 8;

function getIp(req: NextRequest) {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
}

function safeEqual(a: string, b: string) {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) return false;
  return timingSafeEqual(ba, bb);
}

export async function POST(req: NextRequest) {
  const ip = getIp(req);
  const now = Date.now();
  const rec = attempts.get(ip);
  if (rec && rec.resetAt > now && rec.count >= MAX_FAILS) {
    return NextResponse.json({ error: 'Too many attempts. Try again later.' }, { status: 429 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  }
  const { password, action, id } = body ?? {};

  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || typeof password !== 'string' || !safeEqual(password, expected)) {
    const cur = rec && rec.resetAt > now ? rec : { count: 0, resetAt: now + WINDOW_MS };
    cur.count += 1;
    attempts.set(ip, cur);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  attempts.delete(ip);

  if (action === 'verify') {
    return NextResponse.json({ ok: true });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // অ্যাডমিন পেজের তালিকা (ইমেইলসহ) শুধু পাসওয়ার্ড দিলেই পাওয়া যায়
  if (action === 'list') {
    const [donors, requests] = await Promise.all([
      supabase.from('donors').select('*').order('created_at', { ascending: false }),
      supabase.from('blood_requests').select('*').order('created_at', { ascending: false }),
    ]);
    if (donors.error || requests.error) {
      return NextResponse.json({ error: 'Failed to load' }, { status: 500 });
    }
    return NextResponse.json({ donors: donors.data, requests: requests.data });
  }

  if (!id || typeof id !== 'string') {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }

  if (action === 'set-donor-available') {
    if (typeof body.available !== 'boolean') {
      return NextResponse.json({ error: 'Invalid value' }, { status: 400 });
    }
    const { error } = await supabase.from('donors').update({ is_available: body.available }).eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  if (action === 'set-request-status') {
    const allowed = ['critical', 'urgent', 'moderate', 'fulfilled', 'expired'];
    if (typeof body.status !== 'string' || !allowed.includes(body.status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }
    const { error } = await supabase.from('blood_requests').update({ urgency_status: body.status }).eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  if (action === 'delete-donor') {
    // লগইন একাউন্টটাও মুছে দিচ্ছি, নইলে একই ইমেইলে আবার রেজিস্টার করা যাবে না
    await supabase.auth.admin.deleteUser(id);
    const { error } = await supabase.from('donors').delete().eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  if (action === 'delete-request') {
    const { error } = await supabase.from('blood_requests').delete().eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}