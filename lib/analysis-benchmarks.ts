/**
 * Validated benchmark scenarios for HydroSource AI analysis accuracy testing.
 *
 * Each scenario defines an input, the scientifically correct expected output
 * fields, and a tolerance for numeric values. Run via /api/ai/benchmark (admin only).
 *
 * Accuracy is measured as: correct assertions / total assertions × 100.
 * A "correct" assertion means the model output matched the expected value
 * within the defined tolerance.
 */

import type { AnalyzeInput, WaterAnalysis } from './ai'

export interface BenchmarkAssertion {
  field: keyof WaterAnalysis
  /** exact string match, array includes, or numeric comparison */
  expect: 'safe' | 'caution' | 'critical' | 'low' | 'medium' | 'high' | string | number
  /** for numeric fields: acceptable ± delta */
  tolerance?: number
  /** human-readable description of what this assertion validates */
  description: string
}

export interface BenchmarkScenario {
  id: string
  name: string
  rationale: string
  input: AnalyzeInput
  assertions: BenchmarkAssertion[]
}

const BASE: Pick<AnalyzeInput, 'gallons' | 'poolType'> = {
  gallons: 15000,
  poolType: 'CHLORINE',
}

export const BENCHMARK_SCENARIOS: BenchmarkScenario[] = [
  // ──────────────────────────────────────────────────────────────
  // 1. PERFECT WATER — all parameters ideal
  // ──────────────────────────────────────────────────────────────
  {
    id: 'sc-01',
    name: 'Perfect balanced water',
    rationale: 'All parameters in ideal range → model must return safe + high health score',
    input: { ...BASE, chlorine: 2.5, pH: 7.4, alkalinity: 100, calciumHardness: 300, cyanuricAcid: 40 },
    assertions: [
      { field: 'status',       expect: 'safe',   description: 'Status must be safe' },
      { field: 'health_score', expect: 90,        tolerance: 10, description: 'Score ≥ 90 for perfect water' },
      { field: 'confidence',   expect: 'high',    description: 'High confidence when all data provided' },
    ],
  },

  // ──────────────────────────────────────────────────────────────
  // 2. LOW CHLORINE — dangerously below 0.5 ppm threshold
  // ──────────────────────────────────────────────────────────────
  {
    id: 'sc-02',
    name: 'Critically low chlorine (0.2 ppm)',
    rationale: 'FC < 0.5 ppm is a CRITICAL threshold per the system prompt — unsafe to swim',
    input: { ...BASE, chlorine: 0.2, pH: 7.4, alkalinity: 100 },
    assertions: [
      { field: 'status',       expect: 'critical', description: 'Status must be critical — FC below 0.5 ppm threshold' },
      { field: 'health_score', expect: 35,          tolerance: 15, description: 'Score ≤ 40 for critical readings' },
      { field: 'safety_notes', expect: 'swim',       description: 'Safety notes must mention swimming restriction' },
    ],
  },

  // ──────────────────────────────────────────────────────────────
  // 3. CYA-ADJUSTED CHLORINE FAILURE
  // Absolute FC = 2 ppm looks fine, but CYA = 60 requires min FC = 5 ppm
  // ──────────────────────────────────────────────────────────────
  {
    id: 'sc-03',
    name: 'CYA-adjusted chlorine failure (FC=2, CYA=60)',
    rationale: 'With CYA=60, minimum FC must be 5 ppm. FC=2 is effectively uncovered — must flag critical or caution',
    input: { ...BASE, chlorine: 2, pH: 7.4, alkalinity: 100, cyanuricAcid: 60 },
    assertions: [
      { field: 'status',    expect: 'critical', description: 'CYA=60 requires FC≥5 — FC=2 is critically low on adjusted scale' },
      { field: 'diagnosis', expect: 'CYA',       description: 'Diagnosis must reference CYA or stabilizer relationship' },
    ],
  },

  // ──────────────────────────────────────────────────────────────
  // 4. HIGH PH — chlorine almost fully inactive above 8.0
  // ──────────────────────────────────────────────────────────────
  {
    id: 'sc-04',
    name: 'High pH (8.2) — chlorine 80% ineffective',
    rationale: 'pH > 8.0 renders chlorine ~80% ineffective — must be flagged as critical or caution with pH correction step',
    input: { ...BASE, chlorine: 2.5, pH: 8.2, alkalinity: 100 },
    assertions: [
      { field: 'status',   expect: 'critical',           description: 'pH > 8.0 is critical threshold' },
      { field: 'diagnosis', expect: 'pH',                 description: 'Diagnosis must reference pH' },
      { field: 'immediate_action_plan', expect: 'Muriatic', description: 'Action plan must include acid to lower pH' },
    ],
  },

  // ──────────────────────────────────────────────────────────────
  // 5. CHLORAMINE BUILDUP — total chlorine > free chlorine
  // ──────────────────────────────────────────────────────────────
  {
    id: 'sc-05',
    name: 'Chloramine buildup (CC = 1.5 ppm)',
    rationale: 'CC = Total - Free = 1.5 ppm far exceeds 0.5 threshold — breakpoint chlorination required',
    input: { ...BASE, chlorine: 1.5, pH: 7.4, alkalinity: 100, totalChlorine: 3.0 },
    assertions: [
      { field: 'status',    expect: 'caution',      description: 'CC > 0.5 must trigger at least caution' },
      { field: 'diagnosis', expect: 'chloramine',    description: 'Diagnosis must identify chloramine issue' },
      { field: 'immediate_action_plan', expect: 'shock', description: 'Action plan must include shock / superchlorination' },
    ],
  },

  // ──────────────────────────────────────────────────────────────
  // 6. ALGAE BLOOM — green water, near-zero chlorine
  // ──────────────────────────────────────────────────────────────
  {
    id: 'sc-06',
    name: 'Active algae bloom — green water',
    rationale: 'Green clarity + FC < 1 ppm = algae bloom, requires SLAM protocol at CYA × 0.40',
    input: { ...BASE, chlorine: 0.5, pH: 7.6, alkalinity: 90, cyanuricAcid: 40, waterClarity: 'green' },
    assertions: [
      { field: 'status',    expect: 'critical', description: 'Algae bloom = critical' },
      { field: 'diagnosis', expect: 'algae',     description: 'Diagnosis must identify algae' },
      { field: 'immediate_action_plan', expect: 'SLAM', description: 'Action plan must reference SLAM protocol' },
    ],
  },

  // ──────────────────────────────────────────────────────────────
  // 7. CHEMISTRY PRIORITY ORDER — alkalinity must be fixed before pH
  // ──────────────────────────────────────────────────────────────
  {
    id: 'sc-07',
    name: 'Low alkalinity + low pH — priority order test',
    rationale: 'Alkalinity must always be corrected BEFORE pH per chemistry rules — model must follow this order',
    input: { ...BASE, chlorine: 2.0, pH: 7.0, alkalinity: 55 },
    assertions: [
      { field: 'status',    expect: 'critical',    description: 'Low TA + low pH = critical' },
      { field: 'immediate_action_plan', expect: 'alkalinity', description: 'First step must address alkalinity before pH' },
    ],
  },

  // ──────────────────────────────────────────────────────────────
  // 8. HIGH PHOSPHATES — algae fuel
  // ──────────────────────────────────────────────────────────────
  {
    id: 'sc-08',
    name: 'High phosphates (800 ppb) — algae fuel present',
    rationale: 'Phosphates > 500 ppb require phosphate remover — model must call this out',
    input: { ...BASE, chlorine: 2.0, pH: 7.4, alkalinity: 100, phosphates: 800 },
    assertions: [
      { field: 'status',    expect: 'caution',    description: 'High phosphates alone → caution minimum' },
      { field: 'diagnosis', expect: 'phosphate',   description: 'Diagnosis must mention phosphates' },
      { field: 'immediate_action_plan', expect: 'phosphate', description: 'Action plan must include phosphate remover' },
    ],
  },

  // ──────────────────────────────────────────────────────────────
  // 9. METAL STAINS — no shock before sequestrant
  // ──────────────────────────────────────────────────────────────
  {
    id: 'sc-09',
    name: 'Metal stains — sequestrant before shock rule',
    rationale: 'Shocking before treating metal stains makes staining permanent — model must catch this conflict',
    input: { ...BASE, chlorine: 1.5, pH: 7.3, alkalinity: 100, symptoms: 'brown rust stains on pool walls and floor' },
    assertions: [
      { field: 'diagnosis', expect: 'metal',         description: 'Diagnosis must identify metal staining' },
      { field: 'immediate_action_plan', expect: 'sequestrant', description: 'Sequestrant must appear in action plan' },
      { field: 'mistakes_to_avoid', expect: 'shock',  description: 'Must warn not to shock before treating metals' },
    ],
  },

  // ──────────────────────────────────────────────────────────────
  // 10. SALT POOL — low salt, SWG will shut down
  // ──────────────────────────────────────────────────────────────
  {
    id: 'sc-10',
    name: 'Salt pool with critically low salt level (1800 ppm)',
    rationale: 'Salt < 2500 ppm causes SWG shutdown — model must identify this and prescribe pool salt addition',
    input: { ...BASE, chlorine: 1.0, pH: 7.4, alkalinity: 80, poolType: 'SALT', saltLevel: 1800 },
    assertions: [
      { field: 'status',    expect: 'caution',     description: 'Low salt is at least caution for SWG pool' },
      { field: 'diagnosis', expect: 'salt',          description: 'Diagnosis must reference salt level' },
      { field: 'immediate_action_plan', expect: 'salt', description: 'Must recommend adding pool salt' },
    ],
  },

  // ──────────────────────────────────────────────────────────────
  // 11. HIGH TEMPERATURE — accelerated chlorine depletion
  // ──────────────────────────────────────────────────────────────
  {
    id: 'sc-11',
    name: 'Hot water (92°F) — accelerated chlorine depletion warning',
    rationale: 'Water temp > 85°F means chlorine depletes 30–50% faster — must include preventative alert',
    input: { ...BASE, chlorine: 2.5, pH: 7.4, alkalinity: 100, temperature: 92 },
    assertions: [
      { field: 'status',         expect: 'safe',       description: 'Good chemistry still = safe despite high temp' },
      { field: 'next_test_days', expect: 5,             tolerance: 2, description: 'Next test must be sooner due to high temp (≤7 days)' },
      { field: 'preventative_alerts', expect: 'temperature', description: 'Alert must mention temperature effect on chlorine' },
    ],
  },

  // ──────────────────────────────────────────────────────────────
  // 12. CHEMICAL CONFLICT — Cal-Hypo vs Trichlor warning
  // ──────────────────────────────────────────────────────────────
  {
    id: 'sc-12',
    name: 'Chemical conflict detection — Cal-Hypo mixing warning',
    rationale: 'When Cal-Hypo is appropriate (low FC, no CYA issue), model must warn never to mix with trichlor pucks',
    input: { ...BASE, chlorine: 0.8, pH: 7.4, alkalinity: 100, cyanuricAcid: 30 },
    assertions: [
      { field: 'status',    expect: 'caution',     description: 'FC below ideal but not critical' },
      { field: 'chemical_dosing_guide', expect: 'Cal-Hypo', description: 'Must suggest Cal-Hypo or liquid chlorine for shock' },
      { field: 'mistakes_to_avoid', expect: 'trichlor',    description: 'Must warn against mixing Cal-Hypo with trichlor' },
    ],
  },
]
