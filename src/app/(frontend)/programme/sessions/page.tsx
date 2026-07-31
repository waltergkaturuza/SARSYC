import Link from 'next/link'
import { FiCalendar, FiClock, FiMapPin, FiUsers, FiUser, FiDownload } from 'react-icons/fi'
import { getPayloadClient } from '@/lib/payload'
import { slateToPlainText } from '@/lib/newsContent'
import { getCountryLabel } from '@/lib/countries'
import {
  formatSessionTime,
  formatSessionDate,
  sessionDayLabel,
  sessionTrackLabel,
  sessionTrackBadgeClass,
  sessionTypeLabel,
  formatSpeakerNamesList,
  formatPersonAffiliation,
  sessionDayTheme,
  SESSION_DAY_OPTIONS,
} from '@/lib/sessionsContent'

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

function personFromSpeaker(value: unknown) {
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

function personFromCommittee(value: unknown) {
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

  const dayGroups = SESSION_DAY_OPTIONS.map((dayOption) => ({
    ...dayOption,
    sessions: sessions.filter((session) => (session.day || 'day-1') === dayOption.value),
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

      <section className="section bg-gradient-to-b from-slate-50 to-white">
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
            <div className="max-w-5xl mx-auto space-y-14">
              {dayGroups.map((group) => {
                const theme = sessionDayTheme(group.value)
                return (
                  <div key={group.value} id={group.value} className="scroll-mt-24">
                    <div className={`mb-7 rounded-xl border-l-4 ${theme.accent} ${theme.soft} px-5 py-4`}>
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                        Conference day
                      </p>
                      <h2 className="text-3xl font-bold text-slate-900">{group.label}</h2>
                    </div>

                    <div className="space-y-5">
                      {group.sessions.map((session: any) => {
                        const description = slateToPlainText(session.description)
                        const linkedSpeakers = (Array.isArray(session.speakers) ? session.speakers : [])
                          .map(personFromSpeaker)
                          .filter(Boolean) as NonNullable<ReturnType<typeof personFromSpeaker>>[]
                        const guestSpeakers = formatSpeakerNamesList(session.speakerNames)
                        const committeeMembers = (
                          Array.isArray(session.committeeMembers) ? session.committeeMembers : []
                        )
                          .map(personFromCommittee)
                          .filter(Boolean) as NonNullable<ReturnType<typeof personFromCommittee>>[]
                        const speakerModerator = personFromSpeaker(session.moderator)
                        const committeeModerator = personFromCommittee(session.committeeModerator)
                        const moderator = speakerModerator || committeeModerator

                        return (
                          <article
                            key={session.id}
                            className={`group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm transition-all duration-300 hover:-translate-y-0.5 ${theme.hover}`}
                          >
                            <div
                              className={`absolute inset-y-0 left-0 w-1.5 ${theme.bar}`}
                              aria-hidden
                            />
                            <div
                              className={`absolute inset-y-0 right-0 w-1.5 ${theme.bar}`}
                              aria-hidden
                            />

                            <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 px-2">
                              <aside className="lg:w-60 flex-shrink-0 space-y-4">
                                <div>
                                  <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                                    Date & Time
                                  </div>
                                  <div className="flex items-start gap-2 text-slate-900">
                                    <FiCalendar className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
                                    <span className="font-medium text-sm leading-snug">
                                      {session.date
                                        ? formatSessionDate(session.date)
                                        : sessionDayLabel(session.day)}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 text-slate-700 mt-1.5">
                                    <FiClock className="w-4 h-4 text-slate-500 flex-shrink-0" />
                                    <span className="text-sm font-semibold tabular-nums">
                                      {formatSessionTime(session.startTime)} –{' '}
                                      {formatSessionTime(session.endTime)}
                                    </span>
                                  </div>
                                </div>

                                {session.venue && (
                                  <div>
                                    <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                                      Venue
                                    </div>
                                    <div className="flex items-start gap-2 text-slate-900">
                                      <FiMapPin className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
                                      <span className="font-medium text-sm">{session.venue}</span>
                                    </div>
                                  </div>
                                )}

                                <div className="flex flex-wrap gap-2 pt-1">
                                  <span className={`inline-block px-3 py-1 text-[11px] font-bold rounded-full uppercase tracking-wide ${theme.badge}`}>
                                    {sessionTypeLabel(session.type) || session.type || 'Session'}
                                  </span>
                                  {session.track && (
                                    <span
                                      className={`inline-block px-3 py-1 text-[11px] font-bold rounded-full ${sessionTrackBadgeClass(session.track)}`}
                                    >
                                      {sessionTrackLabel(session.track)}
                                    </span>
                                  )}
                                </div>
                              </aside>

                              <div className="flex-1 min-w-0">
                                <h3 className="text-2xl font-bold text-slate-900 mb-3 tracking-tight group-hover:text-slate-800">
                                  {session.title}
                                </h3>

                                {description && (
                                  <p className="text-slate-600 mb-5 leading-relaxed text-justify whitespace-pre-line">
                                    {description}
                                  </p>
                                )}

                                {(linkedSpeakers.length > 0 || guestSpeakers.length > 0) && (
                                  <div className="mb-4">
                                    <div className="flex items-center gap-2 mb-2">
                                      <FiUsers className="w-4 h-4 text-slate-400" />
                                      <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                                        Speakers
                                      </div>
                                    </div>
                                    <ul className="space-y-2.5">
                                      {linkedSpeakers.map((speaker) => (
                                        <li key={speaker.id ?? speaker.name} className="text-sm">
                                          {speaker.id ? (
                                            <Link
                                              href={`/programme/speakers/${speaker.id}`}
                                              className="font-semibold text-primary-700 hover:text-primary-800 hover:underline"
                                            >
                                              {speaker.name}
                                            </Link>
                                          ) : (
                                            <span className="font-semibold text-slate-900">{speaker.name}</span>
                                          )}
                                          {speaker.affiliation && (
                                            <span className="block text-slate-500 text-justify">
                                              {speaker.affiliation}
                                            </span>
                                          )}
                                        </li>
                                      ))}
                                      {guestSpeakers.map((name) => (
                                        <li key={name} className="text-sm font-medium text-slate-800">
                                          {name}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}

                                {committeeMembers.length > 0 && (
                                  <div className="mb-4">
                                    <div className="flex items-center gap-2 mb-2">
                                      <FiUsers className="w-4 h-4 text-slate-400" />
                                      <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                                        Youth Steering Committee
                                      </div>
                                    </div>
                                    <ul className="space-y-2.5">
                                      {committeeMembers.map((member) => (
                                        <li key={member.id ?? member.name} className="text-sm">
                                          <Link
                                            href={member.href || '/about/youth-steering-committee'}
                                            className="font-semibold text-primary-700 hover:text-primary-800 hover:underline"
                                          >
                                            {member.name}
                                          </Link>
                                          {member.affiliation && (
                                            <span className="block text-slate-500 text-justify">
                                              {member.affiliation}
                                            </span>
                                          )}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}

                                {moderator && (
                                  <div className="mb-5">
                                    {moderator.href ? (
                                      <Link
                                        href={moderator.href}
                                        className="block rounded-xl bg-slate-50 border border-slate-100 px-4 py-3 transition-colors hover:bg-primary-50 hover:border-primary-200 group/mod"
                                      >
                                        <div className="flex items-start gap-2 text-sm">
                                          <FiUser className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                                          <div>
                                            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1">
                                              Moderator
                                            </div>
                                            <div className="font-semibold text-primary-700 group-hover/mod:text-primary-800 group-hover/mod:underline">
                                              {moderator.name}
                                            </div>
                                            {moderator.affiliation && (
                                              <div className="text-slate-500 text-justify mt-0.5">
                                                {moderator.affiliation}
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      </Link>
                                    ) : (
                                      <div className="rounded-xl bg-slate-50 border border-slate-100 px-4 py-3">
                                        <div className="flex items-start gap-2 text-sm">
                                          <FiUser className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                                          <div>
                                            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1">
                                              Moderator
                                            </div>
                                            <div className="font-semibold text-slate-900">{moderator.name}</div>
                                            {moderator.affiliation && (
                                              <div className="text-slate-500 text-justify mt-0.5">
                                                {moderator.affiliation}
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}

                                <div className="flex flex-wrap gap-3 pt-1">
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
                          </article>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
