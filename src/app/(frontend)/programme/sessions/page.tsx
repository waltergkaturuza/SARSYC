import Link from 'next/link'
import { FiCalendar, FiClock, FiMapPin, FiUsers, FiUser, FiDownload } from 'react-icons/fi'
import { getPayloadClient } from '@/lib/payload'
import { slateToPlainText } from '@/lib/newsContent'
import {
  formatSessionTime,
  formatSessionDate,
  sessionDayLabel,
  sessionTrackLabel,
  sessionTrackBadgeClass,
  sessionTypeLabel,
  formatSpeakerNamesList,
  SESSION_DAY_OPTIONS,
} from '@/lib/sessionsContent'

export const revalidate = 0

function speakerName(value: unknown): string | null {
  if (value && typeof value === 'object' && 'name' in (value as Record<string, unknown>)) {
    return String((value as Record<string, unknown>).name)
  }
  return null
}

function speakerId(value: unknown): string | null {
  if (value && typeof value === 'object' && 'id' in (value as Record<string, unknown>)) {
    return String((value as Record<string, unknown>).id)
  }
  return null
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

  // Group sessions by conference day, keeping the configured day order.
  const dayGroups = SESSION_DAY_OPTIONS.map((dayOption) => ({
    ...dayOption,
    sessions: sessions.filter((session) => (session.day || 'day-1') === dayOption.value),
  })).filter((group) => group.sessions.length > 0)

  return (
    <>
      {/* Hero */}
      <section className="bg-slate-800 text-white py-8 md:py-10">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Conference Sessions
            </h1>
            <p className="text-xl text-white/90 mb-6">
              Browse all sessions for SARSYC VI
            </p>
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

      {/* Sessions List */}
      <section className="section bg-white">
        <div className="container-custom">
          {dayGroups.length === 0 ? (
            <div className="max-w-3xl mx-auto text-center bg-gray-50 rounded-xl p-12">
              <FiCalendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Programme Coming Soon</h3>
              <p className="text-gray-600 mb-6">
                The full session programme is being finalised and will be published here shortly.
                Check back soon!
              </p>
              <Link href="/programme" className="btn-primary">
                Back to Programme
              </Link>
            </div>
          ) : (
            <div className="max-w-5xl mx-auto space-y-12">
              {dayGroups.map((group) => (
                <div key={group.value} id={group.value} className="scroll-mt-24">
                  <div className="mb-6 border-b-2 border-primary-600 pb-3">
                    <h2 className="text-3xl font-bold text-gray-900">{group.label}</h2>
                  </div>

                  <div className="space-y-6">
                    {group.sessions.map((session: any) => {
                      const description = slateToPlainText(session.description)
                      const linkedSpeakers = (Array.isArray(session.speakers) ? session.speakers : [])
                        .map((s: any) => ({ id: speakerId(s), name: speakerName(s) }))
                        .filter((s: any) => s.name)
                      const guestSpeakers = formatSpeakerNamesList(session.speakerNames)
                      const committeeMembers = (Array.isArray(session.committeeMembers) ? session.committeeMembers : [])
                        .map((m: any) =>
                          m && typeof m === 'object'
                            ? { name: m.name as string, role: m.role as string | undefined }
                            : null,
                        )
                        .filter((m: any) => m?.name)
                      const moderatorName = speakerName(session.moderator)

                      return (
                        <div key={session.id} className="card p-8 hover:shadow-2xl transition-all">
                          <div className="flex flex-col lg:flex-row gap-6">
                            {/* Time & Venue */}
                            <div className="lg:w-56 flex-shrink-0 space-y-3">
                              <div>
                                <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Date & Time</div>
                                <div className="flex items-center gap-2 text-gray-900">
                                  <FiCalendar className="w-4 h-4 text-primary-600" />
                                  <span className="font-medium">
                                    {session.date ? formatSessionDate(session.date) : sessionDayLabel(session.day)}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-700 mt-1">
                                  <FiClock className="w-4 h-4 text-primary-600" />
                                  <span>
                                    {formatSessionTime(session.startTime)} – {formatSessionTime(session.endTime)}
                                  </span>
                                </div>
                              </div>

                              {session.venue && (
                                <div>
                                  <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Venue</div>
                                  <div className="flex items-center gap-2 text-gray-900">
                                    <FiMapPin className="w-4 h-4 text-primary-600" />
                                    <span className="font-medium">{session.venue}</span>
                                  </div>
                                </div>
                              )}

                              <div className="flex flex-wrap gap-2">
                                <span className="inline-block px-3 py-1 bg-primary-100 text-primary-600 text-xs font-bold rounded-full uppercase">
                                  {sessionTypeLabel(session.type) || session.type || 'Session'}
                                </span>
                                {session.track && (
                                  <span className={`inline-block px-3 py-1 text-xs font-bold rounded-full ${sessionTrackBadgeClass(session.track)}`}>
                                    {sessionTrackLabel(session.track)}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1">
                              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                                {session.title}
                              </h3>

                              {description && (
                                <p className="text-gray-600 mb-4 leading-relaxed whitespace-pre-line">
                                  {description}
                                </p>
                              )}

                              {(linkedSpeakers.length > 0 || guestSpeakers.length > 0) && (
                                <div className="flex items-start gap-2 mb-4">
                                  <FiUsers className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                                  <div>
                                    <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Speakers</div>
                                    <div className="text-sm text-gray-700 flex flex-wrap gap-x-1 gap-y-1">
                                      {linkedSpeakers.map((speaker: any, index: number) => (
                                        <span key={speaker.id ?? speaker.name}>
                                          {speaker.id ? (
                                            <Link
                                              href={`/programme/speakers/${speaker.id}`}
                                              className="text-primary-600 hover:text-primary-700 hover:underline font-medium"
                                            >
                                              {speaker.name}
                                            </Link>
                                          ) : (
                                            speaker.name
                                          )}
                                          {index < linkedSpeakers.length - 1 || guestSpeakers.length > 0 ? ',' : ''}
                                        </span>
                                      ))}
                                      {guestSpeakers.map((name: string, index: number) => (
                                        <span key={name}>
                                          {name}
                                          {index < guestSpeakers.length - 1 ? ',' : ''}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              )}

                              {committeeMembers.length > 0 && (
                                <div className="flex items-start gap-2 mb-4">
                                  <FiUsers className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                                  <div>
                                    <div className="text-xs font-semibold text-gray-500 uppercase mb-1">
                                      Youth Steering Committee
                                    </div>
                                    <div className="text-sm text-gray-700">
                                      {committeeMembers.map((member: any, index: number) => (
                                        <span key={member.name}>
                                          <Link
                                            href="/about/youth-steering-committee"
                                            className="text-primary-600 hover:text-primary-700 hover:underline font-medium"
                                          >
                                            {member.name}
                                          </Link>
                                          {member.role ? ` (${member.role})` : ''}
                                          {index < committeeMembers.length - 1 ? ', ' : ''}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              )}

                              {moderatorName && (
                                <div className="flex items-center gap-2 mb-4 text-sm text-gray-700">
                                  <FiUser className="w-4 h-4 text-gray-400" />
                                  <span>
                                    <span className="font-semibold text-gray-500">Moderator:</span> {moderatorName}
                                  </span>
                                </div>
                              )}

                              <div className="flex flex-wrap gap-3">
                                <a
                                  href={`/api/programme/ical?sessionId=${session.id}`}
                                  download
                                  className="btn-outline text-sm"
                                >
                                  Add to Calendar
                                </a>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
