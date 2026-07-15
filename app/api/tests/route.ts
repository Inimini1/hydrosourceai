import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = req.nextUrl
  const poolId = searchParams.get('poolId')
  const limitParam = searchParams.get('limit')
  const limit = limitParam ? Math.min(500, Math.max(1, parseInt(limitParam, 10))) : 90

  if (!poolId) return NextResponse.json({ error: 'poolId is required.' }, { status: 400 })

  // RLS ensures pool belongs to this user
  const { data: pool, error: poolError } = await supabase
    .from('pools')
    .select('id')
    .eq('id', poolId)
    .eq('user_id', user.id)
    .single()

  if (poolError || !pool) return NextResponse.json({ error: 'Pool not found.' }, { status: 404 })

  const { data: tests, error } = await supabase
    .from('water_tests')
    .select('id, status, chlorine, ph, alkalinity, calcium_hardness, cyanuric_acid, temperature, water_clarity, ai_analysis, created_at')
    .eq('pool_id', poolId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('[GET /api/tests] query failed:', error.message)
    return NextResponse.json({ error: 'Failed to load water tests.' }, { status: 500 })
  }

  const parsed = (tests ?? []).map((t) => ({
    id: t.id,
    status: t.status,
    chlorine: t.chlorine,
    pH: t.ph,
    alkalinity: t.alkalinity,
    calciumHardness: t.calcium_hardness ?? null,
    cyanuricAcid: t.cyanuric_acid ?? null,
    temperature: t.temperature ?? null,
    waterClarity: t.water_clarity ?? null,
    createdAt: t.created_at,
    aiAnalysis: t.ai_analysis ?? '{}',
  }))

  return NextResponse.json({ tests: parsed })
}
