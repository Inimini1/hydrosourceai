import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { resolveSubscription } from '@/lib/subscription'

export async function GET(_req: NextRequest) {
  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sub = await resolveSubscription(user.id)
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const { data: pools } = await supabase
    .from('pools')
    .select('id')
    .eq('user_id', user.id)

  const poolIds = (pools ?? []).map((p) => p.id)
  const poolCount = poolIds.length

  let testsThisMonth = 0
  if (poolIds.length > 0) {
    const { count } = await supabase
      .from('water_tests')
      .select('id', { count: 'exact', head: true })
      .in('pool_id', poolIds)
      .gte('created_at', startOfMonth.toISOString())
    testsThisMonth = count ?? 0
  }

  return NextResponse.json({
    testsThisMonth,
    limit: sub.analysisLimit === -1 ? null : sub.analysisLimit,
    analysisLimit: sub.analysisLimit,
    poolCount,
    poolLimit: sub.poolLimit,
    isPro: sub.isActive && sub.planType !== 'FREE',
    isBeta: sub.isBeta,
    isTrial: sub.isTrial,
    planType: sub.planType,
    betaExpiresAt: null,
    trialEndsAt: sub.trialEndsAt?.toISOString() ?? null,
    features: sub.features,
  })
}
