-- ============================================================
-- SmartPool AI — Supabase Schema + RLS
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- ── Extensions ───────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ── Profiles ─────────────────────────────────────────────────
-- Extends auth.users — auto-created by trigger on signup.
create table public.profiles (
  id                  uuid        references auth.users(id) on delete cascade primary key,
  email               text        not null,
  display_name        text,
  avatar_color        text        default '#006FFF',
  role                text        default 'OWNER'   check (role in ('OWNER','PROFESSIONAL','ADMIN')),
  onboarding_complete boolean     default false,
  experience_level    text,
  primary_goal        text,
  test_frequency      text,
  main_challenge      text,
  user_type           text,
  num_pools           text,
  pool_purpose        text,
  beta_expires_at     timestamptz,
  created_at          timestamptz default now(),
  updated_at          timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "profiles: owner select"
  on public.profiles for select using (auth.uid() = id);

create policy "profiles: owner update"
  on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

create policy "profiles: owner insert"
  on public.profiles for insert with check (auth.uid() = id);

-- Auto-create profile on new auth signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Auto-create subscription on new profile
create or replace function public.handle_new_profile()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.subscriptions (user_id, plan_type, status)
  values (new.id, 'FREE', 'active')
  on conflict (user_id) do nothing;
  return new;
end;
$$;

create or replace trigger on_profile_created
  after insert on public.profiles
  for each row execute procedure public.handle_new_profile();

-- ── Pools ─────────────────────────────────────────────────────
create table public.pools (
  id           uuid        default gen_random_uuid() primary key,
  user_id      uuid        references auth.users(id) on delete cascade not null,
  pool_name    text        not null,
  gallons      integer     not null check (gallons between 1000 and 200000),
  chlorine_type text       default 'CHLORINE',
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

alter table public.pools enable row level security;

create policy "pools: owner all"
  on public.pools for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index pools_user_id_idx on public.pools(user_id);

-- ── Water Tests ───────────────────────────────────────────────
create table public.water_tests (
  id               uuid        default gen_random_uuid() primary key,
  pool_id          uuid        references public.pools(id) on delete cascade not null,
  chlorine         float       not null,
  ph               float       not null,
  alkalinity       float       not null,
  calcium_hardness float,
  cyanuric_acid    float,
  temperature      float,
  water_clarity    text,
  odor             text,
  symptoms         text,
  image_url        text,
  status           text        not null check (status in ('safe','caution','critical')),
  ai_analysis      text        not null default '{}',
  created_at       timestamptz default now()
);

alter table public.water_tests enable row level security;

-- Access via pool ownership (no direct user_id on water_tests)
create policy "water_tests: owner all"
  on public.water_tests for all
  using (
    exists (
      select 1 from public.pools
      where pools.id = water_tests.pool_id
        and pools.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.pools
      where pools.id = water_tests.pool_id
        and pools.user_id = auth.uid()
    )
  );

create index water_tests_pool_id_idx  on public.water_tests(pool_id);
create index water_tests_created_idx  on public.water_tests(created_at desc);

-- ── Service Logs ──────────────────────────────────────────────
create table public.service_logs (
  id               uuid        default gen_random_uuid() primary key,
  pool_id          uuid        references public.pools(id) on delete cascade not null,
  notes            text        not null,
  chemicals_added  text,
  image_url        text,
  created_at       timestamptz default now()
);

alter table public.service_logs enable row level security;

create policy "service_logs: owner all"
  on public.service_logs for all
  using (
    exists (
      select 1 from public.pools
      where pools.id = service_logs.pool_id
        and pools.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.pools
      where pools.id = service_logs.pool_id
        and pools.user_id = auth.uid()
    )
  );

create index service_logs_pool_id_idx on public.service_logs(pool_id);

-- ── Subscriptions ─────────────────────────────────────────────
create table public.subscriptions (
  id                uuid        default gen_random_uuid() primary key,
  user_id           uuid        references auth.users(id) on delete cascade not null unique,
  stripe_customer_id text,
  stripe_price_id   text,
  stripe_sub_id     text,
  plan_type         text        default 'FREE' check (plan_type in ('FREE','PRO_MONTHLY','PRO_YEARLY')),
  status            text        default 'active',
  current_period_end timestamptz,
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);

alter table public.subscriptions enable row level security;

create policy "subscriptions: owner select"
  on public.subscriptions for select
  using (auth.uid() = user_id);

-- Stripe webhook (service role) manages inserts/updates — enforced by using admin client
create policy "subscriptions: service role all"
  on public.subscriptions for all
  using (auth.jwt() ->> 'role' = 'service_role')
  with check (auth.jwt() ->> 'role' = 'service_role');

-- ── Notifications ─────────────────────────────────────────────
create table public.notifications (
  id         uuid        default gen_random_uuid() primary key,
  user_id    uuid        references auth.users(id) on delete cascade not null,
  type       text        not null,
  title      text        not null,
  message    text        not null,
  read       boolean     default false,
  created_at timestamptz default now()
);

alter table public.notifications enable row level security;

create policy "notifications: owner all"
  on public.notifications for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index notifications_user_id_idx on public.notifications(user_id);
create index notifications_unread_idx  on public.notifications(user_id, read) where read = false;

-- ── Beta Invites ──────────────────────────────────────────────
create table public.beta_invites (
  id         uuid        default gen_random_uuid() primary key,
  email      text        not null unique,
  name       text        not null,
  company    text,
  token      text        not null unique,
  expires_at timestamptz not null,
  used_at    timestamptz,
  created_at timestamptz default now()
);

alter table public.beta_invites enable row level security;

-- Only service role may touch beta_invites
create policy "beta_invites: service role all"
  on public.beta_invites for all
  using (auth.jwt() ->> 'role' = 'service_role')
  with check (auth.jwt() ->> 'role' = 'service_role');

-- Token validation is done server-side via admin client (bypasses RLS).
-- No anon select policy — all public access is blocked.

-- ── Rate Limits ───────────────────────────────────────────────
create table public.rate_limits (
  key      text        primary key,
  count    integer     default 1,
  reset_at timestamptz not null
);

alter table public.rate_limits enable row level security;

create policy "rate_limits: service role all"
  on public.rate_limits for all
  using (auth.jwt() ->> 'role' = 'service_role')
  with check (auth.jwt() ->> 'role' = 'service_role');

-- ── updated_at triggers ───────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at     before update on public.profiles     for each row execute procedure public.set_updated_at();
create trigger pools_updated_at        before update on public.pools        for each row execute procedure public.set_updated_at();
create trigger subscriptions_updated_at before update on public.subscriptions for each row execute procedure public.set_updated_at();

-- ── Realtime ─────────────────────────────────────────────────
-- Enable realtime for notifications so mobile app gets live updates
alter publication supabase_realtime add table public.notifications;
alter publication supabase_realtime add table public.water_tests;
