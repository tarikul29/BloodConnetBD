'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useAnimationControls } from 'framer-motion';
import { Droplet, User, Phone, Mail, MapPin, Image as ImageIcon, CheckCircle2, Lock, ArrowRight, Building, Compass } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import Header from '@/components/Header';
import type { BloodGroup } from '@/types/database';

const BLOOD_GROUPS: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

// বাংলাদেশ বিভাগ, জেলা ও উপজেলার হালনাগাদ তথ্য (কিশোরগঞ্জসহ সব জেলা ও উপজেলা সংযুক্ত)
const BD_LOCATIONS: Record<string, Record<string, string[]>> = {
  'ঢাকা': {
    'ঢাকা': ['মিরপুর', 'উত্তরা', 'ধানমন্ডি', 'গুলশান', 'বনানী', 'মোহাম্মদপুর', 'সাভার', 'ধামরাই', 'কেরানীগঞ্জ', 'নবাবগঞ্জ', 'দোহার'],
    'কিশোরগঞ্জ': [
      'কিশোরগঞ্জ সদর',
      'হোসেনপুর',
      'করিমগঞ্জ',
      'ইটনা',
      'মিঠামইন',
      'অষ্টগ্রাম',
      'বাজিতপুর',
      'ভৈরব',
      'কুলিয়ারচর',
      'নিকলী',
      'পাকুন্দিয়া',
      'তাড়াইল'
    ],
    'গাজীপুর': ['গাজীপুর সদর', 'কালিয়াকৈর', 'শ্রীপুর', 'কাপাসিয়া', 'কালীগঞ্জ'],
    'নারায়ণগঞ্জ': ['নারায়ণগঞ্জ সদর', 'রূপগঞ্জ', 'সোনারগাঁও', 'আড়াইহাজার', 'বন্দর'],
    'টাঙ্গাইল': ['টাঙ্গাইল সদর', 'মির্জাপুর', 'ঘাটাইল', 'সখীপুর', 'মধুপুর', 'কালিহাতী'],
    'নরসিংদী': ['নরসিংদী সদর', 'মাধবদী', 'পলাশ', 'শিবপুর', 'রায়পুরা', 'বেলাবো'],
    'ফরিদপুর': ['ফরিদপুর সদর', 'ভাঙ্গা', 'বোয়ালমারী', 'নগরকান্দা', 'আলফাডাঙা'],
    'মানিকগঞ্জ': ['মানিকগঞ্জ সদর', 'সিংগাইর', 'সাটুরিয়া', 'ঘিওর', 'শিবালয়'],
    'মুন্সিগঞ্জ': ['মুন্সিগঞ্জ সদর', 'শ্রীনগর', 'সিরাজদিখান', 'গজারিয়া', 'টঙ্গীবাড়ী'],
    'রাজবাড়ী': ['রাজবাড়ী সদর', 'পাংশা', 'বালিয়াকান্দি', 'গোয়ালন্দ'],
    'মাদারীপুর': ['মাদারীপুর সদর', 'শিবচর', 'রাজৈর', 'কালকিনি'],
    'শরীয়তপুর': ['শরীয়তপুর সদর', 'জাজিরা', 'নড়িয়া', 'ভেদেরগঞ্জ'],
    'গোপালগঞ্জ': ['গোপালগঞ্জ সদর', 'টুঙ্গিপাড়া', 'কোটালীপাড়া', 'কাশিয়ানী'],
  },
  'চট্টগ্রাম': {
    'চট্টগ্রাম': ['পাঁচলাইশ', 'কোতোয়ালী', 'হালিশহর', 'পটিয়া', 'হাটহাজারী', 'সীতাকুণ্ড', 'মিরসরাই', 'বোয়ালখালী', 'রাওজান', 'রাঙ্গুনিয়া', 'বাঁশখালী'],
    'কক্সবাজার': ['কক্সবাজার সদর', 'উখিয়া', 'টেকনাফ', 'চকরিয়া', 'মহেশখালী', 'রামু', 'পেকুয়া'],
    'কুমিল্লা': ['কুমিল্লা সদর', 'লাকসাম', 'দাউদকান্দি', 'চৌদ্দগ্রাম', 'দেবীদ্বার', 'বরুড়া', 'হোমনা'],
    'ফেনী': ['ফেনী সদর', 'দাগনভূঞা', 'ছাগলনাইয়া', 'পরশুরাম', 'সোনাগাজী'],
    'নোয়াখালী': ['নোয়াখালী সদর', 'বেগমগঞ্জ', 'চাটখিল', 'কোম্পানীগঞ্জ', 'সেনবাগ'],
    'ব্রাহ্মণবাড়িয়া': ['ব্রাহ্মণবাড়িয়া সদর', 'আশুগঞ্জ', 'কসবা', 'নবীনগর', 'সরাইল'],
    'চাঁদপুর': ['চাঁদপুর সদর', 'হাজীগঞ্জ', 'মতলব উত্তর', 'মতলব দক্ষিণ', 'শাহরাস্তি'],
    'লক্ষ্মীপুর': ['লক্ষ্মীপুর সদর', 'রায়পুর', 'রামগঞ্জ', 'রামগতি'],
    'রাঙ্গামাটি': ['রাঙ্গামাটি সদর', 'কাপ্তাই', 'কাউখালী', 'বাঘাইছড়ি'],
    'বান্দরবান': ['বান্দরবান সদর', 'রুমা', 'থানচি', 'লামা'],
    'খাগড়াছড়ি': ['খাগড়াছড়ি সদর', 'দীঘিনালা', 'রামগড়', 'মাটিরাঙ্গা'],
  },
  'রাজশাহী': {
    'রাজশাহী': ['বোয়ালিয়া', 'মতিহার', 'শাহমখদুম', 'পবা', 'গোদাগাড়ী', 'তানোর', 'বাগমারা', 'চারঘাট'],
    'বগুড়া': ['বগুড়া সদর', 'শেরপুর', 'শিবগঞ্জ', 'শাজাহানপুর', 'ধুনট', 'গাবতলী'],
    'পাবনা': ['পাবনা সদর', 'ঈশ্বরদী', 'সাঁথিয়া', 'বেড়া', 'সুজানগর', 'চাটমোহর'],
    'সিরাজগঞ্জ': ['সিরাজগঞ্জ সদর', 'শাহজাদপুর', 'উল্লাপাড়া', 'বেলকুচি', 'কাজীপুর'],
    'নওগাঁ': ['নওগাঁ সদর', 'মহাদেবপুর', 'মান্দা', 'পত্নীতলা', 'ধামইরহাট'],
    'নাটোর': ['নাটোর সদর', 'সিংড়া', 'বড়াইগ্রাম', 'গুরুদাসপুর', 'লালপুর'],
    'চাঁপাইনবাবগঞ্জ': ['চাঁপাইনবাবগঞ্জ সদর', 'শিবগঞ্জ', 'গোমস্তাপুর', 'নাচোল'],
    'জয়পুরহাট': ['জয়পুরহাট সদর', 'পাঁচবিবি', 'ক্ষেতলাল', 'কালাই'],
  },
  'খুলনা': {
    'খুলনা': ['খুলনা সদর', 'সোনাডাঙ্গা', 'খালিশপুর', 'দৌলতপুর', 'বটিয়াঘাটা', 'রূপসা', 'ডুমুরিয়া', 'পাইকগাছা'],
    'যশোর': ['যশোর সদর', 'ঝিকরগাছা', 'অভয়নগর', 'মণিরামপুর', 'শার্শা', 'কেশবপুর'],
    'কুষ্টিয়া': ['কুষ্টিয়া সদর', 'কুমারখালী', 'ভেড়ামারা', 'মিরপুর', 'খোকসা'],
    'সাতক্ষীরা': ['সাতক্ষীরা সদর', 'কালীগঞ্জ', 'শ্যামনগর', 'আশাশুনি', 'কলারোয়া'],
    'বাগেরহাট': ['বাগেরহাট সদর', 'মোংলা', 'রামপাল', 'চিতলমারী', 'ফকিরহাট'],
    'ঝিনাইদহ': ['ঝিনাইদহ সদর', 'কালীগঞ্জ', 'শৈলকুপা', 'কোটচাঁদপুর'],
    'মেহেরপুর': ['মেহেরপুর সদর', 'গাংনী', 'মুজিবনগর'],
    'চুয়াডাঙ্গা': ['চুয়াডাঙ্গা সদর', 'আলমডাঙ্গা', 'দামুড়হুদা', 'জীবননগর'],
    'নড়াইল': ['নড়াইল সদর', 'লোহাগড়া', 'কালিয়া'],
    'মাগুরা': ['মাগুরা সদর', 'শ্রীপুর', 'মুহাম্মদপুর', 'শালিখা'],
  },
  'বরিশাল': {
    'বরিশাল': ['বরিশাল সদর', 'বাকেরগঞ্জ', 'বাবুগঞ্জ', 'উজিরপুর', 'গৌরনদী', 'মেহেন্দিগঞ্জ'],
    'পটুয়াখালী': ['পটুয়াখালী সদর', 'গলাচিপা', 'কলাপাড়া', 'বাউফল', 'মির্জাগঞ্জ'],
    'ভোলা': ['ভোলা সদর', 'চরফ্যাশন', 'বোরহানউদ্দিন', 'লালমোহন', 'তজুমদ্দিন'],
    'পিরোজপুর': ['পিরোজপুর সদর', 'স্বরূপকাঠি', 'মঠবাড়িয়া', 'ভান্ডারিয়া'],
    'বরগুনা': ['বরগুনা সদর', 'আমতলী', 'পাথরঘাটা', 'বামনা'],
    'ঝালকাঠি': ['ঝালকাঠি সদর', 'নলছিটি', 'রাজাপুর', 'কাঠালিয়া'],
  },
  'সিলেট': {
    'সিলেট': ['কোতোয়ালী', 'শাহপরাণ', 'দক্ষিণ সুরমা', 'জৈন্তাপুর', 'বিয়ানীবাজার', 'গোলাপগঞ্জ', 'কোম্পানীগঞ্জ'],
    'মৌলভীবাজার': ['মৌলভীবাজার সদর', 'শ্রীমঙ্গল', 'কমলগঞ্জ', 'কুলাউড়া', 'বড়লেখা'],
    'হবিগঞ্জ': ['হবিগঞ্জ সদর', 'মাধবপুর', 'চুনারুঘাট', 'নবীগঞ্জ', 'বাহুবল'],
    'সুনামগঞ্জ': ['সুনামগঞ্জ সদর', 'ছাতক', 'জগন্নাথপুর', 'দিরাই', 'তাহিরপুর'],
  },
  'রংপুর': {
    'রংপুর': ['রংপুর সদর', 'মিঠাপুকুর', 'পীরগঞ্জ', 'কাউনিয়া', 'গংগাচড়া', 'বদরগঞ্জ'],
    'দিনাজপুর': ['দিনাজপুর সদর', 'ফুলবাড়ী', 'বিরামপুর', 'বীরগঞ্জ', 'বোচাগঞ্জ'],
    'গাইবান্ধা': ['গাইবান্ধা সদর', 'গোবিন্দগঞ্জ', 'পলাশবাড়ী', 'সুন্দরগঞ্জ'],
    'কুড়িগ্রাম': ['কুড়িগ্রাম সদর', 'উলিপুর', 'নাগেশ্বরী', 'ভুরুঙ্গামারী'],
    'নীলফামারী': ['নীলফামারী সদর', 'সৈয়দপুর', 'ডোমার', 'জলঢাকা'],
    'লালমনিরহাট': ['লালমনিরহাট সদর', 'হাতীবান্ধা', 'পাটগ্রাম', 'কালীগঞ্জ'],
    'পঞ্চগড়': ['পঞ্চগড় সদর', 'তেঁতুলিয়া', 'বোদা', 'দেবীগঞ্জ'],
    'ঠাকুরগাঁও': ['ঠাকুরগাঁও সদর', 'পীরগঞ্জ', 'রাণীশংকৈল', 'বালিয়াডাঙি'],
  },
  'ময়মনসিংহ': {
    'ময়মনসিংহ': ['ময়মনসিংহ সদর', 'মুক্তাগাছা', 'ত্রিশাল', 'ভালুকা', 'ফুলবাড়িয়া', 'গফরগাঁও', 'ঈশ্বরগঞ্জ'],
    'জামালপুর': ['জামালপুর সদর', 'সরিষাবাড়ী', 'মেলান্দহ', 'ইসলামপুর', 'দেওয়ানগঞ্জ'],
    'শেরপুর': ['শেরপুর সদর', 'নালিতাবাড়ী', 'শ্রীবরদী', 'ঝিনাইগাতী'],
    'নেত্রকোণা': ['নেত্রকোণা সদর', 'পূর্বধলা', 'কেন্দুয়া', 'মোহনগঞ্জ', 'দূর্গাপুর'],
  },
};

