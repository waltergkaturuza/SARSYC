import React from 'react'
import { getPayloadClient } from '@/lib/payload'
import SessionForm from '@/components/admin/forms/SessionForm'
import { ensureYouthSteeringCommitteeLatestColumns } from '@/lib/ensureYouthSteeringCommitteeSchema'
import { seedYouthSteeringCommitteeFromStatic } from '@/lib/seedYouthSteeringCommittee'

export const revalidate = 0

export default async function NewSessionPage() {
  const payload = await getPayloadClient()

  const [speakersResult, abstractsResult] = await Promise.all([
    payload.find({ collection: 'speakers', limit: 300, sort: 'name', depth: 0 }),
    payload.find({
      collection: 'abstracts',
      where: { status: { equals: 'accepted' } },
      limit: 100,
      depth: 0,
    }),
  ])

  let committeeMembers: any[] = []
  try {
    await ensureYouthSteeringCommitteeLatestColumns(payload)
    let committeeResult = await payload.find({
      collection: 'youth-steering-committee',
      limit: 100,
      sort: 'order',
      depth: 0,
    })
    if (committeeResult.totalDocs === 0) {
      await seedYouthSteeringCommitteeFromStatic(payload)
      committeeResult = await payload.find({
        collection: 'youth-steering-committee',
        limit: 100,
        sort: 'order',
        depth: 0,
      })
    }
    committeeMembers = committeeResult.docs
  } catch (error) {
    console.error('Failed to load youth steering committee for session form:', error)
  }

  return (
    <div className="container-custom py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Add New Session</h1>
        <p className="text-gray-600 mt-2">Create a new conference session</p>
      </div>
      <SessionForm
        mode="create"
        speakers={speakersResult.docs}
        committeeMembers={committeeMembers}
        abstracts={abstractsResult.docs}
      />
    </div>
  )
}
