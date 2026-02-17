'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

interface VolunteerAdminActionsProps {
  id: string
  initialStatus: string
  initialAdminNotes?: string | null
  initialReviewerComments?: string | null
}

export function VolunteerAdminActions({
  id,
  initialStatus,
  initialAdminNotes = '',
  initialReviewerComments = '',
}: VolunteerAdminActionsProps) {
  const router = useRouter()
  const [status, setStatus] = useState(initialStatus || 'pending')
  const [adminNotes, setAdminNotes] = useState(initialAdminNotes || '')
  const [reviewerComments, setReviewerComments] = useState(initialReviewerComments || '')
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleSave = async (nextStatus?: string) => {
    const effectiveStatus = nextStatus || status
    setMessage(null)
    setError(null)

    startTransition(async () => {
      try {
        const res = await fetch(`/api/admin/volunteers/${id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status: effectiveStatus,
            adminNotes,
            reviewerComments,
          }),
        })

        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          throw new Error(data.error || 'Failed to update volunteer')
        }

        setStatus(effectiveStatus)
        setMessage('Changes saved')
        router.refresh()
      } catch (err: any) {
        setError(err.message || 'Something went wrong')
      }
    })
  }

  return (
    <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Admin & Screening Actions</h3>
          <p className="text-xs text-gray-600">
            Update status and leave internal notes or comments for the applicant.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-md border border-gray-300 bg-white px-3 py-1 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          >
            <option value="pending">Pending Review</option>
            <option value="under-review">Under Review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="on-hold">On Hold</option>
            <option value="withdrawn">Withdrawn</option>
          </select>
          <button
            type="button"
            onClick={() => handleSave()}
            disabled={isPending}
            className="rounded-md bg-primary-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? 'Saving...' : 'Save'}
          </button>
          <button
            type="button"
            onClick={() => handleSave('approved')}
            disabled={isPending}
            className="rounded-md border border-emerald-500 px-3 py-1.5 text-sm font-medium text-emerald-700 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Mark Approved
          </button>
          <button
            type="button"
            onClick={() => handleSave('rejected')}
            disabled={isPending}
            className="rounded-md border border-red-500 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Mark Rejected
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-700">
            Admin Notes (internal only)
          </label>
          <textarea
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            rows={4}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            placeholder="Screening notes, risk flags, allocation ideas..."
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-700">
            Reviewer Comments (can be shared with applicant)
          </label>
          <textarea
            value={reviewerComments}
            onChange={(e) => setReviewerComments(e.target.value)}
            rows={4}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            placeholder="Short message to applicant, e.g. approved, declined with reason, or follow-up needed."
          />
        </div>
      </div>

      {(message || error) && (
        <div className="mt-3 text-xs">
          {message && <p className="text-emerald-700">{message}</p>}
          {error && <p className="text-red-600">{error}</p>}
        </div>
      )}
    </div>
  )
}

