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
                <div className="flex items-center gap-4 mt-4">
                  <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                    {abstract.track?.toUpperCase() || 'N/A'}
                  </span>
                  <span className="px-3 py-1 bg-white/20 rounded-full text-sm capitalize">
                    {abstract.presentationType || 'N/A'}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    statusColors[abstract.status] || 'bg-gray-100 text-gray-800'
                  }`}>
                    {abstract.status?.replace('-', ' ') || 'N/A'}
                  </span>
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
            {abstract.keywords && abstract.keywords.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-3">Keywords</h3>
                <div className="flex flex-wrap gap-2">
                  {abstract.keywords.map((kw: any, index: number) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm"
                    >
                      {kw.keyword || kw}
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
                      {abstract.primaryAuthor.firstName} {abstract.primaryAuthor.lastName}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FiMail className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-700">{abstract.primaryAuthor.email}</span>
                  </div>
                  {abstract.primaryAuthor.phone && (
                    <div className="flex items-center gap-2">
                      <FiPhone className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-700">{abstract.primaryAuthor.phone}</span>
                    </div>
                  )}
                  <div className="text-gray-700">
                    {abstract.primaryAuthor.organization}, {abstract.primaryAuthor.country}
                  </div>
                </div>
              </div>
            )}

            {/* Co-Authors */}
            {abstract.coAuthors && abstract.coAuthors.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-3">Co-Authors</h3>
                <div className="space-y-2">
                  {abstract.coAuthors.map((author: any, index: number) => (
                    <div key={index} className="p-4 border border-gray-200 rounded-lg">
                      <div className="font-medium text-gray-900">{author.name}</div>
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

            {/* Metadata */}
            <div className="pt-6 border-t border-gray-200">
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Submitted:</span>{' '}
                  <span className="text-gray-900">
                    {abstract.createdAt ? format(new Date(abstract.createdAt), 'PPpp') : 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Last Updated:</span>{' '}
                  <span className="text-gray-900">
                    {abstract.updatedAt ? format(new Date(abstract.updatedAt), 'PPpp') : 'N/A'}
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


