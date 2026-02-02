import Link from 'next/link'
import { FiArrowLeft, FiMail, FiTwitter, FiLinkedin, FiGlobe } from 'react-icons/fi'
import EmptyState from '@/components/ui/EmptyState'
import { getPayloadClient } from '@/lib/payload'
import { getCountryLabel } from '@/lib/countries'
import Image from 'next/image'

// Helper function to get photo URL (same pattern as speakers)
function getPhotoUrl(photo: any): string | null {
  if (!photo) return null

  const fixDomain = (url: string): string => {
    if (url.includes('sarsyc.org') && !url.includes('www.sarsyc.org')) {
      return url.replace('https://sarsyc.org', 'https://www.sarsyc.org')
    }
    return url
  }

  const isBlobUrl = (url: string): boolean => {
    return url.includes('blob.vercel-storage.com') || url.includes('public.blob.vercel-storage.com')
  }

  const isPayloadFileUrl = (url: string): boolean => {
    return url.includes('/api/media/file/')
  }

  if (typeof photo === 'string') {
    if (photo.startsWith('http')) {
      if (isPayloadFileUrl(photo)) return null
      return fixDomain(photo)
    }
    return null
  }

  if (photo.thumbnailURL && typeof photo.thumbnailURL === 'string') {
    if (isBlobUrl(photo.thumbnailURL)) {
      return fixDomain(photo.thumbnailURL)
    }
  }

  if (photo.url && typeof photo.url === 'string') {
    if (isBlobUrl(photo.url)) {
      return fixDomain(photo.url)
    }
    if (isPayloadFileUrl(photo.url)) {
      if (photo.sizes?.card?.url && isBlobUrl(photo.sizes.card.url)) {
        return fixDomain(photo.sizes.card.url)
      }
      if (photo.sizes?.thumbnail?.url && isBlobUrl(photo.sizes.thumbnail.url)) {
        return fixDomain(photo.sizes.thumbnail.url)
      }
      return null
    }
    return fixDomain(photo.url)
  }

  if (photo.sizes?.card?.url && !isPayloadFileUrl(photo.sizes.card.url)) {
    return fixDomain(photo.sizes.card.url)
  }

  if (photo.sizes?.thumbnail?.url && !isPayloadFileUrl(photo.sizes.thumbnail.url)) {
    return fixDomain(photo.sizes.thumbnail.url)
  }

  return null
}

// Helper function to get initials
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

export const revalidate = 3600 // Revalidate every hour

export default async function YouthSteeringCommitteePage() {
  let members: any[] = []
  
  try {
    const payload = await getPayloadClient()
    
    const result = await payload.find({
      collection: 'youth-steering-committee',
      where: {},
      limit: 100,
      sort: 'order',
      depth: 2,
    })
    
    members = result.docs
  } catch (error: any) {
    console.error('Error fetching Youth Steering Committee members:', error)
    members = []
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white py-16">
        <div className="container-custom">
          <Link
            href="/about"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors"
          >
            <FiArrowLeft className="w-4 h-4" />
            Back to About
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Youth Steering Committee</h1>
          <p className="text-xl text-white/90 max-w-3xl">
            Meet the dedicated members of the Youth Steering Committee who guide and shape the vision of SARSYC VI.
          </p>
        </div>
      </div>

      {/* Committee Members */}
      <div className="container-custom py-16">
        {members.length === 0 ? (
          <EmptyState
            icon="users"
            title="Committee Members Coming Soon"
            description="The Youth Steering Committee members will be announced soon. Check back later!"
          />
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {members.map((member: any) => {
              const photoUrl = getPhotoUrl(member.photo)
              const bioText = extractBioText(member.bio)
              
              return (
                <div
                  key={member.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                >
                  {/* Photo */}
                  <div className="relative w-full h-64 bg-gradient-to-br from-primary-400 to-secondary-400">
                    {photoUrl ? (
                      <Image
                        src={photoUrl}
                        alt={member.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white text-6xl font-bold">
                        {getInitials(member.name)}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="mb-3">
                      <h3 className="text-xl font-bold text-gray-900 mb-1">{member.name}</h3>
                      <p className="text-primary-600 font-medium">{member.role}</p>
                      <p className="text-sm text-gray-600 mt-1">{member.organization}</p>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                      <span>{getCountryLabel(member.country)}</span>
                    </div>

                    {bioText && (
                      <p className="text-gray-700 text-sm mb-4 line-clamp-3">
                        {bioText}
                      </p>
                    )}

                    {/* Social Links */}
                    {(member.email || member.socialMedia?.twitter || member.socialMedia?.linkedin || member.socialMedia?.website) && (
                      <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                        {member.email && (
                          <a
                            href={`mailto:${member.email}`}
                            className="text-gray-600 hover:text-primary-600 transition-colors"
                            aria-label="Email"
                          >
                            <FiMail className="w-5 h-5" />
                          </a>
                        )}
                        {member.socialMedia?.twitter && (
                          <a
                            href={`https://twitter.com/${member.socialMedia.twitter.replace('@', '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-600 hover:text-primary-600 transition-colors"
                            aria-label="Twitter"
                          >
                            <FiTwitter className="w-5 h-5" />
                          </a>
                        )}
                        {member.socialMedia?.linkedin && (
                          <a
                            href={member.socialMedia.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-600 hover:text-primary-600 transition-colors"
                            aria-label="LinkedIn"
                          >
                            <FiLinkedin className="w-5 h-5" />
                          </a>
                        )}
                        {member.socialMedia?.website && (
                          <a
                            href={member.socialMedia.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-600 hover:text-primary-600 transition-colors"
                            aria-label="Website"
                          >
                            <FiGlobe className="w-5 h-5" />
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
