'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence, useAnimationControls } from 'framer-motion';
import { Droplet, Mail, Lock, ArrowRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import Header from '@/components/Header';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const iconControls = useAnimationControls();

  useEffect(() => {
    iconControls.start({
      scale: [1, 1.08, 1],
      transition: { duration: 2.8, repeat: Infinity, ease: 'easeInOut' },
    });
  }, [iconControls]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setSubmitting(false);

    if (signInError) {
      setError('ইমেইল বা পাসওয়ার্ড ভুল হয়েছে।');
      return;
    }

    router.push('/dashboard');
    router.refresh();
  }

  return (
    <main className="min-h-screen pt-16 relative overflow-hidden bg-[#fff5f5] dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors">
      {/* Premium soft background */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-50 via-rose-50/70 to-orange-50/30 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900" />
      <div className="absolute top-10 -left-20 w-80 h-80 bg-red-200/30 dark:bg-red-950/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-20 -right-20 w-[28rem] h-[28rem] bg-rose-200/40 dark:bg-rose-950/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-red-100/20 dark:bg-red-950/10 rounded-full blur-[100px] pointer-events-none" />

      <Header />

      <div className="relative z-10 mx-auto max-w-md px-4 py-12 sm:py-16">
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 90, damping: 18 }}
        >
          <div className="relative bg-white/75 dark:bg-slate-900/80 backdrop-blur-2xl border border-white/80 dark:border-slate-800 rounded-[2.5rem] shadow-[0_25px_60px_-15px_rgba(220,38,38,0.12)] dark:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)] p-8 sm:p-10 overflow-hidden transition-colors">
            
            {/* Soft decorative element */}
            <div className="absolute -top-20 -right-20 w-48 h-48 bg-gradient-to-br from-red-100/60 to-rose-100/40 dark:from-red-950/40 dark:to-rose-950/20 rounded-full blur-3xl pointer-events-none" />

            {/* Header */}
            <div className="relative text-center mb-9">
              <motion.div
                animate={iconControls}
                className="mx-auto mb-5 flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 shadow-xl shadow-red-300/50 dark:shadow-red-950/50"
              >
                <Droplet className="h-9 w-9 text-white" fill="currentColor" />
              </motion.div>

              <h1 className="text-2xl sm:text-[1.75rem] font-bold text-slate-900 dark:text-white tracking-tight">
                ডোনার লগইন
              </h1>
              <p className="mt-2 text-slate-500 dark:text-slate-400 text-sm">
                আপনার একাউন্টে ঢুকুন এবং জীবন বাঁচাতে সাহায্য করুন
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="relative space-y-5">
              
              {/* Email */}
              <div>
                <label className="block text-[13px] font-semibold text-slate-600 dark:text-slate-300 mb-1.5 ml-1">
                  ইমেইল
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-slate-400 dark:text-slate-500 group-focus-within:text-red-500 transition-colors" />
                  </div>
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@gmail.com"
                    className="w-full rounded-2xl border border-slate-200/80 dark:border-slate-700/80 bg-white/90 dark:bg-slate-800/80 pl-11 pr-4 py-3.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-[3px] focus:ring-red-500/20 focus:border-red-400 transition-all duration-300 shadow-sm"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-[13px] font-semibold text-slate-600 dark:text-slate-300 mb-1.5 ml-1">
                  পাসওয়ার্ড
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-slate-400 dark:text-slate-500 group-focus-within:text-red-500 transition-colors" />
                  </div>
                  <input
                    required
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="আপনার পাসওয়ার্ড"
                    className="w-full rounded-2xl border border-slate-200/80 dark:border-slate-700/80 bg-white/90 dark:bg-slate-800/80 pl-11 pr-4 py-3.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-[3px] focus:ring-red-500/20 focus:border-red-400 transition-all duration-300 shadow-sm"
                  />
                </div>
              </div>

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, y: -10 }}
                    animate={{ opacity: 1, height: 'auto', y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/50 border border-red-100 dark:border-red-900/50 rounded-2xl px-4 py-3 font-medium">
                      {error}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={submitting}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 py-4 text-sm font-bold text-white shadow-xl shadow-red-200/70 dark:shadow-red-950/50 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {submitting ? (
                    'লগইন হচ্ছে...'
                  ) : (
                    <>
                      লগইন করুন
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                    </>
                  )}
                </span>
              </motion.button>

              {/* Register Link */}
              <p className="text-center text-sm text-slate-500 dark:text-slate-400 pt-2">
                একাউন্ট নেই?{' '}
                <a
                  href="/register"
                  className="text-red-600 dark:text-red-400 font-semibold hover:text-red-700 dark:hover:text-red-300 hover:underline underline-offset-2 transition-colors"
                >
                  ডোনার হিসেবে রেজিস্টার করুন
                </a>
              </p>
            </form>
          </div>
        </motion.div>

        <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-8">
          BloodConnect BD — জীবন বাঁচানোর প্ল্যাটফর্ম
        </p>
      </div>
    </main>
  );
}