'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  FiCreditCard,
  FiRefreshCw,
  FiDownload,
  FiSearch,
  FiFilter,
  FiCheck,
  FiAlertCircle,
  FiFileText,
  FiDollarSign,
  FiEdit2,
  FiChevronRight,
} from 'react-icons/fi'
import type {
  CardActivityRow,
  PaymentRow,
  PaymentsDashboardData,
} from '@/lib/admin/paymentsDashboard'
import { formatUsd } from '@/lib/admin/paymentsDashboard'
import { STANBIC_CERTIFICATION_MATRIX } from '@/lib/stanbic/stanbicCertificationMatrix'
import { showToast } from '@/lib/toast'

type TabId = 'overview' | 'payments' | 'card-activity' | 'certification' | 'invoices'

const TABS: { id: TabId; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'payments', label: 'Payments' },
  { id: 'card-activity', label: 'Card activity' },
  { id: 'certification', label: 'Certification' },
  { id: 'invoices', label: 'Invoices' },
]

function statusClass(status: PaymentRow['status']): string {
  if (status === 'paid') return 'text-emerald-400'
  if (status === 'failed') return 'text-red-400'
  if (status === 'waived') return 'text-sky-400'
  if (status === 'bank-transfer') return 'text-amber-400'
  return 'text-red-400'
}

