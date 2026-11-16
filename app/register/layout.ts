import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'রক্তদাতা হিসেবে রেজিস্টার করুন',
  description: 'ব্লাড কানেক্ট বিডির রক্তদাতা হোন। বিনামূল্যে রেজিস্টার করে জরুরি মুহূর্তে মানুষের পাশে দাঁড়ান।',
  alternates: { canonical: '/register' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}