import React from 'react'
import { getPayloadClient } from '@/lib/payload'
import Link from 'next/link'
import Image from 'next/image'
import { 
  FiMessageSquare, FiFilter, FiPlus, FiEdit, FiEye, FiTrash2, FiImage 
} from 'react-icons/fi'

export const revalidate = 0

interface SearchParams {
  page?: string
  status?: string
  category?: string
  search?: string
}

export default async function NewsManagementPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const payload = await getPayloadClient()
  
  const page = Number(searchParams.page || 1)
  const perPage = 20
  const status = searchParams.status
  const category = searchParams.category
  const search = searchParams.search

  // Build where clause
  const where: any = {}
  
  if (status && status !== 'all') {
    where.status = { equals: status }
  }
  
  if (category && category !== 'all') {
    where.category = { equals: category }
  }
  
  if (search) {
    where.or = [
      { title: { contains: search } },
      { excerpt: { contains: search } },
    ]
  }

  const results = await payload.find({
    collection: 'news',
    where,
    limit: perPage,
    page,
    sort: '-publishedDate',
  })

  const news = results.docs
  const totalPages = results.totalPages
  const totalDocs = results.totalDocs

  const statusConfig: Record<string, { color: string, label: string }> = {
    'draft': { color: 'bg-gray-100 text-gray-700', label: 'Draft' },
    'published': { color: 'bg-green-100 text-green-700', label: 'Published' },
    'archived': { color: 'bg-orange-100 text-orange-700', label: 'Archived' },
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">News Management</h1>
          <p className="text-gray-600 mt-1">Create and publish news articles and updates</p>
        </div>
        <Link href="/admin/news/new" className="btn-primary flex items-center gap-2">
          <FiPlus className="w-5 h-5" />
          Create Article
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-gray-900">{totalDocs}</div>
          <div className="text-sm text-gray-600">Total Articles</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-green-600">
            {news.filter((n: any) => n.status === 'published').length}
          </div>
          <div className="text-sm text-gray-600">Published</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-gray-600">
            {news.filter((n: any) => n.status === 'draft').length}
          </div>
          <div className="text-sm text-gray-600">Drafts</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <FiFilter className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
        </div>
        
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
              <option value="all">All Categories</option>
              <option value="conference">Conference</option>
              <option value="speakers">Speakers</option>
              <option value="partnerships">Partnerships</option>
              <option value="research">Research</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <input
              type="text"
              placeholder="Search articles..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* News List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <p className="text-sm text-gray-600">
            Showing {news.length} of {totalDocs} articles
          </p>
        </div>

        {news.length === 0 ? (
          <div className="p-12 text-center">
            <FiMessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No articles found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {news.map((article: any) => {
              const statusInfo = statusConfig[article.status] || statusConfig['draft']
              
              return (
                <div key={article.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex gap-4">
                    {/* Thumbnail */}
                    <div className="flex-shrink-0">
                      <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden">
                        {article.featuredImage?.url ? (
                          <Image
                            src={article.featuredImage.url}
                            alt={article.title}
                            width={96}
                            height={96}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <FiImage className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-bold text-gray-900">{article.title}</h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{article.excerpt}</p>
                      
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>{article.category}</span>
                        <span>•</span>
                        <span>{new Date(article.publishedDate || article.createdAt).toLocaleDateString()}</span>
                        {article.featured && (
                          <>
                            <span>•</span>
                            <span className="text-yellow-600 font-medium">Featured</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Link
                        href={`/news/${article.slug}`}
                        target="_blank"
                        className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        title="View"
                      >
                        <FiEye className="w-4 h-4" />
                      </Link>
                      <Link
                        href={`/admin/news/${article.id}/edit`}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Edit"
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
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-600">Page {page} of {totalPages}</div>
            <div className="flex gap-2">
              {page > 1 && (
                <Link href={`/admin/news?page=${page - 1}`} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                  Previous
                </Link>
              )}
              {page < totalPages && (
                <Link href={`/admin/news?page=${page + 1}`} className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
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

