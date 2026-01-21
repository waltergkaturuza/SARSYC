import React from 'react'
import { getPayloadClient } from '@/lib/payload'
import Link from 'next/link'
import { FiArrowLeft, FiMail, FiPhone, FiCalendar } from 'react-icons/fi'
import { notFound } from 'next/navigation'

export const revalidate = 0

export default async function PartnershipInquiryDetailPage({ params }: { params: { id: string } }) {
  const payload = await getPayloadClient()
  
  let inquiry: any = null

  try {
    inquiry = await payload.findByID({
      collection: 'partnership-inquiries',
      id: params.id,
      overrideAccess: true,
    })
  } catch (error: any) {
    console.error('Error fetching partnership inquiry:', error)
    notFound()
  }

  if (!inquiry) {
    notFound()
  }

  const statusConfig: Record<string, { color: string, label: string }> = {
    'new': { color: 'bg-blue-100 text-blue-700', label: 'New' },
    'contacted': { color: 'bg-yellow-100 text-yellow-700', label: 'Contacted' },
    'in-discussion': { color: 'bg-purple-100 text-purple-700', label: 'In Discussion' },
    'approved': { color: 'bg-green-100 text-green-700', label: 'Approved' },
    'declined': { color: 'bg-red-100 text-red-700', label: 'Declined' },
    'closed': { color: 'bg-gray-100 text-gray-700', label: 'Closed' },
  }

  const tierConfig: Record<string, string> = {
    'platinum': 'Platinum Sponsor',
    'gold': 'Gold Sponsor',
    'silver': 'Silver Sponsor',
    'bronze': 'Bronze Sponsor',
    'exhibitor': 'Exhibition Only',
    'custom': 'Custom Partnership',
  }

  const statusInfo = statusConfig[inquiry.status] || statusConfig['new']

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/admin/partnership-inquiries"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <FiArrowLeft />
          Back to Partnership Inquiries
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{inquiry.organizationName}</h1>
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 text-sm font-medium rounded-full ${statusInfo.color}`}>
            {statusInfo.label}
          </span>
          <span className="text-gray-500 text-sm">
            Submitted {new Date(inquiry.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Information */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Contact Information</h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Contact Person</label>
                <p className="text-gray-900 font-medium">{inquiry.contactPerson}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500 flex items-center gap-1">
                  <FiMail className="w-4 h-4" />
                  Email Address
                </label>
                <a href={`mailto:${inquiry.email}`} className="text-primary-600 hover:underline">
                  {inquiry.email}
                </a>
              </div>
              
              {inquiry.phone && (
                <div>
                  <label className="text-sm font-medium text-gray-500 flex items-center gap-1">
                    <FiPhone className="w-4 h-4" />
                    Phone Number
                  </label>
                  <a href={`tel:${inquiry.phone}`} className="text-primary-600 hover:underline">
                    {inquiry.phone}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Partnership Details */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Partnership Details</h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Partnership Interest</label>
                <p className="text-gray-900 font-medium">{tierConfig[inquiry.tier] || inquiry.tier}</p>
              </div>
              
              {inquiry.message && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Message</label>
                  <p className="text-gray-700 whitespace-pre-wrap mt-2 p-4 bg-gray-50 rounded-lg">
                    {inquiry.message}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Admin Notes */}
          {inquiry.adminNotes && (
            <div className="bg-yellow-50 rounded-lg border border-yellow-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Admin Notes</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{inquiry.adminNotes}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="font-bold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <a
                href={`mailto:${inquiry.email}?subject=Re: Partnership Inquiry - ${inquiry.organizationName}`}
                className="block w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-center text-sm font-medium"
              >
                Send Email
              </a>
              {inquiry.phone && (
                <a
                  href={`tel:${inquiry.phone}`}
                  className="block w-full px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 text-center text-sm font-medium"
                >
                  Call Partner
                </a>
              )}
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="font-bold text-gray-900 mb-4">Timeline</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <FiCalendar className="w-4 h-4 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Submitted</p>
                  <p className="text-xs text-gray-500">
                    {new Date(inquiry.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
              {inquiry.updatedAt !== inquiry.createdAt && (
                <div className="flex items-start gap-3">
                  <FiCalendar className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Last Updated</p>
                    <p className="text-xs text-gray-500">
                      {new Date(inquiry.updatedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
