'use client'

import React from 'react'
import Link from 'next/link'
import { FiFileText, FiCalendar, FiCheck, FiAlertCircle, FiEdit, FiClock } from 'react-icons/fi'

interface Abstract {
  id: string
  title: string
  submissionId: string
  status: string
  submittedDate: string
  track: string
  reviewerComments?: string | null
  assignedSession?: any
}

interface StatusConfig {
  [key: string]: {
    color: string
    icon: any
    label: string
  }
}

interface DashboardClientProps {
  abstracts: Abstract[]
  statusConfig: StatusConfig
}

export default function DashboardClient({ abstracts, statusConfig }: DashboardClientProps) {
  return (
    <div className="space-y-4">
      {abstracts.map((abstract) => {
        const status = statusConfig[abstract.status] || statusConfig.received
        const Icon = status.icon
        
        return (
          <div key={abstract.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 mb-2">{abstract.title}</h3>
                <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <FiFileText className="w-4 h-4" />
                    {abstract.submissionId}
                  </span>
                  <span className="flex items-center gap-1">
                    <FiCalendar className="w-4 h-4" />
                    Submitted: {new Date(abstract.submittedDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <span className={`flex items-center gap-2 px-3 py-1 bg-${status.color}-100 text-${status.color}-700 rounded-full text-sm font-medium whitespace-nowrap`}>
                <Icon className="w-4 h-4" />
                {status.label}
              </span>
            </div>

            <div className="p-3 bg-gray-50 rounded-lg mb-4">
              <p className="text-sm text-gray-600">Track: <span className="font-medium text-gray-900 capitalize">{abstract.track}</span></p>
            </div>

            {/* Status Messages with Feedback */}
            {(abstract.status === 'received' || abstract.status === 'under-review') && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-3">
                <p className="text-sm text-blue-800">
                  <strong>Status:</strong> Your abstract is currently being reviewed by our committee. We will notify you once a decision has been made.
                </p>
              </div>
            )}

            {abstract.status === 'accepted' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-3">
                <div className="flex items-start gap-2">
                  <FiCheck className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-green-900 mb-1">
                      Congratulations! Your abstract has been accepted.
                    </p>
                    {abstract.reviewerComments && (
                      <div className="mt-2 pt-2 border-t border-green-200">
                        <p className="text-xs font-medium text-green-800 mb-1">Feedback from Reviewers:</p>
                        <p className="text-sm text-green-700 whitespace-pre-wrap">{abstract.reviewerComments}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {abstract.status === 'rejected' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-3">
                <div className="flex items-start gap-2">
                  <FiAlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-red-900 mb-1">
                      Your abstract was not accepted for this conference.
                    </p>
                    {abstract.reviewerComments ? (
                      <div className="mt-2 pt-2 border-t border-red-200">
                        <p className="text-xs font-medium text-red-800 mb-1">Feedback from Reviewers:</p>
                        <p className="text-sm text-red-700 whitespace-pre-wrap">{abstract.reviewerComments}</p>
                      </div>
                    ) : (
                      <p className="text-sm text-red-700 mt-2">
                        We appreciate your submission and encourage you to submit again in the future.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {abstract.status === 'revisions' && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-3">
                <div className="flex items-start gap-2">
                  <FiEdit className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-orange-900 mb-1">
                      Revisions Requested
                    </p>
                    {abstract.reviewerComments ? (
                      <div className="mt-2 pt-2 border-t border-orange-200">
                        <p className="text-xs font-medium text-orange-800 mb-1">Reviewer Feedback:</p>
                        <p className="text-sm text-orange-700 whitespace-pre-wrap">{abstract.reviewerComments}</p>
                      </div>
                    ) : (
                      <p className="text-sm text-orange-700 mt-2">
                        Please review the feedback and submit a revised version of your abstract.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 mt-4">
              <Link
                href={`/track?id=${abstract.submissionId}`}
                className="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center gap-1"
              >
                <FiCalendar className="w-4 h-4" />
                Track Status
              </Link>
            </div>
          </div>
        )
      })}
    </div>
  )
}

