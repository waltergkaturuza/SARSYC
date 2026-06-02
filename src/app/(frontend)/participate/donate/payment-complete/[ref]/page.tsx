'use client'

import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { FiCheckCircle, FiAlertCircle, FiLoader, FiArrowRight } from 'react-icons/fi'

async function verifyDonationPayment(donationId: string, orderRef: string) {
  const res = await fetch('/api/payments/donate/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      donationId,
      orderRef: orderRef || undefined,
    }),
  })
  const data = await res.json().catch(() => ({}))
  return { ok: res.ok, data }
}

export default function DonatePaymentCompletePage() {
  const params = useParams()
  const ref = params?.ref ? decodeURIComponent(String(params.ref)) : ''
  const [status, setStatus] = useState<'loading' | 'success' | 'pending' | 'failed'>('loading')
  const [orderRef, setOrderRef] = useState('')

  const runVerification = useCallback(async () => {
    if (!ref) {
      setStatus('pending')
      return
    }

    const searchParams = new URLSearchParams(window.location.search)
    const nRef = searchParams.get('ref') ?? searchParams.get('order-ref') ?? ''
    setOrderRef(nRef)

    let result = await verifyDonationPayment(ref, nRef)
    if (!result.ok && result.data?.error) {
      setStatus('failed')
      return
    }

    if (result.data?.paid) {
      setStatus('success')
      return
    }
    if (result.data?.failed) {
      setStatus('failed')
      return
    }

    // Gateway can lag a few seconds after bank success — retry with stored order ref.
    for (let attempt = 0; attempt < 4; attempt++) {
      await new Promise((resolve) => setTimeout(resolve, attempt === 0 ? 2500 : 3000))
      result = await verifyDonationPayment(ref, nRef)
      if (result.data?.paid) {
        setStatus('success')
        return
      }
      if (result.data?.failed) {
        setStatus('failed')
        return
      }
    }

    setStatus('pending')
  }, [ref])

  useEffect(() => {
    void runVerification()
  }, [runVerification])

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="bg-gray-800 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl border border-gray-700">
        {status === 'loading' && (
          <>
            <FiLoader className="animate-spin mx-auto mb-4 text-primary-400" size={48} />
            <h1 className="text-xl font-bold text-white mb-2">Verifying payment…</h1>
            <p className="text-gray-400 text-sm">Please wait while we confirm your payment with the bank.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <FiCheckCircle className="mx-auto mb-4 text-green-400" size={56} />
            <h1 className="text-2xl font-bold text-white mb-2">Thank you!</h1>
            <p className="text-gray-300 text-sm mb-4">
              Your payment has been confirmed. Your support makes SARSYC VI possible — we truly appreciate it.
            </p>
            {ref && (
              <p className="text-xs text-gray-500 mb-6">Reference: <span className="font-mono text-gray-300">{ref}</span></p>
            )}
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-500 text-white px-6 py-3 rounded-xl font-medium transition-colors"
            >
              Back to Home <FiArrowRight size={16} />
            </Link>
          </>
        )}

        {status === 'pending' && (
          <>
            <FiAlertCircle className="mx-auto mb-4 text-yellow-400" size={56} />
            <h1 className="text-xl font-bold text-white mb-2">Payment pending</h1>
            <p className="text-gray-300 text-sm mb-4">
              We haven&apos;t received confirmation yet. If you completed the payment, it may take a few
              minutes. Please check your email, or contact us with reference{' '}
              <span className="font-mono text-gray-200">{ref}</span>.
            </p>
            {orderRef ? (
              <p className="text-xs text-gray-500 mb-4 font-mono">Gateway ref: {orderRef}</p>
            ) : null}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                type="button"
                onClick={() => {
                  setStatus('loading')
                  void runVerification()
                }}
                className="px-5 py-2.5 rounded-xl bg-gray-700 hover:bg-gray-600 text-white font-medium text-sm transition-colors"
              >
                Check again
              </button>
              <Link href="/participate/donate" className="px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-medium text-sm transition-colors">
                Try Again
              </Link>
              <a
                href="mailto:researchunit@saywhat.org.zw"
                className="px-5 py-2.5 rounded-xl border border-gray-600 hover:border-gray-400 text-gray-300 font-medium text-sm transition-colors"
              >
                Contact Us
              </a>
            </div>
          </>
        )}

        {status === 'failed' && (
          <>
            <FiAlertCircle className="mx-auto mb-4 text-red-400" size={56} />
            <h1 className="text-xl font-bold text-white mb-2">Payment not completed</h1>
            <p className="text-gray-300 text-sm mb-6">
              The payment was not completed. You can try again or use the bank transfer option.
            </p>
            <Link
              href="/participate/donate"
              className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-500 text-white px-6 py-3 rounded-xl font-medium transition-colors"
            >
              Try Again <FiArrowRight size={16} />
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
