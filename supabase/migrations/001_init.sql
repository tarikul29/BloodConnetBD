-- Enable extensions
create extension if not exists "uuid-ossp";
create extension if not exists postgis;

-- ============================
-- DONORS TABLE
-- ============================
create table donors (
  id uuid primary key default uuid_generate_v4(),
  full_name text not null,
  phone text not null unique,
  blood_group text not null check (
    blood_group in ('A+','A-','B+','B-','AB+','AB-','O+','O-')
  ),
  latitude double precision not null,
  longitude double precision not null,
  last_donation_date date,
  is_available boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_donors_blood_group on donors (blood_group);
create index idx_donors_availability on donors (is_available);
create index idx_donors_location on donors (latitude, longitude);

-- ============================
-- BLOOD REQUESTS TABLE
-- ============================
create table blood_requests (
  id uuid primary key default uuid_generate_v4(),
  patient_name text not null,
  hospital_name text not null,
  blood_group text not null check (
    blood_group in ('A+','A-','B+','B-','AB+','AB-','O+','O-')
  ),
  bags_needed smallint not null check (bags_needed > 0),
  latitude double precision not null,
  longitude double precision not null,
  contact_phone text not null,
  urgency_status text not null default 'critical' check (
    urgency_status in ('critical', 'urgent', 'moderate', 'fulfilled', 'expired')
  ),
  created_at timestamptz not null default now()
);

create index idx_requests_blood_group on blood_requests (blood_group);
create index idx_requests_status on blood_requests (urgency_status);
create index idx_requests_created_at on blood_requests (created_at desc);

-- ============================
-- UPDATED_AT TRIGGER
-- ============================
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_donors_updated_at
before update on donors
for each row execute function set_updated_at();

-- ============================
-- ROW LEVEL SECURITY
-- ============================
alter table donors enable row level security;
alter table blood_requests enable row level security;

create policy "Public can view available donors"
  on donors for select
  using (true);

create policy "Donors can update own record"
  on donors for update
  using (auth.uid()::text = id::text);

create policy "Anyone can register as donor"
  on donors for insert
  with check (true);

create policy "Public can view blood requests"
  on blood_requests for select
  using (true);

create policy "Anyone can create blood request"
  on blood_requests for insert
  with check (true);

create policy "Restrict request updates to service role"
  on blood_requests for update
  using (auth.role() = 'service_role');
