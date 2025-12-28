'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FiCheckCircle, FiXCircle, FiLoader } from 'react-icons/fi'

interface ActionButtonProps {
  registrationId: string
}

export function ApproveButton({ registrationId }: ActionButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleApprove = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/registrations/bulk', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for authentication
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
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleApprove}
      disabled={loading}
      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {loading ? (
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
  )
}

export function RejectButton({ registrationId }: ActionButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleReject = async () => {
    if (!confirm('Are you sure you want to reject/cancel this registration?')) {
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/admin/registrations/bulk', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for authentication
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
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleReject}
      disabled={loading}
      className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {loading ? (
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
  )
}

