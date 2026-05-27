import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: notifications, error } = await supabase
    .from('notifications')
    .select('id, type, title, message, read, created_at')
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const mapped = (notifications ?? []).map((n) => ({
    id:        n.id,
    type:      n.type,
    title:     n.title,
    message:   n.message,
    read:      n.read,
    createdAt: n.created_at,
  }))

  return NextResponse.json({ notifications: mapped })
}

export async function PATCH(req: NextRequest) {
  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const all = req.nextUrl.searchParams.get('all') === 'true'
  const id  = req.nextUrl.searchParams.get('id')

  if (all) {
    await supabase.from('notifications').update({ read: true }).eq('user_id', user.id).eq('read', false)
  } else if (id) {
    await supabase.from('notifications').update({ read: true }).eq('id', id).eq('user_id', user.id)
  }

  return NextResponse.json({ message: 'Updated' })
}
