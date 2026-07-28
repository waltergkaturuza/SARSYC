import React from 'react'
import { getPayloadClient } from '@/lib/payload'
import Link from 'next/link'
import {
  FiCalendar, FiFilter, FiPlus, FiEdit, FiMapPin, FiClock, FiEye
} from 'react-icons/fi'
import { slateToPlainText } from '@/lib/newsContent'
import {
  formatSessionTime,
  formatSessionDate,
  sessionTrackLabel,
  sessionTrackBadgeClass,
  sessionDayLabel,
  SESSION_TRACK_OPTIONS,
  SESSION_DAY_OPTIONS,
  SESSION_TYPE_OPTIONS,
} from '@/lib/sessionsContent'

export const revalidate = 0

interface SearchParams {
  page?: string
  type?: string
  track?: string
  day?: string
}

export default async function SessionsManagementPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const payload = await getPayloadClient()

  const page = Number(searchParams.page || 1)
  const perPage = 50
  const type = searchParams.type
  const track = searchParams.track
  const day = searchParams.day

  // Build where clause
  const where: any = {}

  if (type && type !== 'all') {
    where.type = { equals: type }
  }

  if (track && track !== 'all') {
    where.track = { equals: track }
  }

  if (day && day !== 'all') {
    where.day = { equals: day }
  }

  const results = await payload.find({
    collection: 'sessions',
    where,
    limit: perPage,
    page,
    sort: 'startTime',
    depth: 1,
  })

  const sessions = results.docs
  const totalPages = results.totalPages
  const totalDocs = results.totalDocs

  const typeConfig: Record<string, { color: string, label: string }> = {
    'keynote': { color: 'bg-purple-100 text-purple-700', label: 'Keynote' },
    'plenary': { color: 'bg-blue-100 text-blue-700', label: 'Plenary' },
    'panel': { color: 'bg-green-100 text-green-700', label: 'Panel' },
    'workshop': { color: 'bg-yellow-100 text-yellow-700', label: 'Workshop' },
    'oral': { color: 'bg-orange-100 text-orange-700', label: 'Abstract Presentation' },
    'poster': { color: 'bg-pink-100 text-pink-700', label: 'Poster Session' },
    'networking': { color: 'bg-indigo-100 text-indigo-700', label: 'Networking' },
    'break': { color: 'bg-gray-100 text-gray-600', label: 'Registration / Break' },
    'side-event': { color: 'bg-gray-100 text-gray-700', label: 'Side Event' },
    'post-conference': { color: 'bg-teal-100 text-teal-700', label: 'Post-Conference' },
    'orathon': { color: 'bg-red-100 text-red-700', label: 'Orathon' },
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sessions Management</h1>
          <p className="text-gray-600 mt-1">Manage conference programme and schedule</p>
        </div>
        <Link href="/admin/sessions/new" className="btn-primary flex items-center gap-2">
          <FiPlus className="w-5 h-5" />
          Add Session
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-gray-900">{totalDocs}</div>
          <div className="text-sm text-gray-600">Total Sessions</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-gray-900">3</div>
          <div className="text-sm text-gray-600">Conference Days</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-gray-900">5</div>
          <div className="text-sm text-gray-600">Tracks</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <FiFilter className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
        </div>

        <form action="/admin/sessions" method="get" className="grid md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Session Type</label>
            <select
              name="type"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              defaultValue={type || 'all'}
            >
              <option value="all">All Types</option>
              {SESSION_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Track</label>
            <select
              name="track"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              defaultValue={track || 'all'}
            >
              <option value="all">All Tracks</option>
              {SESSION_TRACK_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Day</label>
            <select
              name="day"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              defaultValue={day || 'all'}
            >
              <option value="all">All Days</option>
              {SESSION_DAY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Apply Filters
          </button>
        </form>
      </div>

      {/* Sessions List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <p className="text-sm text-gray-600">
            Showing {sessions.length} of {totalDocs} sessions
          </p>
        </div>

        {sessions.length === 0 ? (
          <div className="p-12 text-center">
            <FiCalendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 mb-4">No sessions found</p>
            <Link href="/admin/sessions/new" className="btn-primary inline-flex items-center gap-2">
              <FiPlus className="w-5 h-5" />
              Add your first session
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {sessions.map((session: any) => {
              const typeInfo = typeConfig[session.type] || typeConfig['oral']
              const descriptionText = slateToPlainText(session.description)
              const linkedSpeakers = Array.isArray(session.speakers) ? session.speakers : []

              return (
                <div key={session.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-bold text-gray-900">{session.title}</h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${typeInfo.color}`}>
                          {typeInfo.label}
                        </span>
                      </div>

                      <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center gap-2">
                          <FiCalendar className="w-4 h-4" />
                          {session.day ? sessionDayLabel(session.day) : formatSessionDate(session.date)}
                        </div>
                        <div className="flex items-center gap-2">
                          <FiClock className="w-4 h-4" />
                          {formatSessionTime(session.startTime)} - {formatSessionTime(session.endTime)}
                        </div>
                        <div className="flex items-center gap-2">
                          <FiMapPin className="w-4 h-4" />
                          {session.venue}
                        </div>
                      </div>

                      {descriptionText && (
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {descriptionText}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-2">
                        {session.track && (
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${sessionTrackBadgeClass(session.track)}`}>
                            {sessionTrackLabel(session.track)}
                          </span>
                        )}
                        {linkedSpeakers.length > 0 && (
                          <span className="text-xs text-gray-500">
                            {linkedSpeakers
                              .map((s: any) => (typeof s === 'object' ? s.name : null))
                              .filter(Boolean)
                              .join(', ') || `${linkedSpeakers.length} speaker(s)`}
                          </span>
                        )}
                        {session.speakerNames && (
                          <span className="text-xs text-gray-500">{session.speakerNames}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2 ml-4">
                      <Link
                        href={`/admin/sessions/${session.id}`}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title="View"
                      >
                        <FiEye className="w-4 h-4" />
                      </Link>
                      <Link
                        href={`/admin/sessions/${session.id}/edit`}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <FiEdit className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Page {page} of {totalPages}
            </div>
            <div className="flex gap-2">
              {page > 1 && (
                <Link
                  href={`/admin/sessions?page=${page - 1}`}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Previous
                </Link>
              )}
              {page < totalPages && (
                <Link
                  href={`/admin/sessions?page=${page + 1}`}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Next
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
