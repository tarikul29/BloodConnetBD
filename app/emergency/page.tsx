'use client';

import { motion } from 'framer-motion';
import { Phone, Ambulance, HeartPulse, Droplets, ExternalLink, ShieldAlert } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const ease = [0.22, 1, 0.36, 1] as const;

// ⚠ এখানে শুধু যাচাই করা নম্বর রাখুন। নতুন ব্লাড ব্যাংক যোগ করতে নিচের তালিকায় একটি সারি বাড়ান।
const HOTLINES = [
  { icon: ShieldAlert, title: 'জাতীয় জরুরি সেবা', desc: 'পুলিশ, ফায়ার সার্ভিস ও অ্যাম্বুলেন্স — যেকোনো জরুরি অবস্থায়', number: '999', grad: 'from-red-600 to-red-900' },
  { icon: HeartPulse, title: 'স্বাস্থ্য বাতায়ন', desc: 'স্বাস্থ্য অধিদপ্তরের ২৪ ঘণ্টার স্বাস্থ্য পরামর্শ হটলাইন', number: '16263', grad: 'from-emerald-500 to-teal-800' },
];

const BLOOD_BANKS: { name: string; desc: string; url?: string; phone?: string }[] = [
  {
    name: 'বাংলাদেশ রেড ক্রিসেন্ট সোসাইটি',
    desc: 'নিরাপদ রক্তের জন্য দেশের অন্যতম বিশ্বস্ত প্রতিষ্ঠান',
    url: 'https://bdrcs.org/donate-blood/',
  },
];

export default function EmergencyPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-b from-rose-50 via-white to-orange-50 pt-24 pb-20 dark:from-slate-950 dark:via-slate-950 dark:to-red-950/30">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease }} className="text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-red-100 px-4 py-1.5 text-xs font-bold text-red-700 dark:bg-red-950 dark:text-red-300">
              <Ambulance className="h-4 w-4" /> জরুরি যোগাযোগ
            </span>
            <h1 className="mt-4 text-3xl font-extrabold leading-[1.4] text-slate-900 dark:text-white sm:text-4xl">
              জরুরি <span className="bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 bg-clip-text text-transparent">হটলাইন ও ব্লাড ব্যাংক</span>
            </h1>
            <p className="mx-auto mt-2 max-w-xl text-slate-600 dark:text-slate-400">
              বিপদে সময় খুব দামি। নিচের নম্বরে এক চাপেই কল করুন।
            </p>
          </motion.div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            {HOTLINES.map((h, i) => (
              <motion.a
                key={h.number}
                href={`tel:${h.number}`}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.1, duration: 0.6, ease }}
                whileHover={{ y: -5, scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className={`relative block overflow-hidden rounded-3xl bg-gradient-to-br ${h.grad} p-6 text-white shadow-xl`}
              >
                <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/15 blur-2xl" />
                <h.icon className="relative h-8 w-8" />
                <h2 className="relative mt-3 text-lg font-extrabold leading-[1.5]">{h.title}</h2>
                <p className="relative mt-1 text-sm text-white/85">{h.desc}</p>
                <p className="relative mt-4 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2 text-2xl font-extrabold text-slate-900">
                  <Phone className="h-5 w-5 text-red-600" /> {h.number}
                </p>
              </motion.a>
            ))}
          </div>

          <h2 className="mt-12 flex items-center gap-2 text-xl font-extrabold text-slate-900 dark:text-white">
            <Droplets className="h-5 w-5 text-red-600" /> বিশ্বস্ত ব্লাড ব্যাংক
          </h2>
          <div className="mt-4 grid gap-4">
            {BLOOD_BANKS.map((b) => (
              <motion.div
                key={b.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="flex flex-col gap-3 rounded-3xl border border-rose-100 bg-white/90 p-5 shadow-md dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <h3 className="font-extrabold text-slate-900 dark:text-white">{b.name}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{b.desc}</p>
                </div>
                <div className="flex gap-2">
                  {b.phone && (
                    <a href={`tel:${b.phone}`} className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-red-600 to-red-800 px-4 py-2 text-sm font-bold text-white">
                      <Phone className="h-4 w-4" /> {b.phone}
                    </a>
                  )}
                  {b.url && (
                    <a href={b.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-full border-2 border-red-200 px-4 py-2 text-sm font-bold text-red-700 dark:border-red-900 dark:text-red-300">
                      <ExternalLink className="h-4 w-4" /> ওয়েবসাইট
                    </a>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}