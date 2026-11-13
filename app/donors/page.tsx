'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  Phone,
  MessageSquare,
  Search,
  Navigation2,
  Droplet,
  CheckCircle2,
  Clock,
  Copy,
  Check,
  Compass,
  Users,
  HeartHandshake,
  X,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import Header from '@/components/Header';
import { CountUp } from '@/components/Hero';
import type { BloodGroup } from '@/types/database';

// get_donors_with_distance ফাংশন থেকে আসা ডোনার (সঠিক কোঅর্ডিনেট আসে না, শুধু দূরত্ব)
interface DonorWithDistance {
  id: string;
  full_name: string;
  phone: string;
  blood_group: BloodGroup;
  address: string | null;
  last_donation_date: string | null;
  is_available: boolean;
  photo_url: string | null;
  created_at: string;
  distance_km: number | null;
  location_source: 'live' | 'registered';
  location_updated_at: string | null;
}

const BLOOD_GROUPS: (BloodGroup | 'ALL')[] = ['ALL', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const ease = [0.22, 1, 0.36, 1] as const;

// গ্রুপ অনুযায়ী রঙ (লাল = A, সোনালি = B, গোলাপি = AB, সবুজ = O)
const GROUP_STYLE: Record<BloodGroup, { grad: string; dot: string; text: string }> = {
  'A+': { grad: 'from-orange-500 via-red-600 to-red-900', dot: 'from-orange-400 to-red-700', text: 'text-red-700' },
  'A-': { grad: 'from-orange-500 via-red-600 to-red-900', dot: 'from-orange-400 to-red-700', text: 'text-red-700' },
  'B+': { grad: 'from-yellow-300 via-amber-500 to-orange-700', dot: 'from-yellow-300 to-orange-600', text: 'text-amber-700' },
  'B-': { grad: 'from-yellow-300 via-amber-500 to-orange-700', dot: 'from-yellow-300 to-orange-600', text: 'text-amber-700' },
  'AB+': { grad: 'from-pink-400 via-rose-600 to-fuchsia-900', dot: 'from-pink-400 to-fuchsia-700', text: 'text-rose-700' },
  'AB-': { grad: 'from-pink-400 via-rose-600 to-fuchsia-900', dot: 'from-pink-400 to-fuchsia-700', text: 'text-rose-700' },
  'O+': { grad: 'from-emerald-400 via-teal-600 to-emerald-950', dot: 'from-emerald-400 to-teal-700', text: 'text-teal-700' },
  'O-': { grad: 'from-emerald-400 via-teal-600 to-emerald-950', dot: 'from-emerald-400 to-teal-700', text: 'text-teal-700' },
};

function timeAgo(iso: string | null): string {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'just now';
  if (min < 60) return `${min} min ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} hr ago`;
  return `${Math.floor(hr / 24)} day ago`;
}

function formatDistance(km: number) {
  return km < 1 ? `${Math.round(km * 1000)} m away` : `${km.toFixed(1)} km away`;
}

export default function DonorsPage() {
  const [donors, setDonors] = useState<DonorWithDistance[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<BloodGroup | 'ALL'>('ALL');
  const [locating, setLocating] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [sortedByDistance, setSortedByDistance] = useState(false);
  const [revealedId, setRevealedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const locateTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetchDonors(null);
  }, []);

  async function fetchDonors(coords: { lat: number; lng: number } | null) {
    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase.rpc('get_donors_with_distance', {
      user_lat: coords?.lat ?? null,
      user_lng: coords?.lng ?? null,
    });

    if (!error && data) {
      setDonors(data as DonorWithDistance[]);
    }
    setLoading(false);
  }

  function stopLocating() {
    if (locateTimer.current) clearTimeout(locateTimer.current);
    locateTimer.current = null;
    setLocating(false);
  }

  function handleFindNearMe() {
    setGeoError(null);

    if (!navigator.geolocation) {
      setGeoError('Your browser does not support location. Please try Chrome or Safari.');
      return;
    }

    setLocating(true);

    // কিছু ব্রাউজার (যেমন এডিটরের ভেতরের প্রিভিউ) অনুমতি না দেখালে কখনো উত্তর দেয় না, তাই নিজস্ব টাইমআউট
    locateTimer.current = setTimeout(() => {
      setGeoError('Location request timed out. Open the site in Chrome/Safari, allow location access, and try again.');
      setLocating(false);
    }, 20000);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        if (!locateTimer.current) return; // টাইমআউট হয়ে গেছে
        if (locateTimer.current) clearTimeout(locateTimer.current);
        locateTimer.current = null;
        const coords = { lat: position.coords.latitude, lng: position.coords.longitude };
        await fetchDonors(coords);
        setSortedByDistance(true);
        setLocating(false);
      },
      (err) => {
        stopLocating();
        if (err.code === 1) {
          setGeoError('Location permission was denied. Allow location for this site in your browser settings and try again.');
        } else if (err.code === 3) {
          setGeoError('Location request timed out. Check your GPS or internet and try again.');
        } else {
          setGeoError('Unable to get your location. Please turn on GPS and try again.');
        }
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
    );
  }

  function resetSort() {
    setSortedByDistance(false);
    fetchDonors(null);
  }

  async function copyNumber(d: DonorWithDistance) {
    try {
      await navigator.clipboard.writeText(d.phone);
      setCopiedId(d.id);
      setTimeout(() => setCopiedId((c) => (c === d.id ? null : c)), 1800);
    } catch {
      /* ক্লিপবোর্ড অনুমতি না থাকলে চুপচাপ থাকবে */
    }
  }

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    donors.forEach((d) => {
      c[d.blood_group] = (c[d.blood_group] ?? 0) + 1;
    });
    return c;
  }, [donors]);

  const filteredDonors = useMemo(() => {
    const q = searchQuery.toLowerCase();
    const list = donors.filter((donor) => {
      const matchesGroup = selectedGroup === 'ALL' || donor.blood_group === selectedGroup;
      const matchesSearch =
        donor.full_name?.toLowerCase().includes(q) ||
        donor.address?.toLowerCase().includes(q) ||
        donor.phone?.includes(searchQuery);
      return matchesGroup && matchesSearch;
    });
    // উপলব্ধ ডোনার আগে, বাকিদের ক্রম আগের মতোই থাকে
    return [...list].sort((a, b) => Number(b.is_available) - Number(a.is_available));
  }, [donors, selectedGroup, searchQuery]);

  const availableCount = donors.filter((d) => d.is_available).length;

  return (
    <main className="min-h-screen pt-16 bg-gradient-to-b from-orange-50 via-rose-50 to-amber-50 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 text-slate-800 dark:text-slate-100 relative overflow-hidden transition-colors">
      <Header />

      {/* ভাসমান ফোঁটা */}
      {[
        { l: '4%', t: 760, c: 'text-red-500', s: 64, d: 5 },
        { r: '5%', t: 980, c: 'text-amber-500', s: 50, d: 6.5 },
        { l: '46%', t: 1500, c: 'text-emerald-700', s: 58, d: 7.5 },
      ].map((b, i) => (
        <motion.div
          key={i}
          aria-hidden
          animate={{ y: [0, -22, 0], rotate: [0, 6, 0] }}
          transition={{ duration: b.d, repeat: Infinity, ease: 'easeInOut' }}
          className={`pointer-events-none absolute hidden lg:block opacity-15 ${b.c}`}
          style={{ left: b.l, right: b.r, top: b.t }}
        >
          <Droplet width={b.s} height={b.s} fill="currentColor" />
        </motion.div>
      ))}

      {/* ====== ব্যানার ====== */}
      <section className="relative">
        <motion.div
          animate={{ x: [0, 50, -30, 0], y: [0, -30, 30, 0], scale: [1, 1.15, 0.95, 1] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
          className="pointer-events-none absolute -left-24 -top-10 h-[26rem] w-[26rem] rounded-full bg-gradient-to-br from-orange-300 to-red-600 opacity-30 blur-3xl dark:opacity-20"
        />
        <motion.div
          animate={{ x: [0, -60, 40, 0], y: [0, 40, -30, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
          className="pointer-events-none absolute -right-20 top-10 h-[24rem] w-[24rem] rounded-full bg-gradient-to-br from-yellow-200 to-amber-500 opacity-40 blur-3xl dark:opacity-20"
        />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-10 pb-20 grid items-center gap-10 lg:grid-cols-[1.2fr_1fr]">
          <motion.div
            initial="hidden"
            animate="show"
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.12 } } }}
            className="flex flex-col gap-5 text-center lg:text-left"
          >
            <motion.span
              variants={{ hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { duration: 0.8, ease } } }}
              className="mx-auto lg:mx-0 inline-flex w-fit items-center gap-2 rounded-full bg-gradient-to-r from-red-100 to-amber-100 dark:from-red-950/60 dark:to-amber-950/40 px-4 py-2 text-xs font-bold text-red-800 dark:text-red-300"
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-70" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-600" />
              </span>
              {loading ? 'Loading donors...' : `${availableCount} donors ready right now`}
            </motion.span>
            <motion.h1
              variants={{ hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { duration: 0.8, ease } } }}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] text-slate-900 dark:text-white"
            >
              Meet the people
              <br />
              <motion.span
                animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                style={{ backgroundSize: '220% 100%' }}
                className="bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 bg-clip-text text-transparent"
              >
                who save lives
              </motion.span>
            </motion.h1>
            <motion.p
              variants={{ hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { duration: 0.8, ease } } }}
              className="mx-auto lg:mx-0 max-w-xl text-lg leading-relaxed text-slate-600 dark:text-slate-300"
            >
              Search by name, area or blood group. Turn on GPS to see the nearest donor first, then call in one tap.
            </motion.p>
            <motion.div
              variants={{ hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { duration: 0.8, ease } } }}
              className="flex flex-wrap justify-center lg:justify-start gap-3"
            >
              {[
                { icon: Users, label: 'Total donors', value: donors.length, color: 'text-red-600' },
                { icon: CheckCircle2, label: 'Ready now', value: availableCount, color: 'text-emerald-600' },
                { icon: HeartHandshake, label: 'Blood groups', value: Object.keys(counts).length, color: 'text-amber-600' },
              ].map((st) => (
                <div
                  key={st.label}
                  className="rounded-2xl border border-orange-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70 px-5 py-3 shadow-sm backdrop-blur-md text-left"
                >
                  <st.icon className={`mb-1 h-4 w-4 ${st.color}`} />
                  <div className={`text-2xl font-extrabold leading-none ${st.color}`}>
                    {loading ? '...' : <CountUp value={st.value} />}
                  </div>
                  <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">{st.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* ছবির কোলাজ */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease, delay: 0.2 }}
            className="relative mx-auto hidden aspect-square w-full max-w-md sm:block"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 16, repeat: Infinity, ease: 'linear' }}
              className="absolute left-[8%] top-[8%] aspect-square w-[84%] rounded-full opacity-55 blur-3xl"
              style={{ background: 'conic-gradient(from 0deg, #dc2626, #f59e0b, #14b8a6, #dc2626)' }}
            />
            <div className="absolute left-[10%] top-0 h-[90%] w-[70%] overflow-hidden rounded-t-full rounded-b-[2.2rem] bg-emerald-900 shadow-2xl shadow-red-900/25">
              <motion.div
                animate={{ scale: [1, 1.12] }}
                transition={{ duration: 14, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
                className="absolute inset-0"
              >
                <Image
                  src="/donor-smile.jpg"
                  alt="A smiling blood donor"
                  fill
                  priority
                  sizes="320px"
                  className="object-cover object-[48%_30%]"
                />
              </motion.div>
              <div className="absolute inset-0 bg-gradient-to-t from-red-900/45 via-transparent to-transparent" />
            </div>
            <motion.div
              animate={{ y: [0, -16, 0], rotate: [0, 3, 0] }}
              transition={{ duration: 6.5, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute right-0 top-[40%] aspect-square w-[34%] overflow-hidden rounded-full border-[6px] border-white dark:border-slate-900 bg-red-600 shadow-xl"
            >
              <Image
                src="/heart-donation.jpg"
                alt="Donating blood"
                fill
                sizes="160px"
                className="object-cover scale-[1.9] origin-[32%_36%] object-[30%_35%]"
              />
            </motion.div>
            <motion.div
              animate={{ y: [0, -18, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute left-0 top-[10%] flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-full bg-white text-2xl font-extrabold text-red-600 shadow-xl"
            >
              O+
            </motion.div>
            <motion.div
              animate={{ y: [0, -14, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
              className="absolute bottom-[10%] left-[4%] flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-yellow-200 to-amber-500 text-xl font-extrabold text-slate-900 shadow-xl"
            >
              B+
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ====== সার্চ ও ফিল্টার ====== */}
      <div className="relative z-10 mx-auto -mt-10 max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease, delay: 0.3 }}
          className="relative overflow-hidden rounded-[2rem] border border-orange-100 dark:border-slate-800 bg-gradient-to-br from-white/95 to-orange-50/95 dark:from-slate-900/95 dark:to-slate-900/95 p-6 sm:p-8 shadow-2xl shadow-red-200/40 dark:shadow-black/30 backdrop-blur-xl"
        >
          <motion.div
            animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            style={{ backgroundSize: '220% 100%' }}
            className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-red-600 via-amber-400 to-emerald-500"
          />
          <div className="mb-6 flex flex-col items-stretch gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-red-600" />
              <input
                type="text"
                placeholder="Search by name, location, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-2xl border-[1.5px] border-orange-100 dark:border-slate-700 bg-white dark:bg-slate-800 py-4 pl-14 pr-5 text-base font-medium text-slate-900 dark:text-white placeholder:text-slate-400 transition-all focus:border-red-500 focus:outline-none focus:ring-4 focus:ring-red-500/15"
              />
            </div>
            <motion.button
              onClick={handleFindNearMe}
              disabled={locating}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.96 }}
              className="relative flex items-center justify-center gap-2.5 overflow-hidden rounded-2xl bg-gradient-to-r from-red-500 via-red-600 to-red-800 px-7 py-4 text-base font-bold text-white shadow-lg shadow-red-300/50 disabled:opacity-70 dark:shadow-none"
            >
              <motion.span
                aria-hidden
                animate={{ x: ['-150%', '350%'] }}
                transition={{ duration: 1.4, repeat: Infinity, repeatDelay: 2.4, ease: 'easeInOut' }}
                className="pointer-events-none absolute inset-y-0 w-1/3 -skew-x-[20deg] bg-gradient-to-r from-transparent via-white/60 to-transparent"
              />
              <Navigation2 className={`relative h-5 w-5 ${locating ? 'animate-spin' : ''}`} />
              <span className="relative">{locating ? 'Finding your location...' : 'Find Donors Near Me'}</span>
            </motion.button>
          </div>

          <AnimatePresence>
            {geoError && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mb-4 flex items-start justify-between gap-3 rounded-2xl border border-red-100 dark:border-red-900/50 bg-red-50 dark:bg-red-950/50 p-3.5 text-sm font-medium text-red-700 dark:text-red-400"
              >
                <span>{geoError}</span>
                <button onClick={() => setGeoError(null)} aria-label="Dismiss">
                  <X className="h-4 w-4" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {sortedByDistance && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-4 flex flex-wrap items-center gap-3 text-sm font-semibold text-emerald-700 dark:text-emerald-400"
            >
              <span className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-950/60 dark:to-teal-950/40 px-4 py-1.5">
                <Compass className="h-4 w-4" /> Sorted by distance from you
              </span>
              <button onClick={resetSort} className="text-slate-500 underline underline-offset-4 hover:text-red-600">
                Reset
              </button>
            </motion.div>
          )}

          <div className="flex flex-wrap gap-2.5">
            {BLOOD_GROUPS.map((bg) => {
              const active = selectedGroup === bg;
              const style = bg === 'ALL' ? null : GROUP_STYLE[bg];
              return (
                <motion.button
                  key={bg}
                  onClick={() => setSelectedGroup(bg)}
                  whileHover={{ y: -4, scale: 1.05 }}
                  whileTap={{ scale: 0.94 }}
                  className={`flex items-center gap-2 rounded-2xl py-2.5 pl-3 pr-4 text-sm font-extrabold transition-shadow ${
                    active
                      ? 'bg-gradient-to-r from-red-500 via-red-600 to-red-800 text-white shadow-lg shadow-red-300/50 dark:shadow-none'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 shadow-sm shadow-orange-200/50 dark:shadow-none'
                  }`}
                >
                  <span
                    className={`h-5 w-5 rounded-full bg-gradient-to-br ${
                      style ? style.dot : 'from-white/60 to-white/20'
                    }`}
                  />
                  {bg === 'ALL' ? 'All Groups' : bg}
                  {bg !== 'ALL' && counts[bg] ? (
                    <span className={`rounded-full px-1.5 text-[10px] ${active ? 'bg-white/25' : 'bg-orange-100 dark:bg-slate-700'}`}>
                      {counts[bg]}
                    </span>
                  ) : null}
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* ====== ফলাফল ====== */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-10 pb-20">
        {!loading && filteredDonors.length > 0 && (
          <div className="mb-6 text-2xl font-extrabold text-slate-900 dark:text-white">
            Showing{' '}
            <span className="bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 bg-clip-text text-transparent">
              {filteredDonors.length} donor{filteredDonors.length === 1 ? '' : 's'}
            </span>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 gap-7 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="overflow-hidden rounded-[2rem] border border-orange-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70 p-6"
              >
                <div className="h-24 animate-pulse rounded-3xl bg-gradient-to-r from-orange-100 via-orange-50 to-orange-100 dark:from-slate-800 dark:via-slate-700 dark:to-slate-800" />
                <div className="mt-5 flex items-center gap-4">
                  <div className="h-16 w-16 animate-pulse rounded-full bg-orange-100 dark:bg-slate-800" />
                  <div className="flex-1 space-y-2.5">
                    <div className="h-4 w-2/3 animate-pulse rounded-full bg-orange-100 dark:bg-slate-800" />
                    <div className="h-3 w-full animate-pulse rounded-full bg-orange-50 dark:bg-slate-800" />
                  </div>
                </div>
                <div className="mt-5 h-12 animate-pulse rounded-2xl bg-orange-100 dark:bg-slate-800" />
              </div>
            ))}
          </div>
        ) : filteredDonors.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-[2rem] border-2 border-dashed border-orange-200 dark:border-slate-700 bg-gradient-to-br from-white to-orange-50 dark:from-slate-900 dark:to-slate-900 px-6 py-16 text-center"
          >
            <motion.div animate={{ y: [0, -12, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }} className="mx-auto mb-4 w-fit">
              <Droplet className="h-16 w-16 text-red-300" fill="currentColor" />
            </motion.div>
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">No donors found</h3>
            <p className="mx-auto mt-2 max-w-sm text-slate-500 dark:text-slate-400">
              Try another area or blood group, or become the first donor there.
            </p>
            <Link
              href="/register"
              className="mt-6 inline-block rounded-full bg-gradient-to-r from-yellow-300 to-amber-500 px-7 py-3 font-bold text-slate-900 shadow-lg"
            >
              Become a Donor
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 gap-7 md:grid-cols-2 lg:grid-cols-3">
            {filteredDonors.map((donor, i) => {
              const style = GROUP_STYLE[donor.blood_group] ?? GROUP_STYLE['A+'];
              const revealed = revealedId === donor.id;
              return (
                <motion.div
                  key={donor.id}
                  initial={{ opacity: 0, y: 50, scale: 0.96 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.7, ease, delay: (i % 3) * 0.08 }}
                  whileHover={{ y: -12 }}
                  className={`group relative flex flex-col overflow-hidden rounded-[2rem] border border-orange-100 dark:border-slate-800 bg-gradient-to-b from-white to-rose-50/60 dark:from-slate-900 dark:to-slate-900 shadow-lg shadow-red-200/30 dark:shadow-none transition-shadow hover:shadow-2xl hover:shadow-red-300/40 ${
                    donor.is_available ? '' : 'opacity-90'
                  }`}
                >
                  {/* রঙিন মাথা */}
                  <div className={`relative h-28 overflow-hidden bg-gradient-to-br ${style.grad}`}>
                    <motion.div
                      animate={{ x: [0, 40, -20, 0], y: [0, 10, -10, 0] }}
                      transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
                      className="absolute -left-6 -top-10 h-40 w-40 rounded-full bg-white/25 blur-2xl"
                    />
                    <motion.div
                      animate={{ backgroundPosition: ['0px 0px', '36px 36px'] }}
                      transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
                      className="absolute inset-0 opacity-25"
                      style={{
                        backgroundImage: 'radial-gradient(circle at 12px 12px,#fff 2px,transparent 3px)',
                        backgroundSize: '36px 36px',
                      }}
                    />
                    {sortedByDistance && i === 0 && donor.distance_km !== null && (
                      <span className="absolute left-4 top-4 rounded-full border border-white/40 bg-white/20 px-3 py-1 text-xs font-bold text-white backdrop-blur-md">
                        Nearest to you
                      </span>
                    )}
                    {/* ফোঁটা আকারের গ্রুপ ব্যাজ */}
                    <div className="absolute right-5 top-5 flex h-14 w-14 -rotate-45 items-center justify-center rounded-[50%_0_50%_50%] bg-white shadow-xl shadow-black/20">
                      <span className={`rotate-45 text-lg font-extrabold ${style.text}`}>{donor.blood_group}</span>
                    </div>
                  </div>

                  {/* অ্যাভাটার */}
                  <div className="relative -mt-12 ml-6 h-24 w-24">
                    <motion.span
                      aria-hidden
                      animate={{ rotate: 360 }}
                      transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
                      className="absolute inset-0 rounded-full"
                      style={{ background: 'conic-gradient(#dc2626, #f59e0b, #14b8a6, #dc2626)' }}
                    />
                    <span className="absolute inset-[3px] flex items-center justify-center overflow-hidden rounded-full border-[3px] border-white dark:border-slate-900 bg-white dark:bg-slate-800">
                      {donor.photo_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={donor.photo_url} alt={donor.full_name} className="h-full w-full object-cover" />
                      ) : (
                        <span className={`flex h-full w-full items-center justify-center bg-gradient-to-br text-3xl font-extrabold text-white ${style.grad}`}>
                          {donor.full_name?.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </span>
                    <span
                      className={`absolute bottom-1 right-1 h-[18px] w-[18px] rounded-full border-[3px] border-white dark:border-slate-900 ${
                        donor.is_available ? 'bg-emerald-500' : 'bg-amber-500'
                      }`}
                    />
                  </div>

                  <div className="flex flex-1 flex-col gap-3.5 px-6 pb-6 pt-3.5">
                    <div className="flex flex-col gap-1.5">
                      <h3 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">{donor.full_name}</h3>
                      <p className="flex items-start gap-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                        <span className="line-clamp-2 break-words" title={donor.address || ''}>
                          {donor.address || 'Address not provided'}
                        </span>
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {donor.is_available ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-950/60 dark:to-teal-950/40 px-3.5 py-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Ready to Donate
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-100 to-yellow-100 dark:from-amber-950/60 dark:to-yellow-950/40 px-3.5 py-1.5 text-xs font-bold text-amber-800 dark:text-amber-300">
                          <Clock className="h-3.5 w-3.5" /> On Break
                        </span>
                      )}
                      {donor.distance_km !== null && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-sky-100 to-indigo-100 dark:from-sky-950/50 dark:to-indigo-950/40 px-3.5 py-1.5 text-xs font-bold text-indigo-800 dark:text-indigo-300">
                          <Compass className="h-3.5 w-3.5" /> {formatDistance(donor.distance_km)}
                        </span>
                      )}
                    </div>
                    {donor.distance_km !== null && (
                      <p className="-mt-1.5 text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                        {donor.location_source === 'live'
                          ? `Live location · updated ${timeAgo(donor.location_updated_at)}`
                          : 'Based on registered area'}
                      </p>
                    )}

                    {/* কল বাটন: চাপলে নম্বর দেখাবে */}
                    <div className="mt-auto border-t border-dashed border-orange-200 dark:border-slate-700 pt-4">
                      <AnimatePresence mode="wait" initial={false}>
                        {revealed ? (
                          <motion.div
                            key="number"
                            initial={{ opacity: 0, scale: 0.92, y: 8 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.3, ease }}
                            className="flex flex-col gap-2.5"
                          >
                            <div className="flex items-center justify-between gap-3 rounded-2xl border border-emerald-200 dark:border-emerald-900/60 bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-950/60 dark:to-teal-950/40 px-4 py-3">
                              <span className="flex flex-col">
                                <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400">Phone number</span>
                                <b className="text-xl tracking-wide text-emerald-950 dark:text-emerald-200">{donor.phone}</b>
                              </span>
                              <button
                                onClick={() => copyNumber(donor)}
                                className="inline-flex items-center gap-1.5 rounded-full bg-white dark:bg-slate-800 px-3.5 py-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300"
                              >
                                {copiedId === donor.id ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                                {copiedId === donor.id ? 'Copied' : 'Copy'}
                              </button>
                            </div>
                            <div className="grid grid-cols-[1.3fr_1fr] gap-2.5">
                              <motion.a
                                href={`tel:${donor.phone}`}
                                whileHover={{ y: -3 }}
                                whileTap={{ scale: 0.96 }}
                                className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-red-500 via-red-600 to-red-800 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-red-300/40 dark:shadow-none"
                              >
                                <Phone className="h-4 w-4" /> Dial now
                              </motion.a>
                              <motion.a
                                href={`sms:${donor.phone}`}
                                whileHover={{ y: -3 }}
                                whileTap={{ scale: 0.96 }}
                                className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-100 to-orange-200 dark:from-slate-800 dark:to-slate-700 py-3.5 text-sm font-extrabold text-amber-900 dark:text-amber-300"
                              >
                                <MessageSquare className="h-4 w-4" /> SMS
                              </motion.a>
                            </div>
                          </motion.div>
                        ) : (
                          <motion.button
                            key="call"
                            onClick={() => setRevealedId(donor.id)}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            whileHover={{ y: -3 }}
                            whileTap={{ scale: 0.96 }}
                            className="relative flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-2xl bg-gradient-to-r from-red-500 via-red-600 to-red-800 py-4 text-base font-extrabold text-white shadow-lg shadow-red-300/50 dark:shadow-none"
                          >
                            <motion.span
                              aria-hidden
                              animate={{ x: ['-150%', '350%'] }}
                              transition={{ duration: 1.4, repeat: Infinity, repeatDelay: 2.4, ease: 'easeInOut' }}
                              className="pointer-events-none absolute inset-y-0 w-1/3 -skew-x-[20deg] bg-gradient-to-r from-transparent via-white/60 to-transparent"
                            />
                            <Phone className="relative h-[18px] w-[18px]" />
                            <span className="relative">Call Now</span>
                          </motion.button>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* ====== নিচের CTA ====== */}
        {!loading && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.8, ease }}
            className="relative mt-16 overflow-hidden rounded-[2.5rem] p-8 sm:p-12"
          >
            <motion.div
              animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
              transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
              style={{ backgroundSize: '220% 220%' }}
              className="absolute inset-0 bg-gradient-to-br from-red-900 via-red-600 to-orange-500"
            />
            <motion.div
              animate={{ x: [0, 50, -30, 0], y: [0, 20, -20, 0] }}
              transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -top-20 right-[8%] h-64 w-64 rounded-full bg-amber-300/40 blur-3xl"
            />
            <div className="relative flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
              <div className="max-w-xl">
                <h2 className="text-3xl font-extrabold leading-tight text-white sm:text-4xl">Can&apos;t find the right donor?</h2>
                <p className="mt-2 text-lg text-red-50/90">Post an emergency request and every donor gets notified.</p>
              </div>
              <motion.div whileHover={{ scale: 1.06, y: -3 }} whileTap={{ scale: 0.96 }}>
                <Link
                  href="/request-blood"
                  className="inline-block rounded-full bg-gradient-to-r from-yellow-300 to-amber-500 px-8 py-4 text-lg font-bold text-slate-900 shadow-xl"
                >
                  Emergency Blood Request
                </Link>
              </motion.div>
            </div>
          </motion.div>
        )}
      </div>
    </main>
  );
}