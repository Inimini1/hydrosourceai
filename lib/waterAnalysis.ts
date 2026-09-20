// Shared shape for the AI-generated analysis JSON stored on a WaterTest row.
// Used anywhere a page needs to show diagnosis/alerts from a test's aiAnalysis field.
export interface ParsedAnalysis {
  health_score?: number
  diagnosis?: string
  preventative_alerts?: string[]
  key_causes?: string[]
  status?: 'safe' | 'caution' | 'critical'
}

export function parseAnalysis(raw: string): ParsedAnalysis {
  try { return JSON.parse(raw) } catch { return {} }
}
