'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Phone, MessageSquare, Search, Compass, Droplet, User, CheckCircle2, Clock, Navigation2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import Header from '@/components/Header';
import type { Donor, BloodGroup } from '@/types/database';

interface DonorWithDistance extends Donor {
  distance?: number;
}

const BLOOD_GROUPS: (BloodGroup | 'ALL')[] = ['ALL', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function DonorsPage() {
  const [donors, setDonors] = useState<DonorWithDistance[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<BloodGroup | 'ALL'>('ALL');
  const [locating, setLocating] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  useEffect(() => {
    fetchDonors();
  }, []);

  async function fetchDonors() {
    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from('donors')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setDonors(data as DonorWithDistance[]);
    }
    setLoading(false);
  }

  function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  function handleFindNearMe() {
    setLocating(true);
    setGeoError(null);

    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.');
      setLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const uLat = position.coords.latitude;
        const uLng = position.coords.longitude;

        const updatedDonors = donors.map((donor) => {
          if (donor.latitude && donor.longitude) {
            const dist = calculateDistance(uLat, uLng, donor.latitude, donor.longitude);
            return { ...donor, distance: dist };
          }
          return { ...donor, distance: undefined };
        });

        updatedDonors.sort((a, b) => {
          if (a.distance === undefined) return 1;
          if (b.distance === undefined) return -1;
          return a.distance - b.distance;
        });

        setDonors(updatedDonors);
        setLocating(false);
      },
      () => {
        setGeoError('Unable to retrieve location. Please allow GPS access.');
        setLocating(false);
      }
    );
  }

  const filteredDonors = donors.filter((donor) => {
    const matchesGroup = selectedGroup === 'ALL' || donor.blood_group === selectedGroup;
    const matchesSearch =
      donor.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      donor.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      donor.phone?.includes(searchQuery);

    return matchesGroup && matchesSearch;
  });

  return (
    <main className="min-h-screen pt-20 pb-20 bg-gradient-to-b from-rose-50/40 via-white to-slate-50 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 text-slate-800 dark:text-slate-100 relative overflow-hidden transition-colors">
      {/* Background Soft Glow Matches Homepage */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-100/30 dark:bg-red-950/20 rounded-full blur-[140px] pointer-events-none" />

      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Top Search & Filter Container */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-100 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm mb-8 transition-colors">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
              <input
                type="text"
                placeholder="Search by name, location, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
            </div>

            <button
              onClick={handleFindNearMe}
              disabled={locating}
              className="w-full md:w-auto flex items-center justify-center gap-2.5 bg-red-600 hover:bg-red-700 text-white px-7 py-3.5 rounded-2xl text-sm font-bold transition-all shadow-md shadow-red-500/20 active:scale-95 disabled:opacity-60"
            >
              <Navigation2 className={`h-4 w-4 ${locating ? 'animate-spin' : ''}`} />
              {locating ? 'Locating Nearby Donors...' : 'Find Donors Near Me'}
            </button>
          </div>

          <AnimatePresence>
            {geoError && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-xs text-red-600 dark:text-red-400 mb-4 bg-red-50 dark:bg-red-950/50 border border-red-100 dark:border-red-900/50 p-3 rounded-xl font-medium"
              >
                {geoError}
              </motion.p>
            )}
          </AnimatePresence>

          {/* Blood Group Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {BLOOD_GROUPS.map((bg) => (
              <button
                key={bg}
                onClick={() => setSelectedGroup(bg)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  selectedGroup === bg
                    ? 'bg-red-600 text-white shadow-md shadow-red-500/20'
                    : 'bg-slate-100/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200/80 dark:hover:bg-slate-700/80'
                }`}
              >
                {bg === 'ALL' ? 'All Groups' : bg}
              </button>
            ))}
          </div>
        </div>

        {/* Skeleton Loader */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-60 bg-white/70 dark:bg-slate-900/70 rounded-3xl animate-pulse border border-slate-100 dark:border-slate-800" />
            ))}
          </div>
        ) : filteredDonors.length === 0 ? (
          <div className="text-center py-20 bg-white/80 dark:bg-slate-900/80 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 shadow-sm">
            <Droplet className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">No Donors Found</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Try searching for a different area or blood group.</p>
          </div>
        ) : (
          /* Cards Grid Matching Homepage UI */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDonors.map((donor) => (
              <motion.div
                key={donor.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:shadow-red-500/5 dark:hover:shadow-red-950/20 hover:border-red-100 dark:hover:border-red-950 transition-all flex flex-col justify-between relative"
              >
                <div>
                  {/* Top Header */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-start gap-3.5 min-w-0">
                      {/* Fixed Size Avatar */}
                      <div className="h-12 w-12 rounded-2xl bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0 flex items-center justify-center border border-slate-100 dark:border-slate-700 shadow-inner">
                        {donor.photo_url ? (
                          <img
                            src={donor.photo_url}
                            alt={donor.full_name || 'Donor'}
                            className="h-full w-full object-cover rounded-2xl"
                          />
                        ) : (
                          <User className="h-6 w-6 text-slate-400 dark:text-slate-500" />
                        )}
                      </div>

                      {/* Donor Name & Address */}
                      <div className="min-w-0">
                        <h3 className="font-bold text-slate-900 dark:text-white text-base leading-snug truncate">
                          {donor.full_name}
                        </h3>

                        {donor.distance !== undefined && (
                          <div className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-900/60 px-2 py-0.5 rounded-md mt-1">
                            <Compass className="h-3 w-3" />
                            {donor.distance < 1
                              ? `${(donor.distance * 1000).toFixed(0)} meters away`
                              : `${donor.distance.toFixed(1)} km away`}
                          </div>
                        )}

                        <div className="flex items-start gap-1.5 text-slate-500 dark:text-slate-400 text-xs mt-1.5">
                          <MapPin className="h-3.5 w-3.5 shrink-0 text-red-500 mt-0.5" />
                          <span
                            className="line-clamp-2 break-words leading-relaxed font-medium"
                            title={donor.address || ''}
                          >
                            {donor.address || 'Address not provided'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Blood Group Badge */}
                    <div className="bg-red-600 text-white px-3.5 py-1.5 rounded-2xl font-black text-xs shrink-0 shadow-sm shadow-red-500/20">
                      {donor.blood_group}
                    </div>
                  </div>

                  {/* Availability Badge */}
                  <div className="mb-6">
                    {donor.is_available ? (
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/70 dark:border-emerald-900/60 px-3 py-1 rounded-full">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" /> Ready to Donate
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 border border-amber-200/70 dark:border-amber-900/60 px-3 py-1 rounded-full">
                        <Clock className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" /> On Break
                      </span>
                    )}
                  </div>
                </div>

                {/* Call & SMS Buttons */}
                <div className="grid grid-cols-2 gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <a
                    href={`tel:${donor.phone}`}
                    className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-3 rounded-2xl text-xs font-bold transition-all shadow-md shadow-red-500/15 active:scale-95"
                  >
                    <Phone className="h-3.5 w-3.5" /> Call Now
                  </a>
                  <a
                    href={`sms:${donor.phone}`}
                    className="flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 py-3 rounded-2xl text-xs font-bold transition-all active:scale-95"
                  >
                    <MessageSquare className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" /> Send SMS
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}