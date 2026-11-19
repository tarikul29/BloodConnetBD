import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { purgeExpiredGallery } from '@/lib/galleryCleanup';

export const dynamic = 'force-dynamic';

// হোম পেজের স্লাইডারের জন্য সবার দেখার মতো ছবির তালিকা।
// প্রতিবার ডাকার সময় মেয়াদ শেষ ছবিগুলো নিজে থেকেই মুছে যায় (আলাদা cron লাগে না)।
export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    await purgeExpiredGallery(supabase);
  } catch {
    // মোছা ব্যর্থ হলেও তালিকা দেখানো চলবে (মেয়াদ শেষ ছবি নিচে ফিল্টার হয়)
  }

  const { data, error } = await supabase
    .from('donation_gallery')
    .select('id, image_url, donor_name, blood_group, caption, created_at')
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    return NextResponse.json({ items: [] }, { status: 200 });
  }

  return NextResponse.json(
    { items: data ?? [] },
    { headers: { 'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=300' } }
  );
}