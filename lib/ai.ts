import { GoogleGenerativeAI } from '@google/generative-ai'
import { buildPoolContext } from './pool-context'
import { STRIP_BRAND_CHARTS, type BrandChart } from './stripBrandColors'

export interface ChemicalDose {
  chemical: string
  amount: string
  how_to_apply: string
}

export interface WaterAnalysis {
  status: 'safe' | 'caution' | 'critical'
  health_score: number
  diagnosis: string
  confidence: 'low' | 'medium' | 'high'
  key_causes: string[]
  immediate_action_plan: string[]
  chemical_dosing_guide: ChemicalDose[]
  timeline: string
  preventative_alerts: string[]
  mistakes_to_avoid: string[]
  conflicts_detected: string[]
  why_this_works: string
  safety_notes: string
  // How many days before the next test is recommended, based on current water state
  next_test_days: number
  // Short per-pool treatment narrative for the trend/history view
  treatment_summary: string
}

export interface RecentTest {
  date: string
  chlorine: number
  pH: number
  alkalinity: number
  status: string
}

export function detectPatterns(tests: RecentTest[]): string {
  if (tests.length < 2) return ''

  const findings: string[] = []

  const phValues  = tests.map((t) => t.pH)
  const clValues  = tests.map((t) => t.chlorine)
  const taValues  = tests.map((t) => t.alkalinity)

  // Drift: consistent direction across all consecutive pairs
  function drift(vals: number[]): 'rising' | 'falling' | 'stable' {
    let up = 0, down = 0
    for (let i = 0; i < vals.length - 1; i++) {
      if (vals[i + 1] > vals[i] + 0.05) up++
      else if (vals[i + 1] < vals[i] - 0.05) down++
    }
    if (up >= vals.length - 1) return 'rising'
    if (down >= vals.length - 1) return 'falling'
    return 'stable'
  }

  const phDrift = drift(phValues)
  const clDrift = drift(clValues)
  const taDrift = drift(taValues)

  if (phDrift === 'rising')  findings.push(`pH has risen every test (${phValues[phValues.length-1]} → most recent ${phValues[0]}) — consistent upward drift, likely SWG off-gassing or high TA. Address TA to stabilize.`)
  if (phDrift === 'falling') findings.push(`pH has dropped every test — acid is being over-dosed or CO₂ buildup. Reduce acid dose or check aeration.`)
  if (clDrift === 'falling') findings.push(`Free chlorine has declined every test — possible high CYA lock-out, high bather load, or insufficient stabilizer. Verify CYA before adding more chlorine.`)
  if (clDrift === 'rising')  findings.push(`Free chlorine has risen each test — pool may be over-dosed. Check dosing schedule.`)
  if (taDrift === 'falling') findings.push(`Total alkalinity declining each test — acid additions are reducing buffering capacity. Recheck acid dose amount.`)

  // Recurring status
  const statuses = tests.map((t) => t.status)
  const critCount = statuses.filter((s) => s === 'critical').length
  const cautionCount = statuses.filter((s) => s === 'caution').length
  if (critCount >= 2) findings.push(`RECURRING CRITICAL: ${critCount} of the last ${tests.length} tests were critical — the pool has a persistent underlying issue, not a one-off event.`)
  else if (cautionCount >= 3) findings.push(`Pool has been in caution for ${cautionCount} consecutive tests — maintenance plan is not resolving the issue. Re-evaluate the treatment approach.`)

  // Chlorine consistently low despite presumably dosing
  const avgCl = clValues.reduce((a, b) => a + b, 0) / clValues.length
  if (avgCl < 1.5 && tests.length >= 3) findings.push(`Average free chlorine over last ${tests.length} tests is only ${avgCl.toFixed(1)} ppm — chronically under-sanitized pool. Consider CYA drain if CYA > 60.`)

  if (findings.length === 0) return ''

  return '\nPATTERN ANALYSIS (detected from test history — address root cause, not just current reading):\n'
    + findings.map((f) => `  • ${f}`).join('\n')
}

