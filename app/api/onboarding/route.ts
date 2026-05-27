import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const auth = await getAuthUser(req)
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { userType, numPools, primaryGoal, experienceLevel, testFrequency, mainChallenge, poolPurpose } = body

  const data: Record<string, string | boolean> = {
    onboardingComplete: true,
  }

  if (typeof userType === 'string') data.userType = userType.slice(0, 50)
  if (typeof numPools === 'string') data.numPools = numPools.slice(0, 20)
  if (typeof primaryGoal === 'string') data.primaryGoal = primaryGoal.slice(0, 100)
  if (typeof experienceLevel === 'string') data.experienceLevel = experienceLevel.slice(0, 50)
  if (typeof testFrequency === 'string') data.testFrequency = testFrequency.slice(0, 50)
  if (typeof mainChallenge === 'string') data.mainChallenge = mainChallenge.slice(0, 200)
  if (typeof poolPurpose === 'string') data.poolPurpose = poolPurpose.slice(0, 100)

  await prisma.user.update({ where: { id: auth.userId }, data })

  return NextResponse.json({ success: true })
}
