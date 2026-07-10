'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

type ReviewerOption = {
  id: string | number
  email?: string
  firstName?: string
  lastName?: string
  role?: string
}

interface VolunteerAdminActionsProps {
  id: string
  initialStatus: string
  initialAdminNotes?: string | null
  initialReviewerComments?: string | null
  initialAssignedReviewerId?: string | null
  initialInterviewDate?: string | null
  initialInterviewNotes?: string | null
  reviewers?: ReviewerOption[]
}

function toDatetimeLocalValue(value?: string | null): string {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toISOString().slice(0, 16)
}

function reviewerLabel(user: ReviewerOption): string {
  const name = `${user.firstName || ''} ${user.lastName || ''}`.trim()
  const role = user.role ? ` (${user.role})` : ''
  return name ? `${name}${role}` : `${user.email || `User #${user.id}`}${role}`
}

export function VolunteerAdminActions({
  id,
  initialStatus,
  initialAdminNotes = '',
  initialReviewerComments = '',
  initialAssignedReviewerId = '',
  initialInterviewDate = '',
  initialInterviewNotes = '',
  reviewers = [],
}: VolunteerAdminActionsProps) {
  const router = useRouter()
  const [status, setStatus] = useState(initialStatus || 'pending')
  const [adminNotes, setAdminNotes] = useState(initialAdminNotes || '')
  const [reviewerComments, setReviewerComments] = useState(initialReviewerComments || '')
  const [assignedReviewerId, setAssignedReviewerId] = useState(initialAssignedReviewerId || '')
  const [interviewDate, setInterviewDate] = useState(toDatetimeLocalValue(initialInterviewDate))
  const [interviewNotes, setInterviewNotes] = useState(initialInterviewNotes || '')
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
            assignedReviewerId: assignedReviewerId || null,
            interviewDate: interviewDate ? new Date(interviewDate).toISOString() : null,
            interviewNotes,
          }),
        })

        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          throw new Error(data.error || 'Failed to update volunteer')
        }

        setStatus(effectiveStatus)
        setMessage('Changes saved')
        router.refresh()
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Something went wrong')
      }
    })
  }

  return (
    <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Admin & Screening Actions</h3>
          <p className="text-xs text-gray-600">
            Set reviewer, interview details, status, and notes — then click Save.
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

      <div className="grid gap-4 md:grid-cols-2 mb-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-700">Assigned Reviewer</label>
          <select
            value={assignedReviewerId}
            onChange={(e) => setAssignedReviewerId(e.target.value)}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          >
            <option value="">Not assigned</option>
            {reviewers.map((user) => (
              <option key={user.id} value={String(user.id)}>
                {reviewerLabel(user)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-700">Interview Date & Time</label>
          <input
            type="datetime-local"
            value={interviewDate}
            onChange={(e) => setInterviewDate(e.target.value)}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>
      </div>

      <div className="mb-4">
        <label className="mb-1 block text-xs font-medium text-gray-700">Interview Notes</label>
        <textarea
          value={interviewNotes}
          onChange={(e) => setInterviewNotes(e.target.value)}
          rows={3}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          placeholder="Interview summary, questions asked, impressions..."
        />
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
