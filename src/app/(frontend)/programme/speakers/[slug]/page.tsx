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

  // Helper to check if URL is a Vercel Blob URL (preferred)
  const isBlobUrl = (url: string): boolean => {
    return url.includes('blob.vercel-storage.com') || url.includes('public.blob.vercel-storage.com')
  }

  // Helper to check if URL is Payload's generated file path (should be avoided)
  const isPayloadFileUrl = (url: string): boolean => {
    return url.includes('/api/media/file/')
  }

  // ✅ Vercel Blob stored as string URL (most common case)
  if (typeof photo === 'string') {
    if (photo.startsWith('http')) {
      // Skip Payload file URLs - they don't exist for Blob-stored files
      if (isPayloadFileUrl(photo)) return null
      return fixDomain(photo)
    }
    return null
  }

  // ✅ PRIORITY 1: Check thumbnailURL first (migration stores Blob URLs here!)
  if (photo.thumbnailURL && typeof photo.thumbnailURL === 'string') {
    if (isBlobUrl(photo.thumbnailURL)) {
      return fixDomain(photo.thumbnailURL)
    }
  }

  // ✅ PRIORITY 2: Check main URL (only if it's a Blob URL)
  if (photo.url && typeof photo.url === 'string') {
    // Prefer Blob URLs - they're the most reliable
    if (isBlobUrl(photo.url)) {
      return fixDomain(photo.url)
    }
    // If it's a Payload file URL, try to find a Blob URL in sizes first
    if (isPayloadFileUrl(photo.url)) {
      // Try to find a Blob URL in sizes instead
      if (photo.sizes?.card?.url && isBlobUrl(photo.sizes.card.url)) {
        return fixDomain(photo.sizes.card.url)
      }
      if (photo.sizes?.thumbnail?.url && isBlobUrl(photo.sizes.thumbnail.url)) {
        return fixDomain(photo.sizes.thumbnail.url)
      }
      // Skip Payload URL if no Blob size found
      return null
    }
    // Use any other valid URL
    return fixDomain(photo.url)
  }

  // Optional: Payload local storage fallback (only if not Payload file URLs)
  if (photo.sizes?.card?.url) {
    if (isPayloadFileUrl(photo.sizes.card.url)) {
      // Skip Payload file URLs
    } else {
      return fixDomain(photo.sizes.card.url)
    }
  }

  if (photo.sizes?.thumbnail?.url) {
    if (isPayloadFileUrl(photo.sizes.thumbnail.url)) {
      // Skip Payload file URLs
    } else {
      return fixDomain(photo.sizes.thumbnail.url)
    }
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
    <div className="relative min-h-screen bg-slate-900">
      {/* Background image */}
      <div
        className="fixed inset-0"
        style={{
          backgroundImage: "url('/sarsyc-group.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
          zIndex: 0,
        }}
      />
      {/* Dark overlay */}
      <div className="fixed inset-0 bg-gradient-to-b from-slate-900/85 via-slate-900/75 to-slate-900/90" style={{ zIndex: 1 }} />

      <div className="relative max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-10 py-10" style={{ zIndex: 2 }}>
        {/* Back link */}
        <Link
          href="/programme/speakers"
          className="inline-flex items-center gap-2 text-amber-300 hover:text-amber-200 text-sm font-medium mb-8 transition-colors"
        >
          <FiArrowLeft className="w-4 h-4" />
          Back to All Speakers
        </Link>

        {/* Floating profile card */}
        <div className="rounded-2xl border border-white/10 bg-white/10 backdrop-blur-md shadow-2xl overflow-hidden">
          {/* Amber top accent */}
          <div className="h-[3px] w-full bg-gradient-to-r from-amber-400 via-amber-300 to-transparent" />

          <div className="grid lg:grid-cols-3 gap-0">
            {/* Left: Photo & Quick Info */}
            <div className="lg:col-span-1 border-b lg:border-b-0 lg:border-r border-white/10">
              <div className="p-8 lg:sticky lg:top-24">
                {/* Photo */}
                <div className="rounded-2xl overflow-hidden mb-6 bg-slate-800/60 shadow-xl shadow-black/30"
                  style={{ aspectRatio: '1 / 1' }}>
                  {photoUrl ? (
                    <img
                      src={photoUrl}
                      alt={speaker.name}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-600 to-secondary-600">
                      <span className="text-white text-6xl font-bold opacity-60">{initials}</span>
                    </div>
                  )}
                </div>

                {/* Badges */}
                {speakerTypes.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {speakerTypes.map((type: string) => (
                      <span key={type} className="px-3 py-1.5 bg-amber-500 text-white text-xs font-bold rounded-md uppercase tracking-wide shadow">
                        {type.toUpperCase()}
                      </span>
                    ))}
                  </div>
                )}

                {/* Quick info */}
                <div className="space-y-4 mb-6">
                  {speaker.title && (
                    <div className="flex items-start gap-3">
                      <FiAward className="w-4 h-4 text-amber-400/80 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[11px] text-white/50 mb-0.5">Position</p>
                        <p className="text-sm font-medium text-white/90">{speaker.title}</p>
                      </div>
                    </div>
                  )}
                  {speaker.organization && (
                    <div className="flex items-start gap-3">
                      <FiAward className="w-4 h-4 text-amber-400/80 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[11px] text-white/50 mb-0.5">Organization</p>
                        <p className="text-sm font-medium text-white/90">{speaker.organization}</p>
                      </div>
                    </div>
                  )}
                  {speaker.country && (
                    <div className="flex items-start gap-3">
                      <FiMapPin className="w-4 h-4 text-amber-400/80 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[11px] text-white/50 mb-0.5">Country</p>
                        <p className="text-sm font-medium text-white/90">{getCountryLabel(speaker.country)}</p>
                      </div>
                    </div>
                  )}
                </div>

                <SocialLinks
                  twitter={twitterHandle}
                  linkedin={linkedinUrl}
                  website={websiteUrl}
                  variant="profile"
                />
              </div>
            </div>

            {/* Right: Bio & Sessions */}
            <div className="lg:col-span-2 p-8">
              {/* Name */}
              <h1 className="text-3xl md:text-5xl font-bold text-white mb-2 leading-tight">
                {speaker.name}
              </h1>
              {speaker.title && (
                <p className="text-lg text-amber-300 font-medium mb-1">{speaker.title}</p>
              )}
              {speaker.organization && (
                <p className="text-base text-white/60 mb-8">{speaker.organization}</p>
              )}

              {/* Expertise */}
              {speaker.expertise && Array.isArray(speaker.expertise) && speaker.expertise.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-sm font-semibold text-amber-400/90 uppercase tracking-widest mb-3">Areas of Expertise</h3>
                  <div className="flex flex-wrap gap-2">
                    {speaker.expertise.map((exp: any, index: number) => {
                      const area = typeof exp === 'string' ? exp : exp.area
                      return (
                        <span key={index} className="px-3 py-1.5 bg-white/10 border border-white/15 text-white/80 rounded-lg text-sm font-medium">
                          {area}
                        </span>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Divider */}
              {bioText && <div className="border-t border-white/10 mb-8" />}

              {/* Biography */}
              {bioText && (
                <div className="mb-10">
                  <h3 className="text-sm font-semibold text-amber-400/90 uppercase tracking-widest mb-4">Biography</h3>
                  <p className="text-white/75 leading-relaxed whitespace-pre-line text-justify text-base">
                    {bioText}
                  </p>
                </div>
              )}

              {/* Sessions */}
              {speaker.sessions && Array.isArray(speaker.sessions) && speaker.sessions.length > 0 && (
                <div>
                  <div className="border-t border-white/10 mb-8" />
                  <h3 className="text-sm font-semibold text-amber-400/90 uppercase tracking-widest mb-4">Speaking At</h3>
                  <div className="space-y-4">
                    {speaker.sessions.map((session: any, index: number) => {
                      const sessionData = typeof session === 'object' ? session : null
                      if (!sessionData) return null
                      return (
                        <div key={index} className="rounded-xl border border-white/10 bg-white/5 p-5 hover:bg-white/10 hover:border-amber-400/30 transition-all duration-300">
                          <h4 className="font-bold text-white mb-3">{sessionData.title || 'Session'}</h4>
                          {(sessionData.date || sessionData.time || sessionData.venue) && (
                            <div className="flex flex-wrap gap-4 text-sm text-white/60">
                              {sessionData.date && (
                                <div className="flex items-center gap-2">
                                  <FiCalendar className="w-4 h-4 text-amber-400/70" />
                                  <span>{sessionData.date}</span>
                                </div>
                              )}
                              {sessionData.time && (
                                <div className="flex items-center gap-2">
                                  <FiClock className="w-4 h-4 text-amber-400/70" />
                                  <span>{sessionData.time}</span>
                                </div>
                              )}
                              {sessionData.venue && (
                                <div className="flex items-center gap-2">
                                  <FiMapPin className="w-4 h-4 text-amber-400/70" />
                                  <span>{sessionData.venue}</span>
                                </div>
                              )}
                            </div>
                          )}
                          <Link href="/programme" className="inline-flex items-center gap-2 text-amber-300 hover:text-amber-200 font-medium text-sm mt-4 transition-colors">
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
    </div>
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
