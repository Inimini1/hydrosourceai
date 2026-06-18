/**
 * Builds a targeted, data-rich context block from the pool chemistry and
 * diagnostics databases, scoped to what is actually relevant for the specific
 * test input. This is injected into the AI prompt to dramatically improve
 * diagnosis accuracy and dosing precision.
 */

import { AnalyzeInput } from './ai'
import {
  PARAMETER_SPECS,
  CYA_CHLORINE_TABLE,
  CHEMICAL_PRODUCTS,
  DOSING_FORMULAS,
  ADJUSTMENT_SEQUENCE,
  SEASONAL_FACTORS,
  CHLORINE_DEMAND_FACTORS,
  LSI_REFERENCE,
} from './pool-chemistry-db'
import {
  VISUAL_DIAGNOSTIC_PATTERNS,
  ALGAE_TYPES,
  DANGEROUS_CHEMICAL_COMBINATIONS,
  MULTI_PARAMETER_PATTERNS,
  BATHER_SAFETY,
  PRO_TIPS,
} from './pool-diagnostics-db'

/**
 * Look up the factor for a given value using the PHTA step table.
 * Returns the factor for the highest entry whose key is ≤ value.
 */
function lsiTableBelow<T extends Record<string, number>>(
  table: T[],
  keyField: keyof T,
  factorField: keyof T,
  value: number,
): number {
  const sorted = [...table].sort((a, b) => (a[keyField] as number) - (b[keyField] as number))
  let result = sorted[0][factorField] as number
  for (const entry of sorted) {
    if ((entry[keyField] as number) <= value) result = entry[factorField] as number
    else break
  }
  return result
}

/**
 * Calculate Langelier Saturation Index using PHTA lookup tables.
 * Formula: LSI = pH + TF + CF + AF − 12.1
 * All three correction factors (TF, CF, AF) use the PHTA/Taylor C-2005 step tables.
 */
function getLSI(pH: number, tempF: number, calciumHardness: number, alkalinity: number): number {
  const tf = lsiTableBelow(LSI_REFERENCE.temperature_factor,     'temp_f', 'factor', tempF)
  const cf = lsiTableBelow(LSI_REFERENCE.calcium_hardness_factor,'ch_ppm', 'factor', calciumHardness)
  const af = lsiTableBelow(LSI_REFERENCE.alkalinity_factor,      'ta_ppm', 'factor', alkalinity)
  return parseFloat((pH + tf + cf + af - 12.1).toFixed(2))
}

