import React from 'react'
import { getPayloadClient } from '@/lib/payload'
import Link from 'next/link'
import RegistrationsTable from '@/components/admin/RegistrationsTable'
import RegistrationsFilters from '@/components/admin/RegistrationsFilters'

export const revalidate = 0

interface RegistrationsPageProps {
  searchParams: {
    page?: string
    limit?: string
    status?: string
    paymentStatus?: string
    country?: string
    category?: string
    gender?: string
    search?: string
  }
}

function buildQueryString(params: Record<string, string | undefined>) {
  const p = new URLSearchParams()
  if (params.status && params.status !== 'all') p.set('status', params.status)
  if (params.paymentStatus && params.paymentStatus !== 'all') p.set('paymentStatus', params.paymentStatus)
  if (params.country && params.country !== 'all') p.set('country', params.country)
  if (params.category && params.category !== 'all') p.set('category', params.category)
  if (params.gender && params.gender !== 'all') p.set('gender', params.gender)
  if (params.search) p.set('search', params.search)
  const s = p.toString()
  return s ? `?${s}` : ''
}

export default async function AdminRegistrationsPage({ searchParams }: RegistrationsPageProps) {
  const payload = await getPayloadClient()

  const page = Number(searchParams.page || '1')
  const limit = Number(searchParams.limit || '25')
  const statusFilter = searchParams.status || 'all'
  const paymentStatusFilter = searchParams.paymentStatus || 'all'
  const countryFilter = searchParams.country || 'all'
  const categoryFilter = searchParams.category || 'all'
  const genderFilter = searchParams.gender || 'all'
  const searchQuery = searchParams.search || ''

  const where: any = {}

  if (statusFilter !== 'all') {
    where.status = { equals: statusFilter }
  }

  if (paymentStatusFilter !== 'all') {
    where.paymentStatus = { equals: paymentStatusFilter }
  }

  if (countryFilter !== 'all') {
    where.country = { equals: countryFilter }
  }

  if (categoryFilter !== 'all') {
    where.category = { equals: categoryFilter }
  }

  if (genderFilter !== 'all') {
    where.gender = { equals: genderFilter }
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

      <RegistrationsFilters />

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
                href={`/admin/registrations?page=${page - 1}${buildQueryString({
                  status: statusFilter,
                  paymentStatus: paymentStatusFilter,
                  country: countryFilter,
                  category: categoryFilter,
                  gender: genderFilter,
                  search: searchQuery,
                }).replace(/^\?/, '&')}`}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Previous
              </Link>
            )}
            {Array.from({ length: Math.min(results.totalPages, 5) }, (_, i) => {
              const pageNum = Math.max(1, page - 2) + i
              if (pageNum > results.totalPages) return null
              const qs = buildQueryString({
                status: statusFilter,
                paymentStatus: paymentStatusFilter,
                country: countryFilter,
                category: categoryFilter,
                gender: genderFilter,
                search: searchQuery,
              })
              return (
                <Link
                  key={pageNum}
                  href={`/admin/registrations?page=${pageNum}${qs ? qs.replace(/^\?/, '&') : ''}`}
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
                href={`/admin/registrations?page=${page + 1}${buildQueryString({
                  status: statusFilter,
                  paymentStatus: paymentStatusFilter,
                  country: countryFilter,
                  category: categoryFilter,
                  gender: genderFilter,
                  search: searchQuery,
                }).replace(/^\?/, '&')}`}
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

