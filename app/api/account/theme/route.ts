import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: NextRequest) {
  const auth = await getAuthUser(req)
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { theme } = await req.json()
  if (theme !== 'light' && theme !== 'dark') {
    return NextResponse.json({ error: 'Invalid theme' }, { status: 400 })
  }

  await prisma.user.update({ where: { id: auth.userId }, data: { theme } })
  return NextResponse.json({ theme })
}
