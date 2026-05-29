import React, { Suspense } from 'react'
import Link from 'next/link'
import { getPayloadClient } from '@/lib/payload'
import { FiHeart } from 'react-icons/fi'
import DonationsFilters from '@/components/admin/DonationsFilters'
import DonationsTable from '@/components/admin/DonationsTable'

export const revalidate = 0

interface DonationsPageProps {
  searchParams: {
    page?: string
    search?: string
    paymentStatus?: string
  }
}

export default async function AdminDonationsPage({ searchParams }: DonationsPageProps) {
  const payload = await getPayloadClient()
  const page = Number(searchParams.page || '1')
  const limit = 25
  const searchQuery = searchParams.search?.trim() || ''
  const paymentStatusFilter = searchParams.paymentStatus || 'all'

  const where: Record<string, unknown> = {}

  if (paymentStatusFilter !== 'all') {
    where.paymentStatus = { equals: paymentStatusFilter }
  }

  if (searchQuery) {
    where.or = [
      { donorName: { contains: searchQuery } },
      { firstName: { contains: searchQuery } },
      { lastName: { contains: searchQuery } },
      { orgName: { contains: searchQuery } },
      { email: { contains: searchQuery } },
      { donationId: { contains: searchQuery } },
      { categoryDisplay: { contains: searchQuery } },
      { sponsorshipTierName: { contains: searchQuery } },
    ]
  }

  let docs: Record<string, unknown>[] = []
  let total = 0
  let totalPages = 1
  let dbError: string | null = null

  try {
    const results = await payload.find({
      collection: 'donations',
      where,
      limit,
      page,
      sort: '-createdAt',
      overrideAccess: true,
    })
    docs = results.docs || []
    total = results.totalDocs || 0
    totalPages = results.totalPages || 1
  } catch (err: unknown) {
    console.error('[admin/donations]', err)
    dbError =
      err instanceof Error
        ? err.message
        : 'Could not load donations — database migration may be pending.'
    if (/donations_id/i.test(dbError)) {
      dbError += ' Run GET /api/admin/fix-locked-docs-table once, then redeploy or refresh.'
    }
  }

  const paidCount = docs.filter((d) => d.paymentStatus === 'paid').length
  const pendingCount = docs.filter((d) => d.paymentStatus === 'pending').length

  return (
    <div className="w-full">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-primary-100 text-primary-700 flex items-center justify-center">
            <FiHeart size={20} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Donations</h1>
        </div>
        <p className="text-gray-600 max-w-3xl">
          Card pledges (SARSYC-DON-*) with names, organisations, categories, and amounts. Update notes
          or payment status for manual reconciliation after bank transfers.
        </p>
      </div>

      {dbError ? (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-6">
          <h2 className="font-semibold text-amber-900 mb-2">Database setup required</h2>
          <p className="text-amber-800 text-sm mb-2">{dbError}</p>
          <p className="text-amber-800 text-sm">
            After deploy, Payload runs migrations automatically in production. If this persists, run
            migrations on Neon or redeploy the latest build.
          </p>
        </div>
      ) : (
        <>
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white border border-gray-200 rounded-lg p-5">
              <p className="text-sm text-gray-500">Total (this page filter)</p>
              <p className="text-2xl font-bold text-gray-900">{total}</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-5">
              <p className="text-sm text-gray-500">Paid on page</p>
              <p className="text-2xl font-bold text-green-600">{paidCount}</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-5">
              <p className="text-sm text-gray-500">Unpaid on page</p>
              <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
            </div>
          </div>

          <Suspense fallback={<div className="h-20 bg-white rounded-lg border border-gray-200" />}>
            <DonationsFilters />
          </Suspense>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <DonationsTable docs={docs as any} />
          </div>

          {totalPages > 1 && (
            <div className="mt-6 flex justify-center gap-2">
              {page > 1 && (
                <Link
                  href={`/admin/donations?page=${page - 1}${
                    searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ''
                  }${paymentStatusFilter !== 'all' ? `&paymentStatus=${paymentStatusFilter}` : ''}`}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                >
                  Previous
                </Link>
              )}
              <span className="px-4 py-2 text-sm text-gray-600">
                Page {page} of {totalPages}
              </span>
              {page < totalPages && (
                <Link
                  href={`/admin/donations?page=${page + 1}${
                    searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ''
                  }${paymentStatusFilter !== 'all' ? `&paymentStatus=${paymentStatusFilter}` : ''}`}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                >
                  Next
                </Link>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
