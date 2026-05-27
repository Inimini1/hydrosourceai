import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { analyzeWater } from '@/lib/ai'
import { checkRateLimit } from '@/lib/rateLimit'

const MAX_IMAGE_BYTES = 5_000_000

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const rateLimit = await checkRateLimit(`ai:analyze:${user.id}`, 30, 60 * 60 * 1000)
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Too many analyses. Please wait before running another test.' },
      { status: 429 }
    )
  }

  try {
    const body = await req.json()
    const {
      poolId, chlorine, pH, alkalinity,
      calciumHardness, cyanuricAcid, totalChlorine, phosphates,
      saltLevel, temperature, waterClarity, odor, symptoms, imageBase64,
    } = body

    if (!poolId || chlorine == null || pH == null || alkalinity == null) {
      return NextResponse.json({ error: 'Pool ID, chlorine, pH, and alkalinity are required.' }, { status: 400 })
    }
    if (isNaN(chlorine) || isNaN(pH) || isNaN(alkalinity)) {
      return NextResponse.json({ error: 'Chemical values must be numbers.' }, { status: 400 })
    }
    if (imageBase64 && imageBase64.length > MAX_IMAGE_BYTES) {
      return NextResponse.json({ error: 'Image too large. Please use a smaller photo (max 4MB).' }, { status: 413 })
    }

    // Fetch pool (RLS ensures it belongs to this user)
    const { data: pool, error: poolError } = await supabase
      .from('pools')
      .select('id, pool_name, gallons, chlorine_type')
      .eq('id', poolId)
      .eq('user_id', user.id)
      .single()

    if (poolError || !pool) {
      return NextResponse.json({ error: 'Pool not found.' }, { status: 404 })
    }

    // Fetch profile for experience level + recent tests in parallel
    const [profileResult, recentTestsResult] = await Promise.all([
      supabase
        .from('profiles')
        .select('experience_level')
        .eq('id', user.id)
        .single(),
      supabase
        .from('water_tests')
        .select('chlorine, ph, alkalinity, status, created_at')
        .eq('pool_id', poolId)
        .order('created_at', { ascending: false })
        .limit(5),
    ])

    const experienceLevel = profileResult.data?.experience_level ?? null
    const recentTests = (recentTestsResult.data ?? []).map((t) => ({
      date: t.created_at.split('T')[0],
      chlorine: t.chlorine,
      pH: t.ph,
      alkalinity: t.alkalinity,
      status: t.status,
    }))

    const analysis = await analyzeWater({
      chlorine, pH, alkalinity,
      calciumHardness: calciumHardness ?? null,
      cyanuricAcid: cyanuricAcid ?? null,
      totalChlorine: totalChlorine ?? null,
      phosphates: phosphates ?? null,
      saltLevel: saltLevel ?? null,
      temperature: temperature ?? null,
      waterClarity: waterClarity ?? null,
      odor: odor ?? null,
      symptoms: symptoms ?? null,
      gallons: pool.gallons,
      poolType: pool.chlorine_type,
      imageBase64: imageBase64 ?? null,
      experienceLevel,
      recentTests,
    })

    // Save the water test — use the user-scoped client so RLS enforces pool ownership.
    // The water_tests policy verifies pool_id belongs to auth.uid() via the pools join.
    const { data: waterTest, error: insertError } = await supabase
      .from('water_tests')
      .insert({
        pool_id: pool.id, // use verified pool.id, never raw poolId from request body
        chlorine,
        ph: pH,
        alkalinity,
        calcium_hardness: calciumHardness ?? null,
        cyanuric_acid: cyanuricAcid ?? null,
        temperature: temperature ?? null,
        water_clarity: waterClarity ?? null,
        odor: odor ?? null,
        symptoms: symptoms ?? null,
        status: analysis.status,
        ai_analysis: JSON.stringify(analysis),
      })
      .select()
      .single()

    if (insertError || !waterTest) {
      return NextResponse.json({ error: 'Failed to save test results.' }, { status: 500 })
    }

    // Create notification for critical results
    if (analysis.status === 'critical') {
      await supabase.from('notifications').insert({
        user_id: user.id,
        type: 'UNSAFE_WATER',
        title: 'Unsafe water detected',
        message: `${pool.pool_name}: ${analysis.diagnosis}`,
      })
    }

    return NextResponse.json(
      { test: { ...waterTest, pH: waterTest.ph, aiAnalysis: analysis } },
      { status: 201 }
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'AI analysis failed.'
    if (message.includes('429') || message.includes('quota') || message.includes('Too Many Requests')) {
      return NextResponse.json(
        { error: 'AI service is temporarily unavailable due to quota limits. Please try again later.' },
        { status: 503 }
      )
    }
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
