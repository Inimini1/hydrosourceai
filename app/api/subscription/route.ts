import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { resolveSubscription } from '@/lib/subscription'
import { getPlanDefinition } from '@/lib/plans'

export async function GET() {
  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sub = await resolveSubscription(user.id)
  const plan = getPlanDefinition(sub.planType)

  return NextResponse.json({
    planType:          sub.planType,
    planName:          plan.name,
    status:            sub.status,
    billingCycle:      sub.billingCycle,
    currentPeriodEnd:  sub.currentPeriodEnd?.toISOString() ?? null,
    trialEndsAt:       sub.trialEndsAt?.toISOString() ?? null,
    cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
    poolLimit:         sub.poolLimit,
    analysisLimit:     sub.analysisLimit,
    isActive:          sub.isActive,
    isTrial:           sub.isTrial,
    isBeta:            sub.isBeta,
    features:          sub.features,
    price:             plan.price,
  })
}
