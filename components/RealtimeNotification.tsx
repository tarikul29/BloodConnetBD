'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Bell, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type BloodRequest = {
  id: string;
  patient_name: string;
  hospital_name: string;
  blood_group: string;
  bags_needed: number;
  contact_phone: string;
  created_at: string;
};

export default function RealtimeNotification() {
  const [notifications, setNotifications] = useState<BloodRequest[]>([]);
  const supabase = createClient();

  useEffect(() => {
    // নতুন রক্তের রিকোয়েস্ট শুনবে
    const channel = supabase
      .channel('blood-requests-channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'blood_requests',
        },
        (payload) => {
          const newRequest = payload.new as BloodRequest;

          // নতুন নোটিফিকেশন যোগ করা
          setNotifications((prev) => [newRequest, ...prev].slice(0, 5));

          // ব্রাউজার নোটিফিকেশন (অনুমতি থাকলে)
          if (Notification.permission === 'granted') {
            new Notification('নতুন রক্তের অনুরোধ!', {
              body: `${newRequest.patient_name} - ${newRequest.blood_group} (${newRequest.hospital_name})`,
              icon: '/favicon.ico',
            });
          }
        }
      )
      .subscribe();

    // ব্রাউজার নোটিফিকেশন পারমিশন চাওয়া
    if (typeof window !== 'undefined' && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  function removeNotification(id: string) {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }

  return (
    <div className="fixed top-20 right-4 z-50 space-y-3 max-w-sm w-full">
      <AnimatePresence>
        {notifications.map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="bg-white dark:bg-slate-900 border border-red-200 dark:border-red-900 rounded-2xl shadow-xl p-4"
          >
            <div className="flex items-start gap-3">
              <div className="bg-red-100 dark:bg-red-950 p-2 rounded-full">
                <Bell className="h-5 w-5 text-red-600" />
              </div>

              <div className="flex-1">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  নতুন রক্তের অনুরোধ!
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                  <span className="font-semibold">{item.patient_name}</span> —{' '}
                  <span className="text-red-600 font-bold">{item.blood_group}</span>
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {item.hospital_name} • {item.bags_needed} ব্যাগ
                </p>

                <div className="flex gap-2 mt-3">
                  <a
                    href={`tel:${item.contact_phone}`}
                    className="text-xs bg-red-600 text-white px-3 py-1.5 rounded-lg font-medium"
                  >
                    কল করুন
                  </a>
                  <a
                    href="/requests"
                    className="text-xs border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-lg"
                  >
                    বিস্তারিত
                  </a>
                </div>
              </div>

              <button
                onClick={() => removeNotification(item.id)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}