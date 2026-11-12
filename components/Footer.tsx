'use client';

import Link from 'next/link';
import { Droplet, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-300 py-8 border-t border-slate-200 dark:border-slate-800 transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          
          {/* Brand Section */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-red-600 text-white">
                <Droplet className="h-3.5 w-3.5" fill="white" />
              </div>
              <span className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                BloodConnect <span className="text-red-600 dark:text-red-500">BD</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs">
              জরুরি রক্তদাতা ও রক্তগ্রহীতাদের সংযুক্ত করার সহজ প্ল্যাটফর্ম। একসাথে জীবন বাঁচাই।
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-white mb-3">
              কুইক লিংক
            </h3>
            <ul className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
              <li>
                <Link href="/donors" className="hover:text-red-600 dark:hover:text-red-400 transition-colors">
                  ডোনার খুঁজুন
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-red-600 dark:hover:text-red-400 transition-colors">
                  ডোনার হন
                </Link>
              </li>
              <li>
                <Link href="/requests" className="hover:text-red-600 dark:hover:text-red-400 transition-colors">
                  চলমান রিকোয়েস্ট
                </Link>
              </li>
              <li>
                <Link href="/request-blood" className="hover:text-red-600 dark:hover:text-red-400 transition-colors">
                  রক্তের অনুরোধ করুন
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-white mb-3">
              যোগাযোগ
            </h3>
            <ul className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
              <li className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-red-600 dark:text-red-500 shrink-0" />
                <span>support: tarikulislam870265@gmail.com</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-red-600 dark:text-red-500 shrink-0" />
                <span>+880 1943566544</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-red-600 dark:text-red-500 shrink-0" />
                <span>kishoreganj, bangladesh </span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-4 border-t border-slate-200 dark:border-slate-800 text-center text-[11px] text-slate-400 dark:text-slate-500">
          © {new Date().getFullYear()} BloodConnect BD. All rights reserved.
        </div>
      </div>
    </footer>
  );
}