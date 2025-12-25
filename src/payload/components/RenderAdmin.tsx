'use client'

import { useEffect } from 'react'

export function RenderAdmin() {
  useEffect(() => {
    // In Payload v3, the admin UI is served at /admin directly by Payload
    // If we're seeing a blank page, redirect to ensure we hit Payload's admin
    // Check if we're already at /admin, if so, reload to trigger Payload's handler
    if (window.location.pathname === '/admin' || window.location.pathname.startsWith('/admin/')) {
      // Force reload to ensure Payload handles the route
      window.location.reload()
    }
  }, [])

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading Admin Panel...</p>
        <p className="text-sm text-gray-500 mt-2">If this page doesn't load, the admin may need to be configured.</p>
      </div>
    </div>
  )
}
