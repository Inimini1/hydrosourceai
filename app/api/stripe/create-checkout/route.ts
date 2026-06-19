import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { stripe, getPriceId } from '@/lib/stripe'
import { getPlanDefinition } from '@/lib/plans'
import type { PlanType, BillingCycle } from '@/lib/plans'
import type Stripe from 'stripe'

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { planType, billingCycle } = (await req.json()) as {
    planType?: PlanType
    billingCycle?: BillingCycle
  }

  if (!planType || !billingCycle) {
    return NextResponse.json({ error: 'planType and billingCycle are required.' }, { status: 400 })
  }

  if (planType === 'FREE' || planType === 'ENTERPRISE') {
    return NextResponse.json({ error: 'This plan does not require Stripe checkout.' }, { status: 400 })
  }

  const priceId = getPriceId(planType, billingCycle)
  if (!priceId) {
    return NextResponse.json({ error: `Stripe price ID not configured for ${planType} ${billingCycle}.` }, { status: 500 })
  }

  const plan = getPlanDefinition(planType)
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://hydrosource.appscloud365.com'
  const admin = createAdminClient()

  const { data: sub } = await admin
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('user_id', user.id)
    .maybeSingle()

  let customerId = sub?.stripe_customer_id ?? null

  if (!customerId) {
    const { data: profile } = await admin
      .from('profiles')
      .select('display_name')
      .eq('id', user.id)
      .maybeSingle()

    const customer = await stripe.customers.create({
      email: user.email!,
      name: profile?.display_name ?? undefined,
      metadata: { userId: user.id },
    })
    customerId = customer.id

    await admin.from('subscriptions').upsert({
      user_id: user.id,
      stripe_customer_id: customerId,
      plan_type: 'FREE',
    }, { onConflict: 'user_id' })
  }

  const subscriptionData: Stripe.Checkout.SessionCreateParams.SubscriptionData = {
    metadata: { userId: user.id, planType, billingCycle, pool_limit: String(plan.features.poolLimit ?? 99999) },
  }
  if (plan.features.trial && plan.features.trialDays > 0) {
    subscriptionData.trial_period_days = plan.features.trialDays
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${appUrl}/billing?success=1&plan=${planType}`,
    cancel_url:  `${appUrl}/pricing?cancelled=1`,
    metadata: { userId: user.id, planType, billingCycle, plan_name: plan.name },
    subscription_data: subscriptionData,
    ...(plan.features.trial && plan.features.trialDays > 0
      ? { payment_method_collection: 'if_required' as const }
      : {}),
  })

  return NextResponse.json({ url: session.url })
}
