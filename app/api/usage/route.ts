import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const auth = await getAuthUser(req)
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({
    where: { id: auth.userId },
    select: { subscriptionStatus: true, betaExpiresAt: true },
  })
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const now = new Date()
  const isBeta = user.betaExpiresAt != null && user.betaExpiresAt > now
  const isPro  = user.subscriptionStatus === 'PRO' || isBeta

  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const testsThisMonth = await prisma.waterTest.count({
    where: {
      pool: { userId: auth.userId },
      createdAt: { gte: startOfMonth },
    },
  })

  return NextResponse.json({
    testsThisMonth,
    limit: isPro ? null : 5,
    isPro,
    isBeta,
    betaExpiresAt: user.betaExpiresAt?.toISOString() ?? null,
  })
}
