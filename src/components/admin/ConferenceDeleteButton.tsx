'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FiTrash2 } from 'react-icons/fi'

export default function ConferenceDeleteButton({
  conferenceId,
  label,
  redirectTo = '/admin/conferences',
  variant = 'icon',
}: {
  conferenceId: string
  label: string
  redirectTo?: string
  variant?: 'icon' | 'button'
}) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm(`Delete conference "${label}"? This cannot be undone.`)) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/admin/conferences/${conferenceId}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.error || 'Failed to delete conference')
      }
      router.push(redirectTo)
      router.refresh()
    } catch (error: unknown) {
      alert(error instanceof Error ? error.message : 'Failed to delete conference')
      setIsDeleting(false)
    }
  }

  if (variant === 'button') {
    return (
      <button
        type="button"
        onClick={handleDelete}
        disabled={isDeleting}
        className="flex items-center gap-2 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
      >
        <FiTrash2 className="w-5 h-5" />
        {isDeleting ? 'Deleting…' : 'Delete Conference'}
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isDeleting}
      className="p-2 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50"
      title="Delete conference"
    >
      <FiTrash2 className="w-4 h-4" />
    </button>
  )
}
