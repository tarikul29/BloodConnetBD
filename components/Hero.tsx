'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Droplet, Users, HeartHandshake, Clock, MapPin } from 'lucide-react';
import {
  motion,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  animate,
  useInView,
} from 'framer-motion';
import { createClient } from '@/lib/supabase/client';

interface HeroProps {
  onEmergencyClick: () => void;
}

const ease = [0.22, 1, 0.36, 1] as const;

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, y: 36 },
  show: { opacity: 1, y: 0, transition: { duration: 0.9, ease } },
};

export default function Hero({ onEmergencyClick }: HeroProps) {
  const [donorCount, setDonorCount] = useState<number | null>(null);
  const [activeDonorCount, setActiveDonorCount] = useState<number | null>(null);
  const [fulfilledCount, setFulfilledCount] = useState<number | null>(null);

  useEffect(() => {
    async function loadStats() {
      const supabase = createClient();

      const { count: donors } = await supabase
        .from('donors')
        .select('id', { count: 'exact', head: true });

      const { count: activeDonors } = await supabase
        .from('donors')
        .select('id', { count: 'exact', head: true })
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

  // Mouse parallax (right column)
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 60, damping: 14 });
  const sy = useSpring(my, { stiffness: 60, damping: 14 });
  const archX = useTransform(sx, [-1, 1], [-14, 14]);
  const archY = useTransform(sy, [-1, 1], [-10, 10]);
  const circX = useTransform(sx, [-1, 1], [22, -22]);
  const circY = useTransform(sy, [-1, 1], [16, -16]);

  // Scroll parallax (blobs)
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const blobY = useTransform(scrollYProgress, [0, 1], [0, 140]);

  function onMove(e: React.MouseEvent) {
    const r = e.currentTarget.getBoundingClientRect();
    mx.set(((e.clientX - r.left) / r.width) * 2 - 1);
    my.set(((e.clientY - r.top) / r.height) * 2 - 1);
  }

  return (
    <section
      ref={ref}
      className="relative overflow-hidden bg-gradient-to-b from-orange-50 via-rose-50 to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 min-h-[calc(100vh-4rem)] flex items-center transition-colors duration-300"
    >
      {/* Animated gradient blobs */}
      <motion.div style={{ y: blobY }} className="pointer-events-none absolute inset-0">
        <motion.div
          animate={{ x: [0, 50, -30, 0], y: [0, -40, 30, 0], scale: [1, 1.15, 0.95, 1] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -left-24 -top-16 h-[28rem] w-[28rem] rounded-full bg-gradient-to-br from-orange-300 to-red-600 opacity-30 blur-3xl dark:opacity-20"
        />
        <motion.div
          animate={{ x: [0, -60, 40, 0], y: [0, 40, -30, 0], scale: [1, 0.9, 1.12, 1] }}
          transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -right-20 top-24 h-[26rem] w-[26rem] rounded-full bg-gradient-to-br from-yellow-200 to-amber-500 opacity-40 blur-3xl dark:opacity-20"
        />
        <motion.div
          animate={{ x: [0, 40, -40, 0], y: [0, -30, 40, 0] }}
          transition={{ duration: 26, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-[-6rem] left-1/3 h-80 w-80 rounded-full bg-gradient-to-br from-emerald-300 to-teal-700 opacity-25 blur-3xl dark:opacity-15"
        />
      </motion.div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          {/* Left column */}
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="text-center lg:text-left"
          >
            <motion.span
              variants={item}
              className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-red-100 to-amber-100 dark:from-red-950/60 dark:to-amber-950/40 px-3 py-1 text-xs font-semibold text-red-700 dark:text-red-300 mb-6 border border-red-200 dark:border-red-900/50"
            >
              <motion.span
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Droplet className="h-3.5 w-3.5" fill="currentColor" />
              </motion.span>
              বাংলাদেশজুড়ে রক্তদাতাদের নেটওয়ার্ক
            </motion.span>

            <motion.h1
              variants={item}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.5] text-slate-900 dark:text-white"
            >
              <span className="block pb-1">প্রতিটি ফোঁটা</span>
              <motion.span
                animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                style={{ backgroundSize: '220% 100%' }}
                className="block mt-2 pb-3 bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 bg-clip-text text-transparent"
              >
                একটি জীবন
              </motion.span>
            </motion.h1>

            <motion.p
              variants={item}
              className="mt-6 text-lg text-slate-600 dark:text-slate-300 max-w-xl mx-auto lg:mx-0"
            >
              রক্তের গ্রুপ আর GPS লোকেশন দিয়ে কাছের যাচাইকৃত রক্তদাতাকে সেকেন্ডেই খুঁজে নিন।
              জরুরি মুহূর্তে সরাসরি কল করুন, কোনো মধ্যস্থতাকারী ছাড়াই।
            </motion.p>

            <motion.div
              variants={item}
              className="mt-8 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
            >
              <ShineButton onClick={onEmergencyClick} variant="red">
                <Droplet className="h-5 w-5" fill="white" />
                জরুরি রক্ত চাই
              </ShineButton>
              <ShineButton href="/register" variant="gold">
                <Users className="h-5 w-5" />
                ডোনার হোন
              </ShineButton>
            </motion.div>

            <motion.div
              variants={item}
              className="mt-10 grid grid-cols-3 gap-6 max-w-lg mx-auto lg:mx-0"
            >
              <Stat icon={<Users className="h-5 w-5" />} value={donorCount} suffix="+" label="মোট ডোনার" />
              <Stat icon={<Clock className="h-5 w-5" />} value={activeDonorCount} label="একটিভ ডোনার" />
              <Stat icon={<HeartHandshake className="h-5 w-5" />} value={fulfilledCount} label="রক্তদান সম্পন্ন" />
            </motion.div>
          </motion.div>

          {/* Right column - photos */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease, delay: 0.2 }}
            onMouseMove={onMove}
            onMouseLeave={() => {
              mx.set(0);
              my.set(0);
            }}
            className="relative mx-auto w-full max-w-md lg:max-w-lg aspect-[1/1.1]"
          >
            {/* Rotating conic glow */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 16, repeat: Infinity, ease: 'linear' }}
              className="absolute left-[4%] top-[8%] w-[84%] aspect-square rounded-full opacity-60 blur-3xl"
              style={{
                background: 'conic-gradient(from 0deg, #dc2626, #f59e0b, #14b8a6, #dc2626)',
              }}
            />

            {/* Arch photo */}
            <motion.div
              style={{ x: archX, y: archY }}
              className="absolute left-[12%] top-0 h-[80%] w-[64%]"
            >
              <motion.div
                initial={{ clipPath: 'inset(100% 0% 0% 0% round 999px 999px 36px 36px)' }}
                animate={{ clipPath: 'inset(0% 0% 0% 0% round 999px 999px 36px 36px)' }}
                transition={{ duration: 1.3, ease, delay: 0.35 }}
                className="relative h-full w-full overflow-hidden bg-emerald-900 shadow-2xl shadow-red-900/25"
              >
                <motion.div
                  animate={{ scale: [1, 1.12] }}
                  transition={{ duration: 14, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
                  className="absolute inset-0"
                >
                  <Image
                    src="/donor-smile.jpg"
                    alt="হাসিমুখে রক্তদান করছেন একজন ডোনার"
                    fill
                    priority
                    sizes="(max-width: 1024px) 70vw, 340px"
                    className="object-cover object-[48%_30%]"
                  />
                </motion.div>
                <div className="absolute inset-0 bg-gradient-to-t from-red-900/45 via-transparent to-transparent" />
              </motion.div>
            </motion.div>

            {/* Circle photo */}
            <motion.div
              style={{ x: circX, y: circY }}
              className="absolute right-0 top-[34%] w-[36%] aspect-square"
            >
              <motion.div
                animate={{ y: [0, -16, 0], rotate: [0, 3, 0] }}
                transition={{ duration: 6.5, repeat: Infinity, ease: 'easeInOut' }}
                initial={{ opacity: 0, scale: 0.4 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="relative h-full w-full overflow-hidden rounded-full border-[6px] border-white dark:border-slate-900 bg-red-600 shadow-xl"
              >
                <Image
                  src="/heart-donation.jpg"
                  alt="হৃদয়ের খেলনা হাতে রক্তদান"
                  fill
                  sizes="200px"
                  className="object-cover scale-[1.9] origin-[32%_36%] object-[30%_35%]"
                />
              </motion.div>
            </motion.div>

            {/* Blood drop with heartbeat */}
            <motion.div
              animate={{ y: [0, -20, 0], rotate: [0, 4, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute bottom-[2%] left-0 w-[34%]"
            >
              <svg viewBox="0 0 200 240" className="w-full drop-shadow-xl" role="img" aria-label="রক্তের ফোঁটা">
                <defs>
                  <linearGradient id="hero-drop" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#ff6a55" />
                    <stop offset=".55" stopColor="#dc2626" />
                    <stop offset="1" stopColor="#8c0f1e" />
                  </linearGradient>
                </defs>
                <path d="M100 8 C100 8 20 98 20 156 a80 80 0 0 0 160 0 C180 98 100 8 100 8Z" fill="url(#hero-drop)" />
                <motion.path
                  d="M100 190 l-34 -34 a20 20 0 0 1 34 -22 a20 20 0 0 1 34 22 z"
                  fill="#fff"
                  style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
                  animate={{ scale: [1, 1.22, 1, 1.16, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                />
              </svg>
            </motion.div>

            {/* Blood group bubbles */}
            <Bubble className="left-0 top-[8%] h-20 w-20 bg-white text-red-600 text-2xl" delay={0}>A+</Bubble>
            <Bubble className="right-[6%] top-[2%] h-16 w-16 bg-gradient-to-br from-red-500 to-red-800 text-white text-xl" delay={1.2}>O+</Bubble>
            <Bubble className="right-[4%] bottom-[24%] h-[4.5rem] w-[4.5rem] bg-gradient-to-br from-yellow-200 to-amber-500 text-slate-900 text-xl" delay={2.1}>AB+</Bubble>

            {/* GPS chip */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease, delay: 1.1 }}
              className="absolute bottom-0 right-0 flex items-center gap-2.5 rounded-2xl bg-white dark:bg-slate-800 px-4 py-3 text-sm font-semibold text-slate-800 dark:text-slate-100 shadow-xl"
            >
              <span className="relative flex h-3.5 w-3.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-70" />
                <span className="relative inline-flex h-3.5 w-3.5 rounded-full bg-emerald-600" />
              </span>
              <MapPin className="h-4 w-4 text-red-600" />
              কাছের ডোনার খুঁজছি
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function Bubble({
  children,
  className,
  delay,
}: {
  children: React.ReactNode;
  className: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1, y: [0, -18, 0] }}
      transition={{
        opacity: { duration: 0.5, delay: 0.8 + delay * 0.2 },
        scale: { type: 'spring', stiffness: 220, damping: 12, delay: 0.8 + delay * 0.2 },
        y: { duration: 4 + delay, repeat: Infinity, ease: 'easeInOut', delay },
      }}
      className={`absolute flex items-center justify-center rounded-full font-bold shadow-xl ${className}`}
    >
      {children}
    </motion.div>
  );
}

function ShineButton({
  children,
  onClick,
  href,
  variant,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  href?: string;
  variant: 'red' | 'gold';
}) {
  const color =
    variant === 'red'
      ? 'bg-gradient-to-r from-red-500 via-red-600 to-red-800 text-white shadow-red-300/60 dark:shadow-red-900/40'
      : 'bg-gradient-to-r from-yellow-300 via-amber-400 to-orange-500 text-slate-900 shadow-amber-300/60 dark:shadow-amber-900/30';
  const cls = `relative overflow-hidden w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 text-base font-bold shadow-lg ${color}`;
  const inner = (
    <>
      <motion.span
        aria-hidden
        initial={{ x: '-150%' }}
        animate={{ x: ['-150%', '350%'] }}
        transition={{ duration: 1.4, repeat: Infinity, repeatDelay: 2.2, ease: 'easeInOut' }}
        className="pointer-events-none absolute inset-y-0 w-1/3 -skew-x-[20deg] bg-gradient-to-r from-transparent via-white/60 to-transparent"
      />
      <span className="relative inline-flex items-center gap-2">{children}</span>
    </>
  );
  const motionProps = {
    whileHover: { scale: 1.05, y: -3 },
    whileTap: { scale: 0.96 },
    transition: { type: 'spring' as const, stiffness: 400, damping: 18 },
  };
  if (href) {
    return (
      <motion.div {...motionProps} className="w-full sm:w-auto">
        <Link href={href} className={cls}>
          {inner}
        </Link>
      </motion.div>
    );
  }
  return (
    <motion.button onClick={onClick} {...motionProps} className={cls}>
      {inner}
    </motion.button>
  );
}

export function CountUp({ value, suffix = '' }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView || !ref.current) return;
    const el = ref.current;
    const controls = animate(0, value, {
      duration: 1.8,
      ease: 'easeOut',
      onUpdate: (v) => {
        el.textContent = Math.round(v).toLocaleString('bn-BD') + suffix;
      },
    });
    return () => controls.stop();
  }, [inView, value, suffix]);
  return <span ref={ref}>{(0).toLocaleString('bn-BD') + suffix}</span>;
}

function Stat({
  icon,
  value,
  suffix,
  label,
}: {
  icon: React.ReactNode;
  value: number | null;
  suffix?: string;
  label: string;
}) {
  return (
    <div className="flex flex-col items-center lg:items-start">
      <div className="text-red-600 dark:text-red-500 mb-1">{icon}</div>
      <div className="text-xl font-bold text-slate-900 dark:text-white">
        {value === null ? '...' : <CountUp value={value} suffix={suffix} />}
      </div>
      <div className="text-xs text-slate-500 dark:text-slate-400">{label}</div>
    </div>
  );
}