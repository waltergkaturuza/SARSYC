import React from 'react'
import { getPayloadClient } from '@/lib/payload'
import { notFound, redirect } from 'next/navigation'
import { getCurrentUserFromCookies } from '@/lib/getCurrentUser'
import AbstractForm from '@/components/admin/forms/AbstractForm'

export const revalidate = 0

interface EditAbstractPageProps {
  params: {
    id: string
  }
}

export default async function EditAbstractPage({ params }: EditAbstractPageProps) {
  const currentUser = await getCurrentUserFromCookies()
  if (!currentUser) redirect('/login?type=admin&redirect=/admin/abstracts')
  if (currentUser.role !== 'admin' && currentUser.role !== 'editor') {
    redirect(`/admin/abstracts/${params.id}`)
  }

  const payload = await getPayloadClient()
  
  try {
    const abstract = await payload.findByID({
      collection: 'abstracts',
      id: params.id,
      depth: 2,
    })

    // Sanitize assignedReviewers so the form never sees invalid "0" (avoids Payload validation error when saving)
    const rawReviewers = abstract?.assignedReviewers ?? []
    const sanitizedReviewers = Array.isArray(rawReviewers)
      ? rawReviewers
          .map((r: any) => (typeof r === 'object' && r != null ? r.id : r))
          .filter((id: any) => {
            const s = String(id).trim()
            return s && s !== '0' && s !== '' && s !== 'null' && s !== 'undefined'
          })
      : []
    const initialData = {
      ...abstract,
      assignedReviewers: sanitizedReviewers,
    }

    return (
      <div className="container-custom py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Edit Abstract</h1>
          <p className="text-gray-600 mt-2">Update abstract information and review status</p>
        </div>
        <AbstractForm mode="edit" initialData={initialData} />
      </div>
    )
  } catch (error) {
    notFound()
  }
}