export interface AnalyzeInput {
  chlorine: number
  pH: number
  alkalinity: number
  calciumHardness?: number | null
  cyanuricAcid?: number | null
  totalChlorine?: number | null
  phosphates?: number | null
  saltLevel?: number | null
  temperature?: number | null
  waterClarity?: string | null
  odor?: string | null
  symptoms?: string | null
  gallons: number
  poolType?: string | null
  imageBase64?: string | null
  imageMimeType?: string | null
  experienceLevel?: string | null
  recentTests?: RecentTest[] | null
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? '')

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`${label} timed out after ${ms / 1000}s`)), ms)
    ),
  ])
}

const SYSTEM_PROMPT = `You are HydroSource, an AI pool water chemistry assistant. Your role is to analyze pool water test data and provide general scientific recommendations to help pool owners and service professionals maintain balanced, safe water. You are not a licensed pool inspector, a regulatory authority, or a legal advisor.

LEGAL FRAMING RULES — FOLLOW WITHOUT EXCEPTION:
1. Frame every recommendation as a suggestion based on general water chemistry science, not a definitive or legally compliant instruction. Use language like "based on your readings, we suggest…" or "a common approach is…" — never "you must" or "you are required to."
2. Never cite, interpret, or apply specific local, state, or federal regulations (including but not limited to TDLR rules, state health codes, OSHA standards, or HOA/commercial facility codes). If the pool context appears commercial (hotel, apartment, school, gym, HOA), always include in safety_notes: "Commercial and public pools are subject to jurisdiction-specific health and safety regulations. Always verify recommendations with your local authority or a licensed commercial pool operator before applying them."
3. Never guarantee health safety outcomes. Do not state a pool "is safe to swim in" based solely on chemistry readings. Use language like "the readings are within a commonly accepted range for residential pools" or "these levels suggest the water is approaching a balanced state."
4. If a reading indicates a serious health or equipment risk (extremely high chlorine, very low pH combined with high bather load, phosphates above threshold, etc.), include in safety_notes: "This reading may warrant immediate attention. Consult a certified pool professional or your local health authority before allowing pool use."
5. Present dosing as ranges based on standard water chemistry formulas (e.g., LSI). Note that actual dosing should be confirmed against the product label and pool-specific variables.
6. Always include this reminder in why_this_works or safety_notes: "This tool provides general guidance only. Pool conditions vary and professional judgment should always be applied. This is not a substitute for professional inspection or regulatory compliance."

GOALS:
1. Diagnose pool issues accurately using user-provided data
2. Provide precise, step-by-step suggestions with quantities calculated for the specific pool size — framed as guidance, not mandates
3. Prevent mistakes and unsafe chemical usage
4. Build user trust through clear reasoning and transparency
5. Help users save time and money with minimum effective dosing

KNOWLEDGE BASE — IDEAL RANGES:
- pH: 7.2–7.6
- Free Chlorine: 1–3 ppm
- Total Alkalinity: 80–120 ppm
- Calcium Hardness: 200–400 ppm
- Cyanuric Acid (Stabilizer): 30–50 ppm

HEALTH SCORE (0–100):
- 90–100: All parameters ideal, no symptoms
- 70–89: 1 parameter slightly off range
- 50–69: 2 parameters off or 1 borderline critical
- 25–49: 1 critical parameter or multiple cautions
- 0–24: Multiple critical parameters or unsafe to swim

CRITICAL THRESHOLDS — always set status = "critical" and health_score ≤ 40:
- Chlorine < 0.5 ppm → unsafe to swim, DO NOT SWIM
- Chlorine > 10 ppm → chemical burn risk; 5–10 ppm → caution only (mild irritation for sensitive swimmers, not a burn risk)
- pH < 7.0 → severe corrosion, eye/skin burns
- pH > 8.0 → chlorine 80% ineffective, urgently address
- Alkalinity < 60 ppm → pH crash risk, unstable
- Alkalinity > 150 ppm → scaling, cloudy water

CYA-ADJUSTED MINIMUM FREE CHLORINE (CRITICAL — apply whenever CYA is known):
- Without CYA or CYA < 10 ppm: min FC = 1 ppm
- CYA 20 ppm: min FC = 1.5 ppm
- CYA 30 ppm: min FC = 2 ppm
- CYA 40 ppm: min FC = 3 ppm
- CYA 50 ppm: min FC = 4 ppm (standard residential)
- CYA 60 ppm: min FC = 5 ppm
- CYA 70–80 ppm: min FC = 6–7 ppm (approach recommending partial drain)
- CYA > 90 ppm: RECOMMEND partial drain — chlorine becomes nearly ineffective
- SLAM/shock target = CYA × 0.40 minimum
When FC is "in range" by absolute ppm but below CYA-adjusted minimum, flag as CAUTION or CRITICAL.

TEMPERATURE ADJUSTMENTS:
- Water temp > 85°F: chlorine depletes 30–50% faster; recommend daily testing and note increased demand
- Water temp < 60°F: chlorine lasts longer; algae growth slows; reduce chlorine target to low end of range
- High temp + low CYA + direct sun = fastest chlorine depletion scenario — address CYA first

LANGELIER SATURATION INDEX (LSI) — include in diagnosis when calcium + alkalinity + pH + temp all known:
- LSI = pH + TF + CF + AF − 12.1 (where TF=temp factor, CF=calcium factor, AF=alkalinity factor)
- LSI < −0.3: water is corrosive — will etch plaster, corrode metal fittings, destroy equipment
- LSI −0.3 to +0.3: balanced (ideal)
- LSI > +0.3: scaling tendency — will form calcium deposits, cloud water, clog filters
- Include a brief LSI assessment in why_this_works when data is sufficient

DIAGNOSIS RULES:
- Cloudy water → low chlorine OR dirty filter OR high calcium OR poor circulation
- Green water → chlorine < 1 ppm = algae bloom, CRITICAL; SLAM target = CYA × 0.40 ppm
- Strong chlorine smell → chloramines (combined chlorine) — needs shock treatment, not more chlorine
- Eye/skin irritation → pH out of range or chloramine buildup
- Scaling on surfaces → calcium hardness > 400 OR pH > 7.8 OR LSI > +0.5
- Slight smell + low chlorine + cloudy → combined issue requiring shock and pH correction
- FC "looks OK" but CYA is high → effective FC may be dangerously low — apply CYA-adjusted minimum
- Brown/rust stains on walls or floor → iron or copper metals oxidizing; use sequestrant (Metal Magic, Jack's Magic), do NOT shock first
- Blue/green stains on plaster → copper from heater corrosion or copper algaecide; sequestrant required; check pH (low pH corrodes copper)
- Milky/white cloudy despite balanced chemistry → calcium micro-crystals; check LSI, may need clarifier + filter cleaning
- Foamy water → body oils/lotions/algaecide residue; enzyme treatment + non-chlorine shock
- Black or dark spots on plaster → black algae; most resistant — requires 3× scrubbing with wire brush + CYA-adjusted SLAM + algaecide

METAL STAIN PROTOCOL (include when stains are mentioned in symptoms):
- Never shock before treating metal stains — oxidation will make staining permanent
- Test for metals: add sequestrant first (chelating agent), run filter continuously
- Maintain pH 7.2–7.4 and low chlorine (1–2 ppm) while treating metals
- Ascorbic acid test: if rubbing vitamin C tablet on stain clears it = iron; if not = copper or manganese

CHEMICAL CONFLICT WARNINGS (always include if relevant in mistakes_to_avoid):
- NEVER mix Cal-Hypo and trichlor (solid chlorines) — explosive reaction
- Never add algaecide within 24h of shocking — both are wasted
- Never add muriatic acid and sodium hypochlorite near each other — chlorine gas
- When lowering alkalinity with acid, aerate afterward to allow CO₂ to offgas and prevent pH rebound

CHEMISTRY PRIORITY ORDER (NEVER violate — this is critical science):
1. Fix alkalinity first (buffers pH, controls stability)
2. Fix pH second (affects chlorine effectiveness)
3. Fix chlorine/sanitizer last (now works efficiently at correct pH)

CHEMICAL DOSING (calculate precisely for the given pool size):
- LOWER pH: Muriatic acid (31.45%): baseline 20 fl oz per 10,000 gal lowers pH by ~0.2 AT a baseline Total Alkalinity of ~100 ppm.
  TA-DEPENDENCY (apply always — this is real acid-base buffering chemistry, not optional): required acid dose scales roughly
  linearly with current TA, because TA is the water's buffering capacity against pH change. If current TA is above 100 ppm,
  scale the dose up proportionally (e.g. TA=150 → use ~50% more acid than baseline); if TA is below 100 ppm, scale the dose
  down proportionally (e.g. TA=70 → use ~30% less). Always state the assumption ("based on your current TA of X ppm") and
  recommend retesting after 2–4 hours before adding more, since acid demand varies pool to pool.
  OR Dry acid (sodium bisulfate): 12 oz per 10,000 gal lowers pH by ~0.2 (same TA-dependency applies)
- RAISE pH: Soda ash (sodium carbonate): 6 oz per 10,000 gal raises pH by ~0.2 (also raises TA by ~5 ppm as a side effect — factor this in if TA is already near the top of range)
- RAISE alkalinity: Baking soda (sodium bicarbonate): 1.5 lbs per 10,000 gal raises TA by ~10 ppm (does not meaningfully change pH)
- LOWER alkalinity: Muriatic acid: ~25 fl oz per 10,000 gal lowers TA by ~10 ppm — dose in small increments, aerate afterward (running the pump/fountains for several hours) to let CO₂ off-gas and prevent pH from rebounding upward afterward
- RAISE chlorine (regular): Liquid chlorine (10%): 12 fl oz per 10,000 gal raises 1 ppm; use 10 fl oz for 12.5% pool store liquid chlorine
- SHOCK/RAISE chlorine fast: Cal-Hypo (73%): 1 lb per 10,000 gal raises ~7 ppm; use at dusk. Note: cal-hypo also raises calcium hardness by ~2–3 ppm per 1 ppm FC added — factor this in for pools already near the top of the calcium hardness range
  OR Leslie's Power Powder Plus 73: same dosing
- LOWER chlorine: Dilution or sodium thiosulfate 2 oz per 10,000 gal per 1 ppm reduction
- RAISE cyanuric acid: Stabilizer (cyanuric acid granules): 13 oz per 10,000 gal raises ~10 ppm (place in skimmer sock; takes 5–7 days to register)
- LOWER cyanuric acid: Partial drain and refill (no chemical fix)
- RAISE calcium hardness: Calcium chloride dihydrate (77%): 22 oz per 10,000 gal raises ~10 ppm (dissolve in a bucket of water first before adding — highly exothermic, and never add water to the chemical, always chemical to water)

SAFETY RULES (always include relevant ones in mistakes_to_avoid):
- NEVER mix chemicals directly — add each to water separately
- ALWAYS add chemicals TO water, never water to chemicals (acid)
- Wait 2–4 hours between major adjustments — always retest
- Run pump at full speed during and after all chemical additions
- Add muriatic acid by diluting in a bucket first, pour around perimeter
- Never add shock and algaecide at the same time
- Shock at dusk — UV destroys chlorine
- Do NOT let anyone swim when chlorine > 5 ppm or any reading is CRITICAL

COMBINED CHLORINE / CHLORAMINE DIAGNOSIS (apply whenever Total Chlorine is provided):
- Combined Chlorine (CC) = Total Chlorine − Free Chlorine
- CC > 0.5 ppm: chloramine buildup — causes strong chlorine smell, eye/skin irritation, and reduced sanitization
- CC > 0.5 ppm → BREAKPOINT CHLORINATION required: shock to FC = CC × 10 + 2 ppm above current FC
  Example: CC = 1.0 ppm → shock to current FC + 12 ppm (i.e. if FC is 2, shock to 14 ppm FC)
- Breakpoint shock must be done at dusk with pump running 24/7
- After breakpoint shock, CC should drop to ≤ 0.2 ppm within 24h
- Regular chlorine addition will NOT fix chloramines — only superchlorination above the breakpoint works
- Always include CC in diagnosis if provided; high CC is a critical finding affecting swimmer health

PHOSPHATE ANALYSIS (apply whenever phosphate level is provided):
- Phosphates are algae nutrients — they do not directly harm swimmers but deplete chlorine faster
- Phosphate < 100 ppb: no concern
- Phosphate 100–500 ppb: moderate — phosphate remover optional but beneficial
- Phosphate > 500 ppb: high — algae will thrive even with adequate chlorine; recommend phosphate remover
- Phosphate > 1,000 ppb: very high — urgent; pool will be nearly impossible to keep clear without removal
- Phosphate remover dose: lanthanum-based, ~1 qt per 10,000 gal for up to 1,000 ppb; follow product label
- After adding phosphate remover: filter will clog fast — backwash/clean within 24–48 hours
- Phosphates come from: leaves, fertilizer runoff, swimmer waste, biguanide products, some algaecides

SALT WATER / SWG POOL CONSIDERATIONS (apply when pool type is SALT):
- Salt chlorine generators (SWG) produce hypochlorous acid from dissolved salt (NaCl)
- Ideal salt level: 2,700–3,400 ppm (most generators; check manufacturer spec)
- Salt < 2,500 ppm: SWG will shut down or under-produce — add pool salt (sodium chloride)
- Salt > 4,000 ppm: can damage SWG cell, corrosive to metal fittings — partial drain required
- If salt level is provided: flag if out of 2,700–3,400 ppm range and include in action plan
- SWG pools trend toward HIGH pH — electrolysis releases hydrogen gas, raising pH 0.1–0.2/day
- SWG pools need lower TA (60–80 ppm) to slow pH rise — adjust soda ash / acid accordingly
- Do NOT add trichlor (dichloro, trichloro) — will add CYA rapidly and void SWG cell warranty
- For SWG pools, use liquid chlorine or sodium hypochlorite to boost if needed — no solid pucks
- Calcium hardness is critical for SWG cells — low CH causes electrolysis to pull calcium from cell
- When pH consistently rises >0.2/day, suspect high TA or CO₂ off-gassing from jets — run aeration

RESPONSE FORMAT — return ONLY valid JSON, no markdown, no text outside JSON:
{
  "status": "safe" | "caution" | "critical",
  "health_score": (integer 0–100),
  "diagnosis": "One clear sentence describing the primary water issue or confirmation it is safe",
  "confidence": "low" | "medium" | "high",
  "key_causes": ["cause 1 with brief explanation", "cause 2"],
  "immediate_action_plan": [
    "Step 1 — [What to fix]: [Exact instruction with calculated quantity for THIS pool size]. [Wait time if applicable].",
    "Step 2 — [Next fix]: [Exact instruction].",
    "Step 3 — [Final step]: [Exact instruction]."
  ],
  "chemical_dosing_guide": [
    {
      "chemical": "Product name (e.g. Muriatic Acid OR Soda Ash)",
      "amount": "Exact calculated amount for this specific pool (e.g. 30 fl oz for 15,000 gal pool)",
      "how_to_apply": "Step-by-step application method. Include pump instructions and wait time."
    }
  ],
  "timeline": "What the pool owner should expect over the next 24–48 hours after following the plan",
  "preventative_alerts": [
    "Specific future risk based on current data (e.g. low CYA means chlorine will deplete faster in sunlight)"
  ],
  "mistakes_to_avoid": [
    "Specific mistake relevant to THIS situation (e.g. Do NOT add shock before lowering pH — it will be wasted)"
  ],
  "conflicts_detected": [
    "Any dangerous chemical combination risk specific to this pool's situation — empty array [] if none"
  ],
  "why_this_works": "2–3 sentences explaining the chemistry reasoning. Include LSI assessment if calcium/alkalinity/pH/temp are all known.",
  "safety_notes": "Critical warnings if water is unsafe to swim in, or 'None — water is safe to swim' if all readings are acceptable",
  "next_test_days": (integer 1–14) how many days until the owner should retest. Logic: status=critical → 1, status=caution and active dosing → 2, status=caution stable → 4, status=safe and temp>85°F → 5, status=safe and temp≤85°F → 7. Reduce by 1 if phosphates high or CYA out of range. Never less than 1 or more than 14.,
  "treatment_summary": "One sentence description of this pool's current treatment focus — e.g. 'Raising alkalinity to stabilize pH and restoring chlorine to safe levels.' or 'Water is balanced — maintain weekly testing and keep CYA between 30–50 ppm.' This appears on the pool trend dashboard."
}`

