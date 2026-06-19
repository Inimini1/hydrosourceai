import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { rating, note } = await req.json().catch(() => ({}))
  if (!rating || !['helpful', 'not_helpful'].includes(rating)) {
    return NextResponse.json({ error: 'rating must be helpful or not_helpful' }, { status: 400 })
  }

  // Verify ownership via pool join (RLS enforces this too, belt-and-suspenders)
  const { data: test } = await supabase
    .from('water_tests')
    .select('id, pool_id, pools!inner(user_id)')
    .eq('id', params.id)
    .single()

  if (!test) return NextResponse.json({ error: 'Test not found' }, { status: 404 })

  const { error } = await (supabase.from('water_tests') as unknown as any)
    .update({
      feedback_rating: rating,
      feedback_note: note?.trim() || null,
      feedback_at: new Date().toISOString(),
    })
    .eq('id', params.id)

  if (error) return NextResponse.json({ error: 'Failed to save feedback' }, { status: 500 })

  return NextResponse.json({ ok: true })
}
