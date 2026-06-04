'use client'

import { Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { FiLoader } from 'react-icons/fi'

/**
 * Stanbic/N-Genius return URL shared with registration allow-list.
 * Forwards donors to the donate payment-complete page (preserves gateway ?ref=).
 */
function PaymentReturnRedirect() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const flow = searchParams.get('flow')
    const donationId = searchParams.get('donationId')?.trim()
    const registrationPayloadId = searchParams.get('registrationPayloadId')?.trim()
    const gatewayRef = searchParams.get('ref') ?? searchParams.get('order-ref') ?? ''
    const refQuery = gatewayRef ? `?ref=${encodeURIComponent(gatewayRef)}` : ''

    if (flow === 'donate' && donationId) {
      router.replace(
        `/participate/donate/payment-complete/${encodeURIComponent(donationId)}${refQuery}`,
      )
      return
    }

    if (registrationPayloadId) {
      router.replace(
        `/participate/register/payment-complete/${encodeURIComponent(registrationPayloadId)}${refQuery}`,
      )
      return
    }

    router.replace('/participate/donate')
  }, [router, searchParams])

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="text-center text-white">
        <FiLoader className="animate-spin mx-auto mb-4 text-primary-400" size={40} />
        <p className="text-sm text-gray-400">Returning from secure payment…</p>
      </div>
    </div>
  )
}

export default function StanbicPaymentReturnPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
          <FiLoader className="animate-spin text-primary-400" size={40} />
        </div>
      }
    >
      <PaymentReturnRedirect />
    </Suspense>
  )
}
