/**
 * lib/plans.ts
 *
 * Single source of truth for HydroSource AI subscription plans.
 * Every feature gate, UI badge, and pricing table reads from here.
 *
 * Stripe Price IDs are injected at runtime via env vars.
 * Plan type strings match the `planType` column in the Subscription table.
 */

// ─────────────────────────────────────────────────────────────────────────────
// PLAN TYPE CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

export type PlanType =
  | 'FREE'
  | 'HOMEOWNER_PLUS'
  | 'POOL_PRO'
  | 'POOL_TEAM'
  | 'ENTERPRISE'

export type BillingCycle = 'monthly' | 'annual'

export type UserType = 'homeowner' | 'professional'

// ─────────────────────────────────────────────────────────────────────────────
// PLAN FEATURE FLAGS
// ─────────────────────────────────────────────────────────────────────────────

export interface PlanFeatures {
  /** Maximum number of pool profiles (null = unlimited) */
  poolLimit: number | null
  /** Maximum analyses per month (null = unlimited) */
  analysesPerMonth: number | null
  /** Days of history retained (null = unlimited) */
  historyDays: number | null
  /** Full AI explanations with root cause analysis */
  fullAIExplanations: boolean
  /** Exportable professional PDF reports */
  pdfReports: boolean
  /** Email report delivery via Resend */
  emailReports: boolean
  /** Maintenance log with treatment plan checklists (PRO+ only) */
  maintenanceLog: boolean
  /** Multiple technician accounts under one company */
  teamMembers: boolean
  /** Branded reports with company logo */
  brandedReports: boolean
  /** Role-based access control */
  rbac: boolean
  /** API access for custom integrations */
  apiAccess: boolean
  /** 14-day free trial for paid professional plans */
  trial: boolean
  /** Trial length in days */
  trialDays: number
}

// ─────────────────────────────────────────────────────────────────────────────
// PLAN DEFINITIONS
// ─────────────────────────────────────────────────────────────────────────────

export interface PlanDefinition {
  type: PlanType
  name: string
  tagline: string
  userType: UserType | 'both'
  price: {
    monthly: number   // USD/month
    annual: number    // USD/year (billed annually)
    annualMonthly: number // Effective $/month on annual plan
  }
  /** Stripe price IDs (read from env at runtime) */
  stripePriceId: {
    monthly: string
    annual: string
  }
  features: PlanFeatures
  /** Feature bullet points shown on pricing page */
  highlights: string[]
  /** CTA label */
  cta: string
  badge?: string  // e.g. "Most Popular"
  accentColor: string
}

