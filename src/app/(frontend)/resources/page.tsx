'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { FiSearch, FiDownload, FiFileText, FiBook, FiFile, FiVideo, FiFilter, FiLoader, FiClipboard, FiAward, FiLayers, FiShield, FiEdit, FiX } from 'react-icons/fi'
import { trackEvent } from '@/components/analytics/AnalyticsTracker'
import EmptyState from '@/components/ui/EmptyState'

const resourceTypes = [
  { value: 'all', label: 'All Types', icon: FiFile },
  { value: 'abstract', label: 'Abstracts', icon: FiEdit },
  { value: 'concept-note', label: 'Concept Notes', icon: FiClipboard },
  { value: 'report', label: 'Conference Reports', icon: FiBook },
  { value: 'research-report', label: 'Research Reports', icon: FiBook },
  { value: 'symposium-report', label: 'Symposium Reports', icon: FiBook },
  { value: 'paper', label: 'Research Papers', icon: FiFileText },
  { value: 'brief', label: 'Policy Briefs', icon: FiFile },
  { value: 'communique', label: 'Communiqués', icon: FiAward },
  { value: 'declaration', label: 'Declarations', icon: FiShield },
  { value: 'presentation', label: 'Presentations', icon: FiLayers },
  { value: 'template', label: 'Templates', icon: FiFileText },
  { value: 'toolkit', label: 'Toolkits', icon: FiFile },
  { value: 'infographic', label: 'Infographics', icon: FiFile },
  { value: 'video', label: 'Videos', icon: FiVideo },
]

export default function ResourcesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
          <FiLoader className="w-8 h-8 animate-spin text-primary-400" />
        </div>
      }
    >
      <ResourcesPageContent />
    </Suspense>
  )
}

