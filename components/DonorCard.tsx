'use client';

import { Phone, MessageSquare, MapPin, Droplet, CheckCircle2, Clock } from 'lucide-react';
import { checkDonorEligibility } from '@/lib/eligibility';
import type { Donor } from '@/types/database';

interface DonorCardProps {
  donor: Donor;
  distanceKm?: number;
}

export default function DonorCard({ donor, distanceKm }: DonorCardProps) {
  const eligibility = checkDonorEligibility(donor.last_donation_date);
  const canDonate = donor.is_available && eligibility.isEligible;

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-bold text-slate-900 dark:text-white">{donor.full_name}</h3>
          {typeof distanceKm === 'number' && (
            <p className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              <MapPin className="h-3 w-3" />
              {distanceKm.toFixed(1)} km away
            </p>
          )}
        </div>
        <div className="flex items-center gap-1 rounded-full bg-red-50 dark:bg-red-950/60 px-2.5 py-1 text-sm font-bold text-red-600 dark:text-red-400">
          <Droplet className="h-3.5 w-3.5" fill="currentColor" />
          {donor.blood_group}
        </div>
      </div>

      <div className="mt-4">
        {canDonate ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-green-50 dark:bg-green-950/60 px-2.5 py-1 text-xs font-semibold text-green-700 dark:text-green-400">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Available to donate
          </span>
        ) : !donor.is_available ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <Clock className="h-3.5 w-3.5" />
            Currently unavailable
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 dark:bg-amber-950/60 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:text-amber-400">
            <Clock className="h-3.5 w-3.5" />
            Eligible in {eligibility.daysRemaining} day{eligibility.daysRemaining !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2">
        <a
          href={`tel:${donor.phone}`}
          className={`inline-flex items-center justify-center gap-1.5 rounded-full py-2.5 text-sm font-semibold transition-colors ${
            canDonate
              ? 'bg-red-600 text-white hover:bg-red-700'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 pointer-events-none'
          }`}
        >
          <Phone className="h-4 w-4" />
          Call
        </a>
        <a
          href={`sms:${donor.phone}`}
          className={`inline-flex items-center justify-center gap-1.5 rounded-full border py-2.5 text-sm font-semibold transition-colors ${
            canDonate
              ? 'border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50'
              : 'border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-600 pointer-events-none'
          }`}
        >
          <MessageSquare className="h-4 w-4" />
          SMS
        </a>
      </div>
    </div>
  );
}