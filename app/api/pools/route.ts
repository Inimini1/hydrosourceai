import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { canAddPool } from '@/lib/subscription'

export async function GET(req: NextRequest) {
  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const withTrend = req.nextUrl.searchParams.get('trend') === 'true'
  const testLimit = withTrend ? 7 : 1

  // RLS ensures only this user's pools are returned
  const { data: pools, error } = await supabase
    .from('pools')
    .select(`
      id, pool_name, gallons, chlorine_type, created_at, updated_at,
      water_tests(id, status, chlorine, ph, alkalinity, ai_analysis, created_at),
      service_logs(id)
    `)
    .order('created_at', { ascending: false })
    .order('created_at', { ascending: false, foreignTable: 'water_tests' })
    .limit(testLimit, { foreignTable: 'water_tests' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  type RawPool = {
    id: string; pool_name: string; gallons: number; chlorine_type: string
    created_at: string; updated_at: string
    water_tests:  { id: string; status: string; chlorine: number | null; ph: number | null; alkalinity: number | null; ai_analysis: string | null; created_at: string }[]
    service_logs: { id: string }[]
  }

  // Map to camelCase for the existing frontend
  const mapped = ((pools ?? []) as unknown as RawPool[]).map((p) => ({
    id:           p.id,
    poolName:     p.pool_name,
    gallons:      p.gallons,
    chlorineType: p.chlorine_type,
    createdAt:    p.created_at,
    updatedAt:    p.updated_at,
    waterTests:   (p.water_tests ?? []).map((t) => ({
      id:         t.id,
      status:     t.status,
      chlorine:   t.chlorine,
      pH:         t.ph,
      alkalinity: t.alkalinity,
      aiAnalysis: t.ai_analysis,
      createdAt:  t.created_at,
    })),
    _count: {
      waterTests:  (p.water_tests ?? []).length,
      serviceLogs: (p.service_logs ?? []).length,
    },
  }))

  return NextResponse.json({ pools: mapped })
}

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { poolName, gallons, chlorineType = 'CHLORINE' } = await req.json()

    if (!poolName?.trim()) {
      return NextResponse.json({ error: 'Pool name is required.' }, { status: 400 })
    }
    if (!gallons || gallons < 1000 || gallons > 200000) {
      return NextResponse.json({ error: 'Pool size must be between 1,000 and 200,000 gallons.' }, { status: 400 })
    }

    const gate = await canAddPool(user.id)
    if (!gate.allowed) {
      return NextResponse.json(
        { error: gate.reason ?? 'Pool limit reached.', upgradeRequired: gate.upgradeRequired },
        { status: 403 }
      )
    }

    const { data: pool, error } = await supabase
      .from('pools')
      .insert({ user_id: user.id, pool_name: poolName.trim(), gallons: parseInt(gallons), chlorine_type: chlorineType })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({
      pool: { id: pool.id, poolName: pool.pool_name, gallons: pool.gallons, chlorineType: pool.chlorine_type },
    }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Server error.' }, { status: 500 })
  }
}