export const PLAN_DEFINITIONS: Record<PlanType, PlanDefinition> = {

  FREE: {
    type: 'FREE',
    name: 'Pool Owner Free',
    tagline: 'Perfect for keeping your own pool in check',
    userType: 'homeowner',
    price: { monthly: 0, annual: 0, annualMonthly: 0 },
    stripePriceId: { monthly: '', annual: '' },
    features: {
      poolLimit: 1,
      analysesPerMonth: 5,
      historyDays: 7,
      fullAIExplanations: false,
      pdfReports: false,
      emailReports: false,
      maintenanceLog: false,
      teamMembers: false,
      brandedReports: false,
      rbac: false,
      apiAccess: false,
      trial: false,
      trialDays: 0,
    },
    highlights: [
      '1 pool profile',
      '5 chemistry analyses / month',
      'Basic AI treatment recommendations',
      '7-day chemistry history',
      'Test strip photo scanner',
    ],
    cta: 'Get Started Free',
    accentColor: '#64748B',
  },

  HOMEOWNER_PLUS: {
    type: 'HOMEOWNER_PLUS',
    name: 'Pool Owner Plus',
    tagline: 'Unlimited chemistry tracking for the serious pool owner',
    userType: 'homeowner',
    price: { monthly: 9, annual: 90, annualMonthly: 7.5 },
    stripePriceId: {
      monthly: process.env.STRIPE_HOMEOWNER_PLUS_MONTHLY_PRICE_ID ?? '',
      annual:  process.env.STRIPE_HOMEOWNER_PLUS_ANNUAL_PRICE_ID  ?? '',
    },
    features: {
      poolLimit: 1,
      analysesPerMonth: null,
      historyDays: null,
      fullAIExplanations: true,
      pdfReports: true,
      emailReports: false,
      maintenanceLog: false,
      teamMembers: false,
      brandedReports: false,
      rbac: false,
      apiAccess: false,
      trial: false,
      trialDays: 0,
    },
    highlights: [
      '1 pool profile',
      'Unlimited chemistry analyses',
      'Full AI explanations & root causes',
      'Complete chemistry history',
      'Exportable PDF reports',
      'Advanced treatment recommendations',
    ],
    cta: 'Start for $9/mo',
    accentColor: '#00C9B1',
  },

  POOL_PRO: {
    type: 'POOL_PRO',
    name: 'Pool Pro',
    tagline: 'Built for solo operators and small pool service companies',
    userType: 'professional',
    price: { monthly: 49, annual: 490, annualMonthly: 40.83 },
    stripePriceId: {
      monthly: process.env.STRIPE_POOL_PRO_MONTHLY_PRICE_ID ?? '',
      annual:  process.env.STRIPE_POOL_PRO_ANNUAL_PRICE_ID  ?? '',
    },
    features: {
      poolLimit: 75,
      analysesPerMonth: null,
      historyDays: null,
      fullAIExplanations: true,
      pdfReports: true,
      emailReports: true,
      maintenanceLog: true,
      teamMembers: false,
      brandedReports: false,
      rbac: false,
      apiAccess: false,
      trial: true,
      trialDays: 14,
    },
    highlights: [
      'Up to 75 pool profiles',
      'Unlimited analyses & treatment logs',
      'Professional client reports',
      'Email delivery to clients',
      'Full AI explanations & dosing guide',
      'Historical chemistry tracking',
      'Maintenance log with treatment checklists',
      '14-day free trial — no card required',
    ],
    cta: 'Start Free Trial',
    badge: 'Most Popular',
    accentColor: '#006FFF',
  },

  POOL_TEAM: {
    type: 'POOL_TEAM',
    name: 'Pool Team',
    tagline: 'For growing pool service companies managing technician teams',
    userType: 'professional',
    price: { monthly: 149, annual: 1490, annualMonthly: 124.17 },
    stripePriceId: {
      monthly: process.env.STRIPE_POOL_TEAM_MONTHLY_PRICE_ID ?? '',
      annual:  process.env.STRIPE_POOL_TEAM_ANNUAL_PRICE_ID  ?? '',
    },
    features: {
      poolLimit: 300,
      analysesPerMonth: null,
      historyDays: null,
      fullAIExplanations: true,
      pdfReports: true,
      emailReports: true,
      maintenanceLog: true,
      teamMembers: true,
      brandedReports: true,
      rbac: true,
      apiAccess: false,
      trial: true,
      trialDays: 14,
    },
    highlights: [
      'Up to 300 pool profiles',
      'Multiple technician accounts',
      'Shared records & team collaboration',
      'Role-based access control',
      'Branded reports with company logo',
      'Maintenance log with treatment checklists',
      'Technician activity tracking',
      '14-day free trial — no card required',
    ],
    cta: 'Start Free Trial',
    accentColor: '#8B5CF6',
  },

  ENTERPRISE: {
    type: 'ENTERPRISE',
    name: 'Enterprise',
    tagline: 'Custom deployment for large pool management companies',
    userType: 'professional',
    price: { monthly: 0, annual: 0, annualMonthly: 0 },
    stripePriceId: { monthly: '', annual: '' },
    features: {
      poolLimit: null,
      analysesPerMonth: null,
      historyDays: null,
      fullAIExplanations: true,
      pdfReports: true,
      emailReports: true,
      maintenanceLog: true,
      teamMembers: true,
      brandedReports: true,
      rbac: true,
      apiAccess: true,
      trial: false,
      trialDays: 0,
    },
    highlights: [
      'Unlimited pool profiles',
      'Custom onboarding & training',
      'API access for custom integrations',
      'Dedicated account manager',
      'Custom reporting & branding',
      'SLA & priority support',
    ],
    cta: 'Contact Sales',
    accentColor: '#F59E0B',
  },
}

