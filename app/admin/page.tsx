'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Users,
  FileText,
  Trash2,
  Search,
  ShieldCheck,
  X,
  Activity,
  Lock,
  KeyRound,
  RefreshCw,
  Download,
  LogOut,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Phone,
  MapPin,
  Droplets,
  UserCheck,
  UserX,
  CalendarPlus,
  RotateCcw,
  Ban,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '@/components/Header';
import type { Donor, BloodRequest, UrgencyStatus } from '@/types/database';

const GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const STATUS_META: Record<UrgencyStatus, { label: string; cls: string }> = {
  critical: { label: 'অতি জরুরি', cls: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30' },
  urgent: { label: 'জরুরি', cls: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/30' },
  moderate: { label: 'সাধারণ', cls: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30' },
  fulfilled: { label: 'পূরণ হয়েছে', cls: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' },
  expired: { label: 'মেয়াদোত্তীর্ণ', cls: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/30' },
};

const isOpen = (s: string) => s !== 'fulfilled' && s !== 'expired';

const bn = (n: number) => n.toLocaleString('bn-BD');

function fmtDate(iso?: string | null) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('bn-BD', { day: 'numeric', month: 'short', year: 'numeric' });
}

function timeAgo(iso?: string | null) {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  if (isNaN(diff)) return '';
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'এইমাত্র';
  if (m < 60) return `${bn(m)} মিনিট আগে`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${bn(h)} ঘণ্টা আগে`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${bn(d)} দিন আগে`;
  return fmtDate(iso);
}

function csvCell(v: unknown) {
  let s = v === null || v === undefined ? '' : String(v);
  if (/^[=+\-@]/.test(s)) s = "'" + s; // এক্সেলে ফর্মুলা ইনজেকশন ঠেকাতে
  return `"${s.replace(/"/g, '""')}"`;
}

function downloadCsv(filename: string, rows: unknown[][]) {
  const csv = '﻿' + rows.map((r) => r.map(csvCell).join(',')).join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

type Toast = { kind: 'ok' | 'err'; text: string } | null;
type ConfirmTarget = { id: string; type: 'donor' | 'request'; name: string } | null;

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  const [activeTab, setActiveTab] = useState<'donors' | 'requests'>('donors');
  const [donors, setDonors] = useState<Donor[]>([]);
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshedAt, setRefreshedAt] = useState<Date | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [groupFilter, setGroupFilter] = useState<string>('all');
  const [donorFilter, setDonorFilter] = useState<'all' | 'available' | 'unavailable'>('all');
  const [requestFilter, setRequestFilter] = useState<'all' | 'open' | 'fulfilled' | 'expired'>('all');

  const [deleteTarget, setDeleteTarget] = useState<ConfirmTarget>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [toast, setToast] = useState<Toast>(null);

  function showToast(kind: 'ok' | 'err', text: string) {
    setToast({ kind, text });
    setTimeout(() => setToast(null), 3000);
  }

  const logout = useCallback(() => {
    try {
      sessionStorage.removeItem('admin_key');
    } catch {}
    setIsAuthenticated(false);
    setPassword('');
  }, []);

  const api = useCallback(async (action: string, extra: Record<string, unknown> = {}, pw?: string) => {
    let key = pw;
    if (!key) {
      try {
        key = sessionStorage.getItem('admin_key') ?? '';
      } catch {
        key = '';
      }
    }
    return fetch('/api/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: key, action, ...extra }),
    });
  }, []);

  useEffect(() => {
    async function checkSession() {
      let saved: string | null = null;
      try {
        saved = sessionStorage.getItem('admin_key');
      } catch {}
      if (!saved) return;
      const res = await api('verify', {}, saved);
      if (res.ok) setIsAuthenticated(true);
      else {
        try {
          sessionStorage.removeItem('admin_key');
        } catch {}
      }
    }
    checkSession();
  }, [api]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const res = await api('list');
    if (res.ok) {
      const json = await res.json();
      setDonors(json.donors ?? []);
      setRequests(json.requests ?? []);
      setRefreshedAt(new Date());
    } else {
      logout();
    }
    setLoading(false);
  }, [api, logout]);

  useEffect(() => {
    if (isAuthenticated) fetchData();
  }, [isAuthenticated, fetchData]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoggingIn(true);
    setPasswordError('');
    const res = await api('verify', {}, password);
    setLoggingIn(false);
    if (res.ok) {
      try {
        sessionStorage.setItem('admin_key', password);
      } catch {}
      setIsAuthenticated(true);
    } else if (res.status === 429) {
      setPasswordError('অনেকবার ভুল হয়েছে। ১০ মিনিট পরে আবার চেষ্টা করুন।');
    } else {
      setPasswordError('ভুল পাসওয়ার্ড! আবার চেষ্টা করুন।');
    }
  };

  async function handleDelete() {
    if (!deleteTarget) return;
    const target = deleteTarget;
    setBusyId(target.id);
    const res = await api(target.type === 'donor' ? 'delete-donor' : 'delete-request', { id: target.id });
    setBusyId(null);
    setDeleteTarget(null);
    if (!res.ok) {
      showToast('err', 'মুছে ফেলা যায়নি। আবার লগইন করে চেষ্টা করুন।');
      return;
    }
    if (target.type === 'donor') setDonors((p) => p.filter((d) => d.id !== target.id));
    else setRequests((p) => p.filter((r) => r.id !== target.id));
    showToast('ok', 'সফলভাবে মুছে ফেলা হয়েছে।');
  }

  async function toggleDonor(d: Donor) {
    setBusyId(d.id);
    const next = !d.is_available;
    const res = await api('set-donor-available', { id: d.id, available: next });
    setBusyId(null);
    if (!res.ok) return showToast('err', 'পরিবর্তন করা যায়নি।');
    setDonors((p) => p.map((x) => (x.id === d.id ? { ...x, is_available: next } : x)));
    showToast('ok', next ? 'ডোনারকে "প্রস্তুত" করা হয়েছে।' : 'ডোনারকে "অনুপলব্ধ" করা হয়েছে।');
  }

  async function setStatus(r: BloodRequest, status: UrgencyStatus) {
    setBusyId(r.id);
    const res = await api('set-request-status', { id: r.id, status });
    setBusyId(null);
    if (!res.ok) return showToast('err', 'স্ট্যাটাস বদলানো যায়নি।');
    setRequests((p) => p.map((x) => (x.id === r.id ? { ...x, urgency_status: status } : x)));
    showToast('ok', 'স্ট্যাটাস আপডেট হয়েছে।');
  }

  // ---------- হিসাব ----------
  const stats = useMemo(() => {
    const weekAgo = Date.now() - 7 * 24 * 3600 * 1000;
    const availableDonors = donors.filter((d) => d.is_available).length;
    const newDonors = donors.filter((d) => new Date(d.created_at).getTime() > weekAgo).length;
    const openReq = requests.filter((r) => isOpen(r.urgency_status)).length;
    const fulfilled = requests.filter((r) => r.urgency_status === 'fulfilled').length;
    const perGroup = GROUPS.map((g) => ({
      g,
      avail: donors.filter((d) => d.blood_group === g && d.is_available).length,
      total: donors.filter((d) => d.blood_group === g).length,
      need: requests.filter((r) => r.blood_group === g && isOpen(r.urgency_status)).length,
    }));
    return { availableDonors, newDonors, openReq, fulfilled, perGroup };
  }, [donors, requests]);

  const q = searchQuery.trim().toLowerCase();

  const filteredDonors = useMemo(
    () =>
      donors.filter((d) => {
        if (groupFilter !== 'all' && d.blood_group !== groupFilter) return false;
        if (donorFilter === 'available' && !d.is_available) return false;
        if (donorFilter === 'unavailable' && d.is_available) return false;
        if (!q) return true;
        return (
          (d.full_name || '').toLowerCase().includes(q) ||
          String(d.phone || '').includes(q) ||
          (d.email || '').toLowerCase().includes(q) ||
          (d.blood_group || '').toLowerCase().includes(q) ||
          (d.address || '').toLowerCase().includes(q)
        );
      }),
    [donors, q, groupFilter, donorFilter]
  );

  const filteredRequests = useMemo(
    () =>
      requests.filter((r) => {
        if (groupFilter !== 'all' && r.blood_group !== groupFilter) return false;
        if (requestFilter === 'open' && !isOpen(r.urgency_status)) return false;
        if (requestFilter === 'fulfilled' && r.urgency_status !== 'fulfilled') return false;
        if (requestFilter === 'expired' && r.urgency_status !== 'expired') return false;
        if (!q) return true;
        return (
          (r.patient_name || '').toLowerCase().includes(q) ||
          String(r.contact_phone || '').includes(q) ||
          (r.hospital_name || '').toLowerCase().includes(q) ||
          (r.blood_group || '').toLowerCase().includes(q)
        );
      }),
    [requests, q, groupFilter, requestFilter]
  );

  function exportCsv() {
    const stamp = new Date().toISOString().slice(0, 10);
    if (activeTab === 'donors') {
      downloadCsv(`donors-${stamp}.csv`, [
        ['নাম', 'ব্লাড গ্রুপ', 'ফোন', 'ইমেইল', 'ঠিকানা', 'প্রস্তুত', 'শেষ রক্তদান', 'রেজিস্ট্রেশন'],
        ...filteredDonors.map((d) => [
          d.full_name,
          d.blood_group,
          d.phone,
          d.email,
          d.address,
          d.is_available ? 'হ্যাঁ' : 'না',
          d.last_donation_date,
          d.created_at,
        ]),
      ]);
    } else {
      downloadCsv(`requests-${stamp}.csv`, [
        ['রোগী', 'ব্লাড গ্রুপ', 'ব্যাগ', 'হাসপাতাল', 'ফোন', 'অবস্থা', 'নোট', 'সময়'],
        ...filteredRequests.map((r) => [
          r.patient_name,
          r.blood_group,
          r.bags_needed,
          r.hospital_name,
          r.contact_phone,
          STATUS_META[r.urgency_status]?.label ?? r.urgency_status,
          r.patient_notes,
          r.created_at,
        ]),
      ]);
    }
  }

  const shell =
    'min-h-screen pt-16 bg-gradient-to-br from-slate-50 via-rose-50/30 to-indigo-50/40 dark:from-slate-900 dark:via-indigo-950 dark:to-slate-900 text-slate-900 dark:text-slate-100 transition-colors';

  // ---------- লগইন ----------
  if (!isAuthenticated) {
    return (
      <main className={`${shell} flex items-center justify-center p-4`}>
        <Header />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border border-slate-200 dark:border-white/10 rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-6"
        >
          <div className="text-center space-y-2">
            <div className="inline-flex p-3 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 mb-2">
              <Lock className="h-8 w-8" />
            </div>
            <h1 className="text-2xl font-black leading-[1.4] text-slate-900 dark:text-white">অ্যাডমিন লগইন</h1>
            <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              শুধু অ্যাডমিনের জন্য। পাসওয়ার্ড দিয়ে প্রবেশ করুন।
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1">
              <div className="relative">
                <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="অ্যাডমিন পাসওয়ার্ড লিখুন..."
                  className="w-full pl-11 pr-4 py-3 text-sm bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/40"
                  required
                />
              </div>
              {passwordError && <p className="text-xs text-rose-500 font-semibold pl-2">{passwordError}</p>}
            </div>
            <button
              type="submit"
              disabled={loggingIn}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-red-500 hover:from-rose-500 hover:to-red-400 disabled:opacity-60 text-white text-sm font-bold shadow-lg shadow-rose-600/30 transition-all"
            >
              {loggingIn ? 'যাচাই হচ্ছে...' : 'প্রবেশ করুন'}
            </button>
          </form>
        </motion.div>
      </main>
    );
  }

  const statCards = [
    { label: 'মোট ডোনার', value: donors.length, sub: `${bn(stats.availableDonors)} জন প্রস্তুত`, icon: Users, grad: 'from-rose-500 to-red-600' },
    { label: 'এই সপ্তাহে নতুন', value: stats.newDonors, sub: 'গত ৭ দিনে যোগ', icon: CalendarPlus, grad: 'from-sky-500 to-blue-600' },
    { label: 'চলমান রিকোয়েস্ট', value: stats.openReq, sub: `মোট ${bn(requests.length)} টি`, icon: Clock, grad: 'from-amber-500 to-orange-600' },
    { label: 'পূরণ হয়েছে', value: stats.fulfilled, sub: 'সফল রক্ত সংগ্রহ', icon: CheckCircle2, grad: 'from-emerald-500 to-green-600' },
  ];

  const chip = (active: boolean) =>
    `shrink-0 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
      active
        ? 'bg-rose-600 border-rose-600 text-white shadow-md shadow-rose-600/25'
        : 'bg-white/80 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:border-rose-300 dark:hover:border-rose-500/40'
    }`;

  const maxBar = Math.max(1, ...stats.perGroup.map((x) => Math.max(x.avail, x.need)));

  return (
    <main className={`${shell} relative overflow-hidden`}>
      <div className="absolute top-10 left-10 w-96 h-96 bg-rose-500/10 dark:bg-rose-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[30rem] h-[30rem] bg-indigo-500/10 dark:bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

      <Header />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* শিরোনাম */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white/80 dark:bg-white/5 backdrop-blur-2xl p-5 sm:p-7 rounded-3xl border border-slate-200/80 dark:border-white/10 shadow-xl">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold">
              <ShieldCheck className="h-3.5 w-3.5" />
              কন্ট্রোল প্যানেল
            </div>
            <h1 className="text-2xl sm:text-3xl font-black leading-[1.4] text-slate-900 dark:text-white">অ্যাডমিন ড্যাশবোর্ড</h1>
            <p className="text-xs sm:text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              ডোনার ও রক্তের অনুরোধ এক জায়গা থেকে দেখুন ও পরিচালনা করুন
              {refreshedAt && <span> · সর্বশেষ আপডেট {refreshedAt.toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })}</span>}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchData}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/10 disabled:opacity-60"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              রিফ্রেশ
            </button>
            <button
              onClick={logout}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-rose-200 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-500/10 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-500/20"
            >
              <LogOut className="h-4 w-4" />
              লগআউট
            </button>
          </div>
        </div>

        {/* পরিসংখ্যান */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {statCards.map((c) => (
            <div key={c.label} className="relative overflow-hidden rounded-2xl p-4 sm:p-5 bg-white/80 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 shadow-md">
              <div className={`absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br ${c.grad} opacity-15`} />
              <div className={`inline-flex p-2 rounded-xl bg-gradient-to-br ${c.grad} text-white shadow-md`}>
                <c.icon className="h-4 w-4" />
              </div>
              <p className="mt-3 text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">{loading ? '…' : bn(c.value)}</p>
              <p className="text-xs font-bold text-slate-600 dark:text-slate-300 mt-0.5">{c.label}</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{c.sub}</p>
            </div>
          ))}
        </div>

        {/* ব্লাড গ্রুপ অনুযায়ী চাহিদা বনাম ডোনার */}
        <div className="rounded-3xl p-5 sm:p-6 bg-white/80 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 shadow-md">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <h2 className="text-base font-black leading-[1.5] flex items-center gap-2">
              <Droplets className="h-5 w-5 text-rose-600" />
              ব্লাড গ্রুপ অনুযায়ী চাহিদা ও প্রস্তুত ডোনার
            </h2>
            <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />প্রস্তুত ডোনার</span>
              <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-rose-500" />চলমান চাহিদা</span>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {stats.perGroup.map((x) => {
              const short = x.need > x.avail;
              return (
                <button
                  key={x.g}
                  onClick={() => setGroupFilter(groupFilter === x.g ? 'all' : x.g)}
                  className={`text-left rounded-2xl p-3 border transition-all ${
                    groupFilter === x.g
                      ? 'border-rose-500 bg-rose-50 dark:bg-rose-500/10'
                      : 'border-slate-200 dark:border-white/10 hover:border-rose-300 dark:hover:border-rose-500/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-black text-rose-600 dark:text-rose-400">{x.g}</span>
                    {short && <AlertTriangle className="h-4 w-4 text-amber-500" aria-label="ডোনার কম" />}
                  </div>
                  <div className="mt-2 space-y-1.5">
                    <div className="h-1.5 rounded-full bg-slate-100 dark:bg-white/10 overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(x.avail / maxBar) * 100}%` }} />
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-100 dark:bg-white/10 overflow-hidden">
                      <div className="h-full bg-rose-500 rounded-full" style={{ width: `${(x.need / maxBar) * 100}%` }} />
                    </div>
                  </div>
                  <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
                    {bn(x.avail)} প্রস্তুত · {bn(x.need)} চাহিদা
                  </p>
                </button>
              );
            })}
          </div>
          <p className="mt-3 text-[11px] text-slate-500 dark:text-slate-400">
            ⚠ চিহ্ন মানে ওই গ্রুপে চাহিদা প্রস্তুত ডোনারের চেয়ে বেশি। গ্রুপে চাপ দিলে নিচের তালিকা ফিল্টার হবে।
          </p>
        </div>

        {/* ট্যাব + সার্চ + এক্সপোর্ট */}
        <div className="flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">
          <div className="flex items-center gap-1.5 bg-white/80 dark:bg-slate-900/80 p-1.5 rounded-2xl border border-slate-200 dark:border-white/10 w-full lg:w-auto shadow-sm">
            {(
              [
                { k: 'donors', label: 'ডোনার', n: donors.length, icon: Users },
                { k: 'requests', label: 'রিকোয়েস্ট', n: requests.length, icon: FileText },
              ] as const
            ).map((t) => (
              <button
                key={t.k}
                onClick={() => setActiveTab(t.k)}
                className={`flex-1 lg:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  activeTab === t.k
                    ? 'bg-gradient-to-r from-rose-600 to-red-500 text-white shadow-lg shadow-rose-600/30'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
                }`}
              >
                <t.icon className="h-4 w-4" />
                {t.label} ({bn(t.n)})
              </button>
            ))}
          </div>

          <div className="flex gap-2 w-full lg:w-auto">
            <div className="relative flex-1 lg:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={activeTab === 'donors' ? 'নাম, ফোন, ইমেইল, ঠিকানা...' : 'রোগী, হাসপাতাল, ফোন...'}
                className="w-full pl-11 pr-4 py-3 text-sm bg-white/90 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/40"
              />
            </div>
            <button
              onClick={exportCsv}
              disabled={loading || (activeTab === 'donors' ? !filteredDonors.length : !filteredRequests.length)}
              className="inline-flex items-center gap-2 px-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/10 disabled:opacity-50"
              title="বর্তমান তালিকা CSV হিসেবে নামান"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">CSV</span>
            </button>
          </div>
        </div>

        {/* ফিল্টার */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          {activeTab === 'donors'
            ? (
                [
                  ['all', 'সব'],
                  ['available', 'প্রস্তুত'],
                  ['unavailable', 'অনুপলব্ধ'],
                ] as const
              ).map(([k, l]) => (
                <button key={k} onClick={() => setDonorFilter(k)} className={chip(donorFilter === k)}>
                  {l}
                </button>
              ))
            : (
                [
                  ['all', 'সব'],
                  ['open', 'চলমান'],
                  ['fulfilled', 'পূরণ হয়েছে'],
                  ['expired', 'মেয়াদোত্তীর্ণ'],
                ] as const
              ).map(([k, l]) => (
                <button key={k} onClick={() => setRequestFilter(k)} className={chip(requestFilter === k)}>
                  {l}
                </button>
              ))}
          <span className="shrink-0 w-px bg-slate-200 dark:bg-white/10 mx-1" />
          <button onClick={() => setGroupFilter('all')} className={chip(groupFilter === 'all')}>
            সব গ্রুপ
          </button>
          {GROUPS.map((g) => (
            <button key={g} onClick={() => setGroupFilter(groupFilter === g ? 'all' : g)} className={chip(groupFilter === g)}>
              {g}
            </button>
          ))}
        </div>

        {/* তালিকা */}
        <div className="rounded-3xl bg-white/80 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 shadow-xl overflow-hidden">
          {loading ? (
            <div className="text-center py-20">
              <Activity className="h-8 w-8 text-rose-600 animate-spin mx-auto mb-3" />
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">তথ্য লোড করা হচ্ছে...</p>
            </div>
          ) : activeTab === 'donors' ? (
            filteredDonors.length === 0 ? (
              <div className="p-16 text-center text-slate-500 dark:text-slate-400 text-sm">কোনো ডোনার পাওয়া যায়নি।</div>
            ) : (
              <ul className="divide-y divide-slate-100 dark:divide-white/5">
                {filteredDonors.map((d) => (
                  <li key={d.id} className="p-4 sm:px-6 flex flex-col md:flex-row md:items-center gap-3 md:gap-5 hover:bg-slate-50/70 dark:hover:bg-white/5 transition-colors">
                    <div className="flex items-center gap-3 md:w-[28%] min-w-0">
                      {d.photo_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={d.photo_url} alt="" className="h-11 w-11 rounded-full object-cover shrink-0 border border-slate-200 dark:border-white/10" />
                      ) : (
                        <div className="h-11 w-11 rounded-full bg-gradient-to-br from-rose-500 to-red-600 text-white font-bold flex items-center justify-center shrink-0">
                          {d.full_name?.charAt(0).toUpperCase() || 'D'}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-bold leading-[1.5] truncate text-slate-900 dark:text-white">{d.full_name || 'নাম নেই'}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{d.email || 'ইমেইল নেই'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 md:w-[12%]">
                      <span className="px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30 text-xs font-black">
                        {d.blood_group}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-bold ${
                          d.is_available ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'
                        }`}
                      >
                        <span className={`h-2 w-2 rounded-full ${d.is_available ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                        {d.is_available ? 'প্রস্তুত' : 'অনুপলব্ধ'}
                      </span>
                    </div>

                    <div className="md:flex-1 min-w-0 space-y-0.5 text-xs text-slate-600 dark:text-slate-300">
                      <a href={`tel:${d.phone}`} className="inline-flex items-center gap-1.5 font-mono hover:text-rose-600">
                        <Phone className="h-3.5 w-3.5 shrink-0" />
                        {d.phone}
                      </a>
                      <p className="flex items-start gap-1.5 leading-[1.6]">
                        <MapPin className="h-3.5 w-3.5 shrink-0 mt-1" />
                        <span className="line-clamp-2">{d.address || '—'}</span>
                      </p>
                    </div>

                    <div className="text-[11px] text-slate-500 dark:text-slate-400 md:w-[14%] leading-[1.6]">
                      <p>যোগ: {timeAgo(d.created_at)}</p>
                      <p>শেষ দান: {fmtDate(d.last_donation_date)}</p>
                    </div>

                    <div className="flex items-center gap-2 md:justify-end">
                      <button
                        onClick={() => toggleDonor(d)}
                        disabled={busyId === d.id}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 disabled:opacity-50"
                      >
                        {d.is_available ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                        {d.is_available ? 'অনুপলব্ধ করুন' : 'প্রস্তুত করুন'}
                      </button>
                      <button
                        onClick={() => setDeleteTarget({ id: d.id, type: 'donor', name: d.full_name })}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/15"
                        aria-label="মুছুন"
                      >
                        <Trash2 className="h-4 w-4" />
                        মুছুন
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )
          ) : filteredRequests.length === 0 ? (
            <div className="p-16 text-center text-slate-500 dark:text-slate-400 text-sm">কোনো রিকোয়েস্ট পাওয়া যায়নি।</div>
          ) : (
            <ul className="divide-y divide-slate-100 dark:divide-white/5">
              {filteredRequests.map((r) => {
                const meta = STATUS_META[r.urgency_status] ?? STATUS_META.moderate;
                return (
                  <li key={r.id} className="p-4 sm:px-6 flex flex-col md:flex-row md:items-center gap-3 md:gap-5 hover:bg-slate-50/70 dark:hover:bg-white/5 transition-colors">
                    <div className="flex items-center gap-3 md:w-[26%] min-w-0">
                      <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-rose-500 to-red-600 text-white font-black flex items-center justify-center shrink-0 text-sm">
                        {r.blood_group}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold leading-[1.5] truncate text-slate-900 dark:text-white">{r.patient_name || 'নাম নেই'}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          {bn(r.bags_needed ?? 1)} ব্যাগ · {timeAgo(r.created_at)}
                        </p>
                      </div>
                    </div>

                    <div className="md:w-[13%]">
                      <span className={`inline-block px-3 py-1 rounded-full border text-[11px] font-bold ${meta.cls}`}>{meta.label}</span>
                    </div>

                    <div className="md:flex-1 min-w-0 space-y-0.5 text-xs text-slate-600 dark:text-slate-300">
                      <p className="flex items-start gap-1.5 leading-[1.6]">
                        <MapPin className="h-3.5 w-3.5 shrink-0 mt-1" />
                        <span className="line-clamp-2">{r.hospital_name || '—'}</span>
                      </p>
                      <a href={`tel:${r.contact_phone}`} className="inline-flex items-center gap-1.5 font-mono hover:text-rose-600">
                        <Phone className="h-3.5 w-3.5 shrink-0" />
                        {r.contact_phone || '—'}
                      </a>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 md:justify-end">
                      {isOpen(r.urgency_status) ? (
                        <>
                          <button
                            onClick={() => setStatus(r, 'fulfilled')}
                            disabled={busyId === r.id}
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/20 disabled:opacity-50"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                            পূরণ হয়েছে
                          </button>
                          <button
                            onClick={() => setStatus(r, 'expired')}
                            disabled={busyId === r.id}
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 disabled:opacity-50"
                          >
                            <Ban className="h-4 w-4" />
                            মেয়াদ শেষ
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => setStatus(r, 'urgent')}
                          disabled={busyId === r.id}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 disabled:opacity-50"
                        >
                          <RotateCcw className="h-4 w-4" />
                          আবার চালু করুন
                        </button>
                      )}
                      <button
                        onClick={() => setDeleteTarget({ id: r.id, type: 'request', name: r.patient_name || 'রক্তের রিকোয়েস্ট' })}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/15"
                        aria-label="মুছুন"
                      >
                        <Trash2 className="h-4 w-4" />
                        মুছুন
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        <p className="text-center text-[11px] text-slate-400">
          দেখাচ্ছে {bn(activeTab === 'donors' ? filteredDonors.length : filteredRequests.length)} টি ফলাফল
        </p>
      </div>

      {/* মুছে ফেলার নিশ্চিতকরণ */}
      <AnimatePresence>
        {deleteTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 dark:bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-3">
                <h3 className="text-base font-bold leading-[1.5] text-slate-900 dark:text-white flex items-center gap-2">
                  <Trash2 className="h-5 w-5 text-rose-600" />
                  মুছে ফেলার নিশ্চিতকরণ
                </h3>
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg"
                  aria-label="বন্ধ করুন"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-[1.8]">
                আপনি কি নিশ্চিতভাবে <span className="font-bold text-rose-600 dark:text-rose-400">&quot;{deleteTarget.name}&quot;</span> মুছে ফেলতে চান?
                {deleteTarget.type === 'donor' && ' ডোনারের লগইন একাউন্টও মুছে যাবে।'} এটি আর ফেরত আনা যাবে না।
              </p>
              <div className="flex gap-3 pt-1">
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="flex-1 py-3 rounded-2xl border border-slate-200 dark:border-white/10 text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10"
                >
                  বাতিল
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-red-500 hover:from-rose-500 hover:to-red-400 text-white text-sm font-bold shadow-lg shadow-rose-600/30"
                >
                  হ্যাঁ, মুছুন
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* টোস্ট */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] px-5 py-3 rounded-2xl text-sm font-bold shadow-2xl text-white ${
              toast.kind === 'ok' ? 'bg-emerald-600' : 'bg-rose-600'
            }`}
          >
            {toast.text}
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}