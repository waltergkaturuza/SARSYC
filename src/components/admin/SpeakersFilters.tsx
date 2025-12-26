'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { FiFilter } from 'react-icons/fi'

export default function SpeakersFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const type = searchParams.get('type') || 'all'
  const featured = searchParams.get('featured') || 'all'

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === 'all' || !value) {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    params.delete('page')
    router.push(`/admin/speakers?${params.toString()}`)
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <FiFilter className="w-5 h-5 text-gray-600" />
        <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
      </div>
      
      <div className="grid md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Speaker Type</label>
          <select
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            value={type}
            onChange={(e) => updateFilter('type', e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="keynote">Keynote</option>
            <option value="plenary">Plenary</option>
            <option value="moderator">Moderator</option>
            <option value="facilitator">Facilitator</option>
            <option value="presenter">Presenter</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Featured</label>
          <select
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            value={featured}
            onChange={(e) => updateFilter('featured', e.target.value)}
          >
            <option value="all">All Speakers</option>
            <option value="true">Featured Only</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
          <form action="/admin/speakers" method="get">
            {type !== 'all' && <input type="hidden" name="type" value={type} />}
            {featured !== 'all' && <input type="hidden" name="featured" value={featured} />}
            <input
              type="text"
              name="search"
              placeholder="Search by name..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </form>
        </div>
      </div>
    </div>
  )
}

