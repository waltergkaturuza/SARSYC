'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { FiCalendar, FiMapPin, FiUsers, FiTarget, FiTrendingUp, FiDownload, FiArrowRight, FiCheck, FiLoader } from 'react-icons/fi'
import CountdownTimer from '@/components/ui/CountdownTimer'
import dynamic from 'next/dynamic'

const InteractiveMap = dynamic(() => import('@/components/maps/InteractiveMap'), {
  ssr: false,
  loading: () => (
    <div className="aspect-square lg:aspect-auto lg:h-96 bg-gray-700 rounded-2xl overflow-hidden shadow-2xl flex items-center justify-center">
      <div className="text-center text-white">
        <p className="text-lg font-medium opacity-75">Loading map...</p>
      </div>
    </div>
  ),
})

interface VenueLocation {
  id: string
  venueName: string
  city: string
  country: string
  address?: string
  latitude: number
  longitude: number
  zoomLevel?: number
  description?: string
  conferenceEdition?: string
}

function VenueMapSection() {
  const [venue, setVenue] = useState<VenueLocation | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchVenue()
  }, [])

  const fetchVenue = async () => {
    try {
      const response = await fetch('/api/venue-locations?current=true')
      const result = await response.json()

      if (result.venues && result.venues.length > 0) {
        setVenue(result.venues[0])
      } else {
        // Fallback to default
        setVenue({
          id: 'default',
          venueName: 'Windhoek International Convention Centre',
          city: 'Windhoek',
          country: 'Namibia',
          address: '123 Independence Avenue, Windhoek, Namibia',
          latitude: -22.5597,
          longitude: 17.0832,
          zoomLevel: 15,
          conferenceEdition: 'SARSYC VI',
        })
      }
    } catch (error) {
      // Fallback to default
      setVenue({
        id: 'default',
        venueName: 'Windhoek International Convention Centre',
        city: 'Windhoek',
        country: 'Namibia',
        address: '123 Independence Avenue, Windhoek, Namibia',
        latitude: -22.5597,
        longitude: 17.0832,
        zoomLevel: 15,
        conferenceEdition: 'SARSYC VI',
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading || !venue) {
    return (
      <div className="w-full h-[500px] lg:h-[600px] bg-gray-700 rounded-2xl overflow-hidden shadow-2xl flex items-center justify-center">
        <div className="text-center text-white">
          <FiLoader className="w-16 h-16 mx-auto mb-4 opacity-50 animate-spin" />
          <p className="text-lg font-medium opacity-75">Loading map...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-[500px] lg:h-[600px] rounded-2xl overflow-hidden shadow-2xl">
      <InteractiveMap venue={venue} height="100%" showControls={true} />
    </div>
  )
}

const objectives = [
  {
    icon: FiUsers,
    title: 'Unite Youth Leaders',
    description: 'Bring together 500+ young leaders, researchers, and advocates from across Southern Africa.',
  },
  {
    icon: FiTrendingUp,
    title: 'Share Knowledge',
    description: 'Exchange cutting-edge research, best practices, and innovative solutions in youth health and education.',
  },
  {
    icon: FiTarget,
    title: 'Drive Action',
    description: 'Develop actionable commitments and strategies to advance youth health and education outcomes.',
  },
]

const importantDates = [
  { date: 'March 1, 2026', event: 'Call for Abstracts Opens', status: 'upcoming' },
  { date: 'March 31, 2026', event: 'Registration Opens', status: 'upcoming' },
  { date: 'April 30, 2026', event: 'Abstract Submission Deadline', status: 'critical' },
  { date: 'May 31, 2026', event: 'Abstract Notification', status: 'critical' },
  { date: 'May 31, 2026', event: 'Early Bird Deadline', status: 'upcoming' },
  { date: 'July 31, 2026', event: 'Regular Registration Closes', status: 'critical' },
  { date: 'August 5-7, 2026', event: 'SARSYC VI Conference', status: 'conference' },
]

const tracks = [
  {
    number: '01',
    title: 'Education Rights and Equity',
    description: 'Advancing education rights and equity for young people across Southern Africa.',
    topics: [
      'Financing and innovation for equitable digital learning in rural communities',
      'Evaluating the effectiveness of climate resilience in education systems',
      'Gender Equality & Social Inclusion (GESI) through responsive education budgeting',
      'CSE as a driver for quality education and retention',
    ],
    color: 'from-blue-500 to-blue-600',
  },
  {
    number: '02',
    title: 'HIV/AIDS, STIs and Vulnerable Groups',
    description: 'Addressing HIV/AIDS, STIs prevention and treatment, and support for vulnerable groups.',
    topics: [
      'Sustaining gains in HIV/AIDS and STIs prevention and treatment',
      'Addressing resurgence among People Who Use and Inject Drugs',
      'Expanding harm reduction programs',
      'Domestic health financing and resource mobilization',
    ],
    color: 'from-purple-500 to-purple-600',
  },
  {
    number: '03',
    title: 'Non-Communicable Diseases (NCDs) Prevention and Health Lifestyles',
    description: 'Promoting prevention of non-communicable diseases and healthy lifestyle choices.',
    topics: [
      'Community-led NCD prevention and integration into primary health care',
      'Promoting healthy behaviors, nutrition, exercise, and reducing harmful habits',
      'Digital health tools for lifestyle change and risk monitoring',
      'Innovations for early detection and screening in low-resource settings',
    ],
    color: 'from-pink-500 to-pink-600',
  },
  {
    number: '04',
    title: 'Digital Health and Safety',
    description: 'Addressing digital health, online safety, and combating digital violence.',
    topics: [
      'Digital violence/ online harassment: gendered vulnerabilities and responses',
      'Social media algorithms and adolescent mental health and behavior',
      'Online gambling and betting addiction, emerging trends and policy responses',
      'Leveraging technology for health, education and service delivery',
    ],
    color: 'from-orange-500 to-orange-600',
  },
  {
    number: '05',
    title: 'Mental Health and Substance Abuse',
    description: 'Supporting youth mental health and addressing substance abuse prevention and treatment.',
    topics: [
      'Rising mental health challenges among boys and young men',
      'Suicide prevention strategies and psychosocial support',
      'Substance abuse trends and government responses, progress and gaps',
      'Community-driven interventions for mental health and addiction recovery',
    ],
    color: 'from-green-500 to-green-600',
  },
]

export default function SarsycVIPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-600 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/2 translate-y-1/2 blur-3xl"></div>
        </div>

        <div className="relative container-custom py-20 md:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white mb-6">
              <span className="text-sm font-medium">6th Edition</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6">
              SARSYC VI
            </h1>
            
            <h2 className="text-2xl md:text-4xl text-white/95 font-semibold mb-4">
              Align for Action
            </h2>
            
            <p className="text-lg md:text-xl text-white/90 mb-12 max-w-3xl mx-auto">
              Sustaining Progress in Youth Health and Education
            </p>

            <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto mb-12">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-white">
                <FiCalendar className="w-6 h-6 mx-auto mb-2" />
                <div className="font-semibold">August 5-7, 2026</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-white">
                <FiMapPin className="w-6 h-6 mx-auto mb-2" />
                <div className="font-semibold">Windhoek, Namibia</div>
              </div>
            </div>

            <div className="mb-12">
              <h3 className="text-xl font-semibold text-white mb-6">Countdown to Conference</h3>
              <CountdownTimer targetDate="2026-08-05T09:00:00" />
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/participate/register" className="btn-accent text-lg px-8 py-4 w-full sm:w-auto">
                Register Now
              </Link>
              <Link href="/participate/submit-abstract" className="btn-outline border-white text-white hover:bg-white/10 text-lg px-8 py-4 w-full sm:w-auto">
                Submit Abstract
              </Link>
              <Link href="#concept-note" className="btn-outline border-white text-white hover:bg-white/10 text-lg px-8 py-4 w-full sm:w-auto">
                <FiDownload className="mr-2" />
                Download Concept Note
              </Link>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg className="w-full h-12 md:h-20 text-white" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" fill="currentColor"></path>
          </svg>
        </div>
      </section>

      {/* Conference Theme */}
      <section className="section bg-white">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h2 className="section-title">Conference Theme</h2>
            <div className="text-gradient text-3xl md:text-4xl font-bold mb-6">
              "Align for Action"
            </div>
            <p className="section-subtitle">
              SARSYC VI focuses on translating commitments into concrete actions that sustain and accelerate progress
              in youth sexual and reproductive health and education across Southern Africa.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {objectives.map((objective) => {
              const Icon = objective.icon
              return (
                <div key={objective.title} className="card p-8 text-center">
                  <div className="w-16 h-16 bg-gradient-primary rounded-xl flex items-center justify-center text-white mx-auto mb-6">
                    <Icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{objective.title}</h3>
                  <p className="text-gray-600">{objective.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Conference Tracks */}
      <section className="section bg-gray-50">
        <div className="container-custom">
          <h2 className="section-title">Conference Tracks</h2>
          <p className="section-subtitle">
            SARSYC VI features five thematic tracks addressing critical priorities in youth development.
          </p>

          <div className="grid md:grid-cols-2 gap-8">
            {tracks.map((track) => (
              <div key={track.number} className="card p-8 hover:shadow-2xl transition-all">
                <div className={`inline-block bg-gradient-to-r ${track.color} text-white text-sm font-bold px-3 py-1 rounded-full mb-4`}>
                  Track {track.number}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{track.title}</h3>
                <p className="text-gray-600 mb-6">{track.description}</p>
                
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Key Topics:</p>
                  <ul className="space-y-2">
                    {track.topics.map((topic) => (
                      <li key={topic} className="text-sm text-gray-600 flex items-start">
                        <span className="text-primary-600 mr-2 mt-1">•</span>
                        <span>{topic}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Important Dates */}
      <section className="section bg-white">
        <div className="container-custom">
          <h2 className="section-title">Important Dates</h2>
          <p className="section-subtitle">
            Mark these key deadlines in your calendar.
          </p>

          <div className="max-w-3xl mx-auto space-y-4">
            {importantDates.map((item) => (
              <div
                key={item.event}
                className={`flex items-center justify-between p-6 rounded-xl border-2 ${
                  item.status === 'conference'
                    ? 'border-accent-500 bg-accent-50'
                    : item.status === 'critical'
                    ? 'border-red-500 bg-red-50'
                    : 'border-primary-500 bg-primary-50'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    item.status === 'conference'
                      ? 'bg-accent-500 text-gray-900'
                      : item.status === 'critical'
                      ? 'bg-red-500 text-white'
                      : 'bg-primary-600 text-white'
                  }`}>
                    <FiCalendar className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">{item.event}</div>
                    <div className="text-sm text-gray-600">{item.date}</div>
                  </div>
                </div>
                {item.status === 'critical' && (
                  <span className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                    DEADLINE
                  </span>
                )}
                {item.status === 'conference' && (
                  <span className="px-3 py-1 bg-accent-500 text-gray-900 text-xs font-bold rounded-full">
                    MAIN EVENT
                  </span>
                )}
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/participate/register" className="btn-primary text-lg px-8 py-4">
              Register Now - Don't Miss Out!
            </Link>
          </div>
        </div>
      </section>

      {/* Venue Information */}
      <section className="section bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-5xl font-bold mb-6">
                Welcome to Windhoek
              </h2>
              <p className="text-lg text-white/90 mb-6">
                Namibia's capital city, known for its stunning landscapes, rich culture, and warm hospitality,
                serves as the perfect backdrop for SARSYC VI.
              </p>
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <FiMapPin className="w-6 h-6 text-accent-500 flex-shrink-0 mt-1" />
                  <div>
                    <div className="font-semibold mb-1">Conference Venue</div>
                    <div className="text-white/80">Windhoek International Convention Centre</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <FiCalendar className="w-6 h-6 text-accent-500 flex-shrink-0 mt-1" />
                  <div>
                    <div className="font-semibold mb-1">Duration</div>
                    <div className="text-white/80">3 days of learning, networking, and action</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <FiUsers className="w-6 h-6 text-accent-500 flex-shrink-0 mt-1" />
                  <div>
                    <div className="font-semibold mb-1">Expected Participants</div>
                    <div className="text-white/80">500+ delegates from 14+ countries</div>
                  </div>
                </div>
              </div>
              <Link href="/sarsyc-vi/venue" className="btn-accent inline-flex items-center gap-2">
                Explore Venue & Accommodation
                <FiArrowRight />
              </Link>
            </div>

            {/* Interactive Map */}
            <VenueMapSection />
          </div>
        </div>
      </section>

      {/* Detailed Tracks */}
      <section className="section bg-gray-50">
        <div className="container-custom">
          <h2 className="section-title">Explore Conference Tracks</h2>
          <p className="section-subtitle">
            Deep dive into each thematic area and discover how you can contribute.
          </p>

          <div className="grid gap-8">
            {tracks.map((track) => (
              <div key={track.number} className="card p-8 lg:p-10">
                <div className="flex flex-col lg:flex-row gap-6">
                  <div className={`w-24 h-24 bg-gradient-to-br ${track.color} rounded-2xl flex items-center justify-center text-white text-3xl font-bold flex-shrink-0`}>
                    {track.number}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                      {track.title}
                    </h3>
                    <p className="text-lg text-gray-600 mb-6">
                      {track.description}
                    </p>
                    
                    <div className="mb-6">
                      <p className="text-sm font-semibold text-gray-700 mb-3">Key Topics:</p>
                      <div className="grid md:grid-cols-2 gap-2">
                        {track.topics.map((topic) => (
                          <div key={topic} className="flex items-center gap-2 text-gray-600">
                            <FiCheck className="w-4 h-4 text-green-600 flex-shrink-0" />
                            <span className="text-sm">{topic}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Link
                      href={`/programme?track=${track.number}`}
                      className="inline-flex items-center gap-2 text-primary-600 font-medium hover:gap-3 transition-all"
                    >
                      View Track Sessions
                      <FiArrowRight />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="section bg-primary-600 text-white">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Be Part of SARSYC VI
            </h2>
            <p className="text-xl mb-12 text-white/90">
              Join 500+ youth leaders, researchers, and advocates in shaping the future of youth health and education
              in Southern Africa.
            </p>
            
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="text-4xl font-bold mb-2">500+</div>
                <div className="text-white/80">Expected Participants</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="text-4xl font-bold mb-2">14+</div>
                <div className="text-white/80">Countries</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="text-4xl font-bold mb-2">50+</div>
                <div className="text-white/80">Expert Speakers</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/participate/register" className="btn-accent text-lg px-8 py-4 w-full sm:w-auto">
                Register for SARSYC VI
              </Link>
              <Link href="/programme" className="btn-outline border-white text-white hover:bg-white/10 text-lg px-8 py-4 w-full sm:w-auto">
                View Programme
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}






