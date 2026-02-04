import React from 'react'
import { getPayloadClient } from '@/lib/payload'
import Link from 'next/link'
import { FiFilter, FiActivity, FiDownload } from 'react-icons/fi'
import OrathonRegistrationsTable from '@/components/admin/OrathonRegistrationsTable'

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
      { registrationId: { contains: searchQuery } },
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

      <OrathonRegistrationsTable docs={docs} />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white mt-4 px-6 py-4 border border-gray-200 rounded-lg flex items-center justify-between">
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
  )
}
