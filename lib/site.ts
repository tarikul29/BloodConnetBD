// সাইটের ঠিকানা এক জায়গায়। ভবিষ্যতে নিজের ডোমেইন কিনলে শুধু Vercel-এ
// NEXT_PUBLIC_SITE_URL ভ্যারিয়েবল বদলালেই হবে, কোড বদলাতে হবে না।
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://blood-connet-bd.vercel.app').replace(/\/$/, '');
export const SITE_NAME = 'BloodConnect BD';
export const SITE_NAME_BN = 'ব্লাড কানেক্ট বিডি';
export const SITE_DESCRIPTION =
  'BloodConnect BD (ব্লাড কানেক্ট বিডি) — বাংলাদেশের জরুরি রক্তদাতা খুঁজুন, রক্তের অনুরোধ দিন এবং রক্তদাতা হিসেবে রেজিস্টার করুন। কাছের ডোনার, সব ব্লাড গ্রুপ, বিনামূল্যে।';