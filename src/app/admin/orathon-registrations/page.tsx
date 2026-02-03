import React from 'react'
import { getPayloadClient } from '@/lib/payload'
import Link from 'next/link'
import { FiFilter, FiActivity, FiDownload } from 'react-icons/fi'

export const revalidate = 0

interface OrathonRegistrationsPageProps {
  searchParams: {
    page?: string
    limit?: string
    status?: string
    search?: string
  }
}

export default async function AdminOrathonRegistrationsPage({ searchParams }: OrathonRegistrationsPageProps) {
  const payload = await getPayloadClient()

  const page = Number(searchParams.page || '1')
  const limit = Number(searchParams.limit || '25')
  const statusFilter = searchParams.status || 'all'
  const searchQuery = searchParams.search || ''

  const where: any = {}

  if (statusFilter !== 'all') {
    where.status = { equals: statusFilter }
  }

  if (searchQuery) {
    where.or = [
      { firstName: { contains: searchQuery } },
      { lastName: { contains: searchQuery } },
      { email: { contains: searchQuery } },
    ]
  }

  let docs: any[] = []
  let total = 0
  let totalPages = 1
  let dbError: string | null = null

  try {
    const results = await payload.find({
      collection: 'orathon-registrations',
      where,
      limit,
      page,
      sort: '-createdAt',
    })
    docs = results.docs || []
    total = results.totalDocs || 0
    totalPages = results.totalPages || 1
  } catch (err: any) {
    console.error('[admin/orathon-registrations] Query failed:', err)
    dbError = err?.message || err?.cause?.message || 'Database query failed'
  }

  if (dbError) {
    return (
      <div className="w-full py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Orathon Registrations</h1>
          <p className="text-gray-600 mt-2">Manage registrations for the Orathon Marathon Activity (Day 4)</p>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-amber-900 mb-2">Setup required</h2>
          <p className="text-amber-800 mb-4">
            The Orathon registrations table is missing or has the wrong schema. This usually means the database
            migration has not been run yet.
          </p>
          <p className="text-sm text-amber-800 mb-2">Error: {dbError}</p>
          <p className="text-sm text-amber-800 mb-4">
            <strong>Fix:</strong> Run the SQL migration on your database (e.g. in Neon SQL Editor):
          </p>
          <ol className="list-decimal list-inside text-sm text-amber-800 space-y-1 mb-4">
            <li>If the table does not exist yet: run <code className="bg-amber-100 px-1 rounded">scripts/create_orathon_registrations_table.sql</code></li>
            <li>If the table exists but has camelCase columns: run <code className="bg-amber-100 px-1 rounded">scripts/fix_orathon_registrations_columns.sql</code></li>
          </ol>
          <Link
            href="/admin/dashboard"
            className="inline-flex items-center gap-2 text-amber-900 font-medium hover:underline"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <FiActivity className="w-8 h-8 text-primary-600" />
          <h1 className="text-3xl font-bold text-gray-900">Orathon Registrations</h1>
        </div>
        <p className="text-gray-600 mt-2">Manage registrations for the Orathon Marathon Activity (Day 4)</p>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-sm text-gray-600 mb-1">Total Registrations</div>
          <div className="text-3xl font-bold text-gray-900">{total}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-sm text-gray-600 mb-1">Pending</div>
          <div className="text-3xl font-bold text-yellow-600">
            {docs.filter((d: any) => d.status === 'pending').length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-sm text-gray-600 mb-1">Confirmed</div>
          <div className="text-3xl font-bold text-green-600">
            {docs.filter((d: any) => d.status === 'confirmed').length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-sm text-gray-600 mb-1">Cancelled</div>
          <div className="text-3xl font-bold text-red-600">
            {docs.filter((d: any) => d.status === 'cancelled').length}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex items-center gap-2 mb-4">
          <FiFilter className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
        </div>
        
        <div className="grid md:grid-cols-3 gap-4">
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <form action="/admin/orathon-registrations" method="get">
              {searchQuery && <input type="hidden" name="search" value={searchQuery} />}
              <select
                name="status"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                defaultValue={statusFilter}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <button
                type="submit"
                className="mt-2 inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Apply
              </button>
            </form>
          </div>

          {/* Search */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <form action="/admin/orathon-registrations" method="get">
              {statusFilter !== 'all' && <input type="hidden" name="status" value={statusFilter} />}
              <input
                type="text"
                name="search"
                placeholder="Search by name or email..."
                defaultValue={searchQuery}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <button
                type="submit"
                className="mt-2 inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Search
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Registrations Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Country
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fitness Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Registered
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {docs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    No registrations found
                  </td>
                </tr>
              ) : (
                docs.map((registration: any) => (
                  <tr key={registration.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {registration.firstName} {registration.lastName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{registration.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{registration.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{registration.country}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 capitalize">
                        {registration.fitnessLevel}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          registration.status === 'confirmed'
                            ? 'bg-green-100 text-green-800'
                            : registration.status === 'cancelled'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {registration.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {registration.createdAt
                        ? new Date(registration.createdAt).toLocaleDateString()
                        : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link
                        href={`/admin/orathon-registrations/${registration.id}`}
                        className="text-primary-600 hover:text-primary-900"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} results
            </div>
            <div className="flex gap-2">
              {page > 1 && (
                <Link
                  href={`/admin/orathon-registrations?page=${page - 1}&status=${statusFilter}&search=${searchQuery}`}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Previous
                </Link>
              )}
              {page < totalPages && (
                <Link
                  href={`/admin/orathon-registrations?page=${page + 1}&status=${statusFilter}&search=${searchQuery}`}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
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
