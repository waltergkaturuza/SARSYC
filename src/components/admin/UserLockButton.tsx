'use client'

import React, { useState } from 'react'
import { FiLock } from 'react-icons/fi'
import { showToast } from '@/lib/toast'

interface UserLockButtonProps {
  userId: string | number
  onLock?: () => void
}

export default function UserLockButton({ userId, onLock }: UserLockButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleLock = async () => {
    if (!confirm('Are you sure you want to lock this account? This is for testing purposes.')) {
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`/api/admin/users/${userId}/lock`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to lock account')
      }

      showToast.success(result.message || 'Account locked successfully')
      
      // Call callback to refresh data
      if (onLock) {
        onLock()
      } else {
        // Default: reload the page
        window.location.reload()
      }
    } catch (error: any) {
      console.error('Lock error:', error)
      showToast.error(error.message || 'Failed to lock account')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleLock}
      disabled={loading}
      className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      title="Lock Account (Test)"
    >
      {loading ? (
        <div className="w-4 h-4 border-2 border-orange-600 border-t-transparent rounded-full animate-spin" />
      ) : (
        <FiLock className="w-4 h-4" />
      )}
    </button>
  )
}



