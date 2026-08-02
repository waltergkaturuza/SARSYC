'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FiTrash2 } from 'react-icons/fi'

interface YouthSteeringCommitteeDeleteButtonProps {
  memberId: string
  label: string
  redirectTo?: string
  variant?: 'icon' | 'button'
}

export default function YouthSteeringCommitteeDeleteButton({
  memberId,
  label,
  redirectTo = '/admin/youth-steering-committee',
  variant = 'icon',
}: YouthSteeringCommitteeDeleteButtonProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (
      !confirm(
        `Delete committee member "${label}"? This permanently removes their profile and cannot be undone.`,
      )
    ) {
      return
    }

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/admin/youth-steering-committee/${memberId}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.error || 'Failed to delete committee member')
      }

      router.push(redirectTo)
      router.refresh()
    } catch (error: unknown) {
      alert(error instanceof Error ? error.message : 'Failed to delete committee member')
      setIsDeleting(false)
    }
  }

  if (variant === 'button') {
    return (
      <button
        type="button"
        onClick={handleDelete}
        disabled={isDeleting}
        className="flex items-center gap-2 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <FiTrash2 className="w-5 h-5" />
        {isDeleting ? 'Deleting…' : 'Delete Member'}
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isDeleting}
      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      title="Delete committee member"
    >
      <FiTrash2 className="w-4 h-4" />
    </button>
  )
}
