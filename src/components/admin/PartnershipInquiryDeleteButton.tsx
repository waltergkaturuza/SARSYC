'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FiTrash2 } from 'react-icons/fi'

interface PartnershipInquiryDeleteButtonProps {
  inquiryId: string
  organizationName: string
  /** After delete, navigate here instead of refreshing the page. */
  redirectTo?: string
  variant?: 'icon' | 'button'
}

export default function PartnershipInquiryDeleteButton({
  inquiryId,
  organizationName,
  redirectTo,
  variant = 'icon',
}: PartnershipInquiryDeleteButtonProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (
      !confirm(
        `Delete the partnership inquiry from "${organizationName}"? This cannot be undone.`,
      )
    ) {
      return
    }

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/admin/partnership-inquiries/${inquiryId}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete inquiry')
      }

      if (redirectTo) {
        router.push(redirectTo)
        router.refresh()
      } else {
        router.refresh()
      }
    } catch (error: unknown) {
      alert(error instanceof Error ? error.message : 'Failed to delete inquiry')
      setIsDeleting(false)
    }
  }

  if (variant === 'button') {
    return (
      <button
        type="button"
        onClick={handleDelete}
        disabled={isDeleting}
        className="flex w-full items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <FiTrash2 className="w-4 h-4" />
        {isDeleting ? 'Deleting…' : 'Delete inquiry'}
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isDeleting}
      className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      title="Delete inquiry"
    >
      <FiTrash2 className="w-5 h-5" />
    </button>
  )
}
