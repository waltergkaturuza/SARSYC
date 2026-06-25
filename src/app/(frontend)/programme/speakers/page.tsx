import Link from 'next/link'
import { FiAward, FiMapPin, FiArrowRight } from 'react-icons/fi'
import EmptyState from '@/components/ui/EmptyState'
import { getPayloadClient } from '@/lib/payload'
import { getCountryLabel } from '@/lib/countries'
import SocialLinks from '@/components/speakers/SocialLinks'
import SpeakerFilters from '@/components/speakers/SpeakerFilters'

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
      // Skip Payload file URLs entirely (404 for Blob-stored files)
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
    // If it's a Payload file URL, skip it (likely missing on Blob-only storage)
    if (isPayloadFileUrl(photo.url)) {
      // Try to find a Blob URL in sizes instead
      if (photo.sizes?.card?.url && isBlobUrl(photo.sizes.card.url)) {
        return fixDomain(photo.sizes.card.url)
      }
      if (photo.sizes?.thumbnail?.url && isBlobUrl(photo.sizes.thumbnail.url)) {
        return fixDomain(photo.sizes.thumbnail.url)
      }
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
    .slice(0, 3) // Max 3 initials
}

// Helper function to extract bio text from rich text
function extractBioText(bio: any): string {
  if (!bio) return ''
  if (typeof bio === 'string') return bio
  
  // If it's a rich text object (Slate editor format)
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

// Always serve fresh data so changes to \"Feature on Homepage\" and photos show immediately
export const revalidate = 0

interface SpeakersPageProps {
  searchParams: { type?: string }
}

export default async function SpeakersPage({ searchParams }: SpeakersPageProps) {
  const filterType = searchParams?.type || 'all'
  
  // Fetch speakers from Payload CMS
  let speakers: any[] = []
  try {
    const payload = await getPayloadClient()
    
    // Build where clause for filtering
    const where: any = {
      // Only show featured speakers on public page
      featured: {
        equals: true,
      },
    }
    if (filterType && filterType !== 'all') {
      // Type is a hasMany field (array), so use 'contains' to check if array includes the type
      where.type = { contains: filterType }
    }
    
    // Fetch all speakers - no limit to ensure all are displayed
    const speakersResult = await payload.find({
      collection: 'speakers',
      where,
      limit: 1000, // Increased limit to fetch all speakers
      sort: '-createdAt',
      depth: 1, // Minimal depth - Blob URLs don't need deep population
      overrideAccess: true, // Ensure all speakers are fetched regardless of access control
    })
    speakers = speakersResult.docs || []
    
    // Log for debugging
    console.log(`✅ Fetched ${speakers.length} speakers`)
    speakers.forEach((speaker: any) => {
      const photoUrl = getSpeakerPhotoUrl(speaker.photo)
      console.log(`📸 Speaker ${speaker.name}:`, {
        photoType: typeof speaker.photo,
        photoValue: speaker.photo,
        extractedUrl: photoUrl,
        hasPhoto: !!speaker.photo,
      })
      if (!photoUrl) {
        console.warn(`⚠️  Speaker ${speaker.id} (${speaker.name}) has no photo URL`, {
          photoType: typeof speaker.photo,
          photoValue: speaker.photo,
        })
      }
    })
  } catch (error) {
    console.error('Error fetching speakers:', error)
    speakers = []
  }

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-b from-primary-700 via-primary-600 to-slate-900 text-white py-8 md:py-10">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Our Speakers
            </h1>
            <p className="text-xl text-white/90">
              Meet the thought leaders, researchers, and advocates shaping youth health and education in Africa
            </p>
          </div>
        </div>
      </section>

      {/* Filters + Speaker Grid — full-bleed background section */}
      <section className="relative py-16 md:py-24 bg-slate-900">
        {/* Background image */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "url('/sarsyc-group.jpg')",
            backgroundSize: 'cover',
            backgroundPosition: 'center top',
          }}
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-slate-900/70 to-slate-900/85" />

        <div className="relative z-10 max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10">
          {/* Filters */}
          <div className="mb-10">
            <SpeakerFilters />
          </div>

          {speakers.length === 0 ? (
            <EmptyState
              icon="users"
              title="No Speakers Announced Yet"
              description="We're working on bringing you an amazing lineup of speakers. Check back soon for announcements about our keynote speakers, panelists, and workshop facilitators."
            />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {speakers.map((speaker: any) => {
                const photoUrl = getSpeakerPhotoUrl(speaker.photo)
                const initials = getInitials(speaker.name)
                const bioText = extractBioText(speaker.bio)
                const speakerTypes = speaker.type && Array.isArray(speaker.type) ? speaker.type : []
                const isKeynote = speakerTypes.includes('keynote')
                const isPlenary = speakerTypes.includes('plenary')
                const twitterHandle = speaker.socialMedia?.twitter
                const linkedinUrl = speaker.socialMedia?.linkedin
                const websiteUrl = speaker.socialMedia?.website

                return (
                  <div
                    key={speaker.id}
                    className="group relative flex flex-col sm:flex-row overflow-hidden rounded-2xl border border-white/10 bg-white/10 backdrop-blur-md shadow-xl transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl hover:shadow-amber-500/20 hover:border-amber-400/40 hover:bg-white/15"
                  >
                    {/* Clickable overlay */}
                    <Link
                      href={`/programme/speakers/${speaker.id}`}
                      className="absolute inset-0 z-0"
                      aria-label={`View ${speaker.name}'s profile`}
                    />

                    {/* Hover glow accent line */}
                    <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />

                    {/* Photo */}
                    <div
                      className="relative z-10 w-full sm:w-52 flex-shrink-0 bg-slate-800/60 flex items-center justify-center sm:self-stretch overflow-hidden"
                      style={{ minHeight: '210px' }}
                    >
                      {photoUrl ? (
                        <img
                          src={photoUrl}
                          alt={speaker.name}
                          className="w-full h-full object-contain sm:object-cover sm:object-top transition-transform duration-500 group-hover:scale-[1.04]"
                          loading="lazy"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-primary-600 to-secondary-600 flex items-center justify-center">
                          <span className="text-white text-6xl font-bold opacity-60">{initials}</span>
                        </div>
                      )}

                      {/* Badges */}
                      {(isKeynote || isPlenary) && (
                        <div className="absolute top-3 left-3 flex gap-2 z-20">
                          {isKeynote && (
                            <span className="px-2.5 py-1 bg-amber-500 text-white text-[11px] font-bold rounded-md uppercase tracking-wide shadow-lg">
                              KEYNOTE
                            </span>
                          )}
                          {isPlenary && (
                            <span className="px-2.5 py-1 bg-amber-500 text-white text-[11px] font-bold rounded-md uppercase tracking-wide shadow-lg">
                              PLENARY
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="p-5 space-y-3 relative z-10 flex-1 min-w-0">
                      {/* Name */}
                      <h3 className="text-lg font-bold text-white leading-snug group-hover:text-amber-300 transition-colors duration-300">
                        {speaker.name}
                      </h3>

                      <div className="grid sm:grid-cols-2 gap-2">
                        {speaker.title && (
                          <div className="flex items-start gap-2">
                            <FiAward className="w-4 h-4 text-amber-400/80 flex-shrink-0 mt-0.5" />
                            <div className="min-w-0">
                              <p className="text-[11px] text-white/50 mb-0.5">Position</p>
                              <p className="text-sm font-semibold text-white/90 leading-tight">
                                {speaker.title}
                              </p>
                              {speaker.organization && (
                                <p className="text-xs text-white/60 mt-0.5">{speaker.organization}</p>
                              )}
                            </div>
                          </div>
                        )}

                        {speaker.country && (
                          <div className="flex items-start gap-2">
                            <FiMapPin className="w-4 h-4 text-amber-400/80 flex-shrink-0 mt-0.5" />
                            <div className="min-w-0">
                              <p className="text-[11px] text-white/50 mb-0.5">Country</p>
                              <p className="text-sm font-semibold text-white/90">
                                {getCountryLabel(speaker.country)}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Expertise tags */}
                      {speaker.expertise && Array.isArray(speaker.expertise) && speaker.expertise.length > 0 && (
                        <div className="pt-2 border-t border-white/10">
                          <div className="flex flex-wrap gap-1.5">
                            {speaker.expertise.slice(0, 3).map((exp: any, idx: number) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 bg-white/10 text-white/80 text-xs rounded-full border border-white/15 group-hover:bg-amber-500/20 group-hover:border-amber-400/30 transition-colors duration-300"
                              >
                                {exp.area}
                              </span>
                            ))}
                            {speaker.expertise.length > 3 && (
                              <span className="px-2 py-0.5 bg-white/10 text-white/60 text-xs rounded-full border border-white/15">
                                +{speaker.expertise.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {bioText && (
                        <div className="pt-2 border-t border-white/10">
                          <p className="text-xs text-white/60 line-clamp-2 leading-relaxed">
                            {bioText}
                          </p>
                        </div>
                      )}

                      <div className="flex items-center justify-between gap-3 pt-2 border-t border-white/10">
                        <SocialLinks
                          twitter={twitterHandle}
                          linkedin={linkedinUrl}
                          website={websiteUrl}
                          variant="card"
                        />
                        <Link
                          href={`/programme/speakers/${speaker.id}`}
                          className="relative z-20 inline-flex items-center gap-1.5 text-xs font-semibold text-amber-300 hover:text-amber-200 transition-colors flex-shrink-0"
                        >
                          View Profile
                          <FiArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                        </Link>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {speakers.length > 0 && (
            <div className="mt-12 text-center rounded-2xl border border-white/10 bg-white/10 backdrop-blur-md p-8">
              <h3 className="font-semibold text-white mb-2">More Speakers Coming Soon!</h3>
              <p className="text-white/70 mb-4">
                We&apos;re adding more amazing speakers daily. Check back regularly for updates.
              </p>
              <Link href="/news" className="text-amber-400 font-medium hover:text-amber-300 transition-colors">
                Subscribe to updates →
              </Link>
            </div>
          )}
        </div>
      </section>
    </>
  )
}






