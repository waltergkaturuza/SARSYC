'use client'

import { useState } from 'react'
import { FiTrash2 } from 'react-icons/fi'

interface UserDeleteButtonProps {
  userId: string
  userName: string
  onDelete?: () => void
}

export default function UserDeleteButton({ userId, userName, onDelete }: UserDeleteButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${userName}? This action cannot be undone.`)) {
      return
    }

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete user')
      }

      if (onDelete) {
        onDelete()
      } else {
        window.location.reload()
      }
    } catch (error: any) {
      alert(error.message || 'Failed to delete user')
      setIsDeleting(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      title="Delete User"
    >
      <FiTrash2 className="w-4 h-4" />
    </button>
  )
}



