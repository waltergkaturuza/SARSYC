'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FiCheckCircle, FiXCircle, FiLoader } from 'react-icons/fi'

interface OrathonRegistrationActionButtonsProps {
  registrationId: string
  status: string
}

export default function OrathonRegistrationActionButtons({
  registrationId,
  status,
}: OrathonRegistrationActionButtonsProps) {
  const router = useRouter()
  const [approveLoading, setApproveLoading] = useState(false)
  const [rejectLoading, setRejectLoading] = useState(false)

  const updateStatus = async (nextStatus: 'confirmed' | 'cancelled') => {
    const res = await fetch('/api/admin/orathon-registrations/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        action: nextStatus === 'confirmed' ? 'markConfirmed' : 'markCancelled',
        ids: [registrationId],
      }),
    })

    const json = await res.json()
    if (!res.ok) {
      throw new Error(json?.error || 'Failed to update status')
    }
  }

  const handleApprove = async () => {
    setApproveLoading(true)
    try {
      await updateStatus('confirmed')
      router.refresh()
    } catch (error: any) {
      alert(error.message || 'Failed to approve registration')
    } finally {
      setApproveLoading(false)
    }
  }

  const handleReject = async () => {
    if (!confirm('Are you sure you want to reject/cancel this Orathon registration?')) {
      return
    }

    setRejectLoading(true)
    try {
      await updateStatus('cancelled')
      router.refresh()
    } catch (error: any) {
      alert(error.message || 'Failed to reject registration')
    } finally {
      setRejectLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      {status !== 'confirmed' && (
        <button
          onClick={handleApprove}
          disabled={approveLoading}
          className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {approveLoading ? (
            <>
              <FiLoader className="w-4 h-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <FiCheckCircle className="w-4 h-4" />
              Approve
            </>
          )}
        </button>
      )}
      {status !== 'cancelled' && (
        <button
          onClick={handleReject}
          disabled={rejectLoading}
          className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {rejectLoading ? (
            <>
              <FiLoader className="w-4 h-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <FiXCircle className="w-4 h-4" />
              Reject
            </>
          )}
        </button>
      )}
    </div>
  )
}
