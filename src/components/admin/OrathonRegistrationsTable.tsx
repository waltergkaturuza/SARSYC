'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  FiCheckCircle,
  FiXCircle,
  FiLoader,
} from 'react-icons/fi'
import OrathonRegistrationActionButtons from './OrathonRegistrationActionButtons'

type Props = {
  docs: any[]
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
}

export default function OrathonRegistrationsTable({ docs = [] }: Props) {
  const router = useRouter()
  const [selected, setSelected] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [messageType, setMessageType] = useState<'success' | 'error'>('success')

  const toggle = (id: string) => {
    setSelected((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const selectedIds = Object.entries(selected)
    .filter(([, value]) => value)
    .map(([key]) => key)

  const allSelected = docs.length > 0 && docs.every((doc) => selected[doc.id])

  const toggleAll = () => {
    if (allSelected) {
      setSelected({})
    } else {
      const next: Record<string, boolean> = {}
      docs.forEach((doc) => {
        next[doc.id] = true
      })
      setSelected(next)
    }
  }

  const handleBulk = async (action: 'markConfirmed' | 'markCancelled') => {
    if (selectedIds.length === 0) {
      setMessage('No registrations selected')
      setMessageType('error')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/admin/orathon-registrations/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ action, ids: selectedIds }),
      })
      const json = await res.json()
      if (!res.ok) {
        throw new Error(json?.error || 'Bulk action failed')
      }
      setMessage(`Updated ${json.results?.updated?.length || 0} registrations`)
      setMessageType('success')
      setSelected({})
      router.refresh()
    } catch (error: any) {
      console.error('Orathon bulk action failed:', error)
      setMessage(error?.message || 'Bulk action failed')
      setMessageType('error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6 flex flex-wrap gap-3 items-center">
        <button
          onClick={() => handleBulk('markConfirmed')}
          disabled={loading || selectedIds.length === 0}
          className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <>
              <FiLoader className="w-4 h-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <FiCheckCircle className="w-4 h-4" />
              Approve Selected
            </>
          )}
        </button>
        <button
          onClick={() => handleBulk('markCancelled')}
          disabled={loading || selectedIds.length === 0}
          className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <>
              <FiLoader className="w-4 h-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <FiXCircle className="w-4 h-4" />
              Reject Selected
            </>
          )}
        </button>
        {message && (
          <div
            className={`px-3 py-2 text-sm rounded-lg ${
              messageType === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {message}
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  checked={allSelected}
                  onChange={toggleAll}
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Orathon ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Phone
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Country
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fitness Level
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Registered
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {docs.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-6 py-12 text-center text-gray-500">
                  No registrations found
                </td>
              </tr>
            ) : (
              docs.map((registration: any) => (
                <tr key={registration.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      checked={Boolean(selected[registration.id])}
                      onChange={() => toggle(registration.id)}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-mono text-gray-900">
                      {registration.registrationId || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {registration.firstName} {registration.lastName}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{registration.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{registration.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{registration.country}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 capitalize">
                      {registration.fitnessLevel}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        statusColors[registration.status] || 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {registration.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {registration.createdAt
                      ? new Date(registration.createdAt).toLocaleDateString()
                      : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/admin/orathon-registrations/${registration.id}`}
                        className="text-primary-600 hover:text-primary-900"
                      >
                        View
                      </Link>
                      <OrathonRegistrationActionButtons
                        registrationId={registration.id}
                        status={registration.status}
                      />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
