import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function DELETE(req: NextRequest) {
  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const { password } = body

  if (password) {
    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email: user.email!,
      password,
    })
    if (verifyError) return NextResponse.json({ error: 'Incorrect password.' }, { status: 400 })
  }

  const admin = createAdminClient()
  const { error: deleteError } = await admin.auth.admin.deleteUser(user.id)
  if (deleteError) return NextResponse.json({ error: 'Failed to delete account.' }, { status: 500 })

  return NextResponse.json({ message: 'Account deleted.' })
}

export async function GET(_req: NextRequest) {
  const supabase = createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, avatar_color, role, onboarding_complete')
    .eq('id', user.id)
    .single()

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      role: profile?.role ?? 'OWNER',
      displayName: profile?.display_name ?? null,
      avatarColor: profile?.avatar_color ?? '#006FFF',
      onboardingComplete: profile?.onboarding_complete ?? false,
    },
  })
}

export async function PATCH(req: NextRequest) {
  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()

  if ('displayName' in body || 'avatarColor' in body) {
    const data: { display_name?: string; avatar_color?: string } = {}
    if (typeof body.displayName === 'string') data.display_name = body.displayName.trim().slice(0, 40)
    if (typeof body.avatarColor === 'string' && /^#[0-9A-Fa-f]{6}$/.test(body.avatarColor)) {
      data.avatar_color = body.avatarColor
    }
    await supabase.from('profiles').update(data).eq('id', user.id)
    return NextResponse.json({ message: 'Profile updated.' })
  }

  const { currentPassword, newPassword } = body
  if (!currentPassword || !newPassword) {
    return NextResponse.json({ error: 'Both current and new passwords are required.' }, { status: 400 })
  }
  if (newPassword.length < 8) {
    return NextResponse.json({ error: 'New password must be at least 8 characters.' }, { status: 400 })
  }

  const { error: verifyError } = await supabase.auth.signInWithPassword({
    email: user.email!,
    password: currentPassword,
  })
  if (verifyError) return NextResponse.json({ error: 'Current password is incorrect.' }, { status: 400 })

  const { error: updateError } = await supabase.auth.updateUser({ password: newPassword })
  if (updateError) return NextResponse.json({ error: 'Failed to update password.' }, { status: 500 })

  return NextResponse.json({ message: 'Password updated.' })
}
