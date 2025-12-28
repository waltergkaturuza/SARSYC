import React from 'react'
import { getPayloadClient } from '@/lib/payload'
import Link from 'next/link'
import Image from 'next/image'
import SpeakersFilters from '@/components/admin/SpeakersFilters'
import { 
  FiMic, FiPlus, FiEdit, FiStar, FiUser, FiEye 
} from 'react-icons/fi'

export const revalidate = 0

interface SearchParams {
  page?: string
  type?: string
  featured?: string
  search?: string
}

export default async function SpeakersManagementPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const payload = await getPayloadClient()
  
  const page = Number(searchParams.page || 1)
  const perPage = 20
  const type = searchParams.type
  const featured = searchParams.featured
  const search = searchParams.search

  // Build where clause
  const where: any = {}
  
  if (type && type !== 'all') {
    where.type = { contains: type }
  }
  
  if (featured === 'true') {
    where.featured = { equals: true }
  }
  
  if (search) {
    where.or = [
      { name: { contains: search } },
      { organization: { contains: search } },
      { title: { contains: search } },
    ]
  }

  const results = await payload.find({
    collection: 'speakers',
    where,
    limit: perPage,
    page,
    sort: '-createdAt',
    depth: 1, // Populate photo relationship
  })

  const speakers = results.docs
  const totalPages = results.totalPages
  const totalDocs = results.totalDocs

  const typeConfig: Record<string, { color: string, label: string }> = {
    'keynote': { color: 'bg-purple-100 text-purple-700', label: 'Keynote' },
    'plenary': { color: 'bg-blue-100 text-blue-700', label: 'Plenary' },
    'moderator': { color: 'bg-green-100 text-green-700', label: 'Moderator' },
    'facilitator': { color: 'bg-yellow-100 text-yellow-700', label: 'Facilitator' },
    'presenter': { color: 'bg-gray-100 text-gray-700', label: 'Presenter' },
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Speakers Management</h1>
          <p className="text-gray-600 mt-1">Manage conference speakers and facilitators</p>
        </div>
        <Link href="/admin/speakers/new" className="btn-primary flex items-center gap-2">
          <FiPlus className="w-5 h-5" />
          Add Speaker
        </Link>
      </div>

      {/* Filters */}
      <SpeakersFilters />

      {/* Speakers Grid */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            Showing {speakers.length} of {totalDocs} speakers
          </p>
        </div>

        {speakers.length === 0 ? (
          <div className="p-12 text-center">
            <FiMic className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No speakers found</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {speakers.map((speaker: any) => {
              const typeInfo = typeConfig[speaker.type] || typeConfig['presenter']
              
              return (
                <div key={speaker.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                  {/* Speaker Photo */}
                  <div className="relative h-48 bg-gray-100">
                    {speaker.photo?.url ? (
                      <Image
                        src={speaker.photo.url}
                        alt={speaker.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FiUser className="w-16 h-16 text-gray-400" />
                      </div>
                    )}
                    {speaker.featured && (
                      <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                        <FiStar className="w-3 h-3" />
                        Featured
                      </div>
                    )}
                  </div>

                  {/* Speaker Info */}
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 mb-1">{speaker.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{speaker.title}</p>
                    <p className="text-xs text-gray-500 mb-3">{speaker.organization}</p>
                    
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${typeInfo.color}`}>
                        {typeInfo.label}
                      </span>
                      
                      <div className="flex gap-2">
                        <Link
                          href={`/admin/speakers/${speaker.id}`}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="View"
                        >
                          <FiEye className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/admin/speakers/${speaker.id}/edit`}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <FiEdit className="w-4 h-4" />
                        </Link>
                      </div>
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
            <div className="text-sm text-gray-600">
              Page {page} of {totalPages}
            </div>
            <div className="flex gap-2">
              {page > 1 && (
                <Link
                  href={`/admin/speakers?page=${page - 1}${type ? `&type=${type}` : ''}${featured ? `&featured=${featured}` : ''}`}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Previous
                </Link>
              )}
              {page < totalPages && (
                <Link
                  href={`/admin/speakers?page=${page + 1}${type ? `&type=${type}` : ''}${featured ? `&featured=${featured}` : ''}`}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
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