export function buildPoolContext(input: AnalyzeInput): string {
  const lines: string[] = ['═══════════════════════════════════════════════════════']
  lines.push('HydroSource — REFERENCE DATABASE CONTEXT (use this to inform your analysis)')
  lines.push('═══════════════════════════════════════════════════════')
  lines.push('')

  // ── 1. CYA / CHLORINE EFFECTIVENESS ─────────────────────────────────────
  if (input.cyanuricAcid != null) {
    const cya = input.cyanuricAcid
    const entry = CYA_CHLORINE_TABLE.reduce((closest, row) =>
      Math.abs(row.cya_ppm - cya) < Math.abs(closest.cya_ppm - cya) ? row : closest
    )
    const effectiveCL = (cya * 0.075).toFixed(1)
    lines.push('── CYA / CHLORINE EFFECTIVENESS ─────────────────────────────')
    lines.push(`Pool CYA: ${cya} ppm`)
    lines.push(`Minimum effective free chlorine at CYA=${cya}: ${effectiveCL} ppm`)
    lines.push(`Recommended FC target at CYA=${cya}: ${entry.recommended_cl} ppm`)
    lines.push(`Assessment: ${entry.notes}`)
    if (input.chlorine < parseFloat(effectiveCL)) {
      lines.push(`⚠ CHLORINE LOCK RISK: Pool has ${input.chlorine} ppm FC but needs minimum ${effectiveCL} ppm to be effective at CYA=${cya} ppm. This is a primary diagnosis factor.`)
    }
    if (cya > 80) {
      lines.push(`⚠ HIGH CYA ALERT: At ${cya} ppm CYA, chlorine is significantly impaired. Partial drain/refill is the only solution to lower CYA. Chemical lowering is not possible.`)
    }
    lines.push('')
  }

  // ── 1b. COMBINED CHLORINE / CHLORAMINE ANALYSIS ──────────────────────────
  if (input.totalChlorine != null) {
    const cc = Math.max(0, input.totalChlorine - input.chlorine)
    lines.push('── COMBINED CHLORINE (CHLORAMINE) ANALYSIS ──────────────────')
    lines.push(`Free Chlorine: ${input.chlorine} ppm  |  Total Chlorine: ${input.totalChlorine} ppm  |  Combined Chlorine: ${cc.toFixed(1)} ppm`)
    if (cc > 0.5) {
      const breakpointTarget = parseFloat((cc * 10 + 2 + input.chlorine).toFixed(1))
      lines.push(`⚠ CHLORAMINE PROBLEM: CC = ${cc.toFixed(1)} ppm exceeds 0.5 ppm threshold.`)
      lines.push(`  Breakpoint shock target: ${breakpointTarget} ppm FC (= current FC ${input.chlorine} + CC×10+2 = ${(cc * 10 + 2).toFixed(1)} ppm)`)
      lines.push(`  Shock product needed: ${DOSING_FORMULAS.chlorine.shock_dose_to_10ppm(input.gallons, input.chlorine)} — scale up proportionally to reach ${breakpointTarget} ppm`)
      lines.push('  Regular chlorine will NOT fix chloramines — must exceed breakpoint.')
      lines.push('  Cause: swimmer waste (urine, sweat, sunscreen), inadequate circulation, or insufficient shock history')
    } else if (cc > 0.2) {
      lines.push('CC slightly elevated — monitor closely, consider shock if symptoms persist.')
    } else {
      lines.push('CC within acceptable range — no chloramine issue detected.')
    }
    lines.push('')
  }

  // ── 1c. PHOSPHATE ANALYSIS ────────────────────────────────────────────────
  if (input.phosphates != null) {
    lines.push('── PHOSPHATE LEVEL ──────────────────────────────────────────')
    lines.push(`Phosphates: ${input.phosphates} ppb`)
    if (input.phosphates > 1000) {
      lines.push('⚠ VERY HIGH: Urgent phosphate removal required. Algae will thrive despite adequate chlorine.')
      lines.push('  Use lanthanum-based phosphate remover: ~2 qt per 10,000 gal. Clean filter within 24h after.')
    } else if (input.phosphates > 500) {
      lines.push('HIGH: Phosphate remover recommended to prevent chronic algae growth.')
      lines.push('  Use lanthanum-based phosphate remover: ~1 qt per 10,000 gal. Backwash within 48h.')
    } else if (input.phosphates > 100) {
      lines.push('Moderate: Optional phosphate remover. Maintain chlorine above minimum FC.')
    } else {
      lines.push('Low: No action needed for phosphates.')
    }
    lines.push('')
  }

  // ── 1d. SALT LEVEL (SWG POOLS) ────────────────────────────────────────────
  if (input.saltLevel != null) {
    lines.push('── SALT LEVEL (SWG POOL) ────────────────────────────────────')
    lines.push(`Salt: ${input.saltLevel} ppm  |  Ideal: 2,700–3,400 ppm`)
    if (input.saltLevel < 2500) {
      const saltNeeded = Math.round(((2700 - input.saltLevel) / 1000000) * input.gallons * 8.34)
      lines.push(`⚠ LOW SALT: SWG cell may shut down or under-produce chlorine.`)
      lines.push(`  Add approximately ${saltNeeded} lbs of pool-grade sodium chloride (non-iodized).`)
      lines.push('  Dissolve in bucket first; add around perimeter with pump running. Retest in 24h.')
    } else if (input.saltLevel > 4000) {
      lines.push(`⚠ HIGH SALT: Risk of SWG cell damage and metal corrosion. Partial drain required.`)
      const drainPct = Math.round(((input.saltLevel - 3200) / input.saltLevel) * 100)
      lines.push(`  Drain and refill approximately ${drainPct}% of pool water to dilute salt to ~3,200 ppm.`)
    } else {
      lines.push('Salt level in ideal range — SWG operating normally.')
    }
    lines.push('')
  }

  // ── 2. PRECISE DOSING CALCULATIONS FOR THIS POOL ────────────────────────
  const gallons = input.gallons
  lines.push(`── PRECISE DOSING CALCULATIONS FOR ${gallons.toLocaleString()}-GALLON POOL ─────`)

  // Chlorine
  if (input.chlorine < 1) {
    const deficit = 2 - input.chlorine
    lines.push(`FREE CHLORINE: Need to raise by ~${deficit.toFixed(1)} ppm to reach 2 ppm`)
    lines.push(`  → ${DOSING_FORMULAS.chlorine.raise_with_liquid_12_5pct(gallons, deficit)} (pool store standard)`)
    lines.push(`  → OR ${DOSING_FORMULAS.chlorine.raise_with_liquid_10pct(gallons, deficit)} (10% concentration)`)
    lines.push(`  → OR ${DOSING_FORMULAS.chlorine.raise_with_calhypo_73pct(gallons, deficit)}`)
    if (input.chlorine < 0.5) {
      lines.push(`  SHOCK DOSE (to 10 ppm): ${DOSING_FORMULAS.chlorine.shock_dose_to_10ppm(gallons, input.chlorine)}`)
    }
  } else if (input.chlorine > 5) {
    lines.push(`FREE CHLORINE: Too high at ${input.chlorine} ppm — dilution or wait for natural depletion`)
    lines.push(`  → To lower by ${(input.chlorine - 3).toFixed(1)} ppm: ${DOSING_FORMULAS.chlorine.lower_with_thiosulfate(gallons, input.chlorine - 3)}`)
  } else {
    lines.push(`FREE CHLORINE: ${input.chlorine} ppm — within acceptable range`)
  }

  // pH
  const pH = input.pH
  if (pH < 7.2) {
    const unitsUp = parseFloat((7.5 - pH).toFixed(1))
    lines.push(`pH: Need to raise by ${unitsUp} units (${pH} → 7.5)`)
    lines.push(`  → ${DOSING_FORMULAS.pH.raise_with_soda_ash(gallons, unitsUp)}`)
  } else if (pH > 7.6) {
    const unitsDown = parseFloat((pH - 7.4).toFixed(1))
    lines.push(`pH: Need to lower by ${unitsDown} units (${pH} → 7.4)`)
    lines.push(`  → ${DOSING_FORMULAS.pH.lower_with_muriatic(gallons, unitsDown)}`)
    lines.push(`  → OR ${DOSING_FORMULAS.pH.lower_with_dry_acid(gallons, unitsDown)}`)
  } else {
    lines.push(`pH: ${pH} — in ideal range`)
  }

  // Alkalinity
  const alk = input.alkalinity
  if (alk < 80) {
    const ppmNeeded = 100 - alk
    lines.push(`ALKALINITY: Need to raise by ${ppmNeeded} ppm (${alk} → 100 ppm)`)
    lines.push(`  → ${DOSING_FORMULAS.alkalinity.raise_with_baking_soda(gallons, ppmNeeded)}`)
    lines.push('  → IMPORTANT: Fix alkalinity BEFORE adjusting pH')
  } else if (alk > 120) {
    const ppmToLower = alk - 100
    lines.push(`ALKALINITY: Need to lower by ${ppmToLower} ppm (${alk} → 100 ppm)`)
    lines.push(`  → ${DOSING_FORMULAS.alkalinity.lower_with_muriatic(gallons, ppmToLower)}`)
    lines.push('  → Aerate pool after adding acid to off-gas CO2 (run return jets at surface)')
  } else {
    lines.push(`ALKALINITY: ${alk} ppm — in ideal range`)
  }

  // Calcium hardness
  if (input.calciumHardness != null) {
    const ch = input.calciumHardness
    if (ch < 200) {
      const ppmNeeded = 250 - ch
      lines.push(`CALCIUM HARDNESS: Need to raise by ${ppmNeeded} ppm (${ch} → 250 ppm)`)
      lines.push(`  → ${DOSING_FORMULAS.calcium.raise_with_calcium_chloride(gallons, ppmNeeded)}`)
    } else if (ch > 400) {
      lines.push(`CALCIUM HARDNESS: ${ch} ppm — too high. Only solution is partial drain/refill.`)
      lines.push(`  → Drain ${Math.round(((ch - 300) / ch) * 100)}% and refill with fresh water to reach ~300 ppm`)
    } else {
      lines.push(`CALCIUM HARDNESS: ${ch} ppm — in ideal range`)
    }
  }

  // CYA dosing
  if (input.cyanuricAcid != null) {
    const cya = input.cyanuricAcid
    if (cya < 30) {
      const ppmNeeded = 40 - cya
      lines.push(`CYANURIC ACID: Low — need to raise by ${ppmNeeded} ppm (${cya} → 40 ppm)`)
      lines.push(`  → ${DOSING_FORMULAS.cyanuric.raise_with_stabilizer(gallons, ppmNeeded)}`)
      lines.push('  → Takes 5–7 days to fully dissolve. Do not retest for 7 days.')
    } else if (cya > 80) {
      lines.push(`CYANURIC ACID: High at ${cya} ppm — ${DOSING_FORMULAS.cyanuric.lower()}`)
    } else {
      lines.push(`CYANURIC ACID: ${cya} ppm — in acceptable range`)
    }
  }
  lines.push('')

  // ── 3. PARAMETER STATUS DETAILS ─────────────────────────────────────────
  lines.push('── PARAMETER EFFECTS REFERENCE ──────────────────────────────')
  const paramsToDetail: Array<[string, number, number, number]> = [
    ['free_chlorine', input.chlorine, 1, 3],
    ['pH', input.pH, 7.4, 7.6],
    ['total_alkalinity', input.alkalinity, 80, 120],
  ]
  if (input.calciumHardness != null) paramsToDetail.push(['calcium_hardness', input.calciumHardness, 200, 400])
  if (input.cyanuricAcid != null) paramsToDetail.push(['cyanuric_acid', input.cyanuricAcid, 30, 50])

  for (const [key, val, idealMin, idealMax] of paramsToDetail) {
    const spec = PARAMETER_SPECS[key]
    if (!spec) continue
    if (val < idealMin) {
      lines.push(`${spec.name} (${val}${spec.unit ? ' ' + spec.unit : ''}) — BELOW IDEAL:`)
      spec.low_effects.slice(0, 3).forEach((e) => lines.push(`  • ${e}`))
    } else if (val > idealMax) {
      lines.push(`${spec.name} (${val}${spec.unit ? ' ' + spec.unit : ''}) — ABOVE IDEAL:`)
      spec.high_effects.slice(0, 3).forEach((e) => lines.push(`  • ${e}`))
    }
  }
  lines.push('')

  // ── 4. VISUAL SYMPTOM MATCHING ───────────────────────────────────────────
  const symptomText = [input.symptoms, input.waterClarity, input.odor]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  const matchedPatterns = VISUAL_DIAGNOSTIC_PATTERNS.filter((p) => {
    const keywords = p.symptom.toLowerCase()
    return (
      (symptomText.includes('green') && keywords.includes('green')) ||
      (symptomText.includes('cloud') && keywords.includes('cloud')) ||
      (symptomText.includes('yellow') && keywords.includes('yellow')) ||
      (symptomText.includes('smell') && keywords.includes('smell')) ||
      (symptomText.includes('odor') && keywords.includes('odor')) ||
      (symptomText.includes('eye') && keywords.includes('eye')) ||
      (symptomText.includes('foam') && keywords.includes('foam')) ||
      (symptomText.includes('slim') && keywords.includes('slim')) ||
      (symptomText.includes('scale') && keywords.includes('scale')) ||
      (symptomText.includes('stain') && keywords.includes('stain')) ||
      (symptomText.includes('brown') && keywords.includes('brown')) ||
      (symptomText.includes('rust') && keywords.includes('brown'))
    )
  })

  if (matchedPatterns.length > 0) {
    lines.push('── MATCHED SYMPTOM PATTERNS FROM DATABASE ────────────────────')
    matchedPatterns.slice(0, 2).forEach((p) => {
      lines.push(`SYMPTOM: ${p.symptom}`)
      lines.push(`Risk Level: ${p.immediate_risk.toUpperCase()}`)
      lines.push(`Primary Treatment: ${p.primary_treatment}`)
      lines.push(`Common Mistakes to Avoid:`)
      p.common_mistakes.slice(0, 2).forEach((m) => lines.push(`  ✗ ${m}`))
      lines.push(`Expected Recovery: ${p.expected_recovery_time}`)
      lines.push('')
    })
  }

  // ── 4b. METAL STAIN DETECTION ────────────────────────────────────────────
  if (
    symptomText.includes('brown') || symptomText.includes('rust') ||
    symptomText.includes('blue stain') || symptomText.includes('green stain') ||
    symptomText.includes('stain') || symptomText.includes('copper')
  ) {
    lines.push('── METAL STAIN PROTOCOL ─────────────────────────────────────')
    lines.push('⚠ METAL STAIN DETECTED IN SYMPTOMS — follow protocol strictly:')
    lines.push('  1. DO NOT SHOCK pool while stains are present — oxidation permanently sets stains')
    lines.push('  2. Lower chlorine to 1–2 ppm before treatment')
    lines.push('  3. Maintain pH at 7.2 (lower pH = better sequestrant effectiveness)')
    lines.push('  4. Add metal sequestrant: Jack\'s Magic, Metal Magic, or Omni Metal Out')
    if (symptomText.includes('brown') || symptomText.includes('rust')) {
      lines.push('  Brown/rust stain → likely iron (oxidized). Sequestrant dose: 1 qt per 10,000 gal.')
    }
    if (symptomText.includes('blue') || symptomText.includes('copper')) {
      lines.push('  Blue/green stain → likely copper (heater corrosion or copper algaecide). Check heater sacrificial anode.')
    }
    lines.push('  5. Run filter 24/7 for 3–5 days; backwash daily')
    lines.push('  6. Retest and resume normal chemistry after stains clear')
    lines.push('')
  }

  // ── 5. LOW CHLORINE + VISUAL ALGAE CHECK ────────────────────────────────
  if (input.chlorine < 1 || (symptomText.includes('green'))) {
    const algaeType = symptomText.includes('yellow') ? ALGAE_TYPES[1]
      : symptomText.includes('black') ? ALGAE_TYPES[2]
      : ALGAE_TYPES[0]
    // CYA-adjusted SLAM target: max(database_dose, CYA × 0.40) — never less than 30 ppm for black algae
    const cyaAdjustedSlam = input.cyanuricAcid != null
      ? Math.max(algaeType.chlorine_kill_dose_ppm, Math.round(input.cyanuricAcid * 0.40))
      : algaeType.chlorine_kill_dose_ppm
    lines.push(`── ALGAE PROTOCOL (${algaeType.type}) ──────────────────────────────`)
    lines.push(`Kill dose required: ${cyaAdjustedSlam} ppm FC${input.cyanuricAcid != null ? ` (CYA-adjusted: max(${algaeType.chlorine_kill_dose_ppm}, ${input.cyanuricAcid}×0.40))` : ''}`)
    lines.push('Treatment steps:')
    algaeType.treatment_steps.forEach((s, i) => lines.push(`  ${i + 1}. ${s}`))
    lines.push('')
  }

  // ── 6. MULTI-PARAMETER PATTERN MATCHING ──────────────────────────────────
  const matchedMulti = MULTI_PARAMETER_PATTERNS.filter((p) => {
    const pat = p.pattern.toLowerCase()
    const lowFC = input.chlorine < 1
    const highFC = input.chlorine > 5
    const lowTA = input.alkalinity < 80
    const highTA = input.alkalinity > 120
    const lowPH = input.pH < 7.2
    const highPH = input.pH > 7.8
    const highCYA = input.cyanuricAcid != null && input.cyanuricAcid > 80
    const cloudySymptom = symptomText.includes('cloud') || symptomText.includes('hazy')

    if (pat.includes('low fc') && pat.includes('low ta') && pat.includes('low ph')) return lowFC && lowTA && lowPH
    if (pat.includes('normal fc') && pat.includes('cloudy') && pat.includes('high ta') && pat.includes('high ph')) return highTA && highPH && cloudySymptom
    if (pat.includes('normal fc') && pat.includes('persistent algae') && pat.includes('high cya')) return highCYA && symptomText.includes('green')
    if (pat.includes('high fc') && pat.includes('low ph')) return highFC && lowPH
    if (pat.includes('normal chemistry') && pat.includes('scaling')) return symptomText.includes('scale')
    return false
  })

  if (matchedMulti.length > 0) {
    lines.push('── MULTI-PARAMETER PATTERN DETECTED ─────────────────────────')
    matchedMulti.forEach((p) => {
      lines.push(`Pattern: ${p.pattern}`)
      lines.push(`Root Cause: ${p.likely_cause}`)
      lines.push(`Recommended Treatment: ${p.treatment}`)
      lines.push('')
    })
  }

  // ── 7. SAFETY CHECKS ─────────────────────────────────────────────────────
  const safetyViolations = BATHER_SAFETY.do_not_swim.filter((s) => {
    const cond = s.condition
    if (cond.includes('< 0.5') && input.chlorine < 0.5) return true
    if (cond.includes('> 10') && input.chlorine > 10) return true
    if (cond.includes('pH < 7.0') && input.pH < 7.0) return true
    if (cond.includes('pH > 8.5') && input.pH > 8.5) return true
    if (cond.includes('Green') && symptomText.includes('green')) return true
    return false
  })

  if (safetyViolations.length > 0) {
    lines.push('── BATHER SAFETY — DO NOT SWIM CONDITIONS MET ───────────────')
    safetyViolations.forEach((v) => {
      lines.push(`⛔ ${v.condition}: ${v.reason} [Risk: ${v.risk}]`)
    })
    lines.push('')
  }

  // ── 8. DANGEROUS COMBINATIONS TO WARN ABOUT ──────────────────────────────
  const relevantWarnings = DANGEROUS_CHEMICAL_COMBINATIONS.filter((c) => c.severity === 'critical')
  lines.push('── CHEMICAL SAFETY RULES (always include in mistakes_to_avoid) ─')
  relevantWarnings.slice(0, 2).forEach((w) => {
    lines.push(`⚠ ${w.chemical_a} + ${w.chemical_b}: ${w.description}`)
  })
  lines.push('')

  // ── 9. ADJUSTMENT SEQUENCE REMINDER ──────────────────────────────────────
  const outOfRange = [
    input.alkalinity < 80 || input.alkalinity > 120,
    input.pH < 7.4 || input.pH > 7.6,
    input.chlorine < 1 || input.chlorine > 5,
  ]
  if (outOfRange.some(Boolean)) {
    lines.push('── CORRECT ADJUSTMENT ORDER (do not deviate — it wastes chemicals) ─')
    ADJUSTMENT_SEQUENCE.slice(0, 3).forEach((s) => {
      lines.push(`  Step ${s.step}: ${s.parameter} — ${s.reason}`)
    })
    lines.push('')
  }

  // ── 10. TEMPERATURE + LSI ─────────────────────────────────────────────────
  if (input.temperature != null) {
    if (input.temperature > 84) {
      lines.push('── HIGH TEMPERATURE ADVISORY ────────────────────────────────')
      SEASONAL_FACTORS.summer_heat.notes.forEach((n) => lines.push(`  • ${n}`))
      lines.push(`  • At ${input.temperature}°F, chlorine depletes ${CHLORINE_DEMAND_FACTORS.per_degree_above_80f * (input.temperature - 80)} ppm per swimmer per day from heat alone`)
      lines.push('')
    }

    if (input.calciumHardness != null) {
      const lsi = getLSI(input.pH, input.temperature, input.calciumHardness, input.alkalinity)
      lines.push('── LANGELIER SATURATION INDEX (LSI) ─────────────────────────')
      lines.push(`LSI = ${lsi}`)
      if (lsi < -0.5) lines.push('⚠ CORROSIVE water — actively etching plaster, corroding metal. Raise pH, alkalinity, and/or calcium hardness.')
      else if (lsi < -0.3) lines.push('Slightly corrosive — raise calcium hardness or alkalinity to protect surfaces.')
      else if (lsi <= 0.3) lines.push('LSI balanced — water is neither corrosive nor scaling.')
      else if (lsi <= 0.5) lines.push('Slight scaling tendency — expect calcium deposits. Lower pH or alkalinity slightly.')
      else lines.push('⚠ SCALING water — calcium will precipitate, clouding water and clogging equipment. Lower pH and calcium.')
      lines.push('')
    }
  }

  // ── 11. ONE MONEY-SAVING TIP ──────────────────────────────────────────────
  const relevantTip = input.alkalinity < 80
    ? PRO_TIPS[0]
    : input.chlorine < 1
    ? PRO_TIPS[1]
    : PRO_TIPS[2]
  lines.push('── COST-SAVING TIP FOR THIS SITUATION ───────────────────────')
  lines.push(`💡 ${relevantTip.tip}`)
  lines.push(`   Savings: ${relevantTip.savings}`)
  lines.push('')

  // ── 12. RELEVANT CHEMICAL PRODUCTS ──────────────────────────────────────
  lines.push('── RECOMMENDED PRODUCT REFERENCES ───────────────────────────')
  const neededProducts: string[] = []
  if (input.alkalinity < 80) neededProducts.push('Raise total alkalinity')
  if (input.alkalinity > 120) neededProducts.push('Lower alkalinity')
  if (input.pH < 7.2) neededProducts.push('Raise pH')
  if (input.pH > 7.6) neededProducts.push('Lower pH')
  if (input.chlorine < 0.5) neededProducts.push('Shock / superchlorinate')
  if (input.chlorine < 1 && input.chlorine >= 0.5) neededProducts.push('Raise chlorine (maintenance)')
  if (symptomText.includes('green') || symptomText.includes('algae')) neededProducts.push('Algae prevention and treatment')
  if (symptomText.includes('cloud') || symptomText.includes('hazy')) neededProducts.push('Clarifier / flocculant')

  const products = CHEMICAL_PRODUCTS.filter((p) => neededProducts.includes(p.purpose))
  products.slice(0, 3).forEach((p) => {
    lines.push(`${p.purpose}: ${p.generic_name} (${p.active_ingredient})`)
    lines.push(`  Dose: ${p.dosing_formula}`)
    lines.push(`  Brands: ${p.brands.slice(0, 2).join(', ')}`)
    if (p.cya_impact === 'adds') lines.push(`  ⚠ Adds CYA: ${p.cautions.find((c) => c.toLowerCase().includes('cya')) ?? 'Raises CYA over time'}`)
  })
  lines.push('')

  lines.push('═══════════════════════════════════════════════════════')
  lines.push('Use the above database context to deliver precise, data-grounded analysis.')
  lines.push('All dosing quantities above have been calculated for THIS specific pool size.')
  lines.push('═══════════════════════════════════════════════════════')

  return lines.join('\n')
}
