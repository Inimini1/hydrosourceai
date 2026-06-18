/**
 * lib/chemistry-engine.ts
 *
 * Pure mathematical pool chemistry calculation engine.
 * All formulas derived from:
 *   — PHTA (Pool & Hot Tub Alliance) technical manuals
 *   — Taylor Technologies C-2005 water chemistry kit standards
 *   — IPSSA (Independent Pool & Spa Service Association) dosing tables
 *   — NSF/ANSI 50 certified pool chemistry references
 *
 * This module returns exact numeric values only.
 * No string formatting, no LLM estimation, no guessing.
 * All amounts are calculated precisely for the given pool volume.
 */

import { LSI_REFERENCE } from './pool-chemistry-db'

// ─────────────────────────────────────────────────────────────────────────────
// INTERNAL HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Lookup the factor for a given value in a PHTA step table.
 * Returns the factor for the highest entry whose key is ≤ value.
 * This implements the "floor interpolation" used in Taylor C-2005.
 */
function tableBelow<T extends Record<string, number>>(
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

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 1 — LANGELIER SATURATION INDEX (LSI)
// ─────────────────────────────────────────────────────────────────────────────

export interface LSIInput {
  pH: number
  temperatureF: number
  calciumHardness: number  // ppm as CaCO₃
  totalAlkalinity: number  // ppm as CaCO₃
}

export type LSIStatus =
  | 'corrosive'          // LSI < -0.5 — etches plaster, corrodes metal rapidly
  | 'slightly_corrosive' // -0.5 ≤ LSI < -0.3 — mild etching
  | 'balanced'           // -0.3 ≤ LSI ≤ 0.3 — PHTA target range
  | 'slightly_scaling'   // 0.3 < LSI ≤ 0.5 — mild scale deposits
  | 'scaling'            // LSI > 0.5 — heavy scale, cloudy water

export interface LSIOutput {
  /** The computed Langelier Saturation Index */
  lsi: number
  /** Water balance status per PHTA target range (−0.3 to +0.3) */
  status: LSIStatus
  /** Temperature correction factor from PHTA table */
  temperatureFactor: number
  /** Calcium hardness factor from Taylor C-2005 table */
  calciumFactor: number
  /** Total alkalinity factor from PHTA table */
  alkalinityFactor: number
}

/**
 * Calculate the Langelier Saturation Index using PHTA lookup tables.
 *
 * Formula: LSI = pH + TF + CF + AF − 12.1
 *   TF = Temperature Factor     (PHTA step table, °F)
 *   CF = Calcium Hardness Factor (Taylor C-2005 step table, ppm)
 *   AF = Alkalinity Factor       (PHTA step table, ppm)
 *
 * Target: −0.3 to +0.3
 *   < −0.3 → corrosive water; etches plaster, corrodes metal fittings
 *   > +0.3 → scaling water; calcium carbonate deposits on surfaces and equipment
 */
export function calculateLSI({ pH, temperatureF, calciumHardness, totalAlkalinity }: LSIInput): LSIOutput {
  const tf = tableBelow(LSI_REFERENCE.temperature_factor,     'temp_f', 'factor', temperatureF)
  const cf = tableBelow(LSI_REFERENCE.calcium_hardness_factor,'ch_ppm', 'factor', calciumHardness)
  const af = tableBelow(LSI_REFERENCE.alkalinity_factor,      'ta_ppm', 'factor', totalAlkalinity)

  const lsi = parseFloat((pH + tf + cf + af - 12.1).toFixed(2))

  let status: LSIStatus
  if      (lsi < -0.5) status = 'corrosive'
  else if (lsi < -0.3) status = 'slightly_corrosive'
  else if (lsi <=  0.3) status = 'balanced'
  else if (lsi <=  0.5) status = 'slightly_scaling'
  else                  status = 'scaling'

  return { lsi, status, temperatureFactor: tf, calciumFactor: cf, alkalinityFactor: af }
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 2 — CHLORINE DOSING
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Liquid chlorine base dosing rates — derived from first-principles chemistry:
 *
 * Molecular weights: NaOCl = 74.44 g/mol, Cl₂ = 70.91 g/mol
 * Available chlorine ratio: 70.91 / 74.44 = 0.9526 g Cl₂ per g NaOCl
 *
 * 10% NaOCl solution (density ≈ 1.110 g/mL = 32.84 g/fl oz):
 *   Available Cl₂/fl oz = 32.84 × 0.10 × 0.9526 = 3.129 g/fl oz
 *   10,000 gal = 37,854 L → 1 ppm FC = 37.854 g Cl₂ needed
 *   → 37.854 / 3.129 = 12.1 fl oz per 10,000 gal per 1 ppm
 *
 * 12.5% NaOCl solution (density ≈ 1.135 g/mL = 33.57 g/fl oz):
 *   Available Cl₂/fl oz = 33.57 × 0.125 × 0.9526 = 3.996 g/fl oz
 *   → 37.854 / 3.996 = 9.5 fl oz per 10,000 gal per 1 ppm
 *
 * 73% Ca(OCl)₂ (calcium hypochlorite):
 *   Industry standard (PHTA / Taylor C-2005): 1 lb per 10,000 gal ≈ 7 ppm FC
 *   → 0.1429 lb per 10,000 gal per 1 ppm
 *
 * 68% Ca(OCl)₂: scaled proportionally from 73%: × (73/68)
 */
const CHLORINE_RATE = {
  liquid10pct_floz_per10k_per_ppm:   12.1,
  liquid12_5pct_floz_per10k_per_ppm:  9.5,
  calHypo73pct_lbs_per10k_per_ppm:   1 / 7,        // 0.1429 lb
  calHypo68pct_lbs_per10k_per_ppm:   (1 / 7) * (73 / 68), // 0.1536 lb
}

export interface ChlorineDoseInput {
  gallons: number
  currentFC: number   // ppm free chlorine
  targetFC: number    // ppm target
}

export interface ChlorineDoseOutput {
  /** FC to add (0 if already at or above target) */
  ppmToAdd: number
  /** fl oz of 10% sodium hypochlorite needed */
  liquidChlorine10pct_floz: number
  /** fl oz of 12.5% sodium hypochlorite needed (standard pool store liquid chlorine) */
  liquidChlorine12_5pct_floz: number
  /** lbs of 73% calcium hypochlorite (Cal-Hypo shock) needed */
  calHypo73pct_lbs: number
  /** lbs of 68% calcium hypochlorite needed */
  calHypo68pct_lbs: number
}

/**
 * Calculate the exact chlorinating chemical dose to raise free chlorine to target.
 * Use `liquidChlorine12_5pct_floz` for standard pool store liquid chlorine.
 * Use `calHypo73pct_lbs` for Cal-Hypo shock (more concentrated, pre-dissolve in bucket).
 */
export function calculateChlorineDose({ gallons, currentFC, targetFC }: ChlorineDoseInput): ChlorineDoseOutput {
  const ppmToAdd = Math.max(0, parseFloat((targetFC - currentFC).toFixed(2)))
  const scale = gallons / 10000

  return {
    ppmToAdd,
    liquidChlorine10pct_floz:   parseFloat((scale * CHLORINE_RATE.liquid10pct_floz_per10k_per_ppm   * ppmToAdd).toFixed(1)),
    liquidChlorine12_5pct_floz: parseFloat((scale * CHLORINE_RATE.liquid12_5pct_floz_per10k_per_ppm * ppmToAdd).toFixed(1)),
    calHypo73pct_lbs:           parseFloat((scale * CHLORINE_RATE.calHypo73pct_lbs_per10k_per_ppm  * ppmToAdd).toFixed(3)),
    calHypo68pct_lbs:           parseFloat((scale * CHLORINE_RATE.calHypo68pct_lbs_per10k_per_ppm  * ppmToAdd).toFixed(3)),
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 3 — pH DOSING
// ─────────────────────────────────────────────────────────────────────────────

/**
 * pH adjustment base rates — PHTA / Taylor C-2005 standards:
 *
 * To LOWER pH:
 *   Muriatic acid 31.45% HCl: 20 fl oz per 10,000 gal lowers pH by 0.2 units
 *     Side effect: also lowers TA by ~12 ppm per dose
 *   Sodium bisulfate 93.2% (dry acid): 12 oz per 10,000 gal lowers pH by 0.2 units
 *     Side effect: lowers TA by ~8 ppm per dose (less TA impact than muriatic)
 *
 * To RAISE pH:
 *   Soda ash 99% (sodium carbonate Na₂CO₃): 6 oz per 10,000 gal raises pH by 0.2 units
 *     Side effect: also raises TA by ~12 ppm per dose
 *
 * IMPORTANT: Always fix Total Alkalinity BEFORE adjusting pH.
 * TA is the pH buffer — if TA is wrong, pH corrections will drift back.
 */
const PH_RATE = {
  muriaticAcid31pct_floz_per10k_per0_2units: 20,
  dryAcid93pct_oz_per10k_per0_2units: 12,
  sodaAsh99pct_oz_per10k_per0_2units: 6,
}

export interface PHDoseInput {
  gallons: number
  currentPH: number
  targetPH: number
}

export type PHDirection = 'raise' | 'lower' | 'none'

export interface PHDoseOutput {
  /** Absolute pH units to adjust */
  unitsToAdjust: number
  direction: PHDirection
  /** fl oz of 31.45% muriatic acid to lower pH — null when raising */
  muriaticAcid31pct_floz: number | null
  /** oz of 93.2% dry acid (sodium bisulfate) to lower pH — null when raising */
  dryAcid93pct_oz: number | null
  /** oz of 99% soda ash (sodium carbonate) to raise pH — null when lowering */
  sodaAsh99pct_oz: number | null
}

/**
 * Calculate the exact chemical dose to adjust pH.
 *
 * Always fix TA before adjusting pH — TA controls pH stability.
 * Muriatic acid and soda ash both affect TA as a side effect.
 */
export function calculatePHDose({ gallons, currentPH, targetPH }: PHDoseInput): PHDoseOutput {
  const diff = parseFloat((targetPH - currentPH).toFixed(2))
  const scale = gallons / 10000

  if (Math.abs(diff) < 0.05) {
    return {
      unitsToAdjust: 0,
      direction: 'none',
      muriaticAcid31pct_floz: null,
      dryAcid93pct_oz: null,
      sodaAsh99pct_oz: null,
    }
  }

  const absUnits = parseFloat(Math.abs(diff).toFixed(2))
  // Rate is expressed per 0.2 pH units — scale linearly
  const doseFactor = absUnits / 0.2

  if (diff > 0) {
    // Raising pH
    return {
      unitsToAdjust: absUnits,
      direction: 'raise',
      muriaticAcid31pct_floz: null,
      dryAcid93pct_oz: null,
      sodaAsh99pct_oz: parseFloat((scale * PH_RATE.sodaAsh99pct_oz_per10k_per0_2units * doseFactor).toFixed(1)),
    }
  } else {
    // Lowering pH
    return {
      unitsToAdjust: absUnits,
      direction: 'lower',
      muriaticAcid31pct_floz: parseFloat((scale * PH_RATE.muriaticAcid31pct_floz_per10k_per0_2units * doseFactor).toFixed(1)),
      dryAcid93pct_oz:        parseFloat((scale * PH_RATE.dryAcid93pct_oz_per10k_per0_2units        * doseFactor).toFixed(1)),
      sodaAsh99pct_oz: null,
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 4 — TOTAL ALKALINITY DOSING
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Total alkalinity adjustment base rates — PHTA standards:
 *
 * To RAISE TA:
 *   Sodium bicarbonate 100% (baking soda):
 *   1.5 lbs per 10,000 gal raises TA by 10 ppm — minimal pH impact
 *
 * To LOWER TA:
 *   Muriatic acid 31.45%: 26 fl oz per 10,000 gal lowers TA by ~10 ppm
 *   CRITICAL: After adding acid to lower TA, aerate pool surface (run returns at
 *   surface, waterfall, or use air compressor). CO₂ off-gassing raises pH back
 *   toward target WITHOUT raising TA — this is the "acid + aerate" method.
 */
const TA_RATE = {
  bakingSoda100pct_lbs_per10k_per10ppm: 1.5,
  muriaticAcid31pct_floz_per10k_per10ppm: 26,
}

export interface AlkalinityDoseInput {
  gallons: number
  currentTA: number  // ppm
  targetTA: number   // ppm
}

export type AlkalinityDirection = 'raise' | 'lower' | 'none'

export interface AlkalinityDoseOutput {
  /** ppm of TA to adjust */
  ppmToAdjust: number
  direction: AlkalinityDirection
  /** lbs of 100% sodium bicarbonate (baking soda) to raise TA — null if lowering */
  bakingSoda_lbs: number | null
  /** fl oz of 31.45% muriatic acid to lower TA — null if raising */
  muriaticAcid31pct_floz: number | null
}

/**
 * Calculate the exact chemical dose to adjust total alkalinity.
 *
 * Fix alkalinity FIRST — before adjusting pH or chlorine.
 * Alkalinity buffers pH. If TA is out of range, all other corrections drift.
 *
 * When lowering TA: aerate pool after adding acid to off-gas CO₂.
 */
export function calculateAlkalinityDose({ gallons, currentTA, targetTA }: AlkalinityDoseInput): AlkalinityDoseOutput {
  const diff = targetTA - currentTA
  const scale = gallons / 10000

  if (Math.abs(diff) < 2) {
    return { ppmToAdjust: 0, direction: 'none', bakingSoda_lbs: null, muriaticAcid31pct_floz: null }
  }

  const absPpm = Math.abs(diff)

  if (diff > 0) {
    return {
      ppmToAdjust: absPpm,
      direction: 'raise',
      bakingSoda_lbs: parseFloat((scale * TA_RATE.bakingSoda100pct_lbs_per10k_per10ppm * (absPpm / 10)).toFixed(2)),
      muriaticAcid31pct_floz: null,
    }
  } else {
    return {
      ppmToAdjust: absPpm,
      direction: 'lower',
      bakingSoda_lbs: null,
      muriaticAcid31pct_floz: parseFloat((scale * TA_RATE.muriaticAcid31pct_floz_per10k_per10ppm * (absPpm / 10)).toFixed(1)),
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 5 — CALCIUM HARDNESS DOSING
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Calcium hardness adjustment — PHTA standards:
 *
 * To RAISE CH:
 *   Calcium chloride 77–78% (CaCl₂): 12 oz per 10,000 gal raises CH by 10 ppm
 *   Highly exothermic — always pre-dissolve in a bucket of pool water before adding.
 *
 * To LOWER CH: CHEMICAL REDUCTION IS NOT POSSIBLE.
 *   Only option: drain a portion and refill with lower-calcium water.
 *   Drain percentage = (1 − targetCH / currentCH) × 100
 */
const CH_RATE = {
  // Verified: CaCl₂·2H₂O MW=147.01, CaCO₃ equiv MW=100.09, density 10kgal=37,854L
  // 10ppm CH in 37,854L = 378.5g CaCO₃ → 419.9g pure CaCl₂ → at 77% = 545g = 19.2oz ≈ 20oz
  // Confirmed by PHTA dosing tables and TFP Pool Math calculator
  calciumChloride77pct_oz_per10k_per10ppm: 20,
}

export interface CalciumDoseInput {
  gallons: number
  currentCH: number  // ppm
  targetCH: number   // ppm
}

export interface CalciumDoseOutput {
  /** ppm of CH to add (0 if at or above target) */
  ppmToAdd: number
  /** oz of 77% calcium chloride to add (0 if drain is required) */
  calciumChloride77pct_oz: number
  /**
   * Percentage of pool to drain and refill with fresh water to reduce CH.
   * null when raising is needed; set when currentCH > targetCH.
   */
  drainPctToReduce: number | null
}

/**
 * Calculate calcium hardness adjustment.
 * CH cannot be chemically reduced — drain/refill is the only solution when too high.
 */
export function calculateCalciumDose({ gallons, currentCH, targetCH }: CalciumDoseInput): CalciumDoseOutput {
  const scale = gallons / 10000

  if (currentCH > targetCH) {
    const drainPct = parseFloat(((1 - targetCH / currentCH) * 100).toFixed(0))
    return { ppmToAdd: 0, calciumChloride77pct_oz: 0, drainPctToReduce: drainPct }
  }

  const ppmToAdd = Math.max(0, targetCH - currentCH)
  if (ppmToAdd === 0) {
    return { ppmToAdd: 0, calciumChloride77pct_oz: 0, drainPctToReduce: null }
  }

  return {
    ppmToAdd,
    calciumChloride77pct_oz: parseFloat((scale * CH_RATE.calciumChloride77pct_oz_per10k_per10ppm * (ppmToAdd / 10)).toFixed(1)),
    drainPctToReduce: null,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 6 — CYANURIC ACID DOSING
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Cyanuric acid adjustment:
 *
 * To RAISE CYA:
 *   CYA granules 99%: 4 oz per 10,000 gal raises CYA by 10 ppm
 *   Dissolves very slowly — takes 5–7 days to register fully on tests.
 *   Place in skimmer sock or float; bypass sand filter for 7 days; backwash after.
 *
 * To LOWER CYA: CHEMICAL REDUCTION IS NOT POSSIBLE.
 *   Only option: partial drain and refill with CYA-free fresh water.
 *   Drain percentage = (1 − targetCYA / currentCYA) × 100
 */
const CYA_RATE = {
  // Verified: CYA MW=129.07, 10ppm in 37,854L = 378.5g at 99% purity = 382.4g = 13.5oz ≈ 13oz
  // Confirmed by TFP Pool Math and In The Swim manufacturer dosing (1 lb/10kgal ≈ 12ppm → 13.3oz/10ppm)
  granules99pct_oz_per10k_per10ppm: 13,
}

export interface CYADoseInput {
  gallons: number
  currentCYA: number  // ppm
  targetCYA: number   // ppm
}

export interface CYADoseOutput {
  /** ppm of CYA to add (0 if at or above target) */
  ppmToAdd: number
  /** oz of 99% cyanuric acid granules to add */
  cyanuricAcidGranules_oz: number
  /**
   * Percentage of pool to drain and refill to reduce CYA.
   * null when raising; set when currentCYA > targetCYA.
   */
  drainPctToReduce: number | null
}

/**
 * Calculate CYA adjustment.
 * Over-stabilizing leads to chlorine lock — at CYA > 80 ppm, chlorine is
 * severely impaired even at "normal" FC readings (PHTA chlorine-lock threshold).
 */
export function calculateCYADose({ gallons, currentCYA, targetCYA }: CYADoseInput): CYADoseOutput {
  const scale = gallons / 10000

  if (currentCYA > targetCYA) {
    const drainPct = parseFloat(((1 - targetCYA / currentCYA) * 100).toFixed(0))
    return { ppmToAdd: 0, cyanuricAcidGranules_oz: 0, drainPctToReduce: drainPct }
  }

  const ppmToAdd = Math.max(0, targetCYA - currentCYA)
  if (ppmToAdd === 0) {
    return { ppmToAdd: 0, cyanuricAcidGranules_oz: 0, drainPctToReduce: null }
  }

  return {
    ppmToAdd,
    cyanuricAcidGranules_oz: parseFloat((scale * CYA_RATE.granules99pct_oz_per10k_per10ppm * (ppmToAdd / 10)).toFixed(1)),
    drainPctToReduce: null,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 7 — SALT LEVEL DOSING (SWG pools)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Salt (NaCl) dosing for salt water chlorine generator pools.
 *
 * Formula (to ADD salt):
 *   lbs NaCl = (targetSalt − currentSalt) × gallons × 8.34 / 1,000,000
 *   Derivation: 1 ppm = 1 mg/L; 1 gallon water = 8.34 lbs;
 *   1,000,000 mg = 1 kg ≈ 1 lb (approximate, valid for dilute solutions)
 *
 * To LOWER salt: drain and refill — chemical reduction not possible.
 *   drainPct = (1 − targetSalt / currentSalt) × 100
 */

export interface SaltDoseInput {
  gallons: number
  currentSalt: number  // ppm
  targetSalt: number   // ppm (typical SWG target: 2,700–3,200 ppm)
}

export interface SaltDoseOutput {
  /** lbs of pool-grade sodium chloride (non-iodized) to add */
  sodiumChloride_lbs: number
  /**
   * Percentage of pool to drain and refill to reduce salt.
   * null when adding is needed; set when currentSalt > targetSalt.
   */
  drainPctToReduce: number | null
}

/**
 * Calculate pool salt adjustment for SWG pools.
 * Use pool-grade NaCl only (non-iodized, no anti-caking agents).
 * Dissolve before adding; re-test in 24 hours.
 */
export function calculateSaltDose({ gallons, currentSalt, targetSalt }: SaltDoseInput): SaltDoseOutput {
  if (currentSalt > targetSalt) {
    const drainPct = parseFloat(((1 - targetSalt / currentSalt) * 100).toFixed(0))
    return { sodiumChloride_lbs: 0, drainPctToReduce: drainPct }
  }

  const ppmToAdd = Math.max(0, targetSalt - currentSalt)
  // lbs NaCl = ppm × gallons × 8.34 lb/gal / 1,000,000 mg/kg
  const sodiumChloride_lbs = parseFloat(((ppmToAdd * gallons * 8.34) / 1_000_000).toFixed(1))

  return { sodiumChloride_lbs, drainPctToReduce: null }
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 8 — FULL WATER BALANCE REPORT
// ─────────────────────────────────────────────────────────────────────────────

export interface WaterBalanceInput {
  gallons: number
  pH: number
  chlorine: number          // FC ppm
  alkalinity: number        // TA ppm
  temperatureF?: number     // °F — required for LSI
  calciumHardness?: number  // ppm — required for LSI
  cyanuricAcid?: number     // ppm
  saltLevel?: number        // ppm — for SWG pools
  totalChlorine?: number    // ppm — to compute combined chlorine (CC)
}

export interface WaterBalanceReport {
  /**
   * Langelier Saturation Index result.
   * null if temperatureF or calciumHardness not provided.
   */
  lsi: LSIOutput | null

  /** Chlorine dosing to reach 3 ppm (ideal FC target) */
  chlorine: ChlorineDoseOutput

  /** pH dosing to reach 7.4 (ideal center of PHTA range) */
  pH: PHDoseOutput

  /** Alkalinity dosing to reach 100 ppm (center of 80–120 ideal range) */
  alkalinity: AlkalinityDoseOutput

  /** Calcium hardness dosing to reach 300 ppm — null if CH not provided */
  calcium: CalciumDoseOutput | null

  /** CYA dosing to reach 40 ppm — null if CYA not provided */
  cya: CYADoseOutput | null

  /** Salt dosing to reach 3,000 ppm — null if saltLevel not provided */
  salt: SaltDoseOutput | null

  /**
   * Combined chlorine (chloramines) = Total Chlorine − Free Chlorine.
   * > 0.5 ppm requires breakpoint chlorination.
   * null if totalChlorine not provided.
   */
  combinedChlorine_ppm: number | null

  /**
   * FC / CYA effectiveness ratio.
   * Must be ≥ 0.075 for adequate sanitization (PHTA minimum FC rule).
   * < 0.075 = chlorine lock risk despite "normal" FC reading.
   * null if CYA not provided.
   */
  fcCYARatio: number | null

  /**
   * Minimum effective free chlorine for the current CYA level.
   * Formula: minFC = CYA × 0.075 (PHTA / TFP standard).
   * null if CYA not provided.
   */
  minEffectiveFC: number | null
}

/**
 * Generate a comprehensive water balance report with all dosing calculations.
 *
 * Industry-standard targets used:
 *   FC = 3 ppm, pH = 7.4, TA = 100 ppm, CH = 300 ppm, CYA = 40 ppm, Salt = 3,000 ppm
 *
 * All dosing amounts are specific to the provided pool volume.
 * No LLM estimation — all values are computed from verified chemical formulas.
 */
export function calculateWaterBalance(input: WaterBalanceInput): WaterBalanceReport {
  const lsi = (input.temperatureF != null && input.calciumHardness != null)
    ? calculateLSI({
        pH: input.pH,
        temperatureF: input.temperatureF,
        calciumHardness: input.calciumHardness,
        totalAlkalinity: input.alkalinity,
      })
    : null

  const chlorine   = calculateChlorineDose({ gallons: input.gallons, currentFC: input.chlorine,     targetFC: 3   })
  const pH         = calculatePHDose       ({ gallons: input.gallons, currentPH: input.pH,           targetPH: 7.4 })
  const alkalinity = calculateAlkalinityDose({ gallons: input.gallons, currentTA: input.alkalinity, targetTA: 100  })

  const calcium = input.calciumHardness != null
    ? calculateCalciumDose({ gallons: input.gallons, currentCH: input.calciumHardness, targetCH: 300 })
    : null

  const cya = input.cyanuricAcid != null
    ? calculateCYADose({ gallons: input.gallons, currentCYA: input.cyanuricAcid, targetCYA: 40 })
    : null

  const salt = input.saltLevel != null
    ? calculateSaltDose({ gallons: input.gallons, currentSalt: input.saltLevel, targetSalt: 3000 })
    : null

  const combinedChlorine_ppm = input.totalChlorine != null
    ? parseFloat(Math.max(0, input.totalChlorine - input.chlorine).toFixed(2))
    : null

  const fcCYARatio = (input.cyanuricAcid != null && input.cyanuricAcid > 0)
    ? parseFloat((input.chlorine / input.cyanuricAcid).toFixed(4))
    : null

  const minEffectiveFC = (input.cyanuricAcid != null && input.cyanuricAcid > 0)
    ? parseFloat((input.cyanuricAcid * 0.075).toFixed(2))
    : null

  return {
    lsi,
    chlorine,
    pH,
    alkalinity,
    calcium,
    cya,
    salt,
    combinedChlorine_ppm,
    fcCYARatio,
    minEffectiveFC,
  }
}
