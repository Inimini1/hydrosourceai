-- ============================================================
-- SmartPool AI — Security Hardening Migration
-- Run in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- ── Atomic rate-limit increment ───────────────────────────────
-- Replaces the read-then-write TOCTOU pattern in rateLimit.ts.
-- A single atomic upsert prevents concurrent requests from both
-- slipping through at the limit boundary.

create or replace function public.increment_rate_limit(
  p_key      text,
  p_limit    int,
  p_window_ms bigint
)
returns table(allowed boolean, remaining int, retry_after_ms bigint)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_now       timestamptz := now();
  v_reset     timestamptz;
  v_count     int;
  v_window    interval    := (p_window_ms / 1000.0) * interval '1 second';
begin
  insert into public.rate_limits (key, count, reset_at)
  values (p_key, 1, v_now + v_window)
  on conflict (key) do update
    set count    = case
                     when rate_limits.reset_at < v_now then 1
                     else rate_limits.count + 1
                   end,
        reset_at = case
                     when rate_limits.reset_at < v_now then v_now + v_window
                     else rate_limits.reset_at
                   end
  returning rate_limits.count, rate_limits.reset_at
  into v_count, v_reset;

  if v_count <= p_limit then
    return query select true, (p_limit - v_count)::int, 0::bigint;
  else
    return query select false, 0::int,
      (extract(epoch from (v_reset - v_now)) * 1000)::bigint;
  end if;
end;
$$;

-- Allow service-role calls (admin client uses this)
revoke all on function public.increment_rate_limit(text, int, bigint) from public;
grant execute on function public.increment_rate_limit(text, int, bigint) to service_role;


-- ── Stripe processed events (idempotency) ────────────────────
-- Prevents replayed Stripe webhooks from triggering double-updates.

create table if not exists public.stripe_processed_events (
  event_id   text        primary key,
  processed_at timestamptz default now()
);

alter table public.stripe_processed_events enable row level security;

create policy "stripe_events: service role all"
  on public.stripe_processed_events for all
  using (auth.jwt() ->> 'role' = 'service_role')
  with check (auth.jwt() ->> 'role' = 'service_role');

-- Auto-purge events older than 30 days to keep the table small
create or replace function public.purge_old_stripe_events()
returns void
language sql
security definer
set search_path = public
as $$
  delete from public.stripe_processed_events
  where processed_at < now() - interval '30 days';
$$;
