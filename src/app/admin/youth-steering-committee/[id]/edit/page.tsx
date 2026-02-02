import React from 'react'
import { getPayloadClient } from '@/lib/payload'
import { notFound } from 'next/navigation'
import YouthSteeringCommitteeForm from '@/components/admin/forms/YouthSteeringCommitteeForm'

export const revalidate = 0

export default async function EditCommitteeMemberPage({
  params,
}: {
  params: { id: string }
}) {
  const payload = await getPayloadClient()

  let member: any = null

  try {
    const result = await payload.findByID({
      collection: 'youth-steering-committee',
      id: params.id,
      depth: 2,
      overrideAccess: true,
    })
    member = result
  } catch (error: any) {
    console.error('Error fetching committee member:', error)
    notFound()
  }

  if (!member) {
    notFound()
  }

  return (
    <div className="container-custom py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Edit Committee Member</h1>
        <p className="text-gray-600 mt-2">Update {member.name}'s profile information</p>
      </div>
      <YouthSteeringCommitteeForm mode="edit" initialData={member} />
    </div>
  )
}
