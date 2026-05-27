import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const auth = await getAuthUser(req)
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const subscription = await prisma.subscription.findUnique({
    where: { userId: auth.userId },
    select: { planType: true, status: true, currentPeriodEnd: true },
  })

  return NextResponse.json({ subscription: subscription ?? { planType: 'FREE', status: 'active', currentPeriodEnd: null } })
}
