import React from 'react'
import { getPayloadClient } from '@/lib/payload'
import { notFound } from 'next/navigation'
import SessionForm from '@/components/admin/forms/SessionForm'

export const revalidate = 0

interface EditSessionPageProps {
  params: {
    id: string
  }
}

export default async function EditSessionPage({ params }: EditSessionPageProps) {
  const payload = await getPayloadClient()
  
  try {
    const [session, speakersResult, abstractsResult] = await Promise.all([
      payload.findByID({
        collection: 'sessions',
        id: params.id,
        depth: 2,
      }),
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
          <h1 className="text-3xl font-bold text-gray-900">Edit Session</h1>
          <p className="text-gray-600 mt-2">Update session information</p>
        </div>
        <SessionForm 
          mode="edit" 
          initialData={session}
          speakers={speakersResult.docs}
          abstracts={abstractsResult.docs}
        />
      </div>
    )
  } catch (error) {
    notFound()
  }
}



