/* PAYLOAD ADMIN ROUTE HANDLER */

import { getPayloadClient } from '@/lib/payload'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path?: string[] }> }
) {
  try {
    const payload = await getPayloadClient()
    const { path } = await params
    
    // Payload v3 handles admin routes internally
    // We need to proxy requests to Payload's admin handler
    // For Payload v3, the admin is served through its API
    
    // Get the full URL path
    const url = new URL(request.url)
    const pathname = url.pathname
    const searchParams = url.searchParams.toString()
    
    // Construct Payload admin URL
    const adminPath = path ? `/${path.join('/')}` : ''
    const fullPath = `/admin${adminPath}${searchParams ? `?${searchParams}` : ''}`
    
    // For Payload v3, redirect to the Payload admin endpoint
    // Payload serves the admin UI through its own routing system
    const serverURL = process.env.PAYLOAD_PUBLIC_SERVER_URL || process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
    
    return NextResponse.redirect(new URL(fullPath, serverURL))
  } catch (error: any) {
    console.error('Payload admin route error:', error)
    
    // Provide more helpful error messages
    const errorMessage = String(error?.message || error)
    let details = errorMessage
    
    if (errorMessage.includes('secret')) {
      details = errorMessage + '. Please ensure PAYLOAD_SECRET is set in Vercel environment variables and redeploy.'
    }
    
    return NextResponse.json(
      { 
        error: 'Admin panel error', 
        details,
        hint: 'Check Vercel deployment logs for more details. Ensure PAYLOAD_SECRET environment variable is set.'
      },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path?: string[] }> }
) {
  return GET(request, { params })
}
