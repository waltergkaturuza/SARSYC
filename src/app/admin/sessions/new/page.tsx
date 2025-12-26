import React from 'react'
import { getPayloadClient } from '@/lib/payload'
import SessionForm from '@/components/admin/forms/SessionForm'

export const revalidate = 0

export default async function NewSessionPage() {
  const payload = await getPayloadClient()
  
  // Fetch speakers and abstracts for form
  const [speakersResult, abstractsResult] = await Promise.all([
    payload.find({ collection: 'speakers', limit: 100 }),
    payload.find({ 
      collection: 'abstracts', 
      where: { status: { equals: 'accepted' } },
      limit: 100 
    }),
  ])

  return (
    <div className="container-custom py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Add New Session</h1>
        <p className="text-gray-600 mt-2">Create a new conference session</p>
      </div>
      <SessionForm 
        mode="create" 
        speakers={speakersResult.docs}
        abstracts={abstractsResult.docs}
      />
    </div>
  )
}

