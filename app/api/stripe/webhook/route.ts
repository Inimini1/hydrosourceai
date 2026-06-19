import { NextRequest, NextResponse } from 'next/server'
import { stripe, getPlanTypeFromPriceId, getBillingCycleFromPriceId, PLAN_POOL_LIMITS } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/admin'
import { PostHog } from 'posthog-node'
import type Stripe from 'stripe'
import type { PlanType } from '@/lib/plans'

function getPostHog() {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY
  if (!key) return null
  return new PostHog(key, { host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://us.i.posthog.com' })
}

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
    const { data } = await admin
      .from('subscriptions')
      .select('user_id')
      .eq('stripe_customer_id', customerId)
      .maybeSingle()
    return data?.user_id ?? null
  }

  function resolvePlanType(stripeSub: Stripe.Subscription): PlanType {
    const priceId = stripeSub.items.data[0]?.price.id ?? ''
    const metaPlan = (stripeSub.metadata?.planType ?? '') as PlanType
    const validPlans: PlanType[] = ['HOMEOWNER_PLUS', 'POOL_PRO', 'POOL_TEAM', 'ENTERPRISE']
    return validPlans.includes(metaPlan) ? metaPlan : getPlanTypeFromPriceId(priceId)
  }

  switch (event.type) {

    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const stripeSub = event.data.object as Stripe.Subscription
      const userId = await getUserIdFromCustomer(stripeSub.customer as string)
      if (!userId) { console.error('[webhook] No userId for customer', stripeSub.customer); break }

      const planType = resolvePlanType(stripeSub)
      const billingCycle = getBillingCycleFromPriceId(stripeSub.items.data[0]?.price.id ?? '')
      const poolLimit = PLAN_POOL_LIMITS[planType] ?? 1
      const isCancelled = stripeSub.status === 'canceled'
      const resolvedPlanType: PlanType = (stripeSub.status === 'active' || stripeSub.status === 'trialing') ? planType : 'FREE'
      const trialEndsAt = stripeSub.trial_end ? new Date(stripeSub.trial_end * 1000).toISOString() : null

      // Cast bypasses stale generated types for new columns added in migration 006
      await (admin.from('subscriptions') as unknown as {
        upsert: (d: Record<string, unknown>, opts: Record<string, unknown>) => Promise<unknown>
      }).upsert({
        user_id: userId,
        stripe_sub_id: stripeSub.id,
        stripe_price_id: stripeSub.items.data[0]?.price.id,
        stripe_customer_id: stripeSub.customer as string,
        plan_type: isCancelled ? 'FREE' : resolvedPlanType,
        billing_cycle: billingCycle,
        status: stripeSub.status,
        current_period_end: new Date(stripeSub.current_period_end * 1000).toISOString(),
        trial_ends_at: trialEndsAt,
        cancel_at_period_end: stripeSub.cancel_at_period_end,
        pool_limit: poolLimit,
      }, { onConflict: 'user_id' })

      const ph = getPostHog()
      if (ph) {
        if (stripeSub.status === 'trialing' && event.type === 'customer.subscription.created') {
          ph.capture({ distinctId: userId, event: 'trial_started', properties: { plan: planType, billing_cycle: billingCycle } })
        } else if (stripeSub.status === 'active' && event.type === 'customer.subscription.updated') {
          const prev = event.data.previous_attributes as Record<string, unknown> | undefined
          if (prev?.status === 'trialing') {
            ph.capture({ distinctId: userId, event: 'trial_converted', properties: { plan: planType, billing_cycle: billingCycle } })
          } else {
            ph.capture({ distinctId: userId, event: 'upgrade_completed', properties: { plan: planType, billing_cycle: billingCycle } })
          }
        }
        await ph.shutdown()
      }

      if (stripeSub.status === 'trialing' && event.type === 'customer.subscription.created') {
        const trialEnd = trialEndsAt
          ? new Date(trialEndsAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
          : 'in 14 days'
        await admin.from('notifications').insert({
          user_id: userId,
          type: 'SUBSCRIPTION',
          title: `${planType === 'POOL_PRO' ? 'Pool Pro' : 'Pool Team'} trial started`,
          message: `Your 14-day free trial is active. Trial ends ${trialEnd}. No charge until then.`,
        })
      }
      break
    }

    case 'customer.subscription.deleted': {
      const stripeSub = event.data.object as Stripe.Subscription
      const userId = await getUserIdFromCustomer(stripeSub.customer as string)
      if (!userId) break

      await (admin.from('subscriptions') as unknown as {
        update: (d: Record<string, unknown>) => { eq: (col: string, val: string) => Promise<unknown> }
      }).update({ plan_type: 'FREE', status: 'cancelled', cancel_at_period_end: false, pool_limit: 1 }).eq('user_id', userId)

      await admin.from('notifications').insert({
        user_id: userId,
        type: 'SUBSCRIPTION',
        title: 'Subscription cancelled',
        message: 'Your subscription has ended. You\'ve been moved to the Free plan. Upgrade anytime to restore access.',
      })

      const ph = getPostHog()
      if (ph) { ph.capture({ distinctId: userId, event: 'subscription_cancelled' }); await ph.shutdown() }
      break
    }

    case 'customer.subscription.trial_will_end': {
      const stripeSub = event.data.object as Stripe.Subscription
      const userId = await getUserIdFromCustomer(stripeSub.customer as string)
      if (!userId) break

      await admin.from('notifications').insert({
        user_id: userId,
        type: 'SUBSCRIPTION',
        title: 'Trial ending in 3 days',
        message: 'Your free trial ends in 3 days. Add a payment method in Billing to keep your Pro access.',
      })
      break
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice
      const userId = await getUserIdFromCustomer(invoice.customer as string)
      if (!userId) break

      const attemptCount = invoice.attempt_count ?? 1
      if (attemptCount >= 2) {
        await (admin.from('subscriptions') as unknown as {
          update: (d: Record<string, unknown>) => { eq: (col: string, val: string) => Promise<unknown> }
        }).update({ plan_type: 'FREE', status: 'past_due' }).eq('user_id', userId)
      }

      await admin.from('notifications').insert({
        user_id: userId,
        type: 'SUBSCRIPTION',
        title: 'Payment failed',
        message: attemptCount === 1
          ? 'Your payment failed. Please update your payment method in Billing before the next retry.'
          : 'Your payment failed again. Access has been restricted to the Free plan. Update your payment method to restore Pro access.',
      })
      break
    }

    case 'invoice.payment_succeeded': {
      const invoice = event.data.object as Stripe.Invoice
      if (!invoice.subscription) break
      const userId = await getUserIdFromCustomer(invoice.customer as string)
      if (!userId) break

      const stripeSub = await stripe.subscriptions.retrieve(invoice.subscription as string)
      const planType = resolvePlanType(stripeSub)
      const poolLimit = PLAN_POOL_LIMITS[planType] ?? 1

      await (admin.from('subscriptions') as unknown as {
        update: (d: Record<string, unknown>) => { eq: (col: string, val: string) => Promise<unknown> }
      }).update({ plan_type: planType, status: 'active', pool_limit: poolLimit }).eq('user_id', userId)
      break
    }
  }

  return NextResponse.json({ received: true })
}
