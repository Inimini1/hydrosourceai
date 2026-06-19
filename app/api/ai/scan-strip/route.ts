import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { analyzeTestStripImage } from '@/lib/ai'
import { checkRateLimit } from '@/lib/rateLimit'

const MAX_IMAGE_BYTES = 5_000_000

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const rateLimit = await checkRateLimit(`ai:scan:${user.id}`, 20, 60 * 60 * 1000)
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: 'Too many scan requests. Please wait before trying again.' }, { status: 429 })
  }

  try {
    const body = await req.json()
    const { imageBase64, brand } = body as { imageBase64?: string; brand?: string }
    if (!imageBase64) return NextResponse.json({ error: 'No image provided.' }, { status: 400 })

    if (imageBase64.length > MAX_IMAGE_BYTES) {
      return NextResponse.json({ error: 'Image too large. Please use a smaller photo (max 4MB).' }, { status: 413 })
    }

    const readings = await analyzeTestStripImage(imageBase64, brand)
    return NextResponse.json({ readings })
  } catch {
    return NextResponse.json({ error: 'Could not read test strip. Try entering values manually.' }, { status: 500 })
  }
}
