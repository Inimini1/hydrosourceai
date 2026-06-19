-- ============================================================
-- HydroSource — Schema Update: subscriptions, service_logs, water_tests
-- Run in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- ── Update subscriptions table ────────────────────────────────

-- Drop old plan_type constraint (only allowed PRO_MONTHLY etc.)
alter table public.subscriptions
  drop constraint if exists subscriptions_plan_type_check;

-- Add missing columns (idempotent)
alter table public.subscriptions
  add column if not exists stripe_sub_id        text,
  add column if not exists billing_cycle         text,
  add column if not exists trial_ends_at         timestamptz,
  add column if not exists cancel_at_period_end  boolean default false,
  add column if not exists pool_limit            int     default 1;

-- Add new plan_type constraint with current plan names
alter table public.subscriptions
  add constraint subscriptions_plan_type_check
  check (plan_type in ('FREE','HOMEOWNER_PLUS','POOL_PRO','POOL_TEAM','ENTERPRISE'));

-- ── Update service_logs table ─────────────────────────────────

alter table public.service_logs
  add column if not exists treatment_plan text;  -- JSON: PrescriptionStep[] for maintenance checklists

-- ── Update water_tests table ─────────────────────────────────

alter table public.water_tests
  add column if not exists feedback_rating  int,
  add column if not exists feedback_note    text,
  add column if not exists feedback_at      timestamptz,
  add column if not exists total_chlorine   float,
  add column if not exists phosphates       float,
  add column if not exists salt_level       float;
