import React from 'react'
import { getPayloadClient } from '@/lib/payload'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { FiEdit, FiArrowLeft, FiMail, FiTwitter, FiLinkedin, FiGlobe, FiStar } from 'react-icons/fi'

export const revalidate = 0

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

export default async function CommitteeMemberViewPage({
  params,
}: {
  params: { id: string }
}) {
  const payload = await getPayloadClient()

  let member: any = null

  try {
    const result = await payload.findByID({
      collection: 'youth-steering-committee',
      id: params.id,
      depth: 2,
      overrideAccess: true,
    })
    member = result
  } catch (error: any) {
    console.error('Error fetching committee member:', error)
    notFound()
  }

  if (!member) {
    notFound()
  }

  const photoUrl = getPhotoUrl(member.photo)

  return (
    <div className="container-custom py-8">
      <div className="mb-6">
        <Link
          href="/admin/youth-steering-committee"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <FiArrowLeft className="w-4 h-4" />
          Back to Committee Members
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{member.name}</h1>
            <p className="text-gray-600 mt-1">{member.role} • {member.organization}</p>
          </div>
          <Link
            href={`/admin/youth-steering-committee/${member.id}/edit`}
            className="btn-primary flex items-center gap-2"
          >
            <FiEdit className="w-5 h-5" />
            Edit Member
          </Link>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          {/* Profile Photo */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Profile Photo</h2>
            {photoUrl ? (
              <div className="relative w-48 h-48 rounded-lg overflow-hidden bg-gray-200">
                <Image
                  src={photoUrl}
                  alt={member.name}
                  fill
                  className="object-cover"
                  sizes="192px"
                />
              </div>
            ) : (
              <div className="w-48 h-48 rounded-lg bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center text-white text-4xl font-bold">
                {member.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>
            )}
          </div>

          {/* Biography */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Biography</h2>
            <div className="prose max-w-none">
              {member.bio ? (
                typeof member.bio === 'string' ? (
                  <p className="text-gray-700 whitespace-pre-wrap">{member.bio}</p>
                ) : (
                  <div dangerouslySetInnerHTML={{ __html: member.bio }} />
                )
              ) : (
                <p className="text-gray-500 italic">No biography available</p>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Details */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Details</h2>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">Role</dt>
                <dd className="text-gray-900">{member.role}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Organization</dt>
                <dd className="text-gray-900">{member.organization}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Country</dt>
                <dd className="text-gray-900">{member.country}</dd>
              </div>
              {member.email && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Email</dt>
                  <dd className="text-gray-900">
                    <a href={`mailto:${member.email}`} className="text-primary-600 hover:underline flex items-center gap-1">
                      <FiMail className="w-4 h-4" />
                      {member.email}
                    </a>
                  </dd>
                </div>
              )}
              <div>
                <dt className="text-sm font-medium text-gray-500">Display Order</dt>
                <dd className="text-gray-900">{member.order || 0}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd>
                  {member.featured ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-700">
                      <FiStar className="w-3 h-3" />
                      Featured
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
                      Regular
                    </span>
                  )}
                </dd>
              </div>
            </dl>
          </div>

          {/* Social Media */}
          {(member.socialMedia?.twitter || member.socialMedia?.linkedin || member.socialMedia?.website) && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Social Media</h2>
              <div className="space-y-2">
                {member.socialMedia?.twitter && (
                  <a
                    href={`https://twitter.com/${member.socialMedia.twitter.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-gray-700 hover:text-primary-600"
                  >
                    <FiTwitter className="w-4 h-4" />
                    {member.socialMedia.twitter}
                  </a>
                )}
                {member.socialMedia?.linkedin && (
                  <a
                    href={member.socialMedia.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-gray-700 hover:text-primary-600"
                  >
                    <FiLinkedin className="w-4 h-4" />
                    LinkedIn
                  </a>
                )}
                {member.socialMedia?.website && (
                  <a
                    href={member.socialMedia.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-gray-700 hover:text-primary-600"
                  >
                    <FiGlobe className="w-4 h-4" />
                    Website
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
