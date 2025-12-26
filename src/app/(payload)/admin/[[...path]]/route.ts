/* PAYLOAD ADMIN REDIRECT - Redirect to custom admin dashboard */

import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Handle all HTTP methods
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path?: string[] }> }
) {
  return handleAdminRequest(request)
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path?: string[] }> }
) {
  return handleAdminRequest(request)
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path?: string[] }> }
) {
  return handleAdminRequest(request)
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ path?: string[] }> }
) {
  return handleAdminRequest(request)
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path?: string[] }> }
) {
  return handleAdminRequest(request)
}

async function handleAdminRequest(request: NextRequest) {
  // Redirect /admin to the new custom admin dashboard
  const url = new URL(request.url)
  const origin = url.origin
  
  return NextResponse.redirect(new URL('/admin/dashboard', origin))
}
