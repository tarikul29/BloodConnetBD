'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Check, Search, Phone, UserPlus, Send } from 'lucide-react';

const ease = [0.22, 1, 0.36, 1] as const;

const reveal = {
  hidden: { opacity: 0, y: 50, scale: 0.97 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.8, ease } },
};
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.13 } } };

/* ---------- Blood group ticker ---------- */
const GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

export function Ticker() {
  const row = [...GROUPS, ...GROUPS, ...GROUPS, ...GROUPS];
  return (
    <div className="overflow-hidden bg-gradient-to-r from-red-900 via-red-600 to-red-900 py-4 text-white">
      <motion.div
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
        className="flex w-max"
      >
        {row.concat(row).map((g, i) => (
          <span key={i} className="inline-flex items-center gap-7 pr-7 text-xl font-bold whitespace-nowrap">
            {g}
            <span className="h-2 w-2 rounded-full bg-amber-300" />
          </span>
        ))}
      </motion.div>
    </div>
  );
}

/* ---------- How it works ---------- */
const STEPS = [
  { icon: UserPlus, title: 'রেজিস্টার করুন', text: 'নাম, ফোন, রক্তের গ্রুপ আর লোকেশন দিয়ে ডোনার হিসেবে যুক্ত হোন।' },
  { icon: Send, title: 'রিকোয়েস্ট দিন', text: 'রক্তের গ্রুপ, কত ব্যাগ আর হাসপাতাল জানিয়ে অনুরোধ পাঠান।' },
  { icon: Search, title: 'কাছের ডোনার পান', text: 'GPS দিয়ে আপনার সবচেয়ে কাছের যোগ্য ডোনারদের তালিকা দেখুন।' },
  { icon: Phone, title: 'সরাসরি কল করুন', text: 'ডোনারের নম্বরে কল করে সরাসরি কথা বলুন আর রক্তের ব্যবস্থা করুন।' },
];

