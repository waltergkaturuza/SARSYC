import React from 'react'
import { getPayloadClient } from '@/lib/payload'
import { notFound } from 'next/navigation'
import NewsForm from '@/components/admin/forms/NewsForm'

export const revalidate = 0

interface EditNewsPageProps {
  params: {
    id: string
  }
}

export default async function EditNewsPage({ params }: EditNewsPageProps) {
  const payload = await getPayloadClient()
  
  try {
    const [article, usersResult] = await Promise.all([
      payload.findByID({
        collection: 'news',
        id: params.id,
        depth: 2,
      }),
      payload.find({
        collection: 'users',
        limit: 100,
      }),
    ])

    return (
      <div className="container-custom py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Edit Article</h1>
          <p className="text-gray-600 mt-2">Update article content and settings</p>
        </div>
        <NewsForm mode="edit" initialData={article} users={usersResult.docs} />
      </div>
    )
  } catch (error) {
    notFound()
  }
}



