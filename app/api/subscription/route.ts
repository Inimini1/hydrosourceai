import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { resolveSubscription } from '@/lib/subscription'
import { getPlanDefinition } from '@/lib/plans'

export async function GET(req: NextRequest) {
  const auth = await getAuthUser(req)
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sub = await resolveSubscription(auth.userId)
  const plan = getPlanDefinition(sub.planType)

  return NextResponse.json({
    planType:         sub.planType,
    planName:         plan.name,
    status:           sub.status,
    billingCycle:     sub.billingCycle,
    currentPeriodEnd: sub.currentPeriodEnd?.toISOString() ?? null,
    trialEndsAt:      sub.trialEndsAt?.toISOString() ?? null,
    cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
    poolLimit:        sub.poolLimit,
    analysisLimit:    sub.analysisLimit,
    isActive:         sub.isActive,
    isTrial:          sub.isTrial,
    isBeta:           sub.isBeta,
    features:         sub.features,
    price:            plan.price,
  })
}
