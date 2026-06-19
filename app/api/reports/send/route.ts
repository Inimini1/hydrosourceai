import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendWaterReportEmail } from '@/lib/email'
import { canSendEmailReports } from '@/lib/subscription'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const gate = await canSendEmailReports(user.id)
  if (!gate.allowed) {
    return NextResponse.json({ error: gate.reason, upgradeRequired: gate.upgradeRequired }, { status: 403 })
  }

  const { testId, recipientEmail } = await req.json().catch(() => ({}))

  if (!testId || !recipientEmail) {
    return NextResponse.json({ error: 'Test ID and recipient email are required.' }, { status: 400 })
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipientEmail)) {
    return NextResponse.json({ error: 'Invalid email address.' }, { status: 400 })
  }

  const { data: testRow, error: testError } = await supabase
    .from('water_tests')
    .select('id, chlorine, ph, alkalinity, calcium_hardness, cyanuric_acid, temperature, status, ai_analysis, created_at, pools(pool_name, gallons, chlorine_type)')
    .eq('id', testId)
    .single()

  if (testError || !testRow) return NextResponse.json({ error: 'Test not found.' }, { status: 404 })

  const poolData = Array.isArray(testRow.pools) ? testRow.pools[0] : testRow.pools
  const test = {
    chlorine: testRow.chlorine,
    pH: testRow.ph,
    alkalinity: testRow.alkalinity,
    calciumHardness: testRow.calcium_hardness,
    cyanuricAcid: testRow.cyanuric_acid,
    temperature: testRow.temperature,
    status: testRow.status,
    aiAnalysis: testRow.ai_analysis,
    createdAt: new Date(testRow.created_at),
    pool: {
      poolName: poolData?.pool_name ?? 'My Pool',
      gallons: poolData?.gallons ?? 0,
      chlorineType: poolData?.chlorine_type ?? 'CHLORINE',
    },
  }

  let analysis: Record<string, unknown>
  try {
    analysis = typeof test.aiAnalysis === 'string' ? JSON.parse(test.aiAnalysis) : test.aiAnalysis as Record<string, unknown>
  } catch {
    return NextResponse.json({ error: 'Report data is corrupted.' }, { status: 500 })
  }

  try {
    const pdfBuffer = await generateReportPdf(test, analysis)
    await sendWaterReportEmail(recipientEmail, test.pool.poolName, test.createdAt, pdfBuffer)
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Report generation/send error:', err)
    return NextResponse.json({ error: 'Failed to send report. Please try again.' }, { status: 500 })
  }
}

// ── PDF GENERATION ────────────────────────────────────────────────────────────

interface TestData {
  chlorine: number; pH: number; alkalinity: number
  calciumHardness: number | null; cyanuricAcid: number | null; temperature: number | null
  status: string; aiAnalysis: string | Record<string, unknown>; createdAt: Date
  pool: { poolName: string; gallons: number; chlorineType: string }
}

