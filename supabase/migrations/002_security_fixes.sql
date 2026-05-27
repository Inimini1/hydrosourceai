-- ============================================================
-- Security Fix: Remove overly permissive beta_invites policy
-- Run in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- Step 1: See what policies currently exist on beta_invites
-- (Run this first to confirm the policy name in your live DB)
select policyname, cmd, qual
from pg_policies
where schemaname = 'public' and tablename = 'beta_invites';

-- Step 2: Drop the insecure anon select policy
-- Uses a DO block so it never errors even if the policy is missing
do $$
declare
  pol_name text;
begin
  for pol_name in
    select policyname
    from pg_policies
    where schemaname = 'public'
      and tablename  = 'beta_invites'
      and cmd        = 'SELECT'
      and qual       = 'true'
  loop
    execute format('drop policy %I on public.beta_invites', pol_name);
    raise notice 'Dropped policy: %', pol_name;
  end loop;
end;
$$;

-- Step 3: Verify no open select policy remains
select policyname, cmd, qual
from pg_policies
where schemaname = 'public' and tablename = 'beta_invites';
