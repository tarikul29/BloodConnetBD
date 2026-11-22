import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { isRateLimited } from '@/lib/rateLimit';
import { setupWebPush, sendToSubs, type PushSub } from '@/lib/push';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// লগইন করা ডোনারের নিজের ফোনে একটি টেস্ট নোটিফিকেশন পাঠায়
export async function POST(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (!token) return NextResponse.json({ ok: false, error: 'auth' }, { status: 401 });

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const { data: u } = await supabase.auth.getUser(token);
  const uid = u?.user?.id;
  if (!uid) return NextResponse.json({ ok: false, error: 'auth' }, { status: 401 });

  if (isRateLimited(`pt:${uid}`, 5, 10 * 60 * 1000)) {
    return NextResponse.json({ ok: false, error: 'rate' }, { status: 429 });
  }

  const setup = setupWebPush();
  if (!setup.ok) return NextResponse.json({ ok: false, error: 'server_setup', reason: setup.reason }, { status: 500 });

  const { data: subs } = await supabase.from('push_subscriptions').select('id, endpoint, p256dh, auth').eq('user_id', uid);
  const list = (subs ?? []) as PushSub[];
  if (list.length === 0) return NextResponse.json({ ok: false, error: 'no_subscription' }, { status: 404 });

  const report = await sendToSubs(supabase, list, () => ({
    title: 'টেস্ট নোটিফিকেশন ✅',
    body: 'দারুণ! জরুরি রক্তের অনুরোধ এলে এভাবেই এই ফোনে জানানো হবে।',
    url: '/dashboard',
    tag: 'push-test',
  }));

  return NextResponse.json({ ok: report.sent > 0, ...report });
}