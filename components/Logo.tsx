'use client';

import { motion } from 'framer-motion';

interface LogoMarkProps {
  size?: number;
  animated?: boolean;
  className?: string;
}

/** BloodConnect BD logo: রক্তের ফোঁটার ভেতরে হৃদয়, চারপাশে সংযোগের কক্ষপথ */
export function LogoMark({ size = 44, animated = true, className }: LogoMarkProps) {
  const uid = 'lm';
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      role="img"
      aria-label="BloodConnect BD logo"
      className={className}
    >
      <defs>
        <linearGradient id={`${uid}-drop`} x1="0.1" y1="0" x2="0.9" y2="1">
          <stop offset="0" stopColor="#ff7a5c" />
          <stop offset="0.5" stopColor="#dc2626" />
          <stop offset="1" stopColor="#8c0f1e" />
        </linearGradient>
        <linearGradient id={`${uid}-gold`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffe08a" />
          <stop offset="1" stopColor="#f59e0b" />
        </linearGradient>
        <linearGradient id={`${uid}-shine`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.55" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* কক্ষপথ ও সংযোগ বিন্দু */}
      <motion.g
        style={{ transformOrigin: '32px 34px' }}
        animate={animated ? { rotate: 360 } : undefined}
        transition={{ duration: 14, repeat: Infinity, ease: 'linear' }}
      >
        <ellipse
          cx="32"
          cy="34"
          rx="29"
          ry="12"
          fill="none"
          stroke={`url(#${uid}-gold)`}
          strokeWidth="1.6"
          strokeDasharray="3 4"
          opacity="0.9"
          transform="rotate(-24 32 34)"
        />
        <circle cx="58" cy="25" r="3.4" fill={`url(#${uid}-gold)`} />
      </motion.g>

      {/* ফোঁটা */}
      <path
        d="M32 5 C32 5 12 26 12 40 a20 20 0 0 0 40 0 C52 26 32 5 32 5Z"
        fill={`url(#${uid}-drop)`}
      />
      <path
        d="M32 9 C28 15 17 28 17 38 c0 3 .6 5.6 1.8 8 C16.5 36 24 22 32 9Z"
        fill={`url(#${uid}-shine)`}
      />

      {/* হৃদয় */}
      <motion.path
        d="M32 47 l-8.6 -8.6 a5.4 5.4 0 0 1 8.6 -6.2 a5.4 5.4 0 0 1 8.6 6.2 z"
        fill="#fff"
        style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
        animate={animated ? { scale: [1, 1.2, 1, 1.14, 1] } : undefined}
        transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
      />
    </svg>
  );
}

interface LogoProps {
  size?: number;
  animated?: boolean;
  /** true হলে লেখা সাদা হবে (গাঢ় ব্যাকগ্রাউন্ডের জন্য) */
  light?: boolean;
}

export default function Logo({ size = 42, animated = true, light = false }: LogoProps) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <LogoMark size={size} animated={animated} />
      <span className="flex flex-col leading-none">
        <span
          className={`text-[1.15rem] font-extrabold tracking-tight ${
            light ? 'text-white' : 'text-slate-900 dark:text-white'
          }`}
        >
          Blood<span className="text-red-600 dark:text-red-500">Connect</span>
        </span>
        <span className="mt-1 inline-flex items-center gap-1.5">
          <span className="rounded-md bg-gradient-to-r from-amber-300 to-amber-500 px-1.5 py-0.5 text-[10px] font-black tracking-widest text-slate-900">
            BD
          </span>
          <span
            className={`text-[10px] font-semibold tracking-wide ${
              light ? 'text-emerald-100/80' : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            Save Lives
          </span>
        </span>
      </span>
    </span>
  );
}