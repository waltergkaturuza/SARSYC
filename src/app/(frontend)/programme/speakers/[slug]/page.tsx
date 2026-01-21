import { notFound } from 'next/navigation'
import Link from 'next/link'
import { FiArrowLeft, FiMapPin, FiAward, FiCalendar, FiClock } from 'react-icons/fi'
import { getPayloadClient } from '@/lib/payload'
import { getCountryLabel } from '@/lib/countries'
import SocialLinks from '@/components/speakers/SocialLinks'

// Helper function to get speaker photo URL
// Helper function to get speaker photo URL (Blob-safe)
function getSpeakerPhotoUrl(photo: any): string | null {
  if (!photo) return null

  // Helper to fix domain in URLs (ensure www.sarsyc.org instead of sarsyc.org)
  const fixDomain = (url: string): string => {
    if (url.includes('sarsyc.org') && !url.includes('www.sarsyc.org')) {
      return url.replace('https://sarsyc.org', 'https://www.sarsyc.org')
    }
    return url
  }

  // ✅ Vercel Blob stored as string URL (most common case)
  if (typeof photo === 'string') {
    if (photo.startsWith('http')) {
      return fixDomain(photo)
    }
    return null
  }

  // ✅ Blob or external storage object
  if (photo.url && typeof photo.url === 'string') {
    return fixDomain(photo.url)
  }

  // Optional: Payload local storage fallback
  if (photo.sizes?.card?.url) {
    return fixDomain(photo.sizes.card.url)
  }

  if (photo.sizes?.thumbnail?.url) {
    return fixDomain(photo.sizes.thumbnail.url)
  }

  return null
}

// Helper function to get speaker initials
function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 3)
}

// Helper function to extract bio text from rich text
function extractBioText(bio: any): string {
  if (!bio) return ''
  if (typeof bio === 'string') return bio
  
  if (Array.isArray(bio)) {
    return bio
      .map((node: any) => {
        if (node.children) {
          return node.children.map((child: any) => child.text || '').join('')
        }
        return node.text || ''
      })
      .join(' ')
      .trim()
  }
  
  return ''
}

// Fetch speaker by ID (slug is actually the speaker ID)
async function getSpeaker(id: string) {
  try {
    const payload = await getPayloadClient()
    const speaker = await payload.findByID({
      collection: 'speakers',
      id: id,
      depth: 1, // Minimal depth - Blob URLs don't need deep population
      overrideAccess: true,
    })
    
    if (!speaker) {
      return null
    }
    
    return speaker
  } catch (error) {
    console.error('Error fetching speaker:', error)
    return null
  }
}

