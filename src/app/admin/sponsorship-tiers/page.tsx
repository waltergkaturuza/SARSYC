import { getPayloadClient } from '@/lib/payload'
import Link from 'next/link'
import { FiPlus, FiEdit, FiTrash2, FiAward, FiCheck, FiX } from 'react-icons/fi'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

interface SearchParams {
  page?: string
  limit?: string
  search?: string
}

export default async function SponsorshipTiersPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const payload = await getPayloadClient()
  
  const page = parseInt(searchParams.page || '1')
  const limit = parseInt(searchParams.limit || '20')
  const search = searchParams.search || ''

  const where: any = {}
  if (search) {
    where.or = [
      { name: { contains: search } },
      { price: { contains: search } },
    ]
  }

  const result = await payload.find({
    collection: 'sponsorship-tiers',
    where,
    limit,
    page,
    sort: 'order',
  })

  const { docs: tiers, totalDocs, totalPages } = result

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sponsorship Tiers</h1>
          <p className="text-gray-600 mt-1">Manage sponsorship pricing packages</p>
        </div>
        <Link href="/admin/sponsorship-tiers/new" className="btn-primary flex items-center gap-2">
          <FiPlus className="w-5 h-5" />
          Add Tier
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-gray-900">{totalDocs}</div>
          <div className="text-sm text-gray-600">Total Tiers</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-green-600">
            {tiers.filter((t: any) => t.isActive).length}
          </div>
          <div className="text-sm text-gray-600">Active</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-yellow-600">
            {tiers.filter((t: any) => t.isPopular).length}
          </div>
          <div className="text-sm text-gray-600">Popular</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-gray-600">
            {tiers.filter((t: any) => !t.isActive).length}
          </div>
          <div className="text-sm text-gray-600">Inactive</div>
        </div>
      </div>

      {/* Tiers Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tier
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Benefits
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tiers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No sponsorship tiers found. <Link href="/admin/sponsorship-tiers/new" className="text-primary-600 hover:underline">Create one</Link>
                  </td>
                </tr>
              ) : (
                tiers.map((tier: any) => (
                  <tr key={tier.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {tier.order}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-lg flex items-center justify-center">
                          <FiAward className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{tier.name}</div>
                          {tier.isPopular && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                              Most Popular
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                      {tier.price}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {tier.benefits?.length || 0} benefits
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {tier.isActive ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <FiCheck className="w-3 h-3 mr-1" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          <FiX className="w-3 h-3 mr-1" />
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/sponsorship-tiers/${tier.id}/edit`}
                          className="text-primary-600 hover:text-primary-900 flex items-center gap-1"
                        >
                          <FiEdit className="w-4 h-4" />
                          Edit
                        </Link>
                      </div>
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
              Showing <span className="font-medium">{(page - 1) * limit + 1}</span> to{' '}
              <span className="font-medium">{Math.min(page * limit, totalDocs)}</span> of{' '}
              <span className="font-medium">{totalDocs}</span> tiers
            </div>
            <div className="flex gap-2">
              {page > 1 && (
                <Link
                  href={`/admin/sponsorship-tiers?page=${page - 1}`}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Previous
                </Link>
              )}
              {page < totalPages && (
                <Link
                  href={`/admin/sponsorship-tiers?page=${page + 1}`}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
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





