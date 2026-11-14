'use client';

import { useState } from 'react';
import { X, Droplet, MapPin, Phone, Building2, User } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { BloodGroup } from '@/types/database';

const BLOOD_GROUPS: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

interface RequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function RequestModal({ isOpen, onClose, onSuccess }: RequestModalProps) {
  const [form, setForm] = useState({
    patient_name: '',
    hospital_name: '',
    blood_group: 'O+' as BloodGroup,
    bags_needed: 1,
    contact_phone: '',
  });
  const [locating, setLocating] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  function handleUseLocation() {
    setLocating(true);
    setError(null);
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      setLocating(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
      },
      () => {
        setError('Unable to fetch location. Please allow location access.');
        setLocating(false);
      }
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!coords) {
      setError('Please share the hospital location before submitting.');
      return;
    }
    if (!/^01[3-9]\d{8}$/.test(form.contact_phone)) {
      setError('Please enter a valid Bangladeshi phone number (e.g. 017XXXXXXXX).');
      return;
    }

    setSubmitting(true);
    const supabase = createClient();

    const { error: insertError } = await supabase.from('blood_requests').insert({
      patient_name: form.patient_name,
      hospital_name: form.hospital_name,
      blood_group: form.blood_group,
      bags_needed: form.bags_needed,
      latitude: coords.lat,
      longitude: coords.lng,
      contact_phone: form.contact_phone,
      urgency_status: 'critical',
    });

    setSubmitting(false);

    if (insertError) {
      setError('Something went wrong. Please try again.');
      return;
    }

    onSuccess?.();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/60 p-0 backdrop-blur-sm sm:items-center sm:p-4">
      <div className="relative max-h-[92vh] w-full overflow-y-auto rounded-t-[2rem] border border-orange-100 bg-gradient-to-b from-white to-rose-50/70 shadow-2xl dark:border-slate-800 dark:from-slate-900 dark:to-slate-900 sm:max-w-lg sm:rounded-[2rem]">
        {/* রঙিন মাথা */}
        <div className="sticky top-0 z-10 overflow-hidden bg-gradient-to-r from-red-900 via-red-600 to-orange-500 px-6 py-5">
          <div
            className="absolute inset-0 opacity-20"
            style={{ backgroundImage: 'radial-gradient(circle at 12px 12px,#fff 2px,transparent 3px)', backgroundSize: '36px 36px' }}
          />
          <div className="relative flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-red-600 shadow-lg">
                <Droplet className="h-5 w-5" fill="currentColor" />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-white">Emergency Blood Request</h2>
                <p className="text-xs text-red-100">Nearby donors will see it right away</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-full bg-white/20 p-2 text-white transition-colors hover:bg-white/35"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-6">
          <Field label="Patient Name" icon={<User className="h-4 w-4 text-red-600" />}>
            <input
              required
              value={form.patient_name}
              onChange={(e) => setForm({ ...form, patient_name: e.target.value })}
              placeholder="e.g. Abdul Karim"
              className="input"
            />
          </Field>

          <Field label="Hospital Name" icon={<Building2 className="h-4 w-4 text-red-600" />}>
            <input
              required
              value={form.hospital_name}
              onChange={(e) => setForm({ ...form, hospital_name: e.target.value })}
              placeholder="e.g. Dhaka Medical College Hospital"
              className="input"
            />
          </Field>

          <div className="grid grid-cols-2 gap-4 rounded-3xl border border-amber-200/80 bg-gradient-to-br from-amber-50 to-orange-100 p-4 dark:border-amber-900/40 dark:from-amber-950/30 dark:to-slate-800">
            <Field label="Blood Group">
              <select
                value={form.blood_group}
                onChange={(e) => setForm({ ...form, blood_group: e.target.value as BloodGroup })}
                className="input"
              >
                {BLOOD_GROUPS.map((bg) => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </Field>

            <Field label="Bags Needed">
              <input
                type="number"
                min={1}
                required
                value={form.bags_needed}
                onChange={(e) => setForm({ ...form, bags_needed: Number(e.target.value) })}
                className="input"
              />
            </Field>
          </div>

          <Field label="Contact Phone" icon={<Phone className="h-4 w-4 text-red-600" />}>
            <input
              required
              value={form.contact_phone}
              onChange={(e) => setForm({ ...form, contact_phone: e.target.value })}
              placeholder="01XXXXXXXXX"
              className="input"
            />
          </Field>

          <div className="rounded-3xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50 to-teal-100 p-4 dark:border-emerald-900/40 dark:from-emerald-950/30 dark:to-slate-800">
            <Field label="Hospital Location" icon={<MapPin className="h-4 w-4 text-emerald-700" />}>
              <button
                type="button"
                onClick={handleUseLocation}
                disabled={locating}
                className={`flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm font-extrabold text-white shadow-lg transition-transform hover:-translate-y-0.5 disabled:opacity-60 ${
                  coords ? 'bg-gradient-to-r from-emerald-500 to-teal-700' : 'bg-gradient-to-r from-teal-600 to-emerald-900'
                }`}
              >
                <MapPin className="h-4 w-4" />
                {locating ? 'Fetching location...' : coords ? 'Location captured ✓' : 'Use current location'}
              </button>
            </Field>
          </div>

          {error && (
            <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-900/50 dark:bg-red-950/50 dark:text-red-400">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-2xl bg-gradient-to-r from-red-500 via-red-600 to-red-800 py-4 text-base font-extrabold text-white shadow-lg shadow-red-300/50 transition-transform hover:-translate-y-0.5 disabled:opacity-60 dark:shadow-none"
          >
            {submitting ? 'Submitting...' : 'Submit Emergency Request'}
          </button>
        </form>
      </div>

      <style jsx global>{`
        .input {
          width: 100%;
          border-radius: 1rem;
          border: 1.5px solid rgb(255 237 213);
          background: linear-gradient(180deg, #fff, rgb(255 247 237 / 0.6));
          padding: 0.75rem 1rem;
          font-size: 0.95rem;
          font-weight: 500;
          color: rgb(15 23 42);
          transition: all 0.2s;
        }
        .dark .input {
          border-color: rgb(51 65 85);
          background: rgb(30 41 59);
          color: white;
        }
        .input:focus {
          outline: none;
          border-color: rgb(220 38 38);
          box-shadow: 0 0 0 4px rgb(220 38 38 / 0.15);
        }
      `}</style>
    </div>
  );
}

function Field({
  label,
  icon,
  children,
}: {
  label: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-[13px] font-bold text-slate-700 dark:text-slate-300 mb-1.5 ml-1">
        {icon}
        {label}
      </label>
      {children}
    </div>
  );
}