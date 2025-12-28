import React from 'react'
import { redirect } from 'next/navigation'
import { getPayloadClient } from '@/lib/payload'
import { getCurrentUserFromCookies } from '@/lib/getCurrentUser'
import Link from 'next/link'
import { 
  FiUser, FiMail, FiPhone, FiShield, FiEdit, FiCalendar, FiBriefcase, FiLock, FiUnlock
} from 'react-icons/fi'
import UserUnlockButton from '@/components/admin/UserUnlockButton'

export const revalidate = 0

export default async function UserDetailPage({
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

    const roleConfig: Record<string, { color: string, label: string }> = {
      'admin': { color: 'bg-red-100 text-red-700', label: 'Admin' },
      'editor': { color: 'bg-blue-100 text-blue-700', label: 'Editor' },
      'contributor': { color: 'bg-green-100 text-green-700', label: 'Contributor' },
      'speaker': { color: 'bg-purple-100 text-purple-700', label: 'Speaker' },
      'presenter': { color: 'bg-indigo-100 text-indigo-700', label: 'Presenter' },
    }

    const roleInfo = roleConfig[user.role as string] || roleConfig['contributor']
    
    // Check if account is locked
    const isLocked = user.lockUntil && new Date(user.lockUntil as string) > new Date()
    const lockUntil = user.lockUntil ? new Date(user.lockUntil as string) : null

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Link href="/admin/users" className="text-primary-600 hover:text-primary-700 text-sm mb-2 inline-block">
              ← Back to Users
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">
              User Details
            </h1>
          </div>
          <div className="flex items-center gap-3">
            {isLocked && (
              <UserUnlockButton
                userId={params.id}
                isLocked={isLocked}
              />
            )}
            <Link
              href={`/admin/users/${params.id}/edit`}
              className="btn-primary flex items-center gap-2"
            >
              <FiEdit className="w-5 h-5" />
              Edit User
            </Link>
          </div>
        </div>

        {/* Locked Account Warning */}
        {isLocked && (
          <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <FiLock className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-orange-900 mb-1">Account Locked</h3>
                <p className="text-sm text-orange-700">
                  This account has been locked due to too many failed login attempts.
                  {lockUntil && (
                    <span className="block mt-1">
                      Locked until: {lockUntil.toLocaleString()}
                    </span>
                  )}
                </p>
                <p className="text-sm text-orange-600 mt-2">
                  Use the unlock button above to restore access to this account.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* User Information Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
              <FiUser className="w-10 h-10 text-primary-600" />
            </div>

            {/* User Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold text-gray-900">
                  {user.firstName} {user.lastName}
                </h2>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${roleInfo.color}`}>
                  {roleInfo.label}
                </span>
              </div>

              <div className="space-y-3 mt-4">
                <div className="flex items-center gap-3 text-gray-700">
                  <FiMail className="w-5 h-5 text-gray-400" />
                  <span>{user.email}</span>
                </div>

                {user.organization && (
                  <div className="flex items-center gap-3 text-gray-700">
                    <FiBriefcase className="w-5 h-5 text-gray-400" />
                    <span>{user.organization}</span>
                  </div>
                )}

                {user.phone && (
                  <div className="flex items-center gap-3 text-gray-700">
                    <FiPhone className="w-5 h-5 text-gray-400" />
                    <span>{user.phone}</span>
                  </div>
                )}

                <div className="flex items-center gap-3 text-gray-700">
                  <FiCalendar className="w-5 h-5 text-gray-400" />
                  <span>
                    Created: {new Date(user.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>

                {user.updatedAt && user.updatedAt !== user.createdAt && (
                  <div className="flex items-center gap-3 text-gray-700">
                    <FiCalendar className="w-5 h-5 text-gray-400" />
                    <span>
                      Last updated: {new Date(user.updatedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                )}

                {user.loginAttempts !== undefined && user.loginAttempts > 0 && (
                  <div className="flex items-center gap-3 text-gray-700">
                    <FiLock className="w-5 h-5 text-gray-400" />
                    <span>
                      Failed login attempts: {user.loginAttempts}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Role Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FiShield className="w-5 h-5" />
            Role & Permissions
          </h3>
          <div className="space-y-2">
            {user.role === 'admin' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="font-medium text-red-900 mb-2">Admin Role</p>
                <ul className="text-sm text-red-700 space-y-1">
                  <li>• Full access to all collections and settings</li>
                  <li>• Can create, edit, and delete any content</li>
                  <li>• Can manage other users and their roles</li>
                  <li>• Access to all admin features</li>
                </ul>
              </div>
            )}
            {user.role === 'editor' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="font-medium text-blue-900 mb-2">Editor Role</p>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Can create and edit content in all collections</li>
                  <li>• Can publish and manage content</li>
                  <li>• Cannot manage users or system settings</li>
                </ul>
              </div>
            )}
            {user.role === 'contributor' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="font-medium text-green-900 mb-2">Contributor Role</p>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Can create and edit their own content</li>
                  <li>• Limited editing permissions</li>
                  <li>• Cannot publish or manage other users' content</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  } catch (error: any) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
          <p className="text-red-700">User not found or you don't have permission to view this user.</p>
          <Link href="/admin/users" className="text-primary-600 hover:underline mt-2 inline-block">
            ← Back to Users
          </Link>
        </div>
      </div>
    )
  }
}

