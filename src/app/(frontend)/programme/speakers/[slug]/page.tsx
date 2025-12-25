import { notFound } from 'next/navigation'
import Link from 'next/link'
import { FiArrowLeft, FiTwitter, FiLinkedin, FiGlobe, FiMapPin, FiAward, FiCalendar, FiClock } from 'react-icons/fi'

// Fetch speaker by slug - will connect to Payload CMS
async function getSpeaker(slug: string) {
  // Placeholder data
  return {
    name: 'Dr. Sarah Mwangi',
    title: 'Director of Public Health, WHO Africa',
    organization: 'World Health Organization',
    country: 'Kenya',
    photo: '/speakers/sarah-mwangi.jpg',
    bio: `
      <p>Dr. Sarah Mwangi is a leading expert in youth health policy with over 15 years of experience working across sub-Saharan Africa. As the Director of Public Health at WHO Africa, she has spearheaded numerous initiatives to improve youth sexual and reproductive health services.</p>
      
      <p>Her work has directly influenced health policies in 14 African countries, resulting in improved access to youth-friendly health services for over 2 million young people.</p>
      
      <p>Dr. Mwangi holds a PhD in Public Health from the London School of Hygiene & Tropical Medicine and has published over 50 peer-reviewed articles on youth health topics.</p>
    `,
    type: ['keynote', 'plenary'],
    expertise: ['Youth SRHR', 'Health Policy', 'Programme Design', 'Advocacy'],
    sessions: [
      {
        title: 'Opening Keynote: The State of Youth Health in Southern Africa',
        day: 'Day 1',
        time: '09:00 - 10:30',
        venue: 'Main Hall',
      },
      {
        title: 'Panel: Scaling Youth-Friendly Health Services',
        day: 'Day 2',
        time: '14:00 - 15:30',
        venue: 'Room A',
      },
    ],
    social: {
      twitter: '@sarahmwangi',
      linkedin: 'linkedin.com/in/sarah-mwangi',
      website: 'www.sarahmwangi.com',
    },
  }
}

export default async function SpeakerProfilePage({ params }: { params: { slug: string } }) {
  const speaker = await getSpeaker(params.slug)

  return (
    <>
      {/* Breadcrumb */}
      <section className="bg-gray-50 py-6 border-b border-gray-200">
        <div className="container-custom">
          <Link href="/programme/speakers" className="inline-flex items-center gap-2 text-gray-600 hover:text-primary-600 transition-colors">
            <FiArrowLeft />
            Back to All Speakers
          </Link>
        </div>
      </section>

      {/* Speaker Profile */}
      <section className="section bg-white">
        <div className="container-custom">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-3 gap-12">
              {/* Left: Photo & Quick Info */}
              <div className="lg:col-span-1">
                <div className="sticky top-24">
                  {/* Photo */}
                  <div className="aspect-square rounded-2xl overflow-hidden mb-6 bg-gradient-to-br from-primary-400 to-secondary-400">
                    <div className="w-full h-full flex items-center justify-center text-white text-6xl font-bold opacity-50">
                      {speaker.name.split(' ').map(n => n[0]).join('')}
                    </div>
                  </div>

                  {/* Speaker Type Badges */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {speaker.type.map((type: string) => (
                      <span key={type} className="px-3 py-1 bg-accent-500 text-gray-900 text-xs font-bold rounded-full uppercase">
                        {type}
                      </span>
                    ))}
                  </div>

                  {/* Quick Info */}
                  <div className="space-y-4 mb-6">
                    <div className="flex items-start gap-3">
                      <FiAward className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600">Position</p>
                        <p className="font-medium text-gray-900">{speaker.title}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <FiMapPin className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600">Country</p>
                        <p className="font-medium text-gray-900">{speaker.country}</p>
                      </div>
                    </div>
                  </div>

                  {/* Social Links */}
                  <div className="space-y-3">
                    <p className="text-sm font-semibold text-gray-700">Connect:</p>
                    {speaker.social.twitter && (
                      <a
                        href={`https://twitter.com/${speaker.social.twitter.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 text-gray-700 hover:text-sky-500 transition-colors"
                      >
                        <FiTwitter className="w-5 h-5" />
                        <span className="text-sm">{speaker.social.twitter}</span>
                      </a>
                    )}
                    {speaker.social.linkedin && (
                      <a
                        href={`https://${speaker.social.linkedin}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 text-gray-700 hover:text-blue-600 transition-colors"
                      >
                        <FiLinkedin className="w-5 h-5" />
                        <span className="text-sm">LinkedIn</span>
                      </a>
                    )}
                    {speaker.social.website && (
                      <a
                        href={`https://${speaker.social.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 text-gray-700 hover:text-primary-600 transition-colors"
                      >
                        <FiGlobe className="w-5 h-5" />
                        <span className="text-sm">Website</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Right: Bio & Sessions */}
              <div className="lg:col-span-2">
                {/* Name & Title */}
                <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-2">
                  {speaker.name}
                </h1>
                <p className="text-xl text-primary-600 font-medium mb-2">{speaker.title}</p>
                <p className="text-lg text-gray-600 mb-8">{speaker.organization}</p>

                {/* Expertise */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Areas of Expertise</h3>
                  <div className="flex flex-wrap gap-2">
                    {speaker.expertise.map((area: string) => (
                      <span key={area} className="px-4 py-2 bg-primary-100 text-primary-700 rounded-lg text-sm font-medium">
                        {area}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Biography */}
                <div className="mb-12">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Biography</h3>
                  <div 
                    className="prose prose-lg max-w-none prose-p:text-gray-600"
                    dangerouslySetInnerHTML={{ __html: speaker.bio }}
                  />
                </div>

                {/* Sessions */}
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Speaking At</h3>
                  <div className="space-y-4">
                    {speaker.sessions.map((session: any, index: number) => (
                      <div key={index} className="card p-6 hover:shadow-xl transition-shadow">
                        <h4 className="font-bold text-gray-900 mb-3">{session.title}</h4>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <FiCalendar className="w-4 h-4 text-primary-600" />
                            <span>{session.day}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>{session.time}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <FiMapPin className="w-4 h-4 text-primary-600" />
                            <span>{session.venue}</span>
                          </div>
                        </div>
                        <Link href="/programme" className="inline-flex items-center gap-2 text-primary-600 font-medium text-sm mt-4 hover:gap-3 transition-all">
                          View Full Schedule
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Speakers */}
      <section className="section bg-gray-50">
        <div className="container-custom">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            More Speakers
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Link key={i} href={`/programme/speakers/speaker-${i}`} className="card group">
                <div className="aspect-square bg-gradient-to-br from-primary-300 to-secondary-300"></div>
                <div className="p-6">
                  <h3 className="font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
                    Speaker Name {i}
                  </h3>
                  <p className="text-sm text-gray-600">Organization {i}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const speaker = await getSpeaker(params.slug)
  
  return {
    title: `${speaker.name} - Speaker at SARSYC VI`,
    description: `${speaker.name}, ${speaker.title} at ${speaker.organization}, speaking at SARSYC VI in Windhoek, Namibia.`,
  }
}

