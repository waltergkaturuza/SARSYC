'use client'

import React, { useState } from 'react'
import { FiUnlock, FiLock } from 'react-icons/fi'
import { showToast } from '@/lib/toast'

interface UserUnlockButtonProps {
  userId: string | number
  isLocked: boolean
  onUnlock?: () => void
}

export default function UserUnlockButton({ userId, isLocked, onUnlock }: UserUnlockButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleUnlock = async () => {
    if (!isLocked) {
      showToast.info('Account is not locked')
      return
    }

    if (!confirm('Are you sure you want to unlock this account?')) {
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`/api/admin/users/${userId}/unlock`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to unlock account')
      }

      showToast.success(result.message || 'Account unlocked successfully')
      
      // Call callback to refresh data
      if (onUnlock) {
        onUnlock()
      } else {
        // Default: reload the page
        window.location.reload()
      }
    } catch (error: any) {
      console.error('Unlock error:', error)
      showToast.error(error.message || 'Failed to unlock account')
    } finally {
      setLoading(false)
    }
  }

  if (!isLocked) {
    return null
  }

  return (
    <button
      onClick={handleUnlock}
      disabled={loading}
      className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      title="Unlock Account"
    >
      {loading ? (
        <div className="w-4 h-4 border-2 border-orange-600 border-t-transparent rounded-full animate-spin" />
      ) : (
        <FiUnlock className="w-4 h-4" />
      )}
    </button>
  )
}


