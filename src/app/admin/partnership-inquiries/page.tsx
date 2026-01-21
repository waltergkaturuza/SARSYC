import React from 'react'
import { getPayloadClient } from '@/lib/payload'
import Link from 'next/link'
import { FiEye, FiMail, FiPhone } from 'react-icons/fi'

export const revalidate = 0

export default async function PartnershipInquiriesPage() {
  const payload = await getPayloadClient()
  
  let inquiries: any[] = []
  let totalDocs = 0

  try {
    const results = await payload.find({
      collection: 'partnership-inquiries',
      limit: 100,
      sort: '-createdAt',
      overrideAccess: true,
    })

    inquiries = results.docs
    totalDocs = results.totalDocs
  } catch (error: any) {
    console.error('Error fetching partnership inquiries:', error)
    inquiries = []
    totalDocs = 0
  }

  const statusConfig: Record<string, { color: string, label: string }> = {
    'new': { color: 'bg-blue-100 text-blue-700', label: 'New' },
    'contacted': { color: 'bg-yellow-100 text-yellow-700', label: 'Contacted' },
    'in-discussion': { color: 'bg-purple-100 text-purple-700', label: 'In Discussion' },
    'approved': { color: 'bg-green-100 text-green-700', label: 'Approved' },
    'declined': { color: 'bg-red-100 text-red-700', label: 'Declined' },
    'closed': { color: 'bg-gray-100 text-gray-700', label: 'Closed' },
  }

  const tierConfig: Record<string, { color: string, label: string }> = {
    'platinum': { color: 'bg-purple-100 text-purple-700', label: 'Platinum' },
    'gold': { color: 'bg-yellow-100 text-yellow-700', label: 'Gold' },
    'silver': { color: 'bg-gray-100 text-gray-700', label: 'Silver' },
    'bronze': { color: 'bg-orange-100 text-orange-700', label: 'Bronze' },
    'exhibitor': { color: 'bg-blue-100 text-blue-700', label: 'Exhibitor' },
    'custom': { color: 'bg-green-100 text-green-700', label: 'Custom' },
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Partnership Inquiries</h1>
        <p className="text-gray-600">Manage partnership and sponsorship requests</p>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Total Inquiries</p>
          <p className="text-3xl font-bold text-gray-900">{totalDocs}</p>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">New</p>
          <p className="text-3xl font-bold text-blue-600">
            {inquiries.filter(i => i.status === 'new').length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">In Discussion</p>
          <p className="text-3xl font-bold text-purple-600">
            {inquiries.filter(i => i.status === 'in-discussion').length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Approved</p>
          <p className="text-3xl font-bold text-green-600">
            {inquiries.filter(i => i.status === 'approved').length}
          </p>
        </div>
      </div>

      {/* Inquiries List */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">All Partnership Inquiries</h2>
        </div>

        {inquiries.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-600">No partnership inquiries yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Organization
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact Person
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Interest
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {inquiries.map((inquiry: any) => {
                  const statusInfo = statusConfig[inquiry.status] || statusConfig['new']
                  const tierInfo = tierConfig[inquiry.tier] || { color: 'bg-gray-100 text-gray-700', label: inquiry.tier }
                  
                  return (
                    <tr key={inquiry.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{inquiry.organizationName}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{inquiry.contactPerson}</div>
                        <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                          <FiMail className="w-3 h-3" />
                          {inquiry.email}
                        </div>
                        {inquiry.phone && (
                          <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                            <FiPhone className="w-3 h-3" />
                            {inquiry.phone}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${tierInfo.color}`}>
                          {tierInfo.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(inquiry.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/admin/partnership-inquiries/${inquiry.id}`}
                          className="text-primary-600 hover:text-primary-700"
                          title="View Details"
                        >
                          <FiEye className="w-5 h-5 inline" />
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
