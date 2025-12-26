import React from 'react'
import { getPayloadClient } from '@/lib/payload'
import { notFound } from 'next/navigation'
import AbstractForm from '@/components/admin/forms/AbstractForm'

export const revalidate = 0

interface EditAbstractPageProps {
  params: {
    id: string
  }
}

export default async function EditAbstractPage({ params }: EditAbstractPageProps) {
  const payload = await getPayloadClient()
  
  try {
    const abstract = await payload.findByID({
      collection: 'abstracts',
      id: params.id,
      depth: 2,
    })

    return (
      <div className="container-custom py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Edit Abstract</h1>
          <p className="text-gray-600 mt-2">Update abstract information and review status</p>
        </div>
        <AbstractForm mode="edit" initialData={abstract} />
      </div>
    )
  } catch (error) {
    notFound()
  }
}


