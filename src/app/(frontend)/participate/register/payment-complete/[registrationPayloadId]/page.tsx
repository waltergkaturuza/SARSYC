'use client'

import { useEffect, useState, Suspense } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { FiCheck, FiLoader, FiAlertCircle } from 'react-icons/fi'
import { showToast } from '@/lib/toast'

function PaymentCompleteInner({ registrationPayloadId }: { registrationPayloadId: string }) {
  const searchParams = useSearchParams()
  const ref = searchParams.get('ref')

  const [phase, setPhase] = useState<'loading' | 'success' | 'pending' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const [registrationIdDisplay, setRegistrationIdDisplay] = useState('')

  useEffect(() => {
    if (!ref) {
      setPhase('error')
      setMessage(
        'Missing payment reference from Stanbic/N-Genius. Return here from the bank page after paying, or contact sarsyc@saywhat.org.zw.',
      )
      showToast.error('Missing payment reference. Open the link from the bank page or contact support.')
      return
    }

    let cancelled = false
    ;(async () => {
      const verifyOnce = async () =>
        fetch('/api/payments/stanbic/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ref,
            registrationPayloadId,
          }),
        })

      try {
        let res = await verifyOnce()
        // One delayed retry — gateway / cold starts sometimes fail right after bank redirect.
        if (!cancelled && !res.ok && res.status >= 502) {
          await new Promise((r) => setTimeout(r, 2800))
          if (!cancelled) res = await verifyOnce()
        }

        const data = await res.json().catch(() => ({}))

        if (cancelled) return

        if (!res.ok) {
          setPhase('error')
          setMessage(data.error || 'Could not verify payment. Please contact sarsyc@saywhat.org.zw.')
          showToast.error(data.error || 'Could not verify payment.')
          return
        }

        if (data.registrationId) setRegistrationIdDisplay(String(data.registrationId))

        if (data.paid) {
          setPhase('success')
          setMessage('Your payment was received. Registration is confirmed.')
          showToast.success('Payment received — your registration is confirmed.')
        } else {
          setPhase('pending')
          setMessage(
            'Payment is not confirmed yet or was unsuccessful. If you completed payment, wait a minute and refresh, or email sarsyc@saywhat.org.zw with your registration ID.',
          )
          showToast.info(
            'Payment not confirmed yet. If you paid, wait a moment and refresh — or check your email.',
          )
        }
      } catch {
        if (!cancelled) {
          setPhase('error')
          setMessage('Something went wrong. Please try again or contact sarsyc@saywhat.org.zw.')
          showToast.error('Something went wrong while verifying payment.')
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [registrationPayloadId, ref])

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
              <p className="text-sm text-gray-500 mb-6">
                Registration ID: <span className="font-mono font-semibold">{registrationIdDisplay}</span>
              </p>
            )}
            <Link href="/" className="btn-primary inline-block">
              Back to home
            </Link>
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
            <Link href="/participate/register" className="btn-primary inline-block">
              Back to registration
            </Link>
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