async function generateReportPdf(test: TestData, a: Record<string, unknown>): Promise<Buffer> {
  const PDFDocument = require('pdfkit') as typeof import('pdfkit')

  return new Promise<Buffer>((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4', bufferPages: true })
    const chunks: Buffer[] = []
    doc.on('data', (c: Buffer) => chunks.push(c))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)

    const PW = doc.page.width
    const M = 50
    const CW = PW - M * 2

    const BLUE = '#006FFF'
    const TEAL = '#00C9B1'
    const GREEN = '#00C17A'
    const AMBER = '#D97706'
    const RED = '#DC2626'
    const DARK = '#0F172A'
    const MID = '#475569'
    const SLATE = '#94A3B8'
    const BG = '#F8FAFC'
    const BORDER = '#E2E8F0'

    const score = Math.round(typeof a.health_score === 'number' ? Math.max(0, Math.min(100, a.health_score)) : 50)
    const status = a.status as string
    const statusColor = status === 'safe' ? GREEN : status === 'caution' ? AMBER : RED
    const statusLabel = status === 'safe' ? 'Water Safe' : status === 'caution' ? 'Needs Attention' : 'Action Required'
    const poolTypeLabel = test.pool.chlorineType === 'SALT' ? 'Salt Water Pool' : 'Chlorine Pool'
    const testDateStr = new Date(test.createdAt).toLocaleString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
    })

    // ── HEADER ──────────────────────────────────────────────────────────────
    doc.rect(0, 0, PW, 72).fill(BLUE)
    doc.fillColor('white').font('Helvetica-Bold').fontSize(22)
       .text('HydroSource', M, 20, { lineBreak: false })
    doc.fillColor('rgba(255,255,255,0.55)').font('Helvetica').fontSize(11)
       .text('Water Quality Report', M, 46, { lineBreak: false })
    doc.fillColor('rgba(255,255,255,0.4)').font('Helvetica').fontSize(8.5)
       .text(testDateStr, M, 60, { lineBreak: false })

    let y = 90

    // ── POOL INFO ────────────────────────────────────────────────────────────
    doc.fillColor(DARK).font('Helvetica-Bold').fontSize(17)
       .text(test.pool.poolName, M, y, { lineBreak: false })
    y += 25
    doc.fillColor(MID).font('Helvetica').fontSize(10)
       .text(`${test.pool.gallons.toLocaleString()} gallons  ·  ${poolTypeLabel}`, M, y, { lineBreak: false })
    y += 20
    doc.moveTo(M, y).lineTo(PW - M, y).strokeColor(BORDER).lineWidth(0.75).stroke()
    y += 16

    // ── STATUS CARD ──────────────────────────────────────────────────────────
    const CARD_H = 70
    doc.rect(M, y, CW, CARD_H).fill(BG)
    doc.rect(M, y, CW, CARD_H).strokeColor(BORDER).lineWidth(0.75).stroke()
    doc.rect(M, y, 5, CARD_H).fill(statusColor)

    doc.fillColor(statusColor).font('Helvetica-Bold').fontSize(38)
       .text(String(score), M + 18, y + 10, { lineBreak: false })
    doc.fillColor(SLATE).font('Helvetica').fontSize(9)
       .text('/100', M + 62, y + 26, { lineBreak: false })
    doc.fillColor(statusColor).font('Helvetica-Bold').fontSize(10)
       .text(statusLabel.toUpperCase(), M + 98, y + 13, { lineBreak: false })
    doc.fillColor(MID).font('Helvetica').fontSize(8)
       .text('Pool Health Score', M + 98, y + 27, { lineBreak: false })

    const diagText = (a.diagnosis as string) ?? ''
    const diagH = doc.heightOfString(diagText, { width: CW - 240 })
    doc.fillColor(DARK).font('Helvetica').fontSize(9)
       .text(diagText, M + 232, y + Math.max(5, (CARD_H - diagH) / 2), { width: CW - 244 })
    y += CARD_H + 16

    // ── AI DISCLAIMER ────────────────────────────────────────────────────────
    const disclaimerText = 'This report provides general water chemistry guidance only — it is not a substitute for professional inspection, regulatory compliance, or licensed pool service. All dosing suggestions are based on standard chemistry formulas; verify against your product label before applying. Not legal or regulatory advice.'
    const discH = doc.heightOfString(disclaimerText, { width: CW - 28 }) + 26
    doc.rect(M, y, CW, discH).fill('#EFF6FF')
    doc.rect(M, y, 4, discH).fill(BLUE)
    doc.fillColor(BLUE).font('Helvetica-Bold').fontSize(7.5)
       .text('GUIDANCE & LIABILITY NOTICE', M + 12, y + 7, { lineBreak: false })
    doc.fillColor('#1E40AF').font('Helvetica').fontSize(8)
       .text(disclaimerText, M + 12, y + 18, { width: CW - 28 })
    y += discH + 18

    // ── READINGS TABLE ────────────────────────────────────────────────────────
    doc.fillColor(DARK).font('Helvetica-Bold').fontSize(11)
       .text('Water Readings', M, y, { lineBreak: false })
    y += 20

    const COL = [M, M + 175, M + 285, M + 390]
    doc.rect(M, y, CW, 20).fill('#1E3A5F')
    doc.fillColor('white').font('Helvetica-Bold').fontSize(8.5)
    ;(['Parameter', 'Ideal Range', 'Result', 'Status'] as const).forEach((label, i) =>
      doc.text(label, COL[i] + 6, y + 5, { lineBreak: false })
    )
    y += 20

    const readings: Array<{ label: string; ideal: string; val: number; unit: string; min: number; max: number; critMin?: number; critMax?: number }> = [
      { label: 'Free Chlorine', ideal: '1–3 ppm',    val: test.chlorine,          unit: ' ppm', min: 1,   max: 3,   critMin: 0.5, critMax: 5 },
      { label: 'pH',            ideal: '7.2–7.6',    val: test.pH,                unit: '',     min: 7.2, max: 7.6, critMin: 7.0, critMax: 8.0 },
      { label: 'Alkalinity',    ideal: '80–120 ppm', val: test.alkalinity,        unit: ' ppm', min: 80,  max: 120, critMin: 60,  critMax: 150 },
      ...(test.calciumHardness != null ? [{ label: 'Ca. Hardness', ideal: '200–400 ppm', val: test.calciumHardness, unit: ' ppm', min: 200, max: 400 }] : []),
      ...(test.cyanuricAcid    != null ? [{ label: 'Cyanuric Acid', ideal: '30–50 ppm',  val: test.cyanuricAcid,    unit: ' ppm', min: 30,  max: 50  }] : []),
      ...(test.temperature     != null ? [{ label: 'Temperature',   ideal: '70–85°F',    val: test.temperature,     unit: '°F',   min: 70,  max: 85  }] : []),
    ]

    readings.forEach((r, i) => {
      doc.rect(M, y, CW, 20).fill(i % 2 === 0 ? '#FFFFFF' : BG)
      let st = 'safe'
      if ((r.critMin !== undefined && r.val < r.critMin) || (r.critMax !== undefined && r.val > r.critMax)) st = 'critical'
      else if (r.val < r.min || r.val > r.max) st = 'caution'
      const stColor = st === 'safe' ? GREEN : st === 'caution' ? AMBER : RED
      const stLabel = st === 'safe' ? '✓ Ideal' : st === 'caution' ? '! Off Range' : '⚠ Critical'

      doc.fillColor(DARK).font('Helvetica').fontSize(9)
         .text(r.label,            COL[0] + 6, y + 5, { lineBreak: false })
         .text(r.ideal,            COL[1] + 6, y + 5, { lineBreak: false })
         .text(`${r.val}${r.unit}`, COL[2] + 6, y + 5, { lineBreak: false })
      doc.fillColor(stColor).font('Helvetica-Bold').fontSize(9)
         .text(stLabel, COL[3] + 6, y + 5, { lineBreak: false })
      y += 20
    })
    doc.rect(M, y - readings.length * 20 - 20, CW, readings.length * 20 + 20)
       .strokeColor(BORDER).lineWidth(0.75).stroke()
    y += 18

    // ── FLOWING ANALYSIS SECTIONS ─────────────────────────────────────────────
    function checkPage(est = 60) {
      if (y + est > 790) { doc.addPage(); y = 50 }
    }

    function sectionTitle(title: string, color = BLUE) {
      checkPage(50)
      doc.fillColor(DARK).font('Helvetica-Bold').fontSize(11)
         .text(title, M, y, { lineBreak: false })
      y += 16
      doc.moveTo(M, y).lineTo(M + 50, y).strokeColor(color).lineWidth(2).stroke()
      y += 10
    }

    function flowText(text: string, color = MID, size = 9.5) {
      checkPage(40)
      const h = doc.heightOfString(text, { width: CW - 12 })
      doc.fillColor(color).font('Helvetica').fontSize(size)
         .text(text, M + 8, y, { width: CW - 12 })
      y += h + 6
    }

    function bulletList(items: string[], color = MID) {
      (items as string[]).forEach(item => { flowText(`•  ${item}`, color) })
    }

    function numberedList(items: string[]) {
      (items as string[]).forEach((item, i) => {
        const clean = item.replace(/^step\s*\d+\s*[—\-:]\s*/i, '')
        flowText(`${i + 1}.  ${clean}`)
      })
    }

    const keyCauses = a.key_causes as string[] | undefined
    if (keyCauses?.length) { sectionTitle('Why This Is Happening', TEAL); bulletList(keyCauses); y += 8 }

    const actionPlan = a.immediate_action_plan as string[] | undefined
    if (actionPlan?.length) { sectionTitle('Immediate Action Plan', BLUE); numberedList(actionPlan); y += 8 }

    const dosingGuide = a.chemical_dosing_guide as Array<{ chemical: string; amount: string; how_to_apply: string }> | undefined
    if (dosingGuide?.length) {
      sectionTitle('Chemical Dosing Guide', GREEN)
      dosingGuide.forEach(dose => {
        checkPage(55)
        doc.fillColor(DARK).font('Helvetica-Bold').fontSize(10)
           .text(dose.chemical, M + 8, y, { lineBreak: false })
        doc.fillColor(GREEN).font('Helvetica-Bold').fontSize(9.5)
           .text(`   →  ${dose.amount}`, M + 8 + doc.widthOfString(dose.chemical), y, { lineBreak: false })
        y += 16
        if (dose.how_to_apply) {
          const h = doc.heightOfString(dose.how_to_apply, { width: CW - 20 })
          doc.fillColor(MID).font('Helvetica').fontSize(9)
             .text(dose.how_to_apply, M + 14, y, { width: CW - 20 })
          y += h + 10
        }
      })
      y += 6
    }

    const timeline = a.timeline as string | undefined
    if (timeline) { sectionTitle('What to Expect (Next 24–48 Hours)', TEAL); flowText(timeline); y += 8 }

    const conflicts = a.conflicts_detected as string[] | undefined
    if (conflicts?.length) { sectionTitle('Chemical Conflict Warnings', RED); bulletList(conflicts, '#7F1D1D'); y += 8 }

    const alerts = a.preventative_alerts as string[] | undefined
    if (alerts?.length) { sectionTitle('Preventative Alerts', AMBER); bulletList(alerts); y += 8 }

    const mistakes = a.mistakes_to_avoid as string[] | undefined
    if (mistakes?.length) { sectionTitle('Mistakes to Avoid', RED); bulletList(mistakes, '#7F1D1D'); y += 8 }

    const whyWorks = a.why_this_works as string | undefined
    if (whyWorks) { sectionTitle('Why This Works', BLUE); flowText(whyWorks); y += 8 }

    const safetyNotes = a.safety_notes as string | undefined
    if (safetyNotes && !safetyNotes.toLowerCase().startsWith('none')) {
      checkPage(80)
      const safetyH = doc.heightOfString(safetyNotes, { width: CW - 28 }) + 34
      doc.rect(M, y, CW, safetyH).fill('#FFF1F2')
      doc.rect(M, y, CW, 9).fill(RED)
      doc.fillColor('white').font('Helvetica-Bold').fontSize(7.5)
         .text('SAFETY WARNING', M + 10, y + 1.5, { lineBreak: false })
      doc.fillColor('#991B1B').font('Helvetica').fontSize(9)
         .text(safetyNotes, M + 10, y + 17, { width: CW - 28 })
      y += safetyH + 14
    }

    // ── PAGE FOOTERS ─────────────────────────────────────────────────────────
    const range = doc.bufferedPageRange()
    for (let i = range.start; i < range.start + range.count; i++) {
      doc.switchToPage(i)
      const PH = doc.page.height
      doc.rect(0, PH - 26, PW, 26).fill('#F1F5F9')
      doc.moveTo(0, PH - 26).lineTo(PW, PH - 26).strokeColor(BORDER).lineWidth(0.5).stroke()
      doc.fillColor(SLATE).font('Helvetica').fontSize(7.5)
         .text(
           `HydroSource  ·  ${(process.env.NEXT_PUBLIC_APP_URL ?? 'hydrosourceai.com').replace('https://', '')}  ·  Page ${i - range.start + 1} of ${range.count}  ·  General guidance only — not regulatory advice`,
           M, PH - 17,
           { width: PW - M * 2, align: 'center', lineBreak: false }
         )
    }

    doc.end()
  })
}
