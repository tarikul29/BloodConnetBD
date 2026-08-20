'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Droplet, Info } from 'lucide-react';

interface CompatibilityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const COMPATIBILITY_DATA = [
  { group: 'O-', giveTo: 'সব গ্রুপ (Universal Donor)', receiveFrom: 'O-' },
  { group: 'O+', giveTo: 'O+, A+, B+, AB+', receiveFrom: 'O+, O-' },
  { group: 'A-', giveTo: 'A+, A-, AB+, AB-', receiveFrom: 'A-, O-' },
  { group: 'A+', giveTo: 'A+, AB+', receiveFrom: 'A+, A-, O+, O-' },
  { group: 'B-', giveTo: 'B+, B-, AB+, AB-', receiveFrom: 'B-, O-' },
  { group: 'B+', giveTo: 'B+, AB+', receiveFrom: 'B+, B-, O+, O-' },
  { group: 'AB-', giveTo: 'AB+, AB-', receiveFrom: 'AB-, A-, B-, O-' },
  { group: 'AB+', giveTo: 'AB+', receiveFrom: 'সব গ্রুপ (Universal Receiver)' },
];

export default function CompatibilityModal({ isOpen, onClose }: CompatibilityModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop/Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-rose-100 dark:border-slate-800 z-10 overflow-hidden max-h-[90vh] flex flex-col"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-rose-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-rose-50 dark:bg-rose-950/50 text-red-600 dark:text-red-400 rounded-2xl">
                  <Droplet className="h-6 w-6 fill-red-600 dark:fill-red-500" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">রক্তের গ্রুপের সামঞ্জস্যতা চার্ট</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">কোন গ্রুপের রক্ত কে দিতে বা নিতে পারবে দেখুন</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Compatibility Table */}
            <div className="overflow-y-auto my-4 pr-1 rounded-2xl border border-slate-100 dark:border-slate-800">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-rose-50/70 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 font-bold sticky top-0">
                  <tr>
                    <th className="p-3.5">গ্রুপ</th>
                    <th className="p-3.5">কাকে রক্ত দিতে পারবে</th>
                    <th className="p-3.5">কার থেকে রক্ত নিতে পারবে</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {COMPATIBILITY_DATA.map((item) => (
                    <tr key={item.group} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="p-3.5 font-black text-red-600 dark:text-red-400 font-mono text-sm">
                        {item.group}
                      </td>
                      <td className="p-3.5 text-slate-700 dark:text-slate-300 font-medium">{item.giveTo}</td>
                      <td className="p-3.5 text-slate-700 dark:text-slate-300 font-medium">{item.receiveFrom}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Warning Note */}
            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/50 p-3 rounded-2xl flex items-start gap-2.5 text-amber-800 dark:text-amber-300 text-xs">
              <Info className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <span>জরুরি পরিস্থিতিতে সবসময় অভিজ্ঞ চিকিৎসক বা ব্লাড ব্যাংকের পরামর্শ অনুযায়ী রক্ত আদান-প্রদান করুন।</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}