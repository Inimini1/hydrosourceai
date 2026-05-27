import Stripe from 'stripe'

const stripeKey = process.env.STRIPE_SECRET_KEY ?? 'sk_test_placeholder'

export const stripe = new Stripe(stripeKey, {
  apiVersion: '2025-02-24.acacia',
})

export const PLANS = {
  FREE: { name: 'Free', price: 0, tests: 5 },
  PRO_MONTHLY: {
    name: 'Pro Monthly',
    price: 9.99,
    priceId: process.env.STRIPE_PRO_MONTHLY_PRICE_ID ?? '',
    tests: Infinity,
  },
  PRO_YEARLY: {
    name: 'Pro Yearly',
    price: 99,
    priceId: process.env.STRIPE_PRO_YEARLY_PRICE_ID ?? '',
    tests: Infinity,
  },
} as const
