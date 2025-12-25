'use client'

import { useEffect, useState } from 'react'

export function RenderAdmin() {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Admin Panel...</p>
        </div>
      </div>
    )
  }

  // Payload v3 admin is automatically handled by Next.js routing
  return null
}

