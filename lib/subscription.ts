/**
 * lib/subscription.ts
 *
 * Server-side subscription helpers.
 * Encapsulates all plan-gating logic so that API routes never
 * need to hardcode plan names or pool limits.
 *
 * All functions accept a userId and query Prisma directly.
 * They are safe to call from any API route handler.
 */

import { prisma } from './prisma'
import { getPlanDefinition, getPoolLimit, getAnalysisLimit, type PlanType } from './plans'

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface ResolvedSubscription {
  planType: PlanType
  status: string
  billingCycle: string | null
  currentPeriodEnd: Date | null
  trialEndsAt: Date | null
  cancelAtPeriodEnd: boolean
  poolLimit: number         // -1 = unlimited
  analysisLimit: number     // -1 = unlimited
  isActive: boolean
  isTrial: boolean
  isBeta: boolean
  features: ReturnType<typeof getPlanDefinition>['features']
}

// ─────────────────────────────────────────────────────────────────────────────
// RESOLVE SUBSCRIPTION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Load the user's current effective subscription, resolving beta access
 * and trial periods into a single clean object.
 */
export async function resolveSubscription(userId: string): Promise<ResolvedSubscription> {
  const [user, subscription] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { betaExpiresAt: true, subscriptionStatus: true },
    }),
    prisma.subscription.findUnique({
      where: { userId },
      select: {
        planType: true,
        status: true,
        billingCycle: true,
        currentPeriodEnd: true,
        trialEndsAt: true,
        cancelAtPeriodEnd: true,
        poolLimit: true,
      },
    }),
  ])

  const now = new Date()
  const isBeta = user?.betaExpiresAt != null && user.betaExpiresAt > now
  const isTrial = subscription?.trialEndsAt != null && subscription.trialEndsAt > now

  // Beta users get full Pool Pro access
  const rawPlan = isBeta ? 'POOL_PRO' : (subscription?.planType ?? 'FREE')
  const planType = rawPlan as PlanType
  const plan = getPlanDefinition(planType)

  const isActive =
    isBeta ||
    isTrial ||
    subscription?.status === 'active' ||
    subscription?.status === 'trialing'

  // Pool limit: prefer DB row value (set by webhook), fall back to plan definition
  const dbPoolLimit = subscription?.poolLimit ?? 1
  const planPoolLimit = getPoolLimit(planType)
  const poolLimit = isBeta ? 50 : (planPoolLimit === -1 ? -1 : Math.max(dbPoolLimit, planPoolLimit))

  return {
    planType,
    status: subscription?.status ?? 'inactive',
    billingCycle: subscription?.billingCycle ?? null,
    currentPeriodEnd: subscription?.currentPeriodEnd ?? null,
    trialEndsAt: subscription?.trialEndsAt ?? null,
    cancelAtPeriodEnd: subscription?.cancelAtPeriodEnd ?? false,
    poolLimit,
    analysisLimit: getAnalysisLimit(planType),
    isActive,
    isTrial,
    isBeta,
    features: plan.features,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// FEATURE GATE FUNCTIONS
// All return { allowed: boolean, reason?: string }
// ─────────────────────────────────────────────────────────────────────────────

export interface GateResult {
  allowed: boolean
  reason?: string
  upgradeRequired?: PlanType
}

/** Check if the user can add another pool */
export async function canAddPool(userId: string): Promise<GateResult> {
  const sub = await resolveSubscription(userId)
  if (!sub.isActive && sub.planType !== 'FREE') {
    return { allowed: false, reason: 'Your subscription is inactive.', upgradeRequired: 'POOL_PRO' }
  }

  const limit = sub.poolLimit
  if (limit === -1) return { allowed: true }

  const poolCount = await prisma.pool.count({ where: { userId } })
  if (poolCount >= limit) {
    const nextPlan: PlanType = sub.planType === 'FREE' || sub.planType === 'HOMEOWNER_PLUS'
      ? 'POOL_PRO'
      : 'POOL_TEAM'
    return {
      allowed: false,
      reason: `You've reached the ${limit}-pool limit on your ${sub.planType} plan.`,
      upgradeRequired: nextPlan,
    }
  }

  return { allowed: true }
}

/** Check if the user can run another water analysis this month */
export async function canRunAnalysis(userId: string): Promise<GateResult> {
  const sub = await resolveSubscription(userId)
  if (sub.analysisLimit === -1) return { allowed: true }

  const startOfMonth = new Date()
  startOfMonth.setDate(1); startOfMonth.setHours(0, 0, 0, 0)

  const count = await prisma.waterTest.count({
    where: { pool: { userId }, createdAt: { gte: startOfMonth } },
  })

  if (count >= sub.analysisLimit) {
    return {
      allowed: false,
      reason: `You've used ${count} of ${sub.analysisLimit} analyses this month.`,
      upgradeRequired: 'HOMEOWNER_PLUS',
    }
  }

  return { allowed: true }
}

/** Check if the user has access to the maintenance log feature */
export async function canAccessMaintenanceLog(userId: string): Promise<GateResult> {
  const sub = await resolveSubscription(userId)
  if (sub.features.maintenanceLog) return { allowed: true }
  return {
    allowed: false,
    reason: 'Maintenance log is available on Pool Pro and Pool Team plans.',
    upgradeRequired: 'POOL_PRO',
  }
}

/** Check if the user can send PDF email reports */
export async function canSendEmailReports(userId: string): Promise<GateResult> {
  const sub = await resolveSubscription(userId)
  if (sub.features.emailReports) return { allowed: true }
  return {
    allowed: false,
    reason: 'Email report delivery is available on Pool Pro and above.',
    upgradeRequired: 'POOL_PRO',
  }
}
