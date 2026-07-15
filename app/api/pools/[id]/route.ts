import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/supabase/types'

type PoolUpdate = Database['public']['Tables']['pools']['Update']

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: pool, error } = await supabase
    .from('pools')
    .select(`
      id, pool_name, gallons, chlorine_type, created_at, updated_at,
      water_tests(id, status, chlorine, ph, alkalinity, ai_analysis, created_at),
      service_logs(id)
    `)
    .eq('id', params.id)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false, foreignTable: 'water_tests' })
    .limit(1, { foreignTable: 'water_tests' })
    .single()

  if (error || !pool) return NextResponse.json({ error: 'Pool not found.' }, { status: 404 })

  type RawPool = typeof pool & {
    water_tests: { id: string; status: string; chlorine: number | null; ph: number | null; alkalinity: number | null; ai_analysis: string | null; created_at: string }[]
    service_logs: { id: string }[]
  }
  const p = pool as unknown as RawPool

  return NextResponse.json({
    pool: {
      id: p.id,
      poolName: p.pool_name,
      gallons: p.gallons,
      chlorineType: p.chlorine_type,
      createdAt: p.created_at,
      updatedAt: p.updated_at,
      waterTests: (p.water_tests ?? []).map((t) => ({
        id: t.id,
        status: t.status,
        chlorine: t.chlorine,
        pH: t.ph,
        alkalinity: t.alkalinity,
        aiAnalysis: t.ai_analysis,
        createdAt: t.created_at,
      })),
      _count: {
        waterTests: (p.water_tests ?? []).length,
        serviceLogs: (p.service_logs ?? []).length,
      },
    },
  })
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { poolName, chlorineType } = body
  const gallonsRaw = body.gallons

  const updates: PoolUpdate = {}

  if (poolName != null) {
    if (typeof poolName !== 'string' || !poolName.trim()) {
      return NextResponse.json({ error: 'Pool name must be a non-empty string.' }, { status: 400 })
    }
    updates.pool_name = poolName.trim()
  }

  if (gallonsRaw != null) {
    const gallons = Number(gallonsRaw)
    if (!Number.isInteger(gallons) || gallons < 1000 || gallons > 200000) {
      return NextResponse.json({ error: 'Pool size must be between 1,000 and 200,000 gallons.' }, { status: 400 })
    }
    updates.gallons = gallons
  }

  if (chlorineType != null) {
    const validTypes = ['CHLORINE', 'SALT', 'BROMINE']
    if (!validTypes.includes(chlorineType)) {
      return NextResponse.json({ error: 'Invalid chlorine type.' }, { status: 400 })
    }
    updates.chlorine_type = chlorineType
  }

  const { data: pool, error } = await supabase
    .from('pools')
    .update(updates)
    .eq('id', params.id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error || !pool) return NextResponse.json({ error: 'Pool not found.' }, { status: 404 })

  return NextResponse.json({
    pool: {
      id: pool.id,
      poolName: pool.pool_name,
      gallons: pool.gallons,
      chlorineType: pool.chlorine_type,
    },
  })
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { error } = await supabase
    .from('pools')
    .delete()
    .eq('id', params.id)
    .eq('user_id', user.id)

  if (error) return NextResponse.json({ error: 'Pool not found.' }, { status: 404 })

  return NextResponse.json({ message: 'Pool deleted.' })
}
