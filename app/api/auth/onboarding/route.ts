import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const auth = await getAuthUser(req)
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { experienceLevel, mainChallenge, testFrequency, primaryGoal } = await req.json()

    await prisma.user.update({
      where: { id: auth.userId },
      data: {
        experienceLevel: experienceLevel ?? null,
        mainChallenge: mainChallenge ?? null,
        testFrequency: testFrequency ?? null,
        primaryGoal: primaryGoal ?? null,
        onboardingComplete: true,
      },
    })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Server error.' }, { status: 500 })
  }
}
