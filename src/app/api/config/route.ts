/* Payload Config API Route - Returns Payload configuration for admin UI */

import { getPayloadClient } from '@/lib/payload'
import { NextRequest, NextResponse } from 'next/server'
import config from '@/payload/payload.config'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    const payload = await getPayloadClient()
    const origin = request.nextUrl.origin
    
    // Return Payload's public configuration
    // This is what the admin UI needs to initialize
    // Note: This is a simplified config - Payload's admin UI needs full API routes
    const publicConfig = {
      serverURL: process.env.PAYLOAD_PUBLIC_SERVER_URL || origin,
      routes: {
        admin: '/admin',
        api: '/api',
      },
      // Include collection slugs
      collections: Object.keys(payload.collections).map(slug => ({
        slug,
        labels: payload.collections[slug]?.config?.labels || {},
      })),
      // Include global slugs
      globals: Object.keys(payload.globals).map(slug => ({
        slug,
        label: payload.globals[slug]?.label || slug,
      })),
    }
    
    return NextResponse.json(publicConfig)
  } catch (error: any) {
    console.error('❌ Error fetching Payload config:', error)
    return NextResponse.json(
      { 
        error: error.message || 'Failed to fetch config',
        message: 'Payload admin UI requires full API routes. Consider using Payload\'s built-in admin serving or custom server setup.'
      },
      { status: 500 }
    )
  }
}