// ─────────────────────────────────────────────────────────────────────────────
// FEATURE GATE HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/** Returns the plan definition for a given planType string */
export function getPlanDefinition(planType: string): PlanDefinition {
  return PLAN_DEFINITIONS[planType as PlanType] ?? PLAN_DEFINITIONS.FREE
}

/** Get the effective pool limit for a plan (-1 means unlimited) */
export function getPoolLimit(planType: string): number {
  const plan = getPlanDefinition(planType)
  return plan.features.poolLimit ?? -1
}

/** Get the monthly analysis limit (-1 means unlimited) */
export function getAnalysisLimit(planType: string): number {
  const plan = getPlanDefinition(planType)
  return plan.features.analysesPerMonth ?? -1
}

/** Check if a plan has access to the maintenance log */
export function hasMaintenanceLog(planType: string): boolean {
  return getPlanDefinition(planType).features.maintenanceLog
}

/** Check if a plan has PDF report capability */
export function hasPDFReports(planType: string): boolean {
  return getPlanDefinition(planType).features.pdfReports
}

/** Check if a plan has email report delivery */
export function hasEmailReports(planType: string): boolean {
  return getPlanDefinition(planType).features.emailReports
}

/** Check if a plan is a professional plan (Pool Pro or higher) */
export function isProfessionalPlan(planType: string): boolean {
  return ['POOL_PRO', 'POOL_TEAM', 'ENTERPRISE'].includes(planType)
}

/** Check if a plan has a free trial */
export function hasTrial(planType: string): boolean {
  return getPlanDefinition(planType).features.trial
}

/**
 * Determine which upgrade a user should be shown.
 * Returns the next logical plan above the user's current plan.
 */
export function getUpgradePlan(currentPlan: string, userType: UserType = 'homeowner'): PlanDefinition | null {
  switch (currentPlan) {
    case 'FREE':
      return userType === 'professional'
        ? PLAN_DEFINITIONS.POOL_PRO
        : PLAN_DEFINITIONS.HOMEOWNER_PLUS
    case 'HOMEOWNER_PLUS':
      return PLAN_DEFINITIONS.POOL_PRO
    case 'POOL_PRO':
      return PLAN_DEFINITIONS.POOL_TEAM
    case 'POOL_TEAM':
      return PLAN_DEFINITIONS.ENTERPRISE
    default:
      return null
  }
}

/** Ordered list of plans for comparison table */
export const PLAN_ORDER: PlanType[] = [
  'FREE',
  'HOMEOWNER_PLUS',
  'POOL_PRO',
  'POOL_TEAM',
  'ENTERPRISE',
]

/** Comparison table rows for the pricing page */
export const COMPARISON_FEATURES: {
  label: string
  key: keyof PlanFeatures
  format?: 'boolean' | 'number' | 'days'
}[] = [
  { label: 'Pool profiles',              key: 'poolLimit',          format: 'number' },
  { label: 'Analyses per month',         key: 'analysesPerMonth',   format: 'number' },
  { label: 'Chemistry history',          key: 'historyDays',        format: 'days'   },
  { label: 'Full AI explanations',       key: 'fullAIExplanations', format: 'boolean'},
  { label: 'PDF reports',                key: 'pdfReports',         format: 'boolean'},
  { label: 'Email report delivery',      key: 'emailReports',       format: 'boolean'},
  { label: 'Maintenance log & checklists',key:'maintenanceLog',     format: 'boolean'},
  { label: 'Team members',               key: 'teamMembers',        format: 'boolean'},
  { label: 'Branded reports',            key: 'brandedReports',     format: 'boolean'},
  { label: 'Role-based access',          key: 'rbac',               format: 'boolean'},
  { label: 'API access',                 key: 'apiAccess',          format: 'boolean'},
]
