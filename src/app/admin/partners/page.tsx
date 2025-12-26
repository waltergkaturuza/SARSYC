import React from 'react'
import { getPayloadClient } from '@/lib/payload'
import Link from 'next/link'
import Image from 'next/image'
import { 
  FiHeart, FiFilter, FiPlus, FiEdit, FiExternalLink, FiImage 
} from 'react-icons/fi'

export const revalidate = 0

interface SearchParams {
  page?: string
  type?: string
  tier?: string
}

export default async function PartnersManagementPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const payload = await getPayloadClient()
  
  const page = Number(searchParams.page || 1)
  const perPage = 20
  const type = searchParams.type
  const tier = searchParams.tier

  // Build where clause
  const where: any = {}
  
  if (type && type !== 'all') {
    where.type = { equals: type }
  }
  
  if (tier && tier !== 'all') {
    where.tier = { equals: tier }
  }

  const results = await payload.find({
    collection: 'partners',
    where,
    limit: perPage,
    page,
    sort: '-createdAt',
  })

  const partners = results.docs
  const totalPages = results.totalPages
  const totalDocs = results.totalDocs

  const tierConfig: Record<string, { color: string, label: string }> = {
    'platinum': { color: 'bg-gray-300 text-gray-900', label: 'Platinum' },
    'gold': { color: 'bg-yellow-100 text-yellow-700', label: 'Gold' },
    'silver': { color: 'bg-gray-100 text-gray-700', label: 'Silver' },
    'bronze': { color: 'bg-orange-100 text-orange-700', label: 'Bronze' },
    'in-kind': { color: 'bg-blue-100 text-blue-700', label: 'In-Kind' },
    'n/a': { color: 'bg-gray-50 text-gray-600', label: 'N/A' },
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Partners & Sponsors</h1>
          <p className="text-gray-600 mt-1">Manage conference partners and sponsorships</p>
        </div>
        <Link href="/admin/partners/new" className="btn-primary flex items-center gap-2">
          <FiPlus className="w-5 h-5" />
          Add Partner
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-gray-900">{totalDocs}</div>
          <div className="text-sm text-gray-600">Total Partners</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-yellow-600">
            {partners.filter((p: any) => p.tier === 'platinum' || p.tier === 'gold').length}
          </div>
          <div className="text-sm text-gray-600">Premium Tier</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-blue-600">
            {partners.filter((p: any) => p.type === 'funding').length}
          </div>
          <div className="text-sm text-gray-600">Funding Partners</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-purple-600">
            {partners.filter((p: any) => p.type === 'implementing').length}
          </div>
          <div className="text-sm text-gray-600">Implementing</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <FiFilter className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
        </div>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Partner Type</label>
            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
              <option value="all">All Types</option>
              <option value="implementing">Implementing</option>
              <option value="funding">Funding</option>
              <option value="technical">Technical</option>
              <option value="media">Media</option>
              <option value="sponsor">Sponsor</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sponsorship Tier</label>
            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
              <option value="all">All Tiers</option>
              <option value="platinum">Platinum</option>
              <option value="gold">Gold</option>
              <option value="silver">Silver</option>
              <option value="bronze">Bronze</option>
              <option value="in-kind">In-Kind</option>
            </select>
          </div>
        </div>
      </div>

      {/* Partners Grid */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            Showing {partners.length} of {totalDocs} partners
          </p>
        </div>

        {partners.length === 0 ? (
          <div className="p-12 text-center">
            <FiHeart className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No partners found</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {partners.map((partner: any) => {
              const tierInfo = tierConfig[partner.tier] || tierConfig['n/a']
              
              return (
                <div key={partner.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                  {/* Logo */}
                  <div className="h-32 bg-gray-50 flex items-center justify-center p-4">
                    {partner.logo?.url ? (
                      <Image
                        src={partner.logo.url}
                        alt={partner.name}
                        width={200}
                        height={100}
                        className="object-contain max-h-full"
                      />
                    ) : (
                      <FiImage className="w-16 h-16 text-gray-300" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 mb-2">{partner.name}</h3>
                    
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${tierInfo.color}`}>
                        {tierInfo.label}
                      </span>
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
                        {partner.type}
                      </span>
                    </div>
                    
                    <div className="flex gap-2">
                      {partner.website && (
                        <a
                          href={partner.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          <FiExternalLink className="w-4 h-4" />
                          Website
                        </a>
                      )}
                      <Link
                        href={`/admin/partners/${partner.id}/edit`}
                        className="flex items-center justify-center px-3 py-2 text-sm bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 transition-colors"
                      >
                        <FiEdit className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 pt-6 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-600">Page {page} of {totalPages}</div>
            <div className="flex gap-2">
              {page > 1 && (
                <Link href={`/admin/partners?page=${page - 1}`} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                  Previous
                </Link>
              )}
              {page < totalPages && (
                <Link href={`/admin/partners?page=${page + 1}`} className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
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

