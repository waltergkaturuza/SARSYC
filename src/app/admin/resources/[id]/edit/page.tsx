import React from 'react'
import { getPayloadClient } from '@/lib/payload'
import { notFound } from 'next/navigation'
import ResourceForm from '@/components/admin/forms/ResourceForm'

export const revalidate = 0

interface EditResourcePageProps {
  params: {
    id: string
  }
}

export default async function EditResourcePage({ params }: EditResourcePageProps) {
  const payload = await getPayloadClient()
  
  try {
    const resource = await payload.findByID({
      collection: 'resources',
      id: params.id,
      depth: 2,
    })

    return (
      <div className="container-custom py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Edit Resource</h1>
          <p className="text-gray-600 mt-2">Update resource information and metadata</p>
        </div>
        <ResourceForm mode="edit" initialData={resource} />
      </div>
    )
  } catch (error) {
    notFound()
  }
}



