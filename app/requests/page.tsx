'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, MessageSquare, Droplet, Hospital, Clock, FileText, CheckCircle2, Share2 } from 'lucide-react';

import { createClient } from '@/lib/supabase/client';
import Header from '@/components/Header';
import type { BloodRequest } from '@/types/database';

export default function RequestsPage() {
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <main className="min-h-screen pt-16 relative overflow-hidden bg-white dark:bg-slate-950 transition-colors">
      {/* Soft base gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-50/90 via-white to-rose-50/70 dark:from-red-950/20 dark:via-slate-950 dark:to-slate-950" />

      {/* Your Blood Splash Image */}
      <div
        className="absolute inset-0 opacity-[0.08] dark:opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `url('/blood-splash.png')`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center center',
          backgroundSize: 'cover',
        }}
      />

      {/* Extra soft lights */}
      <div className="absolute top-0 -left-20 w-96 h-96 bg-red-200/25 dark:bg-red-900/10 rounded-full blur-[110px]" />
      <div className="absolute bottom-0 -right-20 w-[30rem] h-[30rem] bg-rose-200/20 dark:bg-rose-900/10 rounded-full blur-[120px]" />

      <Header />

      <div className="relative z-10 mx-auto max-w-3xl px-4 py-10 sm:py-14">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10 text-center"
        >
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            চলমান ব্লাড রিকোয়েস্ট
          </h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400 text-sm">
            এই মুহূর্তে যাদের রক্তের প্রয়োজন
          </p>
        </motion.div>

        {/* Loading */}
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-red-200 dark:border-red-900 border-t-red-600 dark:border-t-red-500" />
            <p className="mt-4 text-slate-500 dark:text-slate-400 text-sm">লোড হচ্ছে...</p>
          </div>
        ) : activeRequests.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 bg-white/75 dark:bg-slate-900/75 backdrop-blur-xl rounded-3xl border border-white/80 dark:border-slate-800 shadow-sm"
          >
            <Droplet className="mx-auto h-12 w-12 text-red-300 dark:text-red-700 mb-4" />
            <p className="text-slate-500 dark:text-slate-400">এই মুহূর্তে কোনো সক্রিয় রিকোয়েস্ট নেই।</p>
          </motion.div>
        ) : (
          <div className="space-y-5">
            {activeRequests.map((req, index) => (
              <motion.div
                key={req.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08, type: 'spring', stiffness: 100 }}
              >
                <RequestCard request={req} onUpdate={loadRequests} />
              </motion.div>
            ))}
          </div>
        )}

        {/* Fulfilled Section */}
        {fulfilledRequests.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-14"
          >
            <h2 className="text-lg font-bold text-slate-400 dark:text-slate-500 mb-5 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              পূরণ হয়েছে ({fulfilledRequests.length})
            </h2>

            <div className="space-y-3">
              {fulfilledRequests.map((req) => (
                <div
                  key={req.id}
                  className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm p-4 flex items-center justify-between opacity-80"
                >
                  <div>
                    <p className="font-semibold text-slate-700 dark:text-slate-300">{req.patient_name}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{req.hospital_name}</p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-900 px-3 py-1.5 text-xs font-semibold text-green-700 dark:text-green-400">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    রক্ত পাওয়া গেছে
                  </span>
                </div>
              ))}
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

  async function handleMarkFulfilled() {
    setMarking(true);
    const supabase = createClient();
    await supabase
      .from('blood_requests')
      .update({ urgency_status: 'fulfilled' })
      .eq('id', request.id);
    setMarking(false);
    onUpdate();
  }

  const shareText = `🩸 জরুরি রক্তের প্রয়োজন!\n\nরোগী: ${request.patient_name}\nব্লাড গ্রুপ: ${request.blood_group}\nহাসপাতাল: ${request.hospital_name}\nপ্রয়োজন: ${request.bags_needed} ব্যাগ\nযোগাযোগ: ${request.contact_phone}\n\nBloodConnect BD এর মাধ্যমে`;

  function handleWhatsAppShare() {
    const url = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  }

  function handleFacebookShare() {
    const pageUrl = typeof window !== 'undefined' ? window.location.href : '';
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}&quote=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
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
    <div className="relative bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border border-white/80 dark:border-slate-800 rounded-3xl shadow-[0_8px_30px_-10px_rgba(220,38,38,0.12)] dark:shadow-none p-6 overflow-hidden">
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-red-100/40 dark:bg-red-950/30 rounded-full blur-2xl" />

      <div className="relative">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{request.patient_name}</h3>
            <p className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 mt-1">
              <Hospital className="h-4 w-4 text-slate-400 dark:text-slate-500" />
              {request.hospital_name}
            </p>
          </div>

          <div className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-red-500 to-rose-500 px-3.5 py-1.5 text-sm font-bold text-white shadow-md shadow-red-200 dark:shadow-none">
            <Droplet className="h-4 w-4" fill="currentColor" />
            {request.blood_group}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-slate-600 dark:text-slate-300">
          <span className="font-medium">{request.bags_needed} ব্যাগ প্রয়োজন</span>
          <span className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500">
            <Clock className="h-3.5 w-3.5" />
            {timeAgo}
          </span>
        </div>

        {request.patient_notes && (
          <div className="mt-4 flex items-start gap-2.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 px-4 py-3 text-sm text-slate-700 dark:text-slate-300">
            <FileText className="h-4 w-4 shrink-0 mt-0.5 text-slate-400 dark:text-slate-500" />
            <p className="leading-relaxed">{request.patient_notes}</p>
          </div>
        )}

        {/* Buttons */}
        <div className="mt-5 grid grid-cols-2 gap-3">
          <a
            href={`tel:${request.contact_phone}`}
            className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-red-300/50 dark:shadow-none transition-all duration-300 hover:shadow-xl hover:shadow-red-300/60 hover:-translate-y-0.5"
          >
            <Phone className="h-4 w-4" />
            কল করুন
          </a>

          <a
            href={`sms:${request.contact_phone}`}
            className="group inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-red-200 dark:border-red-900/60 bg-white/90 dark:bg-slate-800/90 py-3.5 text-sm font-semibold text-red-600 dark:text-red-400 transition-all duration-300 hover:border-red-300 dark:hover:border-red-700 hover:bg-red-50 dark:hover:bg-red-950/40 hover:-translate-y-0.5 hover:shadow-md"
          >
            <MessageSquare className="h-4 w-4 transition-transform group-hover:scale-110" />
            SMS
          </a>
        </div>

        {/* Share row */}
        <div className="mt-3 flex items-center gap-2">
          <button
            onClick={handleWhatsAppShare}
            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-2xl border-2 border-emerald-200 dark:border-emerald-900/60 bg-white/90 dark:bg-slate-800/90 py-2.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 transition-all duration-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:border-emerald-300 hover:-translate-y-0.5"
          >
            <Share2 className="h-3.5 w-3.5" />
            WhatsApp
          </button>
          <button
            onClick={handleFacebookShare}
            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-2xl border-2 border-blue-200 dark:border-blue-900/60 bg-white/90 dark:bg-slate-800/90 py-2.5 text-xs font-semibold text-blue-700 dark:text-blue-400 transition-all duration-300 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:border-blue-300 hover:-translate-y-0.5"
          >
            <Share2 className="h-3.5 w-3.5" />
            Facebook
          </button>
          <button
            onClick={handleCopy}
            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-800/90 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300 transition-all duration-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-300 hover:-translate-y-0.5"
          >
            {copied ? 'কপি হয়েছে ✓' : 'কপি করুন'}
          </button>
        </div>

        <button
          onClick={handleMarkFulfilled}
          disabled={marking}
          className="mt-3 group w-full inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/70 dark:bg-emerald-950/30 py-3.5 text-sm font-semibold text-emerald-700 dark:text-emerald-400 transition-all duration-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 hover:border-emerald-300 hover:-translate-y-0.5 hover:shadow-md disabled:opacity-60"
        >
          <CheckCircle2 className="h-4 w-4 transition-transform group-hover:scale-110" />
          {marking ? 'আপডেট হচ্ছে...' : 'রক্ত পেয়ে গেছি ✓'}
        </button>
      </div>
    </div>
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