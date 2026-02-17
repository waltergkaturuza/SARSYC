import React from 'react'
import { getPayloadClient } from '@/lib/payload'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { FiArrowLeft, FiMail, FiPhone, FiMapPin, FiUser } from 'react-icons/fi'

export const revalidate = 0

interface VolunteerDetailPageProps {
  params: {
    id: string
  }
}

export default async function VolunteerDetailPage({ params }: VolunteerDetailPageProps) {
  const payload = await getPayloadClient()

  let volunteer: any
  try {
    volunteer = await payload.findByID({
      collection: 'volunteers',
      id: params.id,
      depth: 2,
    })
  } catch (e) {
    return notFound()
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <Link
          href="/admin/volunteers"
          className="inline-flex items-center text-gray-600 hover:text-gray-900"
        >
          <FiArrowLeft className="w-5 h-5 mr-2" />
          Back to Volunteers
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-primary-600 to-secondary-600 p-6 text-white">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <FiUser className="w-7 h-7" />
                </div>
                <div>
                  <div className="text-sm text-white/80">Volunteer ID</div>
                  <div className="text-xl font-mono font-semibold">
                    {volunteer.volunteerId || 'N/A'}
                  </div>
                </div>
              </div>
              <h1 className="text-2xl font-bold">
                {volunteer.firstName} {volunteer.lastName}
              </h1>
              <div className="mt-2 flex flex-wrap gap-3 text-sm text-white/90">
                {volunteer.email && (
                  <span className="inline-flex items-center gap-1">
                    <FiMail className="w-4 h-4" />
                    {volunteer.email}
                  </span>
                )}
                {volunteer.phone && (
                  <span className="inline-flex items-center gap-1">
                    <FiPhone className="w-4 h-4" />
                    {volunteer.phone}
                  </span>
                )}
                {volunteer.country && (
                  <span className="inline-flex items-center gap-1">
                    <FiMapPin className="w-4 h-4" />
                    {volunteer.country}, {volunteer.city}
                  </span>
                )}
              </div>
            </div>
            <div className="text-right text-sm">
              <div className="font-medium">Status</div>
              <div className="mt-1 inline-flex px-3 py-1 rounded-full bg-white/10">
                {volunteer.status || 'pending'}
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 grid gap-6 md:grid-cols-2">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              Personal Information
            </h2>
            <dl className="space-y-2 text-sm text-gray-700">
              <div>
                <dt className="font-medium">Full Name</dt>
                <dd>
                  {volunteer.firstName} {volunteer.lastName}
                </dd>
              </div>
              <div>
                <dt className="font-medium">Email</dt>
                <dd>{volunteer.email}</dd>
              </div>
              <div>
                <dt className="font-medium">Phone</dt>
                <dd>{volunteer.phone}</dd>
              </div>
              <div>
                <dt className="font-medium">Location</dt>
                <dd>
                  {volunteer.city}, {volunteer.country}
                </dd>
              </div>
            </dl>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              Volunteer Preferences
            </h2>
            <dl className="space-y-2 text-sm text-gray-700">
              <div>
                <dt className="font-medium">Preferred Roles</dt>
                <dd>
                  {Array.isArray(volunteer.preferredRoles) && volunteer.preferredRoles.length
                    ? volunteer.preferredRoles.join(', ')
                    : '—'}
                </dd>
              </div>
              <div>
                <dt className="font-medium">Available Days</dt>
                <dd>
                  {volunteer.availability?.days?.length
                    ? volunteer.availability.days.join(', ')
                    : '—'}
                </dd>
              </div>
              <div>
                <dt className="font-medium">Time Preference</dt>
                <dd>{volunteer.availability?.timePreference || '—'}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  )
}

