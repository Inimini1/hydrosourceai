import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const auth = await getAuthUser(req)
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const poolId = req.nextUrl.searchParams.get('poolId')
  if (!poolId) return NextResponse.json({ error: 'poolId is required.' }, { status: 400 })

  const pool = await prisma.pool.findFirst({ where: { id: poolId, userId: auth.userId } })
  if (!pool) return NextResponse.json({ error: 'Pool not found.' }, { status: 404 })

  const logs = await prisma.serviceLog.findMany({
    where: { poolId },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ logs })
}

export async function POST(req: NextRequest) {
  const auth = await getAuthUser(req)
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { poolId, notes, chemicalsAdded, imageUrl } = await req.json()

    if (!poolId || !notes?.trim()) {
      return NextResponse.json({ error: 'Pool ID and notes are required.' }, { status: 400 })
    }

    const pool = await prisma.pool.findFirst({ where: { id: poolId, userId: auth.userId } })
    if (!pool) return NextResponse.json({ error: 'Pool not found.' }, { status: 404 })

    const log = await prisma.serviceLog.create({
      data: {
        poolId,
        notes: notes.trim(),
        chemicalsAdded: chemicalsAdded?.trim() || null,
        imageUrl: imageUrl?.trim() || null,
      },
    })

    return NextResponse.json({ log }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Server error.' }, { status: 500 })
  }
}
