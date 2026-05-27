import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const auth = await getAuthUser(req)
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = req.nextUrl
  const poolId = searchParams.get('poolId')
  const limitParam = searchParams.get('limit')
  const limit = limitParam ? Math.min(500, Math.max(1, parseInt(limitParam, 10))) : 90

  if (!poolId) return NextResponse.json({ error: 'poolId is required.' }, { status: 400 })

  const pool = await prisma.pool.findFirst({ where: { id: poolId, userId: auth.userId } })
  if (!pool) return NextResponse.json({ error: 'Pool not found.' }, { status: 404 })

  const tests = await prisma.waterTest.findMany({
    where: { poolId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  })

  const parsed = tests.map((t) => ({
    id: t.id,
    status: t.status,
    chlorine: t.chlorine,
    pH: t.pH,
    alkalinity: t.alkalinity,
    calciumHardness: t.calciumHardness ?? null,
    cyanuricAcid: t.cyanuricAcid ?? null,
    temperature: t.temperature ?? null,
    waterClarity: t.waterClarity ?? null,
    createdAt: t.createdAt.toISOString(),
    aiAnalysis: (() => { try { return JSON.parse(t.aiAnalysis) } catch { return null } })(),
  }))

  return NextResponse.json({ tests: parsed })
}
