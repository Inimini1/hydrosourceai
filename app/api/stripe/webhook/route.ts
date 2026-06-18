import { NextRequest, NextResponse } from 'next/server'
import { stripe, getPlanTypeFromPriceId, getBillingCycleFromPriceId, PLAN_POOL_LIMITS } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { createAdminClient } from '@/lib/supabase/admin'
import type Stripe from 'stripe'
import type { PlanType } from '@/lib/plans'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Missing signature or secret.' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch {
    return NextResponse.json({ error: 'Invalid webhook signature.' }, { status: 400 })
  }

  // Idempotency: reject duplicate events using Supabase dedup table
  const admin = createAdminClient()
  const { error: dupError } = await admin
    .from('stripe_processed_events')
    .insert({ event_id: event.id })
  if (dupError) {
    if (dupError.code === '23505') return NextResponse.json({ received: true })
    console.error('[webhook] Idempotency check failed:', dupError.message)
  }

  // ── Helpers ──────────────────────────────────────────────────────────────

  async function getUserIdFromCustomer(customerId: string): Promise<string | null> {
    const sub = await prisma.subscription.findFirst({ where: { stripeCustomerId: customerId } })
    return sub?.userId ?? null
  }

  /** Resolve planType from a Stripe subscription object */
  function resolvePlanType(stripeSub: Stripe.Subscription): PlanType {
    const priceId = stripeSub.items.data[0]?.price.id ?? ''
    // First check metadata (set at checkout), then fall back to price ID lookup
    const metaPlan = (stripeSub.metadata?.planType ?? '') as PlanType
    const validPlans: PlanType[] = ['HOMEOWNER_PLUS', 'POOL_PRO', 'POOL_TEAM', 'ENTERPRISE']
    return validPlans.includes(metaPlan) ? metaPlan : getPlanTypeFromPriceId(priceId)
  }

  // ── Event handlers ────────────────────────────────────────────────────────

  switch (event.type) {

    // ── Subscription created / updated ─────────────────────────────────────
    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const stripeSub = event.data.object as Stripe.Subscription
      const userId = await getUserIdFromCustomer(stripeSub.customer as string)
      if (!userId) { console.error('[webhook] No userId for customer', stripeSub.customer); break }

      const planType = resolvePlanType(stripeSub)
      const billingCycle = getBillingCycleFromPriceId(stripeSub.items.data[0]?.price.id ?? '')
      const poolLimit = PLAN_POOL_LIMITS[planType] ?? 1

      // Map Stripe status to our internal status
      const isCancelled = stripeSub.status === 'canceled'
      const resolvedPlanType: PlanType = (stripeSub.status === 'active' || stripeSub.status === 'trialing')
        ? planType
        : 'FREE'

      const trialEndsAt = stripeSub.trial_end
        ? new Date(stripeSub.trial_end * 1000)
        : null

      await prisma.user.update({
        where: { id: userId },
        data: { subscriptionStatus: isCancelled ? 'FREE' : planType },
      })

      await prisma.subscription.upsert({
        where: { userId },
        create: {
          userId,
          stripeSubId: stripeSub.id,
          stripePriceId: stripeSub.items.data[0]?.price.id,
          planType: resolvedPlanType,
          billingCycle,
          status: stripeSub.status,
          currentPeriodEnd: new Date(stripeSub.current_period_end * 1000),
          trialEndsAt,
          cancelAtPeriodEnd: stripeSub.cancel_at_period_end,
          poolLimit,
        },
        update: {
          stripeSubId: stripeSub.id,
          stripePriceId: stripeSub.items.data[0]?.price.id,
          planType: resolvedPlanType,
          billingCycle,
          status: stripeSub.status,
          currentPeriodEnd: new Date(stripeSub.current_period_end * 1000),
          trialEndsAt,
          cancelAtPeriodEnd: stripeSub.cancel_at_period_end,
          poolLimit,
        },
      })

      // Send "trial started" notification
      if (stripeSub.status === 'trialing' && event.type === 'customer.subscription.created') {
        const trialEnd = trialEndsAt
          ? trialEndsAt.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
          : 'in 14 days'
        await prisma.notification.create({
          data: {
            userId,
            type: 'SUBSCRIPTION',
            title: `${planType === 'POOL_PRO' ? 'Pool Pro' : 'Pool Team'} trial started`,
            message: `Your 14-day free trial is active. Trial ends ${trialEnd}. No charge until then.`,
          },
        })
      }
      break
    }

    // ── Subscription deleted / cancelled ──────────────────────────────────
    case 'customer.subscription.deleted': {
      const stripeSub = event.data.object as Stripe.Subscription
      const userId = await getUserIdFromCustomer(stripeSub.customer as string)
      if (!userId) break

      await prisma.user.update({ where: { id: userId }, data: { subscriptionStatus: 'FREE' } })
      await prisma.subscription.updateMany({
        where: { userId },
        data: { planType: 'FREE', status: 'cancelled', cancelAtPeriodEnd: false, poolLimit: 1 },
      })

      await prisma.notification.create({
        data: {
          userId,
          type: 'SUBSCRIPTION',
          title: 'Subscription cancelled',
          message: 'Your subscription has ended. You\'ve been moved to the Free plan. Upgrade anytime to restore access.',
        },
      })
      break
    }

    // ── Trial ending reminder ─────────────────────────────────────────────
    case 'customer.subscription.trial_will_end': {
      const stripeSub = event.data.object as Stripe.Subscription
      const userId = await getUserIdFromCustomer(stripeSub.customer as string)
      if (!userId) break

      await prisma.notification.create({
        data: {
          userId,
          type: 'SUBSCRIPTION',
          title: 'Trial ending in 3 days',
          message: 'Your free trial ends in 3 days. Add a payment method in Billing to keep your Pro access.',
        },
      })
      break
    }

    // ── Payment failed ────────────────────────────────────────────────────
    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice
      const userId = await getUserIdFromCustomer(invoice.customer as string)
      if (!userId) break

      // Only downgrade if it's not the first attempt (give grace period)
      const attemptCount = invoice.attempt_count ?? 1
      if (attemptCount >= 2) {
        await prisma.user.update({ where: { id: userId }, data: { subscriptionStatus: 'FREE' } })
        await prisma.subscription.updateMany({
          where: { userId },
          data: { planType: 'FREE', status: 'past_due' },
        })
      }

      await prisma.notification.create({
        data: {
          userId,
          type: 'SUBSCRIPTION',
          title: 'Payment failed',
          message: attemptCount === 1
            ? 'Your payment failed. Please update your payment method in Billing before the next retry.'
            : 'Your payment failed again. Access has been restricted to the Free plan. Update your payment method to restore Pro access.',
        },
      })
      break
    }

    // ── Payment succeeded ─────────────────────────────────────────────────
    case 'invoice.payment_succeeded': {
      const invoice = event.data.object as Stripe.Invoice
      if (!invoice.subscription) break
      const userId = await getUserIdFromCustomer(invoice.customer as string)
      if (!userId) break

      // Retrieve the subscription to get the plan type
      const stripeSub = await stripe.subscriptions.retrieve(invoice.subscription as string)
      const planType = resolvePlanType(stripeSub)
      const poolLimit = PLAN_POOL_LIMITS[planType] ?? 1

      await prisma.user.update({ where: { id: userId }, data: { subscriptionStatus: planType } })
      await prisma.subscription.updateMany({
        where: { userId },
        data: { planType, status: 'active', poolLimit },
      })
      break
    }
  }

  return NextResponse.json({ received: true })
}
