'use client'

import { useCallback, useEffect, useState, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { FiArrowLeft, FiCreditCard, FiLoader, FiCheckCircle, FiAlertCircle } from 'react-icons/fi'
import {
  REGISTRATION_PACKAGES,
  currencyForPayments,
  getRegistrationPricingTier,
  packageUsdForTier,
  type RegistrationPackageId,
} from '@/lib/registrationPackages'
import {
  REGISTRATION_BANK_PROOF_EMAILS,
  REGISTRATION_CONTACT_EMAIL,
  SARSYC_BANK_TRANSFER_DETAILS,
} from '@/lib/registrationBankTransfer'
import { showToast } from '@/lib/toast'

type ResumeInfo = {
  ok: boolean
  id: string
  registrationId: string
  firstName: string
  lastName: string
  email: string
  paymentStatus: string
  needsPackage: boolean
  registrationPackage: RegistrationPackageId | null
  packageName: string | null
  amountUsd: number | null
  hostedPaymentAvailable: boolean
  manualBankPayment: boolean
  alreadyPaid?: boolean
  message?: string
}

function CompletePaymentInner() {
  const searchParams = useSearchParams()
  const refFromUrl = searchParams.get('ref')?.trim() ?? ''

  const [registrationId, setRegistrationId] = useState(refFromUrl)
  const [email, setEmail] = useState('')
  const [selectedPackage, setSelectedPackage] = useState<RegistrationPackageId | ''>('')
  const [phase, setPhase] = useState<'form' | 'loading' | 'pay' | 'done' | 'error'>('form')
  const [info, setInfo] = useState<ResumeInfo | null>(null)
  const [error, setError] = useState('')
  const [payBusy, setPayBusy] = useState(false)

  useEffect(() => {
    if (refFromUrl) setRegistrationId(refFromUrl)
  }, [refFromUrl])

  const lookup = useCallback(
    async (pkg?: RegistrationPackageId) => {
      setPhase('loading')
      setError('')
      try {
        const res = await fetch('/api/registrations/resume-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            registrationId: registrationId.trim(),
            email: email.trim().toLowerCase(),
            ...(pkg ? { registrationPackage: pkg } : {}),
          }),
        })
        const data = await res.json()
        if (!res.ok) {
          setError(data.error || 'Could not find your registration.')
          setPhase('error')
          return
        }
        if (data.alreadyPaid) {
          setInfo(data as ResumeInfo)
          setPhase('done')
          return
        }
        if (data.needsPackage && !pkg) {
          setInfo(data as ResumeInfo)
          setPhase('pay')
          return
        }
        setInfo(data as ResumeInfo)
        if (data.registrationPackage) {
          setSelectedPackage(data.registrationPackage)
        }
        setPhase('pay')
      } catch {
        setError('Network error. Please try again.')
        setPhase('error')
      }
    },
    [registrationId, email],
  )

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault()
    if (!registrationId.trim() || !email.trim()) {
      showToast.error('Enter your registration ID and email.')
      return
    }
    void lookup()
  }

  const handlePackageContinue = () => {
    if (!selectedPackage) {
      showToast.error('Please select a registration package.')
      return
    }
    void lookup(selectedPackage)
  }

  const handlePayByCard = async () => {
    if (!info?.id) return
    setPayBusy(true)
    const loadId = showToast.loading('Opening secure payment…')
    try {
      const res = await fetch('/api/payments/stanbic/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          registrationPayloadId: info.id,
          registrationId: info.registrationId,
        }),
      })
      const data = await res.json()
      showToast.dismiss(loadId)
      if (res.ok && typeof data.redirectUrl === 'string' && data.redirectUrl.startsWith('http')) {
        window.location.href = data.redirectUrl
        return
      }
      showToast.error(data.error || 'Could not start payment. Try again or use bank transfer.')
    } catch {
      showToast.dismiss(loadId)
      showToast.error('Could not reach the payment service.')
    } finally {
      setPayBusy(false)
    }
  }

  const tier = getRegistrationPricingTier()
  const b = SARSYC_BANK_TRANSFER_DETAILS

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-lg mx-auto">
        <Link
          href="/participate/register"
          className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-800 text-sm mb-6"
        >
          <FiArrowLeft size={16} /> Back to registration
        </Link>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 md:p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Complete your payment</h1>
          <p className="text-gray-600 text-sm mb-6">
            Already registered? Enter your <strong>registration ID</strong> and <strong>email</strong> to
            pay the conference fee by card or bank transfer.
          </p>

          {(phase === 'form' || phase === 'error') && (
            <form onSubmit={handleLookup} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Registration ID
                </label>
                <input
                  value={registrationId}
                  onChange={(e) => setRegistrationId(e.target.value)}
                  placeholder="e.g. SARSYC-260317-ABCD12"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 font-mono text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Same email you used to register"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm"
                  required
                />
              </div>
              {error && (
                <p className="text-sm text-red-600 flex items-start gap-2">
                  <FiAlertCircle className="shrink-0 mt-0.5" /> {error}
                </p>
              )}
              <button type="submit" className="btn-primary w-full">
                Continue
              </button>
            </form>
          )}

          {phase === 'loading' && (
            <div className="py-12 text-center text-gray-500">
              <FiLoader className="animate-spin mx-auto mb-3" size={32} />
              Looking up your registration…
            </div>
          )}

          {phase === 'done' && info && (
            <div className="text-center py-6">
              <FiCheckCircle className="mx-auto text-green-500 mb-3" size={48} />
              <p className="text-gray-800 font-medium">{info.message || 'No payment required.'}</p>
            </div>
          )}

          {phase === 'pay' && info && (
            <div className="space-y-6">
              <div className="bg-primary-50 border border-primary-100 rounded-lg p-4">
                <p className="text-sm text-gray-700">
                  Hello <strong>{info.firstName || info.email}</strong>
                </p>
                <p className="text-sm font-mono text-gray-900 mt-1">{info.registrationId}</p>
              </div>

              {info.needsPackage && !info.registrationPackage && (
                <div>
                  <p className="text-sm font-medium text-gray-800 mb-3">
                    Select your conference package (required before payment)
                  </p>
                  <div className="space-y-2">
                    {REGISTRATION_PACKAGES.map((pkg) => {
                      const usd = packageUsdForTier(pkg, tier)
                      return (
                        <label
                          key={pkg.id}
                          className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer ${
                            selectedPackage === pkg.id
                              ? 'border-primary-500 bg-primary-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <input
                            type="radio"
                            name="package"
                            value={pkg.id}
                            checked={selectedPackage === pkg.id}
                            onChange={() => setSelectedPackage(pkg.id)}
                            className="mt-1 accent-primary-600"
                          />
                          <div>
                            <p className="font-medium text-gray-900 text-sm">{pkg.name}</p>
                            <p className="text-xs text-gray-500">{pkg.description}</p>
                            <p className="text-sm font-semibold text-primary-700 mt-1">
                              {currencyForPayments()} {usd.toLocaleString()}
                            </p>
                          </div>
                        </label>
                      )
                    })}
                  </div>
                  <button
                    type="button"
                    onClick={handlePackageContinue}
                    className="btn-primary w-full mt-4"
                  >
                    Save package &amp; continue
                  </button>
                </div>
              )}

              {info.registrationPackage && info.amountUsd != null && (
                <>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <p className="text-sm text-gray-500">Amount due</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {currencyForPayments()} {info.amountUsd.toLocaleString()}
                    </p>
                    {info.packageName && (
                      <p className="text-sm text-gray-600 mt-1">{info.packageName}</p>
                    )}
                  </div>

                  {info.hostedPaymentAvailable && !info.manualBankPayment && (
                    <div>
                      <p className="text-sm font-semibold text-gray-800 mb-2">
                        Option 1 — Pay by card
                      </p>
                      <button
                        type="button"
                        onClick={() => void handlePayByCard()}
                        disabled={payBusy}
                        className="btn-primary w-full flex items-center justify-center gap-2"
                      >
                        {payBusy ? (
                          <>
                            <FiLoader className="animate-spin" /> Opening payment…
                          </>
                        ) : (
                          <>
                            <FiCreditCard /> Pay securely with Stanbic
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  <div>
                    <p className="text-sm font-semibold text-gray-800 mb-2">
                      {info.hostedPaymentAvailable && !info.manualBankPayment
                        ? 'Option 2 — Bank transfer'
                        : 'Bank transfer'}
                    </p>
                    <div className="text-sm text-gray-700 space-y-1 bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <p>
                        <span className="text-gray-500">Reference:</span>{' '}
                        <strong className="font-mono">{info.registrationId}</strong>
                      </p>
                      <p>
                        <span className="text-gray-500">Bank:</span> {b.bankName}
                      </p>
                      <p>
                        <span className="text-gray-500">Account:</span> {b.accountName} —{' '}
                        {b.accountNumber}
                      </p>
                      <p>
                        <span className="text-gray-500">SWIFT:</span> {b.swiftCode}
                      </p>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Email proof to {REGISTRATION_BANK_PROOF_EMAILS.join(' or ')} or{' '}
                      {REGISTRATION_CONTACT_EMAIL}.
                    </p>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function CompletePaymentPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-gray-500">
          <FiLoader className="animate-spin" size={32} />
        </div>
      }
    >
      <CompletePaymentInner />
    </Suspense>
  )
}
