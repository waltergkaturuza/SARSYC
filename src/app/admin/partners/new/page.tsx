import React from 'react'
import PartnerForm from '@/components/admin/forms/PartnerForm'

export default function NewPartnerPage() {
  return (
    <div className="container-custom py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Add New Partner</h1>
        <p className="text-gray-600 mt-2">Add a new partner or sponsor to the conference</p>
      </div>
      <PartnerForm mode="create" />
    </div>
  )
}



