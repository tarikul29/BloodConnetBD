'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Phone,
  MessageSquare,
  Droplet,
  Hospital,
  Clock,
  FileText,
  CheckCircle2,
  Share2,
  Copy,
  Check,
  Plus,
  Layers,
  HeartHandshake,
} from 'lucide-react';

import { createClient } from '@/lib/supabase/client';
import Header from '@/components/Header';
import { CountUp } from '@/components/Hero';
import type { BloodGroup, BloodRequest } from '@/types/database';

const ease = [0.22, 1, 0.36, 1] as const;
const BLOOD_GROUPS: (BloodGroup | 'ALL')[] = ['ALL', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

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

export default function RequestsPage() {
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [group, setGroup] = useState<BloodGroup | 'ALL'>('ALL');

  useEffect(() => {
    loadRequests();
  }, []);

  async function loadRequests() {
    const supabase = createClient();
    const { data } = await supabase
      .from('blood_requests')
      .select('*')
      .order('created_at', { ascending: false });
    setRequests(data ?? []);
    setLoading(false);
  }

  const activeRequests = requests.filter((r) => r.urgency_status !== 'fulfilled');
  const fulfilledRequests = requests.filter((r) => r.urgency_status === 'fulfilled');
  const totalBags = activeRequests.reduce((s, r) => s + (r.bags_needed || 0), 0);

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    activeRequests.forEach((r) => {
      c[r.blood_group] = (c[r.blood_group] ?? 0) + 1;
    });
    return c;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requests]);

  const shown = activeRequests.filter((r) => group === 'ALL' || r.blood_group === group);

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-orange-50 via-rose-50 to-amber-50 pt-16 text-slate-800 transition-colors dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 dark:text-slate-100">
      <Header />

      {/* ভাসমান ফোঁটা */}
      {[
        { l: '4%', t: 820, c: 'text-red-500', s: 64, d: 5 },
        { r: '5%', t: 1200, c: 'text-emerald-700', s: 54, d: 6.5 },
      ].map((b, i) => (
        <motion.div
          key={i}
          aria-hidden
          animate={{ y: [0, -22, 0], rotate: [0, 6, 0] }}
          transition={{ duration: b.d, repeat: Infinity, ease: 'easeInOut' }}
          className={`pointer-events-none absolute hidden opacity-15 lg:block ${b.c}`}
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
        <motion.div
          initial="hidden"
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.12 } } }}
          className="relative mx-auto flex max-w-4xl flex-col items-center gap-5 px-4 pb-14 pt-12 text-center sm:px-6"
        >
          <motion.span
            variants={{ hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { duration: 0.8, ease } } }}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-red-100 to-amber-100 px-4 py-2 text-sm font-bold text-red-800 dark:from-red-950/60 dark:to-amber-950/40 dark:text-red-300"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-70" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-600" />
            </span>
            {loading ? 'লোড হচ্ছে...' : `এই মুহূর্তে লাইভ · ${activeRequests.length}টি রিকোয়েস্ট`}
          </motion.span>
          <motion.h1
            variants={{ hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { duration: 0.8, ease } } }}
            className="text-4xl font-extrabold leading-[1.45] tracking-tight text-slate-900 dark:text-white sm:text-5xl lg:text-6xl"
          >
            চলমান{' '}
            <motion.span
              animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              style={{ backgroundSize: '220% 100%' }}
              className="inline-block pb-2 bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 bg-clip-text text-transparent"
            >
              ব্লাড রিকোয়েস্ট
            </motion.span>
          </motion.h1>
          <motion.p
            variants={{ hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { duration: 0.8, ease } } }}
            className="max-w-xl text-lg leading-relaxed text-slate-600 dark:text-slate-300"
          >
            এই মুহূর্তে যাদের রক্তের প্রয়োজন। আপনার একটি কল বা শেয়ার কারও জীবন বাঁচাতে পারে।
          </motion.p>
          <motion.div
            variants={{ hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { duration: 0.8, ease } } }}
            className="flex flex-wrap justify-center gap-3"
          >
            {[
              { icon: Layers, label: 'সক্রিয় অনুরোধ', value: activeRequests.length, color: 'text-red-600' },
              { icon: Droplet, label: 'ব্যাগ দরকার', value: totalBags, color: 'text-amber-600' },
              { icon: HeartHandshake, label: 'পূরণ হয়েছে', value: fulfilledRequests.length, color: 'text-emerald-600' },
            ].map((st) => (
              <div
                key={st.label}
                className="min-w-[8.5rem] rounded-2xl border border-orange-100 bg-white/80 px-5 py-3 text-left shadow-sm backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/70"
              >
                <st.icon className={`mb-1 h-4 w-4 ${st.color}`} />
                <div className={`text-2xl font-extrabold leading-none ${st.color}`}>
                  {loading ? '...' : <CountUp value={st.value} />}
                </div>
                <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">{st.label}</div>
              </div>
            ))}
          </motion.div>
          <motion.div
            variants={{ hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { duration: 0.8, ease } } }}
            whileHover={{ y: -3 }}
          >
            <Link
              href="/request-blood"
              className="relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-red-500 via-red-600 to-red-800 px-8 py-4 text-base font-bold text-white shadow-lg shadow-red-300/50 dark:shadow-none"
            >
              <motion.span
                aria-hidden
                animate={{ x: ['-150%', '350%'] }}
                transition={{ duration: 1.4, repeat: Infinity, repeatDelay: 2.4, ease: 'easeInOut' }}
                className="pointer-events-none absolute inset-y-0 w-1/3 -skew-x-[20deg] bg-gradient-to-r from-transparent via-white/60 to-transparent"
              />
              <Plus className="relative h-5 w-5" />
              <span className="relative">নতুন রক্তের অনুরোধ করুন</span>
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* ====== টিকার ====== */}
      {activeRequests.length > 0 && (
        <div className="relative overflow-hidden bg-gradient-to-r from-emerald-950 via-teal-900 to-red-900 py-3.5 text-base text-orange-50">
          <motion.div
            animate={{ x: ['0%', '-50%'] }}
            transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
            className="flex w-max gap-12 whitespace-nowrap px-6"
          >
            {[...activeRequests, ...activeRequests, ...activeRequests, ...activeRequests].map((r, i) => (
              <span key={i} className="inline-flex items-center gap-2.5">
                <b className="text-yellow-300">{r.blood_group}</b>
                {r.hospital_name} · {r.bags_needed} ব্যাগ
              </span>
            ))}
          </motion.div>
        </div>
      )}

      {/* ====== ফিল্টার ও কার্ড ====== */}
      <div className="relative z-10 mx-auto max-w-6xl px-4 pb-20 pt-10 sm:px-6">
        <div className="mb-8 flex flex-wrap justify-center gap-2.5">
          {BLOOD_GROUPS.map((bg) => {
            const active = group === bg;
            const style = bg === 'ALL' ? null : GROUP_STYLE[bg];
            return (
              <motion.button
                key={bg}
                onClick={() => setGroup(bg)}
                whileHover={{ y: -4, scale: 1.05 }}
                whileTap={{ scale: 0.94 }}
                className={`flex items-center gap-2 rounded-2xl py-2.5 pl-3 pr-4 text-sm font-extrabold transition-shadow ${
                  active
                    ? 'bg-gradient-to-r from-red-500 via-red-600 to-red-800 text-white shadow-lg shadow-red-300/50 dark:shadow-none'
                    : 'bg-white text-slate-700 shadow-sm shadow-orange-200/50 dark:bg-slate-800 dark:text-slate-200 dark:shadow-none'
                }`}
              >
                <span className={`h-5 w-5 rounded-full bg-gradient-to-br ${style ? style.dot : 'from-white/60 to-white/20'}`} />
                {bg === 'ALL' ? 'সব গ্রুপ' : bg}
                {bg !== 'ALL' && counts[bg] ? (
                  <span className={`rounded-full px-1.5 text-[10px] ${active ? 'bg-white/25' : 'bg-orange-100 dark:bg-slate-700'}`}>
                    {counts[bg]}
                  </span>
                ) : null}
              </motion.button>
            );
          })}
        </div>

        {loading ? (
          <div className="grid gap-7 md:grid-cols-2">
            {[1, 2].map((i) => (
              <div key={i} className="overflow-hidden rounded-[2rem] border border-orange-100 bg-white/80 p-6 dark:border-slate-800 dark:bg-slate-900/70">
                <div className="h-24 animate-pulse rounded-3xl bg-gradient-to-r from-orange-100 via-orange-50 to-orange-100 dark:from-slate-800 dark:via-slate-700 dark:to-slate-800" />
                <div className="mt-5 space-y-3">
                  <div className="h-5 w-2/3 animate-pulse rounded-full bg-orange-100 dark:bg-slate-800" />
                  <div className="h-4 w-full animate-pulse rounded-full bg-orange-50 dark:bg-slate-800" />
                  <div className="h-12 animate-pulse rounded-2xl bg-orange-100 dark:bg-slate-800" />
                </div>
              </div>
            ))}
          </div>
        ) : shown.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[2rem] border-2 border-dashed border-orange-200 bg-gradient-to-br from-white to-orange-50 px-6 py-16 text-center dark:border-slate-700 dark:from-slate-900 dark:to-slate-900"
          >
            <motion.div animate={{ y: [0, -12, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }} className="mx-auto mb-4 w-fit">
              <Droplet className="h-16 w-16 text-red-300" fill="currentColor" />
            </motion.div>
            <p className="text-lg font-bold text-slate-700 dark:text-slate-200">এই মুহূর্তে কোনো সক্রিয় রিকোয়েস্ট নেই।</p>
          </motion.div>
        ) : (
          <div className="grid gap-7 md:grid-cols-2">
            {shown.map((req, index) => (
              <motion.div
                key={req.id}
                initial={{ opacity: 0, y: 50, scale: 0.96 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.7, ease, delay: (index % 2) * 0.08 }}
              >
                <RequestCard request={req} onUpdate={loadRequests} />
              </motion.div>
            ))}
          </div>
        )}

        {/* ====== পূরণ হয়েছে ====== */}
        {fulfilledRequests.length > 0 && (
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="mt-16">
            <h2 className="mb-5 flex items-center gap-3 text-2xl font-extrabold text-slate-900 dark:text-white">
              <span className="h-8 w-2 rounded-full bg-gradient-to-b from-emerald-400 to-teal-900" />
              যাদের রক্ত পাওয়া গেছে
              <span className="rounded-full bg-gradient-to-r from-teal-700 to-emerald-500 px-3 py-0.5 text-sm text-white">
                {fulfilledRequests.length}
              </span>
            </h2>
            <div className="space-y-3">
              {fulfilledRequests.map((req) => {
                const style = GROUP_STYLE[req.blood_group] ?? GROUP_STYLE['O+'];
                return (
                  <div
                    key={req.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-emerald-200/80 bg-gradient-to-r from-emerald-50 to-white px-5 py-4 dark:border-emerald-900/40 dark:from-emerald-950/30 dark:to-slate-900"
                  >
                    <div className="flex items-center gap-4">
                      <span className={`flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br text-sm font-extrabold text-white ${style.grad}`}>
                        {req.blood_group}
                      </span>
                      <div>
                        <p className="text-lg font-bold text-slate-800 dark:text-slate-100">{req.patient_name}</p>
                        <p className="text-sm text-emerald-800/80 dark:text-emerald-400/80">{req.hospital_name}</p>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-teal-700 to-emerald-500 px-4 py-2 text-sm font-bold text-white">
                      <CheckCircle2 className="h-4 w-4" />
                      রক্ত পাওয়া গেছে
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.div>
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
                <h2 className="text-3xl font-extrabold leading-tight text-white sm:text-4xl">আপনিও কি রক্ত দিতে পারবেন?</h2>
                <p className="mt-2 text-lg text-red-50/90">ডোনার হিসেবে যুক্ত হোন, জরুরি অনুরোধ এলে আপনাকেই আগে জানানো হবে।</p>
              </div>
              <motion.div whileHover={{ scale: 1.06, y: -3 }} whileTap={{ scale: 0.96 }}>
                <Link
                  href="/register"
                  className="inline-block rounded-full bg-gradient-to-r from-yellow-300 to-amber-500 px-8 py-4 text-lg font-bold text-slate-900 shadow-xl"
                >
                  ডোনার হই
                </Link>
              </motion.div>
            </div>
          </motion.div>
        )}
      </div>
    </main>
  );
}

function RequestCard({ request, onUpdate }: { request: BloodRequest; onUpdate: () => void }) {
  const [marking, setMarking] = useState(false);
  const [copied, setCopied] = useState(false);
  const timeAgo = getTimeAgo(request.created_at);
  const style = GROUP_STYLE[request.blood_group] ?? GROUP_STYLE['A+'];
  const urgent = request.urgency_status === 'critical';
  const bags = Math.max(1, request.bags_needed || 1);

  async function handleMarkFulfilled() {
    setMarking(true);
    const supabase = createClient();
    await supabase.from('blood_requests').update({ urgency_status: 'fulfilled' }).eq('id', request.id);
    setMarking(false);
    onUpdate();
  }

  const shareText = `🩸 জরুরি রক্তের প্রয়োজন!\n\nরোগী: ${request.patient_name}\nব্লাড গ্রুপ: ${request.blood_group}\nহাসপাতাল: ${request.hospital_name}\nপ্রয়োজন: ${request.bags_needed} ব্যাগ\nযোগাযোগ: ${request.contact_phone}\n\nBloodConnect BD এর মাধ্যমে`;

  function handleWhatsAppShare() {
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
  }

  function handleFacebookShare() {
    const pageUrl = typeof window !== 'undefined' ? window.location.href : '';
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}&quote=${encodeURIComponent(shareText)}`,
      '_blank'
    );
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  }

  return (
    <motion.div
      whileHover={{ y: -10 }}
      className="group relative flex h-full flex-col overflow-hidden rounded-[2rem] border border-orange-100 bg-gradient-to-b from-white to-rose-50/60 shadow-lg shadow-red-200/30 transition-shadow hover:shadow-2xl hover:shadow-red-300/40 dark:border-slate-800 dark:from-slate-900 dark:to-slate-900 dark:shadow-none"
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
          style={{ backgroundImage: 'radial-gradient(circle at 12px 12px,#fff 2px,transparent 3px)', backgroundSize: '36px 36px' }}
        />
        {urgent ? (
          <span className="absolute left-5 top-5 inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-1.5 text-sm font-extrabold text-red-600 shadow-md">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-70" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-600" />
            </span>
            জরুরি
          </span>
        ) : (
          <span className="absolute left-5 top-5 rounded-full border border-white/40 bg-white/20 px-3.5 py-1.5 text-sm font-bold text-white backdrop-blur-md">
            সক্রিয়
          </span>
        )}
        <div className="absolute right-5 top-5 flex h-14 w-14 -rotate-45 items-center justify-center rounded-[50%_0_50%_50%] bg-white shadow-xl shadow-black/20">
          <span className={`rotate-45 text-lg font-extrabold ${style.text}`}>{request.blood_group}</span>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-6">
        <div>
          <h3 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">{request.patient_name}</h3>
          <p className="mt-1.5 flex items-start gap-2 text-[15px] text-slate-600 dark:text-slate-400">
            <Hospital className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
            <span className="break-words">{request.hospital_name}</span>
          </p>
        </div>

        {/* ব্যাগ ও সময় */}
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-gradient-to-r from-red-50 to-orange-50 px-4 py-3 dark:from-red-950/40 dark:to-slate-800">
          <span className="flex items-center gap-1">
            {Array.from({ length: Math.min(bags, 6) }).map((_, i) => (
              <Droplet key={i} className="h-[18px] w-[18px] text-red-600" fill="currentColor" />
            ))}
            <b className="ml-2 text-base text-red-900 dark:text-red-300">{request.bags_needed} ব্যাগ প্রয়োজন</b>
          </span>
          <span className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
            <Clock className="h-3.5 w-3.5" />
            {timeAgo}
          </span>
        </div>

        {request.patient_notes && (
          <div className="flex items-start gap-2.5 rounded-2xl border border-amber-200/80 bg-gradient-to-br from-amber-50 to-orange-50 px-4 py-3 text-[15px] leading-relaxed text-amber-950 dark:border-amber-900/40 dark:from-amber-950/30 dark:to-slate-800 dark:text-amber-200">
            <FileText className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
            <p>{request.patient_notes}</p>
          </div>
        )}

        <div className="mt-auto space-y-3 pt-1">
          <div className="grid grid-cols-[1.3fr_1fr] gap-3">
            <motion.a
              href={`tel:${request.contact_phone}`}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.96 }}
              className="relative flex items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-red-500 via-red-600 to-red-800 py-3.5 text-base font-extrabold text-white shadow-lg shadow-red-300/50 dark:shadow-none"
            >
              <motion.span
                aria-hidden
                animate={{ x: ['-150%', '350%'] }}
                transition={{ duration: 1.4, repeat: Infinity, repeatDelay: 2.4, ease: 'easeInOut' }}
                className="pointer-events-none absolute inset-y-0 w-1/3 -skew-x-[20deg] bg-gradient-to-r from-transparent via-white/60 to-transparent"
              />
              <Phone className="relative h-4 w-4" />
              <span className="relative">কল করুন</span>
            </motion.a>
            <motion.a
              href={`sms:${request.contact_phone}`}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.96 }}
              className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-100 to-orange-200 py-3.5 text-base font-extrabold text-amber-900 dark:from-slate-800 dark:to-slate-700 dark:text-amber-300"
            >
              <MessageSquare className="h-4 w-4" />
              SMS
            </motion.a>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            <button
              onClick={handleWhatsAppShare}
              className="inline-flex items-center justify-center gap-1.5 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-200 py-2.5 text-xs font-bold text-emerald-900 transition-transform hover:-translate-y-0.5 dark:from-emerald-950/60 dark:to-teal-950/40 dark:text-emerald-300"
            >
              <Share2 className="h-3.5 w-3.5" />
              WhatsApp
            </button>
            <button
              onClick={handleFacebookShare}
              className="inline-flex items-center justify-center gap-1.5 rounded-2xl bg-gradient-to-br from-sky-100 to-indigo-200 py-2.5 text-xs font-bold text-indigo-900 transition-transform hover:-translate-y-0.5 dark:from-sky-950/50 dark:to-indigo-950/40 dark:text-indigo-300"
            >
              <Share2 className="h-3.5 w-3.5" />
              Facebook
            </button>
            <button
              onClick={handleCopy}
              className="inline-flex items-center justify-center gap-1.5 rounded-2xl border-[1.5px] border-orange-100 bg-white py-2.5 text-xs font-bold text-slate-600 transition-transform hover:-translate-y-0.5 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? 'কপি হয়েছে' : 'কপি করুন'}
            </button>
          </div>

          <motion.button
            onClick={handleMarkFulfilled}
            disabled={marking}
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.97 }}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-teal-700 via-emerald-700 to-emerald-900 py-3.5 text-base font-extrabold text-white shadow-lg shadow-emerald-300/40 disabled:opacity-60 dark:shadow-none"
          >
            <CheckCircle2 className="h-4 w-4" />
            {marking ? 'আপডেট হচ্ছে...' : 'রক্ত পেয়ে গেছি ✓'}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

function getTimeAgo(dateString: string): string {
  const diffMs = Date.now() - new Date(dateString).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 60) return `${diffMins} মিনিট আগে`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} ঘণ্টা আগে`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} দিন আগে`;
}