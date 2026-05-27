import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await getAuthUser(req)
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const log = await prisma.serviceLog.findFirst({
    where: { id: params.id, pool: { userId: auth.userId } },
  })
  if (!log) return NextResponse.json({ error: 'Log not found.' }, { status: 404 })

  await prisma.serviceLog.delete({ where: { id: params.id } })

  return NextResponse.json({ message: 'Deleted.' })
}
