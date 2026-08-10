import { Suspense } from 'react'
import type { Metadata } from 'next'
import PricingClient from './PricingClient'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Pricing — HydroSource AI',
  description: 'Simple plans for pool owners and professionals. Start free, upgrade for unlimited analyses, PDF reports, email delivery, and maintenance logs.',
}

export default function PricingPage() {
  return (
    <Suspense>
      <PricingClient />
    </Suspense>
  )
}
