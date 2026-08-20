'use client';

import { useEffect, useState } from 'react';
import { Droplet, Users, HeartHandshake, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';

interface HeroProps {
  onEmergencyClick: () => void;
}

export default function Hero({ onEmergencyClick }: HeroProps) {
  const [donorCount, setDonorCount] = useState<number | null>(null);
  const [activeDonorCount, setActiveDonorCount] = useState<number | null>(null);
  const [fulfilledCount, setFulfilledCount] = useState<number | null>(null);

  useEffect(() => {
    async function loadStats() {
      const supabase = createClient();

      const { count: donors } = await supabase
        .from('donors')
        .select('*', { count: 'exact', head: true });

      const { count: activeDonors } = await supabase
        .from('donors')
        .select('*', { count: 'exact', head: true })
        .eq('is_available', true);

      const { count: fulfilled } = await supabase
        .from('blood_requests')
        .select('*', { count: 'exact', head: true })
        .eq('urgency_status', 'fulfilled');

      setDonorCount(donors ?? 0);
      setActiveDonorCount(activeDonors ?? 0);
      setFulfilledCount(fulfilled ?? 0);
    }
    loadStats();
  }, []);

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-red-50 via-white to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 min-h-[calc(100vh-4rem)] flex items-center transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          {/* Left column - text content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="text-center lg:text-left"
          >
            <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 dark:bg-red-950/60 px-3 py-1 text-xs font-semibold text-red-700 dark:text-red-400 mb-6 border border-red-200 dark:border-red-900/50">
              <motion.span
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Droplet className="h-3.5 w-3.5" fill="currentColor" />
              </motion.span>
              Serving donors across Bangladesh
            </span>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Every drop counts.
              <br />
              <span className="text-red-600 dark:text-red-500">Find blood, save a life.</span>
            </h1>

            <p className="mt-6 text-lg text-slate-600 dark:text-slate-300 max-w-xl mx-auto lg:mx-0">
              BloodConnect BD instantly connects emergency blood seekers with
              verified nearby donors — matched by blood group and GPS proximity,
              in seconds.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <motion.button
                onClick={onEmergencyClick}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                animate={{
                  boxShadow: [
                    '0 0 0 0 rgba(220, 38, 38, 0.4)',
                    '0 0 0 12px rgba(220, 38, 38, 0)',
                  ],
                }}
                transition={{
                  boxShadow: { duration: 1.8, repeat: Infinity, ease: 'easeOut' },
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-red-600 px-8 py-4 text-base font-bold text-white shadow-lg shadow-red-200 dark:shadow-none hover:bg-red-700 transition-colors"
              >
                <Droplet className="h-5 w-5" fill="white" />
                Emergency Blood Request
              </motion.button>
              <motion.a
                href="/register"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full border-2 border-slate-200 dark:border-slate-700 px-8 py-4 text-base font-semibold text-slate-700 dark:text-slate-200 hover:border-red-300 hover:text-red-600 dark:hover:text-red-400 transition-colors"
              >
                <Users className="h-5 w-5" />
                Become a Donor
              </motion.a>
            </div>

            <div className="mt-10 grid grid-cols-3 gap-6 max-w-lg mx-auto lg:mx-0">
              <Stat
                icon={<Users className="h-5 w-5" />}
                value={donorCount === null ? '...' : `${donorCount}+`}
                label="মোট ডোনার"
              />
              <Stat
                icon={<Clock className="h-5 w-5" />}
                value={activeDonorCount === null ? '...' : `${activeDonorCount}`}
                label="একটিভ ডোনার"
              />
              <Stat
                icon={<HeartHandshake className="h-5 w-5" />}
                value={fulfilledCount === null ? '...' : `${fulfilledCount}`}
                label="রক্তদান সম্পন্ন"
              />
            </div>
          </motion.div>

          {/* Right column - floating illustration */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: 'easeOut', delay: 0.15 }}
            className="hidden lg:flex items-center justify-center"
          >
            <motion.div
              animate={{ y: [0, -18, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="relative"
            >
              <div className="absolute inset-0 -z-10 flex items-center justify-center">
                <div className="h-80 w-80 rounded-full bg-red-100 dark:bg-red-950/40 blur-2xl opacity-70" />
              </div>

              {/* Main illustration card */}
              <div className="relative flex h-80 w-80 items-center justify-center rounded-[3rem] bg-white dark:bg-slate-900 shadow-2xl shadow-red-100 dark:shadow-none border border-red-50 dark:border-slate-800">
                <motion.div
                  animate={{ scale: [1, 1.08, 1] }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                  className="flex h-40 w-40 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-red-700 shadow-xl"
                >
                  <Droplet className="h-20 w-20 text-white" fill="white" />
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function Stat({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="flex flex-col items-center lg:items-start">
      <div className="text-red-600 dark:text-red-500 mb-1">{icon}</div>
      <div className="text-xl font-bold text-slate-900 dark:text-white">{value}</div>
      <div className="text-xs text-slate-500 dark:text-slate-400">{label}</div>
    </div>
  );
}