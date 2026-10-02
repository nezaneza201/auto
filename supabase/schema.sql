create extension if not exists pgcrypto;

create table if not exists public.profiles(
 id uuid primary key references auth.users(id) on delete cascade,
 full_name text not null default '',
 phone text not null default '',
 created_at timestamptz not null default now()
);

create table if not exists public.businesses(
 id uuid primary key default gen_random_uuid(),
 owner_id uuid not null unique references auth.users(id) on delete cascade,
 name text not null,
 owner_name text not null default '',
 slug text not null unique,
 phone text not null default '',
 business_type text not null default 'Other',
 country text not null default 'Rwanda',
 currency text not null default 'RWF',
 timezone text not null default 'Africa/Kigali',
 created_at timestamptz not null default now()
);

create table if not exists public.leads(
 id uuid primary key default gen_random_uuid(),
 business_id uuid not null references public.businesses(id) on delete cascade,
 name text not null,
 phone text not null,
 email text,
 source text not null default 'WhatsApp',
 status text not null default 'new' check(status in ('new','contacted','interested','follow-up','won','lost')),
 notes text,
 created_at timestamptz not null default now(),
 last_contact timestamptz,
 next_follow_up timestamptz,
 assigned_user uuid references auth.users(id) on delete set null,
 estimated_value numeric(14,2)
);

create table if not exists public.customers(
 id uuid primary key default gen_random_uuid(),
 business_id uuid not null references public.businesses(id) on delete cascade,
 lead_id uuid references public.leads(id) on delete set null,
 name text not null,
 phone text,
 email text,
 created_at timestamptz not null default now()
);

create table if not exists public.follow_ups(
 id uuid primary key default gen_random_uuid(),
 business_id uuid not null references public.businesses(id) on delete cascade,
 lead_id uuid not null references public.leads(id) on delete cascade,
 due_at timestamptz not null,
 status text not null default 'pending' check(status in ('pending','completed','cancelled')),
 notes text,
 assigned_user uuid references auth.users(id) on delete set null,
 created_at timestamptz not null default now()
);

create table if not exists public.activities(
 id uuid primary key default gen_random_uuid(),
 business_id uuid not null references public.businesses(id) on delete cascade,
 lead_id uuid references public.leads(id) on delete cascade,
 actor_id uuid references auth.users(id) on delete set null,
 type text not null,
 description text not null,
 created_at timestamptz not null default now()
);

create table if not exists public.subscriptions(
 id uuid primary key default gen_random_uuid(),
 business_id uuid not null unique references public.businesses(id) on delete cascade,
 plan text not null default 'starter',
 status text not null default 'trialing',
 provider text,
 provider_customer_id text,
 provider_subscription_id text,
 current_period_end timestamptz,
 created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.businesses enable row level security;
alter table public.leads enable row level security;
alter table public.customers enable row level security;
alter table public.follow_ups enable row level security;
alter table public.activities enable row level security;
alter table public.subscriptions enable row level security;

drop policy if exists "profile own" on public.profiles;
create policy "profile own" on public.profiles for all to authenticated using(id=auth.uid()) with check(id=auth.uid());

drop policy if exists "business owner" on public.businesses;
create policy "business owner" on public.businesses for all to authenticated using(owner_id=auth.uid()) with check(owner_id=auth.uid());

drop policy if exists "lead owner read" on public.leads;
drop policy if exists "lead owner insert" on public.leads;
drop policy if exists "lead owner update" on public.leads;
drop policy if exists "lead owner delete" on public.leads;
create policy "lead owner read" on public.leads for select to authenticated using(exists(select 1 from public.businesses b where b.id=business_id and b.owner_id=auth.uid()));
create policy "lead owner insert" on public.leads for insert to authenticated with check(exists(select 1 from public.businesses b where b.id=business_id and b.owner_id=auth.uid()));
create policy "lead owner update" on public.leads for update to authenticated using(exists(select 1 from public.businesses b where b.id=business_id and b.owner_id=auth.uid())) with check(exists(select 1 from public.businesses b where b.id=business_id and b.owner_id=auth.uid()));
create policy "lead owner delete" on public.leads for delete to authenticated using(exists(select 1 from public.businesses b where b.id=business_id and b.owner_id=auth.uid()));

create policy "customer owner" on public.customers for all to authenticated using(exists(select 1 from public.businesses b where b.id=business_id and b.owner_id=auth.uid())) with check(exists(select 1 from public.businesses b where b.id=business_id and b.owner_id=auth.uid()));
create policy "followup owner" on public.follow_ups for all to authenticated using(exists(select 1 from public.businesses b where b.id=business_id and b.owner_id=auth.uid())) with check(exists(select 1 from public.businesses b where b.id=business_id and b.owner_id=auth.uid()));
create policy "activity owner" on public.activities for all to authenticated using(exists(select 1 from public.businesses b where b.id=business_id and b.owner_id=auth.uid())) with check(exists(select 1 from public.businesses b where b.id=business_id and b.owner_id=auth.uid()));
create policy "subscription owner" on public.subscriptions for all to authenticated using(exists(select 1 from public.businesses b where b.id=business_id and b.owner_id=auth.uid())) with check(exists(select 1 from public.businesses b where b.id=business_id and b.owner_id=auth.uid()));

create index if not exists leads_business_created_idx on public.leads(business_id,created_at desc);
create index if not exists leads_business_status_idx on public.leads(business_id,status);
create index if not exists leads_followup_idx on public.leads(business_id,next_follow_up);