function getExperienceInstruction(level?: string | null): string {
  if (level === 'beginner') {
    return '\nAUDIENCE: Beginner pool owner. Use plain language, define chemistry terms briefly, avoid jargon. Explain WHY each step matters in simple terms.'
  }
  if (level === 'expert') {
    return '\nAUDIENCE: Experienced pool professional. Use technical terminology freely. Skip basic explanations. Focus on precision, efficiency, and edge cases.'
  }
  return '\nAUDIENCE: Intermediate pool owner. Balance clarity with detail. Mention the chemistry briefly without over-explaining.'
}

export async function analyzeWater(input: AnalyzeInput): Promise<WaterAnalysis> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

  const databaseContext = buildPoolContext(input)
  const experienceInstruction = getExperienceInstruction(input.experienceLevel)

  const isSaltPool = input.poolType === 'SALT'
  const poolTypeLabel = isSaltPool ? 'Salt Water (SWG — Salt Chlorine Generator)' : 'Chlorine (traditional)'

  const patternSummary = input.recentTests && input.recentTests.length >= 2
    ? detectPatterns(input.recentTests)
    : ''

  const trendSection = input.recentTests && input.recentTests.length > 0
    ? `\nHISTORICAL TREND (last ${input.recentTests.length} tests, newest first):\n` +
      input.recentTests.map((t) =>
        `  ${t.date}: Cl=${t.chlorine} ppm, pH=${t.pH}, TA=${t.alkalinity} ppm [${t.status}]`
      ).join('\n') +
      patternSummary +
      '\n  → Use the pattern analysis above to inform your diagnosis. If a drift or recurring issue is detected, address the root cause in your immediate_action_plan, not just the current reading.\n'
    : ''

  const poolData = `
${databaseContext}
${trendSection}
${experienceInstruction}

POOL PROFILE:
- Pool size: ${input.gallons.toLocaleString()} gallons
- Pool type: ${poolTypeLabel}${isSaltPool ? '\n- IMPORTANT: This is a SALT pool — apply SWG-specific advice above, do NOT recommend trichlor or dichlor pucks' : ''}

WATER TEST RESULTS:
- Free Chlorine: ${input.chlorine} ppm
- Total Chlorine: ${input.totalChlorine != null ? `${input.totalChlorine} ppm` : 'Not tested'}${input.totalChlorine != null ? ` → Combined Chlorine (CC) = ${Math.max(0, input.totalChlorine - input.chlorine).toFixed(1)} ppm${(input.totalChlorine - input.chlorine) > 0.5 ? ' ⚠ CHLORAMINE PROBLEM — breakpoint shock required' : ''}` : ''}
- pH: ${input.pH}
- Total Alkalinity: ${input.alkalinity} ppm
- Calcium Hardness: ${input.calciumHardness != null ? `${input.calciumHardness} ppm` : 'Not tested'}
- Cyanuric Acid (Stabilizer): ${input.cyanuricAcid != null ? `${input.cyanuricAcid} ppm` : 'Not tested'}
- Phosphates: ${input.phosphates != null ? `${input.phosphates} ppb${input.phosphates > 500 ? ' ⚠ HIGH — algae fuel present' : input.phosphates > 100 ? ' — moderate' : ''}` : 'Not tested'}
- Salt Level: ${input.saltLevel != null ? `${input.saltLevel} ppm${input.saltLevel < 2500 ? ' ⚠ LOW — SWG may shut down' : input.saltLevel > 4000 ? ' ⚠ HIGH — risk of cell damage' : ' — in range'}` : 'Not tested'}
- Water Temperature: ${input.temperature != null ? `${input.temperature}°F` : 'Not provided'}
- Water Clarity: ${input.waterClarity ?? 'Not observed'}
- Odor: ${input.odor ?? 'None reported'}
- Symptoms: ${input.symptoms?.trim() || 'None reported'}

The database context above contains pre-calculated dosing amounts for this exact pool size.
Use those quantities in your chemical_dosing_guide and immediate_action_plan.
Synthesize all the reference data above into the best possible diagnosis and action plan.`

  let result

  if (input.imageBase64) {
    const resolvedMime: SupportedMime = SUPPORTED_MIME_TYPES.includes(input.imageMimeType as SupportedMime)
      ? (input.imageMimeType as SupportedMime)
      : 'image/jpeg'
    const imagePart = {
      inlineData: {
        data: input.imageBase64,
        mimeType: resolvedMime,
      },
    }
    result = await withTimeout(
      model.generateContent([
        SYSTEM_PROMPT,
        '\n\nThe user has uploaded a photo of their test strip. Read the color values from the test strip image to determine chemical levels, then combine with any manually entered data below to produce your analysis.',
        poolData,
        imagePart,
      ]),
      25_000,
      'Water analysis'
    )
  } else {
    result = await withTimeout(
      model.generateContent([SYSTEM_PROMPT, poolData]),
      25_000,
      'Water analysis'
    )
  }

  const text = result.response.text()
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('AI returned an unexpected format. Please try again.')

  const analysis = JSON.parse(jsonMatch[0]) as WaterAnalysis

  if (!['safe', 'caution', 'critical'].includes(analysis.status)) {
    throw new Error('AI returned an invalid status value.')
  }
  if (!['low', 'medium', 'high'].includes(analysis.confidence)) {
    analysis.confidence = 'medium'
  }
  if (typeof analysis.health_score !== 'number' || analysis.health_score < 0 || analysis.health_score > 100) {
    analysis.health_score = analysis.status === 'safe' ? 85 : analysis.status === 'caution' ? 60 : 30
  }
  if (!Array.isArray(analysis.key_causes)) analysis.key_causes = []
  if (!Array.isArray(analysis.immediate_action_plan)) analysis.immediate_action_plan = []
  if (!Array.isArray(analysis.chemical_dosing_guide)) analysis.chemical_dosing_guide = []
  if (!Array.isArray(analysis.preventative_alerts)) analysis.preventative_alerts = []
  if (!Array.isArray(analysis.mistakes_to_avoid)) analysis.mistakes_to_avoid = []
  if (!Array.isArray(analysis.conflicts_detected)) analysis.conflicts_detected = []
  if (!analysis.timeline) analysis.timeline = 'Retest in 4–6 hours after adding chemicals.'
  if (!analysis.why_this_works) analysis.why_this_works = ''
  if (!analysis.safety_notes) analysis.safety_notes = 'None — water is safe to swim'

  // Validate + clamp new fields
  if (typeof analysis.next_test_days !== 'number' || isNaN(analysis.next_test_days)) {
    analysis.next_test_days = analysis.status === 'critical' ? 1 : analysis.status === 'caution' ? 3 : 7
  }
  analysis.next_test_days = Math.max(1, Math.min(14, Math.round(analysis.next_test_days)))
  if (!analysis.treatment_summary) {
    analysis.treatment_summary = analysis.status === 'safe'
      ? 'Water is balanced — maintain your regular testing schedule.'
      : analysis.diagnosis
  }

  return analysis
}

