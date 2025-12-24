'use client'

import React, { useState } from 'react'

type Props = { participantId: string, adminId?: string }

export default function ParticipantActions({ participantId, adminId = '' }: Props) {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  async function toggleCheckin(toggleTo?: boolean) {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/participants/${participantId}/checkin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-user-id': adminId },
        body: JSON.stringify({ checkedIn: toggleTo }),
      })
      const json = await res.json()
      if (!res.ok) {
        setMessage(json?.error || 'Check-in failed')
      } else {
        setMessage('Check-in updated')
        setTimeout(() => location.reload(), 800)
      }
    } catch (err: any) {
      console.error(err)
      setMessage('Check-in failed')
    } finally {
      setLoading(false)
    }
  }

  async function markBadgePrinted() {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/participants/${participantId}/badge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-user-id': adminId },
      })
      const json = await res.json()
      if (!res.ok) setMessage(json?.error || 'Badge update failed')
      else {
        setMessage('Badge printed timestamp set')
        setTimeout(() => location.reload(), 800)
      }
    } catch (err: any) {
      console.error(err)
      setMessage('Badge update failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button onClick={() => toggleCheckin(true)} disabled={loading} className="bg-green-600 text-white px-3 py-1 rounded">Mark Checked In</button>
      <button onClick={() => toggleCheckin(false)} disabled={loading} className="bg-yellow-600 text-white px-3 py-1 rounded">Mark Not Checked In</button>
      <button onClick={markBadgePrinted} disabled={loading} className="bg-indigo-600 text-white px-3 py-1 rounded">Mark Badge Printed</button>
      {message && <div className="text-sm text-gray-700">{message}</div>}
    </div>
  )
}
