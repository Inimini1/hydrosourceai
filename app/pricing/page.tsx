import { Suspense } from 'react'
import PricingClient from './PricingClient'

export const revalidate = 3600

export default function PricingPage() {
  return (
    <Suspense>
      <PricingClient />
    </Suspense>
  )
}
