'use client';

import { useEffect, useState } from 'react';
import { Bell, BellOff, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

function urlBase64ToUint8Array(base64: string) {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(b64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

type State = 'checking' | 'unsupported' | 'denied' | 'off' | 'on';

export default function PushToggle() {
  const [state, setState] = useState<State>('checking');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testMsg, setTestMsg] = useState<string | null>(null);
  const vapid = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

  // সাবস্ক্রিপশন ডেটাবেসে সেভ/হালনাগাদ (প্রতিবার ড্যাশবোর্ড খুললে, যাতে সবসময় সঠিক থাকে)
  async function saveSubscription(sub: PushSubscription) {
    const json = sub.toJSON();
    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user || !json.keys) throw new Error('no user');
    const { error: dbErr } = await supabase.from('push_subscriptions').upsert(
      { user_id: userData.user.id, endpoint: sub.endpoint, p256dh: json.keys.p256dh, auth: json.keys.auth },
      { onConflict: 'endpoint' }
    );
    if (dbErr) throw dbErr;
  }

  useEffect(() => {
    async function check() {
      if (!vapid || !('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) {
        setState('unsupported');
        return;
      }
      if (Notification.permission === 'denied') {
        setState('denied');
        return;
      }
      try {
        let reg = await navigator.serviceWorker.getRegistration('/sw.js');
        let sub = await reg?.pushManager.getSubscription();
        // অনুমতি দেওয়া আছে কিন্তু সাবস্ক্রিপশন হারিয়ে গেছে (ব্রাউজার বদলে ফেলেছে) → চুপচাপ আবার চালু
        if (!sub && Notification.permission === 'granted' && vapid) {
          try {
            await navigator.serviceWorker.register('/sw.js');
            reg = await navigator.serviceWorker.ready;
            sub = await reg.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: urlBase64ToUint8Array(vapid),
            });
          } catch {}
        }
        if (sub) await saveSubscription(sub);
        setState(sub ? 'on' : 'off');
      } catch {
        setState('off');
      }
    }
    check();
  }, [vapid]);

  async function enable() {
    setBusy(true);
    setError(null);
    try {
      const perm = await Notification.requestPermission();
      if (perm !== 'granted') {
        setState(perm === 'denied' ? 'denied' : 'off');
        return;
      }
      await navigator.serviceWorker.register('/sw.js');
      const reg = await navigator.serviceWorker.ready;
      let sub = await reg.pushManager.getSubscription();
      if (!sub) {
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapid!),
        });
      }
      await saveSubscription(sub);
      setState('on');
    } catch {
      setError('নোটিফিকেশন চালু করা যায়নি। আবার চেষ্টা করুন।');
    } finally {
      setBusy(false);
    }
  }

  async function sendTest() {
    setBusy(true);
    setError(null);
    setTestMsg(null);
    try {
      const supabase = createClient();
      const { data } = await supabase.auth.getSession();
      const res = await fetch('/api/push-test', {
        method: 'POST',
        headers: { Authorization: `Bearer ${data.session?.access_token ?? ''}` },
      });
      const j = await res.json().catch(() => ({}));
      if (res.ok && j.ok) setTestMsg('টেস্ট পাঠানো হয়েছে — কয়েক সেকেন্ডে নোটিফিকেশন আসবে।');
      else if (j.error === 'no_subscription') setError('এই ফোন সার্ভারে নিবন্ধিত নয়। "বন্ধ" করে আবার "চালু করুন" চাপুন।');
      else if (j.dead > 0) setError('পুরনো সাবস্ক্রিপশন মেয়াদোত্তীর্ণ ছিল। পেজ রিফ্রেশ করে আবার চেষ্টা করুন।');
      else setError('টেস্ট পাঠানো যায়নি। কিছুক্ষণ পরে আবার চেষ্টা করুন।');
    } catch {
      setError('টেস্ট পাঠানো যায়নি। ইন্টারনেট চেক করুন।');
    } finally {
      setBusy(false);
    }
  }

  async function disable() {
    setBusy(true);
    setError(null);
    try {
      const reg = await navigator.serviceWorker.getRegistration('/sw.js');
      const sub = await reg?.pushManager.getSubscription();
      if (sub) {
        const supabase = createClient();
        await supabase.from('push_subscriptions').delete().eq('endpoint', sub.endpoint);
        await sub.unsubscribe();
      }
      setState('off');
    } catch {
      setError('বন্ধ করা যায়নি। আবার চেষ্টা করুন।');
    } finally {
      setBusy(false);
    }
  }

  if (state === 'checking') return null;

  if (state === 'unsupported') {
    return (
      <p className="text-sm leading-[1.8] text-slate-500 dark:text-slate-400">
        এই ব্রাউজারে নোটিফিকেশন চালু করা যাচ্ছে না। আইফোনে হলে আগে সাইটটিকে "Add to Home Screen" করে অ্যাপের মতো খুলুন।
      </p>
    );
  }

  if (state === 'denied') {
    return (
      <p className="text-sm leading-[1.8] text-amber-700 dark:text-amber-400">
        নোটিফিকেশন ব্লক করা আছে। ব্রাউজারের সাইট সেটিংস থেকে "Notifications" অনুমতি দিন, তারপর পেজ রিফ্রেশ করুন।
      </p>
    );
  }

  const on = state === 'on';
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-base font-extrabold text-slate-900 dark:text-white">জরুরি রক্তের নোটিফিকেশন</p>
          <p className="text-sm leading-[1.7] text-slate-500 dark:text-slate-400">
            আপনার গ্রুপের রক্ত কাছাকাছি কারো দরকার হলে এই ফোনে জানানো হবে
          </p>
        </div>
        <button
          type="button"
          onClick={on ? disable : enable}
          disabled={busy}
          className={`inline-flex shrink-0 items-center gap-2 rounded-full px-5 py-2.5 text-sm font-extrabold text-white shadow-lg disabled:opacity-60 ${
            on
              ? 'bg-gradient-to-r from-emerald-500 to-teal-700 shadow-emerald-300/50'
              : 'bg-gradient-to-r from-red-600 to-orange-500 shadow-red-300/50'
          } dark:shadow-none`}
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : on ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
          {on ? 'চালু আছে' : 'চালু করুন'}
        </button>
      </div>
      {on && (
        <button type="button" onClick={sendTest} disabled={busy} className="text-sm font-bold text-red-600 underline underline-offset-4 disabled:opacity-60 dark:text-red-400">
          টেস্ট নোটিফিকেশন পাঠান
        </button>
      )}
      {testMsg && <p className="text-sm font-semibold text-emerald-600">{testMsg}</p>}
      {error && <p className="text-sm font-semibold text-rose-600">{error}</p>}
    </div>
  );
}