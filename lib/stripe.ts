/**
 * lib/stripe.ts
 *
 * Stripe client singleton and plan-to-priceId mappings.
 * All Stripe price IDs are loaded from environment variables so they
 * can be rotated without a code deploy.
 *
 * Environment variables required (.env.local):
 *   STRIPE_SECRET_KEY
 *   STRIPE_WEBHOOK_SECRET
 *   STRIPE_HOMEOWNER_PLUS_MONTHLY_PRICE_ID
 *   STRIPE_HOMEOWNER_PLUS_ANNUAL_PRICE_ID
 *   STRIPE_POOL_PRO_MONTHLY_PRICE_ID
 *   STRIPE_POOL_PRO_ANNUAL_PRICE_ID
 *   STRIPE_POOL_TEAM_MONTHLY_PRICE_ID
 *   STRIPE_POOL_TEAM_ANNUAL_PRICE_ID
 */

import Stripe from 'stripe'
import type { PlanType, BillingCycle } from './plans'

const stripeKey = process.env.STRIPE_SECRET_KEY
if (!stripeKey) {
  throw new Error('STRIPE_SECRET_KEY environment variable is not set')
}

export const stripe = new Stripe(stripeKey, {
  apiVersion: '2025-02-24.acacia',
  typescript: true,
})

// ─────────────────────────────────────────────────────────────────────────────
// PRICE ID MAP
// Keys: planType:billingCycle  →  Stripe Price ID
// ─────────────────────────────────────────────────────────────────────────────

export const STRIPE_PRICE_IDS: Partial<Record<`${PlanType}:${BillingCycle}`, string>> = {
  'HOMEOWNER_PLUS:monthly': process.env.STRIPE_HOMEOWNER_PLUS_MONTHLY_PRICE_ID ?? '',
  'HOMEOWNER_PLUS:annual':  process.env.STRIPE_HOMEOWNER_PLUS_ANNUAL_PRICE_ID  ?? '',
  'POOL_PRO:monthly':       process.env.STRIPE_POOL_PRO_MONTHLY_PRICE_ID       ?? '',
  'POOL_PRO:annual':        process.env.STRIPE_POOL_PRO_ANNUAL_PRICE_ID        ?? '',
  'POOL_TEAM:monthly':      process.env.STRIPE_POOL_TEAM_MONTHLY_PRICE_ID      ?? '',
  'POOL_TEAM:annual':       process.env.STRIPE_POOL_TEAM_ANNUAL_PRICE_ID       ?? '',
}

/** Resolve a Stripe Price ID from planType + billingCycle. Returns '' if not configured. */
export function getPriceId(planType: PlanType, billingCycle: BillingCycle): string {
  return STRIPE_PRICE_IDS[`${planType}:${billingCycle}`] ?? ''
}

/**
 * Reverse-lookup: given a Stripe Price ID, return the plan type.
 * Used in webhook handlers to determine what was purchased.
 */
export function getPlanTypeFromPriceId(priceId: string): PlanType {
  for (const [key, id] of Object.entries(STRIPE_PRICE_IDS)) {
    if (id === priceId) {
      return key.split(':')[0] as PlanType
    }
  }
  return 'FREE'
}

/**
 * Reverse-lookup: given a Stripe Price ID, return the billing cycle.
 */
export function getBillingCycleFromPriceId(priceId: string): BillingCycle {
  for (const [key, id] of Object.entries(STRIPE_PRICE_IDS)) {
    if (id === priceId) {
      return key.split(':')[1] as BillingCycle
    }
  }
  return 'monthly'
}

/**
 * Pool limits per plan type — used in webhook to set poolLimit on Subscription row.
 */
export const PLAN_POOL_LIMITS: Record<PlanType, number> = {
  FREE:            1,
  HOMEOWNER_PLUS:  1,
  POOL_PRO:       50,
  POOL_TEAM:     250,
  ENTERPRISE:  99999, // effectively unlimited
}
