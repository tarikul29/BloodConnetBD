'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, type PanInfo } from 'framer-motion';
import { ChevronLeft, ChevronRight, HeartHandshake } from 'lucide-react';

type Item = {
  id: string;
  image_url: string;
  donor_name: string;
  blood_group: string | null;
  caption: string | null;
  created_at: string;
};

const bn = (n: number) => n.toLocaleString('bn-BD');

function whenText(iso: string) {
  const start = new Date(iso);
  const now = new Date();
  const days = Math.floor(
    (new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime() -
      new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime()) /
      86400000
  );
  if (days <= 0) return 'আজ রক্ত দিয়েছেন';
  if (days === 1) return 'গতকাল রক্ত দিয়েছেন';
  return `${bn(days)} দিন আগে রক্ত দিয়েছেন`;
}

const AUTOPLAY_MS = 4500;

/**
 * "আজকের রক্তদাতা" — কার্ডের স্তূপ। উপরের কার্ড ডানে/বামে টেনে (swipe) বা বাটনে চেপে পরের জনকে দেখা যায়।
 * কোনো ছবি না থাকলে পুরো সেকশন লুকানো থাকে।
 */
export default function DonorGallery() {
  const [items, setItems] = useState<Item[]>([]);
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState<1 | -1>(1);
  const [paused, setPaused] = useState(false);
  const reduceMotion = useRef(false);

  useEffect(() => {
    reduceMotion.current =
      typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    let alive = true;
    fetch('/api/gallery')
      .then((r) => (r.ok ? r.json() : { items: [] }))
      .then((j) => {
        if (alive) setItems(Array.isArray(j.items) ? j.items : []);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  const count = items.length;

  const go = useCallback(
    (d: 1 | -1) => {
      if (count < 2) return;
      setDir(d);
      setIndex((i) => (i + d + count) % count);
    },
    [count]
  );

  useEffect(() => {
    if (count < 2 || paused || reduceMotion.current) return;
    const t = setInterval(() => go(1), AUTOPLAY_MS);
    return () => clearInterval(t);
  }, [count, paused, go]);

  if (count === 0) return null;

  // উপরের ৩টা কার্ড দেখাব (স্তূপের মতো)
  const visible = Array.from({ length: Math.min(3, count) }, (_, k) => ({
    item: items[(index + k) % count],
    depth: k,
  }));

  function onDragEnd(_: unknown, info: PanInfo) {
    setPaused(false);
    if (info.offset.x < -70 || info.velocity.x < -500) go(1);
    else if (info.offset.x > 70 || info.velocity.x > 500) go(-1);
  }

  return (
    <section
      aria-label="আজকের রক্তদাতা"
      className="relative overflow-hidden bg-gradient-to-b from-rose-50 via-white to-amber-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 py-14 sm:py-16"
    >
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-950/60 dark:to-teal-950/40 px-4 py-1.5 text-sm font-bold text-emerald-800 dark:text-emerald-300">
            <HeartHandshake className="h-4 w-4" />
            সদ্য রক্তদাতা
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold leading-[1.4] text-slate-900 dark:text-white">
            যাঁরা রক্ত দিয়ে পাশে দাঁড়িয়েছেন
          </h2>
        </div>

        <div
          className="relative mx-auto mt-8 w-full max-w-[340px] sm:max-w-[380px]"
          style={{ aspectRatio: '4 / 5.2' }}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <AnimatePresence initial={false} custom={dir}>
            {[...visible].reverse().map(({ item, depth }) => {
              const isTop = depth === 0;
              return (
                <motion.div
                  key={item.id}
                  custom={dir}
                  initial={{ opacity: 0, scale: 0.86, y: 28 }}
                  animate={{
                    opacity: 1 - depth * 0.18,
                    scale: 1 - depth * 0.07,
                    y: depth * 20,
                    zIndex: 10 - depth,
                  }}
                  exit={{
                    opacity: 0,
                    x: dir * 320,
                    rotate: dir * 10,
                    transition: { duration: 0.35 },
                  }}
                  transition={{ type: 'spring', stiffness: 260, damping: 26 }}
                  drag={isTop && count > 1 ? 'x' : false}
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.9}
                  onDragStart={() => setPaused(true)}
                  onDragEnd={onDragEnd}
                  whileDrag={{ cursor: 'grabbing', rotate: 3 }}
                  className="absolute inset-0 touch-pan-y select-none overflow-hidden rounded-[2rem] bg-slate-200 shadow-2xl shadow-rose-900/20 ring-1 ring-black/5 dark:bg-slate-800"
                  style={{ cursor: isTop && count > 1 ? 'grab' : 'default' }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.image_url}
                    alt={`${item.donor_name} রক্ত দিয়েছেন`}
                    draggable={false}
                    loading={isTop ? 'eager' : 'lazy'}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                  {item.blood_group && (
                    <span className="absolute right-4 top-4 rounded-full bg-gradient-to-br from-red-500 to-red-700 px-3.5 py-1.5 text-sm font-black text-white shadow-lg">
                      {item.blood_group}
                    </span>
                  )}
                  <div className="absolute inset-x-0 bottom-0 p-5">
                    <p className="text-xl font-extrabold leading-[1.4] text-white drop-shadow">{item.donor_name}</p>
                    <p className="mt-0.5 text-sm font-semibold text-amber-200">{whenText(item.created_at)}</p>
                    {item.caption && (
                      <p className="mt-1.5 text-[13px] leading-[1.7] text-white/90 line-clamp-2">{item.caption}</p>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {count > 1 && (
          <div className="mt-8 flex items-center justify-center gap-4">
            <button
              onClick={() => go(-1)}
              aria-label="আগের ছবি"
              className="rounded-full border border-slate-200 bg-white p-2.5 text-slate-700 shadow-sm transition hover:bg-rose-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-1.5" aria-hidden="true">
              {items.slice(0, 12).map((it, i) => (
                <span
                  key={it.id}
                  className={`h-2 rounded-full transition-all ${
                    i === index % Math.min(count, 12) ? 'w-6 bg-red-600' : 'w-2 bg-slate-300 dark:bg-slate-600'
                  }`}
                />
              ))}
            </div>
            <button
              onClick={() => go(1)}
              aria-label="পরের ছবি"
              className="rounded-full border border-slate-200 bg-white p-2.5 text-slate-700 shadow-sm transition hover:bg-rose-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}