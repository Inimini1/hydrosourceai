/**
 * POST /api/ai/benchmark
 *
 * Admin-only endpoint. Runs all benchmark scenarios against the live Gemini
 * model and returns per-scenario pass/fail results with an overall accuracy score.
 *
 * Protected by BENCHMARK_SECRET env var — must be passed as Bearer token.
 * Never expose this endpoint publicly or without authentication.
 */

import { NextRequest, NextResponse } from 'next/server'
import { analyzeWater } from '@/lib/ai'
import { BENCHMARK_SCENARIOS } from '@/lib/analysis-benchmarks'
import type { WaterAnalysis } from '@/lib/ai'

function assertionPasses(
  result: WaterAnalysis,
  field: keyof WaterAnalysis,
  expect: string | number,
  tolerance?: number,
): boolean {
  const actual = result[field]

  if (actual === undefined || actual === null) return false

  // Numeric comparison with tolerance
  if (typeof expect === 'number' && typeof actual === 'number') {
    return Math.abs(actual - expect) <= (tolerance ?? 0)
  }

  // String field — exact match or substring
  if (typeof actual === 'string') {
    return actual.toLowerCase().includes(String(expect).toLowerCase())
  }

  // Array field — check if any element contains the expected string
  if (Array.isArray(actual)) {
    const needle = String(expect).toLowerCase()
    return actual.some((item) =>
      typeof item === 'string'
        ? item.toLowerCase().includes(needle)
        : typeof item === 'object' && item !== null
        ? JSON.stringify(item).toLowerCase().includes(needle)
        : false
    )
  }

  return false
}

export async function POST(req: NextRequest) {
  // Auth — require BENCHMARK_SECRET as Bearer token
  const secret = process.env.BENCHMARK_SECRET
  if (!secret) {
    return NextResponse.json({ error: 'BENCHMARK_SECRET env var not set.' }, { status: 500 })
  }
  const auth = req.headers.get('authorization')
  if (!auth || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
  }

  const body = await req.json().catch(() => ({}))
  const scenarioIds: string[] | undefined = body.scenarios

  const scenarios = scenarioIds
    ? BENCHMARK_SCENARIOS.filter((s) => scenarioIds.includes(s.id))
    : BENCHMARK_SCENARIOS

  if (scenarios.length === 0) {
    return NextResponse.json({ error: 'No matching scenarios.' }, { status: 400 })
  }

  const results = []
  let totalAssertions = 0
  let passedAssertions = 0

  for (const scenario of scenarios) {
    const scenarioStart = Date.now()
    let analysis: WaterAnalysis | null = null
    let error: string | null = null

    try {
      analysis = await analyzeWater(scenario.input)
    } catch (err) {
      error = err instanceof Error ? err.message : String(err)
    }

    const assertionResults = scenario.assertions.map((assertion) => {
      const passed = analysis
        ? assertionPasses(analysis, assertion.field, assertion.expect, assertion.tolerance)
        : false

      totalAssertions++
      if (passed) passedAssertions++

      return {
        field: assertion.field,
        expected: assertion.expect,
        tolerance: assertion.tolerance,
        actual: analysis ? analysis[assertion.field] : null,
        passed,
        description: assertion.description,
      }
    })

    const scenarioPassCount = assertionResults.filter((a) => a.passed).length

    results.push({
      id: scenario.id,
      name: scenario.name,
      rationale: scenario.rationale,
      passed: scenarioPassCount,
      total: assertionResults.length,
      score: Math.round((scenarioPassCount / assertionResults.length) * 100),
      durationMs: Date.now() - scenarioStart,
      error,
      assertions: assertionResults,
      modelOutput: analysis
        ? {
            status: analysis.status,
            health_score: analysis.health_score,
            diagnosis: analysis.diagnosis,
            confidence: analysis.confidence,
          }
        : null,
    })
  }

  const overallScore = totalAssertions > 0
    ? Math.round((passedAssertions / totalAssertions) * 100)
    : 0

  return NextResponse.json({
    overall: {
      score: overallScore,
      passed: passedAssertions,
      total: totalAssertions,
      scenarios_run: scenarios.length,
      grade:
        overallScore >= 96 ? 'A (96%+ — production ready)'
        : overallScore >= 90 ? 'B (90%+ — strong)'
        : overallScore >= 80 ? 'C (80%+ — acceptable)'
        : 'F (below 80% — needs work)',
    },
    scenarios: results,
    run_at: new Date().toISOString(),
  })
}
