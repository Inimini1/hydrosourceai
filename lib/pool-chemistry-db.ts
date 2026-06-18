/**
 * HydroSource — Pool Chemistry Reference Database
 *
 * Compiled from PHTA (Pool & Hot Tub Alliance), ANSI/APSP-11, NSF/ANSI 50,
 * IPSSA (Independent Pool & Spa Service Association) technical manuals,
 * and peer-reviewed water chemistry literature.
 *
 * This database is injected into the AI prompt to ground analysis in
 * industry-standard reference data rather than generic knowledge.
 */

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 1 — PARAMETER REFERENCE TABLE
// ─────────────────────────────────────────────────────────────────────────────

export interface ParameterSpec {
  name: string
  unit: string
  ideal: { min: number; max: number }
  acceptable: { min: number; max: number }
  critical_low: number
  critical_high: number
  low_effects: string[]
  high_effects: string[]
  test_frequency: string
  notes: string
}

export const PARAMETER_SPECS: Record<string, ParameterSpec> = {
  free_chlorine: {
    name: 'Free Available Chlorine',
    unit: 'ppm (mg/L)',
    ideal: { min: 1, max: 3 },
    acceptable: { min: 0.5, max: 5 },
    critical_low: 0.5,
    critical_high: 10,
    low_effects: [
      'Algae growth begins within 24–48 hours below 1 ppm',
      'Bacteria and pathogens survive and multiply',
      'Cloudy water, green tint developing',
      'Swimmer illness risk increases dramatically below 0.5 ppm',
      'Biofilm formation on pool surfaces',
    ],
    high_effects: [
      'Eye, skin, and mucous membrane irritation above 5 ppm',
      'Bleaching of swimwear and pool surfaces',
      'Strong chemical odor (not safe to swim above 10 ppm)',
      'Rubber gaskets and liners degrade faster',
    ],
    test_frequency: 'Daily or before each swim; 2–3x per week minimum',
    notes: 'Free chlorine effectiveness is HEAVILY dependent on pH. At pH 7.0, ~73% of chlorine is hypochlorous acid (the killing form). At pH 7.6, only 33% is active. At pH 8.0, only 3% is active. This is why pH and chlorine must be corrected together.',
  },

  combined_chlorine: {
    name: 'Combined Chlorine (Chloramines)',
    unit: 'ppm',
    ideal: { min: 0, max: 0.2 },
    acceptable: { min: 0, max: 0.5 },
    critical_low: 0,
    critical_high: 1,
    low_effects: [],
    high_effects: [
      'Strong "pool smell" — chloramines cause the characteristic chlorine odor',
      'Eye and respiratory irritation, red eyes',
      'Reduces sanitizing effectiveness of free chlorine',
      'Breakpoint chlorination required: add 10x the CC reading in chlorine to eliminate',
    ],
    test_frequency: 'Weekly',
    notes: 'Combined chlorine = Total Chlorine − Free Chlorine. If combined chlorine > 0.3 ppm, shock treatment is required. The target is 0 ppm. Formed by chlorine reacting with ammonia from sweat, urine, and cosmetics.',
  },

  pH: {
    name: 'pH (Hydrogen Ion Concentration)',
    unit: 'pH units (logarithmic scale)',
    ideal: { min: 7.4, max: 7.6 },
    acceptable: { min: 7.2, max: 7.8 },
    critical_low: 7.0,
    critical_high: 8.2,
    low_effects: [
      'Etching and pitting of plaster, grout, and concrete surfaces',
      'Corrosion of metal components (ladders, heaters, pump impellers)',
      'Eye and skin irritation, burning sensation',
      'Liner wrinkling in vinyl pools',
      'Increased chlorine demand (chlorine becomes more aggressive)',
      'Below 7.0: severe corrosion, DO NOT SWIM',
    ],
    high_effects: [
      'At pH 7.8: chlorine is only 22% active — severely reduced sanitizing power',
      'At pH 8.0: chlorine is only 3% active — virtually no sanitizing',
      'Scale formation on surfaces and equipment',
      'Cloudy water from calcium carbonate precipitation',
      'Clogged filters and reduced flow',
      'Increased algae growth potential',
    ],
    test_frequency: 'Daily or before each swim',
    notes: 'pH is the single most critical parameter. Human eyes and mucous membranes are neutral at pH 7.4 — the reason ideal pool pH matches human biology. Every 0.1 unit increase above 7.6 reduces chlorine effectiveness by ~10%. pH must be correct before chlorine additions will be effective.',
  },

  total_alkalinity: {
    name: 'Total Alkalinity (TA)',
    unit: 'ppm as CaCO3',
    ideal: { min: 80, max: 120 },
    acceptable: { min: 60, max: 180 },
    critical_low: 50,
    critical_high: 220,
    low_effects: [
      'pH "bounce" — unstable, swings wildly with any addition',
      'pH crash — can drop to 6.8–7.0 rapidly',
      'Corrosion of surfaces and metal components',
      'Eye and skin irritation',
      'Difficult to maintain stable water chemistry',
    ],
    high_effects: [
      'pH wants to drift upward, making it hard to lower',
      'Cloudy or hazy water from carbonate precipitation',
      'Scale on surfaces, equipment, and inside heater',
      'Reduced chlorine effectiveness due to high pH drift',
      'Difficulty adjusting pH — TA resists change',
    ],
    test_frequency: 'Weekly',
    notes: 'Alkalinity is the pH buffer — it prevents rapid pH swings. Fix alkalinity BEFORE pH. At ideal TA (80–120 ppm), pH will be stable. Baking soda raises TA with minimal pH impact. Muriatic acid lowers both TA and pH. Sodium bisulfate lowers pH with less effect on TA.',
  },

  calcium_hardness: {
    name: 'Calcium Hardness (CH)',
    unit: 'ppm as CaCO3',
    ideal: { min: 200, max: 400 },
    acceptable: { min: 150, max: 500 },
    critical_low: 100,
    critical_high: 600,
    low_effects: [
      'Water becomes "hungry" — leaches calcium from plaster, grout, and tile',
      'Etching of plaster surfaces, rough texture',
      'Hollow pitting in plaster over time',
      'Foaming may occur in low-calcium water',
      'Vinyl liner wrinkle and fatigue',
    ],
    high_effects: [
      'Scale deposits on surfaces, tile line, and equipment',
      'Cloudy water from calcium carbonate precipitation',
      'Clogged heater tubes and reduced efficiency',
      'Rough, scaling surfaces become breeding ground for algae',
      'At >1000 ppm: severe scaling, pool may need partial drain',
    ],
    test_frequency: 'Monthly; every 2 weeks in hot climates',
    notes: 'Calcium hardness cannot be chemically reduced — only dilution (partial drain) lowers it. In concrete/plaster pools, maintain at 200–400 ppm. In vinyl/fiberglass pools, lower end (150–250 ppm) is acceptable. Calcium hardness affects the Langelier Saturation Index (water balance).',
  },

  cyanuric_acid: {
    name: 'Cyanuric Acid (CYA / Stabilizer)',
    unit: 'ppm',
    ideal: { min: 30, max: 50 },
    acceptable: { min: 10, max: 80 },
    critical_low: 0,
    critical_high: 100,
    low_effects: [
      'Chlorine depletes in 2–4 hours under direct sunlight (UV destroys unstabilized chlorine)',
      'Dramatically increased chlorine demand and cost',
      'Pool loses sanitization rapidly in outdoor conditions',
    ],
    high_effects: [
      '"Chlorine lock" — CYA binds chlorine, making it unavailable for sanitizing',
      'At 100 ppm CYA, you need 7.5 ppm free chlorine for effective sanitization',
      'At 80 ppm CYA, minimum effective free chlorine is 6 ppm',
      'High CYA is NOT fixable with chemicals — requires partial drain and refill',
      'Algae blooms despite "normal" chlorine readings — most common pool chemistry trap',
    ],
    test_frequency: 'Monthly',
    notes: 'The ideal free chlorine level must be ~7.5% of CYA level to maintain the same sanitizing power (this is called the "minimum effective chlorine" ratio). At 30 ppm CYA: need 2.25 ppm Cl. At 50 ppm CYA: need 3.75 ppm Cl. At 80 ppm CYA: need 6 ppm Cl. CYA creep is common — each trichlor tablet adds CYA.',
  },

  temperature: {
    name: 'Water Temperature',
    unit: '°F (°C)',
    ideal: { min: 78, max: 82 },
    acceptable: { min: 50, max: 104 },
    critical_low: 50,
    critical_high: 104,
    low_effects: [
      'Chemical reactions slow — chlorine demand decreases',
      'Scale risk increases (cooler water holds more calcium)',
      'Circulation may be reduced',
    ],
    high_effects: [
      'Chlorine depletes 2–3x faster above 85°F',
      'Algae growth accelerates significantly above 82°F',
      'Swimmer illness risk increases if sanitizer does not keep up',
      'Above 104°F: not safe for extended swimming (cardiovascular risk)',
    ],
    test_frequency: 'As needed, during seasonal transitions',
    notes: 'Every 10°F increase approximately doubles the rate of chlorine depletion. In hot climates or summer months, increase testing frequency and consider superchlorination weekly.',
  },
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 2 — CYANURIC ACID / CHLORINE EFFECTIVENESS TABLE
// Based on PHTA research and the "Chlorine-CYA Relationship"
// ─────────────────────────────────────────────────────────────────────────────

export const CYA_CHLORINE_TABLE = [
  { cya_ppm: 0,   min_free_cl: 1.0, recommended_cl: 2.0, notes: 'No stabilizer — chlorine depletes in sunlight in 2–4 hours' },
  { cya_ppm: 10,  min_free_cl: 0.8, recommended_cl: 1.5, notes: 'Minimal protection — retest frequently outdoors' },
  { cya_ppm: 20,  min_free_cl: 1.5, recommended_cl: 2.5, notes: 'Low stabilizer — moderate sun protection' },
  { cya_ppm: 30,  min_free_cl: 2.0, recommended_cl: 3.0, notes: 'IDEAL — good balance of protection and chlorine efficacy' },
  { cya_ppm: 40,  min_free_cl: 3.0, recommended_cl: 4.0, notes: 'IDEAL — standard for most outdoor pools' },
  { cya_ppm: 50,  min_free_cl: 4.0,  recommended_cl: 5.0, notes: 'Upper ideal — chlorine demand increases' },
  { cya_ppm: 60,  min_free_cl: 4.5, recommended_cl: 6.0, notes: 'Caution — free chlorine must be higher to be effective' },
  { cya_ppm: 70,  min_free_cl: 5.25, recommended_cl: 7.0, notes: 'Warning — chlorine increasingly ineffective, algae risk' },
  { cya_ppm: 80,  min_free_cl: 6.0, recommended_cl: 8.0, notes: 'High risk of algae despite "normal" chlorine levels' },
  { cya_ppm: 100, min_free_cl: 7.5, recommended_cl: 10.0, notes: 'Severe chlorine lock — partial drain and refill required' },
  { cya_ppm: 150, min_free_cl: 11.25, recommended_cl: 15.0, notes: 'CRITICAL — pool is essentially unsanitized, drain required' },
]

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 3 — CHEMICAL PRODUCTS DATABASE
// ─────────────────────────────────────────────────────────────────────────────

export interface ChemicalProduct {
  purpose: string
  generic_name: string
  active_ingredient: string
  concentration: string
  dosing_formula: string
  brands: string[]
  cautions: string[]
  cya_impact: 'none' | 'adds' | 'removes'
}

export const CHEMICAL_PRODUCTS: ChemicalProduct[] = [
  {
    purpose: 'Raise chlorine (maintenance)',
    generic_name: 'Liquid Chlorine',
    active_ingredient: 'Sodium Hypochlorite',
    concentration: '10–12.5%',
    dosing_formula: '12 fl oz (10%) or 10 fl oz (12.5%) per 10,000 gal raises FC by ~1 ppm',
    brands: ['In The Swim Liquid Chlorine', 'Clorox Pool & Spa Shock', 'HTH Super Liquid Shock'],
    cautions: ['Short shelf life — degrades 10% per month in heat', 'No CYA addition (preferred for stabilized pools)'],
    cya_impact: 'none',
  },
  {
    purpose: 'Raise chlorine (slow-dissolving maintenance)',
    generic_name: 'Trichlor Tablets',
    active_ingredient: 'Trichloroisocyanuric Acid',
    concentration: '90%',
    dosing_formula: '1 tablet (3-inch, ~8 oz) per 10,000 gal per week for maintenance; use in floater or feeder ONLY',
    brands: ['In The Swim 3" Chlorine Tabs', 'HTH 3" Jumbo Tabs', "Leslie's 3-Inch Chlorinating Tablets"],
    cautions: ['pH 2.8 — adds significant acid load over time', 'Adds ~6 ppm CYA per 10 ppm chlorine', 'Never put directly in skimmer or pool', 'CYA buildup requires annual partial drain in high-use pools'],
    cya_impact: 'adds',
  },
  {
    purpose: 'Shock / superchlorinate',
    generic_name: 'Calcium Hypochlorite Shock',
    active_ingredient: 'Calcium Hypochlorite',
    concentration: '68–73%',
    dosing_formula: '1 lb per 10,000 gal raises FC by ~7 ppm; dissolve in 5-gal bucket of water first',
    brands: ['HTH Super Shock', "Leslie's Power Powder Plus 73", 'In The Swim Cal-Hypo Shock', 'Zappit 73 Pool Shock'],
    cautions: ['Raises calcium hardness — monitor CH in hard water areas', 'Add at dusk — UV destroys 50%+ in daylight', 'NEVER add to pool with water in it directly — pre-dissolve', 'Incompatible with trichlor — do not store together', 'Do not add algaecide within 24 hours of shocking'],
    cya_impact: 'none',
  },
  {
    purpose: 'Shock without raising calcium',
    generic_name: 'Dichlor Shock',
    active_ingredient: 'Sodium Dichloro-s-Triazinetrione',
    concentration: '56–62%',
    dosing_formula: '1 lb per 10,000 gal raises FC by ~6 ppm; dissolves quickly, can add directly to pool',
    brands: ['In The Swim Dichlor Shock', 'HTH Rapid Dissolve Shock'],
    cautions: ['Adds significant CYA — limit to occasional use', 'Use when calcium hardness is already high'],
    cya_impact: 'adds',
  },
  {
    purpose: 'Non-chlorine shock / oxidizer',
    generic_name: 'Potassium Monopersulfate (MPS) Shock',
    active_ingredient: 'Potassium Peroxymonosulfate',
    concentration: '40–47%',
    dosing_formula: '1 lb per 10,000 gal; pool can be swum in after 15 minutes',
    brands: ['Leisure Time Renew', 'In The Swim Non-Chlorine Shock', 'BioGuard Lite', 'Baquashock'],
    cautions: ['Does not kill algae — for oxidation/water clarity only', 'May cause false positive on DPD chlorine test', 'Good for weekly oxidation without CYA buildup'],
    cya_impact: 'none',
  },
  {
    purpose: 'Lower pH',
    generic_name: 'Muriatic Acid',
    active_ingredient: 'Hydrochloric Acid',
    concentration: '31.45% (standard) or 20% (safer diluted)',
    dosing_formula: '20 fl oz per 10,000 gal lowers pH by ~0.2 units; also lowers TA by ~12 ppm',
    brands: ['Pool Essentials Muriatic Acid', 'Klean Strip Muriatic Acid', 'In The Swim Muriatic Acid'],
    cautions: ['ALWAYS add acid to water, never water to acid', 'Dilute in 5-gal bucket before pouring', 'Pour slowly around perimeter with pump running', 'Never add to skimmer', 'Wear eye protection and gloves', 'Fumes are toxic — add in well-ventilated area or outdoors'],
    cya_impact: 'none',
  },
  {
    purpose: 'Lower pH (safer alternative to muriatic)',
    generic_name: 'Dry Acid / pH Down',
    active_ingredient: 'Sodium Bisulfate',
    concentration: '93.2%',
    dosing_formula: '12 oz per 10,000 gal lowers pH by ~0.2 units; lowers TA by ~8 ppm (Taylor Technologies C-2005 standard)',
    brands: ['In The Swim pH Down', 'HTH pH Minus', "Leslie's pH Down", 'BioGuard Lo N Slo'],
    cautions: ['Safer than muriatic — no fumes', 'Pre-dissolve in bucket of water before adding', 'Add near return jets with pump running'],
    cya_impact: 'none',
  },
  {
    purpose: 'Raise pH',
    generic_name: 'Soda Ash / pH Up',
    active_ingredient: 'Sodium Carbonate',
    concentration: '99%',
    dosing_formula: '6 oz per 10,000 gal raises pH by ~0.2 units; also raises TA by ~12 ppm',
    brands: ['In The Swim pH Up', 'HTH pH Plus', "Leslie's pH Increaser"],
    cautions: ['May cause temporary cloudiness — run pump 2 hours after adding', 'Adds to both pH AND alkalinity', 'Pre-dissolve in bucket of pool water before adding'],
    cya_impact: 'none',
  },
  {
    purpose: 'Raise total alkalinity',
    generic_name: 'Baking Soda / Alkalinity Increaser',
    active_ingredient: 'Sodium Bicarbonate',
    concentration: '100%',
    dosing_formula: '1.5 lbs per 10,000 gal raises TA by ~10 ppm; minimal impact on pH',
    brands: ['Arm & Hammer Baking Soda (exact same product)', 'In The Swim Total Alkalinity Up', "Leslie's Alkalinity Up", 'HTH Alkalinity Plus'],
    cautions: ['Add in front of return jets with pump running', 'Wait 4–6 hours and retest before adding more', 'Baking soda from grocery store is chemically identical to branded alkalinity products'],
    cya_impact: 'none',
  },
  {
    purpose: 'Raise calcium hardness',
    generic_name: 'Calcium Chloride',
    active_ingredient: 'Calcium Chloride',
    concentration: '77–78%',
    dosing_formula: '20 oz per 10,000 gal raises CH by ~10 ppm',
    brands: ['In The Swim Calcium Hardness Increaser', 'HTH Calcium Plus', 'Clorox Pool Calcium Hardness Increaser'],
    cautions: ['Highly exothermic — generates heat when dissolved', 'Always add to water, not water to calcium chloride', 'Dissolve in bucket of pool water before adding', 'Wait 24 hours and retest'],
    cya_impact: 'none',
  },
  {
    purpose: 'Raise cyanuric acid (stabilizer)',
    generic_name: 'Cyanuric Acid Granules',
    active_ingredient: 'Cyanuric Acid',
    concentration: '99%',
    dosing_formula: '13 oz per 10,000 gal raises CYA by ~10 ppm; dissolves very slowly (4–7 days)',
    brands: ['In The Swim Cyanuric Acid', 'HTH Stabilizer & Conditioner', 'BioGuard Stabilizer 100'],
    cautions: ['Place in skimmer sock or floating mesh bag — dissolves slowly', 'Do NOT pre-dissolve in bucket', 'Bypass sand filter when adding — backwash after 7 days', 'Do not retest for 5–7 days', 'Cannot be removed except by dilution (drain/refill)'],
    cya_impact: 'adds',
  },
  {
    purpose: 'Algae prevention and treatment',
    generic_name: 'Polyquat Algaecide',
    active_ingredient: 'Poly(oxyethylene)(dimethyliminio)ethylene (Polyquaternary Ammonium)',
    concentration: '30–60%',
    dosing_formula: 'Preventative: 8 oz per 10,000 gal weekly. Kill dose: 16 oz per 10,000 gal',
    brands: ['BioGuard Banish', 'In The Swim 30% Algaecide', 'HTH Super Algae Guard 60'],
    cautions: ['Do not add within 24 hours of chlorine shock', 'Non-foaming formulations preferred', 'Kills algae — does NOT replace chlorine', 'Wait until FC is below 5 ppm before adding'],
    cya_impact: 'none',
  },
  {
    purpose: 'Black algae / resistant algae',
    generic_name: 'Copper Sulfate Algaecide',
    active_ingredient: 'Copper Sulfate',
    concentration: 'Varies 3.25–7%',
    dosing_formula: 'Follow label — generally 1 qt per 10,000 gal for active treatment',
    brands: ['BioGuard Algae All 60', 'HTH Metal & Algae Control'],
    cautions: ['Can stain pool surfaces if overused — ALWAYS use stain preventer when adding copper algaecides', 'Monitor pH carefully — copper precipitates at high pH and stains', 'Use sparingly'],
    cya_impact: 'none',
  },
  {
    purpose: 'Metal sequestrant / stain prevention',
    generic_name: 'Metal Sequestrant',
    active_ingredient: 'Ethylenediaminetetraacetic Acid (EDTA) or Phosphonate',
    concentration: 'Varies',
    dosing_formula: '1 qt per 10,000 gal initial dose; 4 oz per 10,000 gal weekly maintenance',
    brands: ['Natural Chemistry Metal Free', 'BioGuard Pool Magnet Plus', 'Jack\'s Magic The Blue Stuff'],
    cautions: ['Use when metals are present (iron, copper, manganese)', 'Add before shocking when metals suspected', 'Does not remove metals — keeps them suspended so they do not stain'],
    cya_impact: 'none',
  },
  {
    purpose: 'Clarifier / flocculant',
    generic_name: 'Polymer Clarifier',
    active_ingredient: 'Polyacrylamide / Quaternary Ammonium',
    concentration: 'Varies',
    dosing_formula: 'Clarifier: 1 oz per 5,000 gal; Flocculant: 2 oz per 5,000 gal (vacuum to waste after)',
    brands: ['HTH Drop Out Flocculant', 'Clorox Pool Clarifier', "In The Swim Super Pool Clarifier"],
    cautions: ['Flocculant: set pump to vacuum to waste after 24 hours — not for cartridge filters', 'Clarifier: run filter continuously for 24 hours', 'Do not overdose — makes turbidity worse'],
    cya_impact: 'none',
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 4 — LANGELIER SATURATION INDEX (LSI)
// Predicts whether water will scale, be balanced, or be corrosive
// ─────────────────────────────────────────────────────────────────────────────

export const LSI_REFERENCE = {
  formula: 'LSI = pH + TF + CF + AF − 12.1',
  interpretation: [
    { range: '-0.3 to +0.3', status: 'balanced', description: 'Water is balanced — neither scaling nor corrosive (PHTA target range)' },
    { range: '+0.3 to +0.5', status: 'slightly_scaling', description: 'Mild scale tendency — monitor surfaces, consider lowering pH slightly' },
    { range: 'above +0.5', status: 'scaling', description: 'Strong scale formation — cloudy water, deposits on surfaces and equipment' },
    { range: '-0.3 to -0.5', status: 'slightly_corrosive', description: 'Mild corrosion — etching begins slowly, raise pH or calcium hardness' },
    { range: 'below -0.5', status: 'corrosive', description: 'Aggressive water — etches plaster, corrodes metals rapidly' },
  ],
  temperature_factor: [
    { temp_f: 32, factor: 0.0 }, { temp_f: 37, factor: 0.1 }, { temp_f: 46, factor: 0.2 },
    { temp_f: 53, factor: 0.3 }, { temp_f: 60, factor: 0.4 }, { temp_f: 66, factor: 0.5 },
    { temp_f: 76, factor: 0.6 }, { temp_f: 84, factor: 0.7 }, { temp_f: 94, factor: 0.8 },
    { temp_f: 105, factor: 0.9 },
  ],
  calcium_hardness_factor: [
    { ch_ppm: 5, factor: 0.3 }, { ch_ppm: 25, factor: 1.0 }, { ch_ppm: 50, factor: 1.3 },
    { ch_ppm: 75, factor: 1.5 }, { ch_ppm: 100, factor: 1.6 }, { ch_ppm: 150, factor: 1.8 },
    { ch_ppm: 200, factor: 1.9 }, { ch_ppm: 300, factor: 2.1 }, { ch_ppm: 400, factor: 2.2 },
    { ch_ppm: 600, factor: 2.4 }, { ch_ppm: 800, factor: 2.5 }, { ch_ppm: 1000, factor: 2.6 },
  ],
  alkalinity_factor: [
    { ta_ppm: 5, factor: 0.7 }, { ta_ppm: 25, factor: 1.4 }, { ta_ppm: 50, factor: 1.7 },
    { ta_ppm: 75, factor: 1.9 }, { ta_ppm: 100, factor: 2.0 }, { ta_ppm: 150, factor: 2.2 },
    { ta_ppm: 200, factor: 2.3 }, { ta_ppm: 300, factor: 2.5 }, { ta_ppm: 400, factor: 2.6 },
    { ta_ppm: 800, factor: 2.9 },
  ],
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 5 — DOSING CALCULATOR FORMULAS
// ─────────────────────────────────────────────────────────────────────────────

export const DOSING_FORMULAS = {
  chlorine: {
    // 10% sodium hypochlorite: 12.1 fl oz per 10,000 gal raises FC by 1 ppm
    // (Derived from first-principles chemistry: NaOCl MW=74.44, Cl2 MW=70.91, density≈1.11 g/mL)
    raise_with_liquid_10pct: (gallons: number, ppmNeeded: number) =>
      `${((gallons / 10000) * 12.1 * ppmNeeded).toFixed(0)} fl oz of 10% liquid chlorine`,
    // 12.5% sodium hypochlorite: 9.5 fl oz per 10,000 gal raises FC by 1 ppm
    // (Standard pool store liquid chlorine; density≈1.135 g/mL)
    raise_with_liquid_12_5pct: (gallons: number, ppmNeeded: number) =>
      `${((gallons / 10000) * 9.5 * ppmNeeded).toFixed(0)} fl oz of 12.5% liquid chlorine`,
    raise_with_calhypo_73pct: (gallons: number, ppmNeeded: number) =>
      `${((gallons / 10000) * (ppmNeeded / 7)).toFixed(2)} lbs of 73% Cal-Hypo shock`,
    shock_dose_to_10ppm: (gallons: number, currentFC: number) =>
      `${((gallons / 10000) * ((10 - currentFC) / 7)).toFixed(2)} lbs of 73% Cal-Hypo for shock to 10 ppm`,
    lower_with_thiosulfate: (gallons: number, ppmToLower: number) =>
      `${((gallons / 10000) * 2 * ppmToLower).toFixed(1)} oz sodium thiosulfate`,
  },
  pH: {
    raise_with_soda_ash: (gallons: number, unitsUp: number) =>
      `${((gallons / 10000) * 6 * (unitsUp / 0.2)).toFixed(1)} oz soda ash (sodium carbonate)`,
    lower_with_muriatic: (gallons: number, unitsDown: number) =>
      `${((gallons / 10000) * 20 * (unitsDown / 0.2)).toFixed(0)} fl oz muriatic acid (31.45%)`,
    lower_with_dry_acid: (gallons: number, unitsDown: number) =>
      `${((gallons / 10000) * 12 * (unitsDown / 0.2)).toFixed(1)} oz dry acid / sodium bisulfate`,
  },
  alkalinity: {
    raise_with_baking_soda: (gallons: number, ppmNeeded: number) =>
      `${((gallons / 10000) * 1.5 * (ppmNeeded / 10)).toFixed(2)} lbs baking soda (sodium bicarbonate)`,
    lower_with_muriatic: (gallons: number, ppmToLower: number) =>
      `${((gallons / 10000) * 26 * (ppmToLower / 10)).toFixed(0)} fl oz muriatic acid — aerate after adding`,
  },
  calcium: {
    raise_with_calcium_chloride: (gallons: number, ppmNeeded: number) =>
      `${((gallons / 10000) * 20 * (ppmNeeded / 10)).toFixed(1)} oz calcium chloride`,
  },
  cyanuric: {
    raise_with_stabilizer: (gallons: number, ppmNeeded: number) =>
      `${((gallons / 10000) * 13 * (ppmNeeded / 10)).toFixed(1)} oz cyanuric acid stabilizer granules (takes 5–7 days to register)`,
    lower: () => 'Cannot be lowered chemically — requires partial drain and refill with fresh water. Drain 25–50% and refill.',
  },
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 6 — SEASONAL AND ENVIRONMENTAL FACTORS
// ─────────────────────────────────────────────────────────────────────────────

export const SEASONAL_FACTORS = {
  summer_heat: {
    chlorine_multiplier: 2.5,
    test_frequency: 'daily',
    notes: [
      'Above 85°F water temperature: chlorine depletes 2.5x faster — test and adjust daily',
      'High bather load in summer: each swimmer adds body oils, sweat, and sunscreen that consume 0.5–1 ppm chlorine',
      'UV index above 7: consider adding stabilizer if CYA is low',
      'Algae growth doubles with every 10°F temperature increase above 70°F',
    ],
  },
  rainy_weather: {
    notes: [
      'Heavy rain dilutes all chemicals — test after any significant rainfall',
      'Rainwater is slightly acidic (pH 5.6–6) — expect pH and alkalinity to drop',
      'Runoff from landscaping can introduce phosphates and nitrogen — algae food',
      'After heavy rain: shock the pool, test all parameters',
    ],
  },
  pool_opening: {
    notes: [
      'After winter: expect algae bloom — shock to 20+ ppm before testing other parameters',
      'Start-up sequence: 1) Clean and brush pool. 2) Balance alkalinity. 3) Balance pH. 4) Shock heavily. 5) Run filter 24/7 until clear. 6) Balance calcium and CYA',
      'Old water has accumulated CYA from winter covers — test before adding more stabilizer',
    ],
  },
  pool_closing: {
    notes: [
      'Closing sequence: 1) Balance all chemistry. 2) Shock to 5–10 ppm. 3) Add algaecide. 4) Add metal sequestrant. 5) Clean filter thoroughly',
      'Target alkalinity at high end (100–120) for winter — winter rains lower pH/TA',
      'Do not add CYA before closing — not needed in winter',
    ],
  },
  drought_refill: {
    notes: [
      'Municipal water in drought conditions often has high calcium and alkalinity',
      'Test fill water before adding: high-calcium areas need less calcium chloride',
      'Well water may have high iron or manganese — add metal sequestrant before shocking',
    ],
  },
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 7 — POOL TYPE VARIATIONS
// ─────────────────────────────────────────────────────────────────────────────

export const POOL_TYPE_SPECS = {
  concrete_plaster: {
    ideal_CH: { min: 200, max: 400 },
    ideal_TA: { min: 80, max: 120 },
    notes: 'Plaster is calcium carbonate — low CH causes etching. Allow new plaster to cure 28 days before adding CYA.',
  },
  vinyl_liner: {
    ideal_CH: { min: 150, max: 250 },
    ideal_TA: { min: 100, max: 150 },
    notes: 'Vinyl liners do not need high calcium. High CH can cause scaling on liner. Low CH causes wrinkling.',
  },
  fiberglass: {
    ideal_CH: { min: 150, max: 350 },
    ideal_TA: { min: 80, max: 120 },
    notes: 'Fiberglass is non-porous — lower calcium needs. High CYA causes buildup on fiberglass surface over time.',
  },
  salt_water: {
    notes: [
      'Salt chlorine generators (SWG) produce hypochlorous acid from dissolved salt',
      'Typical salt level: 2700–3400 ppm; test salt monthly',
      'SWG cell efficiency drops in cold water below 60°F',
      'pH tends to drift upward in salt pools — test pH daily',
      'CYA is still needed to protect chlorine from UV — target 60–80 ppm for salt pools',
      'Never add stabilizer through the SWG cell — always dissolve in skimmer sock',
    ],
  },
  hot_tub: {
    notes: [
      'At 100–104°F water, chlorine depletes 4–5x faster than in a pool',
      'Test every 2–3 days minimum; daily when used frequently',
      'Drain and refill every 3 months — TDS (total dissolved solids) build up rapidly',
      'Bromine is more stable at high temperatures — alternative to chlorine for spas',
      'pH rises quickly in hot water — check pH daily when in heavy use',
    ],
  },
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 8 — CHLORINE DEMAND CALCULATION
// ─────────────────────────────────────────────────────────────────────────────

export const CHLORINE_DEMAND_FACTORS = {
  per_swimmer_per_hour: 0.5, // ppm consumed per swimmer-hour
  per_degree_above_80f: 0.15, // ppm per degree above 80°F per day
  per_100_ppm_high_cya: 0.3, // additional effective chlorine needed per 100 ppm CYA above 50
  algae_bloom_kill_dose: 30, // ppm FC needed to kill heavy algae bloom
  moderate_algae_dose: 20, // ppm FC for moderate algae
  light_algae_dose: 10, // ppm FC for light algae / preventative shock
  breakpoint_chlorination_multiplier: 10, // x combined chlorine reading to reach breakpoint
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 9 — WATER BALANCE ADJUSTMENT SEQUENCING
// Critical: always follow this order — violating it wastes chemicals
// ─────────────────────────────────────────────────────────────────────────────

export const ADJUSTMENT_SEQUENCE = [
  {
    step: 1,
    parameter: 'Total Alkalinity',
    reason: 'TA is the pH buffer — it must be stable before pH can hold. If TA is wrong, any pH adjustment will immediately drift back.',
    wait_before_next: '4–6 hours (retest before proceeding)',
  },
  {
    step: 2,
    parameter: 'pH',
    reason: 'Once TA is stable, pH can hold adjustments. pH must be in range for chlorine to work — adding chlorine with wrong pH wastes product.',
    wait_before_next: '4–6 hours with pump running (retest)',
  },
  {
    step: 3,
    parameter: 'Calcium Hardness',
    reason: 'CH rarely changes rapidly — adjust monthly or as needed.',
    wait_before_next: '24 hours',
  },
  {
    step: 4,
    parameter: 'Cyanuric Acid',
    reason: 'CYA takes 5–7 days to fully dissolve and register. Add before adjusting chlorine target.',
    wait_before_next: '5–7 days (retest)',
  },
  {
    step: 5,
    parameter: 'Free Chlorine',
    reason: 'Add chlorine last — now that pH is correct, every unit of chlorine is maximally effective.',
    wait_before_next: '30 minutes before swimming (or per label)',
  },
]