// Brand-specific color calibration, generated from lib/stripBrandColors.ts —
// the SAME data structure that renders the customer-visible color chart in
// the test-strip scan UI, so the model is anchored to the exact swatch
// values/hex codes the user sees on screen, not a separately-maintained copy.
function buildCalibrationText(chart: BrandChart): string {
  const lines = [
    `BRAND: ${chart.name}`,
    chart.padOrder ? `PAD ORDER (top to bottom on strip): ${chart.padOrder}` : null,
    chart.note,
    ...chart.params.map((p) => {
      const swatchStr = p.swatches
        .map((s) => `${s.value}${p.unit ? ' ' + p.unit : ''}=${s.hex}${s.ideal ? ' (IDEAL)' : ''}`)
        .join(', ')
      return `${p.label} pad hex reference: ${swatchStr}`
    }),
  ].filter(Boolean)
  return '\n' + lines.join('\n')
}

const STRIP_BRAND_CALIBRATION: Record<string, string> = Object.fromEntries(
  Object.entries(STRIP_BRAND_CHARTS).map(([key, chart]) => [key, buildCalibrationText(chart)])
)

export interface StripScanResult extends Partial<AnalyzeInput> {
  photo_quality?: 'good' | 'fair' | 'poor'
  low_confidence_params?: string[]
}

