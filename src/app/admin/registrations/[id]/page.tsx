import React from 'react'
import { getPayloadClient } from '@/lib/payload'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { FiEdit, FiArrowLeft, FiMail, FiPhone, FiMapPin, FiBuilding, FiCheckCircle, FiXCircle, FiClock, FiDownload } from 'react-icons/fi'
import { format } from 'date-fns'
import { ApproveButton, RejectButton } from '@/components/admin/RegistrationActions'

export const revalidate = 0

interface RegistrationDetailPageProps {
  params: {
    id: string
  }
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
}

const paymentColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-green-100 text-green-800',
  waived: 'bg-blue-100 text-blue-800',
  failed: 'bg-red-100 text-red-800',
}

const categoryLabels: Record<string, string> = {
  student: 'Student/Youth Delegate',
  researcher: 'Young Researcher',
  policymaker: 'Policymaker/Government Official',
  partner: 'Development Partner',
  observer: 'Observer',
}

export default async function RegistrationDetailPage({ params }: RegistrationDetailPageProps) {
  const payload = await getPayloadClient()
  
  try {
    const registration = await payload.findByID({
      collection: 'registrations',
      id: params.id,
      depth: 2,
    })

    return (
      <div className="container-custom py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/admin/registrations" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
            <FiArrowLeft className="w-5 h-5" />
            <span>Back to Registrations</span>
          </Link>
          <div className="flex gap-3">
            <Link href={`/admin/registrations/${params.id}/edit`} className="btn-primary flex items-center gap-2">
              <FiEdit className="w-5 h-5" />
              Edit Registration
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Registration Header */}
          <div className="bg-gradient-to-r from-primary-600 to-secondary-600 p-8 text-white">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-16 h-16 bg-white/20 rounded-lg flex items-center justify-center">
                    <FiCheckCircle className="w-8 h-8" />
                  </div>
                  <div>
                    <div className="text-sm text-white/80 mb-1">Registration ID</div>
                    <div className="text-2xl font-bold font-mono">{registration.registrationId || 'N/A'}</div>
                  </div>
                </div>
                <h1 className="text-3xl font-bold mb-4">
                  {registration.firstName} {registration.lastName}
                </h1>
                <div className="flex items-center gap-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    statusColors[registration.status] || 'bg-gray-100 text-gray-800'
                  }`}>
                    {registration.status?.charAt(0).toUpperCase() + registration.status?.slice(1) || 'Pending'}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    paymentColors[registration.paymentStatus] || 'bg-gray-100 text-gray-800'
                  }`}>
                    Payment: {registration.paymentStatus?.charAt(0).toUpperCase() + registration.paymentStatus?.slice(1) || 'Pending'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-8 space-y-8">
            {/* Contact Information */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Contact Information</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  <FiMail className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Email</div>
                    <div className="font-medium text-gray-900">{registration.email}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  <FiPhone className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Phone</div>
                    <div className="font-medium text-gray-900">{registration.phone || 'N/A'}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  <FiMapPin className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Country</div>
                    <div className="font-medium text-gray-900">{registration.country || 'N/A'}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  <FiBuilding className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Organization</div>
                    <div className="font-medium text-gray-900">{registration.organization || 'N/A'}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Registration Details */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Registration Details</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-500 mb-1">Participation Category</div>
                  <div className="font-medium text-gray-900">
                    {categoryLabels[registration.category] || registration.category || 'N/A'}
                  </div>
                </div>

                {registration.dietaryRestrictions && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-500 mb-1">Dietary Restrictions</div>
                    <div className="font-medium text-gray-900">
                      {Array.isArray(registration.dietaryRestrictions)
                        ? registration.dietaryRestrictions.join(', ')
                        : registration.dietaryRestrictions}
                    </div>
                  </div>
                )}

                {registration.tshirtSize && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-500 mb-1">T-Shirt Size</div>
                    <div className="font-medium text-gray-900 uppercase">{registration.tshirtSize}</div>
                  </div>
                )}

                {registration.accessibilityNeeds && (
                  <div className="p-4 bg-gray-50 rounded-lg md:col-span-2">
                    <div className="text-sm text-gray-500 mb-1">Accessibility Requirements</div>
                    <div className="font-medium text-gray-900">{registration.accessibilityNeeds}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Status & Actions */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Review & Actions</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Registration Status</div>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      statusColors[registration.status] || 'bg-gray-100 text-gray-800'
                    }`}>
                      {registration.status === 'confirmed' && <FiCheckCircle className="w-4 h-4 mr-1" />}
                      {registration.status === 'cancelled' && <FiXCircle className="w-4 h-4 mr-1" />}
                      {registration.status === 'pending' && <FiClock className="w-4 h-4 mr-1" />}
                      {registration.status?.charAt(0).toUpperCase() + registration.status?.slice(1) || 'Pending'}
                    </span>
                  </div>
                  <div className="flex gap-3">
                    {registration.status !== 'confirmed' && (
                      <ApproveButton registrationId={registration.id} />
                    )}
                    {registration.status !== 'cancelled' && (
                      <RejectButton registrationId={registration.id} />
                    )}
                  </div>
                </div>

                {registration.notes && (
                  <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
                    <div className="text-sm text-gray-500 mb-2">Admin Notes</div>
                    <div className="text-gray-900 whitespace-pre-wrap">{registration.notes}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Tracking Information */}
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Application Tracking</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Registration ID:</span>
                  <code className="px-3 py-1 bg-white border border-gray-300 rounded font-mono text-sm font-bold text-primary-600">
                    {registration.registrationId || 'N/A'}
                  </code>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Submitted:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {registration.createdAt ? format(new Date(registration.createdAt), 'PPpp') : 'N/A'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Last Updated:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {registration.updatedAt ? format(new Date(registration.updatedAt), 'PPpp') : 'N/A'}
                  </span>
                </div>
                {registration.deletedAt && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-red-600">Deleted:</span>
                    <span className="text-sm font-medium text-red-600">
                      {format(new Date(registration.deletedAt), 'PPpp')}
                    </span>
                  </div>
                )}
              </div>
              <div className="mt-4 p-4 bg-white rounded border border-primary-200">
                <p className="text-sm text-gray-700">
                  <strong>Applicants can track their registration</strong> using the Registration ID shown above. 
                  They can use this ID on the public website to check their application status.
                </p>
              </div>
            </div>

            {/* Metadata */}
            <div className="pt-6 border-t border-gray-200">
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Registration ID:</span>{' '}
                  <code className="px-2 py-1 bg-gray-100 rounded font-mono text-primary-600 font-bold">
                    {registration.registrationId || 'N/A'}
                  </code>
                </div>
                <div>
                  <span className="text-gray-500">Record ID:</span>{' '}
                  <span className="text-gray-900 font-mono text-xs">{registration.id}</span>
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

