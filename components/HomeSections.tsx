'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Search, Phone, UserPlus, Send, MapPin, ShieldCheck, Bell, Zap, HeartHandshake, Gift, Plus, Hospital, Smartphone, Share, Download, ArrowRight, Droplet } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { BloodRequest } from '@/types/database';
import { LogoMark } from './Logo';

const ease = [0.22, 1, 0.36, 1] as const;

const reveal = {
  hidden: { opacity: 0, y: 50, scale: 0.97 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.8, ease } },
};
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.13 } } };

/* ---------- Soft animated background blobs ---------- */
function Blobs({ a, b }: { a: string; b: string }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <motion.div
        animate={{ x: [0, 60, -30, 0], y: [0, -30, 30, 0], scale: [1, 1.15, 0.95, 1] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        className={`absolute -left-20 top-10 h-96 w-96 rounded-full blur-3xl opacity-40 dark:opacity-15 ${a}`}
      />
      <motion.div
        animate={{ x: [0, -50, 40, 0], y: [0, 40, -30, 0], scale: [1, 0.92, 1.12, 1] }}
        transition={{ duration: 24, repeat: Infinity, ease: 'easeInOut' }}
        className={`absolute -right-20 bottom-0 h-96 w-96 rounded-full blur-3xl opacity-40 dark:opacity-15 ${b}`}
      />
    </div>
  );
}

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
    <section className="relative overflow-hidden bg-gradient-to-br from-rose-50 via-orange-50 to-amber-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 py-20 transition-colors duration-300">
      <Blobs a="bg-gradient-to-br from-red-300 to-orange-300" b="bg-gradient-to-br from-yellow-200 to-amber-400" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={reveal}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          className="max-w-2xl"
        >
          <span className="text-sm font-semibold text-red-600 dark:text-red-400">কীভাবে কাজ করে</span>
          <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white leading-[1.4]">
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
    <section className="relative overflow-hidden bg-gradient-to-b from-amber-100 via-orange-50 to-rose-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 py-20 transition-colors duration-300">
      <Blobs a="bg-gradient-to-br from-emerald-200 to-teal-300" b="bg-gradient-to-br from-red-200 to-rose-300" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
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
            <motion.h2 variants={reveal} className="text-3xl sm:text-4xl font-extrabold leading-[1.4] text-white">
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

/* ---------- Why BloodConnect ---------- */
const WHY = [
  { icon: MapPin, title: 'GPS দিয়ে কাছের ডোনার', text: 'আপনার অবস্থান থেকে সবচেয়ে কাছের ডোনার আগে দেখায়, তাই সময় বাঁচে।', grad: 'from-red-500 to-rose-700' },
  { icon: Zap, title: 'সেকেন্ডেই রিকোয়েস্ট', text: 'ফর্ম পূরণ করলেই রিকোয়েস্ট সবার সামনে চলে যায়, কোনো অপেক্ষা নেই।', grad: 'from-amber-400 to-orange-600' },
  { icon: ShieldCheck, title: '৯০ দিনের নিয়ম মেনে', text: 'শেষ রক্তদানের তারিখ দেখে সাইট নিজেই বলে দেয় ডোনার যোগ্য কিনা।', grad: 'from-emerald-500 to-teal-700' },
  { icon: Phone, title: 'সরাসরি যোগাযোগ', text: 'ডোনারের নম্বরে এক ট্যাপে কল বা এসএমএস, মাঝখানে কেউ নেই।', grad: 'from-sky-500 to-indigo-700' },
  { icon: Bell, title: 'লাইভ নোটিফিকেশন', text: 'নতুন জরুরি রিকোয়েস্ট এলেই সাইটে সঙ্গে সঙ্গে জানানো হয়।', grad: 'from-fuchsia-500 to-rose-600' },
  { icon: Gift, title: 'সম্পূর্ণ বিনামূল্যে', text: 'ডোনার ও রক্তগ্রহীতা, কারও কাছ থেকে কোনো টাকা নেওয়া হয় না।', grad: 'from-yellow-400 to-amber-600' },
];

export function WhyUs() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-orange-100 via-rose-50 to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 py-20 transition-colors duration-300">
      <Blobs a="bg-gradient-to-br from-fuchsia-200 to-rose-300" b="bg-gradient-to-br from-amber-200 to-orange-300" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={reveal}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          className="mx-auto max-w-2xl text-center"
        >
          <span className="text-sm font-semibold text-red-600 dark:text-red-400">কেন BloodConnect BD</span>
          <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white leading-[1.4]">
            জরুরি মুহূর্তে যা সবচেয়ে বেশি দরকার, সবই এক জায়গায়
          </h2>
          <p className="mt-3 text-lg text-slate-600 dark:text-slate-300">
            ফেসবুকে পোস্ট করে অপেক্ষা নয়, সঠিক গ্রুপের ডোনার সরাসরি আপনার হাতের কাছে।
          </p>
        </motion.div>
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {WHY.map((w) => (
            <motion.div
              key={w.title}
              variants={reveal}
              whileHover={{ y: -8, rotate: -0.6 }}
              className="rounded-3xl border border-white/70 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 p-7 shadow-lg shadow-rose-200/40 dark:shadow-none backdrop-blur-md"
            >
              <motion.div
                whileHover={{ rotate: 8, scale: 1.1 }}
                className={`mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg ${w.grad}`}
              >
                <w.icon className="h-6 w-6" />
              </motion.div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">{w.title}</h3>
              <p className="mt-2 text-slate-600 dark:text-slate-400 leading-relaxed">{w.text}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ---------- Compatibility chart ---------- */
const COMPAT: { g: string; to: string[] }[] = [
  { g: 'O-', to: ['সব গ্রুপ'] },
  { g: 'O+', to: ['O+', 'A+', 'B+', 'AB+'] },
  { g: 'A-', to: ['A-', 'A+', 'AB-', 'AB+'] },
  { g: 'A+', to: ['A+', 'AB+'] },
  { g: 'B-', to: ['B-', 'B+', 'AB-', 'AB+'] },
  { g: 'B+', to: ['B+', 'AB+'] },
  { g: 'AB-', to: ['AB-', 'AB+'] },
  { g: 'AB+', to: ['AB+'] },
];

export function Compatibility() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-white via-rose-50 to-amber-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 py-20 transition-colors duration-300">
      <Blobs a="bg-gradient-to-br from-red-200 to-orange-200" b="bg-gradient-to-br from-teal-200 to-emerald-300" />
      <div className="relative mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:px-8 lg:grid-cols-[1fr_1.6fr]">
        <motion.div
          variants={reveal}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          className="flex flex-col justify-center gap-4"
        >
          <span className="text-sm font-semibold text-red-600 dark:text-red-400">রক্তের গ্রুপ</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold leading-[1.4] text-slate-900 dark:text-white">
            কে কাকে রক্ত দিতে পারে
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            বাঁ পাশে ডোনারের গ্রুপ, ডান পাশে যাদের রক্ত দিতে পারবেন। জরুরি সময়ে সঠিক গ্রুপ বুঝতে এটা কাজে লাগবে।
          </p>
          <div className="inline-flex w-fit items-center gap-2 rounded-full bg-gradient-to-r from-red-100 to-amber-100 dark:from-red-950/60 dark:to-amber-950/40 px-4 py-2 text-sm font-semibold text-red-700 dark:text-red-300">
            <HeartHandshake className="h-4 w-4" /> O- হলো সার্বজনীন ডোনার
          </div>
        </motion.div>
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          className="grid gap-3"
        >
          {COMPAT.map((row) => (
            <motion.div
              key={row.g}
              variants={reveal}
              whileHover={{ x: 8 }}
              className="flex items-center gap-4 rounded-2xl border border-white/70 dark:border-slate-800 bg-white/75 dark:bg-slate-900/70 p-3 shadow-md shadow-rose-200/30 dark:shadow-none backdrop-blur-md"
            >
              <div className="flex h-12 w-16 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-red-800 text-xl font-bold text-white shadow-md">
                {row.g}
              </div>
              <div className="flex flex-wrap gap-2">
                {row.to.map((t, i) => (
                  <span
                    key={t}
                    className={`rounded-full px-3.5 py-1.5 text-base font-semibold ${
                      i % 3 === 0
                        ? 'bg-gradient-to-r from-rose-100 to-orange-100 text-red-800 dark:from-red-950/60 dark:to-orange-950/40 dark:text-red-200'
                        : i % 3 === 1
                        ? 'bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800 dark:from-amber-950/60 dark:to-yellow-950/40 dark:text-amber-200'
                        : 'bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-800 dark:from-emerald-950/60 dark:to-teal-950/40 dark:text-emerald-200'
                    }`}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ---------- FAQ ---------- */
const FAQS = [
  { q: 'ডোনার হিসেবে রেজিস্টার করতে কি টাকা লাগে?', a: 'না, সম্পূর্ণ বিনামূল্যে। শুধু একটা ইমেইল আর পাসওয়ার্ড দিয়ে অ্যাকাউন্ট খুলে আপনার তথ্য দিতে হয়।' },
  { q: 'আমার ফোন নম্বর কি সবাই দেখতে পাবে?', a: 'হ্যাঁ। যাঁদের জরুরি রক্ত দরকার তাঁরা সরাসরি আপনাকে কল করতে পারেন, তাই নম্বর প্রকাশ্যে দেখানো হয়। রক্ত দিতে না পারলে ড্যাশবোর্ড থেকে নিজেকে "অনুপলব্ধ" করে দিন।' },
  { q: 'আবার কবে রক্ত দিতে পারব?', a: 'শেষ রক্তদানের ৯০ দিন পর। শেষ দানের তারিখ জানালে সাইট নিজেই বলে দেয় আপনি যোগ্য কিনা।' },
  { q: 'জরুরি রক্ত চাইতে কী করব?', a: '"জরুরি রক্ত চাই" বাটনে চাপুন, রক্তের গ্রুপ, ব্যাগের সংখ্যা আর হাসপাতাল জানান। এরপর কাছের ডোনারদের তালিকা পাবেন এবং সরাসরি কল করতে পারবেন।' },
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50 via-teal-50 to-rose-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 py-20 transition-colors duration-300">
      <Blobs a="bg-gradient-to-br from-emerald-200 to-teal-300" b="bg-gradient-to-br from-amber-200 to-yellow-300" />
      <div className="relative mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={reveal}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          className="text-center"
        >
          <span className="text-sm font-semibold text-red-600 dark:text-red-400">সাধারণ প্রশ্ন</span>
          <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">যা জানতে চান</h2>
        </motion.div>
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          className="mt-10 grid gap-4"
        >
          {FAQS.map((f, i) => {
            const isOpen = open === i;
            return (
              <motion.div
                key={f.q}
                variants={reveal}
                className="overflow-hidden rounded-2xl border border-white/70 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70 shadow-md shadow-emerald-200/30 dark:shadow-none backdrop-blur-md"
              >
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left text-lg font-semibold text-slate-900 dark:text-white"
                >
                  {f.q}
                  <motion.span
                    animate={{ rotate: isOpen ? 45 : 0 }}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-red-800 text-white"
                  >
                    <Plus className="h-4 w-4" />
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease }}
                    >
                      <p className="px-6 pb-5 text-slate-600 dark:text-slate-300 leading-relaxed">{f.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

/* ---------- Live blood requests ---------- */
const URGENCY: Record<string, { label: string; cls: string }> = {
  critical: { label: 'অতি জরুরি', cls: 'bg-gradient-to-r from-red-600 to-rose-700 text-white' },
  urgent: { label: 'জরুরি', cls: 'bg-gradient-to-r from-orange-400 to-red-500 text-white' },
  moderate: { label: 'মাঝারি', cls: 'bg-gradient-to-r from-amber-200 to-yellow-300 text-amber-900' },
};

function RequestCard({ r }: { r: BloodRequest }) {
  const [show, setShow] = useState(false);
  const u = URGENCY[r.urgency_status] ?? URGENCY.moderate;
  return (
    <motion.div
      variants={reveal}
      whileHover={{ y: -10 }}
      className="relative overflow-hidden rounded-3xl border border-white/80 dark:border-slate-800 bg-white/85 dark:bg-slate-900/80 p-6 shadow-xl shadow-rose-200/40 dark:shadow-none backdrop-blur-md flex flex-col gap-4"
    >
      <motion.div
        animate={{ opacity: [0.25, 0.5, 0.25] }}
        transition={{ duration: 3, repeat: Infinity }}
        className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-gradient-to-br from-red-300 to-orange-300 blur-2xl"
      />
      <div className="relative flex items-center justify-between gap-3">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-red-800 text-2xl font-extrabold text-white shadow-lg shadow-red-300/50 dark:shadow-none">
          {r.blood_group}
        </div>
        <span className={`rounded-full px-3.5 py-1.5 text-xs font-bold ${u.cls}`}>{u.label}</span>
      </div>
      <div className="relative flex flex-col gap-1.5">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">{r.patient_name}</h3>
        <p className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
          <Hospital className="h-4 w-4 shrink-0 text-red-500" />
          {r.hospital_name}
        </p>
        <p className="flex items-center gap-2 font-semibold text-red-700 dark:text-red-400">
          <Droplet className="h-4 w-4 shrink-0" fill="currentColor" />
          {r.bags_needed.toLocaleString('bn-BD')} ব্যাগ রক্ত দরকার
        </p>
      </div>
      <div className="relative mt-auto">
        <AnimatePresence mode="wait" initial={false}>
          {show ? (
            <motion.div
              key="num"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-between gap-3 rounded-2xl bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-950/60 dark:to-teal-950/40 px-4 py-3"
            >
              <b className="text-lg text-emerald-900 dark:text-emerald-200">{r.contact_phone}</b>
              <a
                href={`tel:${r.contact_phone}`}
                className="rounded-full bg-gradient-to-r from-emerald-600 to-teal-700 px-4 py-2 text-sm font-bold text-white"
              >
                ডায়াল করুন
              </a>
            </motion.div>
          ) : (
            <motion.button
              key="btn"
              onClick={() => setShow(true)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              className="relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-red-500 via-red-600 to-red-800 py-3.5 text-base font-bold text-white shadow-lg shadow-red-300/40 dark:shadow-none"
            >
              <motion.span
                aria-hidden
                animate={{ x: ['-150%', '350%'] }}
                transition={{ duration: 1.4, repeat: Infinity, repeatDelay: 2.4, ease: 'easeInOut' }}
                className="pointer-events-none absolute inset-y-0 w-1/3 -skew-x-[20deg] bg-gradient-to-r from-transparent via-white/60 to-transparent"
              />
              <Phone className="relative h-4 w-4" />
              <span className="relative">কল করুন</span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export function LiveRequests() {
  const [items, setItems] = useState<BloodRequest[] | null>(null);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase
        .from('blood_requests')
        .select('*')
        .neq('urgency_status', 'fulfilled')
        .neq('urgency_status', 'expired')
        .order('created_at', { ascending: false })
        .limit(3);
      setItems((data as BloodRequest[]) ?? []);
    }
    load();
  }, []);

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-rose-100 via-orange-50 to-amber-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 py-20 transition-colors duration-300">
      <Blobs a="bg-gradient-to-br from-red-300 to-rose-400" b="bg-gradient-to-br from-amber-200 to-orange-300" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={reveal}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          className="flex flex-wrap items-end justify-between gap-4"
        >
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-red-600 dark:text-red-400">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-70" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-600" />
              </span>
              লাইভ রিকোয়েস্ট
            </span>
            <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white leading-[1.4]">
              এই মুহূর্তে যাদের রক্ত দরকার
            </h2>
          </div>
          <motion.div whileHover={{ x: 4 }}>
            <Link
              href="/requests"
              className="inline-flex items-center gap-2 rounded-full border-2 border-red-300 dark:border-slate-700 px-6 py-2.5 font-bold text-red-700 dark:text-red-300"
            >
              সব রিকোয়েস্ট দেখুন <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        </motion.div>

        {items === null ? (
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-64 animate-pulse rounded-3xl bg-white/60 dark:bg-slate-900/60" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <motion.div
            variants={reveal}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="mt-10 rounded-3xl border border-white/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70 p-12 text-center backdrop-blur-md"
          >
            <p className="text-xl font-bold text-slate-900 dark:text-white">এই মুহূর্তে কোনো জরুরি রিকোয়েস্ট নেই</p>
            <p className="mt-2 text-slate-600 dark:text-slate-400">সবাই ভালো আছেন। তবু ডোনার হয়ে থাকুন, দরকারের সময় যেন পাশে থাকতে পারেন।</p>
          </motion.div>
        ) : (
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-80px' }}
            className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            {items.map((r) => (
              <RequestCard key={r.id} r={r} />
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}

/* ---------- Blood heroes (real donors) ---------- */
interface HeroDonor {
  id: string;
  full_name: string;
  blood_group: string;
  address: string | null;
  photo_url: string | null;
}

const HERO_GRADS = [
  'from-red-500 to-red-900',
  'from-emerald-500 to-teal-800',
  'from-amber-400 to-orange-700',
];

export function BloodHeroes() {
  const [donors, setDonors] = useState<HeroDonor[]>([]);
  const [fulfilled, setFulfilled] = useState<number | null>(null);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase
        .from('donors')
        .select('id, full_name, blood_group, address, photo_url')
        .eq('is_available', true)
        .order('created_at', { ascending: false })
        .limit(3);
      setDonors((data as HeroDonor[]) ?? []);
      const { count } = await supabase
        .from('blood_requests')
        .select('*', { count: 'exact', head: true })
        .eq('urgency_status', 'fulfilled');
      setFulfilled(count ?? 0);
    }
    load();
  }, []);

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white via-rose-50 to-orange-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 py-20 transition-colors duration-300">
      <Blobs a="bg-gradient-to-br from-rose-200 to-red-300" b="bg-gradient-to-br from-emerald-200 to-teal-300" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={reveal}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          className="mx-auto max-w-2xl text-center"
        >
          <span className="text-sm font-semibold text-red-600 dark:text-red-400">আমাদের রক্তযোদ্ধারা</span>
          <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white leading-[1.4]">
            যাঁদের জন্য কেউ ফিরে পেয়েছেন জীবন
          </h2>
          {fulfilled !== null && fulfilled > 0 && (
            <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-950/60 dark:to-teal-950/40 px-4 py-2 text-base font-semibold text-emerald-800 dark:text-emerald-300">
              <HeartHandshake className="h-4 w-4" />
              এ পর্যন্ত {fulfilled.toLocaleString('bn-BD')}টি রক্তের প্রয়োজন মিটেছে
            </p>
          )}
        </motion.div>

        {donors.length > 0 && (
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-80px' }}
            className="mt-12 grid gap-6 md:grid-cols-3"
          >
            {donors.map((d, i) => (
              <motion.div
                key={d.id}
                variants={reveal}
                whileHover={{ y: -10 }}
                className="relative overflow-hidden rounded-3xl border border-white/80 dark:border-slate-800 bg-white/85 dark:bg-slate-900/80 p-7 shadow-xl shadow-rose-200/40 dark:shadow-none backdrop-blur-md"
              >
                <div className={`absolute inset-x-0 top-0 h-2 bg-gradient-to-r ${HERO_GRADS[i % 3]}`} />
                <div className="flex items-center gap-4">
                  <span className="relative inline-flex h-20 w-20 shrink-0 items-center justify-center">
                    <motion.span
                      aria-hidden
                      animate={{ rotate: 360 }}
                      transition={{ duration: 7, repeat: Infinity, ease: 'linear' }}
                      className="absolute inset-0 rounded-full"
                      style={{ background: 'conic-gradient(#dc2626, #f59e0b, #14b8a6, #dc2626)' }}
                    />
                    <span className="relative flex h-[calc(100%-6px)] w-[calc(100%-6px)] items-center justify-center overflow-hidden rounded-full bg-white dark:bg-slate-800">
                      {d.photo_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={d.photo_url} alt={d.full_name} className="h-full w-full object-cover" />
                      ) : (
                        <span className={`flex h-full w-full items-center justify-center bg-gradient-to-br text-2xl font-bold text-white ${HERO_GRADS[i % 3]}`}>
                          {d.full_name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </span>
                  </span>
                  <div className="min-w-0">
                    <h3 className="truncate text-xl font-bold text-slate-900 dark:text-white">{d.full_name}</h3>
                    <span className="mt-1 inline-block rounded-full bg-gradient-to-r from-red-500 to-red-800 px-3 py-1 text-sm font-bold text-white">
                      {d.blood_group}
                    </span>
                  </div>
                </div>
                {d.address && (
                  <p className="mt-4 flex items-start gap-2 text-slate-600 dark:text-slate-400">
                    <MapPin className="mt-1 h-4 w-4 shrink-0 text-red-500" />
                    <span className="line-clamp-2">{d.address}</span>
                  </p>
                )}
                <p className="mt-3 text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                  রক্ত দিতে প্রস্তুত
                </p>
              </motion.div>
            ))}
          </motion.div>
        )}

        <motion.div variants={reveal} initial="hidden" whileInView="show" viewport={{ once: true }} className="mt-10 text-center">
          <Link
            href="/donors"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-600 to-teal-800 px-8 py-3.5 text-lg font-bold text-white shadow-lg"
          >
            সব ডোনার দেখুন <ArrowRight className="h-5 w-5" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

/* ---------- Mobile app install ---------- */
interface InstallEvent extends Event {
  prompt: () => Promise<void>;
}

export function AppInstall() {
  const [deferred, setDeferred] = useState<InstallEvent | null>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    function onPrompt(e: Event) {
      e.preventDefault();
      setDeferred(e as InstallEvent);
    }
    function onInstalled() {
      setInstalled(true);
      setDeferred(null);
    }
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  async function install() {
    if (!deferred) return;
    await deferred.prompt();
    setDeferred(null);
  }

  const steps = [
    { icon: Smartphone, text: 'Chrome (Android) বা Safari (iPhone)-তে সাইট খুলুন' },
    { icon: Share, text: 'মেনু বা শেয়ার বাটনে চাপুন' },
    { icon: Download, text: '"Add to Home Screen" বেছে নিন' },
  ];

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
      <motion.div
        animate={{ x: [0, 50, -30, 0], y: [0, -30, 30, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -right-20 top-0 h-96 w-96 rounded-full bg-gradient-to-br from-amber-300 to-red-500 opacity-30 blur-3xl"
      />
      <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-4 sm:px-6 lg:px-8 lg:grid-cols-2">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          className="flex flex-col gap-5"
        >
          <motion.span variants={reveal} className="text-sm font-semibold text-amber-300">মোবাইলে</motion.span>
          <motion.h2 variants={reveal} className="text-3xl sm:text-4xl font-extrabold leading-[1.4]">
            ফোনের হোম স্ক্রিনে রাখুন, এক ট্যাপেই খুলুন
          </motion.h2>
          <motion.p variants={reveal} className="text-lg text-emerald-50/85 leading-relaxed">
            Play Store ছাড়াই BloodConnect BD ফোনে অ্যাপের মতো ইনস্টল হয়। জরুরি সময়ে সাইট খুঁজতে হবে না।
          </motion.p>
          <div className="flex flex-col gap-3">
            {steps.map((st, i) => (
              <motion.div
                key={st.text}
                variants={reveal}
                className="flex items-center gap-4 rounded-2xl border border-white/15 bg-gradient-to-r from-white/12 to-white/[0.03] p-3.5 backdrop-blur-sm"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 to-amber-500 font-bold text-slate-900">
                  {(i + 1).toLocaleString('bn-BD')}
                </span>
                <span className="flex-1 text-lg">{st.text}</span>
                <st.icon className="h-5 w-5 text-amber-300" />
              </motion.div>
            ))}
          </div>
          {deferred && !installed && (
            <motion.button
              variants={reveal}
              onClick={install}
              whileHover={{ scale: 1.05, y: -3 }}
              whileTap={{ scale: 0.96 }}
              className="inline-flex w-fit items-center gap-2 rounded-full bg-gradient-to-r from-yellow-300 to-amber-500 px-8 py-3.5 text-lg font-bold text-slate-900 shadow-xl"
            >
              <Download className="h-5 w-5" /> এখনই ইনস্টল করুন
            </motion.button>
          )}
          {installed && <p className="font-semibold text-amber-300">ইনস্টল হয়ে গেছে, ধন্যবাদ!</p>}
        </motion.div>

        {/* ফোনের মকআপ */}
        <div className="relative flex justify-center">
          <motion.div
            animate={{ y: [0, -18, 0], rotate: [-2, 2, -2] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
            className="relative h-[460px] w-[240px] rounded-[2.6rem] bg-slate-900 p-3 shadow-2xl shadow-black/40"
          >
            <div className="flex h-full w-full flex-col gap-3 overflow-hidden rounded-[2rem] bg-gradient-to-b from-orange-50 to-rose-100 p-5">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <LogoMark size={26} animated={false} /> BloodConnect BD
              </div>
              <div className="text-[1.6rem] font-extrabold leading-tight text-slate-900">
                প্রতিটি ফোঁটা{' '}
                <span className="bg-gradient-to-r from-red-600 to-amber-500 bg-clip-text text-transparent">একটি জীবন</span>
              </div>
              <div className="rounded-full bg-gradient-to-r from-red-500 to-red-800 py-2.5 text-center text-sm font-bold text-white">
                জরুরি রক্ত চাই
              </div>
              <div className="flex gap-2">
                {['A+', 'O+', 'B+'].map((g) => (
                  <span key={g} className="rounded-xl bg-white px-3 py-2 text-sm font-bold text-red-600 shadow">
                    {g}
                  </span>
                ))}
              </div>
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1.6, repeat: Infinity }}
                className="mx-auto mt-auto"
              >
                <LogoMark size={96} animated={false} />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Final CTA ---------- */
export function FinalCTA() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-rose-50 via-amber-50 to-orange-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 py-20 transition-colors duration-300">
      <Blobs a="bg-gradient-to-br from-red-300 to-rose-400" b="bg-gradient-to-br from-yellow-200 to-orange-300" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
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
              <h2 className="text-3xl sm:text-5xl font-extrabold leading-[1.4] text-white">
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