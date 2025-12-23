'use client'

import { useState } from 'react'
import { FiSearch, FiDownload, FiFileText, FiBook, FiFile, FiVideo, FiFilter } from 'react-icons/fi'

// Placeholder data - will fetch from Payload CMS
const resources = [
  {
    id: '1',
    title: 'SARSYC V Conference Report',
    description: 'Comprehensive report from the 2022 conference in Maputo, Mozambique, covering all tracks, resolutions, and outcomes.',
    type: 'report',
    year: 2022,
    edition: 'SARSYC V',
    downloads: 450,
    fileSize: '2.5 MB',
    language: 'English',
  },
  {
    id: '2',
    title: 'Youth SRHR Policy Brief: Southern Africa 2023',
    description: 'Evidence-based policy recommendations for improving youth sexual and reproductive health services.',
    type: 'brief',
    year: 2023,
    downloads: 320,
    fileSize: '1.2 MB',
    language: 'English',
  },
  // Add more resources...
]

const resourceTypes = [
  { value: 'all', label: 'All Types', icon: FiFile },
  { value: 'report', label: 'Conference Reports', icon: FiBook },
  { value: 'paper', label: 'Research Papers', icon: FiFileText },
  { value: 'brief', label: 'Policy Briefs', icon: FiFile },
  { value: 'presentation', label: 'Presentations', icon: FiFile },
  { value: 'video', label: 'Videos', icon: FiVideo },
]

export default function ResourcesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState('all')
  const [selectedYear, setSelectedYear] = useState('all')

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
        <div className="container-custom">
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

          {/* Year Filters */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-3">Year</p>
            <div className="flex flex-wrap gap-2">
              {['all', '2026', '2024', '2022', '2020', '2018', '2016', '2014'].map((year) => (
                <button
                  key={year}
                  onClick={() => setSelectedYear(year)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedYear === year
                      ? 'bg-primary-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  {year === 'all' ? 'All Years' : year}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Resources Grid */}
      <section className="section bg-white">
        <div className="container-custom">
          <div className="flex items-center justify-between mb-8">
            <p className="text-gray-600">
              Showing <strong>{resources.length}</strong> resources
            </p>
            <select className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500">
              <option>Most Recent</option>
              <option>Most Downloaded</option>
              <option>Alphabetical</option>
            </select>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resources.map((resource) => (
              <div key={resource.id} className="card p-6 hover:shadow-2xl transition-all group">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FiFileText className="w-6 h-6 text-primary-600" />
                  </div>
                  <div className="text-right text-sm text-gray-500">
                    <div>{resource.year}</div>
                    <div className="text-xs">{resource.fileSize}</div>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                  {resource.title}
                </h3>
                
                <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                  {resource.description}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <FiDownload className="w-4 h-4" />
                    {resource.downloads} downloads
                  </div>
                  <button className="btn-primary py-2 px-4 text-sm">
                    Download
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Load More */}
          <div className="text-center mt-12">
            <button className="btn-outline">
              Load More Resources
            </button>
          </div>
        </div>
      </section>
    </>
  )
}


