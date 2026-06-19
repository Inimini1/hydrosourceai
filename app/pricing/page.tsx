import { Suspense } from 'react'
import PricingClient from './PricingClient'

export default function PricingPage() {
  return (
    <Suspense>
      <PricingClient />
    </Suspense>
  )
}
