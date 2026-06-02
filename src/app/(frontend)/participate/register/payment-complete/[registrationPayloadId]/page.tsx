'use client'

import { Suspense, useCallback, useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { FiCheck, FiLoader, FiAlertCircle } from 'react-icons/fi'
import { showToast } from '@/lib/toast'

async function verifyRegistrationPayment(registrationPayloadId: string, ref: string) {
  const res = await fetch('/api/payments/stanbic/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      registrationPayloadId,
      ref: ref || undefined,
    }),
  })
  const data = await res.json().catch(() => ({}))
  return { ok: res.ok, data }
}

function PaymentCompleteInner({ registrationPayloadId }: { registrationPayloadId: string }) {
  const searchParams = useSearchParams()
  const gatewayRef = searchParams.get('ref') ?? searchParams.get('order-ref') ?? ''

  const [phase, setPhase] = useState<'loading' | 'success' | 'pending' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const [registrationIdDisplay, setRegistrationIdDisplay] = useState('')

  const runVerification = useCallback(async () => {
    let result = await verifyRegistrationPayment(registrationPayloadId, gatewayRef)

    if (!result.ok && result.data?.error && !result.data?.pending) {
      setPhase('error')
      setMessage(result.data.error || 'Could not verify payment. Please contact sarsyc@saywhat.org.zw.')
      showToast.error(result.data.error || 'Could not verify payment.')
      return
    }

    if (result.data.registrationId) {
      setRegistrationIdDisplay(String(result.data.registrationId))
    }

    if (result.data.paid) {
      setPhase('success')
      setMessage(
        'Your payment was received. Check your email for the mandatory safeguarding training link — you must complete that acknowledgment before you are fully registered.',
      )
      showToast.success('Payment received — complete safeguarding training from your email.')
      return
    }

    for (let attempt = 0; attempt < 4; attempt++) {
      await new Promise((resolve) => setTimeout(resolve, attempt === 0 ? 2500 : 3000))
      result = await verifyRegistrationPayment(registrationPayloadId, gatewayRef)
      if (result.data.registrationId) {
        setRegistrationIdDisplay(String(result.data.registrationId))
      }
      if (result.data.paid) {
        setPhase('success')
        setMessage(
          'Your payment was received. Check your email for the mandatory safeguarding training link — you must complete that acknowledgment before you are fully registered.',
        )
        showToast.success('Payment received — complete safeguarding training from your email.')
        return
      }
    }

    setPhase('pending')
    setMessage(
      'Payment is not confirmed yet or was unsuccessful. If you completed payment, wait a minute and refresh, or email sarsyc@saywhat.org.zw with your registration ID.',
    )
    showToast.info(
      'Payment not confirmed yet. If you paid, wait a moment and refresh — or check your email.',
    )
  }, [gatewayRef, registrationPayloadId])

  useEffect(() => {
    void runVerification()
  }, [runVerification])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-8 md:p-10 text-center border border-gray-100">
        {phase === 'loading' && (
          <>
            <FiLoader className="w-12 h-12 text-primary-600 animate-spin mx-auto mb-6" aria-hidden />
            <h1 className="text-xl font-bold text-gray-900 mb-2">Confirming your payment…</h1>
            <p className="text-gray-600 text-sm">This usually takes only a moment.</p>
          </>
        )}

        {phase === 'success' && (
          <>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiCheck className="w-9 h-9 text-green-600" aria-hidden />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">Payment successful</h1>
            <p className="text-gray-700 mb-4">{message}</p>
            {registrationIdDisplay && (
              <p className="text-sm text-gray-500 mb-4">
                Registration ID: <span className="font-mono font-semibold">{registrationIdDisplay}</span>
              </p>
            )}
            <p className="text-sm text-amber-800 bg-amber-50 border border-amber-100 rounded-lg p-3 mb-6 text-left">
              Next step: open the safeguarding email we sent you, watch the training video, and submit the acknowledgment form.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/participate/safeguarding" className="btn-outline">
                Safeguarding form
              </Link>
              <Link href="/" className="btn-primary inline-block">
                Back to home
              </Link>
            </div>
          </>
        )}

        {phase === 'pending' && (
          <>
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiAlertCircle className="w-9 h-9 text-amber-600" aria-hidden />
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-3">Payment not confirmed</h1>
            <p className="text-gray-600 text-sm mb-6">{message}</p>
            {registrationIdDisplay && (
              <p className="text-xs text-gray-400 mb-4 font-mono">ID: {registrationIdDisplay}</p>
            )}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                type="button"
                onClick={() => {
                  setPhase('loading')
                  void runVerification()
                }}
                className="btn-outline"
              >
                Check again
              </button>
              <Link href="/" className="btn-outline">
                Home
              </Link>
              <a href="mailto:sarsyc@saywhat.org.zw" className="btn-primary inline-block">
                Email support
              </a>
            </div>
          </>
        )}

        {phase === 'error' && (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiAlertCircle className="w-9 h-9 text-red-600" aria-hidden />
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-3">Could not verify payment</h1>
            <p className="text-gray-600 text-sm mb-6">{message}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                type="button"
                onClick={() => {
                  setPhase('loading')
                  void runVerification()
                }}
                className="btn-outline"
              >
                Try again
              </button>
              <Link href="/participate/register" className="btn-primary inline-block">
                Back to registration
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default function PaymentCompletePage() {
  const params = useParams()
  const raw = params.registrationPayloadId
  const registrationPayloadId = Array.isArray(raw) ? raw[0] : raw

  if (!registrationPayloadId || typeof registrationPayloadId !== 'string') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <p className="text-gray-700">Invalid payment return link.</p>
      </div>
    )
  }

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
          <FiLoader className="w-10 h-10 text-primary-600 animate-spin" aria-hidden />
        </div>
      }
    >
      <PaymentCompleteInner registrationPayloadId={registrationPayloadId} />
    </Suspense>
  )
}
