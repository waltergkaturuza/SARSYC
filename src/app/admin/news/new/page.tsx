import React from 'react'
import { getPayloadClient } from '@/lib/payload'
import NewsForm from '@/components/admin/forms/NewsForm'

export const revalidate = 0

export default async function NewNewsPage() {
  const payload = await getPayloadClient()
  
  // Fetch users for author selection
  const usersResult = await payload.find({
    collection: 'users',
    limit: 100,
  })

  return (
    <div className="container-custom py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create New Article</h1>
        <p className="text-gray-600 mt-2">Write and publish a news article</p>
      </div>
      <NewsForm mode="create" users={usersResult.docs} />
    </div>
  )
}

