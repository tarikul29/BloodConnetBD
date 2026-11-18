import type { SupabaseClient } from '@supabase/supabase-js';
import webpush from 'web-push';
import { haversineDistance } from '@/lib/geo';
import { checkDonorEligibility } from '@/lib/eligibility';
import { donorGroupsFor } from '@/lib/bloodCompat';

const RADIUS_KM = Number(process.env.NOTIFY_RADIUS_KM || 50); // এই দূরত্বের মধ্যের ডোনাররা নোটিফিকেশন পাবেন
const MAX_RECIPIENTS = 300;

/** নতুন রিকোয়েস্টের জন্য কাছের, মানানসই ও প্রস্তুত ডোনারদের পুশ নোটিফিকেশন পাঠায়। */
export async function notifyDonors(supabase: SupabaseClient, requestId: string): Promise<{ sent: number; donors: number }> {
  const pub = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  if (!pub || !priv) return { sent: 0, donors: 0 };
  webpush.setVapidDetails(process.env.VAPID_SUBJECT || 'mailto:admin@bloodconnect.bd', pub, priv);

  // একটি রিকোয়েস্টের জন্য একবারই: notified_at ফাঁকা থাকলেই দাবি করা যাবে
  const { data: claimed, error: claimErr } = await supabase
    .from('blood_requests')
    .update({ notified_at: new Date().toISOString() })
    .eq('id', requestId)
    .is('notified_at', null)
    .in('urgency_status', ['critical', 'urgent', 'moderate'])
    .select('id, blood_group, hospital_name, bags_needed, latitude, longitude, urgency_status');
  if (claimErr || !claimed || claimed.length === 0) return { sent: 0, donors: 0 };
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

  if (targets.length === 0) return { sent: 0, donors: 0 };

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
  return { sent, donors: targets.length };
}