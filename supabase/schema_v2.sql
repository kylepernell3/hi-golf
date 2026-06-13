-- ============================================================
-- Hi Golf — Release 2 Schema Migration
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor)
-- Adds: swing_uploads, rounds, goals, reward_redemptions
-- ============================================================

-- ── swing_uploads ──────────────────────────────────────────
-- Stores dated swing video uploads per student with coach feedback
create table if not exists public.swing_uploads (
  id              uuid primary key default gen_random_uuid(),
  student_id      uuid not null references public.users(id) on delete cascade,
  file_url        text not null,
  recorded_date   date not null default current_date,
  club_used       text,
  category        text check (category in ('driver','iron','wedge','putting','chipping','full_swing','other')) default 'full_swing',
  notes           text,
  coach_notes     text,
  coach_id        uuid references public.users(id) on delete set null,
  created_at      timestamptz not null default now()
);

alter table public.swing_uploads enable row level security;

create policy "Students can view own uploads"
  on public.swing_uploads for select
  using (student_id = auth.uid());

create policy "Students can insert own uploads"
  on public.swing_uploads for insert
  with check (student_id = auth.uid());

create policy "Coaches can view and update uploads for their students"
  on public.swing_uploads for all
  using (
    exists (
      select 1 from public.users u
      where u.id = auth.uid() and u.role = 'coach'
    )
  );

create index if not exists swing_uploads_student_id_idx on public.swing_uploads(student_id);
create index if not exists swing_uploads_recorded_date_idx on public.swing_uploads(recorded_date desc);

-- ── rounds ─────────────────────────────────────────────────
-- Stores golf round logs per student for score/handicap tracking
create table if not exists public.rounds (
  id                      uuid primary key default gen_random_uuid(),
  student_id              uuid not null references public.users(id) on delete cascade,
  played_date             date not null default current_date,
  course_name             text not null,
  holes                   smallint not null default 18 check (holes in (9, 18)),
  gross_score             smallint not null,
  course_rating           numeric(4,1),
  slope_rating            smallint,
  handicap_differential   numeric(5,2) generated always as (
    case
      when slope_rating is not null and course_rating is not null
        then round(((gross_score - course_rating) * 113.0 / slope_rating)::numeric, 1)
      else null
    end
  ) stored,
  fairways_hit            smallint,
  greens_in_regulation    smallint,
  putts                   smallint,
  weather                 text,
  notes                   text,
  points_earned           integer not null default 50,
  created_at              timestamptz not null default now()
);

alter table public.rounds enable row level security;

create policy "Students can manage own rounds"
  on public.rounds for all
  using (student_id = auth.uid())
  with check (student_id = auth.uid());

create policy "Coaches can view student rounds"
  on public.rounds for select
  using (
    exists (
      select 1 from public.users u
      where u.id = auth.uid() and u.role = 'coach'
    )
  );

create index if not exists rounds_student_id_idx on public.rounds(student_id);
create index if not exists rounds_played_date_idx on public.rounds(played_date desc);

-- ── goals ──────────────────────────────────────────────────
-- Student goals with milestone tracking
create type goal_type as enum (
  'handicap_target',
  'rounds_per_month',
  'scoring_avg',
  'sessions_booked',
  'swing_uploads',
  'custom'
);

create table if not exists public.goals (
  id              uuid primary key default gen_random_uuid(),
  student_id      uuid not null references public.users(id) on delete cascade,
  type            goal_type not null default 'custom',
  title           text not null,
  description     text,
  target_value    numeric(8,2) not null,
  current_value   numeric(8,2) not null default 0,
  unit            text,
  deadline        date,
  achieved_at     timestamptz,
  points_on_achieve integer not null default 100,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

alter table public.goals enable row level security;

create policy "Students can manage own goals"
  on public.goals for all
  using (student_id = auth.uid())
  with check (student_id = auth.uid());

create index if not exists goals_student_id_idx on public.goals(student_id);

-- ── reward_redemptions ─────────────────────────────────────
-- Tracks when students redeem their credit balance for rewards
create type redemption_status as enum ('pending', 'approved', 'fulfilled', 'declined');

create table if not exists public.reward_redemptions (
  id              uuid primary key default gen_random_uuid(),
  student_id      uuid not null references public.users(id) on delete cascade,
  credits_spent   integer not null check (credits_spent > 0),
  reward_type     text not null check (reward_type in ('free_lesson','gear_discount','club_credit','custom')),
  reward_detail   text,
  status          redemption_status not null default 'pending',
  fulfilled_by    uuid references public.users(id) on delete set null,
  fulfilled_at    timestamptz,
  notes           text,
  created_at      timestamptz not null default now()
);

alter table public.reward_redemptions enable row level security;

create policy "Students can view own redemptions"
  on public.reward_redemptions for select
  using (student_id = auth.uid());

create policy "Students can insert own redemptions"
  on public.reward_redemptions for insert
  with check (student_id = auth.uid());

create policy "Coaches can manage redemptions"
  on public.reward_redemptions for all
  using (
    exists (
      select 1 from public.users u
      where u.id = auth.uid() and u.role in ('coach','admin')
    )
  );

create index if not exists reward_redemptions_student_id_idx on public.reward_redemptions(student_id);

-- ── updated_at triggers ────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger goals_set_updated_at
  before update on public.goals
  for each row execute procedure public.set_updated_at();