export default async function SpeakerProfilePage({ params }: { params: { slug: string } }) {
  const speaker = await getSpeaker(params.slug)
  
  if (!speaker) {
    notFound()
  }

  const photoUrl = getSpeakerPhotoUrl(speaker.photo)
  const initials = getInitials(speaker.name)
  const bioText = extractBioText(speaker.bio)
  const speakerTypes = speaker.type && Array.isArray(speaker.type) ? speaker.type : []
  const twitterHandle = speaker.socialMedia?.twitter
  const linkedinUrl = speaker.socialMedia?.linkedin
  const websiteUrl = speaker.socialMedia?.website

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
                  <div className="aspect-square rounded-2xl overflow-hidden mb-6 bg-gradient-to-br from-blue-300 via-blue-400 to-purple-500">
                    {photoUrl ? (
                      // Use a regular img tag to avoid any Next.js Image domain/config issues
                      <img
                        src={photoUrl}
                        alt={speaker.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white text-6xl font-bold opacity-60">
                        {initials}
                      </div>
                    )}
                  </div>

                  {/* Speaker Type Badges */}
                  {speakerTypes.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-6">
                      {speakerTypes.map((type: string) => (
                        <span key={type} className="px-3 py-1.5 bg-yellow-500 text-white text-xs font-bold rounded-md uppercase">
                          {type.toUpperCase()}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Quick Info */}
                  <div className="space-y-4 mb-6">
                    {speaker.title && (
                      <div className="flex items-start gap-3">
                        <FiAward className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-600">Position</p>
                          <p className="font-medium text-gray-900">{speaker.title}</p>
                        </div>
                      </div>
                    )}
                    {speaker.country && (
                      <div className="flex items-start gap-3">
                        <FiMapPin className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-600">Country</p>
                          <p className="font-medium text-gray-900">{getCountryLabel(speaker.country)}</p>
                        </div>
                      </div>
                    )}
                    {speaker.organization && (
                      <div className="flex items-start gap-3">
                        <FiAward className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-600">Organization</p>
                          <p className="font-medium text-gray-900">{speaker.organization}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Social Links */}
                  <SocialLinks
                    twitter={twitterHandle}
                    linkedin={linkedinUrl}
                    website={websiteUrl}
                    variant="profile"
                  />
                </div>
              </div>

              {/* Right: Bio & Sessions */}
              <div className="lg:col-span-2">
                {/* Name & Title */}
                <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-2">
                  {speaker.name}
                </h1>
                {speaker.title && (
                  <p className="text-xl text-primary-600 font-medium mb-2">{speaker.title}</p>
                )}
                {speaker.organization && (
                  <p className="text-lg text-gray-600 mb-8">{speaker.organization}</p>
                )}

                {/* Expertise */}
                {speaker.expertise && Array.isArray(speaker.expertise) && speaker.expertise.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Areas of Expertise</h3>
                    <div className="flex flex-wrap gap-2">
                      {speaker.expertise.map((exp: any, index: number) => {
                        const area = typeof exp === 'string' ? exp : exp.area
                        return (
                          <span key={index} className="px-4 py-2 bg-primary-100 text-primary-700 rounded-lg text-sm font-medium">
                            {area}
                          </span>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Biography */}
                {bioText && (
                  <div className="mb-12">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Biography</h3>
                    <div className="prose prose-lg max-w-none prose-p:text-gray-600">
                      <p className="text-gray-600 whitespace-pre-line">{bioText}</p>
                    </div>
                  </div>
                )}

                {/* Sessions */}
                {speaker.sessions && Array.isArray(speaker.sessions) && speaker.sessions.length > 0 && (
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-6">Speaking At</h3>
                    <div className="space-y-4">
                      {speaker.sessions.map((session: any, index: number) => {
                        const sessionData = typeof session === 'object' ? session : null
                        if (!sessionData) return null
                        
                        return (
                          <div key={index} className="card p-6 hover:shadow-xl transition-shadow">
                            <h4 className="font-bold text-gray-900 mb-3">{sessionData.title || 'Session'}</h4>
                            {(sessionData.date || sessionData.time || sessionData.venue) && (
                              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                {sessionData.date && (
                                  <div className="flex items-center gap-2">
                                    <FiCalendar className="w-4 h-4 text-primary-600" />
                                    <span>{sessionData.date}</span>
                                  </div>
                                )}
                                {sessionData.time && (
                                  <div className="flex items-center gap-2">
                                    <FiClock className="w-4 h-4 text-primary-600" />
                                    <span>{sessionData.time}</span>
                                  </div>
                                )}
                                {sessionData.venue && (
                                  <div className="flex items-center gap-2">
                                    <FiMapPin className="w-4 h-4 text-primary-600" />
                                    <span>{sessionData.venue}</span>
                                  </div>
                                )}
                              </div>
                            )}
                            <Link href="/programme" className="inline-flex items-center gap-2 text-primary-600 font-medium text-sm mt-4 hover:gap-3 transition-all">
                              View Full Schedule
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </Link>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const speaker = await getSpeaker(params.slug)
  
  if (!speaker) {
    return {
      title: 'Speaker Not Found - SARSYC VI',
    }
  }
  
  return {
    title: `${speaker.name} - Speaker at SARSYC VI`,
    description: `${speaker.name}, ${speaker.title || ''} at ${speaker.organization || ''}, speaking at SARSYC VI in Windhoek, Namibia.`,
  }
}