export default function DonorRegisterPage() {
  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    email: '',
    password: '',
    blood_group: 'O+' as BloodGroup,
    last_donation_date: '',
  });

  const [division, setDivision] = useState('');
  const [district, setDistrict] = useState('');
  const [upazila, setUpazila] = useState('');
  const [areaDetails, setAreaDetails] = useState('');

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
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

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  function handleUseLocation() {
    setLocating(true);
    setError(null);
    if (!navigator.geolocation) {
      setError('আপনার ব্রাউজার লোকেশন সাপোর্ট করে না।');
      setLocating(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
      },
      () => {
        setError('লোকেশন পাওয়া যায়নি। লোকেশন অ্যাক্সেসের অনুমতি দিন।');
        setLocating(false);
      }
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!division || !district || !upazila) {
      setError('অনুগ্রহ করে বিভাগ, জেলা এবং উপজেলা সিলেক্ট করুন।');
      return;
    }

    if (!coords) {
      setError('অনুগ্রহ করে আপনার জিপিএস লোকেশন শেয়ার করুন।');
      return;
    }
    if (!/^01[3-9]\d{8}$/.test(form.phone)) {
      setError('সঠিক বাংলাদেশি ফোন নম্বর দিন (যেমন 017XXXXXXXX)।');
      return;
    }
    if (form.password.length < 6) {
      setError('পাসওয়ার্ড অন্তত ৬ অক্ষরের হতে হবে।');
      return;
    }

    setSubmitting(true);
    const supabase = createClient();

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
    });

    if (authError) {
      setSubmitting(false);
      if (authError.message.includes('already registered')) {
        setError('এই ইমেইল দিয়ে ইতিমধ্যে একটি একাউন্ট আছে।');
      } else {
        setError(authError.message || 'একাউন্ট তৈরি করা যায়নি। আবার চেষ্টা করুন।');
      }
      return;
    }

    let photo_url: string | null = null;

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

    const combinedAddress = [areaDetails, upazila, district, division]
      .filter(Boolean)
      .join(', ');

    const { error: insertError } = await supabase.from('donors').insert({
      id: authData.user?.id,
      full_name: form.full_name,
      phone: form.phone,
      email: form.email,
      address: combinedAddress,
      blood_group: form.blood_group,
      latitude: coords.lat,
      longitude: coords.lng,
      photo_url,
      is_available: true,
      last_donation_date: form.last_donation_date || null,
    });

    setSubmitting(false);

    if (insertError) {
      console.error('Supabase Insert Error:', insertError);
      if (insertError.code === '23505') {
        setError('এই ফোন নম্বর দিয়ে ইতিমধ্যে একজন ডোনার রেজিস্টার করা আছে।');
      } else {
        setError(insertError.message || 'কিছু একটা সমস্যা হয়েছে। আবার চেষ্টা করুন।');
      }
      return;
    }

    setSuccess(true);
  }

  // ==================== SUCCESS SCREEN / POPUP ====================
  if (success) {
    return (
      <main className="min-h-screen relative overflow-hidden bg-white dark:bg-slate-950 transition-colors">
        <div className="absolute inset-0 bg-gradient-to-br from-red-50/90 via-white to-rose-50/70 dark:from-red-950/20 dark:via-slate-950 dark:to-slate-950" />
        <Header />

        <div className="relative z-10 flex items-center justify-center min-h-[85vh] px-4">
          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 100, damping: 18 }}
            className="w-full max-w-md"
          >
            <div className="relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border border-white/80 dark:border-slate-800 rounded-[2.5rem] shadow-[0_25px_60px_-15px_rgba(220,38,38,0.15)] p-10 sm:p-12 text-center">
              <motion.div
                initial={{ scale: 0, rotate: -90 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 160, damping: 12 }}
                className="mx-auto mb-7 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-emerald-500 shadow-xl shadow-green-200 dark:shadow-none"
              >
                <CheckCircle2 className="h-12 w-12 text-white" strokeWidth={2.5} />
              </motion.div>

              <h1 className="text-2xl sm:text-[1.7rem] font-bold text-slate-900 dark:text-white">
                রেজিস্ট্রেশন সম্পন্ন!
              </h1>
              <p className="mt-3 text-slate-600 dark:text-slate-400 text-[15px] leading-relaxed">
                ধন্যবাদ! আপনি সফলভাবে রক্তদাতা হিসেবে নিবন্ধিত হয়েছেন।
              </p>

              <div className="mt-8 flex flex-col gap-3">
                <a
                  href="/login"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 px-8 py-4 text-sm font-bold text-white shadow-xl shadow-red-200 dark:shadow-none hover:shadow-2xl transition-all"
                >
                  লগইন করুন
                  <ArrowRight className="h-4 w-4" />
                </a>
                <a
                  href="/donors"
                  className="inline-flex items-center justify-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 px-6 py-3 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
                >
                  ডোনার তালিকা দেখুন
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    );
  }

  // ==================== MAIN FORM ====================
  return (
    <main className="min-h-screen pt-16 relative overflow-hidden bg-white dark:bg-slate-950 transition-colors">
      <div className="absolute inset-0 bg-gradient-to-br from-red-50/90 via-white to-rose-50/70 dark:from-red-950/20 dark:via-slate-950 dark:to-slate-950" />
      <Header />

      <div className="relative z-10 mx-auto max-w-lg px-4 py-10 sm:py-14">
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 90, damping: 18 }}
        >
          <div className="relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border border-white/80 dark:border-slate-800 rounded-[2.5rem] shadow-[0_25px_60px_-15px_rgba(220,38,38,0.12)] p-8 sm:p-10 overflow-hidden">
            
            {/* Header */}
            <div className="text-center mb-8">
              <motion.div
                animate={iconControls}
                className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 shadow-xl shadow-red-300/50 dark:shadow-none"
              >
                <Droplet className="h-8 w-8 text-white" fill="currentColor" />
              </motion.div>

              <h1 className="text-2xl sm:text-[1.75rem] font-bold text-slate-900 dark:text-white tracking-tight">
                ডোনার রেজিস্ট্রেশন
              </h1>
              <p className="mt-2 text-slate-500 dark:text-slate-400 text-sm">
                আপনার তথ্য দিন, প্রয়োজনে মানুষ আপনার সাথে যোগাযোগ করবে
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Photo Upload */}
              <div className="flex flex-col items-center gap-2">
                <label htmlFor="photo" className="cursor-pointer group">
                  <div className="relative flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 group-hover:border-red-400 transition-colors">
                    {photoPreview ? (
                      <img src={photoPreview} alt="preview" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center gap-1">
                        <ImageIcon className="h-7 w-7 text-slate-400 dark:text-slate-500" />
                        <span className="text-[10px] text-slate-400 dark:text-slate-500">ছবি</span>
                      </div>
                    )}
                  </div>
                </label>
                <input id="photo" type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                <span className="text-xs text-slate-500 dark:text-slate-400">প্রোফাইল ছবি (ঐচ্ছিক)</span>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-[13px] font-semibold text-slate-600 dark:text-slate-300 mb-1.5 ml-1">পূর্ণ নাম</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                  </div>
                  <input
                    required
                    value={form.full_name}
                    onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                    placeholder="যেমন: আব্দুল করিম"
                    className="w-full rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-800/90 pl-11 pr-4 py-3.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-[3px] focus:ring-red-500/20 focus:border-red-400 dark:focus:border-red-500 transition-all shadow-sm"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-[13px] font-semibold text-slate-600 dark:text-slate-300 mb-1.5 ml-1">ফোন নম্বর</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Phone className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                  </div>
                  <input
                    required
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="01XXXXXXXXX"
                    className="w-full rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-800/90 pl-11 pr-4 py-3.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-[3px] focus:ring-red-500/20 focus:border-red-400 dark:focus:border-red-500 transition-all shadow-sm"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-[13px] font-semibold text-slate-600 dark:text-slate-300 mb-1.5 ml-1">ইমেইল</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                  </div>
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="example@gmail.com"
                    className="w-full rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-800/90 pl-11 pr-4 py-3.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-[3px] focus:ring-red-500/20 focus:border-red-400 dark:focus:border-red-500 transition-all shadow-sm"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-[13px] font-semibold text-slate-600 dark:text-slate-300 mb-1.5 ml-1">পাসওয়ার্ড</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                  </div>
                  <input
                    required
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="অন্তত ৬ অক্ষর"
                    className="w-full rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-800/90 pl-11 pr-4 py-3.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-[3px] focus:ring-red-500/20 focus:border-red-400 dark:focus:border-red-500 transition-all shadow-sm"
                  />
                </div>
              </div>

              {/* ঠিকানা ড্রপডাউনসমূহ */}
              <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 space-y-4">
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Compass className="h-4 w-4 text-red-500" /> বর্তমান ঠিকানা নির্বাচন করুন
                </p>

                <div>
                  <label className="block text-[12px] font-medium text-slate-600 dark:text-slate-400 mb-1">বিভাগ</label>
                  <select
                    value={division}
                    onChange={(e) => {
                      setDivision(e.target.value);
                      setDistrict('');
                      setUpazila('');
                    }}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 transition-all"
                  >
                    <option value="">বিভাগ সিলেক্ট করুন</option>
                    {Object.keys(BD_LOCATIONS).map((div) => (
                      <option key={div} value={div}>{div}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[12px] font-medium text-slate-600 dark:text-slate-400 mb-1">জেলা</label>
                  <select
                    disabled={!division}
                    value={district}
                    onChange={(e) => {
                      setDistrict(e.target.value);
                      setUpazila('');
                    }}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 transition-all disabled:bg-slate-100 dark:disabled:bg-slate-900 disabled:cursor-not-allowed"
                  >
                    <option value="">জেলা সিলেক্ট করুন</option>
                    {division &&
                      Object.keys(BD_LOCATIONS[division] || {}).map((dist) => (
                        <option key={dist} value={dist}>{dist}</option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[12px] font-medium text-slate-600 dark:text-slate-400 mb-1">উপজেলা / থানা</label>
                  <select
                    disabled={!district}
                    value={upazila}
                    onChange={(e) => setUpazila(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 transition-all disabled:bg-slate-100 dark:disabled:bg-slate-900 disabled:cursor-not-allowed"
                  >
                    <option value="">উপজেলা/থানা সিলেক্ট করুন</option>
                    {division && district &&
                      BD_LOCATIONS[division]?.[district]?.map((upz) => (
                        <option key={upz} value={upz}>{upz}</option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[12px] font-medium text-slate-600 dark:text-slate-400 mb-1">গ্রাম / মহল্লা / রোড (ঐচ্ছিক)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Building className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
                    </div>
                    <input
                      value={areaDetails}
                      onChange={(e) => setAreaDetails(e.target.value)}
                      placeholder="যেমন: ব্লক-সি, রোড নং-৪"
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 pl-9 pr-3.5 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Blood Group */}
              <div>
                <label className="block text-[13px] font-semibold text-slate-600 dark:text-slate-300 mb-1.5 ml-1">রক্তের গ্রুপ</label>
                <select
                  value={form.blood_group}
                  onChange={(e) => setForm({ ...form, blood_group: e.target.value as BloodGroup })}
                  className="w-full rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-800/90 px-4 py-3.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-[3px] focus:ring-red-500/20 focus:border-red-400 dark:focus:border-red-500 transition-all shadow-sm"
                >
                  {BLOOD_GROUPS.map((bg) => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>

              {/* Last Donation */}
              <div>
                <label className="block text-[13px] font-semibold text-slate-600 dark:text-slate-300 mb-1.5 ml-1">
                  শেষ রক্তদানের তারিখ (যদি থাকে)
                </label>
                <input
                  type="date"
                  value={form.last_donation_date}
                  onChange={(e) => setForm({ ...form, last_donation_date: e.target.value })}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-800/90 px-4 py-3.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-[3px] focus:ring-red-500/20 focus:border-red-400 dark:focus:border-red-500 transition-all shadow-sm"
                />
              </div>

              {/* GPS Location */}
              <div>
                <label className="block text-[13px] font-semibold text-slate-600 dark:text-slate-300 mb-1.5 ml-1">আপনার জিপিএস লোকেশন</label>
                <button
                  type="button"
                  onClick={handleUseLocation}
                  disabled={locating}
                  className={`w-full flex items-center justify-center gap-2 rounded-2xl border py-3.5 text-sm font-medium transition-all ${
                    coords
                      ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400'
                      : 'border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  } disabled:opacity-60`}
                >
                  <MapPin className="h-4 w-4" />
                  {locating ? 'লোকেশন খোঁজা হচ্ছে...' : coords ? 'লোকেশন যুক্ত হয়েছে ✓' : 'বর্তমান জিপিএস লোকেশন শেয়ার করুন'}
                </button>
              </div>

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
              <button
                type="submit"
                disabled={submitting}
                className="group w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 py-4 text-sm font-bold text-white shadow-xl shadow-red-200/70 dark:shadow-none disabled:opacity-60"
              >
                {submitting ? 'রেজিস্টার হচ্ছে...' : (
                  <>
                    ডোনার হিসেবে রেজিস্টার করুন
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>

              <p className="text-center text-sm text-slate-500 dark:text-slate-400 pt-1">
                আগে থেকে একাউন্ট আছে?{' '}
                <a href="/login" className="text-red-600 dark:text-red-400 font-semibold hover:underline">
                  লগইন করুন
                </a>
              </p>
            </form>
          </div>
        </motion.div>
      </div>
    </main>
  );
}