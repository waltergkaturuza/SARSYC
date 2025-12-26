import React from 'react'
import { redirect } from 'next/navigation'
import { getPayloadClient } from '@/lib/payload'
import { getCurrentUserFromCookies } from '@/lib/getCurrentUser'
import UserForm from '@/components/admin/forms/UserForm'

export const revalidate = 0

export default async function EditUserPage({
  params,
}: {
  params: { id: string }
}) {
  // Check authentication
  const currentUser = await getCurrentUserFromCookies()
  
  if (!currentUser || currentUser.role !== 'admin') {
    redirect('/login?type=admin&redirect=/admin/users')
  }

  const payload = await getPayloadClient()

  try {
    const user = await payload.findByID({
      collection: 'users',
      id: params.id,
    })

    // Remove sensitive fields
    const { hash, salt, resetPasswordToken, resetPasswordExpiration, password, ...safeUser } = user as any

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit User</h1>
          <p className="text-gray-600 mt-2">
            Update user information and permissions for {user.firstName} {user.lastName}
          </p>
        </div>
        <UserForm mode="edit" initialData={safeUser} />
      </div>
    )
  } catch (error: any) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
          <p className="text-red-700">User not found or you don't have permission to edit this user.</p>
        </div>
      </div>
    )
  }
}

