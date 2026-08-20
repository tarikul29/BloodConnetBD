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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-sm p-0 sm:p-4">
      <div className="w-full sm:max-w-lg bg-white dark:bg-slate-900 border border-transparent dark:border-slate-800 rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 z-10">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-rose-50 dark:bg-rose-950/50 rounded-xl text-red-600 dark:text-red-400">
              <Droplet className="h-5 w-5" fill="currentColor" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Emergency Blood Request</h2>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <Field label="Patient Name" icon={<User className="h-4 w-4" />}>
            <input
              required
              value={form.patient_name}
              onChange={(e) => setForm({ ...form, patient_name: e.target.value })}
              placeholder="e.g. Abdul Karim"
              className="input"
            />
          </Field>

          <Field label="Hospital Name" icon={<Building2 className="h-4 w-4" />}>
            <input
              required
              value={form.hospital_name}
              onChange={(e) => setForm({ ...form, hospital_name: e.target.value })}
              placeholder="e.g. Dhaka Medical College Hospital"
              className="input"
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
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

          <Field label="Contact Phone" icon={<Phone className="h-4 w-4" />}>
            <input
              required
              value={form.contact_phone}
              onChange={(e) => setForm({ ...form, contact_phone: e.target.value })}
              placeholder="01XXXXXXXXX"
              className="input"
            />
          </Field>

          <Field label="Hospital Location" icon={<MapPin className="h-4 w-4" />}>
            <button
              type="button"
              onClick={handleUseLocation}
              disabled={locating}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-60 transition-colors"
            >
              <MapPin className="h-4 w-4 text-red-500" />
              {locating ? 'Fetching location...' : coords ? 'Location captured ✓' : 'Use current location'}
            </button>
          </Field>

          {error && (
            <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/50 rounded-xl px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-full bg-red-600 py-3.5 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-60 transition-colors shadow-lg shadow-red-500/20"
          >
            {submitting ? 'Submitting...' : 'Submit Emergency Request'}
          </button>
        </form>
      </div>

      <style jsx global>{`
        .input {
          width: 100%;
          border-radius: 0.75rem;
          border: 1px solid rgb(226 232 240);
          background-color: rgb(248 250 252 / 0.5);
          padding: 0.625rem 0.75rem;
          font-size: 0.875rem;
          color: rgb(15 23 42);
          transition: all 0.2s;
        }
        .dark .input {
          border-color: rgb(51 65 85);
          background-color: rgb(30 41 59 / 0.5);
          color: white;
        }
        .input:focus {
          outline: none;
          border-color: rgb(220 38 38);
          box-shadow: 0 0 0 3px rgb(254 226 226);
        }
        .dark .input:focus {
          border-color: rgb(239 68 68);
          box-shadow: 0 0 0 3px rgb(127 29 29 / 0.5);
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
      <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
        {icon}
        {label}
      </label>
      {children}
    </div>
  );
}