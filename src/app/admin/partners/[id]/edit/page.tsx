import React from 'react'
import { getPayloadClient } from '@/lib/payload'
import { notFound } from 'next/navigation'
import PartnerForm from '@/components/admin/forms/PartnerForm'

export const revalidate = 0

interface EditPartnerPageProps {
  params: {
    id: string
  }
}

export default async function EditPartnerPage({ params }: EditPartnerPageProps) {
  const payload = await getPayloadClient()
  
  try {
    const partner = await payload.findByID({
      collection: 'partners',
      id: params.id,
      depth: 2,
    })

    return (
      <div className="container-custom py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Edit Partner</h1>
          <p className="text-gray-600 mt-2">Update partner information</p>
        </div>
        <PartnerForm mode="edit" initialData={partner} />
      </div>
    )
  } catch (error) {
    notFound()
  }
}



