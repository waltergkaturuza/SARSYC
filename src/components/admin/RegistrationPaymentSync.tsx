'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FiLoader, FiRefreshCw } from 'react-icons/fi'
import { showToast } from '@/lib/toast'

type Props = {
  registrationPayloadId: string
  paymentStatus?: string | null
}

export default function RegistrationPaymentSync({
  registrationPayloadId,
  paymentStatus,
}: Props) {
  const router = useRouter()
  const [syncing, setSyncing] = useState(false)

  if (paymentStatus === 'paid' || paymentStatus === 'waived') {
    return null
  }

  const handleSync = async () => {
    setSyncing(true)
    try {
      const res = await fetch('/api/payments/stanbic/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ registrationPayloadId }),
      })
      const data = await res.json()
      if (data.paid) {
        showToast.success('Stanbic confirms payment — registration marked paid')
        router.refresh()
        return
      }
      showToast.info(
        data.error ||
          'Payment still pending at Stanbic. If the bank confirmed funds, try again in a few minutes.',
      )
    } catch {
      showToast.error('Could not sync with Stanbic')
    } finally {
      setSyncing(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleSync}
      disabled={syncing}
      className="inline-flex items-center gap-2 px-4 py-2 border border-primary-200 text-primary-700 rounded-lg hover:bg-primary-50 disabled:opacity-60 text-sm font-medium"
    >
      {syncing ? <FiLoader className="animate-spin" /> : <FiRefreshCw />}
      Sync with Stanbic
    </button>
  )
}
