'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { FiImage, FiVideo, FiLoader } from 'react-icons/fi'

export default function GalleryPage() {
  const [images, setImages] = useState<any[]>([])
  const [videos, setVideos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState<any>(null)

  useEffect(() => {
    // TODO: Fetch from API when Media collection supports categorization
    // For now, show placeholder message
    setLoading(false)
  }, [])

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
              Photo & Video Gallery
            </h1>
            <p className="text-xl text-white/90">
              Moments from past SARSYC conferences and events
            </p>
          </div>
        </div>
      </section>

      <section className="section bg-white">
        <div className="container-custom">
          <div className="text-center py-12">
            <FiImage className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Gallery Coming Soon</h2>
            <p className="text-gray-600 mb-6">
              Photo and video galleries will be available here. Images can be managed through the admin panel.
            </p>
            <p className="text-sm text-gray-500">
              To add photos: Go to Admin Panel → Media → Upload photos, then tag them as "gallery" or "conference"
            </p>
          </div>
        </div>
      </section>
    </>
  )
}


