import Link from 'next/link';
import { Home, Search, Droplet } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata = { title: 'পেজ পাওয়া যায়নি | BloodConnect BD' };

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="relative flex min-h-[70vh] items-center justify-center overflow-hidden bg-gradient-to-b from-rose-50 via-white to-orange-50 px-4 py-20 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900">
        <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-red-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 bottom-10 h-72 w-72 rounded-full bg-orange-400/10 blur-3xl" />
        <div className="relative max-w-lg text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-red-800 shadow-xl shadow-red-500/30">
            <Droplet className="h-10 w-10 fill-white text-white" />
          </div>
          <p className="bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-7xl font-extrabold text-transparent">404</p>
          <h1 className="mt-3 text-2xl font-extrabold text-slate-900 dark:text-white">পেজটি খুঁজে পাওয়া যায়নি</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            আপনি যে লিংকে গিয়েছেন সেটি হয়তো সরানো হয়েছে বা ঠিকানায় ভুল আছে।
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/" className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-red-600 to-red-800 px-6 py-3 font-bold text-white shadow-lg shadow-red-500/30 transition hover:scale-105">
              <Home className="h-4 w-4" /> হোমে ফিরুন
            </Link>
            <Link href="/donors" className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-red-200 bg-white px-6 py-3 font-bold text-red-700 transition hover:bg-red-50 dark:border-red-900 dark:bg-slate-900 dark:text-red-300">
              <Search className="h-4 w-4" /> ডোনার খুঁজুন
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}