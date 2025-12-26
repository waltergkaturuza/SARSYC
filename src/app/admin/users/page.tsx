import React from 'react'
import { redirect } from 'next/navigation'
import { getPayloadClient } from '@/lib/payload'
import { getCurrentUserFromCookies } from '@/lib/getCurrentUser'
import Link from 'next/link'
import UserDeleteButton from '@/components/admin/UserDeleteButton'
import { 
  FiUsers, FiPlus, FiEdit, FiEye, FiSearch, FiShield, FiUser, FiMail, FiPhone
} from 'react-icons/fi'

export const revalidate = 0

interface SearchParams {
  page?: string
  role?: string
  search?: string
}

export default async function UsersManagementPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  // Check authentication
  const currentUser = await getCurrentUserFromCookies()
  
  if (!currentUser || currentUser.role !== 'admin') {
    redirect('/login?type=admin&redirect=/admin/users')
  }

  const payload = await getPayloadClient()
  
  const page = Number(searchParams.page || 1)
  const perPage = 20
  const role = searchParams.role
  const search = searchParams.search

  // Build where clause
  const where: any = {}
  
  if (role && role !== 'all') {
    where.role = { equals: role }
  }
  
  if (search) {
    where.or = [
      { email: { contains: search } },
      { firstName: { contains: search } },
      { lastName: { contains: search } },
      { organization: { contains: search } },
    ]
  }

  const results = await payload.find({
    collection: 'users',
    where,
    limit: perPage,
    page,
    sort: '-createdAt',
  })

  const users = results.docs
  const totalPages = results.totalPages
  const totalDocs = results.totalDocs

  const roleConfig: Record<string, { color: string, label: string, icon: any }> = {
    'admin': { color: 'bg-red-100 text-red-700', label: 'Admin', icon: FiShield },
    'editor': { color: 'bg-blue-100 text-blue-700', label: 'Editor', icon: FiEdit },
    'contributor': { color: 'bg-green-100 text-green-700', label: 'Contributor', icon: FiUser },
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-1">Manage admin users, roles, and permissions</p>
        </div>
        <Link href="/admin/users/new" className="btn-primary flex items-center gap-2">
          <FiPlus className="w-5 h-5" />
          Add User
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <form method="get" className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                name="search"
                defaultValue={search}
                placeholder="Search by name, email, or organization..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          {/* Role Filter */}
          <div>
            <select
              name="role"
              defaultValue={role || 'all'}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="editor">Editor</option>
              <option value="contributor">Contributor</option>
            </select>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Filter
          </button>

          {/* Clear Filters */}
          {(search || (role && role !== 'all')) && (
            <Link
              href="/admin/users"
              className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center"
            >
              Clear
            </Link>
          )}
        </form>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <p className="text-sm text-gray-600">
            Showing {users.length} of {totalDocs} users
          </p>
        </div>

        {users.length === 0 ? (
          <div className="p-12 text-center">
            <FiUsers className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Organization</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user: any) => {
                  const roleInfo = roleConfig[user.role] || roleConfig['contributor']
                  const RoleIcon = roleInfo.icon
                  
                  return (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                            <FiUser className="w-5 h-5 text-primary-600" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {user.firstName} {user.lastName}
                            </div>
                            {user.phone && (
                              <div className="text-sm text-gray-500 flex items-center gap-1">
                                <FiPhone className="w-3 h-3" />
                                {user.phone}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <FiMail className="w-4 h-4 mr-2 text-gray-400" />
                          {user.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${roleInfo.color}`}>
                          <RoleIcon className="w-3 h-3" />
                          {roleInfo.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.organization || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/users/${user.id}`}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <FiEye className="w-4 h-4" />
                          </Link>
                          <Link
                            href={`/admin/users/${user.id}/edit`}
                            className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                            title="Edit User"
                          >
                            <FiEdit className="w-4 h-4" />
                          </Link>
                          {user.id !== currentUser.id && (
                            <UserDeleteButton
                              userId={user.id}
                              userName={`${user.firstName} ${user.lastName}`}
                            />
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Page {page} of {totalPages}
            </div>
            <div className="flex gap-2">
              {page > 1 && (
                <Link
                  href={`/admin/users?page=${page - 1}${role ? `&role=${role}` : ''}${search ? `&search=${search}` : ''}`}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Previous
                </Link>
              )}
              {page < totalPages && (
                <Link
                  href={`/admin/users?page=${page + 1}${role ? `&role=${role}` : ''}${search ? `&search=${search}` : ''}`}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Next
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

