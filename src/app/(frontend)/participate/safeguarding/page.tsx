'use client'

import { Suspense, useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { FiCheck, FiLoader, FiAlertCircle, FiExternalLink } from 'react-icons/fi'
import { showToast } from '@/lib/toast'
import { SAFEGUARDING_POLICY_ITEMS, SAFEGUARDING_TRAINING_URL } from '@/lib/safeguarding'

type LoadState = {
  registrationId: string
  firstName: string
  paymentSettled: boolean
  acknowledged: boolean
}

function SafeguardingForm() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')?.trim() ?? ''

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [info, setInfo] = useState<LoadState | null>(null)
  const [checks, setChecks] = useState<Record<string, boolean>>({})
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!token) {
      setError('This link is invalid. Open the link from your safeguarding training email.')
      setLoading(false)
      return
    }

    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch(`/api/registrations/safeguarding?token=${encodeURIComponent(token)}`)
        const data = await res.json()
        if (cancelled) return
        if (!res.ok) {
          setError(data.error || 'Could not load your registration.')
          return
        }
        setInfo({
          registrationId: data.registrationId,
          firstName: data.firstName || '',
          paymentSettled: Boolean(data.paymentSettled),
          acknowledged: Boolean(data.acknowledged),
        })
        if (data.acknowledged) setDone(true)
      } catch {
        if (!cancelled) setError('Could not load the form. Please try again.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [token])

  const toggle = (id: string) => {
    setChecks((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const allChecked = SAFEGUARDING_POLICY_ITEMS.every((item) => checks[item.id])

  const onSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!token || !allChecked) {
        showToast.error('Please confirm every item before submitting.')
        return
      }
      setSubmitting(true)
      try {
        const body: Record<string, unknown> = { token }
        for (const item of SAFEGUARDING_POLICY_ITEMS) {
          body[item.id] = true
        }
        const res = await fetch('/api/registrations/safeguarding', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
        const data = await res.json()
        if (!res.ok) {
          showToast.error(data.error || 'Submission failed.')
          return
        }
        setDone(true)
        showToast.success('Safeguarding acknowledgment recorded. Your registration is now complete.')
      } catch {
        showToast.error('Something went wrong. Please try again.')
      } finally {
        setSubmitting(false)
      }
    },
    [token, allChecked],
  )

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-600">
        <FiLoader className="w-10 h-10 animate-spin text-primary-600 mb-4" aria-hidden />
        <p>Loading safeguarding form…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-lg p-8 border border-red-100 text-center">
        <FiAlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" aria-hidden />
        <h1 className="text-2xl font-bold text-gray-900 mb-3">Unable to open form</h1>
        <p className="text-gray-600 mb-6">{error}</p>
        <Link href="/" className="btn-outline">
          Back to homepage
        </Link>
      </div>
    )
  }

  if (done && info) {
    return (
      <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-lg p-8 border border-green-100 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FiCheck className="w-8 h-8 text-green-600" aria-hidden />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">Safeguarding complete</h1>
        <p className="text-gray-600 mb-2">
          Thank you{info.firstName ? `, ${info.firstName}` : ''}. Your acknowledgment for registration{' '}
          <strong className="font-mono">{info.registrationId}</strong> is on file.
        </p>
        <p className="text-gray-600 mb-6">You are now fully registered for SARSYC VI from a safeguarding perspective.</p>
        <Link href="/track" className="btn-primary inline-block">
          Track registration
        </Link>
      </div>
    )
  }

  if (!info) return null

  if (!info.paymentSettled) {
    return (
      <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-lg p-8 border border-amber-100">
        <FiAlertCircle className="w-12 h-12 text-amber-500 mb-4" aria-hidden />
        <h1 className="text-2xl font-bold text-gray-900 mb-3">Payment not confirmed yet</h1>
        <p className="text-gray-600 mb-4">
          Registration <strong className="font-mono">{info.registrationId}</strong> must have a confirmed payment
          before you can submit the safeguarding acknowledgment. If you paid by bank transfer, wait until we verify
          your proof of payment — you will receive confirmation, then use this link again.
        </p>
        <Link href="/track" className="btn-outline">
          Track registration status
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-8 md:p-10 border border-gray-100">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Safeguarding training & acknowledgment</h1>
      <p className="text-gray-600 mb-6">
        SARSYC VI — registration <strong className="font-mono">{info.registrationId}</strong>
        {info.firstName ? ` — ${info.firstName}` : ''}
      </p>

      <div className="bg-primary-50 rounded-lg p-5 mb-6 border border-primary-100">
        <p className="font-semibold text-gray-900 mb-2">Step 1 — Watch the training video</p>
        <a
          href={SAFEGUARDING_TRAINING_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-primary-600 font-medium hover:underline"
        >
          Open safeguarding training on YouTube
          <FiExternalLink className="w-4 h-4" aria-hidden />
        </a>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <p className="font-semibold text-gray-900">Step 2 — Confirm your understanding (all required)</p>
        <p className="text-sm text-gray-600 mb-2">
          SAYWHAT has a <strong>zero tolerance</strong> approach. By submitting, you acknowledge that you have gone
          through the training and understand:
        </p>
        <ul className="space-y-3">
          {SAFEGUARDING_POLICY_ITEMS.map((item) => (
            <li key={item.id} className="flex items-start gap-3 text-sm text-gray-800">
              <input
                type="checkbox"
                id={item.id}
                checked={Boolean(checks[item.id])}
                onChange={() => toggle(item.id)}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <label htmlFor={item.id} className="cursor-pointer">
                {item.label}
              </label>
            </li>
          ))}
        </ul>

        <button
          type="submit"
          disabled={!allChecked || submitting}
          className="btn-primary w-full mt-6 disabled:opacity-60 inline-flex items-center justify-center gap-2"
        >
          {submitting ? (
            <>
              <FiLoader className="w-5 h-5 animate-spin" aria-hidden />
              Submitting…
            </>
          ) : (
            'Submit safeguarding acknowledgment'
          )}
        </button>
      </form>
    </div>
  )
}

export default function SafeguardingPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container-custom">
        <Suspense
          fallback={
            <div className="flex justify-center py-20">
              <FiLoader className="w-10 h-10 animate-spin text-primary-600" aria-hidden />
            </div>
          }
        >
          <SafeguardingForm />
        </Suspense>
      </div>
    </div>
  )
}
