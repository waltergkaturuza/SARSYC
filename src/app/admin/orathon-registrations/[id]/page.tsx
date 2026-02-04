import React from 'react'
import { getPayloadClient } from '@/lib/payload'
import Link from 'next/link'
import { FiArrowLeft, FiEdit, FiActivity } from 'react-icons/fi'
import OrathonRegistrationActionButtons from '@/components/admin/OrathonRegistrationActionButtons'

export const revalidate = 0

interface OrathonRegistrationDetailPageProps {
  params: {
    id: string
  }
}

export default async function AdminOrathonRegistrationDetailPage({
  params,
}: OrathonRegistrationDetailPageProps) {
  const payload = await getPayloadClient()

  const registration = await payload.findByID({
    collection: 'orathon-registrations',
    id: params.id,
  })

  if (!registration) {
    return (
      <div className="w-full py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Registration Not Found</h1>
          <Link href="/admin/orathon-registrations" className="text-primary-600 hover:underline">
            Back to Registrations
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full py-8">
      <div className="mb-6">
        <Link
          href="/admin/orathon-registrations"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <FiArrowLeft className="w-4 h-4" />
          Back to Registrations
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {registration.firstName} {registration.lastName}
            </h1>
            <p className="text-gray-600 mt-1">Orathon Registration Details</p>
          </div>
          <div className="flex items-center gap-3">
            <OrathonRegistrationActionButtons
              registrationId={registration.id}
              status={registration.status}
            />
            <Link
              href={`/admin/orathon-registrations/${params.id}/edit`}
              className="btn-primary flex items-center gap-2"
            >
              <FiEdit className="w-4 h-4" />
              Edit
            </Link>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Personal Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Personal Information</h2>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm font-medium text-gray-500">Full Name</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {registration.firstName} {registration.lastName}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Email</dt>
              <dd className="mt-1 text-sm text-gray-900">{registration.email}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Phone</dt>
              <dd className="mt-1 text-sm text-gray-900">{registration.phone}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Date of Birth</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {registration.dateOfBirth
                  ? new Date(registration.dateOfBirth).toLocaleDateString()
                  : '-'}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Gender</dt>
              <dd className="mt-1 text-sm text-gray-900 capitalize">{registration.gender}</dd>
            </div>
          </dl>
        </div>

        {/* Location */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Location</h2>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm font-medium text-gray-500">Country</dt>
              <dd className="mt-1 text-sm text-gray-900">{registration.country}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">City</dt>
              <dd className="mt-1 text-sm text-gray-900">{registration.city}</dd>
            </div>
          </dl>
        </div>

        {/* Emergency Contact */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Emergency Contact</h2>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm font-medium text-gray-500">Name</dt>
              <dd className="mt-1 text-sm text-gray-900">{registration.emergencyContactName}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Phone</dt>
              <dd className="mt-1 text-sm text-gray-900">{registration.emergencyContactPhone}</dd>
            </div>
          </dl>
        </div>

        {/* Fitness & Medical */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FiActivity className="w-5 h-5 text-primary-600" />
            Fitness & Medical Information
          </h2>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm font-medium text-gray-500">Fitness Level</dt>
              <dd className="mt-1">
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 capitalize">
                  {registration.fitnessLevel}
                </span>
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">T-Shirt Size</dt>
              <dd className="mt-1 text-sm text-gray-900 uppercase">{registration.tshirtSize}</dd>
            </div>
            {registration.medicalConditions && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Medical Conditions</dt>
                <dd className="mt-1 text-sm text-gray-900">{registration.medicalConditions}</dd>
              </div>
            )}
          </dl>
        </div>

        {/* Status & Admin */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:col-span-2">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Status & Admin</h2>
          <dl className="grid md:grid-cols-3 gap-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">Registration ID</dt>
              <dd className="mt-1 text-sm text-gray-900 font-mono">
                {registration.registrationId || '-'}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Status</dt>
              <dd className="mt-1">
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                    registration.status === 'confirmed'
                      ? 'bg-green-100 text-green-800'
                      : registration.status === 'cancelled'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {registration.status}
                </span>
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Registered</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {registration.createdAt
                  ? new Date(registration.createdAt).toLocaleString()
                  : '-'}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {registration.updatedAt
                  ? new Date(registration.updatedAt).toLocaleString()
                  : '-'}
              </dd>
            </div>
          </dl>
          {registration.notes && (
            <div className="mt-4">
              <dt className="text-sm font-medium text-gray-500 mb-2">Admin Notes</dt>
              <dd className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">
                {registration.notes}
              </dd>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
