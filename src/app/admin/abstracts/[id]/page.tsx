import React from 'react'
import { getPayloadClient } from '@/lib/payload'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { FiEdit, FiArrowLeft, FiFileText, FiCalendar, FiUser, FiMail, FiPhone } from 'react-icons/fi'
import { format } from 'date-fns'

export const revalidate = 0

interface AbstractDetailPageProps {
  params: {
    id: string
  }
}

const statusColors: Record<string, string> = {
  received: 'bg-blue-100 text-blue-800',
  'under-review': 'bg-yellow-100 text-yellow-800',
  revisions: 'bg-orange-100 text-orange-800',
  accepted: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
}

export default async function AbstractDetailPage({ params }: AbstractDetailPageProps) {
  const payload = await getPayloadClient()
  
  try {
    const abstract = await payload.findByID({
      collection: 'abstracts',
      id: params.id,
      depth: 2,
    })

    return (
      <div className="container-custom py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/admin/abstracts" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
            <FiArrowLeft className="w-5 h-5" />
            <span>Back to Abstracts</span>
          </Link>
          <Link href={`/admin/abstracts/${params.id}/edit`} className="btn-primary flex items-center gap-2">
            <FiEdit className="w-5 h-5" />
            Edit Abstract
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Abstract Header */}
          <div className="bg-gradient-to-r from-primary-600 to-secondary-600 p-8 text-white">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <FiFileText className="w-8 h-8" />
                  <div>
                    <div className="text-sm text-white/80 mb-1">Submission ID</div>
                    <div className="text-2xl font-bold">{abstract.submissionId || abstract.id}</div>
                  </div>
                </div>
                <h1 className="text-3xl font-bold mb-2">{abstract.title}</h1>
                <div className="flex items-center gap-4 mt-4 flex-wrap">
                  {abstract.track && (
                    <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                      {String(abstract.track).toUpperCase()}
                    </span>
                  )}
                  {abstract.presentationType && (
                    <span className="px-3 py-1 bg-white/20 rounded-full text-sm capitalize">
                      {String(abstract.presentationType)}
                    </span>
                  )}
                  {abstract.status && (
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      statusColors[abstract.status] || 'bg-gray-100 text-gray-800'
                    }`}>
                      {String(abstract.status).replace(/-/g, ' ')}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="p-8 space-y-8">
            {/* Abstract Text */}
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-3">Abstract</h3>
              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap">{abstract.abstract}</p>
              </div>
            </div>

            {/* Keywords */}
            {abstract.keywords && Array.isArray(abstract.keywords) && abstract.keywords.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-3">Keywords</h3>
                <div className="flex flex-wrap gap-2">
                  {abstract.keywords
                    .filter((kw: any) => kw && (kw.keyword || kw))
                    .map((kw: any, index: number) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm"
                      >
                        {typeof kw === 'object' ? (kw.keyword || '') : String(kw || '')}
                      </span>
                    ))}
                </div>
              </div>
            )}

            {/* Primary Author */}
            {abstract.primaryAuthor && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-3">Primary Author</h3>
                <div className="bg-gray-50 rounded-lg p-6 space-y-3">
                  <div className="flex items-center gap-2">
                    <FiUser className="w-5 h-5 text-gray-400" />
                    <span className="font-medium text-gray-900">
                      {abstract.primaryAuthor.firstName || ''} {abstract.primaryAuthor.lastName || ''}
                    </span>
                  </div>
                  {abstract.primaryAuthor.email && (
                    <div className="flex items-center gap-2">
                      <FiMail className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-700">{abstract.primaryAuthor.email}</span>
                    </div>
                  )}
                  {abstract.primaryAuthor.phone && (
                    <div className="flex items-center gap-2">
                      <FiPhone className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-700">{abstract.primaryAuthor.phone}</span>
                    </div>
                  )}
                  {(abstract.primaryAuthor.organization || abstract.primaryAuthor.country) && (
                    <div className="text-gray-700">
                      {abstract.primaryAuthor.organization || ''}
                      {abstract.primaryAuthor.organization && abstract.primaryAuthor.country && ', '}
                      {abstract.primaryAuthor.country || ''}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Co-Authors */}
            {abstract.coAuthors && Array.isArray(abstract.coAuthors) && abstract.coAuthors.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-3">
                  Co-Authors ({abstract.coAuthors.filter((a: any) => a && a.name).length})
                </h3>
                <div className="grid md:grid-cols-2 gap-3">
                  {abstract.coAuthors
                    .filter((author: any) => author && author.name)
                    .map((author: any, index: number) => (
                      <div key={index} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                        <div className="font-medium text-gray-900 mb-1">
                          {author.name || 'N/A'}
                        </div>
                        {author.organization && (
                          <div className="text-sm text-gray-600">{author.organization}</div>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Reviewer Comments */}
            {abstract.reviewerComments && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-3">Reviewer Comments</h3>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-gray-700 whitespace-pre-wrap">{abstract.reviewerComments}</p>
                </div>
              </div>
            )}

            {/* Admin Notes */}
            {abstract.adminNotes && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-3">Admin Notes</h3>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-gray-700 whitespace-pre-wrap">{abstract.adminNotes}</p>
                </div>
              </div>
            )}

            {/* Abstract File */}
            {abstract.abstractFile && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-3">Abstract File</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  {typeof abstract.abstractFile === 'object' && abstract.abstractFile.url ? (
                    <a
                      href={abstract.abstractFile.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-primary-600 hover:text-primary-700"
                    >
                      <FiFileText className="w-5 h-5" />
                      <span>{abstract.abstractFile.filename || 'View File'}</span>
                    </a>
                  ) : (
                    <span className="text-gray-600">File ID: {abstract.abstractFile}</span>
                  )}
                </div>
              </div>
            )}

            {/* Metadata */}
            <div className="pt-6 border-t border-gray-200">
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Submitted:</span>{' '}
                  <span className="text-gray-900">
                    {abstract.createdAt 
                      ? (() => {
                          try {
                            const date = new Date(abstract.createdAt)
                            if (isNaN(date.getTime())) {
                              return 'Invalid Date'
                            }
                            return format(date, 'PPpp')
                          } catch (e) {
                            try {
                              return new Date(abstract.createdAt).toLocaleString()
                            } catch {
                              return 'N/A'
                            }
                          }
                        })()
                      : 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Last Updated:</span>{' '}
                  <span className="text-gray-900">
                    {abstract.updatedAt 
                      ? (() => {
                          try {
                            const date = new Date(abstract.updatedAt)
                            if (isNaN(date.getTime())) {
                              return 'Invalid Date'
                            }
                            return format(date, 'PPpp')
                          } catch (e) {
                            try {
                              return new Date(abstract.updatedAt).toLocaleString()
                            } catch {
                              return 'N/A'
                            }
                          }
                        })()
                      : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  } catch (error: any) {
    console.error('Error loading abstract:', error)
    // Return error page instead of just calling notFound
    return (
      <div className="container-custom py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-xl font-bold text-red-900 mb-2">Error Loading Abstract</h2>
          <p className="text-red-700 mb-4">
            {error.message || 'Failed to load abstract details. Please try again.'}
          </p>
          <Link href="/admin/abstracts" className="btn-primary">
            Back to Abstracts
          </Link>
        </div>
      </div>
    )
  }
}



