import React from 'react'
import { getPayloadClient } from '@/lib/payload'
import Link from 'next/link'
import { 
  FiFolder, FiFilter, FiPlus, FiDownload, FiEdit, FiTrash2, FiFileText 
} from 'react-icons/fi'

export const revalidate = 0

interface SearchParams {
  page?: string
  type?: string
  year?: string
  search?: string
}

export default async function ResourcesManagementPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const payload = await getPayloadClient()
  
  const page = Number(searchParams.page || 1)
  const perPage = 20
  const type = searchParams.type
  const year = searchParams.year
  const search = searchParams.search

  // Build where clause
  const where: any = {}
  
  if (type && type !== 'all') {
    where.type = { equals: type }
  }
  
  if (year && year !== 'all') {
    where.year = { equals: parseInt(year) }
  }
  
  if (search) {
    where.or = [
      { title: { contains: search } },
      { description: { contains: search } },
    ]
  }

  const results = await payload.find({
    collection: 'resources',
    where,
    limit: perPage,
    page,
    sort: '-year',
  })

  const resources = results.docs
  const totalPages = results.totalPages
  const totalDocs = results.totalDocs

  const typeConfig: Record<string, { color: string, label: string, icon: any }> = {
    'abstract': { color: 'bg-indigo-100 text-indigo-700', label: 'Abstract', icon: FiFileText },
    'concept-note': { color: 'bg-cyan-100 text-cyan-700', label: 'Concept Note', icon: FiFileText },
    'report': { color: 'bg-blue-100 text-blue-700', label: 'Conference Report', icon: FiFileText },
    'research-report': { color: 'bg-teal-100 text-teal-700', label: 'Research Report', icon: FiFileText },
    'symposium-report': { color: 'bg-sky-100 text-sky-700', label: 'Symposium Report', icon: FiFileText },
    'paper': { color: 'bg-green-100 text-green-700', label: 'Research Paper', icon: FiFileText },
    'brief': { color: 'bg-purple-100 text-purple-700', label: 'Policy Brief', icon: FiFileText },
    'communique': { color: 'bg-amber-100 text-amber-700', label: 'Communiqué', icon: FiFileText },
    'declaration': { color: 'bg-rose-100 text-rose-700', label: 'Declaration', icon: FiFileText },
    'presentation': { color: 'bg-orange-100 text-orange-700', label: 'Presentation', icon: FiFileText },
    'template': { color: 'bg-lime-100 text-lime-700', label: 'Template', icon: FiFileText },
    'toolkit': { color: 'bg-yellow-100 text-yellow-700', label: 'Toolkit', icon: FiFolder },
    'infographic': { color: 'bg-pink-100 text-pink-700', label: 'Infographic', icon: FiFileText },
    'video': { color: 'bg-red-100 text-red-700', label: 'Video', icon: FiFileText },
    'other': { color: 'bg-gray-100 text-gray-700', label: 'Other', icon: FiFileText },
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Resources Management</h1>
          <p className="text-gray-600 mt-1">Upload and manage conference resources and materials</p>
        </div>
        <Link href="/admin/resources/new" className="btn-primary flex items-center gap-2">
          <FiPlus className="w-5 h-5" />
          Upload Resource
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-gray-900">{totalDocs}</div>
          <div className="text-sm text-gray-600">Total Resources</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-gray-900">
            {resources.reduce((sum: number, r: any) => sum + (r.downloads || 0), 0)}
          </div>
          <div className="text-sm text-gray-600">Total Downloads</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-gray-900">
            {Math.round(resources.reduce((sum: number, r: any) => sum + (r.file?.filesize || 0), 0) / (1024 * 1024))} MB
          </div>
          <div className="text-sm text-gray-600">Storage Used</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-gray-900">15</div>
          <div className="text-sm text-gray-600">Resource Types</div>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Resource Type</label>
            <form action="/admin/resources" method="get">
              <select name="type" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                <option value="all">All Types</option>
                <option value="abstract">Abstracts</option>
                <option value="concept-note">Concept Notes</option>
                <option value="report">Conference Reports</option>
                <option value="research-report">Research Reports</option>
                <option value="symposium-report">Symposium Reports</option>
                <option value="paper">Research Papers</option>
                <option value="brief">Policy Briefs</option>
                <option value="communique">Communiqués</option>
                <option value="declaration">Declarations</option>
                <option value="presentation">Presentations</option>
                <option value="template">Templates</option>
                <option value="toolkit">Toolkits</option>
                <option value="infographic">Infographics</option>
                <option value="video">Videos</option>
              </select>
            </form>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
            <form action="/admin/resources" method="get">
              <select name="year" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                <option value="all">All Years</option>
                {Array.from({ length: 10 }, (_, i) => 2026 - i).map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </form>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <form action="/admin/resources" method="get">
              <input
                type="text"
                name="search"
                placeholder="Search resources..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </form>
          </div>
        </div>
      </div>

      {/* Resources List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <p className="text-sm text-gray-600">
            Showing {resources.length} of {totalDocs} resources
          </p>
        </div>

        {resources.length === 0 ? (
          <div className="p-12 text-center">
            <FiFolder className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No resources found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Resource</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Year</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Downloads</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Size</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {resources.map((resource: any) => {
                  const typeInfo = typeConfig[resource.type] || typeConfig['other']
                  const Icon = typeInfo.icon
                  
                  return (
                    <tr key={resource.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                            <Icon className="w-5 h-5 text-primary-600" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{resource.title}</div>
                            <div className="text-sm text-gray-500 line-clamp-1">{resource.description}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${typeInfo.color}`}>
                          {typeInfo.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{resource.year}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <FiDownload className="w-4 h-4" />
                          {resource.downloads || 0}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {resource.file?.filesize 
                          ? `${(resource.file.filesize / (1024 * 1024)).toFixed(1)} MB`
                          : 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {resource.file?.url && (
                            <a
                              href={resource.file.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                              title="Download"
                            >
                              <FiDownload className="w-4 h-4" />
                            </a>
                          )}
                          <Link
                            href={`/admin/resources/${resource.id}/edit`}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
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
                  href={`/admin/resources?page=${page - 1}`}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  Previous
                </Link>
              )}
              {page < totalPages && (
                <Link
                  href={`/admin/resources?page=${page + 1}`}
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

