import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'জরুরি রক্তের অনুরোধ — এখন কার রক্ত দরকার',
  description: 'বাংলাদেশে এই মুহূর্তে যাদের জরুরি রক্ত দরকার তাদের অনুরোধের তালিকা। হাসপাতাল, ব্লাড গ্রুপ ও যোগাযোগ দেখে রক্ত দিয়ে জীবন বাঁচান।',
  alternates: { canonical: '/requests' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}