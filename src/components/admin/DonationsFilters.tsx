'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useTransition } from 'react'
import { FiSearch, FiRefreshCw } from 'react-icons/fi'

export default function DonationsFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const paymentStatus = searchParams.get('paymentStatus') || 'all'

  const apply = (next: { search?: string; paymentStatus?: string }) => {
    const params = new URLSearchParams()
    const q = next.search ?? search
    const ps = next.paymentStatus ?? paymentStatus
    if (q.trim()) params.set('search', q.trim())
    if (ps && ps !== 'all') params.set('paymentStatus', ps)
    startTransition(() => {
      router.push(`/admin/donations${params.toString() ? `?${params.toString()}` : ''}`)
    })
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6 space-y-4">
      <div className="flex flex-col lg:flex-row gap-3">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && apply({})}
            placeholder="Search name, organisation, email, reference, category…"
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        <select
          value={paymentStatus}
          onChange={(e) => apply({ paymentStatus: e.target.value })}
          className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm bg-white"
        >
          <option value="all">All payment statuses</option>
          <option value="pending">Unpaid / Pending</option>
          <option value="paid">Paid</option>
          <option value="failed">Failed</option>
          <option value="bank-transfer">Bank transfer</option>
        </select>
        <button
          type="button"
          onClick={() => apply({})}
          disabled={isPending}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-60 text-sm font-medium"
        >
          <FiSearch size={16} />
          Search
        </button>
        <button
          type="button"
          onClick={() => {
            setSearch('')
            startTransition(() => router.push('/admin/donations'))
          }}
          disabled={isPending}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
        >
          <FiRefreshCw size={16} className={isPending ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>
    </div>
  )
}
