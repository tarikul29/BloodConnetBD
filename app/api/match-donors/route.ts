import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { findNearbyDonors } from '@/lib/geo';
import { checkDonorEligibility } from '@/lib/eligibility';

export async function POST(req: NextRequest) {
  const { latitude, longitude, blood_group, radiusKm = 5 } = await req.json();

  if (latitude == null || longitude == null || !blood_group) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: donors, error } = await supabase
    .from('donors')
    .select('*')
    .eq('blood_group', blood_group)
    .eq('is_available', true);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // ডোনারের লাইভ লোকেশন থাকলে সেটাই ব্যবহার হবে, না থাকলে রেজিস্ট্রেশনের লোকেশন
  const { data: liveRows } = await supabase
    .from('donor_live_locations')
    .select('donor_id, latitude, longitude');
  const liveMap = new Map<string, { latitude: number; longitude: number }>(
    (liveRows ?? []).map((r: any) => [r.donor_id, { latitude: r.latitude, longitude: r.longitude }])
  );

  const donorList: any[] = (donors ?? []).map((d: any) => {
    const live = liveMap.get(d.id);
    return live ? { ...d, latitude: live.latitude, longitude: live.longitude } : d;
  });

  const nearby = findNearbyDonors(donorList, { latitude, longitude }, radiusKm)
    .filter((entry: any) => checkDonorEligibility(entry.donor.last_donation_date).isEligible);

  return NextResponse.json({ matches: nearby });
}