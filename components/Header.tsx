'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X, LogOut, Droplet, UserRound } from 'lucide-react';
import {
  motion,
  AnimatePresence,
  useScroll,
  useSpring,
  useMotionValueEvent,
} from 'framer-motion';
import type { User } from '@supabase/supabase-js';
import ThemeToggle from './ThemeToggle';
import Logo from './Logo';
import { createClient } from '@/lib/supabase/client';

const NAV_LINKS = [
  { href: '/donors', label: 'Find Donors' },
  { href: '/register', label: 'Become a Donor' },
  { href: '/requests', label: 'Active Requests' },
];

interface Profile {
  full_name: string | null;
  photo_url: string | null;
  blood_group: string | null;
}

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  // ---------- স্ক্রল ----------
  const { scrollY, scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 24 });
  useMotionValueEvent(scrollY, 'change', (y) => setScrolled(y > 12));

  // ---------- লগইন অবস্থা ----------
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    let cancelled = false;
    supabase.auth.getUser().then(({ data }) => {
      if (cancelled) return;
      setUser(data.user ?? null);
      setAuthReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setAuthReady(true);
    });
    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, [supabase]);

  // প্রোফাইল (ছবি, নাম) লোড। রেজিস্ট্রেশনের ঠিক পরে ডোনার রো তৈরি হতে একটু সময় লাগতে পারে, তাই কয়েকবার চেষ্টা করে।
  useEffect(() => {
    if (!user) {
      setProfile(null);
      return;
    }
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    async function load(attempt: number) {
      const { data } = await supabase
        .from('donors')
        .select('full_name, photo_url, blood_group')
        .eq('id', user!.id)
        .maybeSingle();
      if (cancelled) return;
      if (data) {
        setProfile(data as Profile);
      } else if (attempt < 4) {
        timer = setTimeout(() => load(attempt + 1), 1200);
      }
    }
    load(0);

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [user, pathname, supabase]);

  async function handleLogout() {
    await supabase.auth.signOut();
    setIsOpen(false);
    router.push('/');
    router.refresh();
  }

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'Profile';
  const initial = displayName.trim().charAt(0).toUpperCase();

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 border-b backdrop-blur-xl transition-all duration-300 ${
        scrolled
          ? 'bg-white/90 dark:bg-slate-900/90 border-red-100 dark:border-slate-800 shadow-lg shadow-red-100/60 dark:shadow-black/30'
          : 'bg-gradient-to-r from-white/85 via-rose-50/80 to-amber-50/80 dark:from-slate-900/85 dark:via-slate-900/85 dark:to-slate-900/85 border-transparent'
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className={`flex items-center justify-between transition-all duration-300 ${scrolled ? 'h-14' : 'h-16'}`}>
          {/* লোগো */}
          <Link href="/" className="shrink-0" aria-label="BloodConnect BD home">
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
              <Logo size={scrolled ? 38 : 44} />
            </motion.div>
          </Link>

          {/* ডেস্কটপ মেনু */}
          <nav className="hidden md:flex items-center gap-1" onMouseLeave={() => setHovered(null)}>
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onMouseEnter={() => setHovered(link.href)}
                  className={`relative px-4 py-2 text-[15px] font-semibold rounded-full transition-colors duration-200 ${
                    isActive
                      ? 'text-red-700 dark:text-red-400'
                      : 'text-slate-600 dark:text-slate-300 hover:text-red-700 dark:hover:text-red-400'
                  }`}
                >
                  {hovered === link.href && (
                    <motion.span
                      layoutId="nav-hover"
                      className="absolute inset-0 -z-10 rounded-full bg-gradient-to-r from-red-100 to-amber-100 dark:from-red-950/60 dark:to-amber-950/40"
                      transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                    />
                  )}
                  {link.label}
                  {isActive && (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute bottom-0.5 left-4 right-4 h-[3px] rounded-full bg-gradient-to-r from-red-500 via-rose-500 to-amber-400"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* ডান পাশ (ডেস্কটপ) */}
          <div className="hidden md:flex items-center gap-3 shrink-0">
            <ThemeToggle />

            <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.96 }}>
              <Link
                href="/request-blood"
                className="relative overflow-hidden inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-red-500 via-red-600 to-red-800 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-red-300/50 dark:shadow-red-950/40"
              >
                <motion.span
                  aria-hidden
                  animate={{ x: ['-150%', '350%'] }}
                  transition={{ duration: 1.4, repeat: Infinity, repeatDelay: 2.4, ease: 'easeInOut' }}
                  className="pointer-events-none absolute inset-y-0 w-1/3 -skew-x-[20deg] bg-gradient-to-r from-transparent via-white/60 to-transparent"
                />
                <Droplet className="relative h-4 w-4" fill="white" />
                <span className="relative">Request Blood</span>
              </Link>
            </motion.div>

            {!authReady ? (
              <div className="h-10 w-10 animate-pulse rounded-full bg-slate-200 dark:bg-slate-700" />
            ) : user ? (
              <div className="flex items-center gap-2">
                <Link href="/dashboard" aria-label="My Profile" title={displayName}>
                  <Avatar photo={profile?.photo_url ?? null} initial={initial} />
                </Link>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleLogout}
                  aria-label="Logout"
                  title="Logout"
                  className="rounded-full p-2.5 text-slate-500 hover:bg-red-50 hover:text-red-600 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
                >
                  <LogOut className="h-4.5 w-4.5" />
                </motion.button>
              </div>
            ) : (
              <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.96 }}>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 rounded-full border-2 border-red-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800 px-5 py-2 text-sm font-bold text-red-700 dark:text-slate-200 hover:border-red-400 transition-colors"
                >
                  <UserRound className="h-4 w-4" />
                  Login
                </Link>
              </motion.div>
            )}
          </div>

          {/* মোবাইল */}
          <div className="flex md:hidden items-center gap-2">
            <ThemeToggle />
            {authReady && user && (
              <Link href="/dashboard" aria-label="My Profile">
                <Avatar photo={profile?.photo_url ?? null} initial={initial} small />
              </Link>
            )}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-red-50 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* মোবাইল মেনু */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="md:hidden overflow-hidden"
            >
              <div className="pb-5 pt-2 flex flex-col gap-2">
                {authReady && user && (
                  <Link
                    href="/dashboard"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-red-50 to-amber-50 dark:from-red-950/40 dark:to-amber-950/30 p-3 border border-red-100 dark:border-slate-800"
                  >
                    <Avatar photo={profile?.photo_url ?? null} initial={initial} small />
                    <span className="flex flex-col">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">{displayName}</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">View my profile</span>
                    </span>
                  </Link>
                )}

                {NAV_LINKS.map((link, i) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 * i }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className={`block px-4 py-3 rounded-xl text-[15px] font-semibold transition-colors ${
                        pathname === link.href
                          ? 'bg-gradient-to-r from-red-100 to-amber-100 dark:from-red-950/40 dark:to-amber-950/30 text-red-700 dark:text-red-400'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}

                <div className="flex flex-col gap-2 mt-2 px-1">
                  <Link
                    href="/request-blood"
                    onClick={() => setIsOpen(false)}
                    className="inline-flex justify-center items-center gap-2 rounded-full bg-gradient-to-r from-red-500 via-red-600 to-red-800 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-red-300/40"
                  >
                    <Droplet className="h-4 w-4" fill="white" />
                    Request Blood
                  </Link>
                  {authReady && user ? (
                    <button
                      onClick={handleLogout}
                      className="inline-flex justify-center items-center gap-2 rounded-full border-2 border-slate-200 dark:border-slate-700 px-5 py-3 text-sm font-bold text-slate-700 dark:text-slate-200"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  ) : (
                    authReady && (
                      <Link
                        href="/login"
                        onClick={() => setIsOpen(false)}
                        className="inline-flex justify-center items-center gap-2 rounded-full border-2 border-red-200 dark:border-slate-700 px-5 py-3 text-sm font-bold text-red-700 dark:text-slate-200"
                      >
                        <UserRound className="h-4 w-4" />
                        Login
                      </Link>
                    )
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* স্ক্রল প্রোগ্রেস লাইন */}
      <motion.div
        style={{ scaleX: progress, transformOrigin: '0% 50%' }}
        className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-red-600 via-amber-400 to-emerald-500"
      />
    </motion.header>
  );
}

function Avatar({ photo, initial, small = false }: { photo: string | null; initial: string; small?: boolean }) {
  const dim = small ? 'h-9 w-9' : 'h-11 w-11';
  return (
    <motion.span
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.94 }}
      className={`relative inline-flex ${dim} items-center justify-center`}
    >
      <motion.span
        aria-hidden
        animate={{ rotate: 360 }}
        transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
        className="absolute inset-0 rounded-full"
        style={{ background: 'conic-gradient(#dc2626, #f59e0b, #14b8a6, #dc2626)' }}
      />
      <span className="relative flex h-[calc(100%-4px)] w-[calc(100%-4px)] items-center justify-center overflow-hidden rounded-full bg-white dark:bg-slate-800">
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo} alt="Profile photo" className="h-full w-full object-cover" />
        ) : (
          <span className="flex h-full w-full items-center justify-center bg-gradient-to-br from-red-500 to-red-800 text-sm font-bold text-white">
            {initial}
          </span>
        )}
      </span>
      <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white dark:border-slate-900 bg-emerald-500" />
    </motion.span>
  );
}