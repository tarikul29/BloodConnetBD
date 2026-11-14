'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, ArrowUp, Heart } from 'lucide-react';
import Logo from './Logo';

const LINKS = [
  { href: '/donors', label: 'ডোনার খুঁজুন' },
  { href: '/register', label: 'ডোনার হন' },
  { href: '/requests', label: 'চলমান রিকোয়েস্ট' },
  { href: '/request-blood', label: 'রক্তের অনুরোধ করুন' },
];

const CONTACTS = [
  { icon: Mail, text: 'support: tarikulislam870265@gmail.com', grad: 'from-red-500 to-rose-700' },
  { icon: Phone, text: '+880 1943566544', grad: 'from-amber-400 to-orange-600' },
  { icon: MapPin, text: 'kishoreganj, bangladesh', grad: 'from-emerald-500 to-teal-700' },
];

const fade = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as const } },
};

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-gradient-to-br from-[#1f0a0e] via-[#0a2e25] to-[#072e25] text-emerald-50/80">
      {/* উপরের রঙিন লাইন */}
      <motion.div
        animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        style={{ backgroundSize: '220% 100%' }}
        className="h-1.5 w-full bg-gradient-to-r from-red-600 via-amber-400 to-emerald-500"
      />

      {/* নড়তে থাকা ব্লব ও ডট প্যাটার্ন */}
      <motion.div
        animate={{ x: [0, 60, -30, 0], y: [0, -30, 30, 0], scale: [1, 1.15, 0.95, 1] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        className="pointer-events-none absolute -left-24 top-10 h-96 w-96 rounded-full bg-gradient-to-br from-red-600 to-rose-800 opacity-30 blur-3xl"
      />
      <motion.div
        animate={{ x: [0, -50, 40, 0], y: [0, 40, -30, 0] }}
        transition={{ duration: 24, repeat: Infinity, ease: 'easeInOut' }}
        className="pointer-events-none absolute -right-24 bottom-0 h-96 w-96 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 opacity-20 blur-3xl"
      />
      <motion.div
        animate={{ backgroundPosition: ['0px 0px', '120px 120px'] }}
        transition={{ duration: 16, repeat: Infinity, ease: 'linear' }}
        className="pointer-events-none absolute inset-0 opacity-[0.09]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 20px 20px,#f59e0b 3px,transparent 4px),radial-gradient(circle at 80px 80px,#f59e0b 3px,transparent 4px)',
          backgroundSize: '120px 120px',
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-14 pb-8">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          transition={{ staggerChildren: 0.12 }}
          className="grid grid-cols-1 gap-10 md:grid-cols-[1.4fr_1fr_1.3fr]"
        >
          {/* ব্র্যান্ড */}
          <motion.div variants={fade} className="space-y-4">
            <Logo size={46} light />
            <p className="max-w-sm text-sm leading-relaxed text-emerald-50/70">
              জরুরি রক্তদাতা ও রক্তগ্রহীতাদের সংযুক্ত করার সহজ প্ল্যাটফর্ম। একসাথে জীবন বাঁচাই।
            </p>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-gradient-to-r from-white/10 to-white/[0.03] px-4 py-2 text-xs font-semibold text-amber-300">
              <Heart className="h-3.5 w-3.5" fill="currentColor" />
              প্রতিটি ফোঁটা একটি জীবন
            </div>
          </motion.div>

          {/* লিংক */}
          <motion.div variants={fade}>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-white">কুইক লিংক</h3>
            <ul className="space-y-1">
              {LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="group inline-flex items-center gap-2 py-1.5 text-sm text-emerald-50/75 transition-colors hover:text-amber-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-br from-red-500 to-amber-400 transition-all group-hover:w-4" />
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* যোগাযোগ */}
          <motion.div variants={fade}>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-white">যোগাযোগ</h3>
            <ul className="space-y-3">
              {CONTACTS.map((c) => (
                <motion.li key={c.text} whileHover={{ x: 6 }} className="flex items-center gap-3 text-sm">
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-lg ${c.grad}`}>
                    <c.icon className="h-4 w-4" />
                  </span>
                  <span className="break-all">{c.text}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </motion.div>

        {/* ডেভেলপার ক্রেডিট */}
        <motion.div
          variants={fade}
          className="relative mt-10 overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-r from-white/10 via-white/5 to-white/10 p-5 backdrop-blur-md sm:p-6"
        >
          <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
            <div className="relative h-16 w-16 shrink-0">
              <motion.span
                aria-hidden
                animate={{ rotate: 360 }}
                transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 rounded-full"
                style={{ background: 'conic-gradient(#ffd35e,#e8503f,#2fa886,#ffd35e)' }}
              />
              <span className="absolute inset-[3px] overflow-hidden rounded-full bg-emerald-950">
                <Image src="/developer.jpg" alt="Tarikul Islam" fill sizes="64px" className="object-cover object-[50%_20%]" />
              </span>
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold uppercase tracking-wider text-yellow-300">Developed by</p>
              <p className="mt-0.5 text-xl font-extrabold text-white">Tarikul Islam</p>
              <p className="text-sm text-emerald-50/70">
                ডিজাইন ও ডেভেলপমেন্ট · BloodConnect BD · NextGen Developers
              </p>
            </div>
            <a
              href="mailto:tarikulislam870265@gmail.com"
              className="rounded-full bg-gradient-to-r from-yellow-300 to-amber-500 px-5 py-2.5 text-xs font-bold text-slate-900 shadow-lg transition-transform hover:-translate-y-0.5"
            >
              যোগাযোগ করুন
            </a>
          </div>
        </motion.div>

        {/* নিচের বার */}
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 sm:flex-row">
          <p className="text-xs text-emerald-50/55">
            © {new Date().getFullYear()} BloodConnect BD. Developed with ❤ by Tarikul Islam.
          </p>
          <motion.button
            whileHover={{ y: -4, scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-yellow-300 to-amber-500 px-5 py-2 text-xs font-bold text-slate-900 shadow-lg"
            aria-label="উপরে যান"
          >
            <ArrowUp className="h-3.5 w-3.5" /> উপরে যান
          </motion.button>
        </div>
      </div>
    </footer>
  );
}