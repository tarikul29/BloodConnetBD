import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'রক্তদাতা খুঁজুন — কাছের ডোনার ও সব ব্লাড গ্রুপ',
  description: 'ব্লাড কানেক্ট বিডি: আপনার কাছের রক্তদাতা খুঁজুন। A+, A-, B+, B-, O+, O-, AB+, AB- সব গ্রুপের প্রস্তুত ডোনারদের তালিকা, দূরত্বসহ, বাংলাদেশজুড়ে।',
  alternates: { canonical: '/donors' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}