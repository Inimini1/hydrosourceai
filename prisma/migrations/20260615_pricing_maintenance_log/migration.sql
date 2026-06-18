-- Migration: pricing_and_maintenance_log
-- Adds subscription plan fields and maintenance log treatment plan storage

-- ── ServiceLog: add treatmentPlan column ──────────────────────────────────────
ALTER TABLE "ServiceLog"
  ADD COLUMN IF NOT EXISTS "treatmentPlan" TEXT;

-- ── Subscription: add pricing plan fields ─────────────────────────────────────
ALTER TABLE "Subscription"
  ADD COLUMN IF NOT EXISTS "billingCycle"      TEXT,
  ADD COLUMN IF NOT EXISTS "trialEndsAt"       TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "poolLimit"         INTEGER NOT NULL DEFAULT 1;
