import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { timingSafeEqual } from 'crypto';
import { isRateLimited } from '@/lib/rateLimit';
import { GALLERY_BUCKET, purgeExpiredGallery } from '@/lib/galleryCleanup';

export const dynamic = 'force-dynamic';

const GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const MAX_FILE_BYTES = 800 * 1024; // ব্রাউজারে ছোট করার পরও এর বেশি হলে নেব না
const MAX_ACTIVE = 40; // একসাথে সর্বোচ্চ কয়টা ছবি থাকবে (স্টোরেজ বাঁচাতে)

function safeEqual(a: string, b: string) {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) return false;
  return timingSafeEqual(ba, bb);
}

function getIp(req: NextRequest) {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
}

// ভুল পাসওয়ার্ডের সীমা: একই আইপি থেকে ১০ মিনিটে ৮ বার ভুল হলে ১০ মিনিট বন্ধ
const fails = new Map<string, { count: number; resetAt: number }>();
const FAIL_WINDOW = 10 * 60 * 1000;
const MAX_FAILS = 8;

type AuthResult = 'ok' | 'bad' | 'blocked';

function checkAuth(ip: string, password: unknown): AuthResult {
  const now = Date.now();
  const rec = fails.get(ip);
  if (rec && rec.resetAt > now && rec.count >= MAX_FAILS) return 'blocked';
  const expected = process.env.ADMIN_PASSWORD;
  if (expected && typeof password === 'string' && safeEqual(password, expected)) {
    fails.delete(ip);
    return 'ok';
  }
  const cur = rec && rec.resetAt > now ? rec : { count: 0, resetAt: now + FAIL_WINDOW };
  cur.count += 1;
  fails.set(ip, cur);
  return 'bad';
}

function denied(r: AuthResult) {
  return r === 'blocked'
    ? NextResponse.json({ error: 'Too many attempts. Try again later.' }, { status: 429 })
    : NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

export async function POST(req: NextRequest) {
  if (isRateLimited(`gallery:${getIp(req)}`, 40, 10 * 60 * 1000)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const contentType = req.headers.get('content-type') || '';

  // ---------- ছবি আপলোড (multipart) ----------
  if (contentType.includes('multipart/form-data')) {
    let form: FormData;
    try {
      form = await req.formData();
    } catch {
      return NextResponse.json({ error: 'Bad request' }, { status: 400 });
    }
    const auth = checkAuth(getIp(req), form.get('password'));
    if (auth !== 'ok') return denied(auth);

    const file = form.get('file');
    const donorName = String(form.get('donor_name') ?? '').trim();
    const bloodGroup = String(form.get('blood_group') ?? '').trim();
    const caption = String(form.get('caption') ?? '').trim();

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'ছবি দিন' }, { status: 400 });
    }
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      return NextResponse.json({ error: 'শুধু JPG, PNG বা WEBP ছবি চলবে' }, { status: 400 });
    }
    if (file.size > MAX_FILE_BYTES) {
      return NextResponse.json({ error: 'ছবির সাইজ অনেক বড়' }, { status: 400 });
    }
    if (donorName.length < 1 || donorName.length > 80) {
      return NextResponse.json({ error: 'নাম দিন (সর্বোচ্চ ৮০ অক্ষর)' }, { status: 400 });
    }
    if (bloodGroup && !GROUPS.includes(bloodGroup)) {
      return NextResponse.json({ error: 'ব্লাড গ্রুপ ঠিক নয়' }, { status: 400 });
    }
    if (caption.length > 150) {
      return NextResponse.json({ error: 'লেখা ১৫০ অক্ষরের বেশি হবে না' }, { status: 400 });
    }

    await purgeExpiredGallery(supabase).catch(() => 0);
    const { count } = await supabase
      .from('donation_gallery')
      .select('id', { count: 'exact', head: true });
    if ((count ?? 0) >= MAX_ACTIVE) {
      return NextResponse.json(
        { error: `একসাথে সর্বোচ্চ ${MAX_ACTIVE}টা ছবি রাখা যায়। পুরোনো কিছু মুছে দিন।` },
        { status: 400 }
      );
    }

    const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg';
    const path = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const up = await supabase.storage
      .from(GALLERY_BUCKET)
      .upload(path, buffer, { contentType: file.type, upsert: false });
    if (up.error) {
      return NextResponse.json({ error: 'আপলোড হয়নি: ' + up.error.message }, { status: 500 });
    }

    const { data: pub } = supabase.storage.from(GALLERY_BUCKET).getPublicUrl(path);
    const ins = await supabase
      .from('donation_gallery')
      .insert({
        image_url: pub.publicUrl,
        storage_path: path,
        donor_name: donorName,
        blood_group: bloodGroup || null,
        caption: caption || null,
      })
      .select('id, image_url, donor_name, blood_group, caption, created_at, expires_at')
      .single();

    if (ins.error) {
      await supabase.storage.from(GALLERY_BUCKET).remove([path]);
      return NextResponse.json({ error: ins.error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true, item: ins.data });
  }

  // ---------- তালিকা / মোছা (JSON) ----------
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  }
  const auth = checkAuth(getIp(req), body?.password);
  if (auth !== 'ok') return denied(auth);

  if (body.action === 'list') {
    await purgeExpiredGallery(supabase).catch(() => 0);
    const { data, error } = await supabase
      .from('donation_gallery')
      .select('id, image_url, donor_name, blood_group, caption, created_at, expires_at')
      .order('created_at', { ascending: false });
    if (error) return NextResponse.json({ error: 'Failed to load' }, { status: 500 });
    return NextResponse.json({ items: data ?? [] });
  }

  if (body.action === 'delete') {
    if (!body.id || typeof body.id !== 'string') {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }
    const { data: row } = await supabase
      .from('donation_gallery')
      .select('storage_path')
      .eq('id', body.id)
      .maybeSingle();
    if (row?.storage_path) {
      await supabase.storage.from(GALLERY_BUCKET).remove([row.storage_path]);
    }
    const { error } = await supabase.from('donation_gallery').delete().eq('id', body.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}