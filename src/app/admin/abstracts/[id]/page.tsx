import React from 'react'
import { getPayloadClient } from '@/lib/payload'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import {
  FiEdit,
  FiArrowLeft,
  FiFileText,
  FiUser,
  FiMail,
  FiPhone,
  FiUsers,
} from 'react-icons/fi'
import { format } from 'date-fns'
import { getCurrentUserFromCookies } from '@/lib/getCurrentUser'
import AbstractReviewForm from '@/components/admin/AbstractReviewForm'

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
  const currentUser = await getCurrentUserFromCookies()
  if (!currentUser) redirect('/login?type=reviewer&redirect=/admin/abstracts')
  if (currentUser.role !== 'admin' && currentUser.role !== 'reviewer') redirect('/login?type=reviewer&redirect=/admin/abstracts')

  const payload = await getPayloadClient()
  const reviewerIdValue =
    currentUser?.id && typeof currentUser.id === 'object'
      ? currentUser.id.toString()
      : currentUser?.id
  const reviewerId = reviewerIdValue ? reviewerIdValue.toString() : undefined
  const isReviewer = currentUser?.role === 'reviewer' && Boolean(reviewerId)
  const isAdminOrEditor = currentUser?.role === 'admin' || currentUser?.role === 'editor'
  
  try {
    const abstract = await payload.findByID({
      collection: 'abstracts',
      id: params.id,
      depth: 2,
    })

    const assignedReviewers = Array.isArray(abstract.assignedReviewers)
      ? abstract.assignedReviewers
      : []
    const assignedReviewerIds = assignedReviewers.map((reviewer: any) =>
      typeof reviewer === 'object' ? reviewer.id?.toString() : reviewer?.toString()
    )

    if (isReviewer && reviewerId && !assignedReviewerIds.includes(reviewerId)) {
      return (
        <div className="container-custom py-8">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h2 className="text-xl font-bold text-yellow-900 mb-2">Access Restricted</h2>
            <p className="text-yellow-800 mb-4">
              This abstract has not been assigned to you for review. Please contact the conference administrators if you believe this is an error.
            </p>
            <Link href="/admin/abstracts" className="btn-primary">
              Back to Assigned Abstracts
            </Link>
          </div>
        </div>
      )
    }

    const reviewsResult = await payload.find({
      collection: 'abstract-reviews',
      where: {
        abstract: { equals: params.id },
      },
      depth: 2,
      sort: '-updatedAt',
      limit: 100,
    })

    const reviews = reviewsResult.docs || []
    const reviewerReview = isReviewer && reviewerId
      ? reviews.find((review: any) => {
          const reviewReviewerId =
            typeof review.reviewer === 'object'
              ? review.reviewer.id?.toString()
              : review.reviewer?.toString()
          return reviewReviewerId === reviewerId
        })
      : null

    return (
      <div className="container-custom py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/admin/abstracts" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
            <FiArrowLeft className="w-5 h-5" />
            <span>Back to Abstracts</span>
          </Link>
          {isAdminOrEditor && (
            <Link href={`/admin/abstracts/${params.id}/edit`} className="btn-primary flex items-center gap-2">
              <FiEdit className="w-5 h-5" />
              Edit Abstract
            </Link>
          )}
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

            {/* Assigned Reviewers */}
            {isAdminOrEditor && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <FiUsers className="w-5 h-5 text-gray-500" />
                  Assigned Reviewers
                </div>
                {assignedReviewers.length > 0 ? (
                  <ul className="list-disc list-inside text-sm text-gray-700">
                    {assignedReviewers.map((reviewer: any) => {
                      const name =
                        typeof reviewer === 'object'
                          ? `${reviewer.firstName || ''} ${reviewer.lastName || ''}`.trim() ||
                            reviewer.email ||
                            reviewer.id
                          : reviewer
                      const email =
                        typeof reviewer === 'object' ? reviewer.email : null
                      return (
                        <li key={typeof reviewer === 'object' ? reviewer.id : reviewer}>
                          {name}
                          {email && <span className="text-gray-500"> ({email})</span>}
                        </li>
                      )
                    })}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-600">
                    No reviewers assigned.{' '}
                    <Link href={`/admin/abstracts/${params.id}/edit`} className="text-primary-600 font-medium hover:underline">
                      Edit abstract
                    </Link>
                    {' '}to assign reviewers.
                  </p>
                )}
              </div>
            )}
            {!isAdminOrEditor && assignedReviewers.length > 0 && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <FiUsers className="w-5 h-5 text-gray-500" />
                  Assigned Reviewers
                </div>
                <ul className="list-disc list-inside text-sm text-gray-700">
                  {assignedReviewers.map((reviewer: any) => {
                    const name =
                      typeof reviewer === 'object'
                        ? `${reviewer.firstName || ''} ${reviewer.lastName || ''}`.trim() ||
                          reviewer.email ||
                          reviewer.id
                        : reviewer
                    const email =
                      typeof reviewer === 'object' ? reviewer.email : null
                    return (
                      <li key={typeof reviewer === 'object' ? reviewer.id : reviewer}>
                        {name}
                        {email && <span className="text-gray-500"> ({email})</span>}
                      </li>
                    )
                  })}
                </ul>
              </div>
            )}

            {/* Reviews Summary */}
            {reviews.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Reviewer Feedback</h3>
                <div className="space-y-4">
                  {reviews.map((review: any) => {
                    const reviewer =
                      typeof review.reviewer === 'object'
                        ? review.reviewer
                        : null
                    return (
                      <div
                        key={review.id}
                        className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {reviewer
                                ? `${reviewer.firstName || ''} ${reviewer.lastName || ''}`.trim() ||
                                  reviewer.email ||
                                  reviewer.id
                                : 'Reviewer'}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(review.updatedAt || review.createdAt).toLocaleString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-3 text-sm">
                            <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-800 font-semibold">
                              Score: {review.score}
                            </span>
                            <span className="px-2 py-1 rounded-full bg-gray-200 text-gray-700 capitalize">
                              {String(review.recommendation || '').replace('-', ' ')}
                            </span>
                            {review.confidence && (
                              <span className="px-2 py-1 rounded-full bg-purple-100 text-purple-700 capitalize">
                                {review.confidence} confidence
                              </span>
                            )}
                          </div>
                        </div>
                        {review.comments && (
                          <div className="text-sm text-gray-700 whitespace-pre-wrap">
                            {review.comments}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Reviewer Form */}
            {isReviewer && reviewerId && (
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Submit Your Review</h3>
                <AbstractReviewForm
                  abstractId={abstract.id.toString()}
                  existingReview={reviewerReview}
                  allowEdit
                />
              </div>
            )}

            {/* Admin view: show review form read-only? */}
            {!isReviewer && reviews.length === 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">No reviews submitted yet</h3>
                <p className="text-blue-800">
                  Assign reviewers to this abstract and they will submit their evaluations here.
                </p>
              </div>
            )}
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



