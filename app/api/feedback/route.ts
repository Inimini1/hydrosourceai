import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { checkRateLimit } from '@/lib/rateLimit'
import { sendFeedbackNotificationEmail } from '@/lib/email'
import type { Database } from '@/lib/supabase/types'

type FeedbackStatus = Database['public']['Tables']['feedback']['Row']['status']
type FeedbackUpdate = Database['public']['Tables']['feedback']['Update']

// POST /api/feedback — submit feedback (authenticated or anonymous)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { message, category, pageUrl } = body

    if (!message?.trim() || message.trim().length < 3) {
      return NextResponse.json({ error: 'Message is required.' }, { status: 400 })
    }
    if (message.length > 2000) {
      return NextResponse.json({ error: 'Message too long (max 2000 chars).' }, { status: 400 })
    }

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const rateLimitKey = user ? `feedback:${user.id}` : `feedback:anon:${req.headers.get('x-forwarded-for') ?? 'unknown'}`
    const limit = await checkRateLimit(rateLimitKey, 5, 60 * 60 * 1000) // 5 per hour
    if (!limit.allowed) {
      return NextResponse.json({ error: 'Too many submissions. Please wait before sending more feedback.' }, { status: 429 })
    }

    const admin = createAdminClient()
    const { error } = await admin.from('feedback').insert({
      user_id:    user?.id ?? null,
      user_email: user?.email ?? null,
      message:    message.trim(),
      category:   category ?? 'general',
      page_url:   pageUrl ?? null,
      app_version: 'web',
    })

    if (error) throw error

    // Email notification to founder — non-blocking
    sendFeedbackNotificationEmail(
      user?.email ?? null,
      category ?? 'general',
      message.trim(),
      pageUrl ?? null,
    ).catch(() => {/* non-critical */})

    return NextResponse.json({ ok: true }, { status: 201 })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to save feedback.'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

// GET /api/feedback — founder-only: list all feedback
export async function GET(req: NextRequest) {
  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const founderEmail = process.env.FOUNDER_EMAIL ?? 'al.cloud365@gmail.com'
  if (user.email !== founderEmail) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const url = new URL(req.url)
  const status = url.searchParams.get('status')
  const limit  = Math.min(parseInt(url.searchParams.get('limit') ?? '50'), 100)

  const admin = createAdminClient()
  let query = admin
    .from('feedback')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (status) query = query.eq('status', status as FeedbackStatus)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ feedback: data })
}

// PATCH /api/feedback — founder-only: update status or add note
export async function PATCH(req: NextRequest) {
  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const founderEmail = process.env.FOUNDER_EMAIL ?? 'al.cloud365@gmail.com'
  if (user.email !== founderEmail) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id, status, founderNote } = await req.json()
  if (!id) return NextResponse.json({ error: 'ID required.' }, { status: 400 })

  const admin = createAdminClient()
  const update: FeedbackUpdate = {}
  if (status) update.status = status as FeedbackStatus
  if (founderNote !== undefined) update.founder_note = founderNote as string

  const { error } = await admin.from('feedback').update(update).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
