import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { stripe, PLANS } from '@/lib/stripe'

export async function POST(req: NextRequest) {
  const auth = await getAuthUser(req)
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { interval } = await req.json()
  const priceId = interval === 'yearly' ? PLANS.PRO_YEARLY.priceId : PLANS.PRO_MONTHLY.priceId

  if (!priceId) {
    return NextResponse.json({ error: 'Stripe price ID not configured.' }, { status: 500 })
  }

  const user = await prisma.user.findUnique({ where: { id: auth.userId } })
  if (!user) return NextResponse.json({ error: 'User not found.' }, { status: 404 })

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://HydroSource.appscloud365.com'

  let customerId = (
    await prisma.subscription.findUnique({ where: { userId: auth.userId } })
  )?.stripeCustomerId

  if (!customerId) {
    const customer = await stripe.customers.create({ email: user.email })
    customerId = customer.id
    await prisma.subscription.upsert({
      where: { userId: auth.userId },
      create: { userId: auth.userId, stripeCustomerId: customerId },
      update: { stripeCustomerId: customerId },
    })
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${appUrl}/billing?success=1`,
    cancel_url: `${appUrl}/billing?cancelled=1`,
    metadata: { userId: auth.userId },
  })

  return NextResponse.json({ url: session.url })
}
