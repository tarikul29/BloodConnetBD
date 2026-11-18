'use client';

import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    turnstile?: any;
  }
}

/** Cloudflare Turnstile সাইট-কী (গোপন নয়)। না থাকলে "রোবট নই" ঘর দেখানো হয় না। */
export const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '';

const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

function loadScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.turnstile) return resolve();
    const existing = document.querySelector<HTMLScriptElement>('script[src^="https://challenges.cloudflare.com/turnstile"]');
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('turnstile')));
      return;
    }
    const s = document.createElement('script');
    s.src = SCRIPT_SRC;
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('turnstile'));
    document.head.appendChild(s);
  });
}

export default function Turnstile({ onToken, resetKey = 0 }: { onToken: (token: string) => void; resetKey?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  const cb = useRef(onToken);
  cb.current = onToken;

  useEffect(() => {
    if (!TURNSTILE_SITE_KEY) return;
    let cancelled = false;
    loadScript()
      .then(() => {
        if (cancelled || !ref.current || !window.turnstile) return;
        const narrow = ref.current.clientWidth < 300;
        widgetId.current = window.turnstile.render(ref.current, {
          sitekey: TURNSTILE_SITE_KEY,
          theme: 'auto',
          language: 'bn',
          size: narrow ? 'compact' : 'flexible',
          callback: (t: string) => cb.current(t),
          'expired-callback': () => cb.current(''),
          'error-callback': () => cb.current(''),
        });
      })
      .catch(() => cb.current(''));
    return () => {
      cancelled = true;
      if (widgetId.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetId.current);
        } catch {}
        widgetId.current = null;
      }
    };
  }, []);

  // টোকেন একবারই ব্যবহার করা যায় — ব্যর্থ চেষ্টার পর নতুন করে যাচাই নিতে
  useEffect(() => {
    if (resetKey && widgetId.current && window.turnstile) {
      cb.current('');
      try {
        window.turnstile.reset(widgetId.current);
      } catch {}
    }
  }, [resetKey]);

  if (!TURNSTILE_SITE_KEY) return null;
  return <div ref={ref} className="flex w-full justify-center" />;
}