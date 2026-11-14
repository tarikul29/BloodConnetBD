'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, ArrowRight, AlertCircle } from 'lucide-react';
import Header from '@/components/Header';
import { LogoMark } from '@/components/Logo';

const ease = [0.22, 1, 0.36, 1] as const;

// ===== সব ইনপুটের একই স্টাইল =====
export const inputCls =
  'w-full rounded-2xl border-[1.5px] border-orange-100 dark:border-slate-700 bg-gradient-to-b from-white to-orange-50/40 dark:from-slate-800 dark:to-slate-800 pl-12 pr-4 py-3.5 text-[15px] font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/15 transition-all disabled:opacity-60 disabled:cursor-not-allowed';

export const selectCls =
  'w-full rounded-2xl border-[1.5px] border-orange-100 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3.5 text-[15px] font-medium text-slate-900 dark:text-white focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/15 transition-all disabled:opacity-60 disabled:cursor-not-allowed';

// ===== লেবেলসহ ফিল্ড =====
export function Field({
  label,
  icon: Icon,
  children,
  hint,
}: {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 ml-1 block text-[13px] font-bold text-slate-700 dark:text-slate-300">{label}</label>
      <div className="group relative">
        {Icon && (
          <span className="pointer-events-none absolute left-4 top-[1.05rem] z-10">
            <Icon className="h-[18px] w-[18px] text-red-500 transition-transform group-focus-within:scale-110" />
          </span>
        )}
        {children}
      </div>
      {hint && <p className="ml-1 mt-1 text-xs text-slate-500 dark:text-slate-400">{hint}</p>}
    </div>
  );
}

// ===== রঙিন সেকশন বক্স =====
const TONES = {
  red: {
    box: 'from-rose-50 to-orange-50 border-rose-200/70 dark:from-red-950/30 dark:to-slate-900 dark:border-red-900/40',
    bar: 'from-red-500 to-red-900',
    chip: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300',
  },
  gold: {
    box: 'from-amber-50 to-yellow-50 border-amber-200/80 dark:from-amber-950/25 dark:to-slate-900 dark:border-amber-900/40',
    bar: 'from-yellow-300 to-amber-600',
    chip: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
  },
  green: {
    box: 'from-emerald-50 to-teal-50 border-emerald-200/80 dark:from-emerald-950/25 dark:to-slate-900 dark:border-emerald-900/40',
    bar: 'from-emerald-400 to-teal-700',
    chip: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
  },
} as const;

