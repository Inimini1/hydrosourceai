import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Verify ownership via pool join before deleting (RLS enforces this too, belt-and-suspenders)
  const { data: log } = await supabase
    .from('service_logs')
    .select('id, pools!inner(user_id)')
    .eq('id', params.id)
    .single()

  const owner = (log as unknown as { pools: { user_id: string } } | null)?.pools?.user_id
  if (!log || owner !== user.id) {
    return NextResponse.json({ error: 'Service log not found.' }, { status: 404 })
  }

  const { error } = await supabase
    .from('service_logs')
    .delete()
    .eq('id', params.id)

  if (error) {
    console.error('[DELETE /api/service-logs/:id] failed:', error.message)
    return NextResponse.json({ error: 'Failed to delete service log.' }, { status: 500 })
  }

  return NextResponse.json({ message: 'Deleted.' })
}
