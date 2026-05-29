'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useTransition, useEffect } from 'react'
import { FiFilter, FiRefreshCw, FiSearch } from 'react-icons/fi'
import { countries } from '@/lib/countries'

const CATEGORY_OPTIONS = [
  { value: 'student', label: 'Student/Youth Delegate' },
  { value: 'researcher', label: 'Young Researcher' },
  { value: 'policymaker', label: 'Policymaker/Government Official' },
  { value: 'partner', label: 'Development Partner' },
  { value: 'observer', label: 'Observer' },
]

const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
  { value: 'prefer-not-to-say', label: 'Prefer not to say' },
]

export default function RegistrationsFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const status = searchParams.get('status') || 'all'
  const paymentStatus = searchParams.get('paymentStatus') || 'all'
  const country = searchParams.get('country') || 'all'
  const category = searchParams.get('category') || 'all'
  const gender = searchParams.get('gender') || 'all'
  const [search, setSearch] = useState(searchParams.get('search') || '')

  useEffect(() => {
    setSearch(searchParams.get('search') || '')
  }, [searchParams])

  const buildUrl = (overrides: Record<string, string | undefined>) => {
    const params = new URLSearchParams()
    const next = {
      status,
      paymentStatus,
      country,
      category,
      gender,
      search: search.trim(),
      ...overrides,
    }
    for (const [key, value] of Object.entries(next)) {
      if (value && value !== 'all') params.set(key, value)
    }
    const qs = params.toString()
    return `/admin/registrations${qs ? `?${qs}` : ''}`
  }

  const navigate = (url: string) => {
    startTransition(() => router.push(url))
  }

  const updateFilter = (key: string, value: string) => {
    navigate(buildUrl({ [key]: value, page: undefined }))
  }

  const applySearch = (query?: string) => {
    const q = (query ?? search).trim()
    setSearch(q)
    navigate(buildUrl({ search: q || undefined }))
  }

  const clearAll = () => {
    setSearch('')
    startTransition(() => router.push('/admin/registrations'))
  }

  const activeSearch = searchParams.get('search')?.trim() || ''

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8 space-y-4">
      <div className="flex flex-col lg:flex-row gap-3">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && applySearch()}
            placeholder="Search by name, email, registration ID, organisation, or phone…"
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        <button
          type="button"
          onClick={() => applySearch()}
          disabled={isPending}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-60 text-sm font-medium"
        >
          <FiSearch size={16} />
          Search
        </button>
        {(activeSearch || status !== 'all' || paymentStatus !== 'all' || country !== 'all' || category !== 'all' || gender !== 'all') && (
          <button
            type="button"
            onClick={clearAll}
            disabled={isPending}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
          >
            <FiRefreshCw size={16} className={isPending ? 'animate-spin' : ''} />
            Clear
          </button>
        )}
      </div>

      {activeSearch && (
        <p className="text-sm text-gray-600">
          Showing results for <span className="font-medium text-gray-900">&ldquo;{activeSearch}&rdquo;</span>
        </p>
      )}

      <div className="flex items-center gap-2 pt-1 border-t border-gray-100">
        <FiFilter className="w-5 h-5 text-gray-600 shrink-0" />
        <h2 className="text-sm font-semibold text-gray-900">Filters</h2>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
          <select
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            value={status}
            onChange={(e) => updateFilter('status', e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Payment Status</label>
          <select
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            value={paymentStatus}
            onChange={(e) => updateFilter('paymentStatus', e.target.value)}
          >
            <option value="all">All Payment Status</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="failed">Failed</option>
            <option value="waived">Waived</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
          <select
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            value={country}
            onChange={(e) => updateFilter('country', e.target.value)}
          >
            <option value="all">All Countries</option>
            {countries.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Ticket Type</label>
          <select
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            value={category}
            onChange={(e) => updateFilter('category', e.target.value)}
          >
            <option value="all">All Ticket Types</option>
            {CATEGORY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
          <select
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            value={gender}
            onChange={(e) => updateFilter('gender', e.target.value)}
          >
            <option value="all">All Genders</option>
            {GENDER_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}
