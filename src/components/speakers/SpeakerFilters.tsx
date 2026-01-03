'use client'

import { useRouter, useSearchParams } from 'next/navigation'

const speakerTypes = [
  { value: 'all', label: 'All Speakers' },
  { value: 'keynote', label: 'Keynote Speakers' },
  { value: 'plenary', label: 'Plenary Speakers' },
  { value: 'moderator', label: 'Panel Moderators' },
  { value: 'facilitator', label: 'Workshop Facilitators' },
]

export default function SpeakerFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentType = searchParams.get('type') || 'all'

  const handleFilterChange = (type: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (type === 'all') {
      params.delete('type')
    } else {
      params.set('type', type)
    }
    // Remove page param when filtering
    params.delete('page')
    router.push(`/programme/speakers?${params.toString()}`)
  }

  return (
    <div className="flex flex-wrap gap-3 justify-center">
      {speakerTypes.map((type) => {
        const isActive = currentType === type.value
        return (
          <button
            key={type.value}
            onClick={() => handleFilterChange(type.value)}
            className={`px-6 py-2 rounded-full border-2 transition-all font-medium text-sm ${
              isActive
                ? 'border-primary-600 text-primary-600 bg-primary-50'
                : 'bg-white border-gray-200 text-gray-700 hover:border-primary-600 hover:text-primary-600'
            }`}
          >
            {type.label}
          </button>
        )
      })}
    </div>
  )
}



