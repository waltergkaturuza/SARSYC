import React from 'react'
import YouthSteeringCommitteeForm from '@/components/admin/forms/YouthSteeringCommitteeForm'

export default function NewCommitteeMemberPage() {
  return (
    <div className="container-custom py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Add New Committee Member</h1>
        <p className="text-gray-600 mt-2">Create a new Youth Steering Committee member profile</p>
      </div>
      <YouthSteeringCommitteeForm mode="create" />
    </div>
  )
}
