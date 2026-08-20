import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { findNearbyDonors } from '@/lib/geo';
import { checkDonorEligibility } from '@/lib/eligibility';
import type { Donor } from '@/types/database';

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

  const nearby = findNearbyDonors<Donor>(donors ?? [], { latitude, longitude }, radiusKm)
    .filter(({ donor }) => checkDonorEligibility(donor.last_donation_date).isEligible);

  return NextResponse.json({ matches: nearby });
}
