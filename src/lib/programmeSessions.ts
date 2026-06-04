export type ProgrammeSession = {
  id: string
  title: string
  type: string
  track: string
  day: string
  date: string
  startTime: string
  endTime: string
  venue: string
  speakers: string[]
  description: string
}

export const PROGRAMME_DAYS = ['All Days', 'Day 1', 'Day 2', 'Day 3'] as const

export const PROGRAMME_TRACKS = [
  { value: 'all', label: 'All Tracks', color: 'gray' },
  { value: 'general', label: 'Plenary', color: 'blue' },
  { value: 'education-rights', label: 'Track 1: Education Rights and Equity', color: 'blue' },
  { value: 'hiv-aids', label: 'Track 2: HIV/AIDS, STIs, and Sexual Health', color: 'purple' },
  { value: 'ncd-prevention', label: 'Track 3: Non-Communicable Diseases (NCDs) Prevention and Health Lifestyles', color: 'pink' },
  { value: 'digital-health', label: 'Track 4: Digital Health and Safety', color: 'orange' },
  { value: 'mental-health', label: 'Track 5: Mental Health and Substance Abuse', color: 'green' },
] as const

export const PROGRAMME_TYPES = [
  'All Types',
  'Keynote',
  'Plenary',
  'Panel',
  'Workshop',
  'Oral Presentations',
  'Poster Session',
] as const

/** Sample programme — matches /programme until CMS sessions are published. */
export const PROGRAMME_SESSIONS: ProgrammeSession[] = [
  {
    id: '1',
    title: 'Opening Ceremony & Keynote: The State of Youth Health in Southern Africa',
    type: 'keynote',
    track: 'general',
    day: 'Day 1',
    date: 'August 5, 2026',
    startTime: '09:00',
    endTime: '10:30',
    venue: 'Main Hall',
    speakers: ['Dr. Sarah Mwangi', 'Hon. Minister of Health'],
    description:
      'Opening remarks followed by keynote address on current youth health landscape and opportunities.',
  },
  {
    id: '2',
    title: 'Comprehensive Sexuality Education: Lessons from the Region',
    type: 'panel',
    track: 'srhr',
    day: 'Day 1',
    date: 'August 5, 2026',
    startTime: '11:00',
    endTime: '12:30',
    venue: 'Room A',
    speakers: ['Prof. Jane Doe', 'Dr. John Smith', 'Ms. Alice Brown'],
    description: 'Panel discussion on effective CSE implementation across Southern African countries.',
  },
]

const TYPE_BADGE_CLASS: Record<string, string> = {
  keynote: 'bg-blue-100 text-blue-800',
  plenary: 'bg-indigo-100 text-indigo-800',
  panel: 'bg-gray-100 text-gray-800',
  workshop: 'bg-green-100 text-green-800',
  oral: 'bg-purple-100 text-purple-800',
  poster: 'bg-pink-100 text-pink-800',
  default: 'bg-primary-100 text-primary-800',
}

export function sessionTypeBadgeClass(type: string): string {
  return TYPE_BADGE_CLASS[type.toLowerCase()] ?? TYPE_BADGE_CLASS.default
}

export function getTrackColor(track: string): string {
  const trackData = PROGRAMME_TRACKS.find((t) => t.value === track)
  return trackData?.color ?? 'gray'
}

export function filterProgrammeSessions(
  sessions: ProgrammeSession[],
  selectedDay: string,
  selectedTrack: string,
  selectedType: string,
): ProgrammeSession[] {
  return sessions.filter((session) => {
    if (selectedDay !== 'All Days' && session.day !== selectedDay) return false
    if (selectedTrack !== 'all' && session.track !== selectedTrack) return false
    if (selectedType !== 'All Types') {
      const typeMatch = session.type.toLowerCase() === selectedType.toLowerCase().replace(' ', '-')
      const labelMatch =
        session.type.toLowerCase() === selectedType.toLowerCase() ||
        (selectedType === 'Panel' && session.type === 'panel')
      if (!typeMatch && !labelMatch) return false
    }
    return true
  })
}
