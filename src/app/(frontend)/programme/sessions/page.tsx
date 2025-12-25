import Link from 'next/link'
import { FiCalendar, FiClock, FiMapPin, FiUsers } from 'react-icons/fi'

// Sample sessions - will fetch from Payload CMS
const sessions = [
  {
    id: '1',
    title: 'Opening Ceremony & Keynote Address',
    type: 'keynote',
    track: 'general',
    day: 'Day 1 - August 5',
    startTime: '09:00',
    endTime: '10:30',
    venue: 'Main Hall',
    speakers: ['Dr. Sarah Mwangi', 'Hon. Minister of Health'],
    description: 'Official opening followed by keynote on the state of youth health in Southern Africa.',
  },
  {
    id: '2',
    title: 'Panel: Comprehensive Sexuality Education - Regional Progress',
    type: 'panel',
    track: 'srhr',
    day: 'Day 1 - August 5',
    startTime: '11:00',
    endTime: '12:30',
    venue: 'Conference Room A',
    speakers: ['Prof. Jane Doe', 'Dr. John Smith', 'Ms. Alice Brown'],
    description: 'Examining CSE implementation successes and challenges across Southern Africa.',
  },
  // Add more sessions...
]

export default function SessionsPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-600 to-secondary-600 text-white py-20">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Conference Sessions
            </h1>
            <p className="text-xl text-white/90">
              Browse all sessions for SARSYC VI
            </p>
          </div>
        </div>
      </section>

      {/* Info Banner */}
      <section className="bg-yellow-50 border-b border-yellow-200 py-6">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-gray-800">
              <strong>📅 Programme Update:</strong> Full session details will be published by July 1, 2026.
              Preliminary programme coming soon!
            </p>
          </div>
        </div>
      </section>

      {/* Sessions List */}
      <section className="section bg-white">
        <div className="container-custom">
          <div className="max-w-5xl mx-auto space-y-6">
            {sessions.map((session) => (
              <div key={session.id} className="card p-8 hover:shadow-2xl transition-all">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Time & Venue */}
                  <div className="lg:w-56 flex-shrink-0 space-y-3">
                    <div>
                      <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Date & Time</div>
                      <div className="flex items-center gap-2 text-gray-900">
                        <FiCalendar className="w-4 h-4 text-primary-600" />
                        <span className="font-medium">{session.day}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700 mt-1">
                        <FiClock className="w-4 h-4 text-primary-600" />
                        <span>{session.startTime} - {session.endTime}</span>
                      </div>
                    </div>

                    <div>
                      <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Venue</div>
                      <div className="flex items-center gap-2 text-gray-900">
                        <FiMapPin className="w-4 h-4 text-primary-600" />
                        <span className="font-medium">{session.venue}</span>
                      </div>
                    </div>

                    <div>
                      <span className="inline-block px-3 py-1 bg-primary-100 text-primary-600 text-xs font-bold rounded-full uppercase">
                        {session.type}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-3 hover:text-primary-600 transition-colors">
                      {session.title}
                    </h3>

                    <p className="text-gray-600 mb-4 leading-relaxed">
                      {session.description}
                    </p>

                    <div className="flex items-start gap-2 mb-6">
                      <FiUsers className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Speakers</div>
                        <div className="text-sm text-gray-700">
                          {session.speakers.join(', ')}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <Link href={`/programme/sessions/${session.id}`} className="btn-primary text-sm">
                        View Details
                      </Link>
                      <button className="btn-outline text-sm">
                        Add to Calendar
                      </button>
                      <button className="btn-outline text-sm">
                        Bookmark
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Coming Soon Notice */}
          <div className="mt-12 text-center bg-gray-50 rounded-xl p-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">More Sessions Coming Soon!</h3>
            <p className="text-gray-600 mb-6">
              We're finalizing the full programme with 40+ sessions across 4 tracks.
              Full schedule will be available by July 1, 2026.
            </p>
            <Link href="/participate/submit-abstract" className="btn-primary">
              Submit Your Abstract
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}

