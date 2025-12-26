import React from 'react'
import { getPayloadClient } from '@/lib/payload'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { FiEdit, FiArrowLeft, FiTwitter, FiLink, FiStar } from 'react-icons/fi'
import { format } from 'date-fns'

export const revalidate = 0

interface SpeakerDetailPageProps {
  params: {
    id: string
  }
}

export default async function SpeakerDetailPage({ params }: SpeakerDetailPageProps) {
  const payload = await getPayloadClient()
  
  try {
    const speaker = await payload.findByID({
      collection: 'speakers',
      id: params.id,
      depth: 2,
    })

    return (
      <div className="container-custom py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/admin/speakers" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
            <FiArrowLeft className="w-5 h-5" />
            <span>Back to Speakers</span>
          </Link>
          <Link href={`/admin/speakers/${params.id}/edit`} className="btn-primary flex items-center gap-2">
            <FiEdit className="w-5 h-5" />
            Edit Speaker
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Speaker Header */}
          <div className="bg-gradient-to-r from-primary-600 to-secondary-600 p-8 text-white">
            <div className="flex items-start gap-6">
              {speaker.photo && typeof speaker.photo !== 'string' && (
                <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-white/20 flex-shrink-0">
                  <Image
                    src={speaker.photo.url}
                    alt={speaker.name}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold">{speaker.name}</h1>
                  {speaker.featured && (
                    <FiStar className="w-6 h-6 text-yellow-300 fill-current" />
                  )}
                </div>
                <p className="text-xl text-white/90 mb-2">{speaker.title}</p>
                <p className="text-white/80">{speaker.organization}, {speaker.country}</p>
              </div>
            </div>
          </div>

          <div className="p-8 space-y-8">
            {/* Speaker Types */}
            {speaker.type && speaker.type.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-3">Speaker Types</h3>
                <div className="flex flex-wrap gap-2">
                  {speaker.type.map((type: string) => (
                    <span
                      key={type}
                      className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm font-medium capitalize"
                    >
                      {type.replace('-', ' ')}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Biography */}
            {speaker.bio && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-3">Biography</h3>
                <div className="prose max-w-none text-gray-700">
                  {/* Render rich text - simplified for now */}
                  <p>{typeof speaker.bio === 'string' ? speaker.bio : 'Biography content'}</p>
                </div>
              </div>
            )}

            {/* Expertise */}
            {speaker.expertise && speaker.expertise.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-3">Areas of Expertise</h3>
                <div className="flex flex-wrap gap-2">
                  {speaker.expertise.map((exp: any, index: number) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm"
                    >
                      {exp.area || exp}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Social Media */}
            {speaker.socialMedia && (speaker.socialMedia.twitter || speaker.socialMedia.linkedin || speaker.socialMedia.website) && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-3">Links</h3>
                <div className="flex flex-wrap gap-4">
                  {speaker.socialMedia.twitter && (
                    <a
                      href={`https://twitter.com/${speaker.socialMedia.twitter.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-primary-600 hover:text-primary-700"
                    >
                      <FiTwitter className="w-5 h-5" />
                      <span>{speaker.socialMedia.twitter}</span>
                    </a>
                  )}
                  {speaker.socialMedia.linkedin && (
                    <a
                      href={speaker.socialMedia.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-primary-600 hover:text-primary-700"
                    >
                      <FiLink className="w-5 h-5" />
                      <span>LinkedIn</span>
                    </a>
                  )}
                  {speaker.socialMedia.website && (
                    <a
                      href={speaker.socialMedia.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-primary-600 hover:text-primary-700"
                    >
                      <FiLink className="w-5 h-5" />
                      <span>Website</span>
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Sessions */}
            {speaker.sessions && Array.isArray(speaker.sessions) && speaker.sessions.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-3">Speaking At</h3>
                <div className="space-y-2">
                  {speaker.sessions.map((session: any) => (
                    <Link
                      key={typeof session === 'string' ? session : session.id}
                      href={`/admin/sessions/${typeof session === 'string' ? session : session.id}`}
                      className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="font-medium text-gray-900">
                        {typeof session === 'string' ? session : session.title}
                      </div>
                      {typeof session !== 'string' && session.date && (
                        <div className="text-sm text-gray-500 mt-1">
                          {format(new Date(session.date), 'MMM dd, yyyy')}
                        </div>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Metadata */}
            <div className="pt-6 border-t border-gray-200">
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Created:</span>{' '}
                  <span className="text-gray-900">
                    {speaker.createdAt ? format(new Date(speaker.createdAt), 'PPpp') : 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Last Updated:</span>{' '}
                  <span className="text-gray-900">
                    {speaker.updatedAt ? format(new Date(speaker.updatedAt), 'PPpp') : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  } catch (error) {
    notFound()
  }
}


