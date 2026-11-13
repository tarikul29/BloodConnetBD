'use client';

import { useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';

/**
 * লগইন করা ডোনারের ফোনের বর্তমান লোকেশন সার্ভারে (donor_live_locations টেবিলে) পাঠায়।
 *
 * - শুধু তখনই কাজ করে যখন ডোনারের "রক্তদানে উপলব্ধ" চালু আছে।
 * - উপলব্ধ বন্ধ করলে সংরক্ষিত লাইভ লোকেশন মুছে যায়।
 * - সাইট/অ্যাপ খোলা থাকলে এবং ব্রাউজারে লোকেশনের অনুমতি দিলে তবেই আপডেট হয়
 *   (ব্রাউজার ব্যাকগ্রাউন্ডে লোকেশন পাঠাতে দেয় না)।
 * - ডোনারের সঠিক কোঅর্ডিনেট কেউ দেখতে পায় না; অন্যরা শুধু দূরত্ব দেখে।
 */

const MIN_MOVE_METERS = 100; // এর কম নড়লে নতুন করে পাঠানো হয় না
const MIN_INTERVAL_MS = 60_000; // দুইবার পাঠানোর মধ্যে ন্যূনতম ব্যবধান
const REFRESH_AVAILABILITY_MS = 60_000;

function distanceMeters(aLat: number, aLng: number, bLat: number, bLng: number) {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(x)));
}

export default function LiveLocationTracker({ userId }: { userId: string | null }) {
  const last = useRef<{ lat: number; lng: number; at: number } | null>(null);

  useEffect(() => {
    if (!userId || typeof navigator === 'undefined' || !('geolocation' in navigator)) return;

    const supabase = createClient();
    let cancelled = false;
    let watchId: number | null = null;
    let isDonor = false;
    let available = false;

    async function pushLocation(pos: GeolocationPosition) {
      const { latitude, longitude, accuracy } = pos.coords;
      const now = Date.now();
      const prev = last.current;
      if (prev) {
        const moved = distanceMeters(prev.lat, prev.lng, latitude, longitude);
        if (moved < MIN_MOVE_METERS && now - prev.at < MIN_INTERVAL_MS * 5) return;
        if (now - prev.at < MIN_INTERVAL_MS) return;
      }
      last.current = { lat: latitude, lng: longitude, at: now };
      await supabase.from('donor_live_locations').upsert(
        {
          donor_id: userId,
          latitude,
          longitude,
          accuracy_m: accuracy ?? null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'donor_id' }
      );
    }

    function startWatching() {
      if (watchId !== null) return;
      try {
        watchId = navigator.geolocation.watchPosition(
          (pos) => {
            if (!cancelled && available) pushLocation(pos);
          },
          () => {
            /* অনুমতি না দিলে বা লোকেশন না পেলে চুপচাপ থাকবে */
          },
          { enableHighAccuracy: true, maximumAge: 30_000, timeout: 20_000 }
        );
      } catch {
        /* ignore */
      }
    }

    function stopWatching() {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
        watchId = null;
      }
    }

    async function refreshAvailability() {
      const { data } = await supabase
        .from('donors')
        .select('is_available')
        .eq('id', userId)
        .maybeSingle();
      if (cancelled) return;

      isDonor = !!data;
      const nowAvailable = !!data?.is_available;

      if (isDonor && nowAvailable) {
        available = true;
        startWatching();
      } else {
        const wasAvailable = available;
        available = false;
        stopWatching();
        last.current = null;
        if (isDonor && wasAvailable) {
          await supabase.from('donor_live_locations').delete().eq('donor_id', userId);
        }
      }
    }

    refreshAvailability();
    const timer = setInterval(refreshAvailability, REFRESH_AVAILABILITY_MS);
    const onFocus = () => refreshAvailability();
    window.addEventListener('focus', onFocus);
    window.addEventListener('donor-availability-changed', onFocus);

    return () => {
      cancelled = true;
      clearInterval(timer);
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('donor-availability-changed', onFocus);
      stopWatching();
    };
  }, [userId]);

  return null;
}