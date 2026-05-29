'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { showToast } from '@/lib/toast'
import { FiLoader, FiSave } from 'react-icons/fi'

type Props = {
  donation: {
    id: string | number
    donationId?: string
    paymentStatus?: string
    notes?: string
  }
}

export default function DonationEditForm({ donation }: Props) {
  const router = useRouter()
  const [paymentStatus, setPaymentStatus] = useState(donation.paymentStatus || 'pending')
  const [notes, setNotes] = useState(donation.notes || '')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/donations/${donation.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ paymentStatus, notes }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Update failed')
      showToast.success('Donation updated')
      router.refresh()
    } catch (e: unknown) {
      showToast.error(e instanceof Error ? e.message : 'Update failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
      <h2 className="text-lg font-bold text-gray-900">Reconcile payment</h2>
      <p className="text-sm text-gray-600">
        Update payment status after verifying Stanbic card payment or bank transfer proof.
      </p>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Payment status</label>
        <select
          value={paymentStatus}
          onChange={(e) => setPaymentStatus(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
        >
          <option value="pending">Unpaid / Pending</option>
          <option value="paid">Paid</option>
          <option value="failed">Failed</option>
          <option value="bank-transfer">Bank transfer (awaiting proof)</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Admin notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          placeholder="Bank reference, reconciliation notes, follow-up actions…"
        />
      </div>

      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-60"
      >
        {saving ? <FiLoader className="animate-spin" /> : <FiSave />}
        Save changes
      </button>
    </div>
  )
}
