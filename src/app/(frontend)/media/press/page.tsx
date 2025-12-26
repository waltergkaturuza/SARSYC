'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { FiDownload, FiCalendar, FiFileText, FiLoader } from 'react-icons/fi'
import { getPayloadClient } from '@/lib/payload'

export default function PressReleasesPage() {
  const [pressReleases, setPressReleases] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPressReleases()
  }, [])

  const fetchPressReleases = async () => {
    try {
      const response = await fetch('/api/news?category=press-release&limit=50')
      const data = await response.json()
      
      if (data.docs) {
        setPressReleases(data.docs)
      }
    } catch (error) {
      console.error('Failed to fetch press releases:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <FiLoader className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    )
  }

  return (
    <>
      <section className="bg-gradient-to-br from-primary-600 to-secondary-600 text-white py-20">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Press Releases
            </h1>
            <p className="text-xl text-white/90">
              Official media statements and announcements
            </p>
          </div>
        </div>
      </section>

      <section className="section bg-white">
        <div className="container-custom">
          {pressReleases.length === 0 ? (
            <div className="text-center py-12">
              <FiFileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">No Press Releases Yet</h2>
              <p className="text-gray-600">
                Press releases will appear here when published. Check back soon!
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6 max-w-6xl mx-auto">
              {pressReleases.map((release) => (
                <div key={release.id} className="card p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                    <FiCalendar className="w-4 h-4" />
                    {new Date(release.publishedDate || release.createdAt).toLocaleDateString()}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{release.title}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-3">{release.excerpt}</p>
                  <Link 
                    href={`/news/${release.slug}`}
                    className="text-primary-600 font-medium hover:underline inline-flex items-center gap-2"
                  >
                    Read More
                  </Link>
                </div>
              ))}
            </div>
          )}

          <div className="mt-12 text-center">
            <div className="card p-8 bg-gray-50 max-w-2xl mx-auto">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Media Inquiries</h3>
              <p className="text-gray-600 mb-4">
                For media inquiries, interview requests, or additional information, please contact:
              </p>
              <p className="font-medium text-gray-900 mb-2">
                Communications Team
              </p>
              <p className="text-primary-600">
                <a href="mailto:saywhat@mweb.co.zw" className="hover:underline">
                  saywhat@mweb.co.zw
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

