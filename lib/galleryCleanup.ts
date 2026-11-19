import type { SupabaseClient } from '@supabase/supabase-js';

export const GALLERY_BUCKET = 'donation-gallery';

/**
 * মেয়াদ শেষ হওয়া (৭ দিন পার হওয়া) গ্যালারি ছবি স্টোরেজ ও ডাটাবেস দুই জায়গা থেকেই মুছে ফেলে।
 * শুধু সার্ভার (service role) থেকে ডাকতে হবে।
 */
export async function purgeExpiredGallery(supabase: SupabaseClient): Promise<number> {
  const { data, error } = await supabase
    .from('donation_gallery')
    .select('id, storage_path')
    .lte('expires_at', new Date().toISOString())
    .limit(200);
  if (error || !data || data.length === 0) return 0;

  const paths = data.map((r) => r.storage_path).filter(Boolean) as string[];
  if (paths.length) {
    await supabase.storage.from(GALLERY_BUCKET).remove(paths);
  }
  await supabase
    .from('donation_gallery')
    .delete()
    .in(
      'id',
      data.map((r) => r.id)
    );
  return data.length;
}