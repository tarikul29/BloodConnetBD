import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'রক্তের জন্য অনুরোধ করুন — জরুরি রক্ত চাই',
  description: 'রোগীর জন্য রক্ত দরকার? ব্লাড কানেক্ট বিডিতে অনুরোধ দিন, কাছের রক্তদাতারা সঙ্গে সঙ্গে জানতে পারবেন।',
  alternates: { canonical: '/request-blood' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}