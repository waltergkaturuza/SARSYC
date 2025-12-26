'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { FiFilter } from 'react-icons/fi'

export default function AbstractsFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const status = searchParams.get('status') || 'all'
  const track = searchParams.get('track') || 'all'
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

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <FiFilter className="w-5 h-5 text-gray-600" />
        <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
      </div>
      
      <div className="grid md:grid-cols-3 gap-4">
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
            <option value="srhr">SRHR</option>
            <option value="education">Education</option>
            <option value="advocacy">Advocacy</option>
            <option value="innovation">Innovation</option>
          </select>
        </div>

        {/* Search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
          <form action="/admin/abstracts" method="get">
            {status !== 'all' && <input type="hidden" name="status" value={status} />}
            {track !== 'all' && <input type="hidden" name="track" value={track} />}
            <input
              type="text"
              name="search"
              placeholder="Search by title or author..."
              defaultValue={search}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </form>
        </div>
      </div>
    </div>
  )
}

