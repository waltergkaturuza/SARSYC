'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FiRefreshCw, FiLoader } from 'react-icons/fi'

export default function SyncYouthSteeringCommitteeButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSync = async () => {
    setLoading(true)
    setMessage(null)
    setError(null)

    try {
      const response = await fetch('/api/admin/migrate-youth-steering-committee', {
        method: 'POST',
        credentials: 'include',
      })
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || `Sync failed (${response.status})`)
      }

      const created = result.created?.length || 0
      const skipped = result.skipped?.length || 0
      const errors = result.errors?.length || 0

      if (errors > 0) {
        const details = (result.errors as Array<{ name: string; error: string }>)
          .slice(0, 3)
          .map((e) => `${e.name}: ${e.error}`)
          .join(' | ')
        setError(
          `Imported ${created}, skipped ${skipped}, failed ${errors}. ${details}`,
        )
      } else {
        setMessage(
          created > 0
            ? `Imported ${created} member(s). ${skipped > 0 ? `${skipped} already existed.` : ''}`
            : `No new members to import (${skipped} already in the database).`,
        )
      }

      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Sync failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        type="button"
        onClick={handleSync}
        disabled={loading}
        className="inline-flex items-center gap-2 px-4 py-2 border border-primary-600 text-primary-700 bg-white rounded-lg hover:bg-primary-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        title="Import the 12 members from the public governance page into the database"
      >
        {loading ? (
          <>
            <FiLoader className="w-5 h-5 animate-spin" />
            Syncing…
          </>
        ) : (
          <>
            <FiRefreshCw className="w-5 h-5" />
            Sync from Website
          </>
        )}
      </button>
      {message && <p className="text-sm text-green-700 max-w-md text-right">{message}</p>}
      {error && <p className="text-sm text-red-700 max-w-md text-right">{error}</p>}
    </div>
  )
}
