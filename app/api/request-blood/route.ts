import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyTurnstile } from '@/lib/turnstile';
import { isRateLimited } from '@/lib/rateLimit';
import { notifyDonors } from '@/lib/notifyDonors';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const str = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';

  // একই আইপি থেকে ১০ মিনিটে ৫টির বেশি নয়
  if (isRateLimited(`rb:${ip}`, 5, 10 * 60 * 1000)) {
    return NextResponse.json({ ok: false, error: 'rate' }, { status: 429 });
  }

  let b: Record<string, unknown>;
  try {
    b = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'bad' }, { status: 400 });
  }

  // রোবট নয় — যাচাই
  if (!(await verifyTurnstile(b.captchaToken, ip))) {
    return NextResponse.json({ ok: false, error: 'captcha' }, { status: 400 });
  }

  const patient_name = str(b.patient_name, 100);
  const hospital_name = str(b.hospital_name, 200);
  const contact_phone = str(b.contact_phone, 20);
  const patient_notes = str(b.patient_notes, 500) || null;
  const blood_group = str(b.blood_group, 5);
  const bags = Number(b.bags_needed);
  const lat = Number(b.latitude);
  const lng = Number(b.longitude);

  if (
    !patient_name ||
    !hospital_name ||
    !GROUPS.includes(blood_group) ||
    !/^01[3-9]\d{8}$/.test(contact_phone) ||
    !Number.isInteger(bags) ||
    bags < 1 ||
    bags > 20 ||
    !Number.isFinite(lat) ||
    !Number.isFinite(lng) ||
    Math.abs(lat) > 90 ||
    Math.abs(lng) > 180
  ) {
    return NextResponse.json({ ok: false, error: 'invalid' }, { status: 400 });
  }

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

  // একই ফোন নম্বর থেকে ১ ঘণ্টায় ৩টির বেশি রিকোয়েস্ট নয়
  const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count } = await supabase
    .from('blood_requests')
    .select('id', { count: 'exact', head: true })
    .eq('contact_phone', contact_phone)
    .gte('created_at', since);
  if ((count ?? 0) >= 3) {
    return NextResponse.json({ ok: false, error: 'rate' }, { status: 429 });
  }

  const { data, error } = await supabase
    .from('blood_requests')
    .insert({
      patient_name,
      hospital_name,
      blood_group,
      bags_needed: bags,
      latitude: lat,
      longitude: lng,
      contact_phone,
      urgency_status: 'critical',
      patient_notes,
    })
    .select('id')
    .single();

  if (error || !data) {
    return NextResponse.json({ ok: false, error: 'db' }, { status: 500 });
  }

  // কাছের ডোনারদের নোটিফিকেশন (ব্যর্থ হলেও রিকোয়েস্ট জমা থাকবে)
  try {
    await notifyDonors(supabase, data.id);
  } catch (e) {
    console.error('[notify] crashed:', e);
  }

  return NextResponse.json({ ok: true, id: data.id });
}