import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { canAccessMaintenanceLog } from '@/lib/subscription'

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
    const { poolId, notes, chemicalsAdded, imageUrl, treatmentPlan } = await req.json()

    if (!poolId || !notes?.trim()) {
      return NextResponse.json({ error: 'Pool ID and notes are required.' }, { status: 400 })
    }

    // If a treatmentPlan is being saved, gate behind maintenance log feature
    if (treatmentPlan != null) {
      const gate = await canAccessMaintenanceLog(auth.userId)
      if (!gate.allowed) {
        return NextResponse.json({ error: gate.reason, upgradeRequired: gate.upgradeRequired }, { status: 403 })
      }
    }

    const pool = await prisma.pool.findFirst({ where: { id: poolId, userId: auth.userId } })
    if (!pool) return NextResponse.json({ error: 'Pool not found.' }, { status: 404 })

    // Image URL safety validation
    let safeImageUrl: string | null = null
    if (imageUrl?.trim()) {
      try {
        const parsed = new URL(imageUrl.trim())
        if (parsed.protocol !== 'https:') throw new Error('only https allowed')
        const allowed = ['lh3.googleusercontent.com', 'avatars.githubusercontent.com']
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        if (supabaseUrl) allowed.push(new URL(supabaseUrl).hostname)
        if (!allowed.some((h) => parsed.hostname === h || parsed.hostname.endsWith(`.${h}`))) {
          return NextResponse.json({ error: 'Image URL domain not allowed.' }, { status: 400 })
        }
        safeImageUrl = parsed.toString()
      } catch {
        return NextResponse.json({ error: 'Invalid image URL.' }, { status: 400 })
      }
    }

    // Validate and serialize treatmentPlan
    let safeTreatmentPlan: string | null = null
    if (treatmentPlan != null) {
      try {
        // Ensure it's valid JSON and has the expected shape
        const parsed = typeof treatmentPlan === 'string' ? JSON.parse(treatmentPlan) : treatmentPlan
        if (!Array.isArray(parsed)) throw new Error('treatmentPlan must be an array')
        safeTreatmentPlan = JSON.stringify(parsed)
      } catch {
        return NextResponse.json({ error: 'Invalid treatmentPlan format.' }, { status: 400 })
      }
    }

    const log = await prisma.serviceLog.create({
      data: {
        poolId,
        notes: notes.trim(),
        chemicalsAdded: chemicalsAdded?.trim() || null,
        imageUrl: safeImageUrl,
        treatmentPlan: safeTreatmentPlan,
      },
    })

    return NextResponse.json({ log }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Server error.' }, { status: 500 })
  }
}