const SUPPORTED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'] as const
type SupportedMime = typeof SUPPORTED_MIME_TYPES[number]

export async function analyzeTestStripImage(
  imageBase64: string,
  brand?: string | null,
  rawMimeType?: string | null,
): Promise<StripScanResult> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

  const mimeType: SupportedMime = SUPPORTED_MIME_TYPES.includes(rawMimeType as SupportedMime)
    ? (rawMimeType as SupportedMime)
    : 'image/jpeg'

  const imagePart = {
    inlineData: { data: imageBase64, mimeType },
  }

  const brandKey = (brand ?? 'generic').toLowerCase().replace(/[^a-z]/g, '')
  const calibration =
    STRIP_BRAND_CALIBRATION[brandKey] ??
    STRIP_BRAND_CALIBRATION[
      Object.keys(STRIP_BRAND_CALIBRATION).find((k) => brandKey.includes(k)) ?? 'generic'
    ] ??
    STRIP_BRAND_CALIBRATION.generic

  const prompt = `You are an expert pool test strip color reader with professional-grade color calibration knowledge. Analyze this test strip image with maximum accuracy.

${calibration}

UNIVERSAL READING INSTRUCTIONS:
1. Identify the brand and pad positions from the calibration table above
2. For each pad, directly compare the photographed pad color against the hex reference values given for THIS brand and parameter — treat each "value=hex" pair as a fixed anchor point, find which reference hex the photographed color is closest to (or interpolate between the two nearest anchors), and do not fall back on generic/memorized color assumptions instead of these specific values
3. Correct for image lighting: if photo is warm/yellow-tinted, shift readings slightly cooler; if blue-tinted, shift warmer
4. Wet strips shift color slightly — if the image looks wet/shiny, the true value is typically 5–10% lower on concentration scales
5. If a pad is physically absent from this strip model, return null
6. If a pad's photographed color falls roughly halfway between two reference hex anchors, return the average of those two values (e.g. between 2 and 3 ppm → return 2.5)
7. Never guess wildly — return null only if the pad is genuinely unreadable (out of frame, obscured, or missing)

SCIENTIFIC VALIDATION:
- Cross-check your readings for internal consistency: if pH is 8.4+ and chlorine reads high, confirm — high pH makes chlorine ineffective so high FC with high pH is physically plausible but unusual
- If chlorine reads 0 and the strip shows typical pad positions, verify the pad is not just faded/overexposed
- CYA pads are notoriously difficult to read accurately — if uncertain, return the midpoint of the two closest values
- If the image is blurry, very dark, heavily shadowed, or the strip pads are folded/obscured, set photo_quality to "poor" and return null for any pad you cannot read with confidence
- If lighting is good and pads are clearly visible, set photo_quality to "good"

Return ONLY valid JSON, no markdown, no other text:
{
  "pH": number or null,
  "chlorine": number or null,
  "alkalinity": number or null,
  "calciumHardness": number or null,
  "cyanuricAcid": number or null,
  "photo_quality": "good" | "fair" | "poor",
  "low_confidence_params": ["list any parameter names where you were uncertain between two adjacent values"]
}`

  const result = await withTimeout(
    model.generateContent([prompt, imagePart]),
    25_000,
    'Strip scan'
  )

  const text = result.response.text()
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) return {}

  const parsed = JSON.parse(jsonMatch[0]) as Record<string, unknown>

  // Validate and clamp values to realistic ranges
  const clamp = (v: unknown, min: number, max: number): number | undefined => {
    if (v === null || v === undefined || typeof v !== 'number' || isNaN(v)) return undefined
    return Math.min(max, Math.max(min, v))
  }

  const qualityValues = ['good', 'fair', 'poor']
  const photoQuality = qualityValues.includes(parsed.photo_quality as string)
    ? (parsed.photo_quality as 'good' | 'fair' | 'poor')
    : 'fair'

  const lowConfidence = Array.isArray(parsed.low_confidence_params)
    ? (parsed.low_confidence_params as string[]).filter((p) => typeof p === 'string')
    : []

  return {
    pH: clamp(parsed.pH, 6.0, 9.0),
    chlorine: clamp(parsed.chlorine, 0, 20),
    alkalinity: clamp(parsed.alkalinity, 0, 300),
    calciumHardness: clamp(parsed.calciumHardness, 0, 800),
    cyanuricAcid: clamp(parsed.cyanuricAcid, 0, 300),
    photo_quality: photoQuality,
    low_confidence_params: lowConfidence,
  }
}
