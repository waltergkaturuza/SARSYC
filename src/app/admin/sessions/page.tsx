import React from 'react'
import { getPayloadClient } from '@/lib/payload'
import Link from 'next/link'
import { 
  FiCalendar, FiFilter, FiPlus, FiEdit, FiMapPin, FiClock 
} from 'react-icons/fi'

export const revalidate = 0

interface SearchParams {
  page?: string
  type?: string
  track?: string
  date?: string
}

export default async function SessionsManagementPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const payload = await getPayloadClient()
  
  const page = Number(searchParams.page || 1)
  const perPage = 20
  const type = searchParams.type
  const track = searchParams.track
  const date = searchParams.date

  // Build where clause
  const where: any = {}
  
  if (type && type !== 'all') {
    where.type = { equals: type }
  }
  
  if (track && track !== 'all') {
    where.track = { equals: track }
  }
  
  if (date) {
    where.date = { equals: date }
  }

  const results = await payload.find({
    collection: 'sessions',
    where,
    limit: perPage,
    page,
    sort: 'date,startTime',
  })

  const sessions = results.docs
  const totalPages = results.totalPages
  const totalDocs = results.totalDocs

  const typeConfig: Record<string, { color: string, label: string }> = {
    'keynote': { color: 'bg-purple-100 text-purple-700', label: 'Keynote' },
    'plenary': { color: 'bg-blue-100 text-blue-700', label: 'Plenary' },
    'panel': { color: 'bg-green-100 text-green-700', label: 'Panel' },
    'workshop': { color: 'bg-yellow-100 text-yellow-700', label: 'Workshop' },
    'oral': { color: 'bg-orange-100 text-orange-700', label: 'Oral Presentation' },
    'poster': { color: 'bg-pink-100 text-pink-700', label: 'Poster Session' },
    'networking': { color: 'bg-indigo-100 text-indigo-700', label: 'Networking' },
    'side-event': { color: 'bg-gray-100 text-gray-700', label: 'Side Event' },
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
          <div className="text-2xl font-bold text-gray-900">4</div>
          <div className="text-sm text-gray-600">Tracks</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <FiFilter className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
        </div>
        
        <div className="grid md:grid-cols-3 gap-4">
          {/* Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Session Type</label>
            <form action="/admin/sessions" method="get">
              <select
                name="type"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                defaultValue={type || 'all'}
              >
                <option value="all">All Types</option>
                <option value="keynote">Keynote</option>
                <option value="plenary">Plenary</option>
                <option value="panel">Panel Discussion</option>
                <option value="workshop">Workshop</option>
                <option value="oral">Oral Presentation</option>
                <option value="poster">Poster Session</option>
              </select>
            </form>
          </div>

          {/* Track Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Track</label>
            <form action="/admin/sessions" method="get">
              <select
                name="track"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                defaultValue={track || 'all'}
              >
                <option value="all">All Tracks</option>
                <option value="srhr">SRHR</option>
                <option value="education">Education</option>
                <option value="advocacy">Advocacy</option>
                <option value="innovation">Innovation</option>
              </select>
            </form>
          </div>

          {/* Date Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
            <form action="/admin/sessions" method="get">
              <select
                name="date"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">All Days</option>
                <option value="2026-08-05">Day 1 - Aug 5</option>
                <option value="2026-08-06">Day 2 - Aug 6</option>
                <option value="2026-08-07">Day 3 - Aug 7</option>
              </select>
            </form>
          </div>
        </div>
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
            <p className="text-gray-600">No sessions found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {sessions.map((session: any) => {
              const typeInfo = typeConfig[session.type] || typeConfig['oral']
              
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
                          {new Date(session.date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-2">
                          <FiClock className="w-4 h-4" />
                          {session.startTime} - {session.endTime}
                        </div>
                        <div className="flex items-center gap-2">
                          <FiMapPin className="w-4 h-4" />
                          {session.venue}
                        </div>
                      </div>
                      
                      {session.description && (
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {session.description}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
                          {session.track?.toUpperCase()}
                        </span>
                        {session.speakers && session.speakers.length > 0 && (
                          <span className="text-xs text-gray-500">
                            {session.speakers.length} speaker(s)
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2 ml-4">
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

