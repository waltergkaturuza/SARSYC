'use client'

import { useState, useEffect } from 'react'
import { FiSearch, FiDownload, FiFileText, FiBook, FiFile, FiVideo, FiFilter, FiLoader } from 'react-icons/fi'
import EmptyState from '@/components/ui/EmptyState'

const resourceTypes = [
  { value: 'all', label: 'All Types', icon: FiFile },
  { value: 'report', label: 'Conference Reports', icon: FiBook },
  { value: 'paper', label: 'Research Papers', icon: FiFileText },
  { value: 'brief', label: 'Policy Briefs', icon: FiFile },
  { value: 'presentation', label: 'Presentations', icon: FiFile },
  { value: 'video', label: 'Videos', icon: FiVideo },
]

export default function ResourcesPage() {
  const [resources, setResources] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState('all')
  const [selectedYear, setSelectedYear] = useState('all')
  const [downloading, setDownloading] = useState<number | null>(null)
  const [expandedDescriptions, setExpandedDescriptions] = useState<Record<string, boolean>>({})

  useEffect(() => {
    fetchResources()
  }, [selectedType, selectedYear, searchQuery])

  const fetchResources = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (selectedType !== 'all') params.append('type', selectedType)
      if (selectedYear !== 'all') params.append('year', selectedYear)
      if (searchQuery) params.append('search', searchQuery)

      const response = await fetch(`/api/resources?${params.toString()}`)
      const data = await response.json()
      
      if (data.docs) {
        setResources(data.docs)
      }
    } catch (error) {
      console.error('Failed to fetch resources:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async (resource: any) => {
    if (!resource.file) return

    // Get the actual file URL (prioritize thumbnailURL where Blob URLs are stored)
    let fileUrl: string | null = null
    
    // PRIORITY 1: Check thumbnailURL (migration stores Blob URLs here)
    if (resource.file.thumbnailURL && resource.file.thumbnailURL.includes('blob.vercel-storage.com')) {
      fileUrl = resource.file.thumbnailURL
    }
    // PRIORITY 2: Check main URL (only if it's a Blob URL)
    else if (resource.file.url && resource.file.url.includes('blob.vercel-storage.com')) {
      fileUrl = resource.file.url
    }
    // PRIORITY 3: Check if it's any valid external URL
    else if (resource.file.url && resource.file.url.startsWith('http')) {
      // Skip Payload file URLs (they 404)
      if (!resource.file.url.includes('/api/media/file/')) {
        fileUrl = resource.file.url
      }
    }
    
    if (!fileUrl) {
      console.error('No valid file URL found for resource:', resource.title)
      return
    }

    setDownloading(resource.id)
    
    try {
      // Track download
      await fetch('/api/resources', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: resource.id }),
      })

      // Open/download file
      window.open(fileUrl, '_blank')
    } catch (error) {
      console.error('Download tracking failed:', error)
      // Still open the file even if tracking fails
      window.open(fileUrl, '_blank')
    } finally {
      setDownloading(null)
    }
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return ''
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const availableYears = Array.from(new Set(resources.map(r => r.year).filter(Boolean))).sort((a, b) => b - a)
  const toggleDescription = (resourceId: string) => {
    setExpandedDescriptions((prev) => ({
      ...prev,
      [resourceId]: !prev[resourceId],
    }))
  }

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-600 to-secondary-600 text-white py-20">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Resource Library
            </h1>
            <p className="text-xl text-white/90 mb-8">
              Access conference reports, research papers, policy briefs, and more
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search resources..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-accent-500"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="bg-gray-50 py-8 border-b border-gray-200">
        <div className="container-custom max-w-screen-2xl">
          <div className="flex items-center gap-4 mb-6">
            <FiFilter className="w-5 h-5 text-gray-600" />
            <h3 className="font-semibold text-gray-900">Filters</h3>
          </div>

          {/* Type Filters */}
          <div className="mb-6">
            <p className="text-sm font-medium text-gray-700 mb-3">Resource Type</p>
            <div className="flex flex-wrap gap-2">
              {resourceTypes.map((type) => {
                const Icon = type.icon
                return (
                  <button
                    key={type.value}
                    onClick={() => setSelectedType(type.value)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      selectedType === type.value
                        ? 'bg-primary-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {type.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Year Filter */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-3">Year</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedYear('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedYear === 'all'
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                All Years
              </button>
              {availableYears.map((year) => (
                <button
                  key={year}
                  onClick={() => setSelectedYear(year.toString())}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedYear === year.toString()
                      ? 'bg-primary-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  {year}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Resources Grid */}
      <section className="section bg-white">
        <div className="container-custom max-w-screen-2xl">
          {loading ? (
            <div className="text-center py-12">
              <FiLoader className="w-8 h-8 animate-spin mx-auto mb-4 text-primary-600" />
              <p className="text-gray-600">Loading resources...</p>
            </div>
          ) : resources.length === 0 ? (
            <EmptyState
              icon="file"
              title={searchQuery || selectedType !== 'all' || selectedYear !== 'all' ? "No Resources Found" : "No Resources Available Yet"}
              description={searchQuery || selectedType !== 'all' || selectedYear !== 'all' 
                ? "Try adjusting your filters or search query to find what you're looking for."
                : "We're working on adding resources to the library. Check back soon for conference reports, research papers, and more."}
              action={searchQuery || selectedType !== 'all' || selectedYear !== 'all' ? {
                label: "Clear Filters",
                onClick: () => { setSelectedType('all'); setSelectedYear('all'); setSearchQuery('') }
              } : undefined}
            />
          ) : (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                {resources.map((resource) => {
                  const description = resource.description ?? ''
                  const isExpanded = expandedDescriptions[resource.id]
                  const hasLongDescription = description.length > 160

                  return (
                    <div key={resource.id} className="card p-6 hover:shadow-2xl transition-all group">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FiFileText className="w-6 h-6 text-primary-600" />
                      </div>
                      <div className="text-right text-sm text-gray-500">
                        <div>{resource.year}</div>
                        {resource.file?.filesize && (
                          <div className="text-xs">{formatFileSize(resource.file.filesize)}</div>
                        )}
                      </div>
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                      {resource.title}
                    </h3>

                    {description ? (
                      <>
                        <p
                          className={`text-sm text-gray-600 ${
                            isExpanded ? '' : 'line-clamp-3'
                          }`}
                        >
                          {description}
                        </p>
                        {hasLongDescription ? (
                          <button
                            type="button"
                            onClick={() => toggleDescription(resource.id)}
                            className="text-sm font-medium text-primary-600 hover:text-primary-700 mb-4"
                          >
                            {isExpanded ? 'Read less' : 'Read more'}
                          </button>
                        ) : (
                          <div className="mb-4" />
                        )}
                      </>
                    ) : (
                      <p className="text-sm text-gray-500 mb-4">No description available.</p>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <FiDownload className="w-4 h-4" />
                        {resource.downloads || 0} downloads
                      </div>
                      <button 
                        onClick={() => handleDownload(resource)}
                        disabled={downloading === resource.id || !resource.file?.url}
                        className="btn-primary py-2 px-4 text-sm disabled:opacity-50"
                      >
                        {downloading === resource.id ? (
                          <>
                            <FiLoader className="w-4 h-4 animate-spin inline mr-2" />
                            Downloading...
                          </>
                        ) : (
                          'Download'
                        )}
                      </button>
                    </div>
                  </div>
                  )
                })}
              </div>
            </>
          )}
        </div>
      </section>
    </>
  )
}
