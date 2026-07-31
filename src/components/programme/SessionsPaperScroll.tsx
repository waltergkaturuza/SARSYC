'use client'

import Link from 'next/link'
import { useCallback, useEffect, useRef } from 'react'
import { FiCalendar, FiClock, FiMapPin, FiUser, FiUsers } from 'react-icons/fi'
import {
  formatSessionDate,
  formatSessionTime,
  sessionDayLabel,
  sessionDayTheme,
  sessionTrackBadgeClass,
  sessionTrackLabel,
  sessionTypeLabel,
} from '@/lib/sessionsContent'

export type SessionPerson = {
  id?: string | null
  name: string
  affiliation: string
  href?: string | null
}

export type SessionCardData = {
  id: number | string
  title: string
  date?: string | null
  day?: string | null
  startTime?: string | null
  endTime?: string | null
  venue?: string | null
  type?: string | null
  track?: string | null
  description: string
  speakers: SessionPerson[]
  guestSpeakers: string[]
  committeeMembers: SessionPerson[]
  moderator: SessionPerson | null
}

export type SessionDayGroup = {
  value: string
  label: string
  sessions: SessionCardData[]
}

function applySheetTransforms(root: HTMLElement) {
  const sheets = root.querySelectorAll<HTMLElement>('[data-paper-sheet]')
  const vh = window.innerHeight
  const centerY = vh / 2
  // Soft falloff — curl only near the top/bottom fifth of the viewport
  const half = Math.max(vh * 0.55, 1)

  sheets.forEach((sheet) => {
    const sheetRect = sheet.getBoundingClientRect()
    // Skip far off-screen sheets for a bit of perf
    if (sheetRect.bottom < -80 || sheetRect.top > vh + 80) {
      sheet.style.transform = ''
      sheet.style.opacity = ''
      return
    }

    const sheetCenter = sheetRect.top + sheetRect.height / 2
    const t = Math.max(-1, Math.min(1, (sheetCenter - centerY) / half))
    const abs = Math.abs(t)
    // Softer curve: only engage near edges
    const edge = Math.max(0, (abs - 0.35) / 0.65)
    const curl = Math.pow(edge, 1.6)
    const rotateX = t * -22 * curl
    const translateZ = -curl * 28
    const scale = 1 - curl * 0.035
    const opacity = 1 - curl * 0.12

    sheet.style.transform = `perspective(1400px) rotateX(${rotateX}deg) translateZ(${translateZ}px) scale(${scale})`
    sheet.style.opacity = String(Math.max(0.78, opacity))
    sheet.style.filter = 'none'
  })
}