export function HowItWorks() {
  return (
    <section className="bg-white dark:bg-slate-950 py-20 transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={reveal}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          className="max-w-2xl"
        >
          <span className="text-sm font-semibold text-red-600 dark:text-red-400">কীভাবে কাজ করে</span>
          <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white leading-tight">
            চার ধাপে রক্ত পৌঁছে যায় প্রয়োজনের কাছে
          </h2>
        </motion.div>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {STEPS.map((s, i) => (
            <motion.div
              key={s.title}
              variants={reveal}
              whileHover={{ y: -10, transition: { type: 'spring', stiffness: 300, damping: 15 } }}
              className="group rounded-3xl border border-orange-100 dark:border-slate-800 bg-gradient-to-b from-white to-rose-50 dark:from-slate-900 dark:to-slate-900 p-8 shadow-sm hover:shadow-2xl hover:shadow-red-200/50 dark:hover:shadow-none transition-shadow"
            >
              <div className="relative mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-red-800 text-white shadow-lg shadow-red-300/50 dark:shadow-none">
                <s.icon className="h-6 w-6" />
                <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-amber-400 text-xs font-bold text-slate-900">
                  {(i + 1).toLocaleString('bn-BD')}
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">{s.title}</h3>
              <p className="mt-2 text-slate-600 dark:text-slate-400 leading-relaxed">{s.text}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ---------- Photo feature ---------- */
const POINTS = [
  'প্রতিবার নতুন জীবাণুমুক্ত সুই ব্যবহার হয়',
  'দেওয়ার পর কিছুক্ষণ বিশ্রাম নিন আর পানি পান করুন',
  '৯০ দিন পর আবার দিতে পারবেন, সাইট হিসাব রাখে',
];

export function PhotoFeature() {
  return (
    <section className="bg-white dark:bg-slate-950 pb-20 transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={reveal}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          className="grid overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-700 shadow-2xl shadow-emerald-900/30 lg:grid-cols-[1.1fr_1fr]"
        >
          <div className="relative min-h-[300px] lg:min-h-[420px] overflow-hidden">
            <motion.div
              initial={{ scale: 1.25 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.8, ease }}
              className="absolute inset-0"
            >
              <Image
                src="/heart-donation.jpg"
                alt="হৃদয়ের খেলনা হাতে নিয়ে রক্তদান করছেন একজন ডোনার"
                fill
                sizes="(max-width: 1024px) 100vw, 600px"
                className="object-cover"
              />
            </motion.div>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-emerald-950/80" />
            <motion.div
              animate={{ boxShadow: ['0 0 0 0 rgba(245,158,11,.6)', '0 0 0 18px rgba(245,158,11,0)'] }}
              transition={{ duration: 2.2, repeat: Infinity }}
              className="absolute bottom-6 left-6 rounded-full bg-gradient-to-r from-yellow-300 to-amber-500 px-5 py-2.5 text-base font-bold text-slate-900"
            >
              একটি দান, একটি জীবন
            </motion.div>
          </div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="flex flex-col justify-center gap-5 p-8 sm:p-12"
          >
            <motion.span variants={reveal} className="text-sm font-semibold text-amber-300">
              নিশ্চিন্তে রক্ত দিন
            </motion.span>
            <motion.h2 variants={reveal} className="text-3xl sm:text-4xl font-extrabold leading-tight text-white">
              রক্তদান সহজ আর নিরাপদ
            </motion.h2>
            {POINTS.map((p) => (
              <motion.div key={p} variants={reveal} className="flex items-start gap-3 text-lg text-emerald-50/90">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-400 text-slate-900">
                  <Check className="h-4 w-4" strokeWidth={3} />
                </span>
                {p}
              </motion.div>
            ))}
            <motion.div variants={reveal} className="mt-2">
              <motion.div whileHover={{ scale: 1.05, y: -3 }} whileTap={{ scale: 0.96 }} className="inline-block">
                <Link
                  href="/register"
                  className="inline-block rounded-full bg-gradient-to-r from-yellow-300 to-amber-500 px-7 py-3.5 text-lg font-bold text-slate-900 shadow-lg"
                >
                  ডোনার হোন
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

/* ---------- Eligibility ---------- */
const ELIG = [
  { value: '১৮–৬০', label: 'বছর বয়স', text: 'সাধারণত এই বয়সের সুস্থ মানুষ রক্ত দিতে পারেন।' },
  { value: '৫০+', label: 'কেজি ওজন', text: 'কমপক্ষে ৫০ কেজি ওজন থাকলে রক্তদান নিরাপদ।' },
  { value: '৯০', label: 'দিনের বিরতি', text: 'দুই রক্তদানের মাঝে কমপক্ষে ৯০ দিন অপেক্ষা করুন।' },
  { value: 'সুস্থ', label: 'শরীর', text: 'জ্বর, সংক্রমণ বা অসুস্থতা থাকলে রক্ত দেবেন না।' },
];

export function Eligibility() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-700 py-20 text-white">
      <motion.div
        animate={{ backgroundPosition: ['0px 0px', '120px 120px'] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'linear' }}
        className="absolute inset-0 opacity-15"
        style={{
          backgroundImage:
            'radial-gradient(circle at 20px 20px,#f59e0b 3px,transparent 4px),radial-gradient(circle at 80px 80px,#f59e0b 3px,transparent 4px)',
          backgroundSize: '120px 120px',
        }}
      />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={reveal}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          className="max-w-2xl"
        >
          <span className="text-sm font-semibold text-amber-300">রক্তদাতার যোগ্যতা</span>
          <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold">রক্ত দিতে কী লাগে</h2>
        </motion.div>
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {ELIG.map((e) => (
            <motion.div
              key={e.label}
              variants={reveal}
              whileHover={{ y: -8 }}
              className="rounded-3xl border border-emerald-400/30 bg-gradient-to-br from-white/10 to-white/[0.03] p-8 backdrop-blur-sm"
            >
              <div className="bg-gradient-to-b from-amber-100 to-amber-500 bg-clip-text text-4xl font-extrabold text-transparent">
                {e.value}
              </div>
              <div className="mt-2 text-xl font-semibold">{e.label}</div>
              <p className="mt-2 text-emerald-50/80 leading-relaxed">{e.text}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ---------- Final CTA ---------- */
export function FinalCTA() {
  return (
    <section className="bg-white dark:bg-slate-950 py-20 transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={reveal}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          className="relative overflow-hidden rounded-[2.5rem] p-10 sm:p-16"
        >
          <motion.div
            animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
            transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
            style={{ backgroundSize: '220% 220%' }}
            className="absolute inset-0 bg-gradient-to-br from-red-900 via-red-600 to-orange-500"
          />
          <motion.div
            animate={{ x: [0, 50, -30, 0], y: [0, 20, -20, 0], scale: [1, 1.2, 0.95, 1] }}
            transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -top-20 right-[8%] h-72 w-72 rounded-full bg-amber-300/40 blur-3xl"
          />
          <div className="relative flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
            <div className="max-w-2xl">
              <h2 className="text-3xl sm:text-5xl font-extrabold leading-tight text-white">
                আজই একজন জীবনরক্ষক হোন
              </h2>
              <p className="mt-3 text-lg text-red-50/90">
                এক মিনিটে রেজিস্টার করুন। কারও জরুরি মুহূর্তে আপনার একটি ফোন কল একটি প্রাণ বাঁচাতে পারে।
              </p>
            </div>
            <motion.div whileHover={{ scale: 1.06, y: -3 }} whileTap={{ scale: 0.96 }}>
              <Link
                href="/register"
                className="inline-block rounded-full bg-gradient-to-r from-yellow-300 to-amber-500 px-9 py-4 text-lg font-bold text-slate-900 shadow-xl"
              >
                ডোনার হিসেবে রেজিস্টার করুন
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}