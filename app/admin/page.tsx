'use client';

import { useEffect, useState } from 'react';
import { 
  Users, 
  FileText, 
  Trash2, 
  Search, 
  ShieldCheck, 
  Sparkles,
  X,
  Activity,
  Lock,
  KeyRound
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import Header from '@/components/Header';
import type { Donor, BloodRequest } from '@/types/database';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState(false);

  const [activeTab, setActiveTab] = useState<'donors' | 'requests'>('donors');
  const [donors, setDonors] = useState<Donor[]>([]);
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; type: 'donor' | 'request'; name: string } | null>(null);

  useEffect(() => {
    const authStatus = sessionStorage.getItem('admin_authenticated');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const ADMIN_PASSWORD = 'Tarikul2007@#';

    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      sessionStorage.setItem('admin_authenticated', 'true');
      setPasswordError(false);
    } else {
      setPasswordError(true);
    }
  };

  async function fetchData() {
    setLoading(true);
    const supabase = createClient();

    const [donorsRes, requestsRes] = await Promise.all([
      supabase.from('donors').select('*').order('created_at', { ascending: false }),
      supabase.from('blood_requests').select('*').order('created_at', { ascending: false })
    ]);

    setDonors(donorsRes.data ?? []);
    setRequests(requestsRes.data ?? []);
    setLoading(false);
  }

  async function handleDelete() {
    if (!deleteTarget) return;

    const supabase = createClient();
    if (deleteTarget.type === 'donor') {
      await supabase.from('donors').delete().eq('id', deleteTarget.id);
      setDonors((prev) => prev.filter((d) => d.id !== deleteTarget.id));
    } else {
      await supabase.from('blood_requests').delete().eq('id', deleteTarget.id);
      setRequests((prev) => prev.filter((r) => r.id !== deleteTarget.id));
    }

    setDeleteTarget(null);
  }

  const filteredDonors = donors.filter(
    (d: any) =>
      d.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.phone?.includes(searchQuery) ||
      d.blood_group?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.location?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredRequests = requests.filter(
    (r: any) =>
      r.patient_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.phone?.toString().includes(searchQuery) ||
      r.blood_group?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen pt-16 bg-gradient-to-br from-slate-50 via-rose-50/30 to-indigo-50/40 dark:from-slate-900 dark:via-indigo-950 dark:to-slate-900 text-slate-900 dark:text-slate-100 flex items-center justify-center p-4 transition-colors">
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
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">অ্যাডমিন লগইন</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              অ্যাডমিন প্যানেলে প্রবেশ করতে সঠিক পাসওয়ার্ড দিন।
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
                  className="w-full pl-11 pr-4 py-3 text-sm bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/50 transition-all"
                  required
                />
              </div>
              {passwordError && (
                <p className="text-xs text-rose-500 font-semibold pl-2">ভুল পাসওয়ার্ড! আবার চেষ্টা করুন।</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-red-500 hover:from-rose-500 hover:to-red-400 text-white text-sm font-bold shadow-lg shadow-rose-600/30 transition-all"
            >
              প্রবেশ করুন
            </button>
          </form>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-16 bg-gradient-to-br from-slate-50 via-rose-50/30 to-indigo-50/40 dark:from-slate-900 dark:via-indigo-950 dark:to-slate-900 text-slate-900 dark:text-slate-100 relative overflow-hidden pb-20 transition-colors">
      
      <div className="absolute top-10 left-10 w-96 h-96 bg-rose-500/10 dark:bg-rose-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[30rem] h-[30rem] bg-indigo-500/10 dark:bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-1/3 w-96 h-96 bg-purple-500/10 dark:bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

      <Header />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 bg-white/80 dark:bg-white/5 backdrop-blur-2xl p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-white/10 shadow-xl dark:shadow-2xl transition-colors">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold">
              <Sparkles className="h-3.5 w-3.5" />
              কন্ট্রোল প্যানেল
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-white dark:via-slate-100 dark:to-slate-400 flex items-center gap-3">
              <ShieldCheck className="h-9 w-9 text-rose-600 dark:text-rose-500" />
              অ্যাডমিন প্যানেল
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              রক্তদাতা এবং রক্ত প্রার্থীদের সকল ডেটা এক জায়গা থেকে পরিচালনা করুন।
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-4">
            <div className="flex-1 sm:w-44 bg-gradient-to-br from-rose-500/10 to-orange-500/5 dark:from-rose-500/20 dark:to-orange-500/10 p-4 rounded-2xl border border-rose-500/20 dark:border-rose-500/30 backdrop-blur-md shadow-md dark:shadow-lg relative overflow-hidden group">
              <div className="flex items-center justify-between">
                <span className="text-xs text-rose-600 dark:text-rose-300 font-semibold uppercase tracking-wider">মোট ডোনার</span>
                <Users className="h-5 w-5 text-rose-600 dark:text-rose-400" />
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">{donors.length}</p>
            </div>

            <div className="flex-1 sm:w-44 bg-gradient-to-br from-indigo-500/10 to-purple-500/5 dark:from-indigo-500/20 dark:to-purple-500/10 p-4 rounded-2xl border border-indigo-500/20 dark:border-indigo-500/30 backdrop-blur-md shadow-md dark:shadow-lg relative overflow-hidden group">
              <div className="flex items-center justify-between">
                <span className="text-xs text-indigo-600 dark:text-indigo-300 font-semibold uppercase tracking-wider">মোট রিকোয়েস্ট</span>
                <FileText className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">{requests.length}</p>
            </div>

            <button
              onClick={() => {
                setIsAuthenticated(false);
                sessionStorage.removeItem('admin_authenticated');
              }}
              className="px-4 py-3 rounded-2xl border border-rose-200 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-500/20 text-xs font-bold transition-all shadow-sm"
              title="লগআউট করুন"
            >
              লগআউট
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="flex items-center gap-2 bg-white/80 dark:bg-slate-900/80 p-1.5 rounded-2xl border border-slate-200 dark:border-white/10 w-full sm:w-auto shadow-sm dark:shadow-inner transition-colors">
            <button
              onClick={() => setActiveTab('donors')}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 ${
                activeTab === 'donors'
                  ? 'bg-gradient-to-r from-rose-600 to-red-500 text-white shadow-lg shadow-rose-600/30'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
              }`}
            >
              <Users className="h-4 w-4" />
              ডোনার তালিকা ({donors.length})
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 ${
                activeTab === 'requests'
                  ? 'bg-gradient-to-r from-rose-600 to-red-500 text-white shadow-lg shadow-rose-600/30'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
              }`}
            >
              <FileText className="h-4 w-4" />
              রিকোয়েস্ট তালিকা ({requests.length})
            </button>
          </div>

          <div className="relative w-full sm:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="নাম, ফোন বা ব্লাড গ্রুপ দিয়ে খুঁজুন..."
              className="w-full pl-11 pr-4 py-3 text-xs sm:text-sm bg-white/90 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500 transition-all backdrop-blur-md shadow-sm"
            />
          </div>
        </div>

        <div className="bg-white/80 dark:bg-white/5 backdrop-blur-2xl rounded-3xl border border-slate-200/80 dark:border-white/10 shadow-xl dark:shadow-2xl overflow-hidden transition-colors">
          {loading ? (
            <div className="text-center py-20">
              <Activity className="h-8 w-8 text-rose-600 dark:text-rose-500 animate-spin mx-auto mb-3" />
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">তথ্য লোড করা হচ্ছে...</p>
            </div>
          ) : activeTab === 'donors' ? (
            filteredDonors.length === 0 ? (
              <div className="p-16 text-center text-slate-500 dark:text-slate-400 text-sm">কোনো রক্তদাতা পাওয়া যায়নি।</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-slate-100/70 dark:bg-white/5 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-white/10">
                    <tr>
                      <th className="p-4 sm:px-6">রক্তদাতা</th>
                      <th className="p-4 sm:px-6">ব্লাড গ্রুপ</th>
                      <th className="p-4 sm:px-6">ফোন নম্বর</th>
                      <th className="p-4 sm:px-6">ঠিকানা / লোকেশন</th>
                      <th className="p-4 sm:px-6 text-right">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-slate-800 dark:text-slate-200">
                    {filteredDonors.map((donor: any) => (
                      <tr key={donor.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                        <td className="p-4 sm:px-6 font-bold text-slate-900 dark:text-white flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-rose-500 to-red-600 text-white font-bold flex items-center justify-center text-xs shadow-md">
                            {donor.full_name?.charAt(0).toUpperCase() || 'D'}
                          </div>
                          {donor.full_name || 'নাম পাওয়া যায়নি'}
                        </td>
                        <td className="p-4 sm:px-6">
                          <span className="px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30 font-black text-xs inline-block">
                            {donor.blood_group}
                          </span>
                        </td>
                        <td className="p-4 sm:px-6 text-slate-600 dark:text-slate-300 font-mono">{donor.phone}</td>
                        <td className="p-4 sm:px-6 text-slate-600 dark:text-slate-300">
                          {donor.address || donor.location || (donor.latitude && donor.longitude ? `${donor.latitude.toFixed(2)}, ${donor.longitude.toFixed(2)}` : 'N/A')}
                        </td>
                        <td className="p-4 sm:px-6 text-right">
                          <button
                            onClick={() =>
                              setDeleteTarget({ id: donor.id, type: 'donor', name: donor.full_name })
                            }
                            className="p-2 text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-white hover:bg-rose-50 dark:hover:bg-rose-500/20 rounded-xl transition-all border border-transparent hover:border-rose-200 dark:hover:border-rose-500/30 inline-flex items-center gap-1 text-xs font-semibold"
                          >
                            <Trash2 className="h-4 w-4" />
                            মুছুন
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          ) : (
            filteredRequests.length === 0 ? (
              <div className="p-16 text-center text-slate-500 dark:text-slate-400 text-sm">কোনো রক্তের রিকোয়েস্ট পাওয়া যায়নি।</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-slate-100/70 dark:bg-white/5 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-white/10">
                    <tr>
                      <th className="p-4 sm:px-6">রোগীর নাম</th>
                      <th className="p-4 sm:px-6">ব্লাড গ্রুপ</th>
                      <th className="p-4 sm:px-6">যোগাযোগ</th>
                      <th className="p-4 sm:px-6">হাসপাতাল/ঠিকানা</th>
                      <th className="p-4 sm:px-6 text-right">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-slate-800 dark:text-slate-200">
                    {filteredRequests.map((req: any) => (
                      <tr key={req.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                        <td className="p-4 sm:px-6 font-bold text-slate-900 dark:text-white flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold flex items-center justify-center text-xs shadow-md">
                            {req.patient_name?.charAt(0).toUpperCase() || 'R'}
                          </div>
                          {req.patient_name || 'N/A'}
                        </td>
                        <td className="p-4 sm:px-6">
                          <span className="px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30 font-black text-xs inline-block">
                            {req.blood_group}
                          </span>
                        </td>
                        <td className="p-4 sm:px-6 text-slate-600 dark:text-slate-300 font-mono">
                          {req.phone || 'N/A'}
                        </td>
                        <td className="p-4 sm:px-6 text-slate-500 dark:text-slate-400">{req.hospital_name || 'N/A'}</td>
                        <td className="p-4 sm:px-6 text-right">
                          <button
                            onClick={() =>
                              setDeleteTarget({
                                id: req.id,
                                type: 'request',
                                name: req.patient_name || 'রক্তের রিকোয়েস্ট',
                              })
                            }
                            className="p-2 text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-white hover:bg-rose-50 dark:hover:bg-rose-500/20 rounded-xl transition-all border border-transparent hover:border-rose-200 dark:hover:border-rose-500/30 inline-flex items-center gap-1 text-xs font-semibold"
                          >
                            <Trash2 className="h-4 w-4" />
                            মুছুন
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}
        </div>
      </div>

      <AnimatePresence>
        {deleteTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 dark:bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-white/10 rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl space-y-5 relative overflow-hidden transition-colors"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-3">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Trash2 className="h-5 w-5 text-rose-600 dark:text-rose-500" />
                  মুছে ফেলার নিশ্চিতকরণ
                </h3>
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                আপনি কি নিশ্চিতভাবে <span className="font-bold text-rose-600 dark:text-rose-400">"{deleteTarget.name}"</span> এর সকল ডেটা ডাটাবেস থেকে মুছে ফেলতে চান? এটি আর ফিরিয়ে আনা সম্ভব হবে না।
              </p>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="flex-1 py-3 rounded-2xl border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                >
                  বাতিল
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-red-500 hover:from-rose-500 hover:to-red-400 text-white text-xs font-bold shadow-lg shadow-rose-600/30 transition-all"
                >
                  হ্যাঁ, মুছুন
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}