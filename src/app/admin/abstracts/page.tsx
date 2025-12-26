import React from 'react'
import { getPayloadClient } from '@/lib/payload'
import Link from 'next/link'
import AbstractsFilters from '@/components/admin/AbstractsFilters'
import { 
  FiFileText, FiDownload, FiEye, FiCheck, FiX, FiClock, FiEdit 
} from 'react-icons/fi'

export const revalidate = 0

interface SearchParams {
  page?: string
  status?: string
  track?: string
  search?: string
}

export default async function AbstractsManagementPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const payload = await getPayloadClient()
  
  const page = Number(searchParams.page || 1)
  const perPage = 25
  const status = searchParams.status
  const track = searchParams.track
  const search = searchParams.search

  // Build where clause
  const where: any = {}
  
  if (status && status !== 'all') {
    where.status = { equals: status }
  }
  
  if (track && track !== 'all') {
    where.track = { equals: track }
  }
  
  if (search) {
    where.or = [
      { title: { contains: search } },
      { 'primaryAuthor.firstName': { contains: search } },
      { 'primaryAuthor.lastName': { contains: search } },
      { 'primaryAuthor.email': { contains: search } },
    ]
  }

  const results = await payload.find({
    collection: 'abstracts',
    where,
    limit: perPage,
    page,
    sort: '-createdAt',
  })

  const abstracts = results.docs
  const totalPages = results.totalPages
  const totalDocs = results.totalDocs

  // Get counts by status
  const statusCounts = await Promise.all([
    payload.find({ collection: 'abstracts', where: { status: { equals: 'received' } }, limit: 0 }),
    payload.find({ collection: 'abstracts', where: { status: { equals: 'under-review' } }, limit: 0 }),
    payload.find({ collection: 'abstracts', where: { status: { equals: 'accepted' } }, limit: 0 }),
    payload.find({ collection: 'abstracts', where: { status: { equals: 'rejected' } }, limit: 0 }),
  ])

  const statusConfig: Record<string, any> = {
    'received': { color: 'bg-blue-100 text-blue-700', icon: FiClock, label: 'Received' },
    'under-review': { color: 'bg-yellow-100 text-yellow-700', icon: FiClock, label: 'Under Review' },
    'accepted': { color: 'bg-green-100 text-green-700', icon: FiCheck, label: 'Accepted' },
    'rejected': { color: 'bg-red-100 text-red-700', icon: FiX, label: 'Rejected' },
    'revisions': { color: 'bg-orange-100 text-orange-700', icon: FiEdit, label: 'Revisions' },
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Abstract Management</h1>
          <p className="text-gray-600 mt-1">Review and manage conference abstract submissions</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <FiDownload className="w-5 h-5" />
          Export All
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-gray-900">{statusCounts[0].totalDocs}</div>
          <div className="text-sm text-gray-600">Received</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-gray-900">{statusCounts[1].totalDocs}</div>
          <div className="text-sm text-gray-600">Under Review</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-green-600">{statusCounts[2].totalDocs}</div>
          <div className="text-sm text-gray-600">Accepted</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-red-600">{statusCounts[3].totalDocs}</div>
          <div className="text-sm text-gray-600">Rejected</div>
        </div>
      </div>

      {/* Filters */}
      <AbstractsFilters />

      {/* Abstracts Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Abstracts ({totalDocs})
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Showing {abstracts.length} of {totalDocs} abstracts
              </p>
            </div>
          </div>
        </div>

        {abstracts.length === 0 ? (
          <div className="p-12 text-center">
            <FiFileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No abstracts found matching your criteria</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Submission
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Author
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Track
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Submitted
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {abstracts.map((abstract: any) => {
                  const statusInfo = statusConfig[abstract.status] || statusConfig['received']
                  const StatusIcon = statusInfo.icon
                  
                  return (
                    <tr key={abstract.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{abstract.title}</div>
                        <div className="text-sm text-gray-500">{abstract.submissionId}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {abstract.primaryAuthor?.firstName} {abstract.primaryAuthor?.lastName}
                        </div>
                        <div className="text-xs text-gray-500">{abstract.primaryAuthor?.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
                          {abstract.track?.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${statusInfo.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(abstract.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/abstracts/${abstract.id}`}
                            className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <FiEye className="w-4 h-4" />
                          </Link>
                          <Link
                            href={`/admin/abstracts/${abstract.id}/edit`}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <FiEdit className="w-4 h-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Page {page} of {totalPages}
            </div>
            <div className="flex gap-2">
              {page > 1 && (
                <Link
                  href={`/admin/abstracts?page=${page - 1}${status ? `&status=${status}` : ''}${track ? `&track=${track}` : ''}`}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Previous
                </Link>
              )}
              {page < totalPages && (
                <Link
                  href={`/admin/abstracts?page=${page + 1}${status ? `&status=${status}` : ''}${track ? `&track=${track}` : ''}`}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Next
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

