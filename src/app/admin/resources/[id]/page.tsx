import React from 'react'
import { getPayloadClient } from '@/lib/payload'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { FiEdit, FiArrowLeft, FiDownload, FiFileText, FiCalendar, FiGlobe, FiTag } from 'react-icons/fi'
import { format } from 'date-fns'

export const revalidate = 0

interface ResourceDetailPageProps {
  params: {
    id: string
  }
}

const typeLabels: Record<string, string> = {
  report: 'Conference Report',
  paper: 'Research Paper',
  brief: 'Policy Brief',
  presentation: 'Presentation',
  toolkit: 'Toolkit',
  infographic: 'Infographic',
  video: 'Video',
  other: 'Other',
}

const sarsycEditionsMap: Record<string, string> = {
  '1': 'SARSYC I (2015)',
  '2': 'SARSYC II (2017)',
  '3': 'SARSYC III (2019)',
  '4': 'SARSYC IV (2022)',
  '5': 'SARSYC V (2024)',
  '6': 'SARSYC VI (2026)',
  'other': 'Other/General',
}

export default async function ResourceDetailPage({ params }: ResourceDetailPageProps) {
  const payload = await getPayloadClient()
  
  try {
    const resource = await payload.findByID({
      collection: 'resources',
      id: params.id,
      depth: 2,
    })

    return (
      <div className="container-custom py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/admin/resources" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
            <FiArrowLeft className="w-5 h-5" />
            <span>Back to Resources</span>
          </Link>
          <Link href={`/admin/resources/${params.id}/edit`} className="btn-primary flex items-center gap-2">
            <FiEdit className="w-5 h-5" />
            Edit Resource
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Resource Header */}
          <div className="bg-gradient-to-r from-primary-600 to-secondary-600 p-8 text-white">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <FiFileText className="w-8 h-8" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                    {typeLabels[resource.type] || resource.type}
                  </span>
                  {resource.featured && (
                    <span className="px-3 py-1 bg-yellow-400 text-yellow-900 rounded-full text-sm font-medium">
                      Featured
                    </span>
                  )}
                </div>
                <h1 className="text-3xl font-bold mb-2">{resource.title}</h1>
                <div className="flex items-center gap-4 text-white/90">
                  <div className="flex items-center gap-2">
                    <FiCalendar className="w-5 h-5" />
                    <span>{resource.year}</span>
                  </div>
                  {resource.sarsycEdition && (
                    <span>{sarsycEditionsMap[resource.sarsycEdition] || resource.sarsycEdition}</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="p-8 space-y-8">
            {/* Description */}
            {resource.description && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-3">Description</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{resource.description}</p>
              </div>
            )}

            {/* File Download */}
            {resource.file && typeof resource.file !== 'string' && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-3">Resource File</h3>
                <a
                  href={resource.file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  <FiDownload className="w-5 h-5" />
                  Download File
                </a>
                <div className="mt-2 text-sm text-gray-600">
                  {resource.file.filename} ({(resource.file.filesize / (1024 * 1024)).toFixed(2)} MB)
                </div>
                {resource.downloads !== undefined && (
                  <div className="mt-1 text-sm text-gray-500">
                    {resource.downloads} downloads
                  </div>
                )}
              </div>
            )}

            {/* Topics */}
            {resource.topics && resource.topics.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-3">Topics</h3>
                <div className="flex flex-wrap gap-2">
                  {resource.topics.map((topic: string) => (
                    <span
                      key={topic}
                      className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm font-medium"
                    >
                      {topic.replace('-', ' ')}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Authors */}
            {resource.authors && resource.authors.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-3">Authors</h3>
                <div className="space-y-2">
                  {resource.authors.map((authorItem: any, index: number) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-900">{authorItem.author || authorItem}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Additional Metadata */}
            <div className="grid md:grid-cols-2 gap-6">
              {resource.country && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Country/Region</h3>
                  <div className="flex items-center gap-2 text-gray-700">
                    <FiGlobe className="w-5 h-5 text-gray-400" />
                    <span>{resource.country}</span>
                  </div>
                </div>
              )}

              {resource.language && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Language</h3>
                  <span className="text-gray-700">
                    {resource.language.toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            {/* Metadata */}
            <div className="pt-6 border-t border-gray-200">
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Created:</span>{' '}
                  <span className="text-gray-900">
                    {resource.createdAt ? format(new Date(resource.createdAt), 'PPpp') : 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Last Updated:</span>{' '}
                  <span className="text-gray-900">
                    {resource.updatedAt ? format(new Date(resource.updatedAt), 'PPpp') : 'N/A'}
                  </span>
                </div>
                {resource.slug && (
                  <div className="md:col-span-2">
                    <span className="text-gray-500">URL Slug:</span>{' '}
                    <code className="px-2 py-1 bg-gray-100 rounded text-gray-900">{resource.slug}</code>
                  </div>
                )}
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



