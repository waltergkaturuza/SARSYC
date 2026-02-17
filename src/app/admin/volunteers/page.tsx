import React from 'react'
import { getPayloadClient } from '@/lib/payload'
import VolunteersTable from '@/components/admin/VolunteersTable'
import { FiFilter } from 'react-icons/fi'

export const revalidate = 0

interface VolunteersPageProps {
  searchParams: {
    page?: string
    status?: string
    search?: string
  }
}

export default async function AdminVolunteersPage({ searchParams }: VolunteersPageProps) {
  const payload = await getPayloadClient()

  const page = Number(searchParams.page || '1')
  const limit = 25
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
      { volunteerId: { contains: searchQuery } },
    ]
  }

  const results = await payload.find({
    collection: 'volunteers',
    where,
    limit,
    page,
    sort: '-createdAt',
  })

  const docs = results.docs || []

  return (
    <div className="w-full py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Volunteers</h1>
        <p className="text-gray-600 mt-2">
          Review and manage volunteer applications for SARSYC VI.
        </p>
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
            <form action="/admin/volunteers" method="get">
              {searchQuery && <input type="hidden" name="search" value={searchQuery} />}
              <select
                name="status"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                defaultValue={statusFilter}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending Review</option>
                <option value="under-review">Under Review</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="on-hold">On Hold</option>
                <option value="withdrawn">Withdrawn</option>
              </select>
            </form>
          </div>

          {/* Search */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <form action="/admin/volunteers" method="get">
              {statusFilter !== 'all' && <input type="hidden" name="status" value={statusFilter} />}
              <input
                type="text"
                name="search"
                placeholder="Search by name, email, or volunteer ID..."
                defaultValue={searchQuery}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </form>
          </div>
        </div>
      </div>

      {/* Volunteers Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <VolunteersTable docs={docs} />
      </div>

      {/* Simple pagination */}
      {results.totalPages > 1 && (
        <div className="mt-6 flex justify-center gap-2">
          {page > 1 && (
            <a
              href={`/admin/volunteers?page=${page - 1}${
                statusFilter !== 'all' ? `&status=${statusFilter}` : ''
              }${searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ''}`}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Previous
            </a>
          )}
          {page < results.totalPages && (
            <a
              href={`/admin/volunteers?page=${page + 1}${
                statusFilter !== 'all' ? `&status=${statusFilter}` : ''
              }${searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ''}`}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Next
            </a>
          )}
        </div>
      )}
    </div>
  )
}

