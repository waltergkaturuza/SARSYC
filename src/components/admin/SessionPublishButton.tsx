'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FiEye, FiEyeOff } from 'react-icons/fi'

interface SessionPublishButtonProps {
  sessionId: string
  status?: string | null
  variant?: 'icon' | 'button'
}

export default function SessionPublishButton({
  sessionId,
  status,
  variant = 'icon',
}: SessionPublishButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const isPublished = status === 'published' || !status

  const handleToggle = async () => {
    const nextStatus = isPublished ? 'draft' : 'published'
    const action = isPublished ? 'unpublish' : 'publish'
    if (
      !confirm(
        isPublished
          ? 'Unpublish this session? It will be hidden from the public programme, PDF, and calendar.'
          : 'Publish this session? It will appear on the public programme.',
      )
    ) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/admin/sessions/${sessionId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus, statusOnly: true }),
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.error || `Failed to ${action} session`)
      }

      router.refresh()
    } catch (error: unknown) {
      alert(error instanceof Error ? error.message : `Failed to ${action} session`)
    } finally {
      setLoading(false)
    }
  }

  if (variant === 'button') {
    return (
      <button
        type="button"
        onClick={handleToggle}
        disabled={loading}
        className={`flex items-center gap-2 px-6 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
          isPublished
            ? 'bg-amber-100 text-amber-900 hover:bg-amber-200'
            : 'bg-green-600 text-white hover:bg-green-700'
        }`}
      >
        {isPublished ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
        {loading ? 'Saving…' : isPublished ? 'Unpublish' : 'Publish'}
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={loading}
      className={`p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
        isPublished
          ? 'text-amber-700 hover:bg-amber-50'
          : 'text-green-700 hover:bg-green-50'
      }`}
      title={isPublished ? 'Unpublish from public' : 'Publish to public'}
    >
      {isPublished ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
    </button>
  )
}
