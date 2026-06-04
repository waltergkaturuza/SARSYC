'use client'

import { useState } from 'react'
import Link from 'next/link'
import { FiClock, FiMapPin, FiUser, FiCalendar, FiFilter } from 'react-icons/fi'
import {
  PROGRAMME_DAYS,
  PROGRAMME_TRACKS,
  PROGRAMME_TYPES,
  PROGRAMME_SESSIONS,
  filterProgrammeSessions,
  sessionTypeBadgeClass,
  type ProgrammeSession,
} from '@/lib/programmeSessions'

type ProgrammeSessionsSectionProps = {
  /** Page layout with filter bar above; embed fits inside overview section */
  variant?: 'page' | 'embed'
  title?: string
  subtitle?: string
  sessions?: ProgrammeSession[]
  showViewFullLink?: boolean
}

export default function ProgrammeSessionsSection({
  variant = 'page',
  title,
  subtitle,
  sessions = PROGRAMME_SESSIONS,
  showViewFullLink = false,
}: ProgrammeSessionsSectionProps) {
  const [selectedDay, setSelectedDay] = useState<string>('All Days')
  const [selectedTrack, setSelectedTrack] = useState('all')
  const [selectedType, setSelectedType] = useState<string>('All Types')
  const [showFilters, setShowFilters] = useState(false)

  const filtered = filterProgrammeSessions(sessions, selectedDay, selectedTrack, selectedType)

  const clearFilters = () => {
    setSelectedDay('All Days')
    setSelectedTrack('all')
    setSelectedType('All Types')
  }

  const filtersBlock = (
    <div className={variant === 'page' ? 'space-y-6' : 'space-y-5'}>
      <div>
        <p className="text-sm font-medium text-gray-700 mb-3">Day</p>
        <div className="flex flex-wrap gap-2">
          {PROGRAMME_DAYS.map((day) => (
            <button
              key={day}
              type="button"
              onClick={() => setSelectedDay(day)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedDay === day
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {day}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="text-sm font-medium text-gray-700 mb-3">Conference Track</p>
        <div className="flex flex-wrap gap-2">
          {PROGRAMME_TRACKS.map((track) => (
            <button
              key={track.value}
              type="button"
              onClick={() => setSelectedTrack(track.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedTrack === track.value
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {track.label}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="text-sm font-medium text-gray-700 mb-3">Session Type</p>
        <div className="flex flex-wrap gap-2">
          {PROGRAMME_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setSelectedType(type)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedType === type
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>
    </div>
  )

  const sessionsList = (
    <>
      <div className="flex items-center justify-between mb-8">
        <p className="text-gray-600">
          Showing <strong>{filtered.length}</strong> session{filtered.length === 1 ? '' : 's'}
        </p>
        <button
          type="button"
          onClick={clearFilters}
          className="text-sm text-primary-600 font-medium hover:underline"
        >
          Clear all filters
        </button>
      </div>

      <div className="space-y-6">
        {filtered.map((session) => (
          <div key={session.id} className="card p-6 hover:shadow-xl transition-all">
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="lg:w-48 flex-shrink-0">
                <div className="flex lg:flex-col gap-4 lg:gap-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FiCalendar className="w-4 h-4 text-primary-600" />
                    <span className="font-medium">{session.day}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FiClock className="w-4 h-4 text-primary-600" />
                    <span className="font-medium">
                      {session.startTime} - {session.endTime}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FiMapPin className="w-4 h-4 text-primary-600" />
                    <span className="font-medium">{session.venue}</span>
                  </div>
                </div>
                <div className="mt-4 hidden lg:block">
                  <span
                    className={`inline-block px-3 py-1 text-xs font-bold rounded-full uppercase ${sessionTypeBadgeClass(session.type)}`}
                  >
                    {session.type}
                  </span>
                </div>
              </div>

              <div className="flex-1">
                <div className="flex flex-wrap items-start gap-2 mb-3 lg:hidden">
                  <span
                    className={`px-3 py-1 text-xs font-bold rounded-full uppercase ${sessionTypeBadgeClass(session.type)}`}
                  >
                    {session.type}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-3">{session.title}</h3>
                <p className="text-gray-600 mb-4">{session.description}</p>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FiUser className="w-4 h-4 shrink-0" />
                    <span>{session.speakers.join(', ')}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 mt-4">
                  <Link
                    href={`/programme#session-${session.id}`}
                    className="text-sm text-primary-600 font-medium hover:underline"
                  >
                    View Details
                  </Link>
                  <a
                    href={`/api/programme/ical?sessionId=${session.id}`}
                    download
                    className="text-sm text-primary-600 font-medium hover:underline"
                  >
                    Add to Calendar
                  </a>
                  <button
                    type="button"
                    className="text-sm text-primary-600 font-medium hover:underline"
                  >
                    Bookmark
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiCalendar className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Sessions Found</h3>
          <p className="text-gray-600 mb-6">Try adjusting your filters.</p>
          <button type="button" className="btn-primary" onClick={clearFilters}>
            Clear All Filters
          </button>
        </div>
      )}

      {showViewFullLink && (
        <div className="text-center mt-10">
          <Link href="/programme" className="btn-outline inline-flex items-center gap-2">
            View full programme
            <FiCalendar className="w-4 h-4" />
          </Link>
        </div>
      )}
    </>
  )

  if (variant === 'embed') {
    return (
      <div>
        {title && <h2 className="section-title">{title}</h2>}
        {subtitle && <p className="section-subtitle">{subtitle}</p>}

        <div className="card p-6 mb-8 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FiFilter className="w-5 h-5 text-gray-600" />
              <h3 className="font-semibold text-gray-900">Filter Sessions</h3>
            </div>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden btn-outline text-sm"
            >
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
          </div>
          <div className={showFilters ? 'block' : 'hidden lg:block'}>{filtersBlock}</div>
        </div>

        {sessionsList}
      </div>
    )
  }

  return (
    <>
      <section className="bg-gray-50 py-8 border-b border-gray-200">
        <div className="container-custom">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <FiFilter className="w-5 h-5 text-gray-600" />
              <h3 className="font-semibold text-gray-900">Filter Sessions</h3>
            </div>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden btn-outline text-sm"
            >
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
          </div>
          <div className={`${showFilters ? 'block' : 'hidden lg:block'}`}>{filtersBlock}</div>
        </div>
      </section>

      <section className="section bg-white">
        <div className="container-custom">{sessionsList}</div>
      </section>
    </>
  )
}
