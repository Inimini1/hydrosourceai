import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const { userType, numPools, primaryGoal, experienceLevel, testFrequency, mainChallenge, poolPurpose } = body

    const data: {
      onboarding_complete: boolean
      user_type?: string
      num_pools?: string
      primary_goal?: string
      experience_level?: string
      test_frequency?: string
      main_challenge?: string
      pool_purpose?: string
    } = { onboarding_complete: true }
    if (typeof userType === 'string') data.user_type = userType.slice(0, 50)
    if (typeof numPools === 'string') data.num_pools = numPools.slice(0, 20)
    if (typeof primaryGoal === 'string') data.primary_goal = primaryGoal.slice(0, 100)
    if (typeof experienceLevel === 'string') data.experience_level = experienceLevel.slice(0, 50)
    if (typeof testFrequency === 'string') data.test_frequency = testFrequency.slice(0, 50)
    if (typeof mainChallenge === 'string') data.main_challenge = mainChallenge.slice(0, 200)
    if (typeof poolPurpose === 'string') data.pool_purpose = poolPurpose.slice(0, 100)

    const admin = createAdminClient()
    await admin.from('profiles').update(data).eq('id', user.id)

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Server error.' }, { status: 500 })
  }
}
