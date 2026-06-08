'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { FiMail, FiSearch, FiEdit2, FiLoader, FiRotateCcw } from 'react-icons/fi'
import type { InvoiceCandidate } from '@/lib/admin/paymentsDashboard'
import { formatUsd } from '@/lib/admin/paymentsDashboard'
import { showToast } from '@/lib/toast'

type Props = {
  candidates: InvoiceCandidate[]
}

function paymentBadge(status: string): string {
  if (status === 'paid') return 'text-emerald-400'
  if (status === 'waived') return 'text-sky-400'
  if (status === 'failed') return 'text-red-400'
  return 'text-amber-400'
}

function registrationStatusBadge(status: string): string {
  if (status === 'cancelled') return 'text-red-400'
  if (status === 'confirmed') return 'text-emerald-400'
  return 'text-slate-300'
}

function canRestore(row: InvoiceCandidate): boolean {
  return (
    row.registrationStatus === 'cancelled' ||
    Boolean(row.ineligibleReason?.toLowerCase().includes('soft-deleted'))
  )
}

export default function InvoicesPanel({ candidates }: Props) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Record<string, boolean>>({})
  const [sending, setSending] = useState(false)
  const [restoringId, setRestoringId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return candidates
    return candidates.filter(
      (c) =>
        c.delegate.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.registrationId.toLowerCase().includes(q) ||
        c.organisation.toLowerCase().includes(q),
    )
  }, [candidates, search])

  const selectable = filtered.filter((c) => c.canSend)
  const selectedIds = Object.entries(selected)
    .filter(([, v]) => v)
    .map(([k]) => k)

  function toggle(id: string) {
    setSelected((s) => ({ ...s, [id]: !s[id] }))
  }

  function toggleAll() {
    const allOn = selectable.length > 0 && selectable.every((c) => selected[c.payloadId])
    const next: Record<string, boolean> = { ...selected }
    selectable.forEach((c) => {
      next[c.payloadId] = !allOn
    })
    setSelected(next)
  }

  async function restoreRegistration(row: InvoiceCandidate) {
    setRestoringId(row.payloadId)
    try {
      const res = await fetch(`/api/admin/registrations/${row.payloadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: 'pending' }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Could not restore registration')
      }
      showToast.success(`${row.delegate} restored — you can now select and send an invoice`)
      router.refresh()
    } catch (e: unknown) {
      showToast.error(e instanceof Error ? e.message : 'Restore failed')
    } finally {
      setRestoringId(null)
    }
  }

  async function sendInvoices() {
    const ids = selectedIds.filter((id) => {
      const row = candidates.find((c) => c.payloadId === id)
      return row?.canSend
    })
    if (ids.length === 0) {
      showToast.error('Select at least one eligible registration')
      return
    }

    setSending(true)
    try {
      const res = await fetch('/api/admin/registrations/send-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ids }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to send invoices')
      }

      const sent = data.results?.sent?.length ?? 0
      const failed = data.results?.failed?.length ?? 0
      if (sent > 0) {
        showToast.success(
          `Invoice${sent > 1 ? 's' : ''} sent to ${sent} delegate${sent > 1 ? 's' : ''}${
            failed ? ` (${failed} skipped)` : ''
          }`,
        )
      } else {
        showToast.error(`No invoices sent${failed ? ` — ${failed} failed` : ''}`)
      }

      setSelected({})
      router.refresh()
    } catch (e: unknown) {
      showToast.error(e instanceof Error ? e.message : 'Could not send invoices')
    } finally {
      setSending(false)
    }
  }

  return (
    <>
      <p className="text-xs text-slate-500 mb-4">
        Select delegates and send a branded invoice email with SARSYC letterhead, fee breakdown, and
        bank transfer details. Checkboxes are only enabled for <strong className="text-slate-400">active</strong>{' '}
        registrations (not Cancelled or soft-deleted). If a row is greyed out, use{' '}
        <strong className="text-slate-400">Restore</strong> to set status back to Pending, then invoice.
      </p>

      <div className="flex flex-col lg:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email, registration ID…"
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
          />
        </div>
        <button
          type="button"
          onClick={() => void sendInvoices()}
          disabled={sending || selectedIds.length === 0}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-amber-500 text-slate-900 font-semibold text-sm hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
        >
          {sending ? <FiLoader className="animate-spin" size={16} /> : <FiMail size={16} />}
          Send invoice{selectedIds.length > 1 ? 's' : ''}
          {selectedIds.length > 0 ? ` (${selectedIds.length})` : ''}
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-700">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-800/80 text-slate-400 text-left text-xs uppercase tracking-wide">
              <th className="px-4 py-3 w-10">
                <input
                  type="checkbox"
                  checked={selectable.length > 0 && selectable.every((c) => selected[c.payloadId])}
                  onChange={toggleAll}
                  disabled={selectable.length === 0}
                  className="rounded border-slate-600 bg-slate-800 text-amber-500 focus:ring-amber-500/50"
                  aria-label="Select all eligible"
                />
              </th>
              <th className="px-4 py-3">Delegate</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Package</th>
              <th className="px-4 py-3">Fee</th>
              <th className="px-4 py-3">Payment</th>
              <th className="px-4 py-3">Invoice sent</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-slate-500">
                  No registrations match your search.
                </td>
              </tr>
            ) : (
              filtered.map((row) => (
                <tr
                  key={row.payloadId}
                  className={`hover:bg-slate-800/40 ${!row.canSend ? 'opacity-75' : ''}`}
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={!!selected[row.payloadId]}
                      onChange={() => toggle(row.payloadId)}
                      disabled={!row.canSend}
                      title={
                        row.canSend
                          ? 'Select to send invoice'
                          : row.ineligibleReason ?? 'Not eligible'
                      }
                      className="rounded border-slate-600 bg-slate-800 text-amber-500 focus:ring-amber-500/50 disabled:opacity-40 disabled:cursor-not-allowed"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-white">{row.delegate}</div>
                    <div className="text-xs text-slate-500">{row.email}</div>
                    <div className="text-xs text-slate-600 font-mono mt-0.5">{row.registrationId}</div>
                    {!row.canSend && row.ineligibleReason ? (
                      <div className="text-xs text-amber-200/80 mt-1">{row.ineligibleReason}</div>
                    ) : null}
                  </td>
                  <td className={`px-4 py-3 capitalize font-medium ${registrationStatusBadge(row.registrationStatus)}`}>
                    {row.registrationStatus}
                  </td>
                  <td className="px-4 py-3 text-slate-300 max-w-[200px] text-xs">
                    {row.packageName ?? '—'}
                  </td>
                  <td className="px-4 py-3 font-medium">
                    {row.feeUsd > 0 ? formatUsd(row.feeUsd) : '—'}
                  </td>
                  <td className={`px-4 py-3 font-medium capitalize ${paymentBadge(row.paymentStatus)}`}>
                    {row.paymentStatus}
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-xs">
                    {row.invoiceSentAt ?? '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {canRestore(row) ? (
                        <button
                          type="button"
                          onClick={() => void restoreRegistration(row)}
                          disabled={restoringId === row.payloadId}
                          title="Set status to Pending and clear soft-delete"
                          className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium text-amber-400 hover:bg-slate-700 disabled:opacity-50"
                        >
                          {restoringId === row.payloadId ? (
                            <FiLoader className="animate-spin" size={14} />
                          ) : (
                            <FiRotateCcw size={14} />
                          )}
                          Restore
                        </button>
                      ) : null}
                      <Link
                        href={`/admin/registrations/${row.payloadId}`}
                        className="p-1.5 inline-flex rounded text-slate-400 hover:text-amber-400 hover:bg-slate-700"
                        title="View registration"
                      >
                        <FiEdit2 size={16} />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-slate-500 mt-3">
        Showing {filtered.length} registration{filtered.length === 1 ? '' : 's'} ·{' '}
        {selectable.length} eligible for invoicing
      </p>
    </>
  )
}
