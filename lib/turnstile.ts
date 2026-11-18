/** Cloudflare Turnstile টোকেন সার্ভারে যাচাই করে। secret না থাকলে (শুরুর ধাপে) যাচাই বাদ দেয়। */
export async function verifyTurnstile(token: unknown, ip?: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true; // এখনো চালু করা হয়নি
  if (typeof token !== 'string' || token.length < 10 || token.length > 4096) return false;
  try {
    const body = new URLSearchParams({ secret, response: token });
    if (ip && ip !== 'unknown') body.set('remoteip', ip);
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
      cache: 'no-store',
    });
    const json = await res.json();
    return json?.success === true;
  } catch {
    return false; // যাচাই করা না গেলে অনুমতি নয়
  }
}