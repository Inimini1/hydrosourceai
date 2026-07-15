import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { canAccessMaintenanceLog } from '@/lib/subscription'

export async function GET(req: NextRequest) {
  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const poolId = req.nextUrl.searchParams.get('poolId')
  if (!poolId) return NextResponse.json({ error: 'poolId is required.' }, { status: 400 })

  // RLS: only pools owned by this user are accessible
  const { data: pool, error: poolError } = await supabase
    .from('pools').select('id').eq('id', poolId).eq('user_id', user.id).single()
  if (poolError || !pool) return NextResponse.json({ error: 'Pool not found.' }, { status: 404 })

  const { data: logsRaw, error } = await supabase
    .from('service_logs')
    .select('id, pool_id, notes, chemicals_added, image_url, created_at')
    .eq('pool_id', poolId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[GET /api/service-logs] query failed:', error.message)
    return NextResponse.json({ error: 'Failed to load service logs.' }, { status: 500 })
  }

  // treatment_plan column added in migration 006 — cast to access it
  type LogRow = typeof logsRaw extends (infer T)[] | null ? T & { treatment_plan?: string | null } : never
  const logs = logsRaw as LogRow[] | null

  return NextResponse.json({ logs: (logs ?? []).map((l) => ({
    id: l.id,
    poolId: l.pool_id,
    notes: l.notes,
    chemicalsAdded: l.chemicals_added,
    imageUrl: l.image_url,
    treatmentPlan: l.treatment_plan ?? null,
    createdAt: l.created_at,
  })) })
}

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { poolId, notes, chemicalsAdded, imageUrl, treatmentPlan } = await req.json()

    if (!poolId || !notes?.trim()) {
      return NextResponse.json({ error: 'Pool ID and notes are required.' }, { status: 400 })
    }

    if (treatmentPlan != null) {
      const gate = await canAccessMaintenanceLog(user.id)
      if (!gate.allowed) {
        return NextResponse.json({ error: gate.reason, upgradeRequired: gate.upgradeRequired }, { status: 403 })
      }
    }

    const { data: pool, error: poolError } = await supabase
      .from('pools').select('id').eq('id', poolId).eq('user_id', user.id).single()
    if (poolError || !pool) return NextResponse.json({ error: 'Pool not found.' }, { status: 404 })

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

    let safeTreatmentPlan: string | null = null
    if (treatmentPlan != null) {
      try {
        const parsed = typeof treatmentPlan === 'string' ? JSON.parse(treatmentPlan) : treatmentPlan
        if (!Array.isArray(parsed)) throw new Error('treatmentPlan must be an array')
        safeTreatmentPlan = JSON.stringify(parsed)
      } catch {
        return NextResponse.json({ error: 'Invalid treatmentPlan format.' }, { status: 400 })
      }
    }

    // treatment_plan col added in migration 006 — cast bypasses stale generated types
    const { data: log, error } = await (supabase.from('service_logs') as unknown as {
      insert: (d: Record<string, unknown>) => { select: () => { single: () => Promise<{ data: Record<string, unknown> | null; error: { message: string } | null }> } }
    }).insert({
      pool_id: poolId,
      notes: notes.trim(),
      chemicals_added: chemicalsAdded?.trim() || null,
      image_url: safeImageUrl,
      treatment_plan: safeTreatmentPlan,
    }).select().single()

    if (error) {
      console.error('[POST /api/service-logs] insert failed:', error.message)
      return NextResponse.json({ error: 'Failed to save service log.' }, { status: 500 })
    }

    return NextResponse.json({ log }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Server error.' }, { status: 500 })
  }
}
