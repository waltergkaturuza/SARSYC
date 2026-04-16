'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { FiLoader, FiSave } from 'react-icons/fi'
import { showToast } from '@/lib/toast'

interface AbstractReviewFormProps {
  abstractId: string
  existingReview?: any | null
  allowEdit: boolean
}

const recommendationOptions = [
  { value: 'accept', label: 'Accept' },
  { value: 'minor-revisions', label: 'Minor Revisions' },
  { value: 'major-revisions', label: 'Major Revisions' },
  { value: 'reject', label: 'Reject' },
]

const confidenceOptions = [
  { value: 'high', label: 'High confidence' },
  { value: 'medium', label: 'Medium confidence' },
  { value: 'low', label: 'Low confidence' },
]

function initialRubricScore(existing: number | undefined | null): number {
  if (existing == null || !Number.isFinite(Number(existing))) return 1
  const n = Math.round(Number(existing))
  return Math.min(30, Math.max(1, n))
}

export default function AbstractReviewForm({
  abstractId,
  existingReview,
  allowEdit,
}: AbstractReviewFormProps) {
  const router = useRouter()
  const [score, setScore] = useState<number>(() => initialRubricScore(existingReview?.score))
  const [recommendation, setRecommendation] = useState<string>(existingReview?.recommendation ?? 'accept')
  const [confidence, setConfidence] = useState<string | null>(existingReview?.confidence || null)
  const [comments, setComments] = useState<string>(existingReview?.comments ?? '')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!allowEdit) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/abstracts/${abstractId}/reviews`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          score,
          recommendation,
          comments,
          confidence,
        }),
      })
      const result = await response.json()
      if (!response.ok) {
        throw new Error(result?.error || 'Failed to submit review')
      }

      showToast.success('Review submitted successfully')
      router.refresh()
    } catch (error: any) {
      console.error('Review submit error:', error)
      showToast.error(error?.message || 'Failed to submit review')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Total rubric score (1–30)
          </label>
          <input
            type="number"
            value={score}
            min={1}
            max={30}
            step={1}
            onChange={(e) => {
              const v = Number(e.target.value)
              if (!Number.isFinite(v)) return
              setScore(Math.min(30, Math.max(1, Math.round(v))))
            }}
            disabled={!allowEdit || loading}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">
            Enter the sum from the SARSYC rubric: six criteria scored 1–5 each (maximum 30). Benchmarks:
            18–30 accept band; below 18 reject band—use comments for nuance.
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Recommendation
          </label>
          <select
            value={recommendation}
            onChange={(e) => setRecommendation(e.target.value)}
            disabled={!allowEdit || loading}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
          >
            {recommendationOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Reviewer Confidence (optional)
        </label>
        <select
          value={confidence || ''}
          onChange={(e) => setConfidence(e.target.value || null)}
          disabled={!allowEdit || loading}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
        >
          <option value="">Select confidence</option>
          {confidenceOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Comments for Authors
        </label>
        <textarea
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          rows={6}
          disabled={!allowEdit || loading}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="Provide constructive feedback for the authors..."
        />
        <p className="text-xs text-gray-500 mt-2">
          These comments may be shared with the abstract author. Please be constructive and specific.
        </p>
      </div>

      {allowEdit && (
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <>
                <FiLoader className="w-4 h-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <FiSave className="w-4 h-4" />
                Submit Review
              </>
            )}
          </button>
        </div>
      )}
    </form>
  )
}
