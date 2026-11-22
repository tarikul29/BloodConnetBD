import type { SupabaseClient } from '@supabase/supabase-js';
import webpush from 'web-push';
import { SITE_URL } from '@/lib/site';

export type PushSub = { id: string; endpoint: string; p256dh: string; auth: string };

export type PushReport = {
  sent: number;
  dead: number;
  failed: { status: number | string; msg: string }[];
};

/** VAPID_SUBJECT ভুল ফরম্যাটে থাকলেও (যেমন mailto: ছাড়া ইমেইল) যেন ভেঙে না যায় */
function vapidSubject() {
  const s = (process.env.VAPID_SUBJECT || '').trim();
  if (/^(mailto:|https?:\/\/)/i.test(s)) return s;
  if (s.includes('@')) return `mailto:${s}`;
  return SITE_URL;
}

/** কী নেই বা ভুল হলে কারণসহ ব্যর্থ হয় (চুপচাপ গিলে ফেলে না) */
export function setupWebPush(): { ok: boolean; reason?: string } {
  const pub = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  if (!pub || !priv) return { ok: false, reason: 'vapid_keys_missing' };
  try {
    webpush.setVapidDetails(vapidSubject(), pub.trim(), priv.trim());
    return { ok: true };
  } catch (e: any) {
    return { ok: false, reason: `vapid_invalid: ${String(e?.message || e).slice(0, 120)}` };
  }
}

/** একসাথে ২০টি করে পাঠায়; মৃত (৪০৪/৪১০) সাবস্ক্রিপশন মুছে দেয়; বাকি ব্যর্থতা রিপোর্টে রাখে */
export async function sendToSubs(
  supabase: SupabaseClient,
  subs: PushSub[],
  payloadFor: (s: PushSub) => object
): Promise<PushReport> {
  const report: PushReport = { sent: 0, dead: 0, failed: [] };
  const dead: string[] = [];

  for (let i = 0; i < subs.length; i += 20) {
    await Promise.all(
      subs.slice(i, i + 20).map(async (s) => {
        try {
          await webpush.sendNotification(
            { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
            JSON.stringify(payloadFor(s)),
            { TTL: 60 * 60 * 6, urgency: 'high' }
          );
          report.sent += 1;
        } catch (err: any) {
          const status = err?.statusCode ?? 'err';
          if (status === 404 || status === 410) dead.push(s.id);
          else report.failed.push({ status, msg: String(err?.body || err?.message || '').slice(0, 120) });
        }
      })
    );
  }

  if (dead.length) {
    await supabase.from('push_subscriptions').delete().in('id', dead);
    report.dead = dead.length;
  }
  if (report.failed.length) console.error('[push] send failures', JSON.stringify(report.failed.slice(0, 5)));
  return report;
}