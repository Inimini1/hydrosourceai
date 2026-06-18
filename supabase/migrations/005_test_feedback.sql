-- ============================================================
-- HydroSource — Analysis Feedback + Pattern Tracking
-- Run in: Supabase Dashboard → SQL Editor
-- ============================================================

-- Add feedback columns to water_tests
alter table public.water_tests
  add column if not exists feedback_rating  text        check (feedback_rating in ('helpful','not_helpful')),
  add column if not exists feedback_note    text,
  add column if not exists feedback_at      timestamptz;

-- Index for founder dashboard queries (which tests got negative feedback)
create index if not exists water_tests_feedback_idx
  on public.water_tests (feedback_rating)
  where feedback_rating is not null;
