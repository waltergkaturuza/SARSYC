'use client'

import { useState } from 'react'
import Link from 'next/link'
import { FiClock, FiMapPin, FiUser, FiCalendar, FiFilter, FiDownload } from 'react-icons/fi'

// Sample data - will fetch from Payload CMS
const sessions = [
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
    description: 'Opening remarks followed by keynote address on current youth health landscape and opportunities.',
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
  // Add more sessions...
]

const days = ['All Days', 'Day 1', 'Day 2', 'Day 3']
const tracks = [
  { value: 'all', label: 'All Tracks', color: 'gray' },
  { value: 'general', label: 'Plenary', color: 'blue' },
  { value: 'srhr', label: 'Track 1: SRHR', color: 'blue' },
  { value: 'education', label: 'Track 2: Education', color: 'purple' },
  { value: 'advocacy', label: 'Track 3: Advocacy', color: 'pink' },
  { value: 'innovation', label: 'Track 4: Innovation', color: 'orange' },
]
const types = ['All Types', 'Keynote', 'Plenary', 'Panel', 'Workshop', 'Oral Presentations', 'Poster Session']

export default function ProgrammePage() {
  const [selectedDay, setSelectedDay] = useState('All Days')
  const [selectedTrack, setSelectedTrack] = useState('all')
  const [selectedType, setSelectedType] = useState('All Types')
  const [showFilters, setShowFilters] = useState(false)

  const getTrackColor = (track: string) => {
    const trackData = tracks.find(t => t.value === track)
    return trackData?.color || 'gray'
  }

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-600 to-secondary-600 text-white py-20">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Conference Programme
            </h1>
            <p className="text-xl text-white/90 mb-8">
              Explore sessions, speakers, and schedule for SARSYC VI
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button className="btn-accent flex items-center gap-2">
                <FiDownload />
                Download Full Programme (PDF)
              </button>
              <Link href="/programme/speakers" className="btn-outline border-white text-white hover:bg-white/10">
                View All Speakers
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="bg-gray-50 py-8 border-b border-gray-200">
        <div className="container-custom">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <FiFilter className="w-5 h-5 text-gray-600" />
              <h3 className="font-semibold text-gray-900">Filter Sessions</h3>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden btn-outline text-sm"
            >
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
          </div>

          <div className={`space-y-6 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            {/* Day Filter */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-3">Day</p>
              <div className="flex flex-wrap gap-2">
                {days.map((day) => (
                  <button
                    key={day}
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

            {/* Track Filter */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-3">Conference Track</p>
              <div className="flex flex-wrap gap-2">
                {tracks.map((track) => (
                  <button
                    key={track.value}
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

            {/* Type Filter */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-3">Session Type</p>
              <div className="flex flex-wrap gap-2">
                {types.map((type) => (
                  <button
                    key={type}
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
        </div>
      </section>

      {/* Sessions */}
      <section className="section bg-white">
        <div className="container-custom">
          <div className="flex items-center justify-between mb-8">
            <p className="text-gray-600">
              Showing <strong>{sessions.length}</strong> sessions
            </p>
            <button className="text-sm text-primary-600 font-medium hover:underline">
              Clear all filters
            </button>
          </div>

          <div className="space-y-6">
            {sessions.map((session) => (
              <div key={session.id} className="card p-6 hover:shadow-xl transition-all">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Time & Venue */}
                  <div className="lg:w-48 flex-shrink-0">
                    <div className="flex lg:flex-col gap-4 lg:gap-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <FiCalendar className="w-4 h-4 text-primary-600" />
                        <span className="font-medium">{session.day}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <FiClock className="w-4 h-4 text-primary-600" />
                        <span className="font-medium">{session.startTime} - {session.endTime}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <FiMapPin className="w-4 h-4 text-primary-600" />
                        <span className="font-medium">{session.venue}</span>
                      </div>
                    </div>

                    <div className="mt-4 hidden lg:block">
                      <span className={`inline-block px-3 py-1 bg-${getTrackColor(session.track)}-100 text-${getTrackColor(session.track)}-600 text-xs font-bold rounded-full`}>
                        {session.type.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex flex-wrap items-start gap-2 mb-3 lg:hidden">
                      <span className={`px-3 py-1 bg-${getTrackColor(session.track)}-100 text-${getTrackColor(session.track)}-600 text-xs font-bold rounded-full`}>
                        {session.type.toUpperCase()}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-3 hover:text-primary-600 transition-colors cursor-pointer">
                      {session.title}
                    </h3>

                    <p className="text-gray-600 mb-4">
                      {session.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <FiUser className="w-4 h-4" />
                        <span>{session.speakers.join(', ')}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3 mt-4">
                      <button className="text-sm text-primary-600 font-medium hover:underline">
                        View Details
                      </button>
                      <button className="text-sm text-primary-600 font-medium hover:underline">
                        Add to Calendar
                      </button>
                      <button className="text-sm text-primary-600 font-medium hover:underline">
                        Bookmark
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* No Results */}
          {sessions.length === 0 && (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiCalendar className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Sessions Found</h3>
              <p className="text-gray-600 mb-6">Try adjusting your filters or search query.</p>
              <button className="btn-primary" onClick={() => {
                setSelectedDay('All Days')
                setSelectedTrack('all')
                setSelectedType('All Types')
              }}>
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      </section>
    </>
  )
}


