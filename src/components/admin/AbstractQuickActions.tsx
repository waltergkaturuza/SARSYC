'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FiCheck, FiX, FiEdit, FiMessageSquare, FiLoader } from 'react-icons/fi'
import { showToast } from '@/lib/toast'

interface AbstractQuickActionsProps {
  abstractId: string
  currentStatus: string
  onStatusUpdate?: () => void
}

export default function AbstractQuickActions({
  abstractId,
  currentStatus,
  onStatusUpdate,
}: AbstractQuickActionsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [showFeedbackModal, setShowFeedbackModal] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [pendingStatus, setPendingStatus] = useState<string | null>(null)

  const updateStatus = async (newStatus: string, requireFeedback: boolean = false) => {
    if (requireFeedback) {
      setPendingStatus(newStatus)
      setShowFeedbackModal(true)
      return
    }

    setLoading(newStatus)
    try {
      const response = await fetch(`/api/admin/abstracts/${abstractId}/quick-update`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update status')
      }

      showToast.success(`Abstract status updated to ${newStatus.replace('-', ' ')}`)
      if (onStatusUpdate) {
        onStatusUpdate()
      } else {
        // Refresh the page to show updated status
        router.refresh()
      }
    } catch (error: any) {
      showToast.error(error.message || 'Failed to update status')
    } finally {
      setLoading(null)
    }
  }

  const submitWithFeedback = async () => {
    if (!pendingStatus) return

    setLoading(pendingStatus)
    try {
      const response = await fetch(`/api/admin/abstracts/${abstractId}/quick-update`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: pendingStatus,
          reviewerComments: feedback,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update status')
      }

      showToast.success(`Abstract status updated with feedback`)
      setShowFeedbackModal(false)
      setFeedback('')
      setPendingStatus(null)
      if (onStatusUpdate) {
        onStatusUpdate()
      } else {
        // Refresh the page to show updated status
        router.refresh()
      }
    } catch (error: any) {
      showToast.error(error.message || 'Failed to update status')
    } finally {
      setLoading(null)
    }
  }

  return (
    <>
      <div className="flex items-center gap-1">
        {currentStatus !== 'accepted' && (
          <button
            onClick={() => updateStatus('accepted', false)}
            disabled={loading !== null}
            className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
            title="Accept Abstract"
          >
            {loading === 'accepted' ? (
              <FiLoader className="w-4 h-4 animate-spin" />
            ) : (
              <FiCheck className="w-4 h-4" />
            )}
          </button>
        )}

        {currentStatus !== 'rejected' && (
          <button
            onClick={() => updateStatus('rejected', true)}
            disabled={loading !== null}
            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
            title="Reject Abstract"
          >
            {loading === 'rejected' ? (
              <FiLoader className="w-4 h-4 animate-spin" />
            ) : (
              <FiX className="w-4 h-4" />
            )}
          </button>
        )}

        {currentStatus !== 'revisions' && (
          <button
            onClick={() => updateStatus('revisions', true)}
            disabled={loading !== null}
            className="p-1.5 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors disabled:opacity-50"
            title="Request Revisions"
          >
            {loading === 'revisions' ? (
              <FiLoader className="w-4 h-4 animate-spin" />
            ) : (
              <FiEdit className="w-4 h-4" />
            )}
          </button>
        )}

        {currentStatus !== 'under-review' && currentStatus !== 'accepted' && currentStatus !== 'rejected' && currentStatus !== 'revisions' && (
          <button
            onClick={() => updateStatus('under-review', false)}
            disabled={loading !== null}
            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
            title="Mark as Under Review"
          >
            {loading === 'under-review' ? (
              <FiLoader className="w-4 h-4 animate-spin" />
            ) : (
              <FiMessageSquare className="w-4 h-4" />
            )}
          </button>
        )}
      </div>

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Add Feedback for {pendingStatus === 'rejected' ? 'Rejection' : pendingStatus === 'revisions' ? 'Revisions' : 'Status Update'}
            </h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reviewer Comments {pendingStatus === 'rejected' || pendingStatus === 'revisions' ? '*' : '(Optional)'}
              </label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder={
                  pendingStatus === 'rejected'
                    ? 'Please provide constructive feedback to help the author understand why the abstract was not accepted...'
                    : pendingStatus === 'revisions'
                    ? 'Please specify what revisions are needed...'
                    : 'Add any feedback or comments for the author...'
                }
              />
              <p className="text-xs text-gray-500 mt-1">
                This feedback will be visible to the author and included in the notification email.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setShowFeedbackModal(false)
                  setFeedback('')
                  setPendingStatus(null)
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={submitWithFeedback}
                disabled={loading !== null || (pendingStatus === 'rejected' || pendingStatus === 'revisions') && !feedback.trim()}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {loading && <FiLoader className="w-4 h-4 animate-spin" />}
                Update Status
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