export function Section({
  tone = 'red',
  title,
  step,
  note,
  children,
}: {
  tone?: keyof typeof TONES;
  title: string;
  step?: string;
  note?: string;
  children: React.ReactNode;
}) {
  const t = TONES[tone];
  return (
    <div className={`space-y-4 rounded-3xl border bg-gradient-to-br p-5 ${t.box}`}>
      <div className="flex items-center gap-2.5">
        <span className={`h-6 w-1.5 rounded-full bg-gradient-to-b ${t.bar}`} />
        <span className="text-lg font-extrabold text-slate-900 dark:text-white">{title}</span>
        {step && <span className={`ml-auto rounded-full px-2.5 py-1 text-xs font-bold ${t.chip}`}>{step}</span>}
      </div>
      {note && <p className="-mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{note}</p>}
      {children}
    </div>
  );
}

// ===== ত্রুটি বার্তা =====
export function FormError({ error }: { error: string | null }) {
  return (
    <AnimatePresence>
      {error && (
        <motion.div
          initial={{ opacity: 0, height: 0, y: -8 }}
          animate={{ opacity: 1, height: 'auto', y: 0 }}
          exit={{ opacity: 0, height: 0 }}
          className="overflow-hidden"
        >
          <div className="flex items-start gap-2.5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 dark:border-red-900/50 dark:bg-red-950/50 dark:text-red-400">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            {error}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ===== সাবমিট বাটন =====
export function SubmitButton({
  loading,
  loadingText,
  children,
}: {
  loading: boolean;
  loadingText: string;
  children: React.ReactNode;
}) {
  return (
    <motion.button
      type="submit"
      disabled={loading}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.97 }}
      className="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-red-500 via-red-600 to-red-800 py-4 text-base font-extrabold text-white shadow-xl shadow-red-300/50 disabled:cursor-not-allowed disabled:opacity-60 dark:shadow-none"
    >
      <motion.span
        aria-hidden
        animate={{ x: ['-150%', '350%'] }}
        transition={{ duration: 1.4, repeat: Infinity, repeatDelay: 2.6, ease: 'easeInOut' }}
        className="pointer-events-none absolute inset-y-0 w-1/3 -skew-x-[20deg] bg-gradient-to-r from-transparent via-white/60 to-transparent"
      />
      <span className="relative flex items-center justify-center gap-2">
        {loading ? (
          loadingText
        ) : (
          <>
            {children}
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </>
        )}
      </span>
    </motion.button>
  );
}

// ===== পুরো পেজের কাঠামো: বাঁয়ে রঙিন প্যানেল, ডানে ফর্ম =====
export function AuthShell({
  badge,
  title,
  accent,
  subtitle,
  perks,
  children,
  footerNote,
}: {
  badge: string;
  title: string;
  accent: string;
  subtitle: string;
  perks: string[];
  children: React.ReactNode;
  footerNote?: string;
}) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-orange-50 via-rose-50 to-amber-50 pt-16 text-slate-800 transition-colors dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 dark:text-slate-100">
      <Header />

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[1fr_1.05fr] lg:gap-8 lg:py-10">
        {/* ===== বাঁ পাশ ===== */}
        <motion.aside
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9, ease }}
          className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-emerald-950 via-teal-900 to-emerald-700 text-amber-50 lg:sticky lg:top-24 lg:self-start"
        >
          <motion.div
            animate={{ backgroundPosition: ['0px 0px', '120px 120px'] }}
            transition={{ duration: 14, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                'radial-gradient(circle at 20px 20px,#f2a516 3px,transparent 4px),radial-gradient(circle at 80px 80px,#f2a516 3px,transparent 4px)',
              backgroundSize: '120px 120px',
            }}
          />
          <motion.div
            animate={{ x: [0, 50, -20, 0], y: [0, -30, 20, 0], scale: [1, 1.15, 0.95, 1] }}
            transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -left-20 -top-16 h-80 w-80 rounded-full bg-gradient-to-br from-orange-400 to-red-600 opacity-40 blur-3xl"
          />
          <motion.div
            animate={{ x: [0, -40, 30, 0], y: [0, 40, -20, 0] }}
            transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -bottom-16 -right-16 h-80 w-80 rounded-full bg-gradient-to-br from-yellow-300 to-amber-500 opacity-35 blur-3xl"
          />

          <div className="relative flex flex-col gap-6 p-7 sm:p-10">
            <Link href="/" className="flex w-fit items-center gap-3 text-white">
              <LogoMark size={44} />
              <span className="text-xl font-extrabold">
                BloodConnect <span className="text-yellow-300">BD</span>
              </span>
            </Link>

            <div className="flex flex-col gap-3">
              <span className="w-fit rounded-full border border-white/25 bg-white/15 px-4 py-1.5 text-sm font-bold text-yellow-300">
                {badge}
              </span>
              <h2 className="text-4xl font-extrabold leading-[1.4] text-white sm:text-5xl">
                {title}
                <br />
                <motion.span
                  animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                  transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                  style={{ backgroundSize: '220% 100%' }}
                  className="bg-gradient-to-r from-yellow-300 via-amber-100 to-amber-400 bg-clip-text text-transparent"
                >
                  {accent}
                </motion.span>
              </h2>
              <p className="max-w-md text-base leading-relaxed text-emerald-50/85 sm:text-lg">{subtitle}</p>
            </div>

            {/* ছবির কোলাজ (শুধু বড় স্ক্রিনে) */}
            <div className="relative mx-auto hidden aspect-[1/0.8] w-full max-w-sm lg:block">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 16, repeat: Infinity, ease: 'linear' }}
                className="absolute left-[10%] top-[8%] aspect-square w-[76%] rounded-full opacity-50 blur-3xl"
                style={{ background: 'conic-gradient(from 0deg,#c4162a,#f2a516,#2fa886,#c4162a)' }}
              />
              <div className="absolute left-[6%] top-0 h-full w-[62%] overflow-hidden rounded-t-full rounded-b-3xl bg-emerald-900 shadow-2xl shadow-black/30">
                <motion.div
                  animate={{ scale: [1, 1.12] }}
                  transition={{ duration: 14, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
                  className="absolute inset-0"
                >
                  <Image src="/donor-smile.jpg" alt="A smiling blood donor" fill sizes="240px" className="object-cover object-[48%_30%]" />
                </motion.div>
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/50 to-transparent" />
              </div>
              <motion.div
                animate={{ y: [0, -14, 0] }}
                transition={{ duration: 6.5, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute right-[2%] top-[30%] aspect-square w-[36%] overflow-hidden rounded-full border-[6px] border-emerald-900 bg-red-600 shadow-xl"
              >
                <Image
                  src="/heart-donation.jpg"
                  alt="Donating blood"
                  fill
                  sizes="140px"
                  className="scale-[1.9] origin-[32%_36%] object-cover object-[30%_35%]"
                />
              </motion.div>
            </div>

            <ul className="flex flex-col gap-3">
              {perks.map((p) => (
                <li
                  key={p}
                  className="flex items-center gap-3 rounded-2xl border border-white/15 bg-gradient-to-br from-white/15 to-white/5 px-4 py-3 text-[15px] font-semibold sm:text-base"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-yellow-300 to-amber-500 text-xs font-extrabold text-slate-900">
                    ✓
                  </span>
                  {p}
                </li>
              ))}
            </ul>
          </div>
        </motion.aside>

        {/* ===== ডান পাশ: ফর্ম ===== */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease, delay: 0.1 }}
          className="relative"
        >
          <motion.div
            animate={{ x: [0, -30, 20, 0], y: [0, 30, -20, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
            className="pointer-events-none absolute -right-10 top-10 h-72 w-72 rounded-full bg-gradient-to-br from-yellow-200 to-amber-400 opacity-40 blur-3xl"
          />
          <div className="relative overflow-hidden rounded-[2.5rem] border border-orange-100 bg-gradient-to-b from-white/95 to-rose-50/90 p-6 shadow-2xl shadow-red-200/40 backdrop-blur-xl dark:border-slate-800 dark:from-slate-900/95 dark:to-slate-900/95 dark:shadow-black/30 sm:p-9">
            <motion.div
              animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
              style={{ backgroundSize: '220% 100%' }}
              className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-red-600 via-amber-400 to-emerald-500"
            />
            {children}
          </div>
          {footerNote && <p className="mt-5 text-center text-xs text-slate-500 dark:text-slate-400">{footerNote}</p>}
        </motion.div>
      </div>
    </main>
  );
}

// ===== ফর্মের মাথার শিরোনাম (ডানের কার্ডে) =====
export function FormHeading({
  pill,
  title,
  accent,
  subtitle,
  badges,
}: {
  pill: string;
  title: string;
  accent: string;
  subtitle: string;
  badges?: [string, string];
}) {
  return (
    <div className="mb-7 flex flex-wrap items-center justify-between gap-5">
      <div className="flex min-w-[220px] flex-1 flex-col gap-2">
        <span className="w-fit rounded-full bg-gradient-to-r from-yellow-200 to-amber-300 px-3.5 py-1 text-[13px] font-bold text-amber-900">
          {pill}
        </span>
        <h1 className="text-3xl font-extrabold leading-[1.4] text-slate-900 dark:text-white sm:text-4xl">
          {title}{' '}
          <span className="bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 bg-clip-text text-transparent">{accent}</span>
        </h1>
        <p className="text-[15px] text-slate-600 dark:text-slate-400">{subtitle}</p>
      </div>

      <motion.div
        animate={{ y: [0, -14, 0], rotate: [0, 3, 0] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
        className="relative h-28 w-28 shrink-0"
      >
        <motion.span
          aria-hidden
          animate={{ rotate: 360 }}
          transition={{ duration: 14, repeat: Infinity, ease: 'linear' }}
          className="absolute -inset-2 rounded-full opacity-40 blur-lg"
          style={{ background: 'conic-gradient(#c4162a,#f2a516,#2fa886,#c4162a)' }}
        />
        <span className="absolute inset-0 flex items-center justify-center rounded-full border-[3px] border-white bg-gradient-to-br from-amber-50 to-rose-100 shadow-xl shadow-red-300/40 dark:border-slate-800 dark:from-slate-800 dark:to-slate-800">
          <LogoMark size={64} />
        </span>
        {badges && (
          <>
            <span className="absolute -bottom-1 -right-6 whitespace-nowrap rounded-full bg-gradient-to-r from-emerald-600 to-teal-800 px-3 py-1 text-xs font-bold text-white shadow-lg">
              {badges[0]}
            </span>
            <span className="absolute -left-6 top-0 whitespace-nowrap rounded-full bg-gradient-to-r from-yellow-300 to-amber-500 px-3 py-1 text-xs font-bold text-amber-950 shadow-lg">
              {badges[1]}
            </span>
          </>
        )}
      </motion.div>
    </div>
  );
}

// ===== সফল হওয়ার পর কার্ড =====
export function SuccessScreen({
  title,
  text,
  actions,
}: {
  title: string;
  text: string;
  actions: { href: string; label: string; primary?: boolean }[];
}) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-orange-50 via-rose-50 to-amber-50 pt-16 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900">
      <Header />
      <motion.div
        animate={{ x: [0, 50, -30, 0], y: [0, -30, 30, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        className="pointer-events-none absolute -left-20 top-20 h-96 w-96 rounded-full bg-gradient-to-br from-emerald-300 to-teal-600 opacity-30 blur-3xl"
      />
      <motion.div
        animate={{ x: [0, -50, 30, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
        className="pointer-events-none absolute -right-20 bottom-10 h-96 w-96 rounded-full bg-gradient-to-br from-yellow-200 to-amber-500 opacity-40 blur-3xl"
      />
      <div className="relative z-10 flex min-h-[85vh] items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 100, damping: 18 }}
          className="relative w-full max-w-md overflow-hidden rounded-[2.5rem] border border-orange-100 bg-white/90 p-10 text-center shadow-2xl shadow-emerald-200/40 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/90"
        >
          <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-emerald-500 via-amber-400 to-red-600" />
          <motion.div
            initial={{ scale: 0, rotate: -90 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 160, damping: 12 }}
            className="relative mx-auto mb-7 flex h-24 w-24 items-center justify-center"
          >
            <motion.span
              aria-hidden
              animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
              transition={{ duration: 1.8, repeat: Infinity }}
              className="absolute inset-0 rounded-full bg-emerald-400"
            />
            <span className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-700 shadow-xl shadow-emerald-300/50">
              <CheckCircle2 className="h-12 w-12 text-white" strokeWidth={2.5} />
            </span>
          </motion.div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">{title}</h1>
          <p className="mx-auto mt-3 max-w-xs text-[15px] leading-relaxed text-slate-600 dark:text-slate-400">{text}</p>
          <div className="mt-8 flex flex-col gap-3">
            {actions.map((a) => (
              <Link
                key={a.href}
                href={a.href}
                className={
                  a.primary
                    ? 'inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-red-500 via-red-600 to-red-800 px-8 py-4 text-base font-extrabold text-white shadow-xl shadow-red-300/50 transition-transform hover:-translate-y-0.5'
                    : 'inline-flex items-center justify-center rounded-2xl border-[1.5px] border-orange-100 bg-white px-6 py-3.5 text-sm font-bold text-slate-700 transition-colors hover:bg-orange-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'
                }
              >
                {a.label}
                {a.primary && <ArrowRight className="ml-2 h-4 w-4" />}
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
    </main>
  );
}