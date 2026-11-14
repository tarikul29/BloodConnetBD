'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { AuthShell, Field, FormError, FormHeading, SubmitButton, inputCls } from '@/components/FormUI';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setSubmitting(false);

    if (signInError) {
      setError('ইমেইল বা পাসওয়ার্ড ভুল হয়েছে।');
      return;
    }

    router.push('/dashboard');
    router.refresh();
  }

  return (
    <AuthShell
      badge="স্বাগতম ফিরে আসায়"
      title="আবার ফিরে এলেন,"
      accent="জীবন বাঁচাতে"
      subtitle="লগইন করে আপনার প্রোফাইল দেখুন, রক্তদানের অবস্থা আপডেট করুন আর জরুরি অনুরোধে সাড়া দিন।"
      perks={[
        'এক ট্যাপে "রক্ত দিতে প্রস্তুত" অন/অফ করুন',
        'আপনার প্রোফাইল ও তথ্য নিজেই আপডেট করুন',
        'কাছের জরুরি অনুরোধ সবার আগে দেখুন',
      ]}
      footerNote="BloodConnect BD — জীবন বাঁচানোর প্ল্যাটফর্ম"
    >
      <FormHeading
        pill="ডোনার লগইন"
        title="আপনার একাউন্টে"
        accent="ঢুকুন"
        subtitle="ইমেইল ও পাসওয়ার্ড দিয়ে নিরাপদে লগইন করুন।"
        badges={['নিরাপদ লগইন', 'বিনামূল্যে']}
      />

      <form onSubmit={handleSubmit} className="relative space-y-5">
        <Field label="ইমেইল" icon={Mail}>
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@gmail.com"
            className={inputCls}
          />
        </Field>

        <Field label="পাসওয়ার্ড" icon={Lock}>
          <input
            required
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="আপনার পাসওয়ার্ড"
            className={inputCls}
          />
        </Field>

        <FormError error={error} />

        <SubmitButton loading={submitting} loadingText="লগইন হচ্ছে...">
          লগইন করুন
        </SubmitButton>

        <p className="pt-1 text-center text-sm text-slate-600 dark:text-slate-400">
          একাউন্ট নেই?{' '}
          <Link href="/register" className="font-bold text-red-600 underline-offset-4 hover:underline dark:text-red-400">
            ডোনার হিসেবে রেজিস্টার করুন
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}