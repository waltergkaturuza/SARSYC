import React from 'react'
import AbstractForm from '@/components/admin/forms/AbstractForm'

export default function NewAbstractPage() {
  return (
    <div className="container-custom py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Submit New Abstract</h1>
        <p className="text-gray-600 mt-2">Submit an abstract for the conference</p>
      </div>
      <AbstractForm mode="create" />
    </div>
  )
}

