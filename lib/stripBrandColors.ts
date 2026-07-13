/**
 * Customer-facing color reference charts, one per test strip brand.
 * Mirrors the brand calibration knowledge given to the AI in lib/ai.ts
 * (STRIP_BRAND_CALIBRATION) so what the customer sees on screen matches
 * what the model is told to look for — same brand, same pad order, same
 * value-to-color mapping, just rendered as swatches instead of prose.
 *
 * Hex values are representative approximations of each brand's printed
 * pad colors (manufacturers don't publish exact color specs), calibrated
 * against the same named color descriptions used in the AI prompt.
 */

export interface ColorSwatch {
  value: number
  hex: string
  ideal?: boolean
}

export interface ParamChart {
  label: string
  unit: string
  swatches: ColorSwatch[]
}

export interface BrandChart {
  name: string
  note: string
  /** Physical pad order on the strip, top to bottom, when documented for this brand. */
  padOrder?: string
  params: ParamChart[]
}

export const STRIP_BRAND_CHARTS: Record<string, BrandChart> = {
  aquachek: {
    name: 'AquaChek Select / AquaChek 7',
    note: 'Most common US retail brand. Pad order top to bottom: Total Hardness, Total Chlorine, Free Chlorine, pH, Total Alkalinity, CYA.',
    padOrder: 'Total Hardness, Total Chlorine, Free Chlorine, pH, Total Alkalinity, CYA (if 7-way)',
    params: [
      {
        label: 'pH', unit: '', swatches: [
          { value: 6.2, hex: '#C0392B' },
          { value: 6.8, hex: '#D9683B' },
          { value: 7.2, hex: '#E8934A' },
          { value: 7.4, hex: '#F0A93C', ideal: true },
          { value: 7.6, hex: '#F0C13B' },
          { value: 7.8, hex: '#F0D83D' },
          { value: 8.0, hex: '#F3E23F' },
          { value: 8.4, hex: '#F7ED5C' },
        ],
      },
      {
        label: 'Free Chlorine', unit: 'ppm', swatches: [
          { value: 0, hex: '#FBF6F0' },
          { value: 0.5, hex: '#FBDDE4' },
          { value: 1, hex: '#F6B8C6' },
          { value: 2, hex: '#EF88A3', ideal: true },
          { value: 3, hex: '#E85D82' },
          { value: 5, hex: '#C93764' },
          { value: 10, hex: '#8E1F52' },
        ],
      },
      {
        label: 'Total Alkalinity', unit: 'ppm', swatches: [
          { value: 0, hex: '#B5541E' },
          { value: 40, hex: '#C97A3B' },
          { value: 80, hex: '#D2A272' },
          { value: 120, hex: '#CBB78E', ideal: true },
          { value: 180, hex: '#AEB07C' },
          { value: 240, hex: '#83904A' },
        ],
      },
      {
        label: 'Total Hardness', unit: 'ppm', swatches: [
          { value: 0, hex: '#C85A3E' },
          { value: 25, hex: '#E0987E' },
          { value: 50, hex: '#DDA9C9' },
          { value: 120, hex: '#C89AD1' },
          { value: 250, hex: '#A566BE', ideal: true },
          { value: 500, hex: '#6B3491' },
        ],
      },
      {
        label: 'CYA / Stabilizer', unit: 'ppm', swatches: [
          { value: 0, hex: '#FAF7F2' },
          { value: 30, hex: '#F6DFC7' },
          { value: 50, hex: '#F0C79E', ideal: true },
          { value: 100, hex: '#E4A876' },
          { value: 150, hex: '#D48A52' },
          { value: 300, hex: '#A85F30' },
        ],
      },
    ],
  },

  lamottes: {
    name: 'LaMotte Insta-Test',
    note: 'Professional / semi-pro grade dip test strip. (LaMotte ColorQ is a separate electronic photometer that reads liquid reagents, not a dip strip — not covered by this chart.) Uses a different (green/blue-based) pH scale and purple-based chlorine scale than most retail brands.',
    padOrder: 'varies by model — read from label end to tip',
    params: [
      {
        label: 'pH', unit: '', swatches: [
          { value: 6.0, hex: '#E4D742' },
          { value: 6.5, hex: '#C3D043' },
          { value: 7.0, hex: '#8DBE4E' },
          { value: 7.2, hex: '#5CAE7C' },
          { value: 7.4, hex: '#3B9E9C', ideal: true },
          { value: 7.6, hex: '#3182CE' },
          { value: 7.8, hex: '#5A5FCE' },
          { value: 8.0, hex: '#7A3FA8' },
          { value: 8.5, hex: '#5B2478' },
        ],
      },
      {
        label: 'Free Chlorine', unit: 'ppm', swatches: [
          { value: 0, hex: '#FAFAFA' },
          { value: 0.5, hex: '#E4DBF0' },
          { value: 1, hex: '#C6B3E0' },
          { value: 2, hex: '#9E7CCB', ideal: true },
          { value: 4, hex: '#6E42A8' },
          { value: 10, hex: '#301458' },
        ],
      },
      {
        label: 'Total Alkalinity', unit: 'ppm', swatches: [
          { value: 0, hex: '#E4D742' },
          { value: 40, hex: '#C3D043' },
          { value: 80, hex: '#9BC24E' },
          { value: 120, hex: '#6FAE4E', ideal: true },
          { value: 180, hex: '#438046' },
          { value: 240, hex: '#295A32' },
        ],
      },
      {
        label: 'Calcium Hardness', unit: 'ppm', swatches: [
          { value: 0, hex: '#F3C6D2' },
          { value: 100, hex: '#E68FA4' },
          { value: 200, hex: '#D14F6C' },
          { value: 400, hex: '#A22440', ideal: true },
          { value: 800, hex: '#5E1226' },
        ],
      },
    ],
  },

  hth: {
    name: 'HTH 6-Way / Easy Strips',
    note: 'Budget / retail brand. Pad order: Free Chlorine, Total Chlorine, Bromine, pH, Total Alkalinity, Total Hardness.',
    padOrder: 'Free Chlorine, Total Chlorine, Bromine, pH, Total Alkalinity, Total Hardness',
    params: [
      {
        label: 'pH', unit: '', swatches: [
          { value: 6.2, hex: '#D2543A' },
          { value: 6.8, hex: '#E17F3F' },
          { value: 7.2, hex: '#EDA24A' },
          { value: 7.4, hex: '#F0BB48', ideal: true },
          { value: 7.6, hex: '#F2CE4C' },
          { value: 7.8, hex: '#F5DE72' },
          { value: 8.0, hex: '#E8E27E' },
        ],
      },
      {
        label: 'Free Chlorine', unit: 'ppm', swatches: [
          { value: 0, hex: '#FAF7F5' },
          { value: 1, hex: '#F7DCE3' },
          { value: 2, hex: '#F0B4C4', ideal: true },
          { value: 3, hex: '#E88CA5' },
          { value: 5, hex: '#D45F80' },
          { value: 10, hex: '#8E1F52' },
        ],
      },
      {
        label: 'Total Alkalinity', unit: 'ppm', swatches: [
          { value: 0, hex: '#C97A3B' },
          { value: 40, hex: '#D9A468' },
          { value: 80, hex: '#D8C09C' },
          { value: 120, hex: '#CBC0A0', ideal: true },
          { value: 180, hex: '#A9A98C' },
          { value: 240, hex: '#8B9179' },
        ],
      },
    ],
  },

  jnw: {
    name: 'JNW Direct Pool & Spa Test Strips',
    note: "Amazon bestseller, 7-way. Pad order top to bottom: Total Hardness, Total Chlorine, Free Chlorine, Bromine, pH, Total Alkalinity, CYA.",
    padOrder: 'Total Hardness, Total Chlorine, Free Chlorine, Bromine, pH, Total Alkalinity, CYA',
    params: [
      {
        label: 'pH', unit: '', swatches: [
          { value: 6.2, hex: '#C0392B' },
          { value: 6.8, hex: '#D25A3B' },
          { value: 7.0, hex: '#DD7940' },
          { value: 7.2, hex: '#E8934A' },
          { value: 7.4, hex: '#F0A93C', ideal: true },
          { value: 7.6, hex: '#F0C13B' },
          { value: 7.8, hex: '#F3DD6E' },
          { value: 8.0, hex: '#DCE07A' },
          { value: 8.4, hex: '#B9DB88' },
        ],
      },
      {
        label: 'Free Chlorine', unit: 'ppm', swatches: [
          { value: 0, hex: '#FBF6F0' },
          { value: 0.5, hex: '#FBDDE4' },
          { value: 1, hex: '#F7C3D2' },
          { value: 2, hex: '#F19FB6', ideal: true },
          { value: 3, hex: '#E77196' },
          { value: 5, hex: '#D93E77' },
          { value: 10, hex: '#7D1D52' },
        ],
      },
      {
        label: 'Total Alkalinity', unit: 'ppm', swatches: [
          { value: 0, hex: '#C2502A' },
          { value: 40, hex: '#D2823F' },
          { value: 80, hex: '#D8AC7B' },
          { value: 120, hex: '#CBB78E', ideal: true },
          { value: 180, hex: '#A2A66E' },
          { value: 240, hex: '#7C8352' },
        ],
      },
      {
        label: 'Total Hardness', unit: 'ppm', swatches: [
          { value: 0, hex: '#D2703B' },
          { value: 100, hex: '#E5A57E' },
          { value: 200, hex: '#D9A0C4' },
          { value: 250, hex: '#C489CE', ideal: true },
          { value: 500, hex: '#9A5CB8' },
          { value: 800, hex: '#652F8A' },
        ],
      },
      {
        label: 'CYA / Stabilizer', unit: 'ppm', swatches: [
          { value: 0, hex: '#FAF7F2' },
          { value: 30, hex: '#F7E6D2' },
          { value: 50, hex: '#F0C79E', ideal: true },
          { value: 100, hex: '#E4A876' },
          { value: 150, hex: '#D68F5C' },
          { value: 300, hex: '#A85F30' },
        ],
      },
    ],
  },

  poolmaster: {
    name: 'Poolmaster 5-Way / Essential',
    note: 'Pad order: Free Chlorine, Bromine, pH, Total Alkalinity, Total Hardness.',
    padOrder: 'Free Chlorine, Bromine, pH, Total Alkalinity, Total Hardness',
    params: [
      {
        label: 'pH', unit: '', swatches: [
          { value: 6.8, hex: '#D2543A' },
          { value: 7.0, hex: '#DE7B40' },
          { value: 7.2, hex: '#EA9C48' },
          { value: 7.4, hex: '#F0BA48', ideal: true },
          { value: 7.6, hex: '#F3D368' },
          { value: 7.8, hex: '#E9DD7C' },
          { value: 8.0, hex: '#D6DD82' },
        ],
      },
      {
        label: 'Free Chlorine', unit: 'ppm', swatches: [
          { value: 0, hex: '#FBF7F5' },
          { value: 1, hex: '#F6D8E0' },
          { value: 2, hex: '#F0B0C2', ideal: true },
          { value: 3, hex: '#E687A2' },
          { value: 5, hex: '#D25B7E' },
          { value: 10, hex: '#832259' },
        ],
      },
      {
        label: 'Total Alkalinity', unit: 'ppm', swatches: [
          { value: 0, hex: '#B5541E' },
          { value: 40, hex: '#C97A3B' },
          { value: 80, hex: '#D2A272' },
          { value: 120, hex: '#CBB78E', ideal: true },
          { value: 180, hex: '#9C8B5E' },
          { value: 240, hex: '#6E6540' },
        ],
      },
      {
        label: 'Total Hardness', unit: 'ppm', swatches: [
          { value: 0, hex: '#C2465A' },
          { value: 100, hex: '#D97D8C' },
          { value: 250, hex: '#C97FAE', ideal: true },
          { value: 500, hex: '#8A4A9E' },
        ],
      },
    ],
  },

  leslies: {
    name: "Leslie's 4-Way Test Strips",
    note: "Pool retail chain brand dip test strip. (Leslie's AccuBlue is a separate liquid-reagent + camera testing system, not a dip strip — not covered by this chart.) Pad order: Free Chlorine, pH, Total Alkalinity, Total Hardness.",
    padOrder: 'Free Chlorine, pH, Total Alkalinity, Total Hardness',
    params: [
      {
        label: 'pH', unit: '', swatches: [
          { value: 6.8, hex: '#C0392B' },
          { value: 7.2, hex: '#D9683B' },
          { value: 7.4, hex: '#EDA24A', ideal: true },
          { value: 7.6, hex: '#F0C13B' },
          { value: 7.8, hex: '#F3E23F' },
          { value: 8.0, hex: '#E4E87C' },
          { value: 8.4, hex: '#A9D18C' },
        ],
      },
      {
        label: 'Free Chlorine', unit: 'ppm', swatches: [
          { value: 0, hex: '#FAF6F0' },
          { value: 1, hex: '#F7CBD8' },
          { value: 2, hex: '#F0A0B8', ideal: true },
          { value: 3, hex: '#E679A0' },
          { value: 5, hex: '#D14C7E' },
          { value: 10, hex: '#8E1F52' },
        ],
      },
      {
        label: 'Total Alkalinity', unit: 'ppm', swatches: [
          { value: 0, hex: '#C97A3B' },
          { value: 80, hex: '#D2A272' },
          { value: 120, hex: '#CBB78E', ideal: true },
          { value: 180, hex: '#8B9179' },
          { value: 240, hex: '#657058' },
        ],
      },
      {
        label: 'Total Hardness', unit: 'ppm', swatches: [
          { value: 0, hex: '#D97D5E' },
          { value: 200, hex: '#DD8FA8' },
          { value: 400, hex: '#B368A8', ideal: true },
          { value: 800, hex: '#6B3491' },
        ],
      },
    ],
  },

  generic: {
    name: 'Generic / Store Brand / Unknown',
    note: 'Universal pool-chemistry color norms — a good fallback when your exact brand isn’t listed, but brand-specific selection above is more precise.',
    params: [
      {
        label: 'pH', unit: '', swatches: [
          { value: 6.8, hex: '#D2543A' },
          { value: 7.2, hex: '#E8934A' },
          { value: 7.4, hex: '#F0BA48', ideal: true },
          { value: 7.6, hex: '#F3D368' },
          { value: 8.0, hex: '#D6DD82' },
        ],
      },
      {
        label: 'Free Chlorine', unit: 'ppm', swatches: [
          { value: 0, hex: '#FBF7F5' },
          { value: 1, hex: '#F6D8E0' },
          { value: 2, hex: '#F0B0C2', ideal: true },
          { value: 3, hex: '#E687A2' },
          { value: 5, hex: '#D25B7E' },
          { value: 10, hex: '#832259' },
        ],
      },
      {
        label: 'Total Alkalinity', unit: 'ppm', swatches: [
          { value: 0, hex: '#C97A3B' },
          { value: 80, hex: '#D2A272' },
          { value: 120, hex: '#CBB78E', ideal: true },
          { value: 180, hex: '#9C8B5E' },
          { value: 240, hex: '#6E6540' },
        ],
      },
      {
        label: 'Calcium Hardness', unit: 'ppm', swatches: [
          { value: 0, hex: '#EFA6B7' },
          { value: 200, hex: '#D96F94' },
          { value: 400, hex: '#A22440', ideal: true },
          { value: 800, hex: '#5E1226' },
        ],
      },
    ],
  },
}

