-- FLOWDESK PRODUCTION SCHEMA
-- Run this once in the Supabase SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.businesses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  phone text,
  whatsapp text,
  currency text not null default 'RWF',
  timezone text not null default 'Africa/Kigali',
  created_at timestamptz not null default now()
);

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  name text not null,
  phone text not null,
  service text not null,
  message text,
  status text not null default 'new' check (status in ('new','contacted','booked','completed','lost')),
  created_at timestamptz not null default now()
);

create table if not exists public.public_leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  service text not null,
  message text,
  created_at timestamptz not null default now()
);

alter table public.businesses enable row level security;
alter table public.leads enable row level security;
alter table public.public_leads enable row level security;

create policy "owners can read their businesses" on public.businesses
for select to authenticated using (owner_id = auth.uid());

create policy "owners can create businesses" on public.businesses
for insert to authenticated with check (owner_id = auth.uid());

create policy "owners can update their businesses" on public.businesses
for update to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create policy "owners can read their leads" on public.leads
for select to authenticated using (
  exists (select 1 from public.businesses b where b.id = leads.business_id and b.owner_id = auth.uid())
);

create policy "owners can update their leads" on public.leads
for update to authenticated using (
  exists (select 1 from public.businesses b where b.id = leads.business_id and b.owner_id = auth.uid())
) with check (
  exists (select 1 from public.businesses b where b.id = leads.business_id and b.owner_id = auth.uid())
);

-- Public lead intake only permits inserts. It never exposes existing customer records.
create policy "public can submit a lead" on public.public_leads
for insert to anon, authenticated with check (
  length(trim(name)) between 1 and 120
  and length(trim(phone)) between 3 and 40
  and length(trim(service)) between 1 and 160
);

-- Do not create a SELECT policy for public_leads.
-- Customer records must never be publicly readable.

create index if not exists leads_business_created_idx on public.leads(business_id, created_at desc);
create index if not exists public_leads_created_idx on public.public_leads(created_at desc);