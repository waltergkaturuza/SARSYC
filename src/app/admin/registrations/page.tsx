import React from 'react'
import { getPayloadClient } from '@/lib/payload'
import Link from 'next/link'
import RegistrationsTable from '@/components/admin/RegistrationsTable'
import { FiFilter } from 'react-icons/fi'

export const revalidate = 0

interface RegistrationsPageProps {
  searchParams: {
    page?: string
    limit?: string
    status?: string
    paymentStatus?: string
    search?: string
  }
}

export default async function AdminRegistrationsPage({ searchParams }: RegistrationsPageProps) {
  const payload = await getPayloadClient()

  const page = Number(searchParams.page || '1')
  const limit = Number(searchParams.limit || '25')
  const statusFilter = searchParams.status || 'all'
  const paymentStatusFilter = searchParams.paymentStatus || 'all'
  const searchQuery = searchParams.search || ''

  const where: any = {}

  // Only filter by deletedAt if we want to exclude soft-deleted
  // For now, we'll just show all registrations (including ones without deletedAt set)
  // If you need soft-delete functionality, uncomment this:
  // where.or = [
  //   { deletedAt: { equals: null } },
  //   { deletedAt: { exists: false } },
  // ]

  if (statusFilter !== 'all') {
    where.status = { equals: statusFilter }
  }
  // When 'all', don't filter by status - show everything

  if (paymentStatusFilter !== 'all') {
    where.paymentStatus = { equals: paymentStatusFilter }
  }

  if (searchQuery) {
    where.or = [
      { firstName: { contains: searchQuery } },
      { lastName: { contains: searchQuery } },
      { email: { contains: searchQuery } },
      { registrationId: { contains: searchQuery } },
    ]
  }

  const results = await payload.find({
    collection: 'registrations',
    where,
    limit,
    page,
    sort: '-createdAt',
  })

  const docs = results.docs || []
  const total = results.totalDocs || 0

  // Admin ID for local dev; production will use real session-based auth
  const adminId = process.env.ADMIN_USER_ID || ''

  return (
    <div className="w-full py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Registrations</h1>
        <p className="text-gray-600 mt-2">Manage conference registrations and participant details</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex items-center gap-2 mb-4">
          <FiFilter className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
        </div>
        
        <div className="grid md:grid-cols-4 gap-4">
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <form action="/admin/registrations" method="get">
              {paymentStatusFilter !== 'all' && <input type="hidden" name="paymentStatus" value={paymentStatusFilter} />}
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
            </form>
          </div>

          {/* Payment Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Payment Status</label>
            <form action="/admin/registrations" method="get">
              {statusFilter !== 'all' && <input type="hidden" name="status" value={statusFilter} />}
              {searchQuery && <input type="hidden" name="search" value={searchQuery} />}
              <select
                name="paymentStatus"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                defaultValue={paymentStatusFilter}
              >
                <option value="all">All Payment Status</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="failed">Failed</option>
              </select>
            </form>
          </div>

          {/* Search */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <form action="/admin/registrations" method="get">
              {statusFilter !== 'all' && <input type="hidden" name="status" value={statusFilter} />}
              {paymentStatusFilter !== 'all' && <input type="hidden" name="paymentStatus" value={paymentStatusFilter} />}
              <input
                type="text"
                name="search"
                placeholder="Search by name, email, or registration ID..."
                defaultValue={searchQuery}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </form>
          </div>
        </div>
      </div>

      {/* Registrations Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <RegistrationsTable 
          docs={docs} 
          total={total} 
          page={page} 
          perPage={limit} 
          adminId={adminId}
        />
      </div>

      {/* Pagination */}
      {results.totalPages > 1 && (
        <div className="mt-6 flex justify-center">
          <nav className="flex gap-2">
            {page > 1 && (
              <Link
                href={`/admin/registrations?page=${page - 1}${statusFilter !== 'all' ? `&status=${statusFilter}` : ''}${paymentStatusFilter !== 'all' ? `&paymentStatus=${paymentStatusFilter}` : ''}${searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ''}`}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Previous
              </Link>
            )}
            {Array.from({ length: Math.min(results.totalPages, 5) }, (_, i) => {
              const pageNum = Math.max(1, page - 2) + i
              if (pageNum > results.totalPages) return null
              return (
                <Link
                  key={pageNum}
                  href={`/admin/registrations?page=${pageNum}${statusFilter !== 'all' ? `&status=${statusFilter}` : ''}${paymentStatusFilter !== 'all' ? `&paymentStatus=${paymentStatusFilter}` : ''}${searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ''}`}
                  className={`px-4 py-2 border rounded-lg ${
                    pageNum === page
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {pageNum}
                </Link>
              )
            })}
            {page < results.totalPages && (
              <Link
                href={`/admin/registrations?page=${page + 1}${statusFilter !== 'all' ? `&status=${statusFilter}` : ''}${paymentStatusFilter !== 'all' ? `&paymentStatus=${paymentStatusFilter}` : ''}${searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ''}`}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Next
              </Link>
            )}
          </nav>
        </div>
      )}
    </div>
  )
}

