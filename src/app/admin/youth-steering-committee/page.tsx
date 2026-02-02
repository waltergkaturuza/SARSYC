import React from 'react'
import { getPayloadClient } from '@/lib/payload'
import Link from 'next/link'
import Image from 'next/image'
import { 
  FiUsers, FiPlus, FiEdit, FiStar, FiEye 
} from 'react-icons/fi'

export const revalidate = 0

interface SearchParams {
  page?: string
  featured?: string
  search?: string
}

// Helper function to get photo URL (same pattern as speakers)
function getPhotoUrl(photo: any): string | null {
  if (!photo) return null

  const fixDomain = (url: string): string => {
    if (url.includes('sarsyc.org') && !url.includes('www.sarsyc.org')) {
      return url.replace('https://sarsyc.org', 'https://www.sarsyc.org')
    }
    return url
  }

  const isBlobUrl = (url: string): boolean => {
    return url.includes('blob.vercel-storage.com') || url.includes('public.blob.vercel-storage.com')
  }

  const isPayloadFileUrl = (url: string): boolean => {
    return url.includes('/api/media/file/')
  }

  if (typeof photo === 'string') {
    if (photo.startsWith('http')) {
      if (isPayloadFileUrl(photo)) return null
      return fixDomain(photo)
    }
    return null
  }

  // PRIORITY 1: Check thumbnailURL first (migration stores Blob URLs here!)
  if (photo.thumbnailURL && typeof photo.thumbnailURL === 'string') {
    if (isBlobUrl(photo.thumbnailURL)) {
      return fixDomain(photo.thumbnailURL)
    }
  }

  // PRIORITY 2: Check main URL (only if it's a Blob URL)
  if (photo.url && typeof photo.url === 'string') {
    if (isBlobUrl(photo.url)) {
      return fixDomain(photo.url)
    }
    if (isPayloadFileUrl(photo.url)) {
      if (photo.sizes?.card?.url && isBlobUrl(photo.sizes.card.url)) {
        return fixDomain(photo.sizes.card.url)
      }
      if (photo.sizes?.thumbnail?.url && isBlobUrl(photo.sizes.thumbnail.url)) {
        return fixDomain(photo.sizes.thumbnail.url)
      }
      return null
    }
    return fixDomain(photo.url)
  }

  if (photo.sizes?.card?.url && !isPayloadFileUrl(photo.sizes.card.url)) {
    return fixDomain(photo.sizes.card.url)
  }

  if (photo.sizes?.thumbnail?.url && !isPayloadFileUrl(photo.sizes.thumbnail.url)) {
    return fixDomain(photo.sizes.thumbnail.url)
  }

  return null
}

export default async function YouthSteeringCommitteePage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const payload = await getPayloadClient()
  
  const page = Number(searchParams.page || 1)
  const perPage = 20
  const featured = searchParams.featured
  const search = searchParams.search

  const where: any = {}
  
  if (featured === 'true') {
    where.featured = { equals: true }
  }
  
  if (search) {
    where.or = [
      { name: { contains: search } },
      { organization: { contains: search } },
      { role: { contains: search } },
    ]
  }

  let members: any[] = []
  let totalPages = 1
  let totalDocs = 0

  try {
    const results = await payload.find({
      collection: 'youth-steering-committee',
      where,
      limit: perPage,
      page,
      sort: 'order',
      depth: 2,
      overrideAccess: true,
    })

    members = results.docs
    totalPages = results.totalPages
    totalDocs = results.totalDocs
  } catch (error: any) {
    console.error('Error fetching committee members:', error)
    members = []
    totalPages = 1
    totalDocs = 0
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Youth Steering Committee</h1>
          <p className="text-gray-600 mt-1">Manage Youth Steering Committee members</p>
        </div>
        <Link href="/admin/youth-steering-committee/new" className="btn-primary flex items-center gap-2">
          <FiPlus className="w-5 h-5" />
          Add Member
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-gray-900">{totalDocs}</div>
          <div className="text-sm text-gray-600">Total Members</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-gray-900">
            {members.filter((m: any) => m.featured).length}
          </div>
          <div className="text-sm text-gray-600">Featured</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-gray-900">
            {members.filter((m: any) => !m.featured).length}
          </div>
          <div className="text-sm text-gray-600">Regular</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <form method="get" className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              name="search"
              placeholder="Search by name, organization, or role..."
              defaultValue={search}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div>
            <select
              name="featured"
              defaultValue={featured || 'all'}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">All Members</option>
              <option value="true">Featured Only</option>
            </select>
          </div>
          <button type="submit" className="btn-outline">
            Filter
          </button>
        </form>
      </div>

      {/* Members List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <p className="text-sm text-gray-600">
            Showing {members.length} of {totalDocs} members
          </p>
        </div>

        {members.length === 0 ? (
          <div className="p-12 text-center">
            <FiUsers className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No committee members found</p>
            <Link href="/admin/youth-steering-committee/new" className="btn-primary mt-4 inline-flex items-center gap-2">
              <FiPlus className="w-5 h-5" />
              Add First Member
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Member</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Organization</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Country</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {members.map((member: any) => {
                  const photoUrl = getPhotoUrl(member.photo)
                  
                  return (
                    <tr key={member.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {photoUrl ? (
                            <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                              <Image
                                src={photoUrl}
                                alt={member.name}
                                fill
                                className="object-cover"
                                sizes="48px"
                              />
                            </div>
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center text-white font-bold flex-shrink-0">
                              {member.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <div className="font-medium text-gray-900">{member.name}</div>
                            {member.email && (
                              <div className="text-sm text-gray-500">{member.email}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{member.role}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{member.organization}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{member.country}</td>
                      <td className="px-6 py-4">
                        {member.featured ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-700">
                            <FiStar className="w-3 h-3" />
                            Featured
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
                            Regular
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/youth-steering-committee/${member.id}`}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            title="View"
                          >
                            <FiEye className="w-4 h-4" />
                          </Link>
                          <Link
                            href={`/admin/youth-steering-committee/${member.id}/edit`}
                            className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <FiEdit className="w-4 h-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-600">Page {page} of {totalPages}</div>
            <div className="flex gap-2">
              {page > 1 && (
                <Link
                  href={`/admin/youth-steering-committee?page=${page - 1}${search ? `&search=${search}` : ''}${featured ? `&featured=${featured}` : ''}`}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  Previous
                </Link>
              )}
              {page < totalPages && (
                <Link
                  href={`/admin/youth-steering-committee?page=${page + 1}${search ? `&search=${search}` : ''}${featured ? `&featured=${featured}` : ''}`}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
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
