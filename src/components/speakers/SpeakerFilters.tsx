'use client'

import { useRouter, useSearchParams } from 'next/navigation'

const speakerTypes = [
  { value: 'all', label: 'All Speakers' },
  { value: 'keynote', label: 'Keynote Speakers' },
  { value: 'plenary', label: 'Plenary Speakers' },
  { value: 'moderator', label: 'Panel Moderators' },
  { value: 'facilitator', label: 'Workshop Facilitators' },
  { value: 'abstract-presenter', label: 'Abstract Presenters' },
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
                ? 'border-amber-400 text-amber-300 bg-amber-400/10'
                : 'bg-white/10 border-white/20 text-white/80 hover:border-amber-400/60 hover:text-amber-300 backdrop-blur-sm'
            }`}
          >
            {type.label}
          </button>
        )
      })}
    </div>
  )
}



