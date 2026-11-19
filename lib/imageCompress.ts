/**
 * ব্রাউজারেই ছবি ছোট করে (সাইজ ও MB কমিয়ে) JPEG বানায়, যাতে ডাটাবেসের স্টোরেজ কম লাগে।
 * মোবাইলের ছবির ঘোরানো (EXIF) ঠিক রাখে।
 */
export async function compressImage(
  file: File,
  opts: { maxSide: number; maxBytes: number; minQuality?: number }
): Promise<File> {
  const { maxSide, maxBytes, minQuality = 0.4 } = opts;

  let bitmap: ImageBitmap | HTMLImageElement;
  let srcW: number;
  let srcH: number;
  let cleanup = () => {};

  try {
    const bm = await createImageBitmap(file, { imageOrientation: 'from-image' } as ImageBitmapOptions);
    bitmap = bm;
    srcW = bm.width;
    srcH = bm.height;
    cleanup = () => bm.close?.();
  } catch {
    const url = URL.createObjectURL(file);
    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('image-load'));
      img.src = url;
    });
    bitmap = img;
    srcW = img.naturalWidth;
    srcH = img.naturalHeight;
    cleanup = () => URL.revokeObjectURL(url);
  }

  const scale = Math.min(1, maxSide / Math.max(srcW, srcH));
  let w = Math.max(1, Math.round(srcW * scale));
  let h = Math.max(1, Math.round(srcH * scale));

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    cleanup();
    throw new Error('canvas');
  }

  const toBlob = (q: number) =>
    new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', q));

  let blob: Blob | null = null;
  // প্রথমে কোয়ালিটি কমিয়ে, তারপরও বড় থাকলে মাপ কমিয়ে চেষ্টা
  for (let round = 0; round < 4; round++) {
    canvas.width = w;
    canvas.height = h;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(bitmap as CanvasImageSource, 0, 0, w, h);

    for (let q = 0.82; q >= minQuality; q -= 0.12) {
      blob = await toBlob(q);
      if (blob && blob.size <= maxBytes) break;
    }
    if (blob && blob.size <= maxBytes) break;
    w = Math.round(w * 0.8);
    h = Math.round(h * 0.8);
  }
  cleanup();

  if (!blob) throw new Error('compress');
  const base = file.name.replace(/\.[^.]+$/, '') || 'photo';
  return new File([blob], `${base}.jpg`, { type: 'image/jpeg' });
}