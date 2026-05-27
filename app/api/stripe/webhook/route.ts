import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { createAdminClient } from '@/lib/supabase/admin'
import type Stripe from 'stripe'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Missing signature or secret.' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    // constructEvent validates the signature AND the event timestamp (rejects events > 5 min old)
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch {
    return NextResponse.json({ error: 'Invalid webhook signature.' }, { status: 400 })
  }

  // Idempotency guard — prevent duplicate processing if Stripe retries the event
  const admin = createAdminClient()
  const { error: dupError } = await admin
    .from('stripe_processed_events')
    .insert({ event_id: event.id })
  if (dupError) {
    // unique constraint violation means we already handled this event
    if (dupError.code === '23505') {
      return NextResponse.json({ received: true })
    }
    // Other DB errors — still process but log
    console.error('Stripe idempotency check failed:', dupError.message)
  }

  async function getCustomerUserId(customerId: string): Promise<string | null> {
    const sub = await prisma.subscription.findFirst({ where: { stripeCustomerId: customerId } })
    return sub?.userId ?? null
  }

  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription
      const userId = await getCustomerUserId(subscription.customer as string)
      if (!userId) break

      const status = subscription.status === 'active' ? 'PRO' : 'FREE'
      await prisma.user.update({ where: { id: userId }, data: { subscriptionStatus: status } })
      await prisma.subscription.updateMany({
        where: { userId },
        data: {
          stripeSubId: subscription.id,
          stripePriceId: subscription.items.data[0]?.price.id,
          planType: status,
          status: subscription.status,
          currentPeriodEnd: new Date((subscription as unknown as { current_period_end: number }).current_period_end * 1000),
        },
      })
      break
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription
      const userId = await getCustomerUserId(subscription.customer as string)
      if (!userId) break

      await prisma.user.update({ where: { id: userId }, data: { subscriptionStatus: 'FREE' } })
      await prisma.subscription.updateMany({
        where: { userId },
        data: { planType: 'FREE', status: 'cancelled' },
      })
      break
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice
      const userId = await getCustomerUserId(invoice.customer as string)
      if (!userId) break

      await prisma.user.update({ where: { id: userId }, data: { subscriptionStatus: 'FREE' } })
      await prisma.subscription.updateMany({
        where: { userId },
        data: { planType: 'FREE', status: 'past_due' },
      })
      await prisma.notification.create({
        data: {
          userId,
          type: 'SUBSCRIPTION',
          title: 'Payment failed',
          message: 'Your Pro subscription payment failed. Update your payment method to restore access.',
        },
      })
      break
    }

    case 'invoice.payment_succeeded': {
      const invoice = event.data.object as Stripe.Invoice
      if (!invoice.subscription) break
      const userId = await getCustomerUserId(invoice.customer as string)
      if (!userId) break

      await prisma.user.update({ where: { id: userId }, data: { subscriptionStatus: 'PRO' } })
      await prisma.subscription.updateMany({
        where: { userId },
        data: { planType: 'PRO', status: 'active' },
      })
      break
    }
  }

  return NextResponse.json({ received: true })
}
