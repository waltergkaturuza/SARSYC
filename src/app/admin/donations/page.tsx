import React, { Suspense } from 'react'
import Link from 'next/link'
import { getPayloadClient } from '@/lib/payload'
import { FiAlertCircle, FiCheck, FiDollarSign, FiHeart } from 'react-icons/fi'
import DonationsFilters from '@/components/admin/DonationsFilters'
import DonationsTable from '@/components/admin/DonationsTable'
import {
  fetchDonationsForSummary,
  formatUsd,
  summarizeDonations,
} from '@/lib/admin/donationsSummary'

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
  let breakdown = summarizeDonations([])
  let dbError: string | null = null

  try {
    const [results, summaryDocs] = await Promise.all([
      payload.find({
        collection: 'donations',
        where,
        limit,
        page,
        sort: '-createdAt',
        overrideAccess: true,
      }),
      fetchDonationsForSummary(payload, where),
    ])
    docs = results.docs || []
    total = results.totalDocs || 0
    totalPages = results.totalPages || 1
    breakdown = summarizeDonations(summaryDocs)
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
          <div className="mb-6 space-y-4">
            <div>
              <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
                Payments breakdown
                {paymentStatusFilter !== 'all' || searchQuery ? ' (filtered)' : ''}
              </h2>
              <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <div className="bg-white border border-gray-200 rounded-lg p-5">
                  <div className="flex items-center gap-2 text-gray-500 mb-1">
                    <FiDollarSign size={18} />
                    <p className="text-sm">Total expected</p>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatUsd(breakdown.totalExpectedUsd)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {breakdown.recordCount} pledge{breakdown.recordCount === 1 ? '' : 's'}
                  </p>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-5">
                  <div className="flex items-center gap-2 text-gray-500 mb-1">
                    <FiCheck size={18} className="text-green-600" />
                    <p className="text-sm">Total paid</p>
                  </div>
                  <p className="text-2xl font-bold text-green-600">
                    {formatUsd(breakdown.collectedUsd)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {breakdown.paidCount} paid record{breakdown.paidCount === 1 ? '' : 's'}
                  </p>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-5">
                  <div className="flex items-center gap-2 text-gray-500 mb-1">
                    <FiAlertCircle size={18} className="text-amber-600" />
                    <p className="text-sm">Outstanding</p>
                  </div>
                  <p className="text-2xl font-bold text-amber-600">
                    {formatUsd(breakdown.outstandingUsd)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {breakdown.unpaidCount} unpaid record{breakdown.unpaidCount === 1 ? '' : 's'}
                  </p>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-5">
                  <div className="flex items-center gap-2 text-gray-500 mb-1">
                    <FiAlertCircle size={18} className="text-red-500" />
                    <p className="text-sm">Failed</p>
                  </div>
                  <p className="text-2xl font-bold text-red-600">
                    {formatUsd(breakdown.failedUsd)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {breakdown.failedCount} failed
                    {breakdown.bankTransferCount > 0
                      ? ` · ${breakdown.bankTransferCount} bank transfer (${formatUsd(breakdown.bankTransferUsd)})`
                      : ''}
                  </p>
                </div>
              </div>
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Records</p>
                <p className="text-lg font-semibold text-gray-900">{total}</p>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Paid</p>
                <p className="text-lg font-semibold text-green-600">{breakdown.paidCount}</p>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Unpaid</p>
                <p className="text-lg font-semibold text-amber-600">{breakdown.unpaidCount}</p>
              </div>
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
