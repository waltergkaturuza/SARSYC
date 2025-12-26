import React from 'react'
import { redirect } from 'next/navigation'
import { getCurrentUserFromCookies } from '@/lib/getCurrentUser'
import UserForm from '@/components/admin/forms/UserForm'

export default async function NewUserPage() {
  // Check authentication
  const user = await getCurrentUserFromCookies()
  
  if (!user || user.role !== 'admin') {
    redirect('/login?type=admin&redirect=/admin/users/new')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Add New User</h1>
        <p className="text-gray-600 mt-2">Create a new admin user account</p>
      </div>
      <UserForm mode="create" />
    </div>
  )
}

