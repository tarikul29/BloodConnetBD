'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Phone, Mail, MapPin, Camera, Lock, Building, CalendarDays, Droplet } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { AuthShell, Field, FormError, FormHeading, Section, SubmitButton, SuccessScreen, inputCls, selectCls } from '@/components/FormUI';
import type { BloodGroup } from '@/types/database';

const BLOOD_GROUPS: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
// বাংলাদেশ বিভাগ, জেলা ও উপজেলার হালনাগাদ তথ্য
const BD_LOCATIONS: Record<string, Record<string, string[]>> = {
  'ঢাকা': {
    'ঢাকা': ['সাভার', 'ধামরাই', 'কেরানীগঞ্জ', 'নবাবগঞ্জ', 'দোহার'],
    'কিশোরগঞ্জ': [
      'কিশোরগঞ্জ সদর', 'হোসেনপুর', 'করিমগঞ্জ', 'ইটনা', 'মিঠামইন', 'অষ্টগ্রাম',
      'বাজিতপুর', 'ভৈরব', 'কুলিয়ারচর', 'নিকলী', 'পাকুন্দিয়া', 'তাড়াইল', 'কটিয়াদী'
    ],
    'গাজীপুর': ['গাজীপুর সদর', 'কালিয়াকৈর', 'শ্রীপুর', 'কাপাসিয়া', 'কালীগঞ্জ'],
    'নারায়ণগঞ্জ': ['নারায়ণগঞ্জ সদর', 'রূপগঞ্জ', 'সোনারগাঁও', 'আড়াইহাজার', 'বন্দর'],
    'টাঙ্গাইল': [
      'টাঙ্গাইল সদর', 'মির্জাপুর', 'ঘাটাইল', 'সখীপুর', 'মধুপুর', 'কালিহাতী',
      'নাগরপুর', 'বাসাইল', 'দেলদুয়ার', 'ভুয়াপুর', 'গোপালপুর', 'ধনবাড়ী'
    ],
    'নরসিংদী': ['নরসিংদী সদর', 'মাধবদী', 'পলাশ', 'শিবপুর', 'রায়পুরা', 'বেলাবো', 'মনোহরদী'],
    'ফরিদপুর': [
      'ফরিদপুর সদর', 'ভাঙ্গা', 'বোয়ালমারী', 'নগরকান্দা', 'আলফাডাঙা',
      'সদরপুর', 'চরভদ্রাসন', 'মধুখালী', 'সালথা'
    ],
    'মানিকগঞ্জ': [
      'মানিকগঞ্জ সদর', 'সিংগাইর', 'সাটুরিয়া', 'ঘিওর', 'শিবালয়', 'দৌলতপুর', 'হরিরামপুর'
    ],
    'মুন্সিগঞ্জ': [
      'মুন্সিগঞ্জ সদর', 'শ্রীনগর', 'সিরাজদিখান', 'গজারিয়া', 'টঙ্গীবাড়ী', 'লৌহজং'
    ],
    'রাজবাড়ী': ['রাজবাড়ী সদর', 'পাংশা', 'বালিয়াকান্দি', 'গোয়ালন্দ', 'কালুখালী'],
    'মাদারীপুর': ['মাদারীপুর সদর', 'শিবচর', 'রাজৈর', 'কালকিনি', 'ডাসার'],
    'শরীয়তপুর': ['শরীয়তপুর সদর', 'জাজিরা', 'নড়িয়া', 'ভেদেরগঞ্জ', 'গোসাইরহাট', 'ডামুড্যা'],
    'গোপালগঞ্জ': ['গোপালগঞ্জ সদর', 'টুঙ্গিপাড়া', 'কোটালীপাড়া', 'কাশিয়ানী', 'মুকসুদপুর'],
  },
  'চট্টগ্রাম': {
    'চট্টগ্রাম': [
      'পাঁচলাইশ', 'কোতোয়ালী', 'হালিশহর', 'পটিয়া', 'হাটহাজারী', 'সীতাকুণ্ড', 'মিরসরাই',
      'বোয়ালখালী', 'রাউজান', 'রাঙ্গুনিয়া', 'বাঁশখালী', 'আনোয়ারা', 'চন্দনাইশ', 'সাতকানিয়া',
      'লোহাগাড়া', 'সন্দ্বীপ', 'ফটিকছড়ি', 'কর্ণফুলী'
    ],
    'কক্সবাজার': [
      'কক্সবাজার সদর', 'উখিয়া', 'টেকনাফ', 'চকরিয়া', 'মহেশখালী', 'রামু', 'পেকুয়া', 'কুতুবদিয়া', 'ঈদগাঁও'
    ],
    'কুমিল্লা': [
      'কুমিল্লা সদর', 'লাকসাম', 'দাউদকান্দি', 'চৌদ্দগ্রাম', 'দেবীদ্বার', 'বরুড়া', 'হোমনা',
      'মেঘনা', 'তিতাস', 'লালমাই', 'বুড়িচং', 'চান্দিনা', 'মুরাদনগর', 'নাঙ্গলকোট',
      'মনোহরগঞ্জ', 'সদর দক্ষিণ', 'ব্রাহ্মণপাড়া'
    ],
    'ফেনী': ['ফেনী সদর', 'দাগনভূঞা', 'ছাগলনাইয়া', 'পরশুরাম', 'সোনাগাজী', 'ফুলগাজী'],
    'নোয়াখালী': [
      'নোয়াখালী সদর', 'বেগমগঞ্জ', 'চাটখিল', 'কোম্পানীগঞ্জ', 'সেনবাগ',
      'হাতিয়া', 'সোনাইমুড়ী', 'সুবর্ণচর', 'কবিরহাট'
    ],
    'ব্রাহ্মণবাড়িয়া': [
      'ব্রাহ্মণবাড়িয়া সদর', 'আশুগঞ্জ', 'কসবা', 'নবীনগর', 'সরাইল',
      'আখাউড়া', 'বাঞ্ছারামপুর', 'নাসিরনগর', 'বিজয়নগর'
    ],
    'চাঁদপুর': [
      'চাঁদপুর সদর', 'হাজীগঞ্জ', 'মতলব উত্তর', 'মতলব দক্ষিণ', 'শাহরাস্তি',
      'ফরিদগঞ্জ', 'হাইমচর', 'কচুয়া'
    ],
    'লক্ষ্মীপুর': ['লক্ষ্মীপুর সদর', 'রায়পুর', 'রামগঞ্জ', 'রামগতি', 'কমলনগর'],
    'রাঙ্গামাটি': [
      'রাঙ্গামাটি সদর', 'কাপ্তাই', 'কাউখালী', 'বাঘাইছড়ি', 'বরকল', 'জুরাছড়ি',
      'লংগদু', 'নানিয়ারচর', 'রাজস্থলী', 'বিলাইছড়ি'
    ],
    'বান্দরবান': [
      'বান্দরবান সদর', 'রুমা', 'থানচি', 'লামা', 'আলীকদম', 'নাইক্ষ্যংছড়ি', 'রোয়াংছড়ি'
    ],
    'খাগড়াছড়ি': [
      'খাগড়াছড়ি সদর', 'দীঘিনালা', 'রামগড়', 'মাটিরাঙ্গা', 'মানিকছড়ি',
      'লক্ষীছড়ি', 'মহালছড়ি', 'পানছড়ি', 'গুইমারা'
    ],
  },
  'রাজশাহী': {
    'রাজশাহী': [
      'বোয়ালিয়া', 'মতিহার', 'শাহমখদুম', 'পবা', 'গোদাগাড়ী', 'তানোর', 'বাগমারা', 'চারঘাট', 'দুর্গাপুর'
    ],
    'বগুড়া': [
      'বগুড়া সদর', 'শেরপুর', 'শিবগঞ্জ', 'শাজাহানপুর', 'ধুনট', 'গাবতলী',
      'আদমদিঘী', 'দুপচাঁচিয়া', 'সোনাতলা', 'নন্দীগ্রাম', 'কাহালু', 'সারিয়াকান্দি'
    ],
    'পাবনা': [
      'পাবনা সদর', 'ঈশ্বরদী', 'সাঁথিয়া', 'বেড়া', 'সুজানগর', 'চাটমোহর',
      'ভাঙ্গুড়া', 'আটঘরিয়া', 'ফরিদপুর'
    ],
    'সিরাজগঞ্জ': [
      'সিরাজগঞ্জ সদর', 'শাহজাদপুর', 'উল্লাপাড়া', 'বেলকুচি', 'কাজীপুর',
      'চৌহালি', 'কামারখন্দ', 'রায়গঞ্জ', 'তাড়াশ'
    ],
    'নওগাঁ': [
      'নওগাঁ সদর', 'মহাদেবপুর', 'মান্দা', 'পত্নীতলা', 'ধামইরহাট',
      'আত্রাই', 'বদলগাছী', 'নিয়ামতপুর', 'রাণীনগর', 'সাপাহার', 'পোরশা'
    ],
    'নাটোর': [
      'নাটোর সদর', 'সিংড়া', 'বড়াইগ্রাম', 'গুরুদাসপুর', 'লালপুর', 'বাগাতিপাড়া', 'নলডাঙ্গা'
    ],
    'চাঁপাইনবাবগঞ্জ': [
      'চাঁপাইনবাবগঞ্জ সদর', 'শিবগঞ্জ', 'গোমস্তাপুর', 'নাচোল', 'ভোলাহাট'
    ],
    'জয়পুরহাট': [
      'জয়পুরহাট সদর', 'পাঁচবিবি', 'ক্ষেতলাল', 'কালাই', 'আক্কেলপুর'
    ],
  },
  'খুলনা': {
    'খুলনা': [
      'খুলনা সদর', 'সোনাডাঙ্গা', 'খালিশপুর', 'দৌলতপুর', 'বটিয়াঘাটা', 'রূপসা',
      'ডুমুরিয়া', 'পাইকগাছা', 'তেরখাদা', 'দিঘলিয়া', 'ফুলতলা', 'কয়রা'
    ],
    'যশোর': [
      'যশোর সদর', 'ঝিকরগাছা', 'অভয়নগর', 'মণিরামপুর', 'শার্শা', 'কেশবপুর',
      'বাঘারপাড়া', 'চৌগাছা'
    ],
    'কুষ্টিয়া': [
      'কুষ্টিয়া সদর', 'কুমারখালী', 'ভেড়ামারা', 'মিরপুর', 'খোকসা', 'দৌলতপুর'
    ],
    'সাতক্ষীরা': [
      'সাতক্ষীরা সদর', 'কালীগঞ্জ', 'শ্যামনগর', 'আশাশুনি', 'কলারোয়া', 'তালা', 'দেবহাটা'
    ],
    'বাগেরহাট': [
      'বাগেরহাট সদর', 'মোংলা', 'রামপাল', 'চিতলমারী', 'ফকিরহাট', 'মোড়েলগঞ্জ',
      'কচুয়া', 'মোল্লাহাট', 'শরণখোলা'
    ],
    'ঝিনাইদহ': [
      'ঝিনাইদহ সদর', 'কালীগঞ্জ', 'শৈলকুপা', 'কোটচাঁদপুর', 'মহেশপুর', 'হরিণাকুণ্ডু'
    ],
    'মেহেরপুর': ['মেহেরপুর সদর', 'গাংনী', 'মুজিবনগর'],
    'চুয়াডাঙ্গা': ['চুয়াডাঙ্গা সদর', 'আলমডাঙ্গা', 'দামুড়হুদা', 'জীবননগর'],
    'নড়াইল': ['নড়াইল সদর', 'লোহাগড়া', 'কালিয়া'],
    'মাগুরা': ['মাগুরা সদর', 'শ্রীপুর', 'মুহাম্মদপুর', 'শালিখা'],
  },
  'বরিশাল': {
    'বরিশাল': [
      'বরিশাল সদর', 'বাকেরগঞ্জ', 'বাবুগঞ্জ', 'উজিরপুর', 'গৌরনদী', 'মেহেন্দিগঞ্জ',
      'আগৈলঝাড়া', 'বানারীপাড়া', 'মুলাদী', 'হিজলা'
    ],
    'পটুয়াখালী': [
      'পটুয়াখালী সদর', 'গলাচিপা', 'কলাপাড়া', 'বাউফল', 'মির্জাগঞ্জ',
      'দুমকি', 'দশমিনা', 'রাঙ্গাবালী'
    ],
    'ভোলা': [
      'ভোলা সদর', 'চরফ্যাশন', 'বোরহানউদ্দিন', 'লালমোহন', 'তজুমদ্দিন',
      'দৌলতখান', 'মনপুরা'
    ],
    'পিরোজপুর': [
      'পিরোজপুর সদর', 'স্বরূপকাঠি', 'মঠবাড়িয়া', 'ভান্ডারিয়া', 'কাউখালী', 'নাজিরপুর', 'ইন্দুরকানী'
    ],
    'বরগুনা': [
      'বরগুনা সদর', 'আমতলী', 'পাথরঘাটা', 'বামনা', 'বেতাগী', 'তালতলী'
    ],
    'ঝালকাঠি': [
      'ঝালকাঠি সদর', 'নলছিটি', 'রাজাপুর', 'কাঠালিয়া'
    ],
  },
  'সিলেট': {
    'সিলেট': [
      'সিলেট সদর', 'শাহপরাণ', 'দক্ষিণ সুরমা', 'জৈন্তাপুর', 'বিয়ানীবাজার',
      'গোলাপগঞ্জ', 'কোম্পানীগঞ্জ', 'গোয়াইনঘাট', 'কানাইঘাট', 'ফেঞ্চুগঞ্জ', 'বালাগঞ্জ', 'জকিগঞ্জ', 'বিশ্বনাথ'
    ],
    'মৌলভীবাজার': [
      'মৌলভীবাজার সদর', 'শ্রীমঙ্গল', 'কমলগঞ্জ', 'কুলাউড়া', 'বড়লেখা', 'জুড়ী'
    ],
    'হবিগঞ্জ': [
      'হবিগঞ্জ সদর', 'মাধবপুর', 'চুনারুঘাট', 'নবীগঞ্জ', 'বাহুবল', 'লাখাই', 'বানিয়াচং', 'আজমিরীগঞ্জ'
    ],
    'সুনামগঞ্জ': [
      'সুনামগঞ্জ সদর', 'ছাতক', 'জগন্নাথপুর', 'দিরাই', 'তাহিরপুর',
      'বিশ্বম্ভরপুর', 'দোয়ারাবাজার', 'ধর্মপাশা', 'জামালগঞ্জ', 'শাল্লা', 'মধ্যনগর'
    ],
  },
  'রংপুর': {
    'রংপুর': [
      'রংপুর সদর', 'মিঠাপুকুর', 'পীরগঞ্জ', 'কাউনিয়া', 'গংগাচড়া', 'বদরগঞ্জ',
      'তারাগঞ্জ', 'পীরগাছা'
    ],
    'দিনাজপুর': [
      'দিনাজপুর সদর', 'ফুলবাড়ী', 'বিরামপুর', 'বীরগঞ্জ', 'বোচাগঞ্জ',
      'চিরিরবন্দর', 'ঘোড়াঘাট', 'হাকিমপুর', 'কাহারোল', 'খানসামা', 'নবাবগঞ্জ', 'পার্বতীপুর', 'বিরল'
    ],
    'গাইবান্ধা': [
      'গাইবান্ধা সদর', 'গোবিন্দগঞ্জ', 'পলাশবাড়ী', 'সুন্দরগঞ্জ',
      'সাদুল্লাপুর', 'সাঘাটা', 'ফুলছড়ি'
    ],
    'কুড়িগ্রাম': [
      'কুড়িগ্রাম সদর', 'উলিপুর', 'নাগেশ্বরী', 'ভুরুঙ্গামারী',
      'চিলমারী', 'রৌমারী', 'রাজারহাট', 'চর রাজিবপুর', 'ফুলবাড়ী'
    ],
    'নীলফামারী': [
      'নীলফামারী সদর', 'সৈয়দপুর', 'ডোমার', 'জলঢাকা', 'কিশোরগঞ্জ', 'ডিমলা'
    ],
    'লালমনিরহাট': [
      'লালমনিরহাট সদর', 'হাতীবান্ধা', 'পাটগ্রাম', 'কালীগঞ্জ', 'আদিতমারী'
    ],
    'পঞ্চগড়': [
      'পঞ্চগড় সদর', 'তেঁতুলিয়া', 'বোদা', 'দেবীগঞ্জ', 'আটোয়ারী'
    ],
    'ঠাকুরগাঁও': [
      'ঠাকুরগাঁও সদর', 'পীরগঞ্জ', 'রাণীশংকৈল', 'বালিয়াডাঙ্গি', 'হরিপুর'
    ],
  },
  'ময়মনসিংহ': {
    'ময়মনসিংহ': [
      'ময়মনসিংহ সদর', 'মুক্তাগাছা', 'ত্রিশাল', 'ভালুকা', 'ফুলবাড়িয়া',
      'গফরগাঁও', 'ঈশ্বরগঞ্জ', 'গৌরীপুর', 'নান্দাইল', 'ফুলপুর', 'হালুয়াঘাট', 'ধোবাউড়া'
    ],
    'জামালপুর': [
      'জামালপুর সদর', 'সরিষাবাড়ী', 'মেলান্দহ', 'ইসলামপুর', 'দেওয়ানগঞ্জ',
      'মাদারগঞ্জ', 'বকশীগঞ্জ'
    ],
    'শেরপুর': [
      'শেরপুর সদর', 'নালিতাবাড়ী', 'শ্রীবরদী', 'ঝিনাইগাতী', 'নকলা'
    ],
   'নেত্রকোণা': [
  'নেত্রকোণা সদর',
  'পূর্বধলা',
  'কেন্দুয়া',
  'মোহনগঞ্জ',
  'দূর্গাপুর',
  'বারহাট্টা',      // ← এটা
  'আটপাড়া',
  'কলমাকান্দা',
  'মদন',
  'খালিয়াজুরি'
],
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


  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/') || file.size > 5 * 1024 * 1024) {
      setError('শুধু ছবি দিন, আর সাইজ ৫ MB এর বেশি হবে না।');
      e.target.value = '';
      return;
    }
    setError(null);
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

  // ==================== SUCCESS SCREEN ====================
  if (success) {
    return (
      <SuccessScreen
        title="রেজিস্ট্রেশন সম্পন্ন!"
        text="ধন্যবাদ! আপনি সফলভাবে রক্তদাতা হিসেবে নিবন্ধিত হয়েছেন।"
        actions={[
          { href: '/login', label: 'লগইন করুন', primary: true },
          { href: '/donors', label: 'ডোনার তালিকা দেখুন' },
        ]}
      />
    );
  }

  // ==================== MAIN FORM ====================
  return (
    <AuthShell
      badge="এক মিনিটেই রেজিস্ট্রেশন"
      title="আপনার রক্ত"
      accent="কারও নতুন জীবন"
      subtitle="ডোনার হিসেবে যুক্ত হোন। জরুরি মুহূর্তে কাছের কেউ আপনাকে সরাসরি কল করবেন।"
      perks={[
        'সম্পূর্ণ বিনামূল্যে, কোনো খরচ নেই',
        'ডোনার তালিকায় আপনার নাম ও গ্রুপ দেখা যাবে',
        'রক্ত দিতে না পারলে নিজেকে "বিরতিতে" রাখতে পারবেন',
      ]}
      footerNote="আপনার ফোন নম্বর তালিকায় লুকানো থাকে, কেউ কল করুন চাপলে তবেই দেখা যায়।"
    >
      <FormHeading
        pill="৩টি সহজ ধাপ · মাত্র ১ মিনিট"
        title="ডোনার হিসেবে"
        accent="যুক্ত হোন"
        subtitle="সব তথ্য সঠিক দিন, যাতে দরকারে সবাই আপনাকে খুঁজে পায়।"
        badges={['১ ব্যাগ = ৩ জীবন', 'বিনামূল্যে']}
      />

      {/* অনুপ্রেরণার লেখা */}
      <div className="relative mb-6 flex items-center gap-4 overflow-hidden rounded-3xl bg-gradient-to-r from-red-900 via-red-600 to-orange-500 px-5 py-4 text-white">
        <span className="text-4xl leading-none">❝</span>
        <span className="text-[15px] font-medium leading-relaxed sm:text-base">
          আপনার সামান্য সময়ে কেউ ফিরে পেতে পারে তার পুরো জীবন। আজই প্রথম পদক্ষেপ নিন।
        </span>
      </div>

      {/* ধাপ নির্দেশক */}
      <div className="mb-6 grid grid-cols-3 gap-3">
        {[
          { t: '১ · ব্যক্তিগত', g: 'from-red-500 to-red-800', c: 'text-red-700 dark:text-red-400' },
          { t: '২ · ঠিকানা', g: 'from-yellow-300 to-amber-500', c: 'text-amber-700 dark:text-amber-400' },
          { t: '৩ · রক্ত ও লোকেশন', g: 'from-emerald-400 to-teal-700', c: 'text-teal-700 dark:text-teal-400' },
        ].map((s) => (
          <div key={s.t} className="flex flex-col gap-1.5">
            <div className={`h-2 rounded-full bg-gradient-to-r ${s.g}`} />
            <span className={`text-[13px] font-bold ${s.c}`}>{s.t}</span>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ছবি */}
        <div className="flex items-center gap-5">
          <label htmlFor="photo" className="group cursor-pointer">
            <motion.div whileHover={{ scale: 1.05 }} className="relative h-24 w-24">
              <motion.span
                aria-hidden
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 rounded-full"
                style={{ background: 'conic-gradient(#c4162a,#f2a516,#2fa886,#c4162a)' }}
              />
              <span className="absolute inset-[4px] flex items-center justify-center overflow-hidden rounded-full bg-white dark:bg-slate-800">
                {photoPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={photoPreview} alt="preview" className="h-full w-full object-cover" />
                ) : (
                  <Camera className="h-8 w-8 text-red-600" />
                )}
              </span>
            </motion.div>
          </label>
          <input id="photo" type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
          <div className="flex flex-col gap-1">
            <span className="text-lg font-extrabold text-slate-900 dark:text-white">আপনার ছবি দিন</span>
            <span className="text-sm text-slate-500 dark:text-slate-400">ঐচ্ছিক, তবে ছবি থাকলে মানুষ বেশি ভরসা করে</span>
          </div>
        </div>

        {/* ব্যক্তিগত তথ্য */}
        <Section
          tone="red"
          title="ব্যক্তিগত তথ্য"
          step="ধাপ ১"
          note='আপনার ফোন নম্বর ডোনার তালিকায় লুকানো থাকে, কেউ "কল করুন" চাপলে তবেই দেখা যায়।'
        >
          <Field label="পূর্ণ নাম" icon={User}>
            <input
              required
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              placeholder="যেমন: আব্দুল করিম"
              className={inputCls}
            />
          </Field>
          <Field label="ফোন নম্বর" icon={Phone}>
            <input
              required
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="01XXXXXXXXX"
              className={inputCls}
            />
          </Field>
          <Field label="ইমেইল" icon={Mail}>
            <input
              required
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="example@gmail.com"
              className={inputCls}
            />
          </Field>
          <Field label="পাসওয়ার্ড" icon={Lock}>
            <input
              required
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="অন্তত ৬ অক্ষর"
              className={inputCls}
            />
          </Field>
        </Section>

        {/* ঠিকানা */}
        <Section tone="gold" title="আপনার ঠিকানা" step="ধাপ ২" note="সঠিক এলাকা দিলে আপনার কাছের মানুষ আপনাকে আগে খুঁজে পাবেন।">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1.5 ml-1 block text-[13px] font-bold text-slate-700 dark:text-slate-300">বিভাগ</label>
              <select
                value={division}
                onChange={(e) => {
                  setDivision(e.target.value);
                  setDistrict('');
                  setUpazila('');
                }}
                className={selectCls}
              >
                <option value="">বিভাগ সিলেক্ট করুন</option>
                {Object.keys(BD_LOCATIONS).map((div) => (
                  <option key={div} value={div}>{div}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 ml-1 block text-[13px] font-bold text-slate-700 dark:text-slate-300">জেলা</label>
              <select
                disabled={!division}
                value={district}
                onChange={(e) => {
                  setDistrict(e.target.value);
                  setUpazila('');
                }}
                className={selectCls}
              >
                <option value="">জেলা সিলেক্ট করুন</option>
                {division &&
                  Object.keys(BD_LOCATIONS[division] || {}).map((dist) => (
                    <option key={dist} value={dist}>{dist}</option>
                  ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 ml-1 block text-[13px] font-bold text-slate-700 dark:text-slate-300">উপজেলা / থানা</label>
              <select disabled={!district} value={upazila} onChange={(e) => setUpazila(e.target.value)} className={selectCls}>
                <option value="">উপজেলা/থানা সিলেক্ট করুন</option>
                {division &&
                  district &&
                  BD_LOCATIONS[division]?.[district]?.map((upz) => (
                    <option key={upz} value={upz}>{upz}</option>
                  ))}
              </select>
            </div>
          </div>

          <Field label="গ্রাম / মহল্লা / রোড (ঐচ্ছিক)" icon={Building}>
            <input
              value={areaDetails}
              onChange={(e) => setAreaDetails(e.target.value)}
              placeholder="যেমন: ব্লক-সি, রোড নং-৪"
              className={inputCls}
            />
          </Field>
        </Section>

        {/* রক্তের তথ্য */}
        <Section
          tone="red"
          title="রক্তের তথ্য"
          step="ধাপ ৩"
          note="আপনার রক্তের গ্রুপ বেছে নিন। শেষ রক্তদানের ৩ মাস পর আবার দেওয়া যায়।"
        >
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

          <Field label="শেষ রক্তদানের তারিখ (যদি থাকে)" icon={CalendarDays}>
            <input
              type="date"
              value={form.last_donation_date}
              onChange={(e) => setForm({ ...form, last_donation_date: e.target.value })}
              max={new Date().toISOString().split('T')[0]}
              className={inputCls}
            />
          </Field>
        </Section>

        {/* জিপিএস */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50 to-teal-100 p-5 dark:border-emerald-900/40 dark:from-emerald-950/30 dark:to-slate-900">
          <div className="flex flex-col gap-0.5">
            <span className="text-lg font-extrabold text-emerald-950 dark:text-emerald-300">আপনার জিপিএস লোকেশন</span>
            <span className="text-sm text-emerald-800/80 dark:text-emerald-400/80">কাছের মানুষ যেন সহজে খুঁজে পায়</span>
          </div>
          <motion.button
            type="button"
            onClick={handleUseLocation}
            disabled={locating}
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.96 }}
            className={`inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-extrabold text-white shadow-lg disabled:opacity-60 ${
              coords ? 'bg-gradient-to-r from-emerald-500 to-teal-700' : 'bg-gradient-to-r from-teal-600 to-emerald-900'
            }`}
          >
            <MapPin className="h-4 w-4" />
            {locating ? 'লোকেশন খোঁজা হচ্ছে...' : coords ? 'লোকেশন যুক্ত হয়েছে ✓' : 'লোকেশন নিন'}
          </motion.button>
        </div>

        <FormError error={error} />

        <SubmitButton loading={submitting} loadingText="রেজিস্টার হচ্ছে...">
          ডোনার হিসেবে রেজিস্টার করুন
        </SubmitButton>

        <p className="text-center text-sm text-slate-600 dark:text-slate-400">
          আগে থেকে একাউন্ট আছে?{' '}
          <a href="/login" className="font-bold text-red-600 underline-offset-4 hover:underline dark:text-red-400">
            লগইন করুন
          </a>
        </p>
      </form>
    </AuthShell>
  );
}