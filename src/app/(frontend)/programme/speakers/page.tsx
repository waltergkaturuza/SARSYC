import Image from 'next/image'
import Link from 'next/link'
import { FiLinkedin, FiTwitter, FiGlobe, FiUser } from 'react-icons/fi'
import EmptyState from '@/components/ui/EmptyState'
import { getPayloadClient } from '@/lib/payload'

// Helper function to get speaker photo URL
function getSpeakerPhotoUrl(photo: any): string | null {
  if (!photo) return null
  if (typeof photo === 'string') return null
  
  // Try different URL locations for Vercel Blob or local storage
  return (
    photo.url ||
    photo.sizes?.card?.url ||
    photo.sizes?.thumbnail?.url ||
    photo.sizes?.hero?.url ||
    null
  )
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
    })
    speakers = speakersResult.docs || []
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
                const isKeynote = speaker.type && Array.isArray(speaker.type) && speaker.type.includes('keynote')
                const twitterHandle = speaker.socialMedia?.twitter
                const linkedinUrl = speaker.socialMedia?.linkedin
                const websiteUrl = speaker.socialMedia?.website
                
                return (
                  <Link
                    key={speaker.id}
                    href={`/programme/speakers/${speaker.id}`}
                    className="card group overflow-hidden hover:shadow-xl transition-all duration-300"
                  >
                    <div className="aspect-square relative overflow-hidden bg-gray-200">
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
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-blue-500 to-purple-600 flex items-center justify-center">
                          <div className="text-white text-6xl font-bold opacity-50">
                            {initials}
                          </div>
                        </div>
                      )}
                      {/* KEYNOTE badge in bottom-left */}
                      {isKeynote && (
                        <div className="absolute bottom-0 left-0 p-4">
                          <span className="px-3 py-1.5 bg-yellow-400 text-gray-900 text-xs font-bold rounded-md">
                            KEYNOTE
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="p-6 bg-white">
                      <h3 className="text-xl font-bold text-primary-600 mb-1 group-hover:text-primary-700 transition-colors">
                        {speaker.name}
                      </h3>
                      <p className="text-sm font-medium text-gray-700 mb-1">{speaker.title}</p>
                      <p className="text-sm text-gray-600 mb-4">
                        {speaker.organization}{speaker.country ? ` • ${speaker.country}` : ''}
                      </p>
                      
                      {bioText && (
                        <p className="text-sm text-gray-600 line-clamp-3 mb-4">
                          {bioText}
                        </p>
                      )}

                      <div className="flex items-center gap-3">
                        {twitterHandle && (
                          <a
                            href={twitterHandle.startsWith('http') ? twitterHandle : `https://twitter.com/${twitterHandle.replace('@', '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-400 hover:text-sky-500 transition-colors"
                          >
                            <FiTwitter className="w-5 h-5" />
                          </a>
                        )}
                        {linkedinUrl && (
                          <a
                            href={linkedinUrl.startsWith('http') ? linkedinUrl : `https://${linkedinUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-400 hover:text-blue-600 transition-colors"
                          >
                            <FiLinkedin className="w-5 h-5" />
                          </a>
                        )}
                        {websiteUrl && (
                          <a
                            href={websiteUrl.startsWith('http') ? websiteUrl : `https://${websiteUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-400 hover:text-primary-600 transition-colors"
                          >
                            <FiGlobe className="w-5 h-5" />
                          </a>
                        )}
                      </div>
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






