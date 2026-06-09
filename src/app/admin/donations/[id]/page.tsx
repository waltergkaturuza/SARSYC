import React from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { FiArrowLeft, FiMail, FiPhone } from 'react-icons/fi'
import { getPayloadClient } from '@/lib/payload'
import { getCurrentUserFromCookies } from '@/lib/getCurrentUser'
import { isAdminRole } from '@/lib/admin/adminAccess'
import { conferenceTrackLabel } from '@/lib/conferenceTracks'
import DonationEditForm from '@/components/admin/DonationEditForm'
import DonationDeleteButton from '@/components/admin/DonationDeleteButton'

export const revalidate = 0

export default async function AdminDonationDetailPage({ params }: { params: { id: string } }) {
  const payload = await getPayloadClient()
  const currentUser = await getCurrentUserFromCookies()
  const canDelete = isAdminRole(currentUser?.role)

  let donation: Record<string, unknown> | null = null
  try {
    donation = await payload.findByID({
      collection: 'donations',
      id: params.id,
      overrideAccess: true,
    })
  } catch {
    notFound()
  }

  if (!donation) notFound()

  const donorName =
    (typeof donation.donorName === 'string' && donation.donorName) ||
    (typeof donation.orgName === 'string' && donation.orgName) ||
    `${donation.firstName || ''} ${donation.lastName || ''}`.trim() ||
    'Donor'

  return (
    <div>
      <Link
        href="/admin/donations"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
      >
        <FiArrowLeft />
        Back to Donations
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{donorName}</h1>
        <p className="text-gray-500 font-mono text-sm mt-1">{String(donation.donationId || '')}</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Donation details</h2>
            <dl className="grid sm:grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-gray-500">Type</dt>
                <dd className="font-medium capitalize">{String(donation.type || '—')}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Category</dt>
                <dd className="font-medium">{String(donation.categoryDisplay || '—')}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Amount</dt>
                <dd className="font-medium">
                  USD {typeof donation.amountUsd === 'number' ? donation.amountUsd.toLocaleString() : '—'}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">Payment method</dt>
                <dd className="font-medium capitalize">{String(donation.paymentMethod || '—')}</dd>
              </div>
              {donation.sponsorshipTierName ? (
                <div className="sm:col-span-2">
                  <dt className="text-gray-500">Package</dt>
                  <dd className="font-medium">{String(donation.sponsorshipTierName)}</dd>
                </div>
              ) : null}
              {donation.conferenceTrack ? (
                <div className="sm:col-span-2">
                  <dt className="text-gray-500">Track</dt>
                  <dd className="font-medium">
                    {conferenceTrackLabel(String(donation.conferenceTrack))}
                    {donation.studentsSponsored
                      ? ` — ${donation.studentsSponsored} students`
                      : ''}
                  </dd>
                </div>
              ) : null}
              {donation.message ? (
                <div className="sm:col-span-2">
                  <dt className="text-gray-500">Donor message</dt>
                  <dd className="font-medium whitespace-pre-wrap">{String(donation.message)}</dd>
                </div>
              ) : null}
            </dl>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Contact</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2 text-gray-700">
                <FiMail className="text-gray-400" />
                {String(donation.email || '—')}
              </div>
              {donation.phone ? (
                <div className="flex items-center gap-2 text-gray-700">
                  <FiPhone className="text-gray-400" />
                  {String(donation.phone)}
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <DonationEditForm
            donation={{
              id: donation.id as string | number,
              donationId: donation.donationId as string | undefined,
              paymentStatus: donation.paymentStatus as string | undefined,
              notes: donation.notes as string | undefined,
            }}
          />
          {canDelete && (
            <DonationDeleteButton
              donationId={String(donation.id)}
              label={String(donation.donationId || donorName)}
              redirectTo="/admin/donations"
              variant="button"
            />
          )}
        </div>
      </div>
    </div>
  )
}
