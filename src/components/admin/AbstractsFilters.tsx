'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { FiFilter } from 'react-icons/fi'
import { countries } from '@/lib/countries'

// Track options must match Abstracts collection schema
const TRACK_OPTIONS = [
  { value: 'education-rights', label: 'Track 1: Education Rights and Equity' },
  { value: 'hiv-aids', label: 'Track 2: HIV/AIDS, STIs and Vulnerable Groups' },
  { value: 'ncd-prevention', label: 'Track 3: NCDs Prevention and Health Lifestyles' },
  { value: 'digital-health', label: 'Track 4: Digital Health and Safety' },
  { value: 'mental-health', label: 'Track 5: Mental Health and Substance Abuse' },
]

export default function AbstractsFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const status = searchParams.get('status') || 'all'
  const track = searchParams.get('track') || 'all'
  const country = searchParams.get('country') || 'all'
  const search = searchParams.get('search') || ''

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === 'all' || !value) {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    params.delete('page') // Reset to page 1
    router.push(`/admin/abstracts?${params.toString()}`)
  }

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const searchInput = form.search as HTMLInputElement
    const q = searchInput?.value?.trim() || ''
    updateFilter('search', q)
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <FiFilter className="w-5 h-5 text-gray-600" />
        <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
      </div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
          <select
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            value={status}
            onChange={(e) => updateFilter('status', e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="received">Received</option>
            <option value="under-review">Under Review</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
            <option value="revisions">Revisions Requested</option>
          </select>
        </div>

        {/* Track Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Track</label>
          <select
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            value={track}
            onChange={(e) => updateFilter('track', e.target.value)}
          >
            <option value="all">All Tracks</option>
            {TRACK_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Country Filter */}
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

        {/* Search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <input
              type="text"
              name="search"
              placeholder="Search by title or author..."
              defaultValue={search}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium">
              Search
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}



