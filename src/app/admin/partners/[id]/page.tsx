import React from 'react'
import { getPayloadClient } from '@/lib/payload'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { FiEdit, FiArrowLeft, FiGlobe, FiCheckCircle, FiXCircle } from 'react-icons/fi'
import { format } from 'date-fns'

export const revalidate = 0

interface PartnerDetailPageProps {
  params: {
    id: string
  }
}

const typeLabels: Record<string, string> = {
  implementing: 'Implementing Partner',
  funding: 'Funding Partner',
  technical: 'Technical Partner',
  media: 'Media Partner',
  sponsor: 'Sponsor',
}

const tierLabels: Record<string, string> = {
  platinum: 'Platinum',
  gold: 'Gold',
  silver: 'Silver',
  bronze: 'Bronze',
  'in-kind': 'In-Kind',
  'n/a': 'Not Applicable',
}

export default async function PartnerDetailPage({ params }: PartnerDetailPageProps) {
  const payload = await getPayloadClient()
  
  try {
    const partner = await payload.findByID({
      collection: 'partners',
      id: params.id,
      depth: 2,
    })

    const sarsycEditionsMap: Record<string, string> = {
      '1': 'SARSYC I (2014)',
      '2': 'SARSYC II (2016)',
      '3': 'SARSYC III (2018)',
      '4': 'SARSYC IV (2020)',
      '5': 'SARSYC V (2022)',
      '6': 'SARSYC VI (2026)',
    }

    return (
      <div className="container-custom py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/admin/partners" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
            <FiArrowLeft className="w-5 h-5" />
            <span>Back to Partners</span>
          </Link>
          <Link href={`/admin/partners/${params.id}/edit`} className="btn-primary flex items-center gap-2">
            <FiEdit className="w-5 h-5" />
            Edit Partner
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Partner Header */}
          <div className="bg-gradient-to-r from-primary-600 to-secondary-600 p-8 text-white">
            <div className="flex items-start gap-6">
              {partner.logo && typeof partner.logo !== 'string' && (
                <div className="relative w-32 h-32 bg-white rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0 p-4">
                  <Image
                    src={partner.logo.url}
                    alt={partner.name}
                    fill
                    className="object-contain"
                  />
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold">{partner.name}</h1>
                  {partner.active ? (
                    <FiCheckCircle className="w-6 h-6 text-green-300" />
                  ) : (
                    <FiXCircle className="w-6 h-6 text-red-300" />
                  )}
                </div>
                <p className="text-xl text-white/90 mb-2">
                  {typeLabels[partner.type] || partner.type}
                </p>
                {partner.tier && partner.type === 'sponsor' && (
                  <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-sm font-medium">
                    {tierLabels[partner.tier] || partner.tier}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="p-8 space-y-8">
            {/* Description */}
            {partner.description && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-3">About</h3>
                <div className="prose max-w-none text-gray-700">
                  {/* Render rich text - simplified for now */}
                  <p>{typeof partner.description === 'string' ? partner.description : 'Description content'}</p>
                </div>
              </div>
            )}

            {/* Website */}
            {partner.website && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-3">Website</h3>
                <a
                  href={partner.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-primary-600 hover:text-primary-700"
                >
                  <FiGlobe className="w-5 h-5" />
                  <span>{partner.website}</span>
                </a>
              </div>
            )}

            {/* SARSYC Editions */}
            {partner.sarsycEditions && partner.sarsycEditions.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-3">Partnered at SARSYC Editions</h3>
                <div className="flex flex-wrap gap-2">
                  {partner.sarsycEditions.map((edition: string) => (
                    <span
                      key={edition}
                      className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm font-medium"
                    >
                      {sarsycEditionsMap[edition] || edition}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Status */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Status:</span>
                <span className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                  partner.active 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {partner.active ? (
                    <>
                      <FiCheckCircle className="w-4 h-4" />
                      Active
                    </>
                  ) : (
                    <>
                      <FiXCircle className="w-4 h-4" />
                      Inactive
                    </>
                  )}
                </span>
              </div>
              {partner.displayOrder !== undefined && (
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm font-medium text-gray-700">Display Order:</span>
                  <span className="text-sm text-gray-600">{partner.displayOrder}</span>
                </div>
              )}
            </div>

            {/* Metadata */}
            <div className="pt-6 border-t border-gray-200">
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Created:</span>{' '}
                  <span className="text-gray-900">
                    {partner.createdAt ? format(new Date(partner.createdAt), 'PPpp') : 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Last Updated:</span>{' '}
                  <span className="text-gray-900">
                    {partner.updatedAt ? format(new Date(partner.updatedAt), 'PPpp') : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  } catch (error) {
    notFound()
  }
}



