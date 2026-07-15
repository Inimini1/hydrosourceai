import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { analyzeTestStripImage } from '@/lib/ai'
import { checkRateLimit } from '@/lib/rateLimit'
import { canRunAnalysis } from '@/lib/subscription'

// Base64 inflates raw bytes by ~4/3, so compare the encoded string length
// against the raw limit scaled up, not the raw limit itself.
const MAX_IMAGE_RAW_BYTES = 4_000_000
const MAX_IMAGE_BASE64_LENGTH = Math.ceil(MAX_IMAGE_RAW_BYTES * 4 / 3)

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const rateLimit = await checkRateLimit(`ai:scan:${user.id}`, 20, 60 * 60 * 1000)
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: 'Too many scan requests. Please wait before trying again.' }, { status: 429 })
  }

  // Strip scans use the same Gemini vision call as a full analysis, so they must
  // count against the same monthly cap as /api/ai/analyze — without this, the
  // free-tier analysis limit was fully bypassable via the scan endpoint.
  const gate = await canRunAnalysis(user.id)
  if (!gate.allowed) {
    return NextResponse.json({ error: gate.reason, upgradeRequired: gate.upgradeRequired }, { status: 403 })
  }

  try {
    const body = await req.json()
    const { imageBase64, imageMimeType, brand } = body as { imageBase64?: string; imageMimeType?: string; brand?: string }
    if (!imageBase64) return NextResponse.json({ error: 'No image provided.' }, { status: 400 })

    if (imageBase64.length > MAX_IMAGE_BASE64_LENGTH) {
      return NextResponse.json({ error: 'Image too large. Please use a smaller photo (max 4MB).' }, { status: 413 })
    }

    const readings = await analyzeTestStripImage(imageBase64, brand, imageMimeType)
    return NextResponse.json({ readings })
  } catch (err) {
    console.error('[scan-strip] analyzeTestStripImage failed:', err)
    return NextResponse.json({ error: 'Could not read test strip. Try entering values manually.' }, { status: 500 })
  }
}
