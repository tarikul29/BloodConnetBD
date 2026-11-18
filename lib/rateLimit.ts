const store = new Map<string, { count: number; resetAt: number }>();

/** সহজ মেমোরি-ভিত্তিক সীমা। সীমা পেরোলে true ফেরত দেয়। */
export function isRateLimited(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  if (store.size > 5000) {
    store.forEach((v, k) => {
      if (v.resetAt < now) store.delete(k);
    });
  }
  const r = store.get(key);
  if (!r || r.resetAt < now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }
  r.count += 1;
  return r.count > max;
}