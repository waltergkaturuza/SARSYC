import React from 'react'
import ResourceForm from '@/components/admin/forms/ResourceForm'

export default function NewResourcePage() {
  return (
    <div className="container-custom py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Add New Resource</h1>
        <p className="text-gray-600 mt-2">Upload a new resource to the library</p>
      </div>
      <ResourceForm mode="create" />
    </div>
  )
}

