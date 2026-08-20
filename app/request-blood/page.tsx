'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useAnimationControls } from 'framer-motion';
import { Droplet, MapPin, Phone, Building2, User, FileText, ArrowRight, CheckCircle2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import Header from '@/components/Header';
import type { BloodGroup } from '@/types/database';

const BLOOD_GROUPS: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function RequestBloodPage() {
  const [form, setForm] = useState({
    patient_name: '',
    hospital_name: '',
    blood_group: 'O+' as BloodGroup,
    bags_needed: 1,
    contact_phone: '',
    patient_notes: '',
  });

  const [locating, setLocating] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [nearbyHospitals, setNearbyHospitals] = useState<{ name: string; lat: number; lon: number }[]>([]);
  const [showHospitalSuggestions, setShowHospitalSuggestions] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const iconControls = useAnimationControls();

  useEffect(() => {
    iconControls.start({
      scale: [1, 1.08, 1],
      transition: { duration: 2.8, repeat: Infinity, ease: 'easeInOut' },
    });
  }, [iconControls]);

  async function handleUseLocation() {
    setLocating(true);
    setError(null);
    setNearbyHospitals([]);
    setShowHospitalSuggestions(false);

    if (!navigator.geolocation) {
      setError('আপনার ব্রাউজার লোকেশন সাপোর্ট করে না।');
      setLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setCoords({ lat, lng });

        try {
          const query = `
            [out:json][timeout:25];
            (
              node["amenity"="hospital"](around:1500,${lat},${lng});
              way["amenity"="hospital"](around:1500,${lat},${lng});
              node["amenity"="clinic"](around:1500,${lat},${lng});
            );
            out center;
          `;

          const response = await fetch('https://overpass-api.de/api/interpreter', {
            method: 'POST',
            body: query,
          });

          const data = await response.json();

          const hospitals = data.elements
            .map((el: any) => {
              const name =
                el.tags?.name ||
                el.tags?.['name:bn'] ||
                el.tags?.['name:en'] ||
                'অজানা হাসপাতাল';
              const hLat = el.lat || el.center?.lat;
              const hLon = el.lon || el.center?.lon;
              return { name, lat: hLat, lon: hLon };
            })
            .filter((h: any) => h.lat && h.lon)
            .slice(0, 8);

          if (hospitals.length > 0) {
            setNearbyHospitals(hospitals);
            setShowHospitalSuggestions(true);
          } else {
            setError('কাছাকাছি কোনো হাসপাতাল পাওয়া যায়নি। হাসপাতালের নাম ম্যানুয়ালি লিখুন।');
          }
        } catch (err) {
          console.error(err);
          setError('হাসপাতাল খুঁজতে সমস্যা হয়েছে। হাসপাতালের নাম ম্যানুয়ালি লিখুন।');
        }

        setLocating(false);
      },
      () => {
        setError('লোকেশন পাওয়া যায়নি। লোকেশন অ্যাক্সেসের অনুমতি দিন।');
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  }

  function selectHospital(hospital: { name: string; lat: number; lon: number }) {
    setForm({ ...form, hospital_name: hospital.name });
    setCoords({ lat: hospital.lat, lng: hospital.lon });
    setShowHospitalSuggestions(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!coords) {
      setError('অনুগ্রহ করে হাসপাতালের লোকেশন শেয়ার করুন।');
      return;
    }
    if (!/^01[3-9]\d{8}$/.test(form.contact_phone)) {
      setError('সঠিক বাংলাদেশি ফোন নম্বর দিন (যেমন 017XXXXXXXX)।');
      return;
    }

    setSubmitting(true);
    const supabase = createClient();

    const { error: insertError } = await supabase.from('blood_requests').insert({
      patient_name: form.patient_name,
      hospital_name: form.hospital_name,
      blood_group: form.blood_group,
      bags_needed: form.bags_needed,
      latitude: coords.lat,
      longitude: coords.lng,
      contact_phone: form.contact_phone,
      urgency_status: 'critical',
      patient_notes: form.patient_notes || null,
    });

    setSubmitting(false);

    if (insertError) {
      setError('কিছু একটা সমস্যা হয়েছে। আবার চেষ্টা করুন।');
      return;
    }

    setSuccess(true);
  }

  // ==================== SUCCESS SCREEN ====================
  if (success) {
    return (
      <main className="min-h-screen pt-16 relative overflow-hidden bg-[#fff5f5] dark:bg-slate-950 transition-colors">
        <div className="absolute inset-0 bg-gradient-to-br from-red-50 via-rose-50/80 to-orange-50/40 dark:from-red-950/20 dark:via-slate-950 dark:to-slate-950" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-red-200/40 dark:bg-red-900/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-rose-300/30 dark:bg-rose-900/10 rounded-full blur-[120px]" />

        <Header />

        <div className="relative z-10 flex items-center justify-center min-h-[85vh] px-4">
          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 100, damping: 18 }}
            className="w-full max-w-md"
          >
            <div className="relative bg-white/70 dark:bg-slate-900/80 backdrop-blur-2xl border border-white/80 dark:border-slate-800 rounded-[2.5rem] shadow-[0_25px_60px_-15px_rgba(220,38,38,0.15)] p-10 sm:p-12 text-center overflow-hidden">
              <div className="absolute -top-16 -right-16 w-40 h-40 bg-red-100/50 dark:bg-red-900/20 rounded-full blur-2xl" />

              <motion.div
                initial={{ scale: 0, rotate: -90 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 160, damping: 12 }}
                className="relative mx-auto mb-7 flex h-24 w-24 items-center justify-center"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-rose-600 rounded-full shadow-xl shadow-red-300/60 dark:shadow-none" />
                <div className="absolute inset-1 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="h-11 w-11 text-red-600 dark:text-red-500" strokeWidth={2.5} />
                </div>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="text-2xl sm:text-[1.7rem] font-bold text-slate-900 dark:text-white tracking-tight"
              >
                রিকোয়েস্ট সাবমিট হয়েছে!
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
                className="mt-3 text-slate-600 dark:text-slate-400 text-[15px] leading-relaxed max-w-xs mx-auto"
              >
                আপনার রক্তের অনুরোধ এখন সক্রিয়। কাছাকাছি ডোনাররা দেখতে পাবেন এবং দ্রুত যোগাযোগ করবেন।
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55 }}
                className="mt-8"
              >
                <motion.a
                  href="/requests"
                  whileHover={{ scale: 1.04, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 px-8 py-4 text-sm font-bold text-white shadow-xl shadow-red-200/80 dark:shadow-none"
                >
                  চলমান রিকোয়েস্ট দেখুন
                  <ArrowRight className="h-4 w-4" />
                </motion.a>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </main>
    );
  }

  // ==================== MAIN FORM ====================
  return (
    <main className="min-h-screen relative overflow-hidden bg-[#fff5f5] dark:bg-slate-950 transition-colors">
      <div className="absolute inset-0 bg-gradient-to-br from-red-50 via-rose-50/70 to-orange-50/30 dark:from-red-950/20 dark:via-slate-950 dark:to-slate-950" />
      <div className="absolute top-10 -left-20 w-80 h-80 bg-red-200/30 dark:bg-red-900/10 rounded-full blur-[100px]" />
      <div className="absolute bottom-20 -right-20 w-[28rem] h-[28rem] bg-rose-200/40 dark:bg-rose-900/10 rounded-full blur-[120px]" />

      <Header />

      <div className="relative z-10 mx-auto max-w-lg px-4 py-10 sm:py-14">
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 90, damping: 18 }}
        >
          <div className="relative bg-white/75 dark:bg-slate-900/80 backdrop-blur-2xl border border-white/80 dark:border-slate-800 rounded-[2.5rem] shadow-[0_25px_60px_-15px_rgba(220,38,38,0.12)] p-8 sm:p-10 overflow-hidden">
            <div className="absolute -top-20 -right-20 w-48 h-48 bg-gradient-to-br from-red-100/60 to-rose-100/40 dark:from-red-900/20 dark:to-rose-900/10 rounded-full blur-3xl" />

            {/* Header */}
            <div className="relative text-center mb-9">
              <motion.div
                animate={iconControls}
                className="mx-auto mb-5 flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 shadow-xl shadow-red-300/50 dark:shadow-none"
              >
                <Droplet className="h-9 w-9 text-white" fill="currentColor" />
              </motion.div>

              <h1 className="text-2xl sm:text-[1.75rem] font-bold text-slate-900 dark:text-white tracking-tight">
                জরুরি রক্তের অনুরোধ
              </h1>
              <p className="mt-2 text-slate-500 dark:text-slate-400 text-sm">
                তথ্য দিন, কাছাকাছি ডোনাররা দেখতে পাবেন
              </p>
            </div>

            <form onSubmit={handleSubmit} className="relative space-y-5">
              {/* Patient Name */}
              <div>
                <label className="block text-[13px] font-semibold text-slate-600 dark:text-slate-300 mb-1.5 ml-1">
                  রোগীর নাম
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-slate-400 dark:text-slate-500 group-focus-within:text-red-500 transition-colors" />
                  </div>
                  <input
                    required
                    value={form.patient_name}
                    onChange={(e) => setForm({ ...form, patient_name: e.target.value })}
                    placeholder="যেমন: আব্দুল করিম"
                    className="w-full rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-800/90 pl-11 pr-4 py-3.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-[3px] focus:ring-red-500/20 focus:border-red-400 dark:focus:border-red-500 transition-all duration-300 shadow-sm"
                  />
                </div>
              </div>

              {/* Hospital Name */}
              <div>
                <label className="block text-[13px] font-semibold text-slate-600 dark:text-slate-300 mb-1.5 ml-1">
                  হাসপাতালের নাম
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Building2 className="h-4 w-4 text-slate-400 dark:text-slate-500 group-focus-within:text-red-500 transition-colors" />
                  </div>
                  <input
                    required
                    value={form.hospital_name}
                    onChange={(e) => setForm({ ...form, hospital_name: e.target.value })}
                    placeholder="যেমন: ঢাকা মেডিকেল কলেজ হাসপাতাল"
                    className="w-full rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-800/90 pl-11 pr-4 py-3.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-[3px] focus:ring-red-500/20 focus:border-red-400 dark:focus:border-red-500 transition-all duration-300 shadow-sm"
                  />
                </div>
              </div>

              {/* Blood Group + Bags */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-semibold text-slate-600 dark:text-slate-300 mb-1.5 ml-1">
                    রক্তের গ্রুপ
                  </label>
                  <select
                    value={form.blood_group}
                    onChange={(e) => setForm({ ...form, blood_group: e.target.value as BloodGroup })}
                    className="w-full rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-800/90 px-4 py-3.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-[3px] focus:ring-red-500/20 focus:border-red-400 dark:focus:border-red-500 transition-all duration-300 shadow-sm"
                  >
                    {BLOOD_GROUPS.map((bg) => (
                      <option key={bg} value={bg} className="dark:bg-slate-900 dark:text-white">
                        {bg}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[13px] font-semibold text-slate-600 dark:text-slate-300 mb-1.5 ml-1">
                    ব্যাগ প্রয়োজন
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={form.bags_needed}
                    onChange={(e) => setForm({ ...form, bags_needed: Number(e.target.value) })}
                    className="w-full rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-800/90 px-4 py-3.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-[3px] focus:ring-red-500/20 focus:border-red-400 dark:focus:border-red-500 transition-all duration-300 shadow-sm"
                  />
                </div>
              </div>

              {/* Contact Phone */}
              <div>
                <label className="block text-[13px] font-semibold text-slate-600 dark:text-slate-300 mb-1.5 ml-1">
                  যোগাযোগের নম্বর
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Phone className="h-4 w-4 text-slate-400 dark:text-slate-500 group-focus-within:text-red-500 transition-colors" />
                  </div>
                  <input
                    required
                    value={form.contact_phone}
                    onChange={(e) => setForm({ ...form, contact_phone: e.target.value })}
                    placeholder="01XXXXXXXXX"
                    className="w-full rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-800/90 pl-11 pr-4 py-3.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-[3px] focus:ring-red-500/20 focus:border-red-400 dark:focus:border-red-500 transition-all duration-300 shadow-sm"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-[13px] font-semibold text-slate-600 dark:text-slate-300 mb-1.5 ml-1">
                  রোগীর অবস্থা / নোট (ঐচ্ছিক)
                </label>
                <div className="relative group">
                  <div className="absolute top-3.5 left-4 pointer-events-none">
                    <FileText className="h-4 w-4 text-slate-400 dark:text-slate-500 group-focus-within:text-red-500 transition-colors" />
                  </div>
                  <textarea
                    value={form.patient_notes}
                    onChange={(e) => setForm({ ...form, patient_notes: e.target.value })}
                    placeholder="যেমন: হিমোগ্লোবিন লেভেল ৬.৫, রোগী দুর্বল..."
                    rows={3}
                    className="w-full rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-800/90 pl-11 pr-4 py-3.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-[3px] focus:ring-red-500/20 focus:border-red-400 dark:focus:border-red-500 transition-all duration-300 shadow-sm resize-none"
                  />
                </div>
              </div>

              {/* Location Button */}
              <div>
                <label className="block text-[13px] font-semibold text-slate-600 dark:text-slate-300 mb-1.5 ml-1">
                  হাসপাতালের লোকেশন
                </label>
                <motion.button
                  type="button"
                  onClick={handleUseLocation}
                  disabled={locating}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full flex items-center justify-center gap-2.5 rounded-2xl border py-3.5 text-sm font-medium transition-all duration-300 ${
                    coords
                      ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 shadow-sm'
                      : 'border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm'
                  } disabled:opacity-60`}
                >
                  <MapPin className="h-4 w-4" />
                  {locating
                    ? 'লোকেশন ও হাসপাতাল খোঁজা হচ্ছে...'
                    : coords
                    ? 'লোকেশন যুক্ত হয়েছে ✓'
                    : 'বর্তমান লোকেশন ব্যবহার করুন'}
                </motion.button>
              </div>

              {/* Nearby Hospital Suggestions */}
              <AnimatePresence>
                {showHospitalSuggestions && nearbyHospitals.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-800/90 p-3 shadow-sm">
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 ml-1">
                        কাছাকাছি হাসপাতাল সাজেস্ট (সিলেক্ট করুন):
                      </p>
                      <div className="space-y-1 max-h-52 overflow-y-auto">
                        {nearbyHospitals.map((hospital, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => selectHospital(hospital)}
                            className="w-full text-left px-3 py-2.5 rounded-xl text-sm text-slate-700 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-700 dark:hover:text-red-400 transition-colors"
                          >
                            {hospital.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-900/50 rounded-2xl px-4 py-3">
                      {error}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={submitting}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 py-4 text-sm font-bold text-white shadow-xl shadow-red-200/70 dark:shadow-none disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {submitting ? (
                    'সাবমিট হচ্ছে...'
                  ) : (
                    <>
                      রক্তের অনুরোধ পাঠান
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                    </>
                  )}
                </span>
              </motion.button>
            </form>
          </div>
        </motion.div>

        <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-8">
          BloodConnect BD — জীবন বাঁচানোর প্ল্যাটফর্ম
        </p>
      </div>
    </main>
  );
}