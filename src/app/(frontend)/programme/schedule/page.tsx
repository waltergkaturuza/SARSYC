import Link from 'next/link'
import { FiCalendar, FiUsers, FiFileText, FiAward, FiLink } from 'react-icons/fi'

const day1Sessions: Array<{
  time: string
  title: string
  type: string
  description: string
  tracks?: string[]
  highlights?: string[]
}> = [
  {
    time: '09:00 - 12:00',
    title: 'Regional Research Indaba',
    type: 'Research Presentations',
    description: 'Youth-led research presentations across 5 thematic tracks',
    tracks: [
      'Education Rights, Gender Equality & Climate Resilience',
      'HIV/AIDS & Key Populations (PWUID)',
      'NCD Prevention & Healthy Lifestyles',
      'Digital Health & Online GBV',
      'Mental Health & Substance Abuse',
    ],
  },
  {
    time: '14:00 - 17:00',
    title: 'Web for Life Network Symposium',
    type: 'Symposium',
    description: 'Young Women\'s Forum focusing on gender-responsive solutions',
  },
  {
    time: '14:00 - 17:00',
    title: 'Mugota/Ixhiba Young Men\'s Forum',
    type: 'Forum',
    description: 'Engaging young men in health and education advocacy',
  },
]

const day2Sessions = [
  {
    time: '09:00 - 12:00',
    title: 'Alliance Building Labs',
    type: 'Interactive Workshop',
    description: 'Featuring the GEAR Alliance and other regional partnerships',
    highlights: [
      'Building cross-sector partnerships',
      'Strengthening regional networks',
      'Collaborative action planning',
    ],
  },
  {
    time: '14:00 - 17:00',
    title: 'STEPP Platform',
    type: 'Platform Session',
    description: 'Students Talks & Engagement with Policymakers & Partners',
    highlights: [
      'Youth-policymaker dialogue',
      'Policy recommendations presentation',
      'Partnership commitments',
    ],
  },
]

const day3Sessions = [
  {
    time: '09:00 - 10:30',
    title: 'Official Opening & Keynotes',
    type: 'Opening Ceremony',
    description: 'High-level opening with keynote addresses from regional leaders',
  },
  {
    time: '11:00 - 12:30',
    title: 'Presentation of Conference Declaration',
    type: 'Declaration',
    description: 'Unveiling of SARSYC VI Declaration and commitments',
  },
  {
    time: '14:00 - 17:00',
    title: 'Exhibitions & Networking',
    type: 'Exhibition',
    description: 'Partner exhibitions, networking, and knowledge exchange',
  },
  {
    time: '19:00 - 22:00',
    title: 'Culture Night',
    type: 'Cultural Event',
    description: 'Celebrating all SADC countries through cultural performances',
  },
]

