import { createAdminClient } from './supabase/admin'
import { createClient } from './supabase/server'
import { getPlanDefinition, getPoolLimit, getAnalysisLimit, type PlanType } from './plans'

export interface ResolvedSubscription {
  planType: PlanType
  status: string
  billingCycle: string | null
  currentPeriodEnd: Date | null
  trialEndsAt: Date | null
  cancelAtPeriodEnd: boolean
  poolLimit: number
  analysisLimit: number
  isActive: boolean
  isTrial: boolean
  isBeta: boolean
  features: ReturnType<typeof getPlanDefinition>['features']
}

type SubRow = {
  plan_type: string | null
  status: string | null
  billing_cycle: string | null
  current_period_end: string | null
  trial_ends_at: string | null
  cancel_at_period_end: boolean | null
  pool_limit: number | null
}

type SubQuery = {
  select: (cols: string) => {
    eq: (col: string, val: string) => {
      maybeSingle: () => Promise<{ data: SubRow | null; error: unknown }>
    }
  }
}

export async function resolveSubscription(userId: string): Promise<ResolvedSubscription> {
  // BETA_MODE=true in env → all users get full Pro access, no payment required.
  // Remove this env var when beta ends to re-enable Stripe gating.
  if (process.env.BETA_MODE === 'true') {
    return {
      planType: 'POOL_PRO',
      status: 'active',
      billingCycle: null,
      currentPeriodEnd: null,
      trialEndsAt: null,
      cancelAtPeriodEnd: false,
      poolLimit: 50,
      analysisLimit: -1,
      isActive: true,
      isTrial: false,
      isBeta: true,
      features: getPlanDefinition('POOL_PRO').features,
    }
  }

  const admin = createAdminClient()
  const now = new Date()

  const [profileResult, subResult] = await Promise.all([
    admin.from('profiles').select('beta_expires_at').eq('id', userId).single(),
    (admin.from('subscriptions') as unknown as SubQuery).select(
      'plan_type, status, billing_cycle, current_period_end, trial_ends_at, cancel_at_period_end, pool_limit'
    ).eq('user_id', userId).maybeSingle(),
  ])

  const profile = profileResult.data
  const sub = subResult.data

  const isBeta = profile?.beta_expires_at != null && new Date(profile.beta_expires_at) > now
  const isTrial = sub?.trial_ends_at != null && new Date(sub.trial_ends_at) > now

  const rawPlan = isBeta ? 'POOL_PRO' : ((sub?.plan_type ?? 'FREE') as PlanType)
  const plan = getPlanDefinition(rawPlan)

  const isActive =
    isBeta ||
    isTrial ||
    sub?.status === 'active' ||
    sub?.status === 'trialing' ||
    sub?.status === 'past_due' // grace period — access holds until Stripe cancels/marks unpaid

  const dbPoolLimit = sub?.pool_limit ?? 1
  const planPoolLimit = getPoolLimit(rawPlan)
  const poolLimit = isBeta ? 50 : (planPoolLimit === -1 ? -1 : Math.max(dbPoolLimit, planPoolLimit))

  return {
    planType: rawPlan,
    status: sub?.status ?? 'inactive',
    billingCycle: sub?.billing_cycle ?? null,
    currentPeriodEnd: sub?.current_period_end ? new Date(sub.current_period_end) : null,
    trialEndsAt: sub?.trial_ends_at ? new Date(sub.trial_ends_at) : null,
    cancelAtPeriodEnd: sub?.cancel_at_period_end ?? false,
    poolLimit,
    analysisLimit: getAnalysisLimit(rawPlan),
    isActive,
    isTrial,
    isBeta,
    features: plan.features,
  }
}

export interface GateResult {
  allowed: boolean
  reason?: string
  upgradeRequired?: PlanType
}

export async function canAddPool(userId: string): Promise<GateResult> {
  const sub = await resolveSubscription(userId)
  if (!sub.isActive && sub.planType !== 'FREE') {
    return { allowed: false, reason: 'Your subscription is inactive.', upgradeRequired: 'POOL_PRO' }
  }

  const limit = sub.poolLimit
  if (limit === -1) return { allowed: true }

  const supabase = createClient()
  const { count } = await supabase.from('pools').select('id', { count: 'exact', head: true }).eq('user_id', userId)
  const poolCount = count ?? 0

  if (poolCount >= limit) {
    const nextPlan: PlanType = sub.planType === 'FREE' || sub.planType === 'HOMEOWNER_PLUS'
      ? 'POOL_PRO' : 'POOL_TEAM'
    return {
      allowed: false,
      reason: `You've reached the ${limit}-pool limit on your ${sub.planType} plan.`,
      upgradeRequired: nextPlan,
    }
  }

  return { allowed: true }
}

export async function canRunAnalysis(userId: string): Promise<GateResult> {
  const sub = await resolveSubscription(userId)
  if (sub.analysisLimit === -1) return { allowed: true }

  const startOfMonth = new Date()
  startOfMonth.setDate(1); startOfMonth.setHours(0, 0, 0, 0)

  const supabase = createClient()
  const { count, error } = await supabase
    .from('water_tests')
    .select('id, pools!inner(user_id)', { count: 'exact', head: true })
    .eq('pools.user_id', userId)
    .gte('created_at', startOfMonth.toISOString())

  if (error) {
    console.error('[canRunAnalysis] usage count query failed:', error.message)
    return {
      allowed: false,
      reason: 'Unable to verify your analysis usage right now. Please try again.',
      upgradeRequired: 'HOMEOWNER_PLUS',
    }
  }

  const tested = count ?? 0
  if (tested >= sub.analysisLimit) {
    return {
      allowed: false,
      reason: `You've used ${tested} of ${sub.analysisLimit} analyses this month.`,
      upgradeRequired: 'HOMEOWNER_PLUS',
    }
  }

  return { allowed: true }
}

export async function canAccessMaintenanceLog(userId: string): Promise<GateResult> {
  const sub = await resolveSubscription(userId)
  if (sub.features.maintenanceLog) return { allowed: true }
  return {
    allowed: false,
    reason: 'Maintenance log is available on Pool Pro and Pool Team plans.',
    upgradeRequired: 'POOL_PRO',
  }
}

export async function canSendEmailReports(userId: string): Promise<GateResult> {
  const sub = await resolveSubscription(userId)
  if (sub.features.emailReports) return { allowed: true }
  return {
    allowed: false,
    reason: 'Email report delivery is available on Pool Pro and above.',
    upgradeRequired: 'POOL_PRO',
  }
}
