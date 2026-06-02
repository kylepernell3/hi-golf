-- ============================================================
-- Hi Golf — Release 1 Database Schema
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- ── Enable extensions ────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ── Enums ────────────────────────────────────────────────────
create type user_role as enum ('student', 'coach', 'admin');
create type skill_level as enum ('beginner', 'intermediate', 'advanced', 'scratch');
create type handedness as enum ('right', 'left');
create type booking_status as enum (
  'pending',
  'confirmed',
  'completed',
  'cancelled',
  'no_show'
);
create type ledger_entry_type as enum (
  'purchase',
  'booking_debit',
  'cancellation_refund',
  'manual_credit',
  'manual_debit',
  'promo'
);
create type product_type as enum ('lesson_pack');

-- ── users (extends Supabase auth.users) ─────────────────────
create table public.users (
  id           uuid primary key references auth.users(id) on delete cascade,
  email        text not null,
  role         user_role not null default 'student',
  full_name    text,
  avatar_url   text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ── student_profiles ─────────────────────────────────────────
create table public.student_profiles (
  id                  uuid primary key default uuid_generate_v4(),
  user_id             uuid not null unique references public.users(id) on delete cascade,
  phone               text,
  handedness          handedness,
  skill_level         skill_level,
  goals               text,
  handicap_index      numeric(4,1),
  avg_score           int,
  physical_notes      text,
  onboarding_complete boolean not null default false,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- ── products (lesson packages) ───────────────────────────────
create table public.products (
  id                  uuid primary key default uuid_generate_v4(),
  name                text not null,
  description         text,
  type                product_type not null default 'lesson_pack',
  sessions_included   int not null check (sessions_included > 0),
  price_cents         int not null check (price_cents >= 0),
  stripe_price_id     text unique,
  is_active           boolean not null default true,
  created_at          timestamptz not null default now()
);

-- Seed the three Release 1 packages
insert into public.products (name, description, sessions_included, price_cents, stripe_price_id) values
  ('Single Lesson',  '1 coaching session',  1, 9900,  null),
  ('3-Lesson Pack',  '3 coaching sessions', 3, 27900, null),
  ('5-Lesson Pack',  '5 coaching sessions', 5, 44900, null);

-- ── credit_ledger ─────────────────────────────────────────────
create table public.credit_ledger (
  id             uuid primary key default uuid_generate_v4(),
  student_id     uuid not null references public.users(id) on delete cascade,
  delta          int not null,   -- positive = credit, negative = debit
  entry_type     ledger_entry_type not null,
  product_id     uuid references public.products(id),
  booking_id     uuid,           -- FK added after bookings table created
  stripe_payment_intent_id text,
  note           text,
  created_at     timestamptz not null default now()
);

-- ── bookings ──────────────────────────────────────────────────
create table public.bookings (
  id              uuid primary key default uuid_generate_v4(),
  student_id      uuid not null references public.users(id) on delete cascade,
  coach_id        uuid references public.users(id),
  scheduled_at    timestamptz not null,
  duration_mins   int not null default 60,
  status          booking_status not null default 'pending',
  location        text,
  student_notes   text,
  coach_notes     text,
  ledger_entry_id uuid references public.credit_ledger(id),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- Add the circular FK now that bookings table exists
alter table public.credit_ledger
  add constraint fk_credit_ledger_booking
  foreign key (booking_id) references public.bookings(id);

-- ── Utility: credit balance view ──────────────────────────────
create or replace view public.student_credit_balances as
  select
    student_id,
    coalesce(sum(delta), 0) as balance
  from public.credit_ledger
  group by student_id;

-- ── Row Level Security ────────────────────────────────────────
alter table public.users enable row level security;
alter table public.student_profiles enable row level security;
alter table public.products enable row level security;
alter table public.credit_ledger enable row level security;
alter table public.bookings enable row level security;

-- users
create policy "users: own row" on public.users
  for all using (auth.uid() = id);

create policy "users: coach can read all" on public.users
  for select using (
    exists (
      select 1 from public.users u
      where u.id = auth.uid() and u.role in ('coach','admin')
    )
  );

-- student_profiles
create policy "profiles: own row" on public.student_profiles
  for all using (auth.uid() = user_id);

create policy "profiles: coach can read all" on public.student_profiles
  for select using (
    exists (
      select 1 from public.users u
      where u.id = auth.uid() and u.role in ('coach','admin')
    )
  );

-- products: public read, coach/admin write
create policy "products: public read" on public.products
  for select using (is_active = true);

create policy "products: coach write" on public.products
  for all using (
    exists (
      select 1 from public.users u
      where u.id = auth.uid() and u.role in ('coach','admin')
    )
  );

-- credit_ledger: student read own, coach read all, no direct student writes
create policy "ledger: student read own" on public.credit_ledger
  for select using (auth.uid() = student_id);

create policy "ledger: coach read all" on public.credit_ledger
  for select using (
    exists (
      select 1 from public.users u
      where u.id = auth.uid() and u.role in ('coach','admin')
    )
  );

create policy "ledger: service role write" on public.credit_ledger
  for insert with check (true);

-- bookings
create policy "bookings: student own" on public.bookings
  for all using (auth.uid() = student_id);

create policy "bookings: coach all" on public.bookings
  for all using (
    exists (
      select 1 from public.users u
      where u.id = auth.uid() and u.role in ('coach','admin')
    )
  );

-- ── Triggers: updated_at ──────────────────────────────────────
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger users_updated_at
  before update on public.users
  for each row execute procedure public.handle_updated_at();

create trigger profiles_updated_at
  before update on public.student_profiles
  for each row execute procedure public.handle_updated_at();

create trigger bookings_updated_at
  before update on public.bookings
  for each row execute procedure public.handle_updated_at();

-- ── Trigger: auto-create user row on signup ───────────────────
create or replace function public.handle_new_auth_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.users (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', '')
  );
  insert into public.student_profiles (user_id)
  values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_auth_user();
