export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
export type UrgencyStatus = 'critical' | 'urgent' | 'moderate' | 'fulfilled' | 'expired';

export interface Donor {
  id: string;
  full_name: string;
  phone: string;
  email: string | null;
    address: string | null;
  blood_group: BloodGroup;
  latitude: number;
  longitude: number;
  last_donation_date: string | null;
  is_available: boolean;
  photo_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface BloodRequest {
  id: string;
  patient_name: string;
  hospital_name: string;
  blood_group: BloodGroup;
  bags_needed: number;
  latitude: number;
  longitude: number;
  contact_phone: string;
  urgency_status: UrgencyStatus;
  patient_notes: string | null;
  created_at: string;
}
