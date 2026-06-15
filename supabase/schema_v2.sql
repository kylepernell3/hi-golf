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

-- ── credit_transactions ──────────────────────────────
-- Tracks all credit earning and spending transactions for complete audit trail
create type transaction_type as enum (
    'round_completion',
    'goal_achievement',
    'reward_redemption',
    'manual_adjustment',
    'referral_bonus',
    'coach_bonus'
  );

create table if not exists public.credit_transactions (
    id                uuid primary key default gen_random_uuid(),
    student_id        uuid not null references public.users(id) on delete cascade,
    amount            integer not null check (amount != 0),
    transaction_type  transaction_type not null,
    reference_id      uuid,
    reference_type    text,
    description       text,
    balance_after     integer not null check (balance_after >= 0),
    created_at        timestamptz not null default now(),
    created_by        uuid references public.users(id) on delete set null
  );

alter table public.credit_transactions enable row level security;

create policy "Students can view own transactions"
    on public.credit_transactions for select
    using (student_id = auth.uid());

create policy "System can insert transactions"
    on public.credit_transactions for insert
    with check (true);

create policy "Coaches and admins can view all transactions"
    on public.credit_transactions for select
    using (
      exists (
        select 1 from public.users u
        where u.id = auth.uid() and u.role in ('coach','admin')
      )
    );

create index if not exists credit_transactions_student_id_idx on public.credit_transactions(student_id);
create index if not exists credit_transactions_created_at_idx on public.credit_transactions(created_at desc);

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

-- ── Credit transaction automation ─────────────────────

-- Function to get current credit balance for a student
create or replace function public.get_credit_balance(user_id uuid)
  returns integer
  language plpgsql
  security definer
  as $$
  declare
    current_balance integer;
begin
    select coalesce(balance_after, 0) into current_balance
    from public.credit_transactions
    where student_id = user_id
    order by created_at desc
    limit 1;

  return current_balance;
end;
$$;

-- Function to create a credit transaction
create or replace function public.create_credit_transaction(
    p_student_id uuid,
    p_amount integer,
    p_transaction_type transaction_type,
    p_reference_id uuid default null,
    p_reference_type text default null,
    p_description text default null,
    p_created_by uuid default null
  )
  returns uuid
  language plpgsql
  security definer
  as $$
  declare
    v_current_balance integer;
  v_new_balance integer;
  v_transaction_id uuid;
begin
    -- Get current balance
    v_current_balance := public.get_credit_balance(p_student_id);

  -- Calculate new balance
  v_new_balance := v_current_balance + p_amount;

  -- Prevent negative balance
  if v_new_balance < 0 then
        raise exception 'Insufficient credits. Current balance: %, Attempted: %', v_current_balance, p_amount;
  end if;

  -- Insert transaction
  insert into public.credit_transactions (
        student_id,
        amount,
        transaction_type,
        reference_id,
        reference_type,
        description,
        balance_after,
        created_by
      ) values (
        p_student_id,
        p_amount,
        p_transaction_type,
        p_reference_id,
        p_reference_type,
        p_description,
        v_new_balance,
        p_created_by
      )
      returning id into v_transaction_id;

  return v_transaction_id;
end;
$$;

-- Trigger to automatically create credit transaction when round is inserted
create or replace function public.handle_round_credit()
  returns trigger
  language plpgsql
  security definer
  as $$
  begin
    perform public.create_credit_transaction(
      p_student_id := new.student_id,
      p_amount := new.points_earned,
      p_transaction_type := 'round_completion',
      p_reference_id := new.id,
      p_reference_type := 'round',
      p_description := 'Credits earned from completing round at ' || new.course_name
    );
  return new;
end;
$$;

create trigger rounds_credit_trigger
    after insert on public.rounds
    for each row
    execute procedure public.handle_round_credit();

-- Trigger to automatically create credit transaction when goal is achieved
create or replace function public.handle_goal_credit()
  returns trigger
  language plpgsql
  security definer
  as $$
  begin
    -- Only award credits when goal is first achieved
    if new.achieved_at is not null and old.achieved_at is null then
      perform public.create_credit_transaction(
        p_student_id := new.student_id,
        p_amount := new.points_on_achieve,
        p_transaction_type := 'goal_achievement',
        p_reference_id := new.id,
        p_reference_type := 'goal',
        p_description := 'Credits earned from achieving goal: ' || new.title
      );
  end if;
  return new;
end;
$$;

create trigger goals_credit_trigger
    after update on public.goals
    for each row
    execute procedure public.handle_goal_credit();

create trigger goals_set_updated_at
  before update on public.goals
  for each row execute procedure public.set_updated_at();
