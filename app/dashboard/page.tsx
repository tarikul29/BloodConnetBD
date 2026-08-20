'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Droplet, User, Phone, Mail, LogOut, CheckCircle2, XCircle, Image as ImageIcon } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { checkDonorEligibility } from '@/lib/eligibility';
import Header from '@/components/Header';
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

    const { error } = await supabase
      .from('donors')
      .update({
        full_name: donor.full_name,
        phone: donor.phone,
        blood_group: donor.blood_group,
        last_donation_date: donor.last_donation_date,
        is_available: donor.is_available,
        photo_url,
      })
      .eq('id', donor.id);

    setSaving(false);

    if (error) {
      setMessage('সংরক্ষণ করা যায়নি। আবার চেষ্টা করুন।');
      return;
    }

    setDonor({ ...donor, photo_url });
    setPhotoFile(null);
    setMessage('সফলভাবে সংরক্ষণ হয়েছে!');
  }

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-white dark:bg-slate-950 transition-colors">
        <Header />
        <p className="text-center py-24 text-slate-500 dark:text-slate-400">লোড হচ্ছে...</p>
      </main>
    );
  }

  if (!donor) {
    return (
      <main className="min-h-screen bg-white dark:bg-slate-950 transition-colors">
        <Header />
        <div className="mx-auto max-w-lg px-4 py-24 text-center">
          <p className="text-slate-600 dark:text-slate-400">আপনার ডোনার প্রোফাইল খুঁজে পাওয়া যায়নি।</p>
        </div>
      </main>
    );
  }

  const eligibility = checkDonorEligibility(donor.last_donation_date);

  return (
    <main className="min-h-screen bg-white dark:bg-slate-950 transition-colors">
      <Header />
      <div className="mx-auto max-w-lg px-4 py-10 sm:py-14">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">আমার প্রোফাইল</h1>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 dark:border-slate-800 px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            লগ আউট
          </button>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-5">
          <div className="flex flex-col items-center gap-3">
            <label htmlFor="photo" className="cursor-pointer">
              <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:border-red-300 dark:hover:border-red-500 transition-colors">
                {photoPreview ? (
                  <img src={photoPreview} alt="preview" className="h-full w-full object-cover" />
                ) : donor.photo_url ? (
                  <img src={donor.photo_url} alt={donor.full_name} className="h-full w-full object-cover" />
                ) : (
                  <ImageIcon className="h-8 w-8 text-slate-400 dark:text-slate-500" />
                )}
              </div>
            </label>
            <input id="photo" type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
            <span className="text-xs text-slate-500 dark:text-slate-400">ছবি পরিবর্তন করতে ক্লিক করুন</span>
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
              <User className="h-4 w-4" />
              পূর্ণ নাম
            </label>
            <input
              value={donor.full_name}
              onChange={(e) => setDonor({ ...donor, full_name: e.target.value })}
              className="input"
            />
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
              <Phone className="h-4 w-4" />
              ফোন নম্বর
            </label>
            <input
              value={donor.phone}
              onChange={(e) => setDonor({ ...donor, phone: e.target.value })}
              className="input"
            />
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
              <Mail className="h-4 w-4" />
              ইমেইল
            </label>
            <input value={donor.email ?? ''} disabled className="input bg-slate-50 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 cursor-not-allowed" />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5 block">রক্তের গ্রুপ</label>
            <select
              value={donor.blood_group}
              onChange={(e) => setDonor({ ...donor, blood_group: e.target.value as BloodGroup })}
              className="input"
            >
              {BLOOD_GROUPS.map((bg) => (
                <option key={bg} value={bg}>{bg}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5 block">শেষ রক্তদানের তারিখ</label>
            <input
              type="date"
              value={donor.last_donation_date ?? ''}
              onChange={(e) => setDonor({ ...donor, last_donation_date: e.target.value })}
              max={new Date().toISOString().split('T')[0]}
              className="input"
            />
            {!eligibility.isEligible && (
              <p className="mt-1.5 text-xs text-amber-600 dark:text-amber-400">
                {eligibility.daysRemaining} দিন পর আপনি আবার রক্তদানে প্রস্তুত হবেন।
              </p>
            )}
          </div>

          <div className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-3 bg-slate-50/50 dark:bg-slate-800/30">
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">রক্তদানে উপলব্ধ</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">বন্ধ রাখলে আপনাকে তালিকায় "অনুপলব্ধ" দেখাবে</p>
            </div>
            <button
              type="button"
              onClick={() => setDonor({ ...donor, is_available: !donor.is_available })}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                donor.is_available ? 'bg-green-100 dark:bg-green-950/60 text-green-700 dark:text-green-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
              }`}
            >
              {donor.is_available ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
              {donor.is_available ? 'চালু আছে' : 'বন্ধ আছে'}
            </button>
          </div>

          {message && (
            <p className={`text-sm rounded-xl px-3 py-2 ${message.includes('সফল') ? 'bg-green-50 dark:bg-green-950/50 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-900/50' : 'bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50'}`}>
              {message}
            </p>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full rounded-full bg-red-600 py-3.5 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-60 transition-colors shadow-lg shadow-red-500/20"
          >
            {saving ? 'সংরক্ষণ হচ্ছে...' : 'পরিবর্তন সংরক্ষণ করুন'}
          </button>
        </div>
      </div>

      <style jsx global>{`
        .input {
          width: 100%;
          border-radius: 0.75rem;
          border: 1px solid rgb(226 232 240);
          background-color: rgb(248 250 252 / 0.5);
          padding: 0.625rem 0.75rem;
          font-size: 0.875rem;
          color: rgb(15 23 42);
          transition: all 0.2s;
        }
        .dark .input {
          border-color: rgb(51 65 85);
          background-color: rgb(30 41 59 / 0.5);
          color: white;
        }
        .input:focus {
          outline: none;
          border-color: rgb(220 38 38);
          box-shadow: 0 0 0 3px rgb(254 226 226);
        }
        .dark .input:focus {
          border-color: rgb(239 68 68);
          box-shadow: 0 0 0 3px rgb(127 29 29 / 0.5);
        }
      `}</style>
    </main>
  );
}