'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { FiFilter } from 'react-icons/fi'
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

  const status = searchParams.get('status') || 'all'
  const paymentStatus = searchParams.get('paymentStatus') || 'all'
  const country = searchParams.get('country') || 'all'
  const category = searchParams.get('category') || 'all'
  const gender = searchParams.get('gender') || 'all'
  const search = searchParams.get('search') || ''

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === 'all' || !value) {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    params.delete('page')
    router.push(`/admin/registrations?${params.toString()}`)
  }

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const searchInput = form.search as HTMLInputElement
    const q = searchInput?.value?.trim() || ''
    updateFilter('search', q)
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
      <div className="flex items-center gap-2 mb-4">
        <FiFilter className="w-5 h-5 text-gray-600" />
        <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-6 gap-4">
        {/* Status */}
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

        {/* Payment Status */}
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
          </select>
        </div>

        {/* Country */}
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

        {/* Ticket Type (Category) */}
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

        {/* Gender */}
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

        {/* Search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <input
              type="text"
              name="search"
              placeholder="Search by name, email, or registration ID..."
              defaultValue={search}
              className="flex-1 min-w-0 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium shrink-0"
            >
              Search
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