export function getBrandChart(brand: string | null | undefined): BrandChart {
  const key = (brand ?? 'generic').toLowerCase().replace(/[^a-z]/g, '')
  return STRIP_BRAND_CHARTS[key] ?? STRIP_BRAND_CHARTS.generic
}

// ─────────────────────────────────────────────────────────────────────────────
// Deterministic color-to-value mapping.
//
// Previously, the AI was asked to both *perceive* the pad's color and *do the
// arithmetic* of matching it against a table of named/hex anchors, entirely
// inside one language-model pass — a step where numeric interpolation errors
// are easy to introduce even when the color perception itself is fine.
//
// This module splits that into two separate, more reliable steps:
//   1. The AI reports the pad's color as it actually looks (a perception task
//      models are reasonably good at) as a hex string.
//   2. This code deterministically finds the nearest calibration anchor(s) by
//      real color-distance math and interpolates the value — the same
//      calculation every time for the same color, with no risk of the model
//      "eyeballing" the wrong number from a long table.
// ─────────────────────────────────────────────────────────────────────────────

function hexToRgb(hex: string): [number, number, number] | null {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim())
  if (!m) return null
  const n = parseInt(m[1], 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

/** "redmean" perceptual color distance — a well-established, cheap
 *  approximation of perceptual difference that's meaningfully more accurate
 *  than plain Euclidean RGB distance without needing a full CIELAB conversion. */
function colorDistance(hexA: string, hexB: string): number | null {
  const a = hexToRgb(hexA)
  const b = hexToRgb(hexB)
  if (!a || !b) return null
  const [r1, g1, b1] = a
  const [r2, g2, b2] = b
  const rMean = (r1 + r2) / 2
  const dR = r1 - r2, dG = g1 - g2, dB = b1 - b2
  return Math.sqrt((2 + rMean / 256) * dR * dR + 4 * dG * dG + (2 + (255 - rMean) / 256) * dB * dB)
}

export interface ColorMatchResult {
  value: number
  /** Distance to the single nearest anchor — lower is more confident. Redmean
   *  distances below ~15 are a near-exact match; above ~60 is a poor/ambiguous read. */
  nearestDistance: number
  interpolated: boolean
}

/** Deterministically maps a detected pad color to a parameter value by
 *  finding the nearest calibration anchor(s), interpolating between the two
 *  closest when the color falls between two reference points. */
export function estimateValueFromColor(detectedHex: string, swatches: ColorSwatch[]): ColorMatchResult | null {
  if (swatches.length === 0) return null
  const distances = swatches
    .map((s) => ({ swatch: s, dist: colorDistance(detectedHex, s.hex) }))
    .filter((d): d is { swatch: ColorSwatch; dist: number } => d.dist !== null)
    .sort((a, b) => a.dist - b.dist)

  if (distances.length === 0) return null
  const nearest = distances[0]
  const second = distances[1]

  // If the second-closest anchor is nearly as close as the nearest one, the
  // true color likely falls between them — interpolate weighted by distance.
  if (second && second.dist < nearest.dist * 1.8) {
    const totalDist = nearest.dist + second.dist
    // Closer anchor gets more weight; guard against both distances being 0.
    const weightNearest = totalDist === 0 ? 1 : 1 - nearest.dist / totalDist
    const value = nearest.swatch.value * weightNearest + second.swatch.value * (1 - weightNearest)
    return {
      value: Math.round(value * 100) / 100,
      nearestDistance: nearest.dist,
      interpolated: true,
    }
  }

  return { value: nearest.swatch.value, nearestDistance: nearest.dist, interpolated: false }
}