function ResourcesPageContent() {
  const searchParams = useSearchParams()
  const yearFromQuery = searchParams.get('year')
  const [resources, setResources] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState('all')
  const [selectedYear, setSelectedYear] = useState(
    yearFromQuery && /^\d{4}$/.test(yearFromQuery) ? yearFromQuery : 'all',
  )
  const [downloading, setDownloading] = useState<number | null>(null)
  const [selectedResource, setSelectedResource] = useState<any | null>(null)

  useEffect(() => {
    if (yearFromQuery && /^\d{4}$/.test(yearFromQuery)) {
      setSelectedYear(yearFromQuery)
    }
  }, [yearFromQuery])

  useEffect(() => {
    fetchResources()
  }, [selectedType, selectedYear, searchQuery])

  useEffect(() => {
    if (!selectedResource) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelectedResource(null)
    }
    document.addEventListener('keydown', onKeyDown)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [selectedResource])

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
      // Track download (legacy API)
      await fetch('/api/resources', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: resource.id }),
      })

      // Track in analytics
      trackEvent('download', {
        fileName: resource.file?.filename || resource.title,
        resourceId: resource.id,
        source: 'resources',
        label: resource.title || 'Resource download',
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

  const getResourceIcon = (type: string) => {
    const typeIcon = resourceTypes.find(t => t.value === type)
    return typeIcon ? typeIcon.icon : FiFile
  }

  return (
    <div className="relative min-h-screen bg-slate-900">
      {/* Background image */}
      <div
        className="fixed inset-0"
        style={{
          backgroundImage: "url('/sarsyc-group.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
          zIndex: 0,
        }}
      />
      {/* Dark blue overlay */}
      <div className="fixed inset-0 bg-gradient-to-b from-slate-900/85 via-primary-900/80 to-slate-900/90" style={{ zIndex: 1 }} />

      <div className="relative" style={{ zIndex: 2 }}>
        {/* Hero */}
        <section className="py-10 md:py-14">
          <div className="container-custom">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-3xl md:text-5xl font-bold mb-3 text-white">
                Resource Library
              </h1>
              <p className="text-lg md:text-xl text-white/70 mb-6">
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
                    className="w-full pl-12 pr-4 py-4 rounded-xl text-gray-900 bg-white/95 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Filters */}
        <section className="pb-8">
          <div className="container-custom max-w-screen-2xl">
            <div className="rounded-2xl border border-white/10 bg-white/10 backdrop-blur-md p-6">
              <div className="flex items-center gap-3 mb-5">
                <FiFilter className="w-5 h-5 text-primary-300" />
                <h3 className="font-semibold text-white">Filters</h3>
              </div>

              {/* Type Filters */}
              <div className="mb-5">
                <p className="text-sm font-medium text-white/60 mb-3">Resource Type</p>
                <div className="flex flex-wrap gap-2">
                  {resourceTypes.map((type) => {
                    const Icon = type.icon
                    const active = selectedType === type.value
                    return (
                      <button
                        key={type.value}
                        onClick={() => setSelectedType(type.value)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          active
                            ? 'bg-primary-500 text-white border border-primary-400 shadow-lg shadow-primary-900/30'
                            : 'bg-white/10 text-white/80 hover:bg-white/20 border border-white/15 backdrop-blur-sm'
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
                <p className="text-sm font-medium text-white/60 mb-3">Year</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedYear('all')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      selectedYear === 'all'
                        ? 'bg-primary-500 text-white border border-primary-400'
                        : 'bg-white/10 text-white/80 hover:bg-white/20 border border-white/15 backdrop-blur-sm'
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
                          ? 'bg-primary-500 text-white border border-primary-400'
                          : 'bg-white/10 text-white/80 hover:bg-white/20 border border-white/15 backdrop-blur-sm'
                      }`}
                    >
                      {year}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Resources Grid */}
        <section className="pb-16">
          <div className="container-custom max-w-screen-2xl">
            {loading ? (
              <div className="text-center py-12">
                <FiLoader className="w-8 h-8 animate-spin mx-auto mb-4 text-primary-300" />
                <p className="text-white/70">Loading resources...</p>
              </div>
            ) : resources.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/10 backdrop-blur-md p-10">
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
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                {resources.map((resource) => {
                  const description = resource.description ?? ''
                  const hasLongDescription = description.length > 160
                  const ResourceIcon = getResourceIcon(resource.type)

                  return (
                    <div
                      key={resource.id}
                      className="group flex flex-col rounded-2xl border border-white/10 bg-white/10 backdrop-blur-md p-6 shadow-xl transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary-500/20 hover:border-primary-400/40 hover:bg-white/15"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 bg-primary-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                          <ResourceIcon className="w-6 h-6 text-primary-300" />
                        </div>
                        <div className="text-right text-sm text-white/50">
                          <div>{resource.year}</div>
                          {resource.file?.filesize && (
                            <div className="text-xs">{formatFileSize(resource.file.filesize)}</div>
                          )}
                        </div>
                      </div>

                      <h3 className="text-lg font-bold text-primary-300 mb-2 group-hover:text-primary-200 transition-colors">
                        {resource.title}
                      </h3>

                      {description ? (
                        <>
                          <p className="text-sm text-white/65 line-clamp-3 text-justify">
                            {description}
                          </p>
                          {hasLongDescription ? (
                            <button
                              type="button"
                              onClick={() => setSelectedResource(resource)}
                              className="text-sm font-medium text-primary-300 hover:text-primary-200 mb-4 text-left"
                            >
                              Read more
                            </button>
                          ) : (
                            <div className="mb-4" />
                          )}
                        </>
                      ) : (
                        <p className="text-sm text-white/40 mb-4">No description available.</p>
                      )}

                      <div className="flex items-center justify-between pt-4 mt-auto border-t border-white/10">
                        <div className="flex items-center gap-1 text-sm text-white/50">
                          <FiDownload className="w-4 h-4" />
                          {resource.downloads || 0} downloads
                        </div>
                        <button
                          onClick={() => handleDownload(resource)}
                          disabled={downloading === resource.id || !resource.file?.url}
                          className="inline-flex items-center gap-2 rounded-lg bg-primary-500 hover:bg-primary-400 text-white font-medium py-2 px-4 text-sm transition-colors disabled:opacity-50 shadow-lg shadow-primary-900/30"
                        >
                          {downloading === resource.id ? (
                            <>
                              <FiLoader className="w-4 h-4 animate-spin" />
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
            )}
          </div>
        </section>
      </div>

      {selectedResource && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="resource-modal-title"
        >
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
            aria-label="Close resource details"
            onClick={() => setSelectedResource(null)}
          />
          <div className="relative w-full max-w-3xl max-h-[85vh] overflow-y-auto rounded-2xl border border-white/15 bg-slate-900/95 shadow-2xl shadow-black/40">
            <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-white/10 bg-slate-900/95 px-6 py-5 backdrop-blur-md">
              <div className="min-w-0 flex items-start gap-4">
                <div className="w-12 h-12 bg-primary-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  {(() => {
                    const Icon = getResourceIcon(selectedResource.type)
                    return <Icon className="w-6 h-6 text-primary-300" />
                  })()}
                </div>
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-wide text-white/45 mb-1">
                    {[selectedResource.year, selectedResource.file?.filesize ? formatFileSize(selectedResource.file.filesize) : null]
                      .filter(Boolean)
                      .join(' · ') || 'Resource'}
                  </p>
                  <h2 id="resource-modal-title" className="text-xl sm:text-2xl font-bold text-primary-200 leading-snug">
                    {selectedResource.title}
                  </h2>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedResource(null)}
                className="flex-shrink-0 rounded-full p-2 text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Close"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 py-6 sm:px-8 sm:py-7">
              <p className="text-base sm:text-lg leading-relaxed text-white/80 text-justify whitespace-pre-wrap">
                {selectedResource.description || 'No description available.'}
              </p>
            </div>

            <div className="sticky bottom-0 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-white/10 bg-slate-900/95 px-6 py-4 backdrop-blur-md">
              <div className="flex items-center gap-1 text-sm text-white/50">
                <FiDownload className="w-4 h-4" />
                {selectedResource.downloads || 0} downloads
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedResource(null)}
                  className="inline-flex items-center justify-center rounded-lg border border-white/20 px-4 py-2 text-sm font-medium text-white/80 hover:bg-white/10 transition-colors"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => handleDownload(selectedResource)}
                  disabled={downloading === selectedResource.id || !selectedResource.file?.url}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary-500 hover:bg-primary-400 text-white font-medium py-2 px-5 text-sm transition-colors disabled:opacity-50 shadow-lg shadow-primary-900/30"
                >
                  {downloading === selectedResource.id ? (
                    <>
                      <FiLoader className="w-4 h-4 animate-spin" />
                      Downloading...
                    </>
                  ) : (
                    <>
                      <FiDownload className="w-4 h-4" />
                      Download
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
