/**
 * Shared constants and helpers for conference sessions, used by the admin
 * forms/pages and the public programme pages so labels stay consistent.
 */

export const SESSION_TYPE_OPTIONS = [
  { label: 'Keynote', value: 'keynote' },
  { label: 'Plenary', value: 'plenary' },
  { label: 'Welcome Remarks', value: 'welcome-remarks' },
  { label: 'Introductions', value: 'introductions' },
  { label: 'Presentation', value: 'presentation' },
  { label: 'Panel Discussion', value: 'panel' },
  { label: 'Round Table Discussion', value: 'round-table' },
  { label: 'Workshop', value: 'workshop' },
  { label: 'Oral / Abstract Presentations', value: 'oral' },
  { label: 'Poster Session', value: 'poster' },
  { label: 'Launch Event', value: 'launch-event' },
  { label: 'Concluding Presentation', value: 'concluding-presentation' },
  { label: 'Forum Reflection', value: 'forum-reflection' },
  { label: 'Award Ceremony', value: 'award-ceremony' },
  { label: 'Music / Dance', value: 'music-dance' },
  { label: 'Networking', value: 'networking' },
  { label: 'Lunch', value: 'lunch' },
  { label: 'Dinner', value: 'dinner' },
  { label: 'Registration / Break', value: 'break' },
  { label: 'Side Event', value: 'side-event' },
  { label: 'Post-Conference Activity', value: 'post-conference' },
  { label: 'Orathon', value: 'orathon' },
] as const

export const SESSION_TRACK_OPTIONS = [
  { label: 'General / Plenary', value: 'general' },
  { label: 'Track 1: Education Rights & Equity', value: 'education-rights' },
  { label: 'Track 2: HIV/AIDS, STIs, & Sexual Health', value: 'hiv-aids' },
  { label: 'Track 3: NCDs Prevention & Healthy Lifestyles', value: 'ncd-prevention' },
  { label: 'Track 4: Digital Health & Safety', value: 'digital-health' },
  { label: 'Track 5: Mental Health & Substance Abuse', value: 'mental-health' },
] as const

export const SESSION_DAY_OPTIONS = [
  { label: 'Day 1 — 5 August 2026', value: 'day-1', date: '2026-08-05' },
  { label: 'Day 2 — 6 August 2026', value: 'day-2', date: '2026-08-06' },
  { label: 'Day 3 — 7 August 2026', value: 'day-3', date: '2026-08-07' },
  { label: 'Orathon — November 2026', value: 'day-4', date: '' },
] as const

export function sessionTypeLabel(value: unknown): string {
  const found = SESSION_TYPE_OPTIONS.find((option) => option.value === value)
  return found ? found.label : typeof value === 'string' ? value : ''
}

export function sessionTrackLabel(value: unknown): string {
  const found = SESSION_TRACK_OPTIONS.find((option) => option.value === value)
  if (found) return found.label
  // Legacy track values from the earlier taxonomy.
  const legacy: Record<string, string> = {
    srhr: 'Sexual & Reproductive Health',
    education: 'Education & Skills Development',
    advocacy: 'Advocacy & Policy Influence',
    innovation: 'Innovation & Technology',
  }
  if (typeof value === 'string' && legacy[value]) return legacy[value]
  return typeof value === 'string' ? value : ''
}

export function sessionDayLabel(value: unknown): string {
  const found = SESSION_DAY_OPTIONS.find((option) => option.value === value)
  return found ? found.label : typeof value === 'string' ? value : ''
}

export const SESSION_TRACK_BADGE_CLASSES: Record<string, string> = {
  general: 'bg-blue-100 text-blue-700',
  'education-rights': 'bg-sky-100 text-sky-700',
  'hiv-aids': 'bg-rose-100 text-rose-700',
  'ncd-prevention': 'bg-green-100 text-green-700',
  'digital-health': 'bg-indigo-100 text-indigo-700',
  'mental-health': 'bg-purple-100 text-purple-700',
}

export function sessionTrackBadgeClass(value: unknown): string {
  if (typeof value === 'string' && SESSION_TRACK_BADGE_CLASSES[value]) {
    return SESSION_TRACK_BADGE_CLASSES[value]
  }
  return 'bg-gray-100 text-gray-700'
}

/**
 * Session times are stored as UTC-encoded wall-clock values (the time typed in
 * the admin form is kept as-is, flagged as UTC). Always format with the UTC
 * time zone so the displayed time matches what the admin entered, regardless
 * of the server or visitor time zone.
 */
export function formatSessionTime(value: unknown): string {
  if (!value) return ''
  const date = new Date(value as string)
  if (Number.isNaN(date.getTime())) return ''
  const hours = String(date.getUTCHours()).padStart(2, '0')
  const minutes = String(date.getUTCMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}

export function formatSessionDate(value: unknown): string {
  if (!value) return ''
  const date = new Date(value as string)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

/** Day accent styles for session cards (border/hover glow). */
export const SESSION_DAY_THEME: Record<
  string,
  { accent: string; soft: string; badge: string; hover: string; bar: string; pdf: string }
> = {
  'day-1': {
    accent: 'border-sky-500',
    soft: 'bg-sky-50',
    badge: 'bg-[#fff8ee] text-sky-800',
    hover:
      'hover:ring-2 hover:ring-sky-300/80 hover:shadow-[0_0_0_1px_rgba(14,165,233,0.35),0_14px_30px_rgba(61,47,31,0.22)]',
    bar: 'bg-sky-400',
    pdf: '#0284c7',
  },
  'day-2': {
    accent: 'border-emerald-500',
    soft: 'bg-emerald-50',
    badge: 'bg-[#fff8ee] text-emerald-800',
    hover:
      'hover:ring-2 hover:ring-emerald-300/80 hover:shadow-[0_0_0_1px_rgba(16,185,129,0.35),0_14px_30px_rgba(61,47,31,0.22)]',
    bar: 'bg-emerald-400',
    pdf: '#059669',
  },
  'day-3': {
    accent: 'border-orange-500',
    soft: 'bg-orange-50',
    badge: 'bg-[#fff8ee] text-orange-800',
    hover:
      'hover:ring-2 hover:ring-orange-300/80 hover:shadow-[0_0_0_1px_rgba(249,115,22,0.35),0_14px_30px_rgba(61,47,31,0.22)]',
    bar: 'bg-orange-400',
    pdf: '#ea580c',
  },
  'day-4': {
    accent: 'border-amber-500',
    soft: 'bg-amber-50',
    badge: 'bg-[#fff8ee] text-amber-900',
    hover:
      'hover:ring-2 hover:ring-amber-300/80 hover:shadow-[0_0_0_1px_rgba(245,158,11,0.35),0_14px_30px_rgba(61,47,31,0.22)]',
    bar: 'bg-amber-400',
    pdf: '#d97706',
  },
}

export function sessionDayTheme(day: unknown) {
  if (typeof day === 'string' && SESSION_DAY_THEME[day]) return SESSION_DAY_THEME[day]
  return SESSION_DAY_THEME['day-1']
}

/** Title/role · organization · country for speakers and committee members. */
export function formatPersonAffiliation(person: {
  title?: string | null
  role?: string | null
  organization?: string | null
  country?: string | null
}): string {
  return [person.title || person.role, person.organization, person.country]
    .map((part) => (typeof part === 'string' ? part.trim() : ''))
    .filter(Boolean)
    .join(' · ')
}

export function formatSpeakerNamesList(raw: unknown): string[] {
  if (typeof raw !== 'string') return []
  return raw
    .split(/[;,\n]/)
    .map((name) => name.trim())
    .filter(Boolean)
}
