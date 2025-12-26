import React from 'react'
import SpeakerForm from '@/components/admin/forms/SpeakerForm'

export default function NewSpeakerPage() {
  return (
    <div className="container-custom py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Add New Speaker</h1>
        <p className="text-gray-600 mt-2">Create a new speaker profile for the conference</p>
      </div>
      <SpeakerForm mode="create" />
    </div>
  )
}

