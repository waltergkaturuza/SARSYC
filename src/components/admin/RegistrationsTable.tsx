'use client'

import React, { useState } from 'react'

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
    if (!adminId) {
      setMessage('Admin ID not configured. Set ADMIN_USER_ID env var for local testing.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/admin/registrations/export', { headers: { 'x-admin-user-id': adminId } })
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
    if (!adminId) {
      setMessage('Admin ID not configured. Set ADMIN_USER_ID env var for local testing.')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/admin/registrations/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-user-id': adminId },
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

  return (
    <div>
      <div className="mb-4 flex gap-2">
        <button onClick={() => handleExport()} disabled={loading} className="bg-blue-600 text-white px-3 py-1 rounded">Export CSV</button>
        <button onClick={() => handleBulk('markConfirmed')} disabled={loading} className="bg-green-600 text-white px-3 py-1 rounded">Mark as Confirmed</button>
        <button onClick={() => handleBulk('sendEmail')} disabled={loading} className="bg-indigo-600 text-white px-3 py-1 rounded">Send Email</button>
        <button onClick={() => handleBulk('softDelete')} disabled={loading} className="bg-red-600 text-white px-3 py-1 rounded">Soft Delete</button>
      </div>

      {message && <div className="mb-4 text-sm text-gray-700">{message}</div>}

      <table className="min-w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2">🗂</th>
            <th className="p-2">Registration ID</th>
            <th className="p-2">Name</th>
            <th className="p-2">Email</th>
            <th className="p-2">Status</th>
            <th className="p-2">Payment</th>
            <th className="p-2">Ticket</th>
            <th className="p-2">Created</th>
          </tr>
        </thead>
        <tbody>
          {docs.map((d) => (
            <tr key={d.id} className="odd:bg-white even:bg-gray-50">
              <td className="p-2 text-center"><input type="checkbox" checked={!!selected[d.id]} onChange={() => toggle(d.id)} /></td>
              <td className="p-2">{d.registrationId}</td>
              <td className="p-2">{d.firstName} {d.lastName}</td>
              <td className="p-2">{d.email}</td>
              <td className="p-2">{d.status}</td>
              <td className="p-2">{d.paymentStatus}</td>
              <td className="p-2">{d.ticketType || d.category}</td>
              <td className="p-2">{new Date(d.createdAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4 text-sm text-gray-600">Showing {docs.length} of {total}</div>
    </div>
  )
}
