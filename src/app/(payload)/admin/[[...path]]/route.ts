/* THIS FILE IS REQUIRED FOR PAYLOAD ADMIN */

import { getPayloadClient } from '@/lib/payload'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const payload = await getPayloadClient()
    
    // In Payload v3, the admin is served through Payload's router
    // We need to handle the request properly
    // Payload admin is typically available at the root /admin path
    // and handles its own routing internally
    
    // For now, return a simple redirect response
    // Payload's admin should be accessible at the base URL
    return new Response(null, {
      status: 307,
      headers: {
        'Location': '/admin',
      },
    })
  } catch (error) {
    console.error('Admin route error:', error)
    return new Response(`Admin error: ${String(error)}`, { status: 500 })
  }
}

export async function POST(request: Request) {
  return GET(request)
}

