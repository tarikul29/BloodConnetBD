import type { SupabaseClient } from '@supabase/supabase-js';
import { setupWebPush, sendToSubs, type PushSub } from '@/lib/push';
import { haversineDistance } from '@/lib/geo';
import { checkDonorEligibility } from '@/lib/eligibility';
import { donorGroupsFor } from '@/lib/bloodCompat';

const RADIUS_KM = Number(process.env.NOTIFY_RADIUS_KM || 50); // এই দূরত্বের মধ্যের ডোনাররা নোটিফিকেশন পাবেন
const MAX_RECIPIENTS = 300;

/** নতুন রিকোয়েস্টের জন্য কাছের, মানানসই ও প্রস্তুত ডোনারদের পুশ নোটিফিকেশন পাঠায়। */
export async function notifyDonors(
  supabase: SupabaseClient,
  requestId: string
): Promise<{ sent: number; donors: number; subs: number; reason?: string }> {
  const setup = setupWebPush();
  if (!setup.ok) {
    console.error('[notify] push setup failed:', setup.reason);
    return { sent: 0, donors: 0, subs: 0, reason: setup.reason };
  }

  // একটি রিকোয়েস্টের জন্য একবারই: notified_at ফাঁকা থাকলেই দাবি করা যাবে
  const { data: claimed, error: claimErr } = await supabase
    .from('blood_requests')
    .update({ notified_at: new Date().toISOString() })
    .eq('id', requestId)
    .is('notified_at', null)
    .in('urgency_status', ['critical', 'urgent', 'moderate'])
    .select('id, blood_group, hospital_name, bags_needed, latitude, longitude, urgency_status');
  if (claimErr) {
    console.error('[notify] claim error:', claimErr.message);
    return { sent: 0, donors: 0, subs: 0, reason: `claim_error: ${claimErr.message}` };
  }
  if (!claimed || claimed.length === 0) return { sent: 0, donors: 0, subs: 0, reason: 'already_notified_or_closed' };
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

  if (targets.length === 0) return { sent: 0, donors: 0, subs: 0, reason: 'no_matching_donors' };

  const kmById = new Map(targets.map((t) => [t.id, t.km]));
  const { data: subs } = await supabase
    .from('push_subscriptions')
    .select('id, user_id, endpoint, p256dh, auth')
    .in('user_id', targets.map((t) => t.id));

  const list = (subs ?? []) as (PushSub & { user_id: string })[];
  if (list.length === 0) return { sent: 0, donors: targets.length, subs: 0, reason: 'no_push_subscriptions' };

  const urgent = request.urgency_status === 'critical' ? 'অতি জরুরি' : 'জরুরি';
  const report = await sendToSubs(supabase, list, (s) => {
    const km = kmById.get((s as PushSub & { user_id: string }).user_id) ?? 0;
    return {
      title: `${urgent}: ${request.blood_group} রক্ত দরকার`,
      body: `${request.hospital_name} • ${request.bags_needed} ব্যাগ • আপনার থেকে প্রায় ${Math.max(1, Math.round(km))} কিমি`,
      url: '/requests',
      tag: `req-${request.id}`,
    };
  });

  console.log('[notify]', JSON.stringify({ request: request.id, donors: targets.length, subs: list.length, sent: report.sent, dead: report.dead, failed: report.failed.length }));
  return { sent: report.sent, donors: targets.length, subs: list.length };
}