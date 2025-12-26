import React from 'react'
import { getPayloadClient } from '@/lib/payload'
import { notFound } from 'next/navigation'
import SpeakerForm from '@/components/admin/forms/SpeakerForm'

export const revalidate = 0

interface EditSpeakerPageProps {
  params: {
    id: string
  }
}

export default async function EditSpeakerPage({ params }: EditSpeakerPageProps) {
  const payload = await getPayloadClient()
  
  try {
    const speaker = await payload.findByID({
      collection: 'speakers',
      id: params.id,
    })

    return (
      <div className="container-custom py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Edit Speaker</h1>
          <p className="text-gray-600 mt-2">Update speaker profile information</p>
        </div>
        <SpeakerForm mode="edit" initialData={speaker} />
      </div>
    )
  } catch (error) {
    notFound()
  }
}

