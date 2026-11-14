'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Droplet, MapPin, Phone, Building2, User, FileText, Minus, Plus } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { AuthShell, Field, FormError, FormHeading, Section, SubmitButton, SuccessScreen, inputCls } from '@/components/FormUI';
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
          const response = await fetch('/api/nearby-hospitals', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ lat, lng }),
          });

          if (!response.ok) {
            throw new Error('API error');
          }

          const hospitals = await response.json();

          if (hospitals.length > 0) {
            setNearbyHospitals(hospitals);
            setShowHospitalSuggestions(true);
          } else {
            setError('কাছাকাছি কোনো হাসপাতাল পাওয়া যায়নি। হাসপাতালের নাম ম্যানুয়ালি লিখুন।');
          }
        } catch (err) {
  console.error(err);
  // Overpass ফেল করলেও লোকেশন সেভ থাকবে, শুধু হাসপাতাল সাজেস্ট আসবে না
  setError('কাছাকাছি হাসপাতাল খুঁজে পাওয়া যায়নি। হাসপাতালের নাম ম্যানুয়ালি লিখুন।');
} finally {
  setLocating(false);
}
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
      <SuccessScreen
        title="রিকোয়েস্ট সাবমিট হয়েছে!"
        text="আপনার রক্তের অনুরোধ এখন সক্রিয়। কাছাকাছি ডোনাররা দেখতে পাবেন এবং দ্রুত যোগাযোগ করবেন।"
        actions={[
          { href: '/requests', label: 'চলমান রিকোয়েস্ট দেখুন', primary: true },
          { href: '/donors', label: 'ডোনার তালিকা দেখুন' },
        ]}
      />
    );
  }

  // ==================== MAIN FORM ====================
  return (
    <AuthShell
      badge="জরুরি রক্তের অনুরোধ"
      title="একটি অনুরোধ,"
      accent="অনেক হাত এগিয়ে আসবে"
      subtitle="রোগীর তথ্য দিন। কাছাকাছি ডোনাররা দেখতে পাবেন এবং সরাসরি আপনাকে কল করবেন।"
      perks={[
        'অনুরোধ সঙ্গে সঙ্গে চলমান তালিকায় দেখা যাবে',
        'কাছের ডোনাররা সরাসরি কল বা SMS করবেন',
        'WhatsApp ও Facebook-এ এক ট্যাপে শেয়ার করুন',
      ]}
      footerNote="BloodConnect BD — জীবন বাঁচানোর প্ল্যাটফর্ম"
    >
      <FormHeading
        pill="জরুরি · বিনামূল্যে"
        title="জরুরি রক্তের"
        accent="অনুরোধ"
        subtitle="তথ্য দিন, কাছাকাছি ডোনাররা দেখতে পাবেন।"
        badges={['দ্রুত সাড়া', 'জরুরি']}
      />

      <form onSubmit={handleSubmit} className="relative space-y-6">
        {/* রোগী ও হাসপাতাল */}
        <Section tone="red" title="রোগী ও হাসপাতাল" step="ধাপ ১" note="রোগীর নাম ও যে হাসপাতালে ভর্তি আছেন সেটি লিখুন।">
          <Field label="রোগীর নাম" icon={User}>
            <input
              required
              value={form.patient_name}
              onChange={(e) => setForm({ ...form, patient_name: e.target.value })}
              placeholder="যেমন: আব্দুল করিম"
              className={inputCls}
            />
          </Field>
          <Field label="হাসপাতালের নাম" icon={Building2}>
            <input
              required
              value={form.hospital_name}
              onChange={(e) => setForm({ ...form, hospital_name: e.target.value })}
              placeholder="যেমন: ঢাকা মেডিকেল কলেজ হাসপাতাল"
              className={inputCls}
            />
          </Field>
          <Field label="রোগীর অবস্থা / নোট (ঐচ্ছিক)" icon={FileText}>
            <textarea
              value={form.patient_notes}
              onChange={(e) => setForm({ ...form, patient_notes: e.target.value })}
              placeholder="যেমন: হিমোগ্লোবিন লেভেল ৬.৫, রোগী দুর্বল..."
              rows={3}
              className={`${inputCls} resize-none`}
            />
          </Field>
        </Section>

        {/* রক্তের প্রয়োজন */}
        <Section tone="gold" title="কত রক্ত লাগবে" step="ধাপ ২" note="গ্রুপ বেছে নিন আর কত ব্যাগ দরকার সেটি ঠিক করুন।">
          <div>
            <label className="mb-2 ml-1 flex items-center gap-1.5 text-[13px] font-bold text-slate-700 dark:text-slate-300">
              <Droplet className="h-4 w-4 text-red-600" fill="currentColor" /> রক্তের গ্রুপ
            </label>
            <div className="grid grid-cols-4 gap-2.5">
              {BLOOD_GROUPS.map((bg) => {
                const active = form.blood_group === bg;
                return (
                  <motion.button
                    key={bg}
                    type="button"
                    onClick={() => setForm({ ...form, blood_group: bg })}
                    whileHover={{ y: -3 }}
                    whileTap={{ scale: 0.93 }}
                    className={`rounded-2xl py-3 text-lg font-extrabold transition-shadow ${
                      active
                        ? 'bg-gradient-to-br from-red-500 via-red-600 to-red-900 text-white shadow-lg shadow-red-300/60 dark:shadow-none'
                        : 'bg-white text-red-800 shadow-sm shadow-orange-200/60 dark:bg-slate-800 dark:text-red-300 dark:shadow-none'
                    }`}
                  >
                    {bg}
                  </motion.button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="mb-2 ml-1 block text-[13px] font-bold text-slate-700 dark:text-slate-300">ব্যাগ প্রয়োজন</label>
            <div className="flex items-center gap-4">
              <motion.button
                type="button"
                whileTap={{ scale: 0.9 }}
                onClick={() => setForm({ ...form, bags_needed: Math.max(1, form.bags_needed - 1) })}
                className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-red-700 shadow-md dark:bg-slate-800"
                aria-label="কমান"
              >
                <Minus className="h-5 w-5" />
              </motion.button>
              <input
                type="number"
                min={1}
                required
                value={form.bags_needed}
                onChange={(e) => setForm({ ...form, bags_needed: Number(e.target.value) })}
                className="w-24 rounded-2xl border-[1.5px] border-orange-100 bg-white py-3 text-center text-2xl font-extrabold text-red-700 focus:border-red-500 focus:outline-none focus:ring-4 focus:ring-red-500/15 dark:border-slate-700 dark:bg-slate-800 dark:text-red-300"
              />
              <motion.button
                type="button"
                whileTap={{ scale: 0.9 }}
                onClick={() => setForm({ ...form, bags_needed: form.bags_needed + 1 })}
                className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-red-800 text-white shadow-md"
                aria-label="বাড়ান"
              >
                <Plus className="h-5 w-5" />
              </motion.button>
              <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">ব্যাগ</span>
            </div>
          </div>
        </Section>

        {/* যোগাযোগ ও লোকেশন */}
        <Section tone="green" title="যোগাযোগ ও লোকেশন" step="ধাপ ৩" note="ডোনাররা এই নম্বরে সরাসরি কল করবেন। লোকেশন দিলে কাছের হাসপাতালও খুঁজে দেওয়া হবে।">
          <Field label="যোগাযোগের নম্বর" icon={Phone}>
            <input
              required
              value={form.contact_phone}
              onChange={(e) => setForm({ ...form, contact_phone: e.target.value })}
              placeholder="01XXXXXXXXX"
              className={inputCls}
            />
          </Field>

          <div>
            <label className="mb-1.5 ml-1 block text-[13px] font-bold text-slate-700 dark:text-slate-300">হাসপাতালের লোকেশন</label>
            <motion.button
              type="button"
              onClick={handleUseLocation}
              disabled={locating}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.97 }}
              className={`flex w-full items-center justify-center gap-2.5 rounded-2xl py-3.5 text-[15px] font-extrabold text-white shadow-lg disabled:opacity-60 ${
                coords ? 'bg-gradient-to-r from-emerald-500 to-teal-700' : 'bg-gradient-to-r from-teal-600 to-emerald-900'
              }`}
            >
              <MapPin className="h-5 w-5" />
              {locating ? 'লোকেশন ও হাসপাতাল খোঁজা হচ্ছে...' : coords ? 'লোকেশন যুক্ত হয়েছে ✓' : 'বর্তমান লোকেশন ব্যবহার করুন'}
            </motion.button>
          </div>

          {/* কাছের হাসপাতাল সাজেশন */}
          <AnimatePresence>
            {showHospitalSuggestions && nearbyHospitals.length > 0 && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                <div className="rounded-2xl border border-emerald-200 bg-white p-3 shadow-sm dark:border-emerald-900/50 dark:bg-slate-800">
                  <p className="mb-2 ml-1 text-xs font-bold text-emerald-800 dark:text-emerald-400">কাছাকাছি হাসপাতাল (সিলেক্ট করুন):</p>
                  <div className="max-h-52 space-y-1 overflow-y-auto">
                    {nearbyHospitals.map((hospital, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => selectHospital(hospital)}
                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-slate-700 transition-colors hover:bg-gradient-to-r hover:from-red-50 hover:to-amber-50 hover:text-red-700 dark:text-slate-300 dark:hover:bg-red-950/40 dark:hover:text-red-400"
                      >
                        <Building2 className="h-4 w-4 shrink-0 text-red-500" />
                        {hospital.name}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Section>

        <FormError error={error} />

        <SubmitButton loading={submitting} loadingText="সাবমিট হচ্ছে...">
          রক্তের অনুরোধ পাঠান
        </SubmitButton>
      </form>
    </AuthShell>
  );
}