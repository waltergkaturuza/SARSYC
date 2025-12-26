'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FiCheckCircle, FiXCircle, FiLoader } from 'react-icons/fi'

interface RegistrationActionButtonsProps {
  registrationId: string
  status: string
  adminId?: string
}

export default function RegistrationActionButtons({ 
  registrationId, 
  status,
  adminId = '' 
}: RegistrationActionButtonsProps) {
  const router = useRouter()
  const [approveLoading, setApproveLoading] = useState(false)
  const [rejectLoading, setRejectLoading] = useState(false)

  const handleApprove = async () => {
    if (!adminId) {
      alert('Admin ID not configured. Set ADMIN_USER_ID env var for local testing.')
      return
    }

    setApproveLoading(true)
    try {
      const res = await fetch('/api/admin/registrations/bulk', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-admin-user-id': adminId,
        },
        body: JSON.stringify({ action: 'markConfirmed', ids: [registrationId] }),
      })

      const json = await res.json()
      if (!res.ok) {
        throw new Error(json.error || 'Failed to approve registration')
      }

      router.refresh()
    } catch (error: any) {
      alert(error.message || 'Failed to approve registration')
    } finally {
      setApproveLoading(false)
    }
  }

  const handleReject = async () => {
    if (!confirm('Are you sure you want to reject/cancel this registration?')) {
      return
    }

    if (!adminId) {
      alert('Admin ID not configured. Set ADMIN_USER_ID env var for local testing.')
      return
    }

    setRejectLoading(true)
    try {
      const res = await fetch('/api/admin/registrations/bulk', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-admin-user-id': adminId,
        },
        body: JSON.stringify({ action: 'softDelete', ids: [registrationId] }),
      })

      const json = await res.json()
      if (!res.ok) {
        throw new Error(json.error || 'Failed to reject registration')
      }

      router.refresh()
    } catch (error: any) {
      alert(error.message || 'Failed to reject registration')
    } finally {
      setRejectLoading(false)
    }
  }

  return (
    <div className="flex gap-3">
      {status !== 'confirmed' && (
        <button
          onClick={handleApprove}
          disabled={approveLoading}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {approveLoading ? (
            <>
              <FiLoader className="w-4 h-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <FiCheckCircle className="w-4 h-4" />
              Approve Registration
            </>
          )}
        </button>
      )}
      {status !== 'cancelled' && (
        <button
          onClick={handleReject}
          disabled={rejectLoading}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {rejectLoading ? (
            <>
              <FiLoader className="w-4 h-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <FiXCircle className="w-4 h-4" />
              Reject/Cancel
            </>
          )}
        </button>
      )}
    </div>
  )
}
