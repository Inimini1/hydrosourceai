import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { resolveSubscription } from '@/lib/subscription'

export async function GET(req: NextRequest) {
  const auth = await getAuthUser(req)
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sub = await resolveSubscription(auth.userId)

  const startOfMonth = new Date()
  startOfMonth.setDate(1); startOfMonth.setHours(0, 0, 0, 0)

  const [testsThisMonth, poolCount] = await Promise.all([
    prisma.waterTest.count({
      where: { pool: { userId: auth.userId }, createdAt: { gte: startOfMonth } },
    }),
    prisma.pool.count({ where: { userId: auth.userId } }),
  ])

  return NextResponse.json({
    testsThisMonth,
    analysisLimit:  sub.analysisLimit,     // -1 = unlimited
    poolCount,
    poolLimit:      sub.poolLimit,         // -1 = unlimited
    isPro:          sub.isActive && sub.planType !== 'FREE',
    isBeta:         sub.isBeta,
    isTrial:        sub.isTrial,
    planType:       sub.planType,
    betaExpiresAt:  null,                  // legacy field — keep for compat
    trialEndsAt:    sub.trialEndsAt?.toISOString() ?? null,
    features:       sub.features,
  })
}
