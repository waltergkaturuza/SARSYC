import React from 'react'
import { getPayloadClient } from '@/lib/payload'
import ParticipantActions from '@/components/admin/ParticipantActions'

export const revalidate = 0

export default async function Page({ params }: any) {
  const { id } = params
  const payload = await getPayloadClient()

  const res = await payload.find({ collection: 'participants', where: { id: { equals: id } }, limit: 1 })
  const participant = res?.docs?.[0]
  if (!participant) return <div className="p-6">Participant not found</div>

  let registration = null
  if (participant.registration) {
    const r = await payload.find({ collection: 'registrations', where: { id: { equals: participant.registration } }, limit: 1 })
    registration = r?.docs?.[0]
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-2">Participant: {participant.firstName} {participant.lastName}</h1>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-medium">Details</h2>
          <dl className="mt-2 text-sm text-gray-700">
            <dt>Email</dt>
            <dd>{participant.email}</dd>
            <dt>Phone</dt>
            <dd>{participant.phone || '—'}</dd>
            <dt>Organization</dt>
            <dd>{participant.organization || '—'}</dd>
            <dt>Country</dt>
            <dd>{participant.country || '—'}</dd>
            <dt>Checked in</dt>
            <dd>{participant.checkedIn ? `Yes (${participant.checkedInAt || 'timestamp unknown'})` : 'No'}</dd>
            <dt>Badges printed</dt>
            <dd>{participant.badgesPrintedAt || 'No'}</dd>
          </dl>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-medium">Actions</h2>
          <ParticipantActions participantId={participant.id} adminId={process.env.ADMIN_USER_ID || ''} />
        </div>

        <div className="col-span-2 bg-white p-4 rounded shadow">
          <h2 className="text-lg font-medium">Registration</h2>
          {registration ? (
            <div className="mt-2 text-sm text-gray-700">
              <div><strong>ID:</strong> {registration.registrationId}</div>
              <div><strong>Status:</strong> {registration.status}</div>
              <div><strong>Payment:</strong> {registration.paymentStatus}</div>
            </div>
          ) : (
            <div className="mt-2 text-sm text-gray-700">No linked registration</div>
          )}
        </div>
      </div>
    </div>
  )
}
