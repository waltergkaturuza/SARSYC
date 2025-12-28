import Image from 'next/image'
import Link from 'next/link'
import { FiLinkedin, FiTwitter, FiGlobe, FiUser, FiAward, FiMapPin } from 'react-icons/fi'
import EmptyState from '@/components/ui/EmptyState'
import { getPayloadClient } from '@/lib/payload'

// Helper function to get speaker photo URL
function getSpeakerPhotoUrl(photo: any): string | null {
  if (!photo) {
    return null
  }
  
  // If it's just an ID (string), it wasn't populated - return null
  if (typeof photo === 'string') {
    console.warn('Photo is just an ID, not populated:', photo)
    return null
  }
  
  // If it's an object, try different URL locations
  if (typeof photo === 'object') {
    // Try direct URL first (for Vercel Blob or external storage)
    if (photo.url && typeof photo.url === 'string') {
      // Check if it's a valid HTTP(S) URL
      if (photo.url.startsWith('http://') || photo.url.startsWith('https://')) {
        return photo.url
      }
      // If it's a relative URL, log warning
      if (photo.url.startsWith('/')) {
        console.warn('Photo has relative URL (unexpected):', photo.url)
        return null
      }
    }
    
    // Try sizes (for local storage with image processing)
    if (photo.sizes) {
      if (photo.sizes.card?.url && photo.sizes.card.url.startsWith('http')) {
        return photo.sizes.card.url
      }
      if (photo.sizes.thumbnail?.url && photo.sizes.thumbnail.url.startsWith('http')) {
        return photo.sizes.thumbnail.url
      }
      if (photo.sizes.hero?.url && photo.sizes.hero.url.startsWith('http')) {
        return photo.sizes.hero.url
      }
    }
    
    // Try thumbnailURL (legacy field)
    if (photo.thumbnailURL && photo.thumbnailURL.startsWith('http')) {
      return photo.thumbnailURL
    }
    
    // Log warning if we have photo object but no valid URL
    if (!photo.url && !photo.sizes) {
      console.warn('Photo object exists but has no URL or sizes:', {
        id: photo.id,
        filename: photo.filename,
        hasUrl: !!photo.url,
        hasSizes: !!photo.sizes,
      })
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

const speakerTypes = [
  { value: 'all', label: 'All Speakers' },
  { value: 'keynote', label: 'Keynote Speakers' },
  { value: 'plenary', label: 'Plenary Speakers' },
  { value: 'moderator', label: 'Panel Moderators' },
  { value: 'facilitator', label: 'Workshop Facilitators' },
]

export default async function SpeakersPage() {
  // Fetch speakers from Payload CMS
  let speakers: any[] = []
  try {
    const payload = await getPayloadClient()
    const speakersResult = await payload.find({
      collection: 'speakers',
      limit: 100,
      sort: '-createdAt',
      depth: 2, // Populate photo relationship fully
      overrideAccess: true, // Ensure all speakers are fetched regardless of access control
    })
    speakers = speakersResult.docs || []
    
    // Log for debugging
    console.log(`✅ Fetched ${speakers.length} speakers`)
    speakers.forEach((speaker: any) => {
      const photoUrl = getSpeakerPhotoUrl(speaker.photo)
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
      <section className="bg-gradient-to-br from-primary-600 to-secondary-600 text-white py-20">
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

      {/* Filters */}
      <section className="bg-gray-50 py-8">
        <div className="container-custom">
          <div className="flex flex-wrap gap-3 justify-center">
            {speakerTypes.map((type) => (
              <button
                key={type.value}
                className="px-6 py-2 rounded-full bg-white border-2 border-gray-200 hover:border-primary-600 hover:text-primary-600 transition-all font-medium text-sm"
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Speaker Grid */}
      <section className="section bg-white">
        <div className="container-custom">
          {speakers.length === 0 ? (
            <EmptyState
              icon="users"
              title="No Speakers Announced Yet"
              description="We're working on bringing you an amazing lineup of speakers. Check back soon for announcements about our keynote speakers, panelists, and workshop facilitators."
            />
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                  <Link
                    key={speaker.id}
                    href={`/programme/speakers/${speaker.id}`}
                    className="card group overflow-hidden hover:shadow-xl transition-all duration-300 bg-white rounded-lg"
                  >
                    {/* Photo Section with Gradient Background */}
                    <div className="aspect-square relative overflow-hidden rounded-t-lg">
                      {photoUrl ? (
                        <Image
                          src={photoUrl}
                          alt={speaker.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          unoptimized={photoUrl.includes('blob.vercel-storage.com') || photoUrl.includes('public.blob.vercel-storage.com')}
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-300 via-blue-400 to-purple-500 flex items-center justify-center">
                          <div className="text-white text-7xl font-bold opacity-60">
                            {initials}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Badges Section - Below Photo */}
                    {(isKeynote || isPlenary) && (
                      <div className="px-4 pt-3 pb-2 flex gap-2">
                        {isKeynote && (
                          <span className="px-3 py-1 bg-yellow-400 text-white text-xs font-bold rounded uppercase">
                            KEYNOTE
                          </span>
                        )}
                        {isPlenary && (
                          <span className="px-3 py-1 bg-yellow-400 text-white text-xs font-bold rounded uppercase">
                            PLENARY
                          </span>
                        )}
                      </div>
                    )}
                    
                    {/* Info Section */}
                    <div className="p-6 bg-white space-y-4">
                      {/* Position */}
                      {speaker.title && (
                        <div className="flex items-start gap-3">
                          <FiAward className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-xs text-gray-500 mb-1">Position</p>
                            <p className="text-sm font-semibold text-gray-900 leading-tight">
                              {speaker.title}
                            </p>
                          </div>
                        </div>
                      )}
                      
                      {/* Country */}
                      {speaker.country && (
                        <div className="flex items-start gap-3">
                          <FiMapPin className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-xs text-gray-500 mb-1">Country</p>
                            <p className="text-sm font-semibold text-gray-900">
                              {speaker.country}
                            </p>
                          </div>
                        </div>
                      )}
                      
                      {/* Organization (if no title/country structure) */}
                      {speaker.organization && !speaker.title && (
                        <div>
                          <p className="text-sm text-gray-600">
                            {speaker.organization}
                          </p>
                        </div>
                      )}
                      
                      {bioText && (
                        <div className="pt-2 border-t border-gray-100">
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {bioText}
                          </p>
                        </div>
                      )}
                      
                      {/* Social Links */}
                      {(twitterHandle || linkedinUrl || websiteUrl) && (
                        <div className="flex gap-3 pt-2 border-t border-gray-100">
                          {twitterHandle && (
                            <a
                              href={`https://twitter.com/${twitterHandle.replace('@', '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-gray-400 hover:text-primary-600 transition-colors"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <FiTwitter className="w-5 h-5" />
                            </a>
                          )}
                          {linkedinUrl && (
                            <a
                              href={linkedinUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-gray-400 hover:text-primary-600 transition-colors"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <FiLinkedin className="w-5 h-5" />
                            </a>
                          )}
                          {websiteUrl && (
                            <a
                              href={websiteUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-gray-400 hover:text-primary-600 transition-colors"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <FiGlobe className="w-5 h-5" />
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </Link>
                )
              })}
            </div>
          )}

          {speakers.length > 0 && (
            <div className="mt-12 text-center bg-gray-50 rounded-lg p-8">
              <h3 className="font-semibold text-gray-900 mb-2">More Speakers Coming Soon!</h3>
              <p className="text-gray-600 mb-4">
                We're adding more amazing speakers daily. Check back regularly for updates.
              </p>
              <Link href="/news" className="text-primary-600 font-medium hover:underline">
                Subscribe to updates →
              </Link>
            </div>
          )}
        </div>
      </section>
    </>
  )
}






