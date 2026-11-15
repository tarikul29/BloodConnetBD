import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import webpush from 'web-push';
import { haversineDistance } from '@/lib/geo';
import { checkDonorEligibility } from '@/lib/eligibility';
import { donorGroupsFor } from '@/lib/bloodCompat';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const RADIUS_KM = Number(process.env.NOTIFY_RADIUS_KM || 50); // এই দূরত্বের মধ্যের ডোনাররা নোটিফিকেশন পাবেন
const MAX_RECIPIENTS = 300;
const FRESH_MS = 10 * 60 * 1000; // রিকোয়েস্ট তৈরির ১০ মিনিটের মধ্যেই শুধু নোটিফাই হবে

// স্প্যাম ঠেকাতে: একই আইপি থেকে ১০ মিনিটে ৫ বারের বেশি নয়
const hits = new Map<string, { count: number; resetAt: number }>();
function limited(ip: string) {
  const now = Date.now();
  const r = hits.get(ip);
  if (!r || r.resetAt < now) {
    hits.set(ip, { count: 1, resetAt: now + 10 * 60 * 1000 });
    return false;
  }
  r.count += 1;
  return r.count > 5;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (limited(ip)) return NextResponse.json({ ok: false, error: 'rate' }, { status: 429 });

  let id: unknown;
  try {
    ({ id } = await req.json());
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  if (typeof id !== 'string' || !/^[0-9a-f-]{36}$/i.test(id)) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const pub = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  if (!pub || !priv) {
    return NextResponse.json({ ok: true, sent: 0, skipped: 'push-not-configured' });
  }
  webpush.setVapidDetails(process.env.VAPID_SUBJECT || 'mailto:admin@bloodconnect.bd', pub, priv);

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

  // একটি রিকোয়েস্টের জন্য একবারই: notified_at ফাঁকা থাকলেই দাবি করা যাবে
  const cutoff = new Date(Date.now() - FRESH_MS).toISOString();
  const { data: claimed, error: claimErr } = await supabase
    .from('blood_requests')
    .update({ notified_at: new Date().toISOString() })
    .eq('id', id)
    .is('notified_at', null)
    .gte('created_at', cutoff)
    .in('urgency_status', ['critical', 'urgent', 'moderate'])
    .select('id, blood_group, hospital_name, bags_needed, latitude, longitude, urgency_status');
  if (claimErr || !claimed || claimed.length === 0) {
    return NextResponse.json({ ok: true, sent: 0 });
  }
  const request = claimed[0];

  const { data: donors } = await supabase
    .from('donors')
    .select('id, blood_group, latitude, longitude, last_donation_date')
    .eq('is_available', true)
    .in('blood_group', donorGroupsFor(request.blood_group));

  const targets = (donors ?? [])
    .filter((d) => checkDonorEligibility(d.last_donation_date).isEligible)
    .map((d) => ({
      id: d.id as string,
      km: haversineDistance(
        { latitude: request.latitude, longitude: request.longitude },
        { latitude: d.latitude, longitude: d.longitude }
      ),
    }))
    .filter((d) => Number.isFinite(d.km) && d.km <= RADIUS_KM)
    .sort((a, b) => a.km - b.km)
    .slice(0, MAX_RECIPIENTS);

  if (targets.length === 0) return NextResponse.json({ ok: true, sent: 0, donors: 0 });

  const kmById = new Map(targets.map((t) => [t.id, t.km]));
  const { data: subs } = await supabase
    .from('push_subscriptions')
    .select('id, user_id, endpoint, p256dh, auth')
    .in('user_id', targets.map((t) => t.id));

  const urgent = request.urgency_status === 'critical' ? 'অতি জরুরি' : 'জরুরি';
  let sent = 0;
  const dead: string[] = [];
  const list = subs ?? [];

  for (let i = 0; i < list.length; i += 20) {
    await Promise.all(
      list.slice(i, i + 20).map(async (s) => {
        const km = kmById.get(s.user_id) ?? 0;
        const payload = JSON.stringify({
          title: `${urgent}: ${request.blood_group} রক্ত দরকার`,
          body: `${request.hospital_name} • ${request.bags_needed} ব্যাগ • আপনার থেকে প্রায় ${Math.max(1, Math.round(km))} কিমি`,
          url: '/requests',
          tag: `req-${request.id}`,
        });
        try {
          await webpush.sendNotification(
            { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
            payload,
            { TTL: 60 * 60 * 6, urgency: 'high' }
          );
          sent += 1;
        } catch (err: any) {
          if (err?.statusCode === 404 || err?.statusCode === 410) dead.push(s.id);
        }
      })
    );
  }

  if (dead.length) await supabase.from('push_subscriptions').delete().in('id', dead);

  return NextResponse.json({ ok: true, sent, donors: targets.length });
}