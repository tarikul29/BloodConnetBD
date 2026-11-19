'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ImagePlus, Loader2, Trash2, Upload, Clock, X } from 'lucide-react';
import { compressImage } from '@/lib/imageCompress';

type Item = {
  id: string;
  image_url: string;
  donor_name: string;
  blood_group: string | null;
  caption: string | null;
  created_at: string;
  expires_at: string;
};

const GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const bn = (n: number) => n.toLocaleString('bn-BD');

function adminKey() {
  try {
    return sessionStorage.getItem('admin_key') ?? '';
  } catch {
    return '';
  }
}

function daysLeft(iso: string) {
  const ms = new Date(iso).getTime() - Date.now();
  if (ms <= 0) return 'মেয়াদ শেষ';
  const d = Math.ceil(ms / 86400000);
  return `আর ${bn(d)} দিন থাকবে`;
}

export default function AdminGallery({ onToast }: { onToast: (kind: 'ok' | 'err', text: string) => void }) {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [group, setGroup] = useState('');
  const [caption, setCaption] = useState('');
  const [busy, setBusy] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: adminKey(), action: 'list' }),
      });
      if (res.ok) {
        const j = await res.json();
        setItems(j.items ?? []);
      } else {
        onToast('err', 'গ্যালারি লোড হয়নি।');
      }
    } catch {
      onToast('err', 'ইন্টারনেট সমস্যা।');
    }
    setLoading(false);
  }, [onToast]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f) return;
    if (!f.type.startsWith('image/')) return onToast('err', 'শুধু ছবি দিন।');
    try {
      // ছবি ছোট করে নিচ্ছি (সর্বোচ্চ ~২৫০ KB) যাতে স্টোরেজ কম লাগে
      const small = await compressImage(f, { maxSide: 1000, maxBytes: 250 * 1024 });
      if (preview) URL.revokeObjectURL(preview);
      setFile(small);
      setPreview(URL.createObjectURL(small));
    } catch {
      onToast('err', 'ছবিটা পড়া যায়নি। অন্য ছবি দিন।');
    }
  }

  async function upload(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return onToast('err', 'আগে একটা ছবি বাছুন।');
    if (!name.trim()) return onToast('err', 'রক্তদাতার নাম লিখুন।');
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append('password', adminKey());
      fd.append('file', file);
      fd.append('donor_name', name.trim());
      fd.append('blood_group', group);
      fd.append('caption', caption.trim());
      const res = await fetch('/api/admin/gallery', { method: 'POST', body: fd });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) {
        onToast('err', j.error || 'আপলোড হয়নি।');
      } else {
        setItems((p) => [j.item, ...p]);
        setFile(null);
        setPreview(null);
        setName('');
        setGroup('');
        setCaption('');
        onToast('ok', 'ছবি যোগ হয়েছে। ৭ দিন পর নিজে মুছে যাবে।');
      }
    } catch {
      onToast('err', 'ইন্টারনেট সমস্যা।');
    }
    setBusy(false);
  }

  async function remove(id: string) {
    setDeletingId(id);
    try {
      const res = await fetch('/api/admin/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: adminKey(), action: 'delete', id }),
      });
      if (res.ok) {
        setItems((p) => p.filter((x) => x.id !== id));
        onToast('ok', 'ছবি মুছে ফেলা হয়েছে।');
      } else {
        onToast('err', 'মোছা যায়নি।');
      }
    } catch {
      onToast('err', 'ইন্টারনেট সমস্যা।');
    }
    setDeletingId(null);
  }

  const field =
    'w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/40';

  return (
    <div className="space-y-5">
      <form
        onSubmit={upload}
        className="rounded-3xl bg-white/80 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 shadow-xl p-5 sm:p-6 grid gap-5 md:grid-cols-[220px_1fr]"
      >
        <div>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="relative flex aspect-[4/5] w-full max-w-[220px] items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-slate-300 dark:border-white/20 bg-slate-50 dark:bg-white/5 text-slate-500 hover:border-rose-400 transition"
          >
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="নির্বাচিত ছবি" className="absolute inset-0 h-full w-full object-cover" />
            ) : (
              <span className="flex flex-col items-center gap-2 text-xs font-bold">
                <ImagePlus className="h-8 w-8" />
                ছবি বাছুন
              </span>
            )}
          </button>
          <input ref={inputRef} type="file" accept="image/*" onChange={onPick} className="hidden" />
          {file && (
            <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
              ছোট করা হয়েছে: {bn(Math.round(file.size / 1024))} KB
              <button
                type="button"
                onClick={() => {
                  setFile(null);
                  setPreview(null);
                }}
                className="ml-2 inline-flex items-center text-rose-600 hover:underline"
              >
                <X className="h-3 w-3" /> বাদ
              </button>
            </p>
          )}
        </div>

        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-[12px] font-bold text-slate-700 dark:text-slate-300">রক্তদাতার নাম *</label>
            <input value={name} onChange={(e) => setName(e.target.value)} maxLength={80} placeholder="যেমন: রাকিব হাসান" className={field} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-[12px] font-bold text-slate-700 dark:text-slate-300">ব্লাড গ্রুপ (ঐচ্ছিক)</label>
              <select value={group} onChange={(e) => setGroup(e.target.value)} className={field}>
                <option value="">— নেই —</option>
                {GROUPS.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-[12px] font-bold text-slate-700 dark:text-slate-300">ছোট লেখা (ঐচ্ছিক)</label>
              <input value={caption} onChange={(e) => setCaption(e.target.value)} maxLength={150} placeholder="যেমন: ঢাকা মেডিকেলে দিয়েছেন" className={field} />
            </div>
          </div>
          <button
            type="submit"
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-red-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-rose-600/30 disabled:opacity-60"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            {busy ? 'আপলোড হচ্ছে...' : 'হোম পেজে যোগ করুন'}
          </button>
          <p className="text-[11px] leading-[1.8] text-slate-500 dark:text-slate-400">
            ছবি নিজে থেকে ছোট হয়ে আপলোড হবে এবং <b>৭ দিন পর অটো মুছে যাবে</b>। চাইলে আগেও মুছতে পারবেন। রক্তদাতার অনুমতি নিয়ে ছবি দিন।
          </p>
        </div>
      </form>

      <div className="rounded-3xl bg-white/80 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 shadow-xl p-5 sm:p-6">
        <h3 className="mb-4 text-sm font-extrabold text-slate-900 dark:text-white">
          এখন হোম পেজে আছে ({bn(items.length)}টি)
        </h3>
        {loading ? (
          <div className="py-10 text-center">
            <Loader2 className="mx-auto h-6 w-6 animate-spin text-rose-600" />
          </div>
        ) : items.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">এখনো কোনো ছবি নেই।</p>
        ) : (
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {items.map((it) => (
              <li key={it.id} className="overflow-hidden rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900">
                <div className="relative aspect-[4/5] bg-slate-100 dark:bg-slate-800">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={it.image_url} alt={it.donor_name} className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
                  {it.blood_group && (
                    <span className="absolute right-2 top-2 rounded-full bg-red-600 px-2 py-0.5 text-[11px] font-black text-white">{it.blood_group}</span>
                  )}
                </div>
                <div className="space-y-1.5 p-2.5">
                  <p className="truncate text-[13px] font-bold text-slate-900 dark:text-white">{it.donor_name}</p>
                  <p className="flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400">
                    <Clock className="h-3 w-3" />
                    {daysLeft(it.expires_at)}
                  </p>
                  <button
                    onClick={() => remove(it.id)}
                    disabled={deletingId === it.id}
                    className="inline-flex w-full items-center justify-center gap-1 rounded-lg py-1.5 text-[12px] font-bold text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/15 disabled:opacity-50"
                  >
                    {deletingId === it.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                    মুছুন
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}