import Link from 'next/link'
import { FiCalendar, FiDownload } from 'react-icons/fi'
import { getPayloadClient } from '@/lib/payload'
import { slateToPlainText } from '@/lib/newsContent'
import { getCountryLabel } from '@/lib/countries'
import {
  formatSpeakerNamesList,
  formatPersonAffiliation,
  SESSION_DAY_OPTIONS,
} from '@/lib/sessionsContent'
import SessionsPaperScroll, {
  type SessionCardData,
  type SessionDayGroup,
  type SessionPerson,
} from '@/components/programme/SessionsPaperScroll'

export const revalidate = 0

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : null
}

function committeeRoleLabel(role: unknown): string {
  const raw = typeof role === 'string' ? role.trim() : ''
  if (!raw) return 'Youth Steering Committee Member'
  if (/youth\s+steering/i.test(raw)) return raw
  if (/^committee\s+member$/i.test(raw)) return 'Youth Steering Committee Member'
  return `Youth Steering Committee ${raw}`
}

function personFromSpeaker(value: unknown): SessionPerson | null {
  const s = asRecord(value)
  if (!s?.name) return null
  const countryRaw = typeof s.country === 'string' ? s.country : ''
  const id = s.id != null ? String(s.id) : null
  return {
    id,
    name: String(s.name),
    href: id ? `/programme/speakers/${id}` : null,
    affiliation: formatPersonAffiliation({
      title: typeof s.title === 'string' ? s.title : null,
      organization: typeof s.organization === 'string' ? s.organization : null,
      country: countryRaw ? getCountryLabel(countryRaw) || countryRaw : null,
    }),
  }
}

function personFromCommittee(value: unknown): SessionPerson | null {
  const m = asRecord(value)
  if (!m?.name) return null
  const countryRaw = typeof m.country === 'string' ? m.country : ''
  const id = m.id != null ? String(m.id) : null
  return {
    id,
    name: String(m.name),
    href: id
      ? `/about/youth-steering-committee#member-${id}`
      : '/about/youth-steering-committee',
    affiliation: formatPersonAffiliation({
      role: committeeRoleLabel(m.role),
      organization: typeof m.organization === 'string' ? m.organization : null,
      country: countryRaw ? getCountryLabel(countryRaw) || countryRaw : null,
    }),
  }
}

function serializeSession(session: any): SessionCardData {
  const speakers = (Array.isArray(session.speakers) ? session.speakers : [])
    .map(personFromSpeaker)
    .filter(Boolean) as SessionPerson[]
  const committeeMembers = (Array.isArray(session.committeeMembers) ? session.committeeMembers : [])
    .map(personFromCommittee)
    .filter(Boolean) as SessionPerson[]
  const speakerModerator = personFromSpeaker(session.moderator)
  const committeeModerator = personFromCommittee(session.committeeModerator)

  return {
    id: session.id,
    title: session.title,
    date: session.date ?? null,
    day: session.day ?? null,
    startTime: session.startTime ?? null,
    endTime: session.endTime ?? null,
    venue: session.venue ?? null,
    type: session.type ?? null,
    track: session.track ?? null,
    description: slateToPlainText(session.description),
    speakers,
    guestSpeakers: formatSpeakerNamesList(session.speakerNames),
    committeeMembers,
    moderator: speakerModerator || committeeModerator,
  }
}

export default async function SessionsPage() {
  let sessions: any[] = []
  try {
    const payload = await getPayloadClient()
    const result = await payload.find({
      collection: 'sessions',
      limit: 300,
      sort: 'startTime',
      depth: 1,
    })
    sessions = result.docs
  } catch (error) {
    console.error('Failed to load sessions from CMS:', error)
  }

  const dayGroups: SessionDayGroup[] = SESSION_DAY_OPTIONS.map((dayOption) => ({
    value: dayOption.value,
    label: dayOption.label,
    sessions: sessions
      .filter((session) => (session.day || 'day-1') === dayOption.value)
      .map(serializeSession),
  })).filter((group) => group.sessions.length > 0)

  return (
    <>
      <section className="bg-slate-800 text-white py-8 md:py-10">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Conference Sessions</h1>
            <p className="text-xl text-white/90 mb-6">Browse all sessions for SARSYC VI</p>
            <a
              href="/api/programme/pdf"
              download="SARSYC-VI-Programme.pdf"
              className="btn-accent inline-flex items-center gap-2"
            >
              <FiDownload />
              Download Full Programme (PDF)
            </a>
          </div>
        </div>
      </section>

      <section className="sessions-page-bg py-6 md:py-8">
        <div className="container-custom">
          {dayGroups.length === 0 ? (
            <div className="max-w-3xl mx-auto text-center bg-white rounded-2xl border border-slate-200 p-12 shadow-sm">
              <FiCalendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Programme Coming Soon</h3>
              <p className="text-gray-600 mb-6 text-justify">
                The full session programme is being finalised and will be published here shortly.
                Check back soon!
              </p>
              <Link href="/programme" className="btn-primary">
                Back to Programme
              </Link>
            </div>
          ) : (
            <SessionsPaperScroll dayGroups={dayGroups} />
          )}
        </div>
      </section>
    </>
  )
}
