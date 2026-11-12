'use client';

import { Droplet, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import ThemeToggle from './ThemeToggle';

const NAV_LINKS = [
  { href: '/donors', label: 'Find Donors' },
  { href: '/register', label: 'Become a Donor' },
  { href: '/requests', label: 'Active Requests' },
];

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-100 dark:border-slate-800 shadow-sm transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          
          {/* Logo */}
          <a href="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="rounded-xl bg-gradient-to-br from-red-500 to-rose-600 p-2 shadow-md shadow-red-200 dark:shadow-none">
              <Droplet className="h-5 w-5 text-white" fill="white" />
            </div>
            <span className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
              BloodConnect <span className="text-red-600 dark:text-red-500">BD</span>
            </span>
          </a>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              return (
                <a
                  key={link.href}
                  href={link.href}
                  className={`relative px-4 py-2 text-sm font-medium rounded-full transition-all duration-300 ${
                    isActive
                      ? 'text-red-600 dark:text-red-500 font-semibold'
                      : 'text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <motion.div
                      layoutId="active-nav"
                      className="absolute bottom-1 left-3 right-3 h-0.5 rounded-full bg-gradient-to-r from-red-500 to-rose-500"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </a>
              );
            })}
          </nav>

          {/* Desktop Buttons & Theme Toggle */}
          <div className="hidden md:flex items-center gap-3 shrink-0">
            <ThemeToggle />

            <a
              href="/login"
              className="inline-flex items-center rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-5 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:border-red-300 hover:text-red-600 transition-all"
            >
              Login
            </a>
            <a
              href="/request-blood"
              className="inline-flex items-center rounded-full bg-gradient-to-r from-red-600 to-rose-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-red-200 dark:shadow-none hover:shadow-lg transition-all"
            >
              Request Blood
            </a>
          </div>

          {/* Mobile Right Action Area */}
          <div className="flex md:hidden items-center gap-2">
            <ThemeToggle />

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden overflow-hidden"
            >
              <div className="pb-5 pt-2 flex flex-col gap-2">
                {NAV_LINKS.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className={`px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                      pathname === link.href
                        ? 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    {link.label}
                  </a>
                ))}
                <div className="flex flex-col gap-2 mt-2 px-1">
                  <a
                    href="/login"
                    className="inline-flex justify-center items-center rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-5 py-3 text-sm font-semibold text-slate-700 dark:text-slate-200"
                  >
                    Login
                  </a>
                  <a
                    href="/request-blood"
                    className="inline-flex justify-center items-center rounded-full bg-gradient-to-r from-red-600 to-rose-600 px-5 py-3 text-sm font-semibold text-white"
                  >
                    Request Blood
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}