export default function SessionsPaperScroll({ dayGroups }: { dayGroups: SessionDayGroup[] }) {
  const stageRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef(0)

  const update = useCallback(() => {
    const stage = stageRef.current
    if (!stage) return
    applySheetTransforms(stage)
  }, [])

  useEffect(() => {
    const onScroll = () => {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [update, dayGroups])

  return (
    <div ref={stageRef} className="session-paper-stage mx-auto max-w-5xl">
      {/* Soft fixed curls that stay at viewport edges while the page scrolls */}
      <div className="session-paper-curl session-paper-curl--fixed session-paper-curl--top" aria-hidden>
        <div className="session-paper-curl__roll" />
        <div className="session-paper-curl__fade" />
      </div>
      <div className="session-paper-curl session-paper-curl--fixed session-paper-curl--bottom" aria-hidden>
        <div className="session-paper-curl__roll" />
        <div className="session-paper-curl__fade" />
      </div>

      <div className="session-paper-frame relative px-1 sm:px-2">
        <div className="session-paper-surface space-y-14 pb-8 pt-4">
            {dayGroups.map((group) => {
              const theme = sessionDayTheme(group.value)
              return (
                <div key={group.value} id={group.value} className="scroll-mt-28">
                  <div
                    data-paper-sheet
                    className={`mb-7 rounded-xl border-l-4 ${theme.accent} ${theme.soft} px-5 py-4 will-change-transform`}
                    style={{ transformOrigin: 'center center', transformStyle: 'preserve-3d' }}
                  >
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                      Conference day
                    </p>
                    <h2 className="text-3xl font-bold text-slate-900">{group.label}</h2>
                  </div>

                  <div className="space-y-5">
                    {group.sessions.map((session) => (
                      <article
                        key={session.id}
                        data-paper-sheet
                        className={`group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm transition-all duration-300 will-change-transform ${theme.hover}`}
                        style={{ transformOrigin: 'center center', transformStyle: 'preserve-3d' }}
                      >
                        <div className={`absolute inset-y-0 left-0 w-1.5 ${theme.bar}`} aria-hidden />
                        <div className={`absolute inset-y-0 right-0 w-1.5 ${theme.bar}`} aria-hidden />

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
                              <span
                                className={`inline-block px-3 py-1 text-[11px] font-bold rounded-full uppercase tracking-wide ${theme.badge}`}
                              >
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

                            {session.description && (
                              <p className="text-slate-600 mb-5 leading-relaxed text-justify whitespace-pre-line">
                                {session.description}
                              </p>
                            )}

                            {(session.speakers.length > 0 || session.guestSpeakers.length > 0) && (
                              <div className="mb-4">
                                <div className="flex items-center gap-2 mb-2">
                                  <FiUsers className="w-4 h-4 text-slate-400" />
                                  <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                                    Speakers
                                  </div>
                                </div>
                                <ul className="space-y-2.5">
                                  {session.speakers.map((speaker) => (
                                    <li key={speaker.id ?? speaker.name} className="text-sm">
                                      {speaker.href ? (
                                        <Link
                                          href={speaker.href}
                                          className="font-semibold text-primary-700 hover:text-primary-800 hover:underline"
                                        >
                                          {speaker.name}
                                        </Link>
                                      ) : (
                                        <span className="font-semibold text-slate-900">
                                          {speaker.name}
                                        </span>
                                      )}
                                      {speaker.affiliation && (
                                        <span className="block text-slate-500 text-justify">
                                          {speaker.affiliation}
                                        </span>
                                      )}
                                    </li>
                                  ))}
                                  {session.guestSpeakers.map((name) => (
                                    <li key={name} className="text-sm font-medium text-slate-800">
                                      {name}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {session.committeeMembers.length > 0 && (
                              <div className="mb-4">
                                <div className="flex items-center gap-2 mb-2">
                                  <FiUsers className="w-4 h-4 text-slate-400" />
                                  <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                                    Youth Steering Committee
                                  </div>
                                </div>
                                <ul className="space-y-2.5">
                                  {session.committeeMembers.map((member) => (
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

                            {session.moderator && (
                              <div className="mb-5">
                                {session.moderator.href ? (
                                  <Link
                                    href={session.moderator.href}
                                    className="block rounded-xl bg-slate-50 border border-slate-100 px-4 py-3 transition-colors hover:bg-primary-50 hover:border-primary-200 group/mod"
                                  >
                                    <div className="flex items-start gap-2 text-sm">
                                      <FiUser className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                                      <div>
                                        <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1">
                                          Moderator
                                        </div>
                                        <div className="font-semibold text-primary-700 group-hover/mod:text-primary-800 group-hover/mod:underline">
                                          {session.moderator.name}
                                        </div>
                                        {session.moderator.affiliation && (
                                          <div className="text-slate-500 text-justify mt-0.5">
                                            {session.moderator.affiliation}
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
                                        <div className="font-semibold text-slate-900">
                                          {session.moderator.name}
                                        </div>
                                        {session.moderator.affiliation && (
                                          <div className="text-slate-500 text-justify mt-0.5">
                                            {session.moderator.affiliation}
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
                    ))}
                  </div>
                </div>
              )
            })}
        </div>
      </div>
    </div>
  )
}
