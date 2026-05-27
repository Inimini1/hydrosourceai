/**
 * HydroSource — Pool Diagnostics & Symptom Pattern Database
 *
 * A structured knowledge base mapping visual symptoms, chemical patterns,
 * and environmental factors to root causes and treatment protocols.
 *
 * Sources: IPSSA service technician certification manuals, PHTA educational
 * materials, Chemtrol water chemistry reference, BioGuard technical bulletins,
 * and documented field case studies from pool service professionals.
 */

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 1 — VISUAL SYMPTOM → DIAGNOSIS PATTERNS
// ─────────────────────────────────────────────────────────────────────────────

export interface DiagnosticPattern {
  symptom: string
  probable_causes: Array<{ cause: string; probability: 'high' | 'medium' | 'low'; confirming_test?: string }>
  immediate_risk: 'none' | 'low' | 'medium' | 'high' | 'critical'
  primary_treatment: string
  secondary_treatment?: string
  common_mistakes: string[]
  expected_recovery_time: string
}

export const VISUAL_DIAGNOSTIC_PATTERNS: DiagnosticPattern[] = [
  {
    symptom: 'Water is clear emerald or bright green',
    probable_causes: [
      { cause: 'Algae bloom — chlorine depleted below 1 ppm, algae colonized', probability: 'high', confirming_test: 'FC < 1 ppm confirms algae; test for CC as well' },
      { cause: 'Very high copper content from copper algaecide or corroded heater', probability: 'medium', confirming_test: 'If FC is normal (1–3 ppm) and green persists, test for metals' },
    ],
    immediate_risk: 'critical',
    primary_treatment: 'ALGAE BLOOM PROTOCOL: 1) Brush all surfaces vigorously to break biofilm. 2) Shock to 30 ppm FC using Cal-Hypo 73% (4.3 lbs per 10,000 gal). 3) Run filter 24/7. 4) Add polyquat algaecide after FC drops below 5 ppm. 5) Vacuum dead algae to waste. 6) Backwash filter every 4–6 hours until clear.',
    secondary_treatment: 'If copper: add metal sequestrant immediately, lower pH to 7.2, do NOT shock until metals are sequestered',
    common_mistakes: [
      'Adding chlorine without shocking to break point — low doses feed algae rather than kill it',
      'Using algaecide before shocking — algaecide is deactivated by chlorine shock; always shock first',
      'Not brushing before shocking — algae has a protective biofilm that must be broken first',
      'Checking FC and finding "normal" levels — algae can exist with low effective chlorine when CYA is high',
    ],
    expected_recovery_time: '24–96 hours depending on severity; vacuum to waste when algae dies (turns gray/white)',
  },
  {
    symptom: 'Water is dark green or swamp-like',
    probable_causes: [
      { cause: 'Severe algae bloom — pool completely overwhelmed, filter likely clogged', probability: 'high' },
      { cause: 'Copper + algae combination', probability: 'medium' },
    ],
    immediate_risk: 'critical',
    primary_treatment: 'SEVERE ALGAE PROTOCOL: 1) Test pH first — must be 7.2–7.4. 2) Double shock: add 8+ lbs Cal-Hypo per 10,000 gal. 3) Run pump 24/7. 4) Brush aggressively every 2–4 hours. 5) Backwash every 2–4 hours. 6) Consider draining 50% and refilling if no improvement after 48 hours — it may be faster.',
    common_mistakes: [
      'Trying to save severely green pool without considering drain — sometimes refill is faster and cheaper',
      'Underestimating chemical dose — half-doses waste money and time',
      'Not cleaning filter before treating — clogged filter prevents circulation',
    ],
    expected_recovery_time: '3–7 days minimum; drain/refill may be necessary in extreme cases',
  },
  {
    symptom: 'Water is hazy or milky white/cloudy',
    probable_causes: [
      { cause: 'Low chlorine — particles not oxidized, filter cannot remove microscopic particles', probability: 'high' },
      { cause: 'High pH or high alkalinity — calcium carbonate precipitation making water cloudy', probability: 'high', confirming_test: 'pH > 7.8 or TA > 150 confirms chemical cloudiness' },
      { cause: 'Poor filtration — filter needs cleaning or is undersized for pool', probability: 'medium' },
      { cause: 'High calcium hardness — water is oversaturated, calcium precipitating', probability: 'medium', confirming_test: 'CH > 400 ppm' },
      { cause: 'Recently added a chemical that clouded the water temporarily', probability: 'low' },
    ],
    immediate_risk: 'medium',
    primary_treatment: 'DIAGNOSIS FIRST: Test all parameters. If chlorine low → shock. If pH/TA high → lower pH with acid, aerate. If filter issue → clean/backwash. If chemistry is balanced → add clarifier and run filter continuously.',
    secondary_treatment: 'Flocculant for rapid clearing: add 2 oz per 5,000 gal, turn off pump for 24 hours, vacuum to waste (not back through filter)',
    common_mistakes: [
      'Adding clarifier without addressing the root cause — symptoms will return',
      'Not cleaning the filter — a dirty filter recirculates particles',
      'Adding chlorine shock to a high-pH cloudy pool — shock is ineffective at high pH and won\'t clear the water',
    ],
    expected_recovery_time: '12–48 hours with correct treatment; 4–6 hours with flocculant',
  },
  {
    symptom: 'Water has yellow or mustard tint',
    probable_causes: [
      { cause: 'Mustard algae — yellow/green algae strain that grows on walls and floor, resistant to normal chlorine', probability: 'high' },
      { cause: 'Iron in water — yellow-brown tint from oxidized iron', probability: 'medium', confirming_test: 'If FC is normal and yellow persists after shock, test metals (iron)' },
      { cause: 'Pollen — seasonal, typically settles on surface and floor', probability: 'medium' },
    ],
    immediate_risk: 'medium',
    primary_treatment: 'MUSTARD ALGAE PROTOCOL (if algae confirmed): 1) Remove floats, toys, and accessories — brush them with chlorine solution. 2) Brush walls and floor aggressively. 3) Shock to 20 ppm. 4) Add quaternary algaecide (NOT polyquat — mustard-specific formula). 5) Vacuum to waste. 6) Backwash filter and clean cartridge. Note: mustard algae is resistant and recurs — treat equipment and pool simultaneously.',
    common_mistakes: [
      'Treating mustard algae with standard polyquat algaecide — quaternary ammonium compound is required',
      'Not treating pool accessories — mustard algae reinfects the pool from floats, ladders, and toys',
      'Declaring victory too soon — mustard algae requires 2–3 treatment cycles',
    ],
    expected_recovery_time: '3–5 days; may require repeat treatment cycle after 1 week',
  },
  {
    symptom: 'Strong "pool smell" — pungent chlorine odor',
    probable_causes: [
      { cause: 'Chloramine buildup — combined chlorine from chlorine reacting with ammonia in sweat, urine, sunscreen', probability: 'high', confirming_test: 'Test CC (total Cl − free Cl). If CC > 0.3 ppm, breakpoint chlorination needed' },
      { cause: 'Paradoxically, this smell means NOT ENOUGH effective chlorine — chloramines form when FC is depleted', probability: 'high' },
    ],
    immediate_risk: 'medium',
    primary_treatment: 'BREAKPOINT CHLORINATION: Add 10x the CC reading in free chlorine. Example: CC = 0.5 ppm → add 5 ppm FC (2.6 lbs Cal-Hypo per 10,000 gal). This destroys chloramines. Non-chlorine shock (MPS) can also oxidize chloramines.',
    common_mistakes: [
      'Adding more tablets when the smell is present — tablets will not reach breakpoint; only shock works',
      'Thinking "strong chlorine smell = too much chlorine" — this is the opposite; it means ineffective chlorine',
    ],
    expected_recovery_time: '4–8 hours after correct shock dose',
  },
  {
    symptom: 'Eye irritation or burning eyes after swimming',
    probable_causes: [
      { cause: 'pH out of range — too low (<7.2) or too high (>7.8) causes eye irritation', probability: 'high', confirming_test: 'Test pH first' },
      { cause: 'Chloramine buildup — combined chlorine causes eye irritation', probability: 'high', confirming_test: 'Test CC — if > 0.3 ppm, chloramines present' },
      { cause: 'Very high free chlorine > 5 ppm', probability: 'medium', confirming_test: 'Test FC' },
    ],
    immediate_risk: 'medium',
    primary_treatment: 'STEP 1: Test pH — bring to 7.4–7.6. STEP 2: Test CC — if elevated, shock to breakpoint. STEP 3: If chlorine is very high, dilute or wait for natural depletion.',
    common_mistakes: [
      'Assuming high chlorine is the problem — often the pH is wrong or it\'s chloramines',
      'Reducing chlorine when chloramines are the issue — this makes it worse',
    ],
    expected_recovery_time: '4–8 hours after correction',
  },
  {
    symptom: 'Foaming water',
    probable_causes: [
      { cause: 'Algaecide overdose — most common cause, quaternary ammonium algaecides foam when overused', probability: 'high' },
      { cause: 'Low calcium hardness — "hungry" soft water creates foam', probability: 'medium', confirming_test: 'CH < 150 ppm' },
      { cause: 'Residual soap, cosmetics, or body products from swimmers', probability: 'medium' },
      { cause: 'Overloaded water with organic contaminants (high bather load)', probability: 'low' },
    ],
    immediate_risk: 'low',
    primary_treatment: 'If algaecide: stop adding — foam will dissipate in 24–48 hours. Use non-foaming polyquat in future. If CH low: add calcium chloride. If organic: shock pool and oxidize contaminants. Anti-foam agents are temporary — treat the root cause.',
    common_mistakes: [
      'Adding anti-foam agent without stopping algaecide additions — foam will return',
      'Using cheap foaming algaecide in large quantities',
    ],
    expected_recovery_time: '24–48 hours for algaecide foam; immediate with anti-foam',
  },
  {
    symptom: 'Slimy walls or floor surfaces',
    probable_causes: [
      { cause: 'Biofilm — bacterial colonies forming protective slime layer, indicating very low sanitizer levels', probability: 'high', confirming_test: 'FC likely < 0.5 ppm' },
      { cause: 'Early stage algae colonization on porous surfaces', probability: 'high' },
    ],
    immediate_risk: 'high',
    primary_treatment: 'BRUSH AGGRESSIVELY first — break the biofilm. Shock immediately to 10–20 ppm. Run filter 24/7. Backwash every 4–6 hours. Brush again after 24 hours.',
    common_mistakes: [
      'Not brushing — shock cannot penetrate biofilm, must be physically disrupted first',
      'Adding normal maintenance dose of chlorine — biofilm requires shock-level dosing',
    ],
    expected_recovery_time: '24–72 hours',
  },
  {
    symptom: 'White or gray scale deposits on tiles or waterline',
    probable_causes: [
      { cause: 'High calcium hardness > 400 ppm — calcium carbonate precipitating on surfaces', probability: 'high' },
      { cause: 'High pH > 7.8 combined with normal or high calcium — LSI positive', probability: 'high' },
      { cause: 'High alkalinity > 150 ppm driving pH upward', probability: 'medium' },
    ],
    immediate_risk: 'low',
    primary_treatment: 'Lower pH to 7.2 with acid. Lower TA if above 120. If CH > 400, drain 20–30% and refill. Use scale inhibitor. Scrub existing scale with pumice stone (plaster pools only) or use an acid wash service.',
    common_mistakes: [
      'Adding more calcium when scale is already present',
      'Not addressing pH — scale will continue forming even with lower calcium',
    ],
    expected_recovery_time: 'Existing scale removal: 1–2 hours manual. Prevention: immediate when parameters corrected.',
  },
  {
    symptom: 'Brown, rust, or black stains on pool surfaces',
    probable_causes: [
      { cause: 'Iron staining (orange-brown) — from iron in fill water or corroded equipment', probability: 'high' },
      { cause: 'Manganese staining (purple-black) — from fill water, especially well water', probability: 'medium' },
      { cause: 'Copper staining (blue-green) — from copper algaecide overuse or corroded copper heater', probability: 'medium' },
      { cause: 'Organic staining from leaves, berries, or algae (usually green-brown)', probability: 'medium' },
    ],
    immediate_risk: 'none',
    primary_treatment: 'METAL STAIN PROTOCOL: 1) Test: rub Vitamin C tablet on stain — if it lightens immediately, it\'s a metal stain. 2) Lower chlorine below 1 ppm temporarily. 3) Lower pH to 7.0–7.2. 4) Add ascorbic acid (Vitamin C) 1 lb per 10,000 gal directly to stain area. 5) Add metal sequestrant to lock metals. 6) Gradually raise pH back to 7.4–7.6. 7) Add metal sequestrant weekly to prevent return.',
    secondary_treatment: 'For organic staining: raise chlorine; organic stains bleach out with elevated free chlorine.',
    common_mistakes: [
      'Shocking a pool with metals in the water — oxidizes metals and causes immediate staining',
      'Not testing for metals before adding copper algaecide to an already copper-stained pool',
      'Skipping the metal sequestrant after acid treatment — metals return to solution and stain again',
    ],
    expected_recovery_time: '24–72 hours for acid treatment to remove stains',
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 2 — ALGAE TYPE IDENTIFICATION AND TREATMENT
// ─────────────────────────────────────────────────────────────────────────────

export const ALGAE_TYPES = [
  {
    type: 'Green Algae',
    appearance: 'Bright to dark green water or green coating on surfaces',
    location: 'Free-floating (turns water green) or wall-clinging',
    chlorine_kill_dose_ppm: 20,
    required_fc_minimum: 1.0,
    cya_sensitivity: 'moderate — effective chlorine ratio matters',
    treatment_steps: [
      'Brush all surfaces aggressively to break biofilm',
      'Shock to 20–30 ppm FC (Cal-Hypo preferred)',
      'Run filter 24/7; backwash every 4–6 hours',
      'Add polyquat 60% algaecide once FC drops below 5 ppm',
      'Vacuum dead algae to waste (do not recirculate through filter)',
      'Test and balance chemistry after water clears',
    ],
    prevention: 'Maintain FC above 1 ppm at all times. Shock weekly in summer. Keep CYA at 30–50 ppm to protect chlorine from UV.',
  },
  {
    type: 'Mustard Algae (Yellow Algae)',
    appearance: 'Yellow or yellowish-green patches on walls, steps, and floor; brushes away easily but returns',
    location: 'Shadowed areas of pool — corners, behind stairs, on walls',
    chlorine_kill_dose_ppm: 20,
    required_fc_minimum: 3.0,
    cya_sensitivity: 'high — standard chlorine tablets are ineffective against mustard algae',
    treatment_steps: [
      'Remove all pool accessories and sanitize them separately with chlorine solution',
      'Brush pool aggressively — mustard algae clings loosely to surfaces',
      'Shock to 20 ppm FC using Cal-Hypo',
      'Add a quaternary ammonium algaecide (NOT standard polyquat) labeled for mustard algae',
      'Vacuum to waste',
      'Clean and backwash filter — mustard algae hides in filter media',
      'Keep FC above 3 ppm for 1 week after treatment',
    ],
    prevention: 'Maintain FC above 2 ppm. Use mustard algaecide as preventative in pools prone to this type. Keep pool brushed regularly.',
  },
  {
    type: 'Black Algae',
    appearance: 'Dark blue-green or black spots with a protective waxy outer layer; extremely stubborn',
    location: 'Permanently attached to plaster and concrete surfaces; roots penetrate into porous material',
    chlorine_kill_dose_ppm: 30,
    required_fc_minimum: 5.0,
    cya_sensitivity: 'very high — must account for CYA-adjusted effective chlorine',
    treatment_steps: [
      'Use a stainless steel brush to vigorously scrub spots to break the waxy protective coating',
      'Apply pool chlorine tablets directly on black spots and scrub in',
      'Shock aggressively to 25–30 ppm FC',
      'Add copper-based algaecide (black algae is the only type where copper algaecide is the preferred treatment)',
      'Add metal sequestrant alongside copper algaecide to prevent copper staining',
      'Run filter 24/7 and backwash every 4–6 hours',
      'Repeat treatment weekly until spots are gone — can take 3–6 weeks',
      'In severe cases: acid wash or replastering may be the only permanent solution',
    ],
    prevention: 'Extremely difficult to eradicate — the only true prevention is keeping FC above 3 ppm consistently and brushing regularly. Black algae spores enter pools on swimwear from ocean/lake swimming.',
  },
  {
    type: 'Pink Algae (Pink Biofilm)',
    appearance: 'Pink, slimy deposits in corners and behind fittings',
    location: 'PVC fittings, skimmer baskets, return jets, ladder brackets — plastic parts',
    chlorine_kill_dose_ppm: 10,
    required_fc_minimum: 2.0,
    cya_sensitivity: 'low',
    treatment_steps: [
      'Manually scrub all pink deposits with diluted bleach solution',
      'Remove and clean all accessories, filters, and fittings',
      'Shock to 10 ppm FC',
      'Add polyquat algaecide',
      'Replace old plastic fittings if heavily affected',
    ],
    prevention: 'Maintain chlorine above 1 ppm. Pink biofilm (Methylobacterium or Serratia marcescens) is bacteria, not algae, and thrives when chlorine is inconsistent.',
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 3 — CHEMICAL INTERACTION MATRIX
// Dangerous combinations that pool owners and AI must know
// ─────────────────────────────────────────────────────────────────────────────

export const DANGEROUS_CHEMICAL_COMBINATIONS = [
  {
    chemical_a: 'Trichlor tablets',
    chemical_b: 'Calcium Hypochlorite (Cal-Hypo)',
    risk: 'FIRE AND EXPLOSION',
    description: 'When mixed or stored together, trichlor and cal-hypo react exothermically and can ignite, explode, or produce toxic chlorine gas. NEVER mix these chemicals directly. Never store in the same container or in close proximity.',
    severity: 'critical',
  },
  {
    chemical_a: 'Any chlorine product',
    chemical_b: 'Algaecide (quaternary ammonium or polyquat)',
    risk: 'Deactivation',
    description: 'High chlorine levels (especially after shocking) will rapidly destroy algaecide molecules. Always wait until FC drops below 5 ppm before adding algaecide, or it will be completely ineffective.',
    severity: 'high',
  },
  {
    chemical_a: 'Muriatic acid',
    chemical_b: 'Chlorine shock',
    risk: 'Toxic chlorine gas',
    description: 'Mixing acid and chlorine produces toxic chlorine gas. Never add muriatic acid and chlorine to the same bucket or add within 30 minutes of each other to the pool. Always add acid first, wait, then add chlorine if both are needed.',
    severity: 'critical',
  },
  {
    chemical_a: 'Copper algaecide',
    chemical_b: 'Chlorine shock (without sequestrant)',
    risk: 'Metal staining',
    description: 'Shocking a pool with elevated copper will immediately oxidize the copper, turning water blue-green and staining surfaces. Always add metal sequestrant before shocking if metals are present or if copper algaecide was recently added.',
    severity: 'high',
  },
  {
    chemical_a: 'Multiple chemicals at once',
    chemical_b: 'Any combination',
    risk: 'Unpredictable reactions, chemical waste, potential injury',
    description: 'Never add more than one chemical at a time. Always wait 4–6 hours between major adjustments and retest. Add chemicals to the pool, not together in a bucket.',
    severity: 'high',
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 4 — EQUIPMENT-RELATED SYMPTOMS
// ─────────────────────────────────────────────────────────────────────────────

export const EQUIPMENT_SYMPTOMS = [
  {
    symptom: 'Pool stays cloudy even with correct chemistry',
    likely_cause: 'Filter needs cleaning — a dirty filter cannot remove particles regardless of chemistry',
    action: 'Backwash sand/DE filter (run until sight glass runs clear, typically 2–5 minutes). Clean cartridge filter with filter cleaner. If DE filter: add fresh DE after backwashing (1.5 lbs per 10 sq ft of filter area).',
  },
  {
    symptom: 'pH keeps rising back to 8.0+ despite adding acid',
    likely_cause: 'Alkalinity is too high (> 150 ppm) — it keeps pushing pH up; also common with salt chlorine generators',
    action: 'Lower total alkalinity first using muriatic acid. Target 80–100 ppm. Once TA is correct, pH will hold adjustments.',
  },
  {
    symptom: 'Chlorine disappears within hours of adding it',
    likely_cause: 'Chlorine demand — high combined chlorine, ammonia, or other oxidizable contaminants consuming all added chlorine',
    action: 'Perform breakpoint chlorination — calculate demand, add 10x the chlorine you think you need, run filter overnight. The pool must "break through" the demand before chlorine will hold.',
  },
  {
    symptom: 'Green water despite normal chlorine reading',
    likely_cause: 'CYA too high (> 80 ppm) — chlorine is present but bound to CYA and ineffective at killing algae (chlorine lock)',
    action: 'Calculate effective free chlorine needed: minimum FC = CYA × 0.075. If CYA = 100 ppm, you need FC ≥ 7.5 ppm to have effective sanitization. Consider partial drain to lower CYA.',
  },
  {
    symptom: 'Pump is running but water is not circulating well',
    likely_cause: 'Clogged basket, air leak in suction side, or impeller clogged — chemistry cannot help this',
    action: 'Check and clean pump basket and skimmer basket. Inspect for air bubbles in pump pot window (indicates suction air leak). Check for flow restriction at filter (pressure gauge 10+ psi above normal = cleaning needed).',
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 5 — TREATMENT TIMING AND SCHEDULING REFERENCE
// ─────────────────────────────────────────────────────────────────────────────

export const TREATMENT_SCHEDULE = {
  daily: [
    'Test and adjust free chlorine — add liquid chlorine or check tablet floater',
    'Visually inspect water clarity and color',
    'Empty skimmer and pump baskets',
  ],
  twice_weekly: [
    'Test pH and adjust with acid or soda ash',
    'Skim surface debris',
  ],
  weekly: [
    'Test total alkalinity',
    'Test calcium hardness',
    'Shock with non-chlorine shock (potassium monopersulfate) for oxidation',
    'Add algaecide as preventative (polyquat 30%)',
    'Brush pool walls and floor',
    'Backwash filter if pressure is 8–10 psi above normal',
    'Clean waterline tiles if scale or scum developing',
  ],
  monthly: [
    'Test cyanuric acid (stabilizer)',
    'Test calcium hardness (if not done weekly)',
    'Inspect pool equipment — check for leaks, unusual noises',
    'Clean cartridge filter with filter cleaner',
    'Check salt level (salt pools only)',
  ],
  seasonally: [
    'Opening: full chemical startup sequence, shock heavily, run filter 24/7 until clear',
    'Closing: balance chemistry, shock to 5 ppm, add algaecide, lower water level, add antifreeze if freezing climate',
    'Every 3–5 years: drain and acid wash plaster pools to remove scale and staining',
  ],
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 6 — COST-SAVING PROFESSIONAL TIPS
// ─────────────────────────────────────────────────────────────────────────────

export const PRO_TIPS = [
  {
    tip: 'Buy baking soda from wholesale clubs instead of branded "alkalinity increaser"',
    savings: 'Save 60–70% — Arm & Hammer baking soda is chemically identical to pool alkalinity products',
    applicable_when: 'When raising total alkalinity',
  },
  {
    tip: 'Buy liquid chlorine from pool stores by the gallon instead of trichlor tablets',
    savings: 'Prevents CYA buildup (which requires expensive drain/refill to correct); liquid chlorine adds no CYA',
    applicable_when: 'For routine chlorine maintenance when CYA is already at ideal level',
  },
  {
    tip: 'Shock at dusk, not daytime',
    savings: 'Up to 50% more effective — UV rays destroy 50%+ of unstabilized shock within hours of daylight',
    applicable_when: 'Every time you shock the pool',
  },
  {
    tip: 'Run pump during off-peak electricity hours',
    savings: '30–50% on electricity cost in time-of-use metered areas',
    applicable_when: 'When utility company charges peak/off-peak rates',
  },
  {
    tip: 'Pre-dissolve all granular chemicals before adding to pool',
    savings: 'Prevents bleaching of liner, etching of plaster, and undissolved chemical creating hot spots',
    applicable_when: 'Always, when adding granular chemicals',
  },
  {
    tip: 'Test pool water immediately after heavy rain before adding any chemicals',
    savings: 'Rain dilutes all chemicals, so retesting prevents over-correction',
    applicable_when: 'After any significant rainfall',
  },
  {
    tip: 'Keep pool covered when not in use',
    savings: 'Reduces chlorine demand by up to 70%, reduces evaporation by 95%, reduces debris — major savings in hot climates',
    applicable_when: 'Always possible — even a solar cover saves significantly',
  },
  {
    tip: 'Clean cartridge filters with filter cleaner overnight instead of replacing',
    savings: 'A cartridge lasts 3–5 seasons with proper cleaning vs 1 season without',
    applicable_when: 'Every 4–6 weeks of use',
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 7 — READING COMBINATION PATTERN DIAGNOSTICS
// When multiple parameters are off simultaneously — pattern matching
// ─────────────────────────────────────────────────────────────────────────────

export const MULTI_PARAMETER_PATTERNS = [
  {
    pattern: 'Low FC + Low TA + Low pH',
    likely_cause: 'Heavy rain recently or pool was diluted with fresh water (which is typically acidic and low-mineral)',
    treatment: 'Raise alkalinity to 80–100 ppm first, then pH to 7.4–7.6, then chlorine to 2–3 ppm',
  },
  {
    pattern: 'Normal FC + Cloudy water + High TA + High pH',
    likely_cause: 'Calcium carbonate precipitation — high pH and alkalinity are causing cloudy water from calcium carbonate falling out of solution',
    treatment: 'Lower pH to 7.2 with acid; aerate to off-gas CO2; TA will naturally lower as pH drops. No chlorine addition needed.',
  },
  {
    pattern: 'Normal FC + Persistent algae growth + High CYA',
    likely_cause: 'Chlorine lock — CYA is binding chlorine, making it biologically unavailable despite normal readings',
    treatment: 'Increase FC to 7.5% of CYA level or drain 30–50% of pool volume and refill to dilute CYA',
  },
  {
    pattern: 'High FC + Red/irritated eyes + Low pH',
    likely_cause: 'pH too low — pool water is acidic and irritating. High chlorine is making it more aggressive.',
    treatment: 'Raise pH to 7.4–7.6 as the immediate priority; eyes will clear up as pH normalizes',
  },
  {
    pattern: 'Normal FC + Strong chlorine odor + Red eyes',
    likely_cause: 'High combined chlorine (chloramines) — chlorine reacted with ammonia and is no longer effective or comfortable',
    treatment: 'Test CC (should be 0). If CC > 0.3 ppm, shock to breakpoint (10x the CC level in additional free chlorine)',
  },
  {
    pattern: 'High FC + Cloudy water + Normal pH + Normal TA',
    likely_cause: 'Post-shock cloudiness — dead algae or suspended particles after shock treatment; filter needs to clear them',
    treatment: 'Continue running filter 24/7 and backwash frequently. Add clarifier if needed. This is normal after shock treatment and will clear within 12–48 hours.',
  },
  {
    pattern: 'Normal chemistry across all parameters + Scaling on surfaces',
    likely_cause: 'Langelier Saturation Index (LSI) is positive — water is scaling even though individual parameters look acceptable. Often from high calcium hardness combined with warm water and slightly elevated pH.',
    treatment: 'Calculate LSI. Lower pH slightly to 7.2. Add scale inhibitor. If CH is above 400 ppm, partial drain may be needed.',
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 8 — BATHER SAFETY THRESHOLDS
// ─────────────────────────────────────────────────────────────────────────────

export const BATHER_SAFETY = {
  do_not_swim: [
    { condition: 'Free Chlorine < 0.5 ppm', reason: 'Inadequate sanitization — pathogens including E. coli and Giardia survive', risk: 'Illness' },
    { condition: 'Free Chlorine > 10 ppm', reason: 'Chemical burn risk to skin, eyes, and respiratory tract', risk: 'Injury' },
    { condition: 'pH < 7.0', reason: 'Severely acidic — causes eye burns, skin irritation, and corrodes equipment rapidly', risk: 'Injury' },
    { condition: 'pH > 8.5', reason: 'Chlorine essentially non-functional — unsanitized water', risk: 'Illness' },
    { condition: 'Green or dark water', reason: 'Active algae bloom — potential bacterial contamination', risk: 'Illness' },
    { condition: 'Visible foam or strong chemical odor', reason: 'Indicates chloramine buildup or chemical imbalance', risk: 'Respiratory irritation' },
  ],
  swim_with_caution: [
    { condition: 'Free Chlorine 5–10 ppm', reason: 'May cause mild eye/skin irritation in sensitive individuals' },
    { condition: 'pH 7.0–7.2 or 7.8–8.0', reason: 'Slightly out of range — short exposure acceptable, correct promptly' },
    { condition: 'Slightly cloudy water', reason: 'May indicate developing issue — test and correct before heavy use' },
  ],
  resume_swimming: {
    after_shock_with_cal_hypo: 'Wait until FC drops to 5 ppm or below; typically 4–8 hours with filter running',
    after_acid_addition: '4 hours with pump running and thorough mixing',
    after_algae_treatment: 'Wait until water is clear and FC is 1–5 ppm; typically 24–72 hours',
    after_flocculant: '24 hours minimum — after vacuuming to waste',
  },
}
