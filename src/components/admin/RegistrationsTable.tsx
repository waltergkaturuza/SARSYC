'use client'

import React, { useState } from 'react'
import { FiDownload, FiFileText } from 'react-icons/fi'

type Props = {
  docs: any[]
  total: number
  page: number
  perPage: number
  adminId?: string
}

export default function RegistrationsTable({ docs = [], total = 0, page = 1, perPage = 25, adminId = '' }: Props) {
  const [selected, setSelected] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  function toggle(id: string) {
    setSelected((s) => ({ ...s, [id]: !s[id] }))
  }

  function selectedIds() {
    return Object.entries(selected).filter(([, v]) => v).map(([k]) => k)
  }

  async function handleExport() {
    setLoading(true)
    try {
      const headers: Record<string, string> = {}
      
      // Only add admin ID header if provided (for backwards compatibility)
      if (adminId) {
        headers['x-admin-user-id'] = adminId
      }
      
      const res = await fetch('/api/admin/registrations/export', { 
        headers,
        credentials: 'include', // Include cookies for session-based auth
      })
      if (!res.ok) {
        const json = await res.json()
        setMessage(json?.error || 'Export failed')
        setLoading(false)
        return
      }

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `registrations-export.csv`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
      setMessage('Export started')
    } catch (err: any) {
      console.error('export failed', err)
      setMessage('Export failed')
    } finally {
      setLoading(false)
    }
  }

  async function handleBulk(action: string) {
    const ids = selectedIds()
    if (ids.length === 0) {
      setMessage('No rows selected')
      return
    }
    setLoading(true)
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      
      // Only add admin ID header if provided (for backwards compatibility)
      if (adminId) {
        headers['x-admin-user-id'] = adminId
      }
      
      const res = await fetch('/api/admin/registrations/bulk', {
        method: 'POST',
        headers,
        credentials: 'include', // Include cookies for session-based auth
        body: JSON.stringify({ action, ids }),
      })
      const json = await res.json()
      if (!res.ok) {
        setMessage(json?.error || 'Bulk action failed')
        setLoading(false)
        return
      }
      setMessage(`Bulk action ${action} completed. Updated: ${json.results.updated.length}`)
      // clear selection
      setSelected({})
      // simple reload
      setTimeout(() => location.reload(), 900)
    } catch (err: any) {
      console.error('bulk failed', err)
      setMessage('Bulk action failed')
    } finally {
      setLoading(false)
    }
  }

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  }

  const paymentColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    paid: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-wrap gap-3">
        <button 
          onClick={() => handleExport()} 
          disabled={loading} 
          className="btn-primary flex items-center gap-2"
        >
          <FiDownload className="w-4 h-4" />
          Export CSV
        </button>
        <button 
          onClick={() => handleBulk('markConfirmed')} 
          disabled={loading || selectedIds().length === 0} 
          className="btn-outline"
        >
          Mark as Confirmed
        </button>
        <button 
          onClick={() => handleBulk('sendEmail')} 
          disabled={loading || selectedIds().length === 0} 
          className="btn-outline"
        >
          Send Email
        </button>
        <button 
          onClick={() => handleBulk('softDelete')} 
          disabled={loading || selectedIds().length === 0} 
          className="btn-outline text-red-600 border-red-600 hover:bg-red-50"
        >
          Soft Delete
        </button>
      </div>

      {message && (
        <div className={`mb-4 p-3 rounded-lg ${
          message.includes('failed') || message.includes('error') 
            ? 'bg-red-50 text-red-800 border border-red-200' 
            : 'bg-green-50 text-green-800 border border-green-200'
        }`}>
          {message}
        </div>
      )}

      {docs.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <FiFileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p>No registrations found.</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input 
                      type="checkbox" 
                      checked={docs.length > 0 && docs.every(d => selected[d.id])}
                      onChange={() => {
                        const allSelected = docs.every(d => selected[d.id])
                        const newSelected: Record<string, boolean> = {}
                        docs.forEach(d => {
                          newSelected[d.id] = !allSelected
                        })
                        setSelected(newSelected)
                      }}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Registration ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ticket Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {docs.map((d) => (
                  <tr key={d.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input 
                        type="checkbox" 
                        checked={!!selected[d.id]} 
                        onChange={() => toggle(d.id)}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 font-mono">{d.registrationId || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{d.firstName} {d.lastName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{d.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        statusColors[d.status] || 'bg-gray-100 text-gray-800'
                      }`}>
                        {d.status || 'pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        paymentColors[d.paymentStatus] || 'bg-gray-100 text-gray-800'
                      }`}>
                        {d.paymentStatus || 'pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {d.ticketType || d.category || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(d.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <a
                        href={`/admin/registrations/${d.id}`}
                        className="text-primary-600 hover:text-primary-900 font-medium"
                      >
                        View Details
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              Showing <span className="font-medium">{docs.length}</span> of <span className="font-medium">{total}</span> registrations
            </div>
          </div>
        </>
      )}
    </div>
  )
}
