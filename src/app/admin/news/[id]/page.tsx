import React from 'react'
import { getPayloadClient } from '@/lib/payload'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { FiEdit, FiArrowLeft, FiCalendar, FiUser, FiTag, FiStar } from 'react-icons/fi'
import { format } from 'date-fns'

export const revalidate = 0

interface NewsDetailPageProps {
  params: {
    id: string
  }
}

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-800',
  published: 'bg-green-100 text-green-800',
  archived: 'bg-orange-100 text-orange-800',
}

export default async function NewsDetailPage({ params }: NewsDetailPageProps) {
  const payload = await getPayloadClient()
  
  try {
    const article = await payload.findByID({
      collection: 'news',
      id: params.id,
      depth: 2,
    })

    return (
      <div className="container-custom py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/admin/news" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
            <FiArrowLeft className="w-5 h-5" />
            <span>Back to News</span>
          </Link>
          <Link href={`/admin/news/${params.id}/edit`} className="btn-primary flex items-center gap-2">
            <FiEdit className="w-5 h-5" />
            Edit Article
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Article Header */}
          {article.featuredImage && typeof article.featuredImage !== 'string' && (
            <div className="relative h-96 w-full">
              <Image
                src={article.featuredImage.url}
                alt={article.title}
                fill
                className="object-cover"
              />
            </div>
          )}

          <div className="p-8">
            <div className="flex items-center gap-3 mb-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                statusColors[article.status] || 'bg-gray-100 text-gray-800'
              }`}>
                {article.status?.charAt(0).toUpperCase() + article.status?.slice(1)}
              </span>
              {article.featured && (
                <span className="flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                  <FiStar className="w-4 h-4" />
                  Featured
                </span>
              )}
            </div>

            <h1 className="text-4xl font-bold text-gray-900 mb-4">{article.title}</h1>

            <div className="flex flex-wrap items-center gap-6 text-gray-600 mb-6 pb-6 border-b border-gray-200">
              {article.author && typeof article.author !== 'string' && (
                <div className="flex items-center gap-2">
                  <FiUser className="w-5 h-5" />
                  <span>{article.author.email}</span>
                </div>
              )}
              {article.publishedDate && (
                <div className="flex items-center gap-2">
                  <FiCalendar className="w-5 h-5" />
                  <span>{format(new Date(article.publishedDate), 'PPpp')}</span>
                </div>
              )}
            </div>

            {/* Categories */}
            {article.category && article.category.length > 0 && (
              <div className="mb-6">
                <div className="flex flex-wrap gap-2">
                  {article.category.map((cat: string) => (
                    <span
                      key={cat}
                      className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm font-medium"
                    >
                      {cat.replace('-', ' ')}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Excerpt */}
            {article.excerpt && (
              <div className="mb-8">
                <p className="text-xl text-gray-700 italic border-l-4 border-primary-600 pl-4">
                  {article.excerpt}
                </p>
              </div>
            )}

            {/* Content */}
            <div className="prose max-w-none mb-8">
              <div className="text-gray-700 whitespace-pre-wrap">{article.content}</div>
            </div>

            {/* Tags */}
            {article.tags && article.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 pt-6 border-t border-gray-200">
                <FiTag className="w-5 h-5 text-gray-400" />
                {article.tags.map((tagItem: any, index: number) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                  >
                    {tagItem.tag || tagItem}
                  </span>
                ))}
              </div>
            )}

            {/* Metadata */}
            <div className="pt-6 mt-6 border-t border-gray-200">
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Created:</span>{' '}
                  <span className="text-gray-900">
                    {article.createdAt ? format(new Date(article.createdAt), 'PPpp') : 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Last Updated:</span>{' '}
                  <span className="text-gray-900">
                    {article.updatedAt ? format(new Date(article.updatedAt), 'PPpp') : 'N/A'}
                  </span>
                </div>
                {article.slug && (
                  <div className="md:col-span-2">
                    <span className="text-gray-500">URL Slug:</span>{' '}
                    <code className="px-2 py-1 bg-gray-100 rounded text-gray-900">{article.slug}</code>
                  </div>
                )}
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


