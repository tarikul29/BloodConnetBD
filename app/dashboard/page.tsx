'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Droplet, User, Phone, Mail, LogOut, CheckCircle2, XCircle, Image as ImageIcon, Camera, CalendarDays } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { checkDonorEligibility } from '@/lib/eligibility';
import Header from '@/components/Header';
import { Field, Section, FormError, inputCls, selectCls } from '@/components/FormUI';
import { motion } from 'framer-motion';
import type { Donor, BloodGroup } from '@/types/database';

const BLOOD_GROUPS: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [donor, setDonor] = useState<Donor | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  useEffect(() => {
    async function loadDonor() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      const { data } = await supabase
        .from('donors')
        .select('*')
        .eq('id', user.id)
        .single();

      setDonor(data);
      setLoading(false);
    }
    loadDonor();
  }, [router]);

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  async function handleSave() {
    if (!donor) return;
    setSaving(true);
    setMessage(null);
    const supabase = createClient();

    let photo_url = donor.photo_url;

    if (photoFile) {
      const fileExt = photoFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('donor-photos')
        .upload(fileName, photoFile);

      if (!uploadError) {
        const { data: publicUrlData } = supabase.storage
          .from('donor-photos')
          .getPublicUrl(fileName);
        photo_url = publicUrlData.publicUrl;
      }
    }

    const { data, error } = await supabase
      .from('donors')
      .update({
        full_name: donor.full_name,
        phone: donor.phone,
        blood_group: donor.blood_group,
        last_donation_date: donor.last_donation_date,
        is_available: donor.is_available,
        photo_url,
      })
      .eq('id', donor.id)
      .select('id');

    setSaving(false);

    if (error || !data || data.length === 0) {
      setMessage('সংরক্ষণ করা যায়নি। আবার চেষ্টা করুন।');
      return;
    }

    setDonor({ ...donor, photo_url });
    setPhotoFile(null);
    setMessage('সফলভাবে সংরক্ষণ হয়েছে! হোম পেজে নিয়ে যাওয়া হচ্ছে...');
    window.dispatchEvent(new Event('donor-availability-changed'));
    setTimeout(() => {
      router.push('/');
      router.refresh();
    }, 1200);
  }

  async function handleToggleAvailable() {
    if (!donor) return;
    const next = !donor.is_available;
    const previous = donor;
    setDonor({ ...donor, is_available: next });
    setMessage(null);

    const supabase = createClient();
    const { data, error } = await supabase
      .from('donors')
      .update({ is_available: next })
      .eq('id', donor.id)
      .select('id');

    if (error || !data || data.length === 0) {
      setDonor(previous);
      setMessage('উপলব্ধতা বদলানো যায়নি। আবার চেষ্টা করুন।');
      return;
    }

    if (!next) {
      await supabase.from('donor_live_locations').delete().eq('donor_id', donor.id);
    }
    window.dispatchEvent(new Event('donor-availability-changed'));
    setMessage(next ? 'সফলভাবে চালু হয়েছে। এখন আপনি তালিকায় "রক্ত দিতে প্রস্তুত" দেখাবেন।' : 'সফলভাবে বন্ধ হয়েছে। এখন আপনি "অনুপলব্ধ" দেখাবেন।');
  }

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  }

  const pageBg =
    'min-h-screen pt-16 bg-gradient-to-b from-orange-50 via-rose-50 to-amber-50 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 transition-colors';

  if (loading) {
    return (
      <main className={pageBg}>
        <Header />
        <p className="py-24 text-center text-slate-500 dark:text-slate-400">লোড হচ্ছে...</p>
      </main>
    );
  }

  if (!donor) {
    return (
      <main className={pageBg}>
        <Header />
        <div className="mx-auto max-w-lg px-4 py-24 text-center">
          <p className="text-slate-600 dark:text-slate-400">আপনার ডোনার প্রোফাইল খুঁজে পাওয়া যায়নি।</p>
        </div>
      </main>
    );
  }

  const eligibility = checkDonorEligibility(donor.last_donation_date);
  const isOk = !!message && message.includes('সফল');

  return (
    <main className={`${pageBg} relative overflow-hidden`}>
      <Header />

      <motion.div
        aria-hidden
        animate={{ x: [0, 50, -30, 0], y: [0, -30, 30, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        className="pointer-events-none absolute -left-24 top-10 h-[24rem] w-[24rem] rounded-full bg-gradient-to-br from-orange-300 to-red-600 opacity-25 blur-3xl"
      />
      <motion.div
        aria-hidden
        animate={{ x: [0, -50, 30, 0], y: [0, 40, -20, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
        className="pointer-events-none absolute -right-20 top-40 h-[22rem] w-[22rem] rounded-full bg-gradient-to-br from-yellow-200 to-amber-500 opacity-35 blur-3xl"
      />

      <div className="relative mx-auto max-w-2xl px-4 py-10 sm:py-14">
        {/* প্রোফাইল ব্যানার */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="relative mb-6 overflow-hidden rounded-[2rem] bg-gradient-to-br from-red-900 via-red-600 to-orange-500 p-6 text-white shadow-2xl shadow-red-300/40 dark:shadow-none sm:p-8"
        >
          <div
            className="absolute inset-0 opacity-20"
            style={{ backgroundImage: 'radial-gradient(circle at 12px 12px,#fff 2px,transparent 3px)', backgroundSize: '36px 36px' }}
          />
          <motion.div
            animate={{ x: [0, 40, -20, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -right-10 -top-16 h-56 w-56 rounded-full bg-yellow-300/40 blur-3xl"
          />
          <div className="relative flex flex-wrap items-center gap-5">
            <label htmlFor="photo" className="group cursor-pointer">
              <div className="relative h-28 w-28">
                <motion.span
                  aria-hidden
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-0 rounded-full"
                  style={{ background: 'conic-gradient(#ffd35e,#fff,#2fa886,#ffd35e)' }}
                />
                <span className="absolute inset-[4px] flex items-center justify-center overflow-hidden rounded-full bg-white">
                  {photoPreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={photoPreview} alt="preview" className="h-full w-full object-cover" />
                  ) : donor.photo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={donor.photo_url} alt={donor.full_name} className="h-full w-full object-cover" />
                  ) : (
                    <ImageIcon className="h-9 w-9 text-red-400" />
                  )}
                </span>
                <span className="absolute bottom-0 right-0 flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-yellow-300 to-amber-500 text-slate-900 shadow-lg transition-transform group-hover:scale-110">
                  <Camera className="h-4 w-4" />
                </span>
              </div>
            </label>
            <input id="photo" type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />

            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold uppercase tracking-wider text-yellow-200">আমার প্রোফাইল</p>
              <h1 className="mt-1 break-words text-2xl font-extrabold leading-[1.4] sm:text-3xl">{donor.full_name}</h1>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1 text-sm font-extrabold text-red-700">
                  <Droplet className="h-3.5 w-3.5" fill="currentColor" /> {donor.blood_group}
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-sm font-bold ${
                    donor.is_available ? 'bg-emerald-400/90 text-emerald-950' : 'bg-white/25 text-white'
                  }`}
                >
                  {donor.is_available ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                  {donor.is_available ? 'রক্ত দিতে প্রস্তুত' : 'বিরতিতে আছেন'}
                </span>
              </div>
              <p className="mt-2 text-xs text-red-50/90">ছবি বদলাতে ক্যামেরা আইকনে চাপুন</p>
            </div>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 self-start rounded-full bg-white/20 px-4 py-2 text-sm font-bold text-white backdrop-blur-md transition-colors hover:bg-white/35"
            >
              <LogOut className="h-4 w-4" />
              লগ আউট
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="space-y-5 rounded-[2rem] border border-orange-100 bg-gradient-to-b from-white/95 to-rose-50/80 p-5 shadow-xl shadow-red-200/30 backdrop-blur-xl dark:border-slate-800 dark:from-slate-900 dark:to-slate-900 dark:shadow-none sm:p-7"
        >
          <Section tone="red" title="ব্যক্তিগত তথ্য" note="আপনার নাম ও ফোন নম্বর বদলাতে পারবেন। ইমেইল বদলানো যায় না।">
            <Field label="পূর্ণ নাম" icon={User}>
              <input
                value={donor.full_name}
                onChange={(e) => setDonor({ ...donor, full_name: e.target.value })}
                className={inputCls}
              />
            </Field>
            <Field label="ফোন নম্বর" icon={Phone}>
              <input
                value={donor.phone}
                onChange={(e) => setDonor({ ...donor, phone: e.target.value })}
                className={inputCls}
              />
            </Field>
            <Field label="ইমেইল" icon={Mail}>
              <input value={donor.email ?? ''} disabled className={inputCls} />
            </Field>
          </Section>

          <Section tone="gold" title="রক্তের তথ্য" note="রক্তের গ্রুপ ও শেষ রক্তদানের তারিখ ঠিক রাখুন।">
            <div>
              <label className="mb-1.5 ml-1 flex items-center gap-1.5 text-[13px] font-bold text-slate-700 dark:text-slate-300">
                <Droplet className="h-4 w-4 text-red-600" fill="currentColor" /> রক্তের গ্রুপ
              </label>
              <select
                value={donor.blood_group}
                onChange={(e) => setDonor({ ...donor, blood_group: e.target.value as BloodGroup })}
                className={selectCls}
              >
                {BLOOD_GROUPS.map((bg) => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>
            <Field label="শেষ রক্তদানের তারিখ" icon={CalendarDays}>
              <input
                type="date"
                value={donor.last_donation_date ?? ''}
                onChange={(e) => setDonor({ ...donor, last_donation_date: e.target.value })}
                max={new Date().toISOString().split('T')[0]}
                className={inputCls}
              />
            </Field>
            {!eligibility.isEligible && (
              <p className="rounded-2xl bg-amber-100 px-4 py-2.5 text-sm font-semibold text-amber-800 dark:bg-amber-950/50 dark:text-amber-300">
                {eligibility.daysRemaining} দিন পর আপনি আবার রক্তদানে প্রস্তুত হবেন।
              </p>
            )}
          </Section>

          <Section tone="green" title="উপলব্ধতা" note='চালু থাকলে আপনার ফোনের বর্তমান লোকেশন থেকে দূরত্ব দেখানো হবে। বন্ধ রাখলে তালিকায় "অনুপলব্ধ" দেখাবে ও লোকেশন শেয়ার বন্ধ হবে।'>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-base font-extrabold text-slate-900 dark:text-white">রক্তদানে উপলব্ধ</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">এক ট্যাপে চালু বা বন্ধ করুন</p>
              </div>
              <motion.button
                type="button"
                onClick={handleToggleAvailable}
                whileTap={{ scale: 0.95 }}
                className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-extrabold text-white shadow-lg ${
                  donor.is_available
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-700 shadow-emerald-300/50'
                    : 'bg-gradient-to-r from-slate-400 to-slate-600 shadow-slate-300/50'
                } dark:shadow-none`}
              >
                {donor.is_available ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                {donor.is_available ? 'চালু আছে' : 'বন্ধ আছে'}
              </motion.button>
            </div>
          </Section>

          {message && !isOk && <FormError error={message} />}
          {message && isOk && (
            <p className="rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 px-4 py-3 text-sm font-bold text-emerald-800 dark:border-emerald-900/50 dark:from-emerald-950/50 dark:to-slate-900 dark:text-emerald-300">
              {message}
            </p>
          )}

          <motion.button
            onClick={handleSave}
            disabled={saving}
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.97 }}
            className="relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-red-500 via-red-600 to-red-800 py-4 text-base font-extrabold text-white shadow-lg shadow-red-300/50 disabled:opacity-60 dark:shadow-none"
          >
            <motion.span
              aria-hidden
              animate={{ x: ['-150%', '350%'] }}
              transition={{ duration: 1.4, repeat: Infinity, repeatDelay: 2.4, ease: 'easeInOut' }}
              className="pointer-events-none absolute inset-y-0 w-1/3 -skew-x-[20deg] bg-gradient-to-r from-transparent via-white/60 to-transparent"
            />
            <span className="relative">{saving ? 'সংরক্ষণ হচ্ছে...' : 'পরিবর্তন সংরক্ষণ করুন'}</span>
          </motion.button>
        </motion.div>
      </div>
    </main>
  );
}