export default function SchedulePage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-600 to-secondary-600 text-white py-20">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Conference Programme Schedule
            </h1>
            <p className="text-xl text-white/90">
              Three days of evidence, dialogue, policy action, and cultural celebration
            </p>
          </div>
        </div>
      </section>

      {/* Day 1 */}
      <section className="section bg-white">
        <div className="container-custom">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                1
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Day 1 – Evidence & Gendered Dialogues</h2>
                <p className="text-gray-600">Tuesday, August 5, 2026</p>
              </div>
            </div>

            <div className="space-y-6">
              {day1Sessions.map((session) => (
                <div key={session.time} className="card p-8">
                  <div className="flex flex-col lg:flex-row gap-6">
                    <div className="lg:w-48 flex-shrink-0">
                      <div className="text-sm font-semibold text-primary-600 mb-2">Time</div>
                      <div className="text-lg font-bold text-gray-900">{session.time}</div>
                      <div className="mt-4">
                        <span className="inline-block px-3 py-1 bg-primary-100 text-primary-600 text-xs font-bold rounded-full uppercase">
                          {session.type}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-gray-900 mb-3">{session.title}</h3>
                      <p className="text-gray-600 mb-4 leading-relaxed">{session.description}</p>
                      {session.tracks && (
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="text-sm font-semibold text-gray-700 mb-2">Research Tracks:</div>
                          <ul className="space-y-2">
                            {session.tracks.map((track, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                                <span className="text-primary-600 mt-1">•</span>
                                {track}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {session.highlights && (
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="text-sm font-semibold text-gray-700 mb-2">Key Highlights:</div>
                          <ul className="space-y-2">
                            {session.highlights.map((highlight, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                                <span className="text-primary-600 mt-1">•</span>
                                {highlight}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Day 2 */}
      <section className="section bg-gray-50">
        <div className="container-custom">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 bg-secondary-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                2
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Day 2 – Alliance & Policy Action</h2>
                <p className="text-gray-600">Wednesday, August 6, 2026</p>
              </div>
            </div>

            <div className="space-y-6">
              {day2Sessions.map((session) => (
                <div key={session.time} className="card p-8">
                  <div className="flex flex-col lg:flex-row gap-6">
                    <div className="lg:w-48 flex-shrink-0">
                      <div className="text-sm font-semibold text-secondary-600 mb-2">Time</div>
                      <div className="text-lg font-bold text-gray-900">{session.time}</div>
                      <div className="mt-4">
                        <span className="inline-block px-3 py-1 bg-secondary-100 text-secondary-600 text-xs font-bold rounded-full uppercase">
                          {session.type}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-gray-900 mb-3">{session.title}</h3>
                      <p className="text-gray-600 mb-4 leading-relaxed">{session.description}</p>
                      {session.highlights && (
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="text-sm font-semibold text-gray-700 mb-2">Key Highlights:</div>
                          <ul className="space-y-2">
                            {session.highlights.map((highlight, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                                <span className="text-secondary-600 mt-1">•</span>
                                {highlight}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Day 3 */}
      <section className="section bg-white">
        <div className="container-custom">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 bg-accent-500 rounded-full flex items-center justify-center text-gray-900 text-2xl font-bold">
                3
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Day 3 – High-Level Engagement & Culture</h2>
                <p className="text-gray-600">Thursday, August 7, 2026</p>
              </div>
            </div>

            <div className="space-y-6">
              {day3Sessions.map((session) => (
                <div key={session.time} className="card p-8">
                  <div className="flex flex-col lg:flex-row gap-6">
                    <div className="lg:w-48 flex-shrink-0">
                      <div className="text-sm font-semibold text-accent-600 mb-2">Time</div>
                      <div className="text-lg font-bold text-gray-900">{session.time}</div>
                      <div className="mt-4">
                        <span className="inline-block px-3 py-1 bg-accent-100 text-accent-700 text-xs font-bold rounded-full uppercase">
                          {session.type}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-gray-900 mb-3">{session.title}</h3>
                      <p className="text-gray-600 leading-relaxed">{session.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Post-Conference */}
      <section className="section bg-gray-50">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <div className="card p-8 md:p-12 bg-primary-50 border-2 border-primary-200">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Post-Conference Advocacy</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Orathon</h3>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    Join us for advocacy runs (8km & 16km) focusing on ending GBV and preventing NCDs.
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg p-4">
                      <div className="font-bold text-gray-900 mb-1">8km Run</div>
                      <div className="text-sm text-gray-600">For all fitness levels</div>
                    </div>
                    <div className="bg-white rounded-lg p-4">
                      <div className="font-bold text-gray-900 mb-1">16km Run</div>
                      <div className="text-sm text-gray-600">For experienced runners</div>
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 text-sm">
                  <strong>Focus:</strong> Ending GBV & Preventing NCDs
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section bg-primary-600 text-white">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Join Us?
            </h2>
            <p className="text-xl mb-8 text-white/90">
              Register now to secure your spot at SARSYC VI
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/participate/register" className="btn-accent px-8 py-4">
                Register Now
              </Link>
              <Link href="/programme" className="btn-outline border-white text-white hover:bg-white/10 px-8 py-4">
                View Full Programme
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