function exportPaymentsCsv(rows: PaymentRow[]) {
  const header = ['Reference', 'Type', 'Delegate', 'Email', 'Organisation', 'Fee USD', 'Status', 'Method', 'Date']
  const lines = rows.map((r) =>
    [
      r.reference,
      r.kind,
      r.delegate,
      r.email,
      r.organisation,
      String(r.feeUsd),
      r.statusLabel,
      r.method,
      r.date,
    ]
      .map((c) => `"${String(c).replace(/"/g, '""')}"`)
      .join(','),
  )
  const blob = new Blob([[header.join(','), ...lines].join('\n')], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `sarsyc-payments-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export default function PaymentsDashboard({ data }: { data: PaymentsDashboardData }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tabParam = searchParams.get('tab') as TabId | null
  const activeTab: TabId = TABS.some((t) => t.id === tabParam) ? tabParam! : 'overview'

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [cardSearch, setCardSearch] = useState('')
  const [bulkSyncing, setBulkSyncing] = useState(false)

  const handleBulkSyncStanbic = async (references?: string[]) => {
    setBulkSyncing(true)
    try {
      const res = await fetch('/api/admin/payments/sync-stanbic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(references?.length ? { references } : {}),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Bulk sync failed')
      }

      const parts = [
        `${data.scanned} checked`,
        `${data.newlyPaid} newly paid`,
        `${data.stillPending} still pending`,
      ]
      if (data.failed) parts.push(`${data.failed} failed at bank`)
      if (data.skipped) parts.push(`${data.skipped} skipped`)

      if (data.newlyPaid > 0) {
        showToast.success(`Bank sync complete: ${parts.join(', ')}`)
      } else {
        showToast.info(`Bank sync complete: ${parts.join(', ')}`)
      }

      if (data.truncated) {
        showToast.info('Only the first 40 pending card payments were synced. Run again if needed.')
      }

      router.refresh()
    } catch (e: unknown) {
      showToast.error(e instanceof Error ? e.message : 'Could not sync with bank')
    } finally {
      setBulkSyncing(false)
    }
  }

  const setTab = (tab: TabId) => {
    const p = new URLSearchParams(searchParams.toString())
    p.set('tab', tab)
    router.push(`/admin/payments?${p.toString()}`)
  }

  const filteredPayments = useMemo(() => {
    const q = search.trim().toLowerCase()
    return data.payments.filter((p) => {
      if (statusFilter === 'paid' && p.status !== 'paid') return false
      if (statusFilter === 'unpaid' && p.status !== 'unpaid' && p.status !== 'pending') return false
      if (statusFilter === 'failed' && p.status !== 'failed') return false
      if (statusFilter === 'waived' && p.status !== 'waived') return false
      if (!q) return true
      return (
        p.delegate.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q) ||
        p.reference.toLowerCase().includes(q) ||
        p.organisation.toLowerCase().includes(q)
      )
    })
  }, [data.payments, search, statusFilter])

  const filteredCardActivity = useMemo(() => {
    const q = cardSearch.trim().toLowerCase()
    if (!q) return data.cardActivity
    return data.cardActivity.filter(
      (r) =>
        r.registrationRef.toLowerCase().includes(q) ||
        r.step.toLowerCase().includes(q) ||
        r.note.toLowerCase().includes(q),
    )
  }, [data.cardActivity, cardSearch])

  const { stats } = data
  const totalItems = stats.registrationCount + stats.donationCount
  const paidPct = totalItems ? (stats.paidCount / totalItems) * 100 : 0
  const unpaidPct = totalItems ? (stats.unpaidCount / totalItems) * 100 : 0

  return (
    <div className="rounded-2xl bg-slate-900 text-slate-100 border border-slate-800 shadow-xl overflow-hidden">
      {/* Header */}
      <div className="px-6 py-6 border-b border-slate-800 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <FiCreditCard className="text-amber-400" size={28} />
            <h1 className="text-2xl font-bold text-white">Payments &amp; Invoices</h1>
          </div>
          <p className="text-slate-400 text-sm">
            Track registration, donation &amp; sponsorship card payments — Stanbic N-Genius hosted flow
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => handleBulkSyncStanbic()}
            disabled={bulkSyncing}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-amber-500/15 border border-amber-500/40 text-amber-300 text-sm font-medium hover:bg-amber-500/25 disabled:opacity-60 transition-colors"
            title="Re-check all pending card payments with Stanbic (registrations, donations & sponsorships)"
          >
            <FiRefreshCw size={16} className={bulkSyncing ? 'animate-spin' : ''} />
            {bulkSyncing ? 'Syncing…' : 'Bulk sync with bank'}
          </button>
          <button
            type="button"
            onClick={() => router.refresh()}
            disabled={bulkSyncing}
            className="p-2.5 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors disabled:opacity-60"
            title="Refresh"
          >
            <FiRefreshCw size={18} />
          </button>
          <button
            type="button"
            onClick={() => exportPaymentsCsv(filteredPayments)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-600 text-sm font-medium hover:bg-slate-800 transition-colors"
          >
            <FiDownload size={16} /> Export CSV
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 p-6 border-b border-slate-800">
        <SummaryCard
          icon={<FiDollarSign className="text-slate-400" size={22} />}
          value={formatUsd(stats.totalExpectedUsd)}
          label="Total Expected"
          sub={`${totalItems} registrations & donations`}
        />
        <SummaryCard
          icon={<FiCheck className="text-emerald-400" size={22} />}
          value={formatUsd(stats.collectedUsd)}
          label="Collected"
          sub={`${stats.paidCount} paid`}
          valueClass="text-emerald-400"
        />
        <SummaryCard
          icon={<FiAlertCircle className="text-red-400" size={22} />}
          value={formatUsd(stats.outstandingUsd)}
          label="Outstanding"
          sub={`${stats.unpaidCount} unpaid`}
          valueClass="text-red-400"
        />
        <SummaryCard
          icon={<FiFileText className="text-amber-400" size={22} />}
          value="0"
          label="Invoices"
          sub="0 overdue"
        />
      </div>

      {/* Tabs */}
      <div className="px-6 pt-4 flex flex-wrap gap-2 border-b border-slate-800">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === t.id
                ? 'border-amber-400 text-amber-400 bg-slate-800/80'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="p-6">
        {activeTab === 'overview' && (
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-slate-800/60 rounded-xl border border-slate-700 p-5">
              <h2 className="font-semibold text-white mb-4">Payment Status Breakdown</h2>
              <BarRow label="Paid" count={stats.paidCount} total={totalItems} color="bg-emerald-500" />
              <BarRow label="Unpaid" count={stats.unpaidCount} total={totalItems} color="bg-red-500" />
              <BarRow label="Waived" count={stats.waivedCount} total={totalItems} color="bg-slate-500" />
              <BarRow label="Failed" count={stats.failedCount} total={totalItems} color="bg-orange-500" />
            </div>
            <div className="bg-slate-800/60 rounded-xl border border-slate-700 p-5">
              <h2 className="font-semibold text-white mb-4">Revenue Summary</h2>
              <dl className="space-y-4">
                <div className="flex justify-between">
                  <dt className="text-slate-400">Total Expected</dt>
                  <dd className="font-semibold">{formatUsd(stats.totalExpectedUsd)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-400">Collected</dt>
                  <dd className="font-semibold text-emerald-400">{formatUsd(stats.collectedUsd)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-400">Outstanding</dt>
                  <dd className="font-semibold text-red-400">{formatUsd(stats.outstandingUsd)}</dd>
                </div>
                <div className="pt-2 border-t border-slate-700 text-xs text-slate-500">
                  Paid share: {paidPct.toFixed(0)}% · Unpaid: {unpaidPct.toFixed(0)}%
                </div>
              </dl>
            </div>
          </div>
        )}

        {activeTab === 'payments' && (
          <>
            <p className="text-xs text-slate-500 mb-4">
              Bulk sync re-checks Stanbic for unpaid card registrations, donations, and sponsorships that have a
              stored gateway order reference (up to 40 per run).
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <div className="relative flex-1">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search delegate, email, reference…"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
              </div>
              <div className="relative">
                <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="pl-10 pr-8 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-sm text-white appearance-none min-w-[140px]"
                >
                  <option value="all">All Status</option>
                  <option value="paid">Paid</option>
                  <option value="unpaid">Unpaid</option>
                  <option value="failed">Failed</option>
                  <option value="waived">Waived</option>
                </select>
              </div>
            </div>
            <div className="overflow-x-auto rounded-xl border border-slate-700">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-800/80 text-slate-400 text-left text-xs uppercase tracking-wide">
                    <th className="px-4 py-3">Delegate</th>
                    <th className="px-4 py-3">Organisation</th>
                    <th className="px-4 py-3">Fee</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Method</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3 w-10" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredPayments.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center text-slate-500">
                        No payments match your filters.
                      </td>
                    </tr>
                  ) : (
                    filteredPayments.map((row) => (
                      <tr key={row.id} className="hover:bg-slate-800/40">
                        <td className="px-4 py-3">
                          <div className="font-medium text-white">{row.delegate}</div>
                          <div className="text-xs text-slate-500">{row.email}</div>
                          <div className="text-xs text-slate-600 font-mono mt-0.5">{row.reference}</div>
                        </td>
                        <td className="px-4 py-3 text-slate-300 max-w-[180px] truncate">{row.organisation}</td>
                        <td className="px-4 py-3 font-medium">{formatUsd(row.feeUsd)}</td>
                        <td className={`px-4 py-3 font-medium ${statusClass(row.status)}`}>
                          {row.statusLabel}
                        </td>
                        <td className="px-4 py-3 text-slate-400 text-xs max-w-[160px]">{row.method}</td>
                        <td className="px-4 py-3 text-slate-400">{row.date}</td>
                        <td className="px-4 py-3">
                          <Link
                            href={row.editHref}
                            className="p-1.5 inline-flex rounded text-slate-400 hover:text-amber-400 hover:bg-slate-700"
                          >
                            <FiEdit2 size={16} />
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {activeTab === 'card-activity' && (
          <>
            <p className="text-xs text-slate-400 mb-4 max-w-3xl">
              Each row is a <code className="text-amber-400/90">[stanbic-cert]</code> event stored when
              create-order or verify runs. Also grep Vercel logs for older entries before this deploy.
            </p>
            {data.cardActivityNote && (
              <div className="mb-4 p-3 rounded-lg bg-amber-900/30 border border-amber-700/50 text-amber-200 text-sm">
                {data.cardActivityNote}
              </div>
            )}
            <div className="relative mb-4 max-w-md">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input
                value={cardSearch}
                onChange={(e) => setCardSearch(e.target.value)}
                placeholder="Search ref, email, status…"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
            </div>
            <div className="overflow-x-auto rounded-xl border border-slate-700">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-800/80 text-slate-400 text-left text-xs uppercase tracking-wide">
                    <th className="px-4 py-3">Time</th>
                    <th className="px-4 py-3">Step</th>
                    <th className="px-4 py-3">Reference</th>
                    <th className="px-4 py-3">Verified</th>
                    <th className="px-4 py-3">DB → Paid</th>
                    <th className="px-4 py-3">Note</th>
                    <th className="w-8" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredCardActivity.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center text-slate-500">
                        No card activity yet. Complete a test payment to populate this table.
                      </td>
                    </tr>
                  ) : (
                    filteredCardActivity.map((row) => (
                      <CardActivityTableRow key={row.id} row={row} />
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {activeTab === 'certification' && (
          <div className="space-y-4">
            <p className="text-sm text-slate-400">
              Stanbic sandbox certification matrix — use these test cards during bank certification.
              Logs emit as <code className="text-amber-400">[stanbic-cert]</code> in Vercel and in Card
              activity above.
            </p>
            <div className="grid gap-4">
              {STANBIC_CERTIFICATION_MATRIX.map((s) => (
                <div
                  key={s.id}
                  className="bg-slate-800/60 rounded-xl border border-slate-700 p-4 flex gap-4"
                >
                  <span className="text-2xl">{s.icon}</span>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white">{s.title}</h3>
                    {s.testCard && (
                      <p className="text-sm font-mono text-slate-300 mt-1">
                        {s.testCard}
                        {s.expiry ? ` · ${s.expiry}` : ''}
                        {s.cvv ? ` · CVV ${s.cvv}` : ''}
                      </p>
                    )}
                    {s.instructions && (
                      <p className="text-xs text-amber-200/90 mt-2">{s.instructions}</p>
                    )}
                    <p className="text-xs text-slate-500 mt-2">
                      Expected: {s.expectedPaymentState || '—'} · {s.expectedPaymentStatus || '—'}
                      {s.expectedVerificationError
                        ? ` · ${s.expectedVerificationError}`
                        : ''}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'invoices' && (
          <div className="rounded-xl border border-slate-700 bg-slate-800/40 py-16 text-center">
            <FiFileText className="mx-auto text-slate-600 mb-4" size={48} />
            <p className="text-slate-400 font-medium">No invoices yet</p>
            <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
              Invoice generation with PDF export can be added when registration invoicing is required.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function SummaryCard({
  icon,
  value,
  label,
  sub,
  valueClass = 'text-white',
}: {
  icon: React.ReactNode
  value: string
  label: string
  sub: string
  valueClass?: string
}) {
  return (
    <div className="bg-slate-800/60 rounded-xl border border-slate-700 p-4">
      <div className="mb-3">{icon}</div>
      <div className={`text-2xl font-bold ${valueClass}`}>{value}</div>
      <div className="text-sm text-slate-400 mt-1">{label}</div>
      <div className="text-xs text-slate-500 mt-0.5">{sub}</div>
    </div>
  )
}

function BarRow({
  label,
  count,
  total,
  color,
}: {
  label: string
  count: number
  total: number
  color: string
}) {
  const pct = total ? Math.round((count / total) * 100) : 0
  return (
    <div className="mb-4 last:mb-0">
      <div className="flex justify-between text-sm mb-1">
        <span className="text-slate-300">{label}</span>
        <span className="text-slate-500">
          {count} / {total}
        </span>
      </div>
      <div className="h-2 rounded-full bg-slate-700 overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

function CardActivityTableRow({ row }: { row: CardActivityRow }) {
  const yesNo = (v: boolean | null) => {
    if (v === null) return <span className="text-slate-600">—</span>
    return v ? (
      <span className="text-emerald-400">Yes</span>
    ) : (
      <span className="text-red-400">No</span>
    )
  }
  return (
    <tr className="hover:bg-slate-800/40">
      <td className="px-4 py-3 text-slate-400 text-xs whitespace-nowrap">{row.time}</td>
      <td className="px-4 py-3">
        <span className="text-amber-400 font-mono text-xs">{row.step}</span>
      </td>
      <td className="px-4 py-3 font-mono text-xs text-slate-300">{row.registrationRef}</td>
      <td className="px-4 py-3">{yesNo(row.verificationApproved)}</td>
      <td className="px-4 py-3">{yesNo(row.dbPaymentStatusUpdated)}</td>
      <td className="px-4 py-3 text-xs text-slate-500 max-w-[200px] truncate">{row.note}</td>
      <td className="px-2 py-3 text-slate-600">
        <FiChevronRight size={14} />
      </td>
    </tr>
  )
}
