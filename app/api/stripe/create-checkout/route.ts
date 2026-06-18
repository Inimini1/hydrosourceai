import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { stripe, getPriceId } from '@/lib/stripe'
import { getPlanDefinition } from '@/lib/plans'
import type { PlanType, BillingCycle } from '@/lib/plans'
import type Stripe from 'stripe'

export async function POST(req: NextRequest) {
  const auth = await getAuthUser(req)
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { planType, billingCycle } = (await req.json()) as {
    planType?: PlanType
    billingCycle?: BillingCycle
  }

  if (!planType || !billingCycle) {
    return NextResponse.json({ error: 'planType and billingCycle are required.' }, { status: 400 })
  }

  const plan = getPlanDefinition(planType)

  // Only paid plans go through Stripe
  if (planType === 'FREE' || planType === 'ENTERPRISE') {
    return NextResponse.json({ error: 'This plan does not require Stripe checkout.' }, { status: 400 })
  }

  const priceId = getPriceId(planType, billingCycle)
  if (!priceId) {
    return NextResponse.json({ error: `Stripe price ID not configured for ${planType} ${billingCycle}.` }, { status: 500 })
  }

  const user = await prisma.user.findUnique({ where: { id: auth.userId } })
  if (!user) return NextResponse.json({ error: 'User not found.' }, { status: 404 })

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://hydrosource.appscloud365.com'

  // Ensure Stripe customer record exists
  let customerId = (
    await prisma.subscription.findUnique({ where: { userId: auth.userId } })
  )?.stripeCustomerId ?? null

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.displayName ?? undefined,
      metadata: { userId: auth.userId },
    })
    customerId = customer.id
    await prisma.subscription.upsert({
      where: { userId: auth.userId },
      create: { userId: auth.userId, stripeCustomerId: customerId },
      update: { stripeCustomerId: customerId },
    })
  }

  // Build subscription_data with plan metadata
  const subscriptionData: Stripe.Checkout.SessionCreateParams.SubscriptionData = {
    metadata: {
      userId: auth.userId,
      planType,
      billingCycle,
      pool_limit: String(plan.features.poolLimit ?? 99999),
    },
  }

  // Add trial period for Pro plans (no credit card required)
  if (plan.features.trial && plan.features.trialDays > 0) {
    subscriptionData.trial_period_days = plan.features.trialDays
  }

  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${appUrl}/billing?success=1&plan=${planType}`,
    cancel_url:  `${appUrl}/pricing?cancelled=1`,
    metadata: {
      userId: auth.userId,
      planType,
      billingCycle,
      user_type: ['POOL_PRO', 'POOL_TEAM', 'ENTERPRISE'].includes(planType) ? 'professional' : 'homeowner',
      plan_name: plan.name,
    },
    subscription_data: subscriptionData,
    // No card required during trial
    ...(plan.features.trial && plan.features.trialDays > 0
      ? { payment_method_collection: 'if_required' as const }
      : {}),
  }

  const session = await stripe.checkout.sessions.create(sessionParams)

  return NextResponse.json({ url: session.url })
}
