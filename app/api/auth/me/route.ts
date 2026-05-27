import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, avatar_color, role, onboarding_complete, experience_level, primary_goal, beta_expires_at')
    .eq('id', user.id)
    .single()

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('plan_type, status')
    .eq('user_id', user.id)
    .single()

  return NextResponse.json({
    user: {
      id:                 user.id,
      email:              user.email,
      emailVerified:      !!user.email_confirmed_at,
      role:               profile?.role ?? 'OWNER',
      displayName:        profile?.display_name ?? null,
      avatarColor:        profile?.avatar_color ?? '#006FFF',
      onboardingComplete: profile?.onboarding_complete ?? false,
      experienceLevel:    profile?.experience_level ?? null,
      primaryGoal:        profile?.primary_goal ?? null,
      subscriptionStatus: subscription?.plan_type ?? 'FREE',
      betaExpiresAt:      profile?.beta_expires_at ?? null,
    },
  })
}
