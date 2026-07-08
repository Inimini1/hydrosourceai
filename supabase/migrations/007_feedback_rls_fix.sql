-- ============================================================
-- HydroSource — Fix overly permissive feedback insert policy
-- Run in: Supabase Dashboard → SQL Editor
-- ============================================================
-- Previous "with check (true)" let anyone hitting the public REST API
-- with just the anon key insert a feedback row with an arbitrary
-- user_id, misattributing content to someone else's account.
-- The app's own /api/feedback route always writes via the admin
-- client (bypasses RLS), so this only tightens direct anon-key access.

drop policy if exists "feedback: anyone can insert" on public.feedback;

create policy "feedback: insert own or anonymous"
  on public.feedback for insert
  with check (
    user_id is null or auth.uid() = user_id
  );
