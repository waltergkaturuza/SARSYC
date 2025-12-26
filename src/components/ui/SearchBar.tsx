'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { FiSearch, FiX } from 'react-icons/fi'

interface SearchResult {
  title: string
  type: string
  url: string
  excerpt?: string
}

export default function SearchBar({ className = '' }: { className?: string }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const searchRef = useRef<HTMLDivElement>(null)

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Search with debounce
  useEffect(() => {
    if (query.length < 2) {
      setResults([])
      return
    }

    const timer = setTimeout(async () => {
      setIsLoading(true)
      try {
        // TODO: Implement actual search API
        // For now, mock results
        const mockResults: SearchResult[] = [
          { title: 'SARSYC VI Conference Overview', type: 'Page', url: '/sarsyc-vi' },
          { title: 'Register for SARSYC VI', type: 'Page', url: '/participate/register' },
          { title: 'Dr. Sarah Mwangi - Keynote Speaker', type: 'Speaker', url: '/programme/speakers/sarah-mwangi' },
        ].filter(r => r.title.toLowerCase().includes(query.toLowerCase()))

        setResults(mockResults)
      } catch (error) {
        console.error('Search error:', error)
      } finally {
        setIsLoading(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  const handleResultClick = (url: string) => {
    setIsOpen(false)
    setQuery('')
    router.push(url)
  }

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <div className="relative">
        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search SARSYC VI..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          className="w-full pl-12 pr-10 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('')
              setResults([])
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <FiX className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && query.length >= 2 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-2xl border border-gray-200 max-h-96 overflow-y-auto z-50">
          {isLoading ? (
            <div className="p-4 text-center text-gray-600">
              <div className="animate-spin w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full mx-auto mb-2"></div>
              Searching...
            </div>
          ) : results.length > 0 ? (
            <div className="py-2">
              {results.map((result, index) => (
                <button
                  key={index}
                  onClick={() => handleResultClick(result.url)}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{result.title}</p>
                      {result.excerpt && (
                        <p className="text-sm text-gray-600 mt-1 line-clamp-1">{result.excerpt}</p>
                      )}
                    </div>
                    <span className="text-xs px-2 py-1 bg-primary-100 text-primary-600 rounded-full flex-shrink-0">
                      {result.type}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <p className="text-gray-600 mb-2">No results found for "{query}"</p>
              <p className="text-sm text-gray-500">Try different keywords or browse our pages</